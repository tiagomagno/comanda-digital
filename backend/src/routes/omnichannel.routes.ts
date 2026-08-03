import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware.js';
import * as ctrl from '../controllers/omnichannel.controller.js';

const router = Router();

// ─── Admin (autenticado) ──────────────────────────────────────────────────────
router.get('/canais',                         authMiddleware, adminMiddleware, ctrl.listarCanais);
router.post('/canais',                        authMiddleware, adminMiddleware, ctrl.criarCanal);
router.put('/canais/:id',                     authMiddleware, adminMiddleware, ctrl.atualizarCanal);
router.delete('/canais/:id',                  authMiddleware, adminMiddleware, ctrl.deletarCanal);
router.get('/canais/:id/pedidos',             authMiddleware, adminMiddleware, ctrl.listarPedidosExternos);

// ─── Webhook público (recebe pedidos de canais externos) ─────────────────────
// URL: POST /api/omnichannel/webhook/:canalId
router.post('/webhook/:canalId',              ctrl.receberWebhook);

export default router;
