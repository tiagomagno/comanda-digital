import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireGestor } from '../middlewares/role.middleware.js';
import * as caixaController from '../controllers/caixa.controller.js';

const router = Router();

// Todas as rotas requerem autenticação e role de admin (por enquanto)
// Futuramente pode ter role específico de caixa
router.use(authMiddleware, requireGestor);

/**
 * @route GET /api/caixa/comandas
 * @desc Listar comandas aguardando pagamento final
 * @access Private (Caixa/Admin)
 */
router.get('/comandas', caixaController.listarComandasPendentes);

/**
 * @route POST /api/caixa/comandas/:id/pagar
 * @desc Processar pagamento final
 * @access Private (Caixa/Admin)
 */
router.post('/comandas/:id/pagar', caixaController.processarPagamentoFinal);

/**
 * @route POST /api/caixa/comandas/:id/fechar
 * @desc Fechar comanda (após pagamento)
 * @access Private (Caixa/Admin)
 */
router.post('/comandas/:id/fechar', caixaController.fecharComanda);

/**
 * @route GET /api/caixa/relatorio
 * @desc Relatório de vendas (filtros: dataInicio, dataFim)
 * @access Private (Caixa/Admin)
 */
router.get('/relatorio', caixaController.relatorioVendas);

export default router;
