import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireCozinha } from '../middlewares/role.middleware.js';
import * as cozinhaController from '../controllers/cozinha.controller.js';

const router = Router();

// Todas as rotas requerem autenticação e role de cozinha/bar (ou admin)
router.use(authMiddleware, requireCozinha);

/**
 * @route GET /api/cozinha/pedidos
 * @desc Listar pedidos em formato Kanban (filtros: destino, status)
 * @access Private (Cozinha/Bar)
 */
router.get('/pedidos', cozinhaController.listarPedidos);

/**
 * @route PUT /api/cozinha/pedidos/:id/status
 * @desc Atualizar status do pedido (em_preparo, pronto, entregue)
 * @access Private (Cozinha/Bar)
 */
router.put('/pedidos/:id/status', cozinhaController.atualizarStatusPedido);

/**
 * @route GET /api/cozinha/estatisticas
 * @desc Obter estatísticas da cozinha
 * @access Private (Cozinha/Bar)
 */
router.get('/estatisticas', cozinhaController.obterEstatisticas);

export default router;
