import { Response } from 'express';
import { AuthRequest } from '../types/express.js';
import { omnichannelService } from '../services/omnichannel.service.js';
import { asyncHandler } from '../middlewares/error.middleware.js';
import { BadRequestError } from '../types/errors.js';

// ─── Admin ────────────────────────────────────────────────────────────────────

export const listarCanais = asyncHandler(async (req: AuthRequest, res: Response) => {
    res.json(await omnichannelService.listarCanais(req.estabelecimentoId!));
});

export const criarCanal = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.body.nome || !req.body.tipo) throw new BadRequestError('nome e tipo são obrigatórios');
    res.status(201).json(await omnichannelService.criarCanal(req.estabelecimentoId!, req.body));
});

export const atualizarCanal = asyncHandler(async (req: AuthRequest, res: Response) => {
    res.json(await omnichannelService.atualizarCanal(req.params.id, req.estabelecimentoId!, req.body));
});

export const deletarCanal = asyncHandler(async (req: AuthRequest, res: Response) => {
    await omnichannelService.deletarCanal(req.params.id, req.estabelecimentoId!);
    res.status(204).send();
});

export const listarPedidosExternos = asyncHandler(async (req: AuthRequest, res: Response) => {
    res.json(await omnichannelService.listarPedidosExternos(req.params.id, req.estabelecimentoId!));
});

// ─── Webhook público ──────────────────────────────────────────────────────────

export const receberWebhook = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { canalId } = req.params;
    // Retorna 200 imediatamente (padrão de webhooks para evitar retry)
    res.json(await omnichannelService.receberWebhook(canalId, req.body));
});
