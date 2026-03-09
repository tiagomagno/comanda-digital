import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireGarcom } from '../middlewares/role.middleware.js';
import * as garcomController from '../controllers/garcom.controller.js';

const router = Router();

// Todas as rotas requerem autenticação e role de garçom (ou admin)
router.use(authMiddleware, requireGarcom);

/**
 * @route GET /api/garcom/comandas
 * @desc Listar comandas ativas (filtros: mesaId, status)
 * @access Private (Garçom)
 */
router.get('/comandas', garcomController.listarComandas);

/**
 * @route GET /api/garcom/comandas/:id
 * @desc Visualizar detalhes de uma comanda
 * @access Private (Garçom)
 */
router.get('/comandas/:id', garcomController.visualizarComanda);

/**
 * @route POST /api/garcom/pedidos/:id/aprovar
 * @desc Aprovar pedido
 * @access Private (Garçom)
 */
router.post('/pedidos/:id/aprovar', garcomController.aprovarPedido);

/**
 * @route POST /api/garcom/pedidos/:id/rejeitar
 * @desc Rejeitar pedido
 * @access Private (Garçom)
 */
router.post('/pedidos/:id/rejeitar', garcomController.rejeitarPedido);

/**
 * @route POST /api/garcom/comandas/:id/pagar
 * @desc Processar pagamento imediato
 * @access Private (Garçom)
 */
router.post('/comandas/:id/pagar', garcomController.processarPagamento);

/**
 * @route POST /api/garcom/comandas/:id/fechar
 * @desc Fechar comanda
 * @access Private (Garçom)
 */
router.post('/comandas/:id/fechar', garcomController.fecharComanda);

/**
 * @route PUT /api/garcom/mesas/:id/capacidade
 * @desc Ajustar capacidade de uma mesa
 * @access Private (Garçom)
 */
router.put('/mesas/:id/capacidade', garcomController.ajustarCapacidadeMesa);

/**
 * @route GET /api/garcom/grupos-mesa
 * @desc Listar grupos de mesas
 * @access Private (Garçom)
 */
router.get('/grupos-mesa', garcomController.listarGruposMesas);

/**
 * @route POST /api/garcom/grupos-mesa
 * @desc Criar grupo de mesas para evento
 * @access Private (Garçom)
 */
router.post('/grupos-mesa', garcomController.criarGrupoMesas);

/**
 * @route PUT /api/garcom/grupos-mesa/:id
 * @desc Atualizar grupo (adicionar/remover mesas)
 * @access Private (Garçom)
 */
router.put('/grupos-mesa/:id', garcomController.atualizarGrupoMesas);

/**
 * @route DELETE /api/garcom/grupos-mesa/:id
 * @desc Desfazer agrupamento
 * @access Private (Garçom)
 */
router.delete('/grupos-mesa/:id', garcomController.desfazerGrupoMesas);

export default router;
