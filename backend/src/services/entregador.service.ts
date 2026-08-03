import prisma from '../config/database.js';
import { NotFoundError, BadRequestError } from '../types/errors.js';
import { getIO } from '../config/socket.js';
import { logger } from '../utils/logger.js';

const TRANSICOES_CORRIDA: Record<string, string[]> = {
    oferecida:  ['aceita', 'recusada', 'cancelada'],
    aceita:     ['em_coleta', 'cancelada'],
    em_coleta:  ['coletada', 'cancelada'],
    coletada:   ['em_entrega', 'cancelada'],
    em_entrega: ['entregue', 'cancelada'],
    entregue:   [],
    recusada:   [],
    cancelada:  [],
};

export class EntregadorService {

    // ─── Entregadores ──────────────────────────────────────────────────────────

    async listarEntregadores(estabelecimentoId: string) {
        const entregadores = await prisma.usuario.findMany({
            where: { estabelecimentoId, tipo: 'entregador', ativo: true },
            select: {
                id: true, nome: true, telefone: true,
                statusEntregador: true, ultimoAcesso: true,
                corridasComoEntregador: {
                    where: { status: { in: ['aceita', 'em_coleta', 'coletada', 'em_entrega'] } },
                    include: {
                        comanda: {
                            select: {
                                codigo: true, nomeCliente: true,
                                enderecoEntrega: { select: { logradouro: true, numero: true, bairro: true, cidade: true } },
                            },
                        },
                    },
                    take: 1,
                },
                localizacoes: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    select: { lat: true, lng: true, createdAt: true },
                },
            },
        });
        return entregadores;
    }

    async atualizarStatusEntregador(entregadorId: string, status: string) {
        const usuario = await prisma.usuario.findUnique({ where: { id: entregadorId } });
        if (!usuario) throw new NotFoundError('Entregador não encontrado');
        if (usuario.tipo !== 'entregador') throw new BadRequestError('Usuário não é um entregador');

        const atualizado = await prisma.usuario.update({
            where: { id: entregadorId },
            data: { statusEntregador: status as any },
            select: { id: true, nome: true, statusEntregador: true },
        });

        logger.info('Status do entregador atualizado', { entregadorId, status });
        return atualizado;
    }

    async atualizarLocalizacao(entregadorId: string, lat: number, lng: number) {
        const loc = await prisma.localizacaoEntregador.create({
            data: { entregadorId, lat, lng },
        });

        // Emite via Socket.IO para o admin monitorar
        try {
            const usuario = await prisma.usuario.findUnique({
                where: { id: entregadorId },
                select: { estabelecimentoId: true },
            });
            if (usuario?.estabelecimentoId) {
                getIO().to(`estabelecimento:${usuario.estabelecimentoId}`)
                    .emit('entregador:localizacao', { entregadorId, lat, lng });
            }
        } catch { /* socket pode não estar inicializado */ }

        return loc;
    }

    async ultimaLocalizacao(entregadorId: string) {
        return prisma.localizacaoEntregador.findFirst({
            where: { entregadorId },
            orderBy: { createdAt: 'desc' },
        });
    }

    // ─── Corridas ──────────────────────────────────────────────────────────────

    async criarCorrida(comandaId: string, entregadorId: string) {
        const comanda = await prisma.comanda.findUnique({ where: { id: comandaId } });
        if (!comanda) throw new NotFoundError('Comanda não encontrada');
        if (comanda.tipoComanda !== 'delivery') throw new BadRequestError('Corrida só pode ser criada para comandas delivery');

        const corridaExistente = await prisma.corrida.findUnique({ where: { comandaId } });
        if (corridaExistente && !['recusada', 'cancelada'].includes(corridaExistente.status)) {
            throw new BadRequestError('Já existe uma corrida ativa para esta comanda');
        }

        const entregador = await prisma.usuario.findUnique({ where: { id: entregadorId } });
        if (!entregador || entregador.tipo !== 'entregador') throw new NotFoundError('Entregador não encontrado');

        const corrida = await prisma.corrida.upsert({
            where: { comandaId },
            create: { comandaId, entregadorId, status: 'oferecida' },
            update: { entregadorId, status: 'oferecida', canceladaAt: null },
            include: {
                comanda: { include: { enderecoEntrega: true } },
                entregador: { select: { id: true, nome: true, telefone: true } },
            },
        });

        // Atualiza status do entregador para "em_corrida" e notifica via socket
        await prisma.usuario.update({ where: { id: entregadorId }, data: { statusEntregador: 'em_corrida' } });

        try {
            getIO()
                .to(`entregador:${entregadorId}`)
                .emit('corrida:oferta', corrida);
        } catch { /* socket pode não estar inicializado */ }

        logger.info('Corrida criada', { corridaId: corrida.id, comandaId, entregadorId });
        return corrida;
    }

    async listarCorridas(filtros: { estabelecimentoId?: string; entregadorId?: string; status?: string }) {
        return prisma.corrida.findMany({
            where: {
                ...(filtros.entregadorId && { entregadorId: filtros.entregadorId }),
                ...(filtros.status && { status: filtros.status as any }),
                ...(filtros.estabelecimentoId && { comanda: { estabelecimentoId: filtros.estabelecimentoId } }),
            },
            include: {
                comanda: {
                    select: {
                        codigo: true, nomeCliente: true, telefoneCliente: true, totalEstimado: true,
                        enderecoEntrega: { select: { logradouro: true, numero: true, bairro: true, cidade: true, estado: true } },
                    },
                },
                entregador: { select: { id: true, nome: true, telefone: true, statusEntregador: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async atualizarStatusCorrida(corridaId: string, entregadorId: string | null, novoStatus: string, observacoes?: string) {
        const corrida = await prisma.corrida.findUnique({ where: { id: corridaId } });
        if (!corrida) throw new NotFoundError('Corrida não encontrada');

        // Se entregadorId informado, valida que é o mesmo
        if (entregadorId && corrida.entregadorId !== entregadorId) {
            throw new BadRequestError('Você não tem permissão para atualizar esta corrida');
        }

        const permitidos = TRANSICOES_CORRIDA[corrida.status] ?? [];
        if (!permitidos.includes(novoStatus)) {
            throw new BadRequestError(`Transição inválida: ${corrida.status} → ${novoStatus}`);
        }

        const timestamps: Record<string, Date> = {};
        if (novoStatus === 'aceita')     timestamps.aceitaAt = new Date();
        if (novoStatus === 'em_coleta')  timestamps.emColetaAt = new Date();
        if (novoStatus === 'coletada')   timestamps.coletadaAt = new Date();
        if (novoStatus === 'em_entrega') timestamps.emEntregaAt = new Date();
        if (novoStatus === 'entregue')   timestamps.entregaAt = new Date();
        if (novoStatus === 'cancelada')  timestamps.canceladaAt = new Date();

        const corridaAtualizada = await prisma.corrida.update({
            where: { id: corridaId },
            data: { status: novoStatus as any, observacoes, ...timestamps },
            include: {
                comanda: { select: { codigo: true, nomeCliente: true, estabelecimentoId: true } },
                entregador: { select: { id: true, nome: true } },
            },
        });

        // Se entregue ou cancelada, libera o entregador
        if (['entregue', 'cancelada', 'recusada'].includes(novoStatus)) {
            await prisma.usuario.update({
                where: { id: corrida.entregadorId },
                data: { statusEntregador: novoStatus === 'recusada' ? 'online' : 'online' },
            });
        }

        // Emite atualização via socket
        try {
            const io = getIO();
            io.to(`estabelecimento:${corridaAtualizada.comanda.estabelecimentoId}`)
                .emit('corrida:atualizada', corridaAtualizada);
        } catch { /* socket pode não estar inicializado */ }

        logger.info('Status da corrida atualizado', { corridaId, status: novoStatus });
        return corridaAtualizada;
    }

    async minhasCorridas(entregadorId: string) {
        return prisma.corrida.findMany({
            where: {
                entregadorId,
                status: { in: ['oferecida', 'aceita', 'em_coleta', 'coletada', 'em_entrega'] },
            },
            include: {
                comanda: {
                    select: {
                        codigo: true, nomeCliente: true, telefoneCliente: true, totalEstimado: true,
                        pedidos: {
                            select: {
                                total: true,
                                itens: { select: { quantidade: true, produto: { select: { nome: true } } } },
                            },
                            take: 1,
                        },
                        enderecoEntrega: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
}

export const entregadorService = new EntregadorService();
