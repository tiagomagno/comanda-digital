import { Router } from 'express';
import * as preparoController from '../controllers/preparo.controller.js';
import { authMiddleware, preparoMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @route GET /api/preparo/pedidos
 * @desc Listar pedidos pendentes para preparo
 * @access Private (Bar/Cozinha)
 */
router.get('/pedidos', authMiddleware, preparoMiddleware, preparoController.listarPedidosPendentes);

/**
 * @route POST /api/preparo/pedidos/:id/iniciar
 * @desc Iniciar preparo do pedido
 * @access Private (Bar/Cozinha)
 */
router.post('/pedidos/:id/iniciar', authMiddleware, preparoMiddleware, preparoController.iniciarPreparo);

/**
 * @route POST /api/preparo/pedidos/:id/pronto
 * @desc Marcar pedido como pronto
 * @access Private (Bar/Cozinha)
 */
router.post('/pedidos/:id/pronto', authMiddleware, preparoMiddleware, preparoController.marcarPronto);

/**
 * @route GET /api/preparo/estatisticas
 * @desc Buscar estatísticas do preparo
 * @access Private (Bar/Cozinha)
 */
router.get('/estatisticas', authMiddleware, preparoMiddleware, preparoController.buscarEstatisticas);

export default router;
