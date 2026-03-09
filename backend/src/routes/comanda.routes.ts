import { Router } from 'express';
import * as comandaController from '../controllers/comanda.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
    criarComandaSchema,
    buscarComandaSchema,
    buscarComandaPorCodigoSchema,
    atualizarStatusComandaSchema,
} from '../schemas/comanda.schema.js';

const router = Router();

/**
 * @route POST /api/comandas
 * @desc Criar nova comanda
 * @access Public
 */
router.post('/', validate(criarComandaSchema), comandaController.criarComanda);

/**
 * @route GET /api/comandas/codigo/:codigo
 * @desc Buscar comanda por código
 * @access Public
 */
router.get('/codigo/:codigo', validate(buscarComandaPorCodigoSchema), comandaController.buscarComandaPorCodigo);

/**
 * @route GET /api/comandas/:id
 * @desc Buscar comanda por ID
 * @access Public
 */
router.get('/:id', validate(buscarComandaSchema), comandaController.buscarComanda);

/**
 * @route GET /api/comandas/:id/pedidos
 * @desc Listar pedidos da comanda
 * @access Public
 */
router.get('/:id/pedidos', validate(buscarComandaSchema), comandaController.listarPedidosComanda);

/**
 * @route GET /api/comandas
 * @desc Listar comandas ativas
 * @access Public
 */
router.get('/', comandaController.listarComandasAtivas);

/**
 * @route PATCH /api/comandas/:id/status
 * @desc Atualizar status da comanda
 * @access Public
 */
router.patch('/:id/status', validate(atualizarStatusComandaSchema), comandaController.atualizarStatusComanda);

export default router;
