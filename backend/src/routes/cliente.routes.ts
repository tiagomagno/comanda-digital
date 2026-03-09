import { Router } from 'express';
import * as clienteController from '../controllers/cliente.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
    escanearQRCodeSchema,
    criarComandaClienteSchema,
    visualizarCardapioSchema,
    criarPedidoClienteSchema,
    visualizarComandaSchema,
} from '../schemas/cliente.schema.js';

const router = Router();

// Rotas públicas (sem autenticação obrigatória)

/**
 * @route GET /api/cliente/mesa/:estabelecimentoId/:mesaId
 * @desc Escanear QR Code da mesa
 * @access Public
 */
router.get('/mesa/:estabelecimentoId/:mesaId', validate(escanearQRCodeSchema), clienteController.escanearQRCode);

/**
 * @route POST /api/cliente/comandas
 * @desc Criar nova comanda
 * @access Public
 */
router.post('/comandas', validate(criarComandaClienteSchema), clienteController.criarComanda);

/**
 * @route GET /api/cliente/cardapio/:estabelecimentoId
 * @desc Visualizar cardápio do estabelecimento
 * @access Public
 */
router.get('/cardapio/:estabelecimentoId', validate(visualizarCardapioSchema), clienteController.visualizarCardapio);

/**
 * @route POST /api/cliente/pedidos
 * @desc Criar pedido
 * @access Public
 */
router.post('/pedidos', validate(criarPedidoClienteSchema), clienteController.criarPedido);

/**
 * @route GET /api/cliente/comandas/:codigo
 * @desc Visualizar comanda pelo código
 * @access Public
 */
router.get('/comandas/:codigo', validate(visualizarComandaSchema), clienteController.visualizarComanda);

export default router;
