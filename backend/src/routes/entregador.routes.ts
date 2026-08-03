import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware.js';
import { requireEntregador } from '../middlewares/role.middleware.js';
import * as ctrl from '../controllers/entregador.controller.js';

const router = Router();

// ─── Admin (requer auth + admin) ─────────────────────────────────────────────

router.get('/entregadores',               authMiddleware, adminMiddleware, ctrl.listarEntregadores);
router.get('/entregadores/:id/localizacao', authMiddleware, adminMiddleware, ctrl.ultimaLocalizacao);

router.post('/corridas',                  authMiddleware, adminMiddleware, ctrl.criarCorrida);
router.get('/corridas',                   authMiddleware, adminMiddleware, ctrl.listarCorridas);
router.patch('/corridas/:id/status',      authMiddleware, adminMiddleware, ctrl.atualizarStatusCorridaAdmin);

// ─── Entregador (requer auth + entregador/admin) ──────────────────────────────

router.patch('/meu-status',               authMiddleware, requireEntregador, ctrl.atualizarMeuStatus);
router.get('/minhas-corridas',            authMiddleware, requireEntregador, ctrl.minhasCorridas);
router.patch('/corridas/:id/acao',        authMiddleware, requireEntregador, ctrl.atualizarStatusCorrida);
router.post('/localizacao',               authMiddleware, requireEntregador, ctrl.atualizarLocalizacao);

export default router;
