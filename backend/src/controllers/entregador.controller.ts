import { Response } from 'express';
import { AuthRequest } from '../types/express.js';
import { entregadorService } from '../services/entregador.service.js';
import { asyncHandler } from '../middlewares/error.middleware.js';
import { BadRequestError } from '../types/errors.js';

// ─── Admin ────────────────────────────────────────────────────────────────────

export const listarEntregadores = asyncHandler(async (req: AuthRequest, res: Response) => {
    const estabelecimentoId = req.estabelecimentoId!;
    res.json(await entregadorService.listarEntregadores(estabelecimentoId));
});

export const criarCorrida = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { comandaId, entregadorId } = req.body;
    if (!comandaId || !entregadorId) throw new BadRequestError('comandaId e entregadorId são obrigatórios');
    res.status(201).json(await entregadorService.criarCorrida(comandaId, entregadorId));
});

export const listarCorridas = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { status } = req.query;
    res.json(await entregadorService.listarCorridas({
        estabelecimentoId: req.estabelecimentoId,
        status: typeof status === 'string' ? status : undefined,
    }));
});

export const atualizarStatusCorridaAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status, observacoes } = req.body;
    if (!status) throw new BadRequestError('status é obrigatório');
    res.json(await entregadorService.atualizarStatusCorrida(id, null, status, observacoes));
});

// ─── Entregador ───────────────────────────────────────────────────────────────

export const atualizarMeuStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { status } = req.body;
    if (!status) throw new BadRequestError('status é obrigatório');
    res.json(await entregadorService.atualizarStatusEntregador(req.userId!, status));
});

export const minhasCorridas = asyncHandler(async (req: AuthRequest, res: Response) => {
    res.json(await entregadorService.minhasCorridas(req.userId!));
});

export const atualizarStatusCorrida = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status, observacoes } = req.body;
    if (!status) throw new BadRequestError('status é obrigatório');
    res.json(await entregadorService.atualizarStatusCorrida(id, req.userId!, status, observacoes));
});

export const atualizarLocalizacao = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { lat, lng } = req.body;
    if (lat === undefined || lng === undefined) throw new BadRequestError('lat e lng são obrigatórios');
    res.json(await entregadorService.atualizarLocalizacao(req.userId!, Number(lat), Number(lng)));
});

export const ultimaLocalizacao = asyncHandler(async (req: AuthRequest, res: Response) => {
    res.json(await entregadorService.ultimaLocalizacao(req.params.id));
});
