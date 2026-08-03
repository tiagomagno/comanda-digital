import { Router } from 'express';
import * as transacaoController from '../controllers/transacao.controller.js';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

/** GET  /api/transacoes/:comandaId  — listar transações de uma comanda (admin) */
router.get('/:comandaId', authMiddleware, transacaoController.listarPorComanda);

/** POST /api/transacoes             — criar transação (admin) */
router.post('/', authMiddleware, adminMiddleware, transacaoController.criar);

/** PATCH /api/transacoes/:id/status — atualizar status (admin) */
router.patch('/:id/status', authMiddleware, adminMiddleware, transacaoController.atualizarStatus);

/** POST /api/transacoes/webhook/:provedor — webhook de gateway (público) */
router.post('/webhook/:provedor', transacaoController.webhook);

export default router;
