import { Response } from 'express';
import { AuthRequest } from '../types/express.js';
import { pedidoService } from '../services/pedido.service.js';
import { asyncHandler } from '../middlewares/error.middleware.js';
import { BadRequestError } from '../types/errors.js';
import prisma from '../config/database.js';
import { pedidoInclude } from '../utils/prisma-includes.js';
import { logger } from '../utils/logger.js';

/**
 * Listar pedidos para a tela de Expedição (Kanban 2 colunas)
 * Coluna 1 — Prontos (saíram da cozinha/bar, aguardando conferência)
 * Coluna 2 — Em Expedição (em conferência / embalagem)
 */
export const listarPedidos = asyncHandler(async (req: AuthRequest, res: Response) => {
    const estabelecimentoId = req.estabelecimentoId || req.user?.estabelecimentoId;
    if (!estabelecimentoId) throw new BadRequestError('Estabelecimento não identificado');

    const pedidos = await prisma.pedido.findMany({
        where: {
            comanda: {
                estabelecimentoId,
                status: { in: ['ativa', 'paga'] },
            },
            status: { in: ['pronto', 'em_expedicao'] },
        },
        include: pedidoInclude,
        orderBy: { createdAt: 'asc' },
    });

    res.json({
        prontos:      pedidos.filter(p => p.status === 'pronto'),
        emExpedicao:  pedidos.filter(p => p.status === 'em_expedicao'),
    });
});

/**
 * Atualizar status do pedido via expedição
 * Transições permitidas: pronto → em_expedicao | em_expedicao → entregue
 */
export const atualizarStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const estabelecimentoId = req.estabelecimentoId || req.user?.estabelecimentoId;
    const { id } = req.params;
    const { status } = req.body;

    if (!estabelecimentoId) throw new BadRequestError('Estabelecimento não identificado');
    if (!status) throw new BadRequestError('Status é obrigatório');

    const statusPermitidos = ['em_expedicao', 'entregue', 'cancelado'];
    if (!statusPermitidos.includes(status)) {
        throw new BadRequestError(`Status inválido. Permitidos: ${statusPermitidos.join(', ')}`);
    }

    const pedido = await prisma.pedido.findFirst({
        where: { id, comanda: { estabelecimentoId } },
    });
    if (!pedido) throw new BadRequestError('Pedido não encontrado');

    const transicoesValidas: Record<string, string[]> = {
        pronto:       ['em_expedicao', 'cancelado'],
        em_expedicao: ['entregue',     'cancelado'],
    };
    if (!transicoesValidas[pedido.status]?.includes(status)) {
        throw new BadRequestError(`Transição inválida: ${pedido.status} → ${status}`);
    }

    const pedidoAtualizado = await pedidoService.atualizarStatus(id, status, req.userId);

    logger.info('Status atualizado pela expedição', { pedidoId: id, status });
    res.json(pedidoAtualizado);
});
