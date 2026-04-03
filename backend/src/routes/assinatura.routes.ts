import { Router } from 'express';
import { getPlanos, statusAssinatura, assinarPlano, webhookStripe } from '../controllers/assinatura.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
// É importante usar express.raw para webhooks onde a assinatura precisa do corpo exato do buffer
import express from 'express';

const router = Router();

// Endpoint público para listar planos na landing page ou dashboard
router.get('/planos', getPlanos);

// Endpoint público/webhook do Stripe (Não usa authMiddleware)
// Usamos o express.raw antes para que o req.body não seja parseado como JSON pelo body-parser padrão
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), webhookStripe);

// ---- Rotas Protegidas ----
router.use(authMiddleware);

// Retorna status atual da assinatura do estabelecimento do gestor logado
router.get('/meustatus', statusAssinatura);

// Inicia sessão de checkout
router.post('/assinar', assinarPlano);

export default router;
