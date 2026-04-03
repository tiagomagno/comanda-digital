import { Router } from 'express';
import { salvarCredenciais, verCredenciais } from '../controllers/gateway.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// Todas as rotas de gateway exigem autenticação do gestor
router.use(authMiddleware);

// Endpoint para visualizar quais gateways estão configurados (com chaves sensíveis mascaradas)
router.get('/meus-gateways', verCredenciais);

// Endpoint para salvar ou atualizar a configuração de um gateway
router.post('/salvar', salvarCredenciais);

export default router;
