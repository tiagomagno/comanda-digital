import { Response } from 'express';
import { AuthRequest } from '../types/express.js';
import { comandaService, pedidoService, mesaService } from '../services/index.js';
import { asyncHandler } from '../middlewares/error.middleware.js';
import { BadRequestError } from '../types/errors.js';
import prisma from '../config/database.js';
import { logger } from '../utils/logger.js';

export const listarComandas = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { status, mesaId } = req.query;
    const estabelecimentoId = req.estabelecimentoId || req.user?.estabelecimentoId;

    if (!estabelecimentoId) {
        throw new BadRequestError('Estabelecimento não identificado');
    }

    const where: any = {
        estabelecimentoId,
        status: { in: ['ativa', 'aguardando_pagamento'] as const },
    };

    if (status && typeof status === 'string' && ['ativa', 'fechada', 'aguardando_pagamento', 'cancelada'].includes(status)) {
        where.status = status;
    }

    if (mesaId && typeof mesaId === 'string') {
        where.mesaId = mesaId;
    }

    const comandas = await prisma.comanda.findMany({
        where,
        include: {
            mesaRelacao: true,
            pedidos: {
                include: { itens: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    res.json(comandas);
});

export const visualizarComanda = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const estabelecimentoId = req.estabelecimentoId || req.user?.estabelecimentoId;

    const comanda = await prisma.comanda.findFirst({
        where: { id, estabelecimentoId },
        include: {
            mesaRelacao: true,
            pedidos: {
                include: {
                    itens: {
                        include: { produto: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
            },
        },
    });

    if (!comanda) {
        throw new BadRequestError('Comanda não encontrada');
    }

    res.json(comanda);
});

export const aprovarPedido = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const estabelecimentoId = req.estabelecimentoId || req.user?.estabelecimentoId;

    // Verificar se pedido pertence ao estabelecimento
    const pedido = await prisma.pedido.findFirst({
        where: { id, comanda: { estabelecimentoId } },
    });

    if (!pedido) {
        throw new BadRequestError('Pedido não encontrado');
    }

    // Atualizar para pago (que libera para cozinha/bar)
    const pedidoAtualizado = await pedidoService.atualizarStatus(id, 'pago', req.userId);

    // Atualizar campos de aprovação
    await prisma.pedido.update({
        where: { id },
        data: {
            aprovadoPor: req.userId,
            aprovadoAt: new Date(),
        },
    });

    logger.info('Pedido aprovado pelo garçom', { pedidoId: id, userId: req.userId });
    res.json(pedidoAtualizado);
});

export const rejeitarPedido = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const estabelecimentoId = req.estabelecimentoId || req.user?.estabelecimentoId;

    const pedido = await prisma.pedido.findFirst({
        where: { id, comanda: { estabelecimentoId } },
    });

    if (!pedido) {
        throw new BadRequestError('Pedido não encontrado');
    }

    await pedidoService.cancelar(id, req.userId);

    logger.info('Pedido rejeitado pelo garçom', { pedidoId: id, userId: req.userId });
    res.json({ message: 'Pedido rejeitado' });
});

export const processarPagamento = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { metodoPagamento } = req.body;

    const comanda = await comandaService.atualizarStatus(id, 'paga');

    logger.info('Pagamento processado pelo garçom', { comandaId: id, metodoPagamento });
    res.json(comanda);
});

export const fecharComanda = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const comanda = await comandaService.atualizarStatus(id, 'finalizada');

    logger.info('Comanda fechada pelo garçom', { comandaId: id });
    res.json(comanda);
});

// Funções de mesa (implementação simplificada)
export const ajustarCapacidadeMesa = asyncHandler(async (req: AuthRequest, res: Response) => {
    const estabelecimentoId = req.estabelecimentoId || req.user?.estabelecimentoId;
    const { id } = req.params;
    const { capacidade } = req.body;

    if (!estabelecimentoId) {
        throw new BadRequestError('Estabelecimento não identificado');
    }

    if (!capacidade || capacidade <= 0) {
        throw new BadRequestError('Capacidade deve ser maior que zero');
    }

    const mesa = await mesaService.atualizar(id, estabelecimentoId, {
        capacidade: Number(capacidade),
    });

    res.json(mesa);
});

export const listarGruposMesas = asyncHandler(async (_req: AuthRequest, res: Response) => {
    res.json([]);
});

export const criarGrupoMesas = asyncHandler(async (_req: AuthRequest, res: Response) => {
    res.json({ message: 'Not implemented yet' });
});

export const atualizarGrupoMesas = asyncHandler(async (_req: AuthRequest, res: Response) => {
    res.json({ message: 'Not implemented yet' });
});

export const desfazerGrupoMesas = asyncHandler(async (_req: AuthRequest, res: Response) => {
    res.json({ message: 'Not implemented yet' });
});
