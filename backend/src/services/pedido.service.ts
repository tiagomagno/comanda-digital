import prisma from '../config/database.js';
import { CriarPedidoDTO } from '../types/dto.js';
import { NotFoundError, BadRequestError } from '../types/errors.js';
import { pedidoInclude } from '../utils/prisma-includes.js';
import { getIO } from '../config/socket.js';
import { logger } from '../utils/logger.js';

export class PedidoService {
    /**
     * Criar novo pedido
     */
    async criarPedido(data: CriarPedidoDTO) {
        logger.info('Criando novo pedido', { comandaCodigo: data.comandaCodigo });

        // Buscar comanda pelo código (enviado pelo frontend)
        const comanda = await prisma.comanda.findUnique({
            where: { codigo: data.comandaCodigo },
        });

        if (!comanda) {
            throw new NotFoundError('Comanda não encontrada');
        }

        // Buscar último número de pedido da comanda
        const ultimoPedido = await prisma.pedido.findFirst({
            where: { comandaId: comanda.id },
            orderBy: { numeroPedido: 'desc' },
        });

        const numeroPedido = ultimoPedido ? ultimoPedido.numeroPedido + 1 : 1;

        // Buscar todos os produtos em uma única query (evita N+1)
        const produtoIds = data.itens.map((i) => i.produtoId);
        const produtos = await prisma.produto.findMany({
            where: { id: { in: produtoIds } },
            include: { categoria: true },
        });

        // Validar existência e disponibilidade
        for (const item of data.itens) {
            const produto = produtos.find((p) => p.id === item.produtoId);
            if (!produto) throw new NotFoundError(`Produto ${item.produtoId} não encontrado`);
            if (!produto.disponivel) throw new BadRequestError(`Produto ${produto.nome} não está disponível`);
        }

        // Buscar adicionais de todos os itens em uma única query
        const todosAdicionaisIds = data.itens.flatMap((i) => i.adicionaisIds ?? []);
        const adicionaisMap = new Map<string, { preco: number }>();
        if (todosAdicionaisIds.length > 0) {
            const adicionais = await prisma.adicional.findMany({
                where: { id: { in: todosAdicionaisIds }, disponivel: true },
                select: { id: true, preco: true },
            });
            adicionais.forEach((a) => adicionaisMap.set(a.id, { preco: Number(a.preco) }));
        }

        let total = 0;
        let destino: 'BAR' | 'COZINHA' | null = null;

        const itensComPreco = data.itens.map((item) => {
            const produto = produtos.find((p) => p.id === item.produtoId)!;
            const precoUnitario = Number(produto.preco);
            const precoAdicionais = (item.adicionaisIds ?? []).reduce(
                (sum, id) => sum + (adicionaisMap.get(id)?.preco ?? 0), 0
            );
            const subtotal = (precoUnitario + precoAdicionais) * item.quantidade;
            total += subtotal;
            if (!destino) destino = produto.categoria.destino;
            return {
                produtoId: produto.id,
                quantidade: item.quantidade,
                precoUnitario,
                subtotal,
                observacoes: item.observacoes,
                ...(item.adicionaisIds?.length ? {
                    adicionais: {
                        create: item.adicionaisIds
                            .filter((id) => adicionaisMap.has(id))
                            .map((id) => ({
                                adicionalId: id,
                                preco: adicionaisMap.get(id)!.preco,
                            })),
                    },
                } : {}),
            };
        });

        // Criar pedido com itens
        const pedido = await prisma.pedido.create({
            data: {
                comandaId: comanda.id,
                numeroPedido,
                status: 'criado',
                destino,
                total,
                observacoes: data.observacoes,
                itens: {
                    create: itensComPreco,
                },
            },
            include: pedidoInclude,
        });

        // Emitir evento WebSocket
        try {
            const io = getIO();
            io.to(`estabelecimento:${comanda.estabelecimentoId}`).emit('pedido:novo', pedido);
        } catch (error) {
            logger.warn('Socket.IO não inicializado, evento não enviado', { comandaId: comanda.id });
        }

        logger.info('Pedido criado com sucesso', { pedidoId: pedido.id, numeroPedido });
        return pedido;
    }

    /**
     * Buscar pedido por ID
     */
    async buscarPorId(id: string) {
        const pedido = await prisma.pedido.findUnique({
            where: { id },
            include: pedidoInclude,
        });

        if (!pedido) {
            throw new NotFoundError('Pedido não encontrado');
        }

        return pedido;
    }

    /**
     * Transições de status permitidas
     * Estado atual → estados válidos para o próximo
     *
     * 'pago' = liberado para produção. No modelo formaPagamento 'imediato' isso
     * coincide com pagamento confirmado (manual ou via webhook de gateway);
     * no modelo 'final' (conta aberta) o garçom aprova antes do dinheiro trocar
     * de mãos. A verdade financeira definitiva mora em Comanda.status/Transacao,
     * nunca aqui.
     */
    static readonly TRANSICOES_VALIDAS: Record<string, string[]> = {
        criado:               ['aguardando_pagamento', 'pago', 'cancelado'],
        aguardando_pagamento: ['pago', 'cancelado'],
        pago:                 ['em_preparo', 'cancelado'],
        em_preparo:           ['pronto',     'cancelado'],
        pronto:               ['em_expedicao', 'entregue', 'cancelado'], // em_expedicao para delivery, entregue para local
        em_expedicao:         ['entregue',   'cancelado'],
        entregue:             [],   // estado final — sem mais transições
        cancelado:            [],   // estado final — sem mais transições
    };

    /**
     * Atualizar status do pedido
     */
    async atualizarStatus(id: string, status: string, userId?: string) {
        // Buscar pedido atual
        const pedidoAtual = await prisma.pedido.findUnique({
            where: { id },
            include: { comanda: true },
        });

        if (!pedidoAtual) {
            throw new NotFoundError('Pedido não encontrado');
        }

        // Validar transição
        const transicoes = PedidoService.TRANSICOES_VALIDAS[pedidoAtual.status] ?? [];
        if (!transicoes.includes(status)) {
            throw new BadRequestError(
                `Transição inválida: ${pedidoAtual.status} → ${status}. ` +
                `Permitido: [${transicoes.join(', ') || 'nenhum — estado final'}]`
            );
        }

        // Preparar dados de atualização
        const dataAtualizacao: any = { status };

        if (status === 'pago') {
            dataAtualizacao.pagoAt = new Date();
        } else if (status === 'em_preparo') {
            dataAtualizacao.emPreparoAt = new Date();
        } else if (status === 'pronto') {
            dataAtualizacao.prontoAt = new Date();
        } else if (status === 'em_expedicao') {
            dataAtualizacao.emExpedicaoAt = new Date();
        } else if (status === 'entregue') {
            dataAtualizacao.entregueAt = new Date();
        } else if (status === 'cancelado') {
            dataAtualizacao.canceladoAt = new Date();
        }

        // Atualizar pedido
        const pedido = await prisma.pedido.update({
            where: { id },
            data: dataAtualizacao,
            include: pedidoInclude,
        });

        // Registrar histórico
        await prisma.historicoStatusPedido.create({
            data: {
                pedidoId: id,
                statusAnterior: pedidoAtual.status,
                statusNovo: status,
                usuarioId: userId,
            },
        });

        // Emitir evento WebSocket
        try {
            const io = getIO();
            io.to(`estabelecimento:${pedidoAtual.comanda.estabelecimentoId}`).emit(
                'pedido:atualizado',
                pedido
            );
        } catch (error) {
            logger.warn('Socket.IO não inicializado, evento não enviado', { pedidoId: id });
        }

        logger.info('Status do pedido atualizado', { pedidoId: id, status });
        return pedido;
    }

    /**
     * Cancelar pedido
     */
    async cancelar(id: string, userId?: string) {
        const pedido = await prisma.pedido.findUnique({
            where: { id },
            include: { comanda: true },
        });

        if (!pedido) {
            throw new NotFoundError('Pedido não encontrado');
        }

        const transicoes = PedidoService.TRANSICOES_VALIDAS[pedido.status] ?? [];
        if (!transicoes.includes('cancelado')) {
            throw new BadRequestError(`Pedido em '${pedido.status}' não pode mais ser cancelado`);
        }

        const pedidoCancelado = await prisma.pedido.update({
            where: { id },
            data: {
                status: 'cancelado',
                canceladoAt: new Date(),
            },
            include: pedidoInclude,
        });

        // Registrar histórico
        await prisma.historicoStatusPedido.create({
            data: {
                pedidoId: id,
                statusAnterior: pedido.status,
                statusNovo: 'cancelado',
                usuarioId: userId,
            },
        });

        // Emitir evento WebSocket
        try {
            const io = getIO();
            io.to(`estabelecimento:${pedido.comanda.estabelecimentoId}`).emit(
                'pedido:cancelado',
                pedidoCancelado
            );
        } catch (error) {
            logger.warn('Socket.IO não inicializado, evento não enviado', { pedidoId: id });
        }

        logger.info('Pedido cancelado', { pedidoId: id });
        return pedidoCancelado;
    }
}

export const pedidoService = new PedidoService();
