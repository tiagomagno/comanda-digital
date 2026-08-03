import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware.js';
import * as ctrl from '../controllers/crm.controller.js';

const router = Router();
router.use(authMiddleware, adminMiddleware);

router.get('/clientes',    ctrl.listarClientes);
router.get('/resumo',      ctrl.resumo);
router.post('/campanha',   ctrl.criarCampanha);

export default router;
