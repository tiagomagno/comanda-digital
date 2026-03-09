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

        // Buscar produtos e calcular total
        let total = 0;
        let destino: 'BAR' | 'COZINHA' | null = null;

        const itensComPreco = await Promise.all(
            data.itens.map(async (item) => {
                const produto = await prisma.produto.findUnique({
                    where: { id: item.produtoId },
                    include: { categoria: true },
                });

                if (!produto) {
                    throw new NotFoundError(`Produto ${item.produtoId} não encontrado`);
                }

                if (!produto.disponivel) {
                    throw new BadRequestError(`Produto ${produto.nome} não está disponível`);
                }

                const precoUnitario = Number(produto.preco);
                const subtotal = precoUnitario * item.quantidade;
                total += subtotal;

                // Definir destino baseado na categoria do primeiro produto
                if (!destino) {
                    destino = produto.categoria.destino;
                }

                return {
                    produtoId: produto.id,
                    quantidade: item.quantidade,
                    precoUnitario,
                    subtotal,
                    observacoes: item.observacoes,
                };
            })
        );

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

        // Preparar dados de atualização
        const dataAtualizacao: any = { status };

        if (status === 'pago') {
            dataAtualizacao.pagoAt = new Date();
        } else if (status === 'em_preparo') {
            dataAtualizacao.emPreparoAt = new Date();
        } else if (status === 'pronto') {
            dataAtualizacao.prontoAt = new Date();
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

        // Só pode cancelar se estiver aguardando pagamento
        if (pedido.status !== 'aguardando_pagamento') {
            throw new BadRequestError('Só é possível cancelar pedidos aguardando pagamento');
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
