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

import * as dashboardController from '../controllers/dashboard.controller.js';
import { AvaliacaoController } from '../controllers/avaliacao.controller.js';
import { RecepcaoController } from '../controllers/recepcao.controller.js';

const avaliacaoController = new AvaliacaoController();
const recepcaoController = new RecepcaoController();

const router = Router();

// Todas as rotas requerem autenticação e role de gestor (admin)
router.use(authMiddleware, requireGestor);

/**
 * @route GET /api/gestor/dashboard
 * @desc Métricas de Dashboard
 * @access Private (Gestor)
 */
router.get('/dashboard', dashboardController.getDashboardStats);
router.get('/analytics', dashboardController.getAnalytics);

/**
 * @route GET /api/gestor/avaliacoes
 * @desc Listar todas as avaliações
 * @access Private (Gestor)
 */
router.get('/avaliacoes', avaliacaoController.listarGestor);

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

// -------------------------------------------------------------
// RECEPÇÃO (Fila de Espera)
// -------------------------------------------------------------

router.post('/recepcao/fila', recepcaoController.adicionarFila);
router.get('/recepcao/fila', recepcaoController.listarFila);
router.patch('/recepcao/fila/:id/status', recepcaoController.atualizarStatusFila);
router.delete('/recepcao/fila/:id', recepcaoController.removerFila);

// -------------------------------------------------------------
// RECEPÇÃO (Reservas)
// -------------------------------------------------------------

router.post('/recepcao/reservas', recepcaoController.criarReserva);
router.get('/recepcao/reservas', recepcaoController.listarReservas);
router.patch('/recepcao/reservas/:id/status', recepcaoController.atualizarStatusReserva);
router.delete('/recepcao/reservas/:id', recepcaoController.removerReserva);

export default router;
