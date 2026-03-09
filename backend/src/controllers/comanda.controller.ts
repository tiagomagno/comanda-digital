import { Response } from 'express';
import { AuthRequest } from '../types/express.js';
import { comandaService } from '../services/comanda.service.js';
import { asyncHandler } from '../middlewares/error.middleware.js';

/**
 * Criar nova comanda
 */
export const criarComanda = asyncHandler(async (req: AuthRequest, res: Response) => {
    const comanda = await comandaService.criarComanda(req.body);
    res.status(201).json(comanda);
});

/**
 * Buscar comanda por código
 */
export const buscarComandaPorCodigo = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { codigo } = req.params;
    const comanda = await comandaService.buscarPorCodigo(codigo);
    res.json(comanda);
});

/**
 * Buscar comanda por ID
 */
export const buscarComanda = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const comanda = await comandaService.buscarPorId(id);
    res.json(comanda);
});

/**
 * Listar comandas ativas
 */
export const listarComandasAtivas = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { estabelecimentoId } = req.query;
    
    if (!estabelecimentoId || typeof estabelecimentoId !== 'string') {
        res.status(400).json({
            error: 'estabelecimentoId é obrigatório',
        });
        return;
    }

    const comandas = await comandaService.listarAtivas(estabelecimentoId);
    res.json(comandas);
});

/**
 * Atualizar status da comanda
 */
export const atualizarStatusComanda = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    
    const comanda = await comandaService.atualizarStatus(id, status);
    res.json(comanda);
});

/**
 * Listar pedidos da comanda
 */
export const listarPedidosComanda = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const pedidos = await comandaService.listarPedidos(id);
    res.json(pedidos);
});
