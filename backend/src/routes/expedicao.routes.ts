import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireGestor } from '../middlewares/role.middleware.js';
import * as expedicaoController from '../controllers/expedicao.controller.js';

const router = Router();

router.use(authMiddleware, requireGestor);

/** GET /api/expedicao/pedidos — Kanban da expedição */
router.get('/pedidos', expedicaoController.listarPedidos);

/** PUT /api/expedicao/pedidos/:id/status — Transicionar status */
router.put('/pedidos/:id/status', expedicaoController.atualizarStatus);

export default router;
