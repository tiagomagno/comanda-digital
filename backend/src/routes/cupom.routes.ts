import { Router } from 'express';
import * as cupomController from '../controllers/cupom.controller.js';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

/** POST /api/cupons/validar — público (cliente Dine Go) */
router.post('/validar', cupomController.validarCupom);

/** GET  /api/cupons        — admin */
router.get('/', authMiddleware, cupomController.listarCupons);

/** POST /api/cupons        — admin */
router.post('/', authMiddleware, adminMiddleware, cupomController.criarCupom);

/** PUT  /api/cupons/:id    — admin */
router.put('/:id', authMiddleware, adminMiddleware, cupomController.atualizarCupom);

/** DELETE /api/cupons/:id  — admin */
router.delete('/:id', authMiddleware, adminMiddleware, cupomController.deletarCupom);

export default router;
