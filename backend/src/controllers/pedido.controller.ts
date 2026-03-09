import { Response } from 'express';
import { AuthRequest } from '../types/express.js';
import { pedidoService } from '../services/pedido.service.js';
import { asyncHandler } from '../middlewares/error.middleware.js';

/**
 * Criar novo pedido
 */
export const criarPedido = asyncHandler(async (req: AuthRequest, res: Response) => {
    const pedido = await pedidoService.criarPedido(req.body);
    res.status(201).json(pedido);
});

/**
 * Buscar pedido por ID
 */
export const buscarPedido = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const pedido = await pedidoService.buscarPorId(id);
    res.json(pedido);
});

/**
 * Atualizar status do pedido
 */
export const atualizarStatusPedido = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.userId;
    
    const pedido = await pedidoService.atualizarStatus(id, status, userId);
    res.json(pedido);
});

/**
 * Cancelar pedido
 */
export const cancelarPedido = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.userId;
    
    const pedido = await pedidoService.cancelar(id, userId);
    res.json(pedido);
});
