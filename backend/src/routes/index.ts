import { Router } from 'express';
import authRoutes from './auth.routes.js';
import comandaRoutes from './comanda.routes.js';
import pedidoRoutes from './pedido.routes.js';
import categoriaRoutes from './categoria.routes.js';
import produtoRoutes from './produto.routes.js';
import preparoRoutes from './preparo.routes.js';
import cardapioRoutes from './cardapio.routes.js';
import gestorRoutes from './gestor.routes.js';
import garcomRoutes from './garcom.routes.js';
import cozinhaRoutes from './cozinha.routes.js';
import caixaRoutes from './caixa.routes.js';
import clienteRoutes from './cliente.routes.js';
import importarRoutes from './importar.routes.js';
import uploadRoutes from './upload.routes.js';
import superAdminRoutes from './superadmin.routes.js';
import assinaturaRoutes from './assinatura.routes.js';
import gatewayRoutes from './gateway.routes.js';
import prisma from '../config/database.js';
import bcrypt from 'bcryptjs';

const router = Router();

// Rotas de autenticação
router.use('/auth', authRoutes);

// Rotas do Gestor (protegidas)
router.use('/gestor', gestorRoutes);

// Rotas do Garçom (protegidas)
router.use('/garcom', garcomRoutes);

// Rotas da Cozinha (protegidas)
router.use('/cozinha', cozinhaRoutes);

// Rotas do Caixa (protegidas)
router.use('/caixa', caixaRoutes);

// Rotas do Cliente (públicas)
router.use('/cliente', clienteRoutes);

// Rotas de comandas
router.use('/comandas', comandaRoutes);

// Rotas de pedidos
router.use('/pedidos', pedidoRoutes);

// Rotas de categorias
router.use('/categorias', categoriaRoutes);

// Rotas de produtos
router.use('/produtos', produtoRoutes);

// Rota de cardápio (público)
router.use('/cardapio', cardapioRoutes);

// Rotas de preparo (bar/cozinha)
router.use('/preparo', preparoRoutes);

// Rotas de importação (admin)
router.use('/importar', importarRoutes);

// Rotas de upload (protegidas)
router.use('/upload', uploadRoutes);

// Rotas do Super Admin (plataforma)
router.use('/superadmin', superAdminRoutes);

// Rotas de Assinatura (SaaS)
router.use('/assinaturas', assinaturaRoutes);

// Rotas do Gateway BYOG
router.use('/gateways', gatewayRoutes);

import { logger } from '../utils/logger.js';
import { asyncHandler } from '../middlewares/error.middleware.js';

// Rota de teste
router.get('/ping', (_req, res) => {
    res.json({ message: 'pong' });
});

router.post('/seed-personas', asyncHandler(async (_req, res) => {
    logger.info('🌱 Seeding Personas via API...');
    const senhaHash = await bcrypt.hash('123456', 10);

    // Helper to find or create establishment
    const getOrCreateEstab = async (data: { nome: string; cnpj: string; email: string; ativo: boolean; configuracoes: object }) => {
        const existing = await prisma.estabelecimento.findFirst({ where: { cnpj: data.cnpj } });
        if (existing) return existing;
        return await prisma.estabelecimento.create({ data });
    };

    // --- PERSONA 1: Carlos (Bar) ---
    const estab1 = await getOrCreateEstab({
        nome: 'Bar do Carlos', cnpj: '11.111.111/0001-11', email: 'carlos@bar.com', ativo: true, configuracoes: {}
    });

    const user1 = await prisma.usuario.findUnique({ where: { email: 'carlos@bar.com' } });
    if (!user1) {
        await prisma.usuario.create({
            data: { estabelecimento: { connect: { id: estab1.id } }, nome: 'Carlos Almeida', email: 'carlos@bar.com', senhaHash, tipo: 'admin' }
        });
    }

    // Categories & Products 1
    // (Using upsert for cats is fine as long as we have IDs)
    const catBeb1 = await prisma.categoria.upsert({ where: { estabelecimentoId_nome: { estabelecimentoId: estab1.id, nome: 'Bebidas' } }, update: {}, create: { estabelecimentoId: estab1.id, nome: 'Bebidas', destino: 'BAR', cor: '#EF4444' } });
    const catPet1 = await prisma.categoria.upsert({ where: { estabelecimentoId_nome: { estabelecimentoId: estab1.id, nome: 'Petiscos' } }, update: {}, create: { estabelecimentoId: estab1.id, nome: 'Petiscos', destino: 'COZINHA', cor: '#F59E0B' } });

    // Products - just create and ignore if duplicates (or count first?)
    // Let's just create. Duplicates are allowed by schema (no unique code/name constraint enforced in schema other than PK)
    await prisma.produto.createMany({
        data: [
            { categoriaId: catBeb1.id, nome: 'IPA', preco: 18 },
            { categoriaId: catBeb1.id, nome: 'Caipirinha', preco: 22 },
            { categoriaId: catPet1.id, nome: 'Bolinho', preco: 32 },
            { categoriaId: catPet1.id, nome: 'Batata', preco: 28 },
            { categoriaId: catPet1.id, nome: 'Frios', preco: 45 },
        ]
    });


    // --- PERSONA 2: Mariana (Restaurante) ---
    const estab2 = await getOrCreateEstab({
        nome: 'Restaurante Sabor', cnpj: '22.222.222/0001-22', email: 'mariana@rest.com', ativo: true, configuracoes: {}
    });

    const user2 = await prisma.usuario.findUnique({ where: { email: 'mariana@rest.com' } });
    if (!user2) {
        await prisma.usuario.create({
            data: { estabelecimento: { connect: { id: estab2.id } }, nome: 'Mariana Lopes', email: 'mariana@rest.com', senhaHash, tipo: 'admin' }
        });
    }

    const catPra2 = await prisma.categoria.upsert({ where: { estabelecimentoId_nome: { estabelecimentoId: estab2.id, nome: 'Pratos' } }, update: {}, create: { estabelecimentoId: estab2.id, nome: 'Pratos', destino: 'COZINHA', cor: '#10B981' } });
    const catBeb2 = await prisma.categoria.upsert({ where: { estabelecimentoId_nome: { estabelecimentoId: estab2.id, nome: 'Bebidas' } }, update: {}, create: { estabelecimentoId: estab2.id, nome: 'Bebidas', destino: 'BAR', cor: '#3B82F6' } });

    await prisma.produto.createMany({
        data: [
            { categoriaId: catPra2.id, nome: 'Parmegiana', preco: 48 },
            { categoriaId: catPra2.id, nome: 'Risoto', preco: 52 },
            { categoriaId: catPra2.id, nome: 'Salada', preco: 35 },
            { categoriaId: catBeb2.id, nome: 'Suco', preco: 12 },
            { categoriaId: catBeb2.id, nome: 'Refri', preco: 6 },
        ]
    });


    // --- PERSONA 3: Ricardo (Misto) ---
    const estab3 = await getOrCreateEstab({
        nome: 'Mix Gastrobar', cnpj: '33.333.333/0001-33', email: 'ricardo@mix.com', ativo: true, configuracoes: {}
    });

    const user3 = await prisma.usuario.findUnique({ where: { email: 'ricardo@mix.com' } });
    if (!user3) {
        await prisma.usuario.create({
            data: { estabelecimento: { connect: { id: estab3.id } }, nome: 'Ricardo', email: 'ricardo@mix.com', senhaHash, tipo: 'admin' }
        });
    }

    const catRic1 = await prisma.categoria.upsert({ where: { estabelecimentoId_nome: { estabelecimentoId: estab3.id, nome: 'Almoço' } }, update: {}, create: { estabelecimentoId: estab3.id, nome: 'Almoço', destino: 'COZINHA', cor: '#8B5CF6' } });
    const catRic2 = await prisma.categoria.upsert({ where: { estabelecimentoId_nome: { estabelecimentoId: estab3.id, nome: 'Drinks' } }, update: {}, create: { estabelecimentoId: estab3.id, nome: 'Drinks', destino: 'BAR', cor: '#6366F1' } });

    await prisma.produto.createMany({
        data: [
            { categoriaId: catRic1.id, nome: 'Virado', preco: 35 },
            { categoriaId: catRic1.id, nome: 'Bife', preco: 38 },
            { categoriaId: catRic1.id, nome: 'Isca', preco: 42 },
            { categoriaId: catRic2.id, nome: 'Mule', preco: 29 },
            { categoriaId: catRic2.id, nome: 'Gin', preco: 32 },
        ]
    });

    logger.info('✅ Personas criadas com sucesso');
    res.json({ success: true, message: 'Personas Created!' });
}));

export default router;
