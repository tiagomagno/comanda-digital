import { Response } from 'express';
import { AuthRequest } from '../types/express.js';
import { cupomService } from '../services/cupom.service.js';
import { asyncHandler } from '../middlewares/error.middleware.js';
import { BadRequestError } from '../types/errors.js';

/** Valida cupom (público — cliente Dine Go) */
export const validarCupom = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { codigo, estabelecimentoId, total } = req.body;
    if (!codigo || !estabelecimentoId || total === undefined) {
        throw new BadRequestError('codigo, estabelecimentoId e total são obrigatórios');
    }
    const resultado = await cupomService.validar(estabelecimentoId, codigo, Number(total));
    res.json(resultado);
});

/** Listar cupons do estabelecimento (admin) */
export const listarCupons = asyncHandler(async (req: AuthRequest, res: Response) => {
    const cupons = await cupomService.listar(req.estabelecimentoId!);
    res.json(cupons);
});

/** Criar cupom (admin) */
export const criarCupom = asyncHandler(async (req: AuthRequest, res: Response) => {
    const cupom = await cupomService.criar(req.estabelecimentoId!, req.body);
    res.status(201).json(cupom);
});

/** Atualizar cupom (admin) */
export const atualizarCupom = asyncHandler(async (req: AuthRequest, res: Response) => {
    const cupom = await cupomService.atualizar(req.params.id, req.estabelecimentoId!, req.body);
    res.json(cupom);
});

/** Deletar cupom (admin) */
export const deletarCupom = asyncHandler(async (req: AuthRequest, res: Response) => {
    await cupomService.deletar(req.params.id, req.estabelecimentoId!);
    res.status(204).send();
});
