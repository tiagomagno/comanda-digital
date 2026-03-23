import { Router } from 'express';
import * as clienteController from '../controllers/cliente.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
    escanearQRCodeSchema,
    criarComandaClienteSchema,
    visualizarCardapioSchema,
    criarPedidoClienteSchema,
    visualizarComandaSchema,
    registrarClienteSchema,
    loginClienteDeliverySchema,
    criarEnderecoClienteSchema,
    iniciarPedidoDeliverySchema,
    buscarClienteSchema,
    listarEnderecosClienteSchema,
} from '../schemas/cliente.schema.js';

const router = Router();

// ===== Rotas de Mesa / Local (bares, restaurantes, hotelaria) =====

/**
 * @route GET /api/cliente/mesa/:estabelecimentoId/:mesaId
 * @desc Escanear QR Code e verificar comanda ativa
 */
router.get('/mesa/:estabelecimentoId/:mesaId', validate(escanearQRCodeSchema), clienteController.escanearQRCode);

/**
 * @route POST /api/cliente/comandas
 * @desc Criar nova comanda (mesa/individual)
 */
router.post('/comandas', validate(criarComandaClienteSchema), clienteController.criarComanda);

/**
 * @route GET /api/cliente/cardapio/:estabelecimentoId
 * @desc Visualizar cardápio do estabelecimento
 */
router.get('/cardapio/:estabelecimentoId', validate(visualizarCardapioSchema), clienteController.visualizarCardapio);

/**
 * @route POST /api/cliente/pedidos
 * @desc Criar pedido via comanda existente
 */
router.post('/pedidos', validate(criarPedidoClienteSchema), clienteController.criarPedido);

/**
 * @route GET /api/cliente/comandas/:codigo
 * @desc Visualizar status da comanda
 */
router.get('/comandas/:codigo', validate(visualizarComandaSchema), clienteController.visualizarComanda);

// ===== Rotas de Delivery (clientes da rua - checkout online) =====

/**
 * @route POST /api/cliente/delivery/registrar
 * @desc Identificar ou registrar cliente por telefone
 */
router.post('/delivery/registrar', validate(registrarClienteSchema), clienteController.registrarCliente);

/**
 * @route POST /api/cliente/delivery/login
 * @desc Login do cliente delivery pelo telefone
 */
router.post('/delivery/login', validate(loginClienteDeliverySchema), clienteController.loginCliente);

/**
 * @route GET /api/cliente/delivery/:id
 * @desc Buscar dados do cliente
 */
router.get('/delivery/:id', validate(buscarClienteSchema), clienteController.buscarCliente);

/**
 * @route GET /api/cliente/delivery/:clienteId/enderecos
 * @desc Listar endereços salvos do cliente
 */
router.get('/delivery/:clienteId/enderecos', validate(listarEnderecosClienteSchema), clienteController.listarEnderecos);

/**
 * @route POST /api/cliente/delivery/enderecos
 * @desc Adicionar endereço ao cliente
 */
router.post('/delivery/enderecos', validate(criarEnderecoClienteSchema), clienteController.adicionarEndereco);

/**
 * @route POST /api/cliente/delivery/pedido
 * @desc [FLUXO PRINCIPAL] Criar pedido delivery completo (identifica cliente + endereço + comanda + pedido)
 */
router.post('/delivery/pedido', validate(iniciarPedidoDeliverySchema), clienteController.iniciarPedidoDelivery);

export default router;
