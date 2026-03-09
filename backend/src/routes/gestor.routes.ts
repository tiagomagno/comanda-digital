import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireGestor } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import * as mesaController from '../controllers/mesa.controller.js';
import {
    criarMesaSchema,
    atualizarMesaSchema,
    buscarMesaSchema,
    regenerarQRCodeSchema,
} from '../schemas/mesa.schema.js';

const router = Router();

// Todas as rotas requerem autenticação e role de gestor (admin)
router.use(authMiddleware, requireGestor);

/**
 * @route GET /api/gestor/mesas
 * @desc Listar todas as mesas do estabelecimento
 * @access Private (Gestor)
 */
router.get('/mesas', mesaController.listarMesas);

/**
 * @route POST /api/gestor/mesas
 * @desc Criar nova mesa (gera QR Code automaticamente)
 * @access Private (Gestor)
 */
router.post('/mesas', validate(criarMesaSchema), mesaController.criarMesa);

/**
 * @route PUT /api/gestor/mesas/:id
 * @desc Atualizar mesa
 * @access Private (Gestor)
 */
router.put('/mesas/:id', validate(atualizarMesaSchema), mesaController.atualizarMesa);

/**
 * @route DELETE /api/gestor/mesas/:id
 * @desc Deletar mesa (soft delete)
 * @access Private (Gestor)
 */
router.delete('/mesas/:id', validate(buscarMesaSchema), mesaController.deletarMesa);

/**
 * @route POST /api/gestor/mesas/:id/regenerate-qr
 * @desc Regenerar QR Code da mesa
 * @access Private (Gestor)
 */
router.post('/mesas/:id/regenerate-qr', validate(regenerarQRCodeSchema), mesaController.regenerarQRCode);

/**
 * @route GET /api/gestor/mesas/:id/qrcode
 * @desc Download do QR Code da mesa (PNG)
 * @access Private (Gestor)
 */
router.get('/mesas/:id/qrcode', validate(buscarMesaSchema), mesaController.downloadQRCode);

export default router;
