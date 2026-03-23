import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { loginSchema, registerSchema, onboardingSchema, forgotPasswordSchema, resetPasswordSchema } from '../schemas/auth.schema.js';

const router = Router();

/**
 * @route POST /api/auth/login
 * @desc Login de usuário
 * @access Public
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * @route POST /api/auth/register
 * @desc Criar novo usuário admin
 * @access Public (primeiro acesso)
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * @route POST /api/auth/onboarding
 * @desc Cadastro de novo estabelecimento (self-onboarding)
 * @access Public
 */
router.post('/onboarding', validate(onboardingSchema), authController.onboarding);

/**
 * @route POST /api/auth/forgot-password
 * @desc Solicitar recuperação de senha
 * @access Public
 */
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);

/**
 * @route POST /api/auth/reset-password
 * @desc Redefinir senha com token
 * @access Public
 */
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

/**
 * @route GET /api/auth/me
 * @desc Buscar dados do usuário autenticado
 * @access Private
 */
router.get('/me', authMiddleware as any, authController.me as any);

/**
 * @route PUT /api/auth/me/estabelecimento
 * @desc Atualiza definições do estabelecimento do usuário
 * @access Private
 */
router.put('/me/estabelecimento', authMiddleware as any, authController.updateEstabelecimento as any);

export default router;

