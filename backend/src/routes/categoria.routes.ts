import { Router } from 'express';
import * as categoriaController from '../controllers/categoria.controller.js';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
    criarCategoriaSchema,
    atualizarCategoriaSchema,
    buscarCategoriaSchema,
    reordenarCategoriasSchema,
} from '../schemas/categoria.schema.js';

const router = Router();

/**
 * @route GET /api/categorias
 * @desc Listar categorias (filtra por estabelecimento do usuário autenticado)
 * @access Private (usa auth para estabelecimentoId)
 */
router.get('/', authMiddleware, categoriaController.listarCategorias);

/**
 * @route GET /api/categorias/:id
 * @desc Buscar categoria por ID
 * @access Public
 */
router.get('/:id', validate(buscarCategoriaSchema), categoriaController.buscarCategoria);

/**
 * @route POST /api/categorias
 * @desc Criar nova categoria
 * @access Private (Admin)
 */
router.post('/', authMiddleware, adminMiddleware, validate(criarCategoriaSchema), categoriaController.criarCategoria);

/**
 * @route PUT /api/categorias/:id
 * @desc Atualizar categoria
 * @access Private (Admin)
 */
router.put('/:id', authMiddleware, adminMiddleware, validate(atualizarCategoriaSchema), categoriaController.atualizarCategoria);

/**
 * @route DELETE /api/categorias/:id
 * @desc Deletar categoria
 * @access Private (Admin)
 */
router.delete('/:id', authMiddleware, adminMiddleware, validate(buscarCategoriaSchema), categoriaController.deletarCategoria);

/**
 * @route POST /api/categorias/reordenar
 * @desc Reordenar categorias
 * @access Private (Admin)
 */
router.post('/reordenar', authMiddleware, adminMiddleware, validate(reordenarCategoriasSchema), categoriaController.reordenarCategorias);

export default router;
