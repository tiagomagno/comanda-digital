import { Response } from 'express';
import { AuthRequest } from '../types/express.js';
import { authService } from '../services/auth.service.js';
import { asyncHandler } from '../middlewares/error.middleware.js';

/**
 * Login de usuário (admin, garçom, bar, cozinha)
 */
export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
    const resultado = await authService.login(req.body);
    res.json(resultado);
});

/**
 * Criar usuário admin (primeiro acesso)
 */
export const register = asyncHandler(async (req: AuthRequest, res: Response) => {
    const resultado = await authService.register(req.body);
    res.status(201).json(resultado);
});

/**
 * Verificar token (buscar usuário atual)
 */
export const me = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) throw new Error('Usuário não autenticado');
    const usuario = await authService.buscarUsuarioAtual(req.userId);
    res.json(usuario);
});

/**
 * Onboarding de novo estabelecimento (self-cadastro)
 */
export const onboarding = asyncHandler(async (req: AuthRequest, res: Response) => {
    const resultado = await authService.onboarding(req.body);
    res.status(201).json(resultado);
});

/**
 * Solicitar recuperação de senha
 */
export const forgotPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { email } = req.body;
    const resultado = await authService.forgotPassword(email);
    res.json(resultado);
});

/**
 * Redefinir senha com token
 */
export const resetPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { token, novaSenha } = req.body;
    const resultado = await authService.resetPassword(token, novaSenha);
    res.json(resultado);
});

/**
 * Atualizar configuração do logado (estabelecimento + usuário)
 */
export const updateEstabelecimento = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.userId;
    if (!userId) throw new Error('Usuário não autenticado');
    const resultado = await authService.atualizarEstabelecimento(userId, req.body);
    res.json(resultado);
});

/**
 * Criar Pré-Cadastro (Lead da Landing Page)
 */
export const preCadastro = asyncHandler(async (req: AuthRequest, res: Response) => {
    const resultado = await authService.preCadastro(req.body);
    res.status(201).json(resultado);
});

/**
 * Buscar Cadastro pré-criado pelo Token
 */
export const buscarLead = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { token } = req.params;
    const resultado = await authService.buscarLeadPorToken(token);
    res.json(resultado);
});
