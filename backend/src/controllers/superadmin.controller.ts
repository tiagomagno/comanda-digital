import { Response } from 'express';
import { AuthRequest } from '../types/express.js';
import { superAdminService } from '../services/superadmin.service.js';
import { asyncHandler } from '../middlewares/error.middleware.js';

/**
 * GET /api/superadmin/dashboard
 * Métricas gerais da plataforma
 */
export const getDashboard = asyncHandler(async (_req: AuthRequest, res: Response) => {
    const dados = await superAdminService.getDashboard();
    res.json(dados);
});

/**
 * GET /api/superadmin/estabelecimentos
 * Lista todos com filtros e paginação
 */
export const listarEstabelecimentos = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { page, limit, busca, ativo, operaLocal, operaDelivery, operaHospedado } = req.query;

    const dados = await superAdminService.listarEstabelecimentos({
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
        busca: busca as string | undefined,
        ativo: ativo !== undefined ? ativo === 'true' : undefined,
        operaLocal: operaLocal !== undefined ? operaLocal === 'true' : undefined,
        operaDelivery: operaDelivery !== undefined ? operaDelivery === 'true' : undefined,
        operaHospedado: operaHospedado !== undefined ? operaHospedado === 'true' : undefined,
    });

    res.json(dados);
});

/**
 * GET /api/superadmin/estabelecimentos/:id
 * Detalhes de um estabelecimento
 */
export const getEstabelecimento = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const dados = await superAdminService.getEstabelecimento(id);
    res.json(dados);
});

/**
 * POST /api/superadmin/estabelecimentos
 * Criar novo estabelecimento + admin
 */
export const criarEstabelecimento = asyncHandler(async (req: AuthRequest, res: Response) => {
    const dados = await superAdminService.criarEstabelecimento(req.body);
    res.status(201).json(dados);
});

/**
 * PUT /api/superadmin/estabelecimentos/:id
 * Atualizar dados do estabelecimento
 */
export const atualizarEstabelecimento = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const dados = await superAdminService.atualizarEstabelecimento(id, req.body);
    res.json(dados);
});

/**
 * PATCH /api/superadmin/estabelecimentos/:id/toggle
 * Ativar / Desativar estabelecimento
 */
export const toggleAtivo = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const resultado = await superAdminService.toggleAtivo(id);
    res.json(resultado);
});

/**
 * GET /api/superadmin/usuarios
 * Lista todos os gestores (admin) da plataforma
 */
export const listarUsuarios = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { page, limit, busca } = req.query;
    const dados = await superAdminService.listarUsuarios({
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
        busca: busca as string | undefined,
    });
    res.json(dados);
});

/**
 * POST /api/superadmin/criar-superadmin
 * Criar novo usuário superadmin (apenas pelo superadmin em si)
 */
export const criarSuperAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
    const dados = await superAdminService.criarSuperAdmin(req.body);
    res.status(201).json(dados);
});
