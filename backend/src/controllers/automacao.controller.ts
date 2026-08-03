import { Response } from 'express';
import { AuthRequest } from '../types/express.js';
import { automacaoService } from '../services/automacao.service.js';
import { asyncHandler } from '../middlewares/error.middleware.js';

export const listar = asyncHandler(async (req: AuthRequest, res: Response) => {
    res.json(await automacaoService.listar(req.estabelecimentoId!));
});

export const criar = asyncHandler(async (req: AuthRequest, res: Response) => {
    const regra = await automacaoService.criar(req.estabelecimentoId!, req.body);
    res.status(201).json(regra);
});

export const atualizar = asyncHandler(async (req: AuthRequest, res: Response) => {
    const regra = await automacaoService.atualizar(req.params.id, req.estabelecimentoId!, req.body);
    res.json(regra);
});

export const deletar = asyncHandler(async (req: AuthRequest, res: Response) => {
    await automacaoService.deletar(req.params.id, req.estabelecimentoId!);
    res.status(204).send();
});

export const processar = asyncHandler(async (req: AuthRequest, res: Response) => {
    const resultado = await automacaoService.processar(req.estabelecimentoId!);
    res.json(resultado);
});

export const historico = asyncHandler(async (req: AuthRequest, res: Response) => {
    const execucoes = await automacaoService.historicoExecucoes(req.params.id, req.estabelecimentoId!);
    res.json(execucoes);
});
