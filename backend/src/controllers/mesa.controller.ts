import { Response } from 'express';
import { AuthRequest } from '../types/express.js';
import { mesaService } from '../services/mesa.service.js';
import { asyncHandler } from '../middlewares/error.middleware.js';
import { BadRequestError } from '../types/errors.js';

/**
 * Listar todas as mesas do estabelecimento
 */
export const listarMesas = asyncHandler(async (req: AuthRequest, res: Response) => {
    const estabelecimentoId = req.estabelecimentoId || req.user?.estabelecimentoId;

    if (!estabelecimentoId) {
        throw new BadRequestError('Estabelecimento não identificado');
    }

    const mesas = await mesaService.listar(estabelecimentoId);
    res.json(mesas);
});

/**
 * Criar nova mesa com QR Code
 */
export const criarMesa = asyncHandler(async (req: AuthRequest, res: Response) => {
    const estabelecimentoId = req.estabelecimentoId || req.user?.estabelecimentoId;

    if (!estabelecimentoId) {
        throw new BadRequestError('Estabelecimento não identificado');
    }

    const { numero, capacidade } = req.body;

    if (!numero) {
        throw new BadRequestError('Número da mesa é obrigatório');
    }

    const mesa = await mesaService.criar({
        estabelecimentoId,
        numero,
        capacidade,
    });

    res.status(201).json(mesa);
});

/**
 * Atualizar mesa
 */
export const atualizarMesa = asyncHandler(async (req: AuthRequest, res: Response) => {
    const estabelecimentoId = req.estabelecimentoId || req.user?.estabelecimentoId;
    const { id } = req.params;
    const { numero, capacidade, ativo } = req.body;

    if (!estabelecimentoId) {
        throw new BadRequestError('Estabelecimento não identificado');
    }

    const mesa = await mesaService.atualizar(id, estabelecimentoId, {
        numero,
        capacidade,
        ativo,
    });

    res.json(mesa);
});

/**
 * Deletar mesa (soft delete)
 */
export const deletarMesa = asyncHandler(async (req: AuthRequest, res: Response) => {
    const estabelecimentoId = req.estabelecimentoId || req.user?.estabelecimentoId;
    const { id } = req.params;

    if (!estabelecimentoId) {
        throw new BadRequestError('Estabelecimento não identificado');
    }

    const resultado = await mesaService.deletar(id, estabelecimentoId);
    res.json(resultado);
});

/**
 * Regenerar QR Code da mesa
 */
export const regenerarQRCode = asyncHandler(async (req: AuthRequest, res: Response) => {
    const estabelecimentoId = req.estabelecimentoId || req.user?.estabelecimentoId;
    const { id } = req.params;

    if (!estabelecimentoId) {
        throw new BadRequestError('Estabelecimento não identificado');
    }

    const mesa = await mesaService.regenerarQRCode(id, estabelecimentoId);
    res.json(mesa);
});

/**
 * Download do QR Code (PNG)
 */
export const downloadQRCode = asyncHandler(async (req: AuthRequest, res: Response) => {
    const estabelecimentoId = req.estabelecimentoId || req.user?.estabelecimentoId;
    const { id } = req.params;

    if (!estabelecimentoId) {
        throw new BadRequestError('Estabelecimento não identificado');
    }

    const { buffer, filename } = await mesaService.obterQRCodeDownload(id, estabelecimentoId);

    // Enviar como download
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
});
