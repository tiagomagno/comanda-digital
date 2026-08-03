import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware.js';
import * as ctrl from '../controllers/automacao.controller.js';

const router = Router();
router.use(authMiddleware, adminMiddleware);

router.get('/',                    ctrl.listar);
router.post('/',                   ctrl.criar);
router.put('/:id',                 ctrl.atualizar);
router.delete('/:id',              ctrl.deletar);
router.post('/processar',          ctrl.processar);
router.get('/:id/historico',       ctrl.historico);

export default router;
