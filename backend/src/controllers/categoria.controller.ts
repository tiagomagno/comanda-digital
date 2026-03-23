import { Response } from 'express';
import { AuthRequest } from '../types/express.js';
import { categoriaService } from '../services/categoria.service.js';
import { asyncHandler } from '../middlewares/error.middleware.js';

/**
 * Listar todas as categorias
 */
export const listarCategorias = asyncHandler(async (req: AuthRequest, res: Response) => {
    const estabelecimentoId = req.estabelecimentoId
        || (typeof req.query.estabelecimentoId === 'string' ? req.query.estabelecimentoId : undefined);

    const categorias = await categoriaService.listar(estabelecimentoId);
    res.json(categorias);
});

/**
 * Buscar categoria por ID
 */
export const buscarCategoria = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const categoria = await categoriaService.buscarPorId(id);
    res.json(categoria);
});

/**
 * Criar nova categoria
 */
export const criarCategoria = asyncHandler(async (req: AuthRequest, res: Response) => {
    const body = { ...req.body };
    if (!body.estabelecimentoId && req.estabelecimentoId) {
        body.estabelecimentoId = req.estabelecimentoId;
    }
    const categoria = await categoriaService.criar(body);
    res.status(201).json(categoria);
});

/**
 * Atualizar categoria
 */
export const atualizarCategoria = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const categoria = await categoriaService.atualizar(id, req.body);
    res.json(categoria);
});

/**
 * Deletar categoria (soft delete)
 */
export const deletarCategoria = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const categoria = await categoriaService.deletar(id);
    res.json(categoria);
});

/**
 * Reordenar categorias
 */
export const reordenarCategorias = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { categorias } = req.body;
    const resultado = await categoriaService.reordenar(categorias);
    res.json(resultado);
});
