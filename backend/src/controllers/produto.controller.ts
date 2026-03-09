import { Response } from 'express';
import { AuthRequest } from '../types/express.js';
import { produtoService } from '../services/produto.service.js';
import { asyncHandler } from '../middlewares/error.middleware.js';

/**
 * Listar todos os produtos
 */
export const listarProdutos = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { categoriaId, disponivel, estabelecimentoId: qEstab } = req.query;
    const estabelecimentoId = (req.estabelecimentoId || (typeof qEstab === 'string' ? qEstab : undefined)) as string | undefined;

    const filtros: { estabelecimentoId?: string; categoriaId?: string; disponivel?: boolean } = {
        estabelecimentoId,
    };
    if (categoriaId && typeof categoriaId === 'string') {
        filtros.categoriaId = categoriaId;
    }
    if (disponivel !== undefined) {
        filtros.disponivel = disponivel === 'true';
    }

    const produtos = await produtoService.listar(filtros);
    res.json(produtos);
});

/**
 * Buscar produto por ID
 */
export const buscarProduto = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const produto = await produtoService.buscarPorId(id);
    res.json(produto);
});

/**
 * Criar novo produto
 */
export const criarProduto = asyncHandler(async (req: AuthRequest, res: Response) => {
    const produto = await produtoService.criar(req.body);
    res.status(201).json(produto);
});

/**
 * Atualizar produto
 */
export const atualizarProduto = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const produto = await produtoService.atualizar(id, req.body);
    res.json(produto);
});

/**
 * Deletar produto
 */
export const deletarProduto = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const resultado = await produtoService.deletar(id);
    res.json(resultado);
});

/**
 * Toggle disponibilidade do produto
 */
export const toggleDisponibilidade = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const produto = await produtoService.toggleDisponibilidade(id);
    res.json(produto);
});

/**
 * Buscar cardápio completo (público)
 */
export const buscarCardapio = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { estabelecimentoId } = req.query;

    if (!estabelecimentoId || typeof estabelecimentoId !== 'string') {
        res.status(400).json({
            error: 'estabelecimentoId é obrigatório',
        });
        return;
    }

    const categorias = await produtoService.buscarCardapio(estabelecimentoId);
    res.json(categorias);
});
