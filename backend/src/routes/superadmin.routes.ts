import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireSuperAdmin } from '../middlewares/role.middleware.js';
import * as superAdminController from '../controllers/superadmin.controller.js';

const router = Router();

// Todas as rotas exigem authMiddleware + superadmin
router.use(authMiddleware, requireSuperAdmin);

/**
 * @route GET /api/superadmin/dashboard
 * @desc Métricas gerais da plataforma
 */
router.get('/dashboard', superAdminController.getDashboard);

/**
 * @route GET /api/superadmin/estabelecimentos
 * @desc Listar todos os estabelecimentos
 */
router.get('/estabelecimentos', superAdminController.listarEstabelecimentos);

/**
 * @route POST /api/superadmin/estabelecimentos
 * @desc Criar novo estabelecimento + admin
 */
router.post('/estabelecimentos', superAdminController.criarEstabelecimento);

/**
 * @route GET /api/superadmin/estabelecimentos/:id
 * @desc Detalhes de um estabelecimento
 */
router.get('/estabelecimentos/:id', superAdminController.getEstabelecimento);

/**
 * @route PUT /api/superadmin/estabelecimentos/:id
 * @desc Atualizar dados do estabelecimento
 */
router.put('/estabelecimentos/:id', superAdminController.atualizarEstabelecimento);

/**
 * @route PATCH /api/superadmin/estabelecimentos/:id/toggle
 * @desc Ativar / Desativar estabelecimento
 */
router.patch('/estabelecimentos/:id/toggle', superAdminController.toggleAtivo);

/**
 * @route GET /api/superadmin/usuarios
 * @desc Listar gestores da plataforma
 */
router.get('/usuarios', superAdminController.listarUsuarios);

/**
 * @route POST /api/superadmin/criar-superadmin
 * @desc Criar novo superadmin
 */
router.post('/criar-superadmin', superAdminController.criarSuperAdmin);

export default router;
