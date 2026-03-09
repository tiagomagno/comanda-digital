import { Response } from 'express';
import { AuthRequest } from '../types/express.js';
import { pedidoService } from '../services/pedido.service.js';
import { asyncHandler } from '../middlewares/error.middleware.js';
import { BadRequestError } from '../types/errors.js';
import prisma from '../config/database.js';
import { pedidoInclude } from '../utils/prisma-includes.js';
import { logger } from '../utils/logger.js';

/**
 * Listar pedidos para a cozinha (Kanban)
 */
export const listarPedidos = asyncHandler(async (req: AuthRequest, res: Response) => {
    const estabelecimentoId = req.estabelecimentoId || req.user?.estabelecimentoId;
    const { destino, status } = req.query;

    if (!estabelecimentoId) {
        throw new BadRequestError('Estabelecimento não identificado');
    }

    // Filtros de status para Kanban
    const statusFiltro = status
        ? [status as string]
        : ['pago', 'em_preparo', 'pronto'];

    const pedidos = await prisma.pedido.findMany({
        where: {
            comanda: {
                estabelecimentoId,
                status: {
                    in: ['ativa', 'paga'],
                },
            },
            status: {
                in: statusFiltro as any[],
            },
            ...(destino && { destino: destino as any }),
        },
        include: pedidoInclude,
        orderBy: {
            createdAt: 'asc', // Mais antigos primeiro
        },
    });

    // Agrupar por status para Kanban
    const kanban = {
        novos: pedidos.filter((p) => p.status === 'pago'),
        emPreparo: pedidos.filter((p) => p.status === 'em_preparo'),
        prontos: pedidos.filter((p) => p.status === 'pronto'),
    };

    res.json(kanban);
});

/**
 * Atualizar status do pedido
 */
export const atualizarStatusPedido = asyncHandler(async (req: AuthRequest, res: Response) => {
    const estabelecimentoId = req.estabelecimentoId || req.user?.estabelecimentoId;
    const { id } = req.params;
    const { status } = req.body;

    if (!estabelecimentoId) {
        throw new BadRequestError('Estabelecimento não identificado');
    }

    if (!status) {
        throw new BadRequestError('Status é obrigatório');
    }

    // Validar status permitidos
    const statusPermitidos = ['em_preparo', 'pronto', 'entregue'];
    if (!statusPermitidos.includes(status)) {
        throw new BadRequestError(
            `Status inválido. Permitidos: ${statusPermitidos.join(', ')}`
        );
    }

    // Buscar pedido e verificar ownership
    const pedido = await prisma.pedido.findFirst({
        where: {
            id,
            comanda: {
                estabelecimentoId,
            },
        },
    });

    if (!pedido) {
        throw new BadRequestError('Pedido não encontrado ou não pertence a este estabelecimento');
    }

    // Validar transição de status
    const transicoesValidas: Record<string, string[]> = {
        pago: ['em_preparo'],
        em_preparo: ['pronto'],
        pronto: ['entregue'],
    };

    if (!transicoesValidas[pedido.status]?.includes(status)) {
        throw new BadRequestError(
            `Transição inválida de ${pedido.status} para ${status}`
        );
    }

    // Atualizar usando o serviço
    const pedidoAtualizado = await pedidoService.atualizarStatus(id, status, req.userId);

    logger.info('Status do pedido atualizado pela cozinha', {
        pedidoId: id,
        status,
        userId: req.userId,
    });

    res.json(pedidoAtualizado);
});

/**
 * Obter estatísticas da cozinha
 */
export const obterEstatisticas = asyncHandler(async (req: AuthRequest, res: Response) => {
    const estabelecimentoId = req.estabelecimentoId || req.user?.estabelecimentoId;

    if (!estabelecimentoId) {
        throw new BadRequestError('Estabelecimento não identificado');
    }

    const [novos, emPreparo, prontos, entreguesHoje] = await Promise.all([
        // Pedidos novos (pagos, aguardando preparo)
        prisma.pedido.count({
            where: {
                comanda: { estabelecimentoId, status: { in: ['ativa', 'paga'] } },
                status: 'pago',
            },
        }),
        // Pedidos em preparo
        prisma.pedido.count({
            where: {
                comanda: { estabelecimentoId, status: { in: ['ativa', 'paga'] } },
                status: 'em_preparo',
            },
        }),
        // Pedidos prontos
        prisma.pedido.count({
            where: {
                comanda: { estabelecimentoId, status: { in: ['ativa', 'paga'] } },
                status: 'pronto',
            },
        }),
        // Pedidos entregues hoje
        prisma.pedido.count({
            where: {
                comanda: { estabelecimentoId },
                status: 'entregue',
                entregueAt: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0)),
                },
            },
        }),
    ]);

    res.json({
        novos,
        emPreparo,
        prontos,
        entreguesHoje,
        total: novos + emPreparo + prontos,
    });
});
