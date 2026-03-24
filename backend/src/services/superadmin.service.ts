import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { NotFoundError, ConflictError } from '../types/errors.js';
import { logger } from '../utils/logger.js';

export class SuperAdminService {

    /**
     * Métricas globais da plataforma
     */
    async getDashboard() {
        const [
            totalEstabelecimentos,
            estabelecimentosAtivos,
            totalUsuarios,
            totalPedidosHoje,
            totalComandasAbertas,
            receitaTotal,
            ultimosEstabelecimentos,
        ] = await Promise.all([
            prisma.estabelecimento.count(),
            prisma.estabelecimento.count({ where: { ativo: true } }),
            prisma.usuario.count({ where: { tipo: { not: 'superadmin' } } }),
            prisma.pedido.count({
                where: {
                    createdAt: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    },
                },
            }),
            prisma.comanda.count({ where: { status: 'ativa' } }),
            prisma.pedido.aggregate({
                _sum: { total: true },
                where: {
                    status: { in: ['pago', 'entregue', 'pronto'] },
                },
            }),
            prisma.estabelecimento.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    nome: true,
                    cidade: true,
                    estado: true,
                    ativo: true,
                    operaLocal: true,
                    operaDelivery: true,
                    operaHospedado: true,
                    createdAt: true,
                },
            }),
        ]);

        return {
            metricas: {
                totalEstabelecimentos,
                estabelecimentosAtivos,
                estabelecimentosInativos: totalEstabelecimentos - estabelecimentosAtivos,
                totalUsuarios,
                totalPedidosHoje,
                totalComandasAbertas,
                receitaTotalPlataforma: Number(receitaTotal._sum.total ?? 0),
            },
            ultimosEstabelecimentos,
        };
    }

    /**
     * Listar todos os estabelecimentos com filtros
     */
    async listarEstabelecimentos(params: {
        page?: number;
        limit?: number;
        busca?: string;
        ativo?: boolean;
        operaLocal?: boolean;
        operaDelivery?: boolean;
        operaHospedado?: boolean;
    }) {
        const page = params.page ?? 1;
        const limit = params.limit ?? 20;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (params.busca) {
            where.OR = [
                { nome: { contains: params.busca } },
                { cnpj: { contains: params.busca } },
                { cidade: { contains: params.busca } },
                { email: { contains: params.busca } },
            ];
        }

        if (params.ativo !== undefined) where.ativo = params.ativo;
        if (params.operaLocal !== undefined) where.operaLocal = params.operaLocal;
        if (params.operaDelivery !== undefined) where.operaDelivery = params.operaDelivery;
        if (params.operaHospedado !== undefined) where.operaHospedado = params.operaHospedado;

        const [dados, total] = await Promise.all([
            prisma.estabelecimento.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: {
                            usuarios: true,
                            comandas: true,
                            categorias: true,
                        },
                    },
                },
            }),
            prisma.estabelecimento.count({ where }),
        ]);

        return {
            dados,
            paginacao: {
                total,
                pagina: page,
                limite: limit,
                totalPaginas: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Detalhes de um estabelecimento
     */
    async getEstabelecimento(id: string) {
        const est = await prisma.estabelecimento.findUnique({
            where: { id },
            include: {
                usuarios: {
                    where: { tipo: 'admin' },
                    select: { id: true, nome: true, email: true, ativo: true, ultimoAcesso: true, createdAt: true },
                },
                _count: {
                    select: {
                        categorias: true,
                        comandas: true,
                        mesas: true,
                        clientes: true,
                    },
                },
            },
        });

        if (!est) throw new NotFoundError('Estabelecimento não encontrado');

        // Métricas complementares
        const [totalPedidos, receitaEstab] = await Promise.all([
            prisma.pedido.count({
                where: { comanda: { estabelecimentoId: id } },
            }),
            prisma.pedido.aggregate({
                _sum: { total: true },
                where: {
                    comanda: { estabelecimentoId: id },
                    status: { in: ['pago', 'entregue', 'pronto'] },
                },
            }),
        ]);

        return {
            ...est,
            metricas: {
                totalPedidos,
                receitaTotal: Number(receitaEstab._sum.total ?? 0),
            },
        };
    }

    /**
     * Criar novo estabelecimento (com admin)
     */
    async criarEstabelecimento(data: {
        nome: string;
        cnpj?: string;
        telefone?: string;
        email?: string;
        cidade?: string;
        estado?: string;
        cep?: string;
        endereco?: string;
        operaLocal?: boolean;
        operaHospedado?: boolean;
        operaDelivery?: boolean;
        lotacaoMaxima?: number;
        adminNome: string;
        adminEmail: string;
        adminSenha: string;
    }) {
        logger.info('SuperAdmin: criando estabelecimento', { nome: data.nome });

        // Verificar email do admin
        const emailExistente = await prisma.usuario.findUnique({ where: { email: data.adminEmail } });
        if (emailExistente) throw new ConflictError('Email do gestor já cadastrado');

        // Verificar CNPJ se fornecido
        if (data.cnpj) {
            const cnpjExistente = await prisma.estabelecimento.findUnique({ where: { cnpj: data.cnpj } });
            if (cnpjExistente) throw new ConflictError('CNPJ já cadastrado');
        }

        const estabelecimento = await prisma.estabelecimento.create({
            data: {
                nome: data.nome,
                cnpj: data.cnpj,
                telefone: data.telefone,
                email: data.email,
                cidade: data.cidade,
                estado: data.estado,
                cep: data.cep,
                endereco: data.endereco,
                operaLocal: data.operaLocal ?? false,
                operaHospedado: data.operaHospedado ?? false,
                operaDelivery: data.operaDelivery ?? false,
                lotacaoMaxima: data.lotacaoMaxima,
                ativo: true,
            },
        });

        const senhaHash = await bcrypt.hash(data.adminSenha, 10);
        const admin = await prisma.usuario.create({
            data: {
                estabelecimentoId: estabelecimento.id,
                nome: data.adminNome,
                email: data.adminEmail,
                senhaHash,
                tipo: 'admin',
                ativo: true,
            },
        });

        logger.info('SuperAdmin: estabelecimento criado', { id: estabelecimento.id });

        return { estabelecimento, admin: { id: admin.id, nome: admin.nome, email: admin.email } };
    }

    /**
     * Atualizar estabelecimento
     */
    async atualizarEstabelecimento(id: string, data: Partial<{
        nome: string;
        cnpj: string;
        telefone: string;
        email: string;
        cidade: string;
        estado: string;
        cep: string;
        endereco: string;
        operaLocal: boolean;
        operaHospedado: boolean;
        operaDelivery: boolean;
        lotacaoMaxima: number;
        ativo: boolean;
    }>) {
        const est = await prisma.estabelecimento.findUnique({ where: { id } });
        if (!est) throw new NotFoundError('Estabelecimento não encontrado');

        const atualizado = await prisma.estabelecimento.update({
            where: { id },
            data,
        });

        logger.info('SuperAdmin: estabelecimento atualizado', { id });
        return atualizado;
    }

    /**
     * Ativar ou desativar estabelecimento
     */
    async toggleAtivo(id: string) {
        const est = await prisma.estabelecimento.findUnique({ where: { id } });
        if (!est) throw new NotFoundError('Estabelecimento não encontrado');

        const atualizado = await prisma.estabelecimento.update({
            where: { id },
            data: { ativo: !est.ativo },
        });

        logger.info('SuperAdmin: status do estabelecimento alterado', { id, ativo: atualizado.ativo });
        return { ativo: atualizado.ativo, mensagem: atualizado.ativo ? 'Estabelecimento ativado' : 'Estabelecimento desativado' };
    }

    /**
     * Listar todos os usuários admin da plataforma
     */
    async listarUsuarios(params: { page?: number; limit?: number; busca?: string }) {
        const page = params.page ?? 1;
        const limit = params.limit ?? 20;
        const skip = (page - 1) * limit;

        const where: any = {
            tipo: { in: ['admin', 'superadmin'] },
        };

        if (params.busca) {
            where.OR = [
                { nome: { contains: params.busca } },
                { email: { contains: params.busca } },
            ];
        }

        const [dados, total] = await Promise.all([
            prisma.usuario.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    tipo: true,
                    ativo: true,
                    ultimoAcesso: true,
                    createdAt: true,
                    estabelecimento: {
                        select: { id: true, nome: true, cidade: true },
                    },
                },
            }),
            prisma.usuario.count({ where }),
        ]);

        return {
            dados,
            paginacao: {
                total,
                pagina: page,
                limite: limit,
                totalPaginas: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Criar usuário superadmin
     */
    async criarSuperAdmin(data: { nome: string; email: string; senha: string }) {
        const existente = await prisma.usuario.findUnique({ where: { email: data.email } });
        if (existente) throw new ConflictError('Email já cadastrado');

        const senhaHash = await bcrypt.hash(data.senha, 10);
        const usuario = await prisma.usuario.create({
            data: {
                nome: data.nome,
                email: data.email,
                senhaHash,
                tipo: 'superadmin',
                ativo: true,
                estabelecimentoId: null,
            },
        });

        logger.info('SuperAdmin criado', { id: usuario.id });
        return { id: usuario.id, nome: usuario.nome, email: usuario.email, tipo: usuario.tipo };
    }
}

export const superAdminService = new SuperAdminService();
