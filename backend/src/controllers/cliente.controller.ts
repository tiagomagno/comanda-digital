import { Response } from 'express';
import { AuthRequest } from '../types/express.js';
import { clienteService } from '../services/cliente.service.js';
import { asyncHandler } from '../middlewares/error.middleware.js';

/**
 * Escanear QR Code da mesa
 */
export const escanearQRCode = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { estabelecimentoId, mesaId } = req.params;
    const resultado = await clienteService.escanearQRCode(estabelecimentoId, mesaId);
    res.json(resultado);
});

/**
 * Criar nova comanda (cliente)
 */
export const criarComanda = asyncHandler(async (req: AuthRequest, res: Response) => {
    const comanda = await clienteService.criarComanda(req.body);
    res.status(201).json(comanda);
});

/**
 * Visualizar cardápio
 */
export const visualizarCardapio = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { estabelecimentoId } = req.params;
    const cardapio = await clienteService.visualizarCardapio(estabelecimentoId);
    res.json(cardapio);
});

/**
 * Criar pedido (cliente)
 */
export const criarPedido = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { comandaId, itens, observacoes } = req.body;
    const pedido = await clienteService.criarPedido(comandaId, itens, observacoes);
    res.status(201).json(pedido);
});

/**
 * Visualizar comanda do cliente
 */
export const visualizarComanda = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { codigo } = req.params;
    const comanda = await clienteService.visualizarComanda(codigo);
    res.json(comanda);
});
