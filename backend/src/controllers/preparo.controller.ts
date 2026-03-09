import { Response } from 'express';
import { AuthRequest } from '../types/express.js';
import { pedidoService } from '../services/pedido.service.js';
import { asyncHandler } from '../middlewares/error.middleware.js';
import { BadRequestError } from '../types/errors.js';
import prisma from '../config/database.js';
import { pedidoInclude } from '../utils/prisma-includes.js';
import { logger } from '../utils/logger.js';

/**
 * Listar pedidos pendentes para preparo (bar ou cozinha)
 */
export const listarPedidosPendentes = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { destino, estabelecimentoId } = req.query;
    const userTipo = req.userTipo;

    // Determinar destino baseado no tipo de usuário
    let destinoFiltro = destino as string;

    if (!destinoFiltro) {
        if (userTipo === 'bar') {
            destinoFiltro = 'BAR';
        } else if (userTipo === 'cozinha') {
            destinoFiltro = 'COZINHA';
        }
    }

    if (!estabelecimentoId || typeof estabelecimentoId !== 'string') {
        throw new BadRequestError('estabelecimentoId é obrigatório');
    }

    const pedidos = await prisma.pedido.findMany({
        where: {
            ...(destinoFiltro && { destino: destinoFiltro as any }),
            status: {
                in: ['pago', 'em_preparo'],
            },
            comanda: {
                estabelecimentoId,
            },
        },
        include: pedidoInclude,
        orderBy: {
            createdAt: 'asc',
        },
    });

    res.json(pedidos);
});

/**
 * Iniciar preparo do pedido
 */
export const iniciarPreparo = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const pedido = await pedidoService.buscarPorId(id);

    if (pedido.status !== 'pago') {
        throw new BadRequestError('Apenas pedidos pagos podem entrar em preparo');
    }

    const pedidoAtualizado = await pedidoService.atualizarStatus(id, 'em_preparo', req.userId);

    logger.info('Preparo iniciado', { pedidoId: id, userId: req.userId });
    res.json(pedidoAtualizado);
});

/**
 * Marcar pedido como pronto
 */
export const marcarPronto = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const pedido = await pedidoService.buscarPorId(id);

    if (pedido.status !== 'em_preparo') {
        throw new BadRequestError('Apenas pedidos em preparo podem ser marcados como prontos');
    }

    const pedidoAtualizado = await pedidoService.atualizarStatus(id, 'pronto', req.userId);

    logger.info('Pedido marcado como pronto', { pedidoId: id, userId: req.userId });
    res.json(pedidoAtualizado);
});

/**
 * Buscar estatísticas do preparo
 */
export const buscarEstatisticas = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { destino, estabelecimentoId } = req.query;

    if (!estabelecimentoId || typeof estabelecimentoId !== 'string') {
        throw new BadRequestError('estabelecimentoId é obrigatório');
    }

    if (!destino) {
        throw new BadRequestError('destino é obrigatório');
    }

    const [aguardando, emPreparo, prontos, totalHoje] = await Promise.all([
        prisma.pedido.count({
            where: {
                destino: destino as any,
                status: 'pago',
                comanda: { estabelecimentoId },
            },
        }),
        prisma.pedido.count({
            where: {
                destino: destino as any,
                status: 'em_preparo',
                comanda: { estabelecimentoId },
            },
        }),
        prisma.pedido.count({
            where: {
                destino: destino as any,
                status: 'pronto',
                comanda: { estabelecimentoId },
            },
        }),
        prisma.pedido.count({
            where: {
                destino: destino as any,
                status: {
                    in: ['pronto', 'entregue'],
                },
                comanda: { estabelecimentoId },
                createdAt: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0)),
                },
            },
        }),
    ]);

    res.json({
        aguardando,
        emPreparo,
        prontos,
        totalHoje,
    });
});
