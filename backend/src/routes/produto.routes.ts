import { Router } from 'express';
import * as produtoController from '../controllers/produto.controller.js';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
    criarProdutoSchema,
    atualizarProdutoSchema,
    buscarProdutoSchema,
    toggleDisponibilidadeSchema,
} from '../schemas/produto.schema.js';

const router = Router();

/**
 * @route GET /api/produtos
 * @desc Listar produtos
 * @access Private
 */
router.get('/', authMiddleware, produtoController.listarProdutos);

/**
 * @route GET /api/produtos/:id
 * @desc Buscar produto por ID
 * @access Public
 */
router.get('/:id', validate(buscarProdutoSchema), produtoController.buscarProduto);

/**
 * @route POST /api/produtos
 * @desc Criar novo produto
 * @access Private (Admin)
 */
router.post('/', authMiddleware, adminMiddleware, validate(criarProdutoSchema), produtoController.criarProduto);

/**
 * @route PUT /api/produtos/:id
 * @desc Atualizar produto
 * @access Private (Admin)
 */
router.put('/:id', authMiddleware, adminMiddleware, validate(atualizarProdutoSchema), produtoController.atualizarProduto);

/**
 * @route DELETE /api/produtos/:id
 * @desc Deletar produto
 * @access Private (Admin)
 */
router.delete('/:id', authMiddleware, adminMiddleware, validate(buscarProdutoSchema), produtoController.deletarProduto);

/**
 * @route PATCH /api/produtos/:id
 * @desc Atualizar parcialmente produto (sem auth para testes)
 * @access Public (temporário)
 */
router.patch('/:id', validate(atualizarProdutoSchema), produtoController.atualizarProduto);

/**
 * @route PATCH /api/produtos/:id/disponibilidade
 * @desc Toggle disponibilidade do produto
 * @access Private (Admin)
 */
router.patch('/:id/disponibilidade', authMiddleware, adminMiddleware, validate(toggleDisponibilidadeSchema), produtoController.toggleDisponibilidade);

export default router;
