import { Router } from 'express';
import * as pedidoController from '../controllers/pedido.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
    criarPedidoSchema,
    buscarPedidoSchema,
    atualizarStatusPedidoSchema,
} from '../schemas/pedido.schema.js';

const router = Router();

/**
 * @route POST /api/pedidos
 * @desc Criar novo pedido
 * @access Public
 */
router.post('/', validate(criarPedidoSchema), pedidoController.criarPedido);

/**
 * @route GET /api/pedidos/:id
 * @desc Buscar pedido por ID
 * @access Public
 */
router.get('/:id', validate(buscarPedidoSchema), pedidoController.buscarPedido);

/**
 * @route PATCH /api/pedidos/:id/status
 * @desc Atualizar status do pedido
 * @access Private
 */
router.patch('/:id/status', authMiddleware, validate(atualizarStatusPedidoSchema), pedidoController.atualizarStatusPedido);

/**
 * @route DELETE /api/pedidos/:id
 * @desc Cancelar pedido
 * @access Private
 */
router.delete('/:id', authMiddleware, validate(buscarPedidoSchema), pedidoController.cancelarPedido);

export default router;
