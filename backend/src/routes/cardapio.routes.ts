import { Router } from 'express';
import * as produtoController from '../controllers/produto.controller.js';
import prisma from '../config/database.js';
import { asyncHandler } from '../middlewares/error.middleware.js';

const router = Router();

/**
 * @route GET /api/cardapio/estabelecimentos
 * @desc Listar estabelecimentos ativos (público) - para montar links do cardápio
 * @access Public
 */
router.get('/estabelecimentos', asyncHandler(async (_req, res) => {
    const estabelecimentos = await prisma.estabelecimento.findMany({
        where: { ativo: true },
        select: { id: true, nome: true },
        orderBy: { nome: 'asc' },
    });
    res.json(estabelecimentos);
}));

/**
 * @route GET /api/cardapio/estabelecimento/:id
 * @desc Detalhes públicos de um estabelecimento
 * @access Public
 */
router.get('/estabelecimento/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const estab = await prisma.estabelecimento.findUnique({
        where: { id, ativo: true },
        select: { id: true, nome: true, configuracoes: true },
    });

    if (!estab) {
        res.status(404).json({ error: 'Estabelecimento não encontrado' });
        return;
    }

    res.json(estab);
}));

/**
 * @route GET /api/cardapio
 * @desc Buscar cardápio completo por estabelecimento (público)
 * @access Public
 */
router.get('/', produtoController.buscarCardapio);

export default router;
