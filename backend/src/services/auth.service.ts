import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import { NotFoundError, UnauthorizedError, BadRequestError, ConflictError } from '../types/errors.js';
import { logger } from '../utils/logger.js';

interface LoginDTO {
    email?: string;
    senha?: string;
    codigo?: string;
}

interface RegisterDTO {
    nome: string;
    email: string;
    senha: string;
    estabelecimentoId?: string;
}

interface OnboardingDTO {
    leadToken?: string;
    estabelecimento: {
        nome: string;
        operaLocal?: boolean;
        operaHospedado?: boolean;
        operaDelivery?: boolean;
        telefone?: string;
        email?: string;
    };
    gestor: {
        nome: string;
        email: string;
        senha: string;
    };
}

interface PreCadastroDTO {
    nomeEstabelecimento: string;
    nomeGestor?: string;
    email: string;
    telefone?: string;
    planoId?: string;
}

export class AuthService {
    /**
     * Criar Pré-Cadastro (Lead)
     */
    async preCadastro(data: PreCadastroDTO) {
        logger.info('Novo pré-cadastro', { email: data.email });
        
        let lead = await prisma.preCadastroLead.findUnique({
            where: { email: data.email }
        });

        if (lead) {
            lead = await prisma.preCadastroLead.update({
                where: { email: data.email },
                data: {
                    nomeEstabelecimento: data.nomeEstabelecimento,
                    nomeGestor: data.nomeGestor,
                    telefone: data.telefone,
                    planoId: data.planoId,
                }
            });
        } else {
            lead = await prisma.preCadastroLead.create({
                data: {
                    nomeEstabelecimento: data.nomeEstabelecimento,
                    nomeGestor: data.nomeGestor,
                    email: data.email,
                    telefone: data.telefone,
                    planoId: data.planoId,
                }
            });
        }

        return { token: lead.token };
    }

    /**
     * Buscar Pré-Cadastro pelo Token
     */
    async buscarLeadPorToken(token: string) {
        const lead = await prisma.preCadastroLead.findUnique({
            where: { token }
        });

        if (!lead) {
            throw new NotFoundError('Lead não encontrado ou token inválido');
        }

        return lead;
    }
    /**
     * Gerar token JWT
     */
    private gerarToken(usuario: { id: string; tipo: string; estabelecimentoId?: string | null }): string {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET não configurado');
        }

        return jwt.sign(
            {
                id: usuario.id,
                tipo: usuario.tipo,
                estabelecimentoId: usuario.estabelecimentoId,
            },
            jwtSecret,
            {
                expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any,
            }
        );
    }

    /**
     * Login de usuário (via código ou email/senha)
     */
    async login(data: LoginDTO) {
        logger.info('Tentativa de login', { tipo: data.codigo ? 'codigo' : 'email' });

        let usuario;

        // Login via Código
        if (data.codigo) {
            usuario = await prisma.usuario.findUnique({
                where: { codigoAcesso: data.codigo },
                include: { estabelecimento: true },
            });

            if (!usuario) {
                throw new UnauthorizedError('Código inválido');
            }
        }
        // Login via Email/Senha
        else if (data.email && data.senha) {
            usuario = await prisma.usuario.findUnique({
                where: { email: data.email },
                include: { estabelecimento: true },
            });

            if (!usuario || !usuario.senhaHash) {
                throw new UnauthorizedError('Credenciais inválidas');
            }

            const senhaValida = await bcrypt.compare(data.senha, usuario.senhaHash);
            if (!senhaValida) {
                throw new UnauthorizedError('Credenciais inválidas');
            }
        } else {
            throw new BadRequestError('Informe email/senha ou código de acesso');
        }

        // Verificar se usuário está ativo
        if (!usuario.ativo) {
            throw new UnauthorizedError('Usuário inativo');
        }

        // Gerar token JWT
        const token = this.gerarToken(usuario);

        // Atualizar último acesso
        await prisma.usuario.update({
            where: { id: usuario.id },
            data: { ultimoAcesso: new Date() },
        });

        logger.info('Login realizado com sucesso', { userId: usuario.id, tipo: usuario.tipo });

        return {
            token,
            user: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                role: usuario.tipo.toUpperCase(),
                estabelecimentoId: usuario.estabelecimentoId,
                estabelecimento: usuario.estabelecimento,
            },
        };
    }

    /**
     * Registrar novo usuário admin
     */
    async register(data: RegisterDTO) {
        logger.info('Registro de novo usuário', { email: data.email });

        // Verificar se email já existe
        const usuarioExistente = await prisma.usuario.findUnique({
            where: { email: data.email },
        });

        if (usuarioExistente) {
            throw new ConflictError('Email já cadastrado');
        }

        // Hash da senha
        const senhaHash = await bcrypt.hash(data.senha, 10);

        // Criar usuário
        const usuario = await prisma.usuario.create({
            data: {
                nome: data.nome,
                email: data.email,
                senhaHash,
                tipo: 'admin',
                estabelecimentoId: data.estabelecimentoId,
            },
            include: {
                estabelecimento: true,
            },
        });

        // Gerar token
        const token = this.gerarToken(usuario);

        logger.info('Usuário criado com sucesso', { userId: usuario.id });

        return {
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                tipo: usuario.tipo,
                estabelecimento: usuario.estabelecimento,
            },
        };
    }

    /**
     * Onboarding de novo estabelecimento
     * Cria estabelecimento + gestor + usuários operacionais com códigos automáticos
     */
    async onboarding(data: OnboardingDTO) {
        logger.info('Onboarding de novo estabelecimento', { nome: data.estabelecimento.nome });

        // Verificar se e-mail do gestor já existe
        const gestorExistente = await prisma.usuario.findUnique({
            where: { email: data.gestor.email },
        });
        if (gestorExistente) {
            throw new ConflictError('Este e-mail já está cadastrado na plataforma');
        }

        // Gerar slug: SIGLA do nome do estabelecimento (ex: "Bar do Zé" → "BARDOZE")
        const slug = data.estabelecimento.nome
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '')
            .slice(0, 8);

        // Criar o estabelecimento
        const estabelecimento = await prisma.estabelecimento.create({
            data: {
                nome: data.estabelecimento.nome,
                operaLocal: data.estabelecimento.operaLocal ?? false,
                operaHospedado: data.estabelecimento.operaHospedado ?? false,
                operaDelivery: data.estabelecimento.operaDelivery ?? false,
                telefone: data.estabelecimento.telefone,
                email: data.estabelecimento.email,
                ativo: true,
            },
        });

        // Criar gestor
        const senhaHash = await bcrypt.hash(data.gestor.senha, 10);
        const gestor = await prisma.usuario.create({
            data: {
                estabelecimentoId: estabelecimento.id,
                nome: data.gestor.nome,
                email: data.gestor.email,
                senhaHash,
                tipo: 'admin',
                ativo: true,
            },
        });

        // Criar usuários operacionais com códigos únicos dependendo do tipo de negócio
        const codigoCozinha = `COZINHA-${slug}`;

        let operacionais: any[] = [
            { estabelecimentoId: estabelecimento.id, nome: 'Cozinha', codigoAcesso: codigoCozinha, tipo: 'cozinha', ativo: true },
        ];

        let codigosOperacionais: any = { cozinha: codigoCozinha };

        if (data.estabelecimento.operaDelivery) {
            const codigoEntregador = `ENTREGADOR-${slug}`;
            operacionais.push({
                estabelecimentoId: estabelecimento.id, nome: 'Entregador', codigoAcesso: codigoEntregador, tipo: 'entregador', ativo: true
            });
            codigosOperacionais.entregador = codigoEntregador;
        }

        if (data.estabelecimento.operaLocal || data.estabelecimento.operaHospedado) {
            const codigoGarcom = `GARCOM-${slug}`;
            const codigoBar = `BAR-${slug}`;
            operacionais.push(
                { estabelecimentoId: estabelecimento.id, nome: 'Garçom', codigoAcesso: codigoGarcom, tipo: 'garcom', ativo: true },
                { estabelecimentoId: estabelecimento.id, nome: 'Bar', codigoAcesso: codigoBar, tipo: 'bar', ativo: true }
            );
            codigosOperacionais.garcom = codigoGarcom;
            codigosOperacionais.bar = codigoBar;
        }

        await prisma.usuario.createMany({
            data: operacionais,
            skipDuplicates: true,
        });

        // Marcar lead como convertido, se aplicável
        if (data.leadToken) {
            await prisma.preCadastroLead.updateMany({
                where: { token: data.leadToken },
                data: { convertido: true }
            });
            logger.info('Lead convertido no onboarding', { token: data.leadToken });
        }

        // Gerar token para auto-login do gestor
        const token = this.gerarToken(gestor);

        logger.info('Onboarding concluído', { estabelecimentoId: estabelecimento.id, gestorId: gestor.id });

        return {
            token,
            user: {
                id: gestor.id,
                nome: gestor.nome,
                email: gestor.email,
                role: 'ADMIN',
                estabelecimentoId: estabelecimento.id,
                estabelecimento,
            },
            codigosOperacionais,
        };
    }

    /**
     * Buscar dados do usuário autenticado
     */
    async buscarUsuarioAtual(userId: string) {
        const usuario = await prisma.usuario.findUnique({
            where: { id: userId },
            include: {
                estabelecimento: true,
            },
        });

        if (!usuario) {
            throw new NotFoundError('Usuário não encontrado');
        }

        return {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            tipo: usuario.tipo,
            estabelecimento: usuario.estabelecimento,
        };
    }

    /**
     * Atualizar dados do estabelecimento e dados do gestor principal
     */
    async atualizarEstabelecimento(userId: string, data: any) {
        const usuario = await prisma.usuario.findUnique({
            where: { id: userId },
            include: { estabelecimento: true },
        });

        if (!usuario || !usuario.estabelecimentoId || usuario.tipo !== 'admin') {
            throw new UnauthorizedError('Apenas gestores podem editar o perfil e estabelecimento');
        }

        // 1. Atualizar o usuário Gestor
        if (data.senhaGestor && data.senhaGestor.trim() !== '') {
            const senhaHash = await bcrypt.hash(data.senhaGestor, 10);
            await prisma.usuario.update({
                where: { id: userId },
                data: {
                    nome: data.nomeGestor || usuario.nome,
                    senhaHash,
                },
            });
        } else if (data.nomeGestor && data.nomeGestor !== usuario.nome) {
            await prisma.usuario.update({
                where: { id: userId },
                data: { nome: data.nomeGestor },
            });
        }

        // 2. Atualizar Estabelecimento
        const est = usuario.estabelecimento!;
        let configuracoesAtuais = {};
        try {
            configuracoesAtuais = est.configuracoes ? (typeof est.configuracoes === 'string' ? JSON.parse(est.configuracoes) : est.configuracoes) : {};
        } catch (e) {
            configuracoesAtuais = {};
        }

        const novasConfiguracoes = {
            ...configuracoesAtuais,
            nomeFantasia: data.nomeFantasia ?? est.nome,
            razaoSocial: data.razaoSocial ?? '',
            logradouro: data.logradouro ?? '',
            numero: data.numero ?? '',
            bairro: data.bairro ?? '',
            complemento: data.complemento ?? '',
            instagram: data.instagram ?? '',
            raioEntrega: data.raioEntrega ?? '5',
            tempoMedioEntrega: data.tempoMedioEntrega ?? '45',
            horarioSegSex: data.horarioSegSex ?? '10:00 - 23:00',
            horarioSabDom: data.horarioSabDom ?? '11:00 - 00:00',
            pedidoMinimo: data.pedidoMinimo ?? '',
            aceitaRetirada: data.aceitaRetirada ?? true,
            aceitaConsumoLocal: data.aceitaConsumoLocal ?? true,
            aceitaDelivery: data.aceitaDelivery ?? true,
        };

        const result = await prisma.estabelecimento.update({
            where: { id: est.id },
            data: {
                nome: data.nomeFantasia || est.nome,
                cnpj: data.cnpj || est.cnpj,
                cep: data.cep || est.cep,
                telefone: data.telefoneComercial || est.telefone,
                email: data.emailGestor || est.email,
                cidade: data.cidade || est.cidade,
                estado: data.estado || est.estado,
                operaLocal: data.aceitaConsumoLocal ?? est.operaLocal,
                operaHospedado: data.aceitaConsumoLocal ?? est.operaHospedado,
                operaDelivery: data.aceitaDelivery ?? est.operaDelivery,
                endereco: `${data.logradouro || ''}, ${data.numero || ''} - ${data.bairro || ''}`,
                configuracoes: novasConfiguracoes,
            },
        });

        return { message: 'Estabelecimento atualizado com sucesso', estabelecimento: result };
    }

    /**
     * Solicitar recuperação de senha (gera token de reset)
     * Apenas gestores (admin com email/senha) podem usar
     */
    async forgotPassword(email: string) {
        const usuario = await prisma.usuario.findUnique({
            where: { email },
        });

        // Sempre retornar sucesso para não expor se o email existe
        if (!usuario || !usuario.senhaHash || usuario.tipo !== 'admin') {
            return { message: 'Se o e-mail estiver cadastrado, você receberá as instruções.' };
        }

        const resetToken = jwt.sign(
            { userId: usuario.id, purpose: 'reset-password' },
            process.env.JWT_SECRET || 'fallback',
            { expiresIn: '1h' }
        );

        logger.info('Token de reset gerado', { userId: usuario.id });

        return {
            message: 'Se o e-mail estiver cadastrado, você receberá as instruções.',
            resetToken, // Em produção, enviar por e-mail. Aqui retornamos para desenvolvimento.
        };
    }

    /**
     * Redefinir senha usando token de reset
     */
    async resetPassword(token: string, novaSenha: string) {
        let payload: { userId?: string; purpose?: string };
        try {
            payload = jwt.verify(token, process.env.JWT_SECRET || 'fallback') as any;
        } catch {
            throw new BadRequestError('Link de recuperação inválido ou expirado. Solicite novamente.');
        }

        if (payload.purpose !== 'reset-password' || !payload.userId) {
            throw new BadRequestError('Token inválido.');
        }

        const senhaHash = await bcrypt.hash(novaSenha, 10);
        await prisma.usuario.update({
            where: { id: payload.userId },
            data: { senhaHash },
        });

        logger.info('Senha redefinida com sucesso', { userId: payload.userId });

        return { message: 'Senha redefinida com sucesso. Você já pode fazer login.' };
    }
}

export const authService = new AuthService();
