import prisma from '../config/database.js';
import bcrypt from 'bcryptjs';
import { NotFoundError, BadRequestError } from '../types/errors.js';
import { comandaService } from './comanda.service.js';
import { pedidoService } from './pedido.service.js';
import { produtoService } from './produto.service.js';
import { logger } from '../utils/logger.js';
import {
    RegistrarClienteDTO,
    LoginClienteDTO,
    CriarEnderecoClienteDTO,
    IniciarPedidoDeliveryDTO,
} from '../types/dto.js';

interface CriarComandaClienteDTO {
    estabelecimentoId: string;
    mesaId?: string;
    tipoComanda: 'mesa' | 'individual' | 'delivery';
    nomeCliente: string;
    telefoneCliente: string;
    emailCliente?: string;
    formaPagamento?: 'imediato' | 'final';
    clienteId?: string;
    enderecoEntregaId?: string;
    taxaEntrega?: number;
}

export class ClienteService {
    /**
     * Escanear QR Code da mesa
     */
    async escanearQRCode(estabelecimentoId: string, mesaId: string) {
        logger.info('Escaneamento de QR Code', { estabelecimentoId, mesaId });

        const mesa = await prisma.mesa.findFirst({
            where: { id: mesaId, estabelecimentoId, ativo: true },
            include: { estabelecimento: true },
        });

        if (!mesa) throw new NotFoundError('Mesa não encontrada');

        const comandaAtiva = await prisma.comanda.findFirst({
            where: { mesaId, status: 'ativa' },
            include: { pedidos: { include: { itens: true } } },
        });

        return {
            mesa,
            estabelecimento: mesa.estabelecimento,
            comandaAtiva,
            temComandaAtiva: !!comandaAtiva,
        };
    }

    /**
     * Visualizar cardápio do estabelecimento
     */
    async visualizarCardapio(estabelecimentoId: string) {
        const estab = await prisma.estabelecimento.findUnique({ where: { id: estabelecimentoId } });
        if (!estab) throw new NotFoundError('Estabelecimento não encontrado');
        return await produtoService.buscarCardapio(estabelecimentoId);
    }

    /**
     * Visualizar comanda do cliente
     */
    async visualizarComanda(codigo: string) {
        const comanda = await comandaService.buscarPorCodigo(codigo);
        const totalAcumulado = comanda.pedidos
            .filter((p) => p.status !== 'cancelado')
            .reduce((sum, p) => sum + Number(p.total), 0);
        return { ...comanda, totalAcumulado };
    }

    /**
     * Criar comanda (cliente de mesa/individual)
     */
    async criarComanda(data: CriarComandaClienteDTO) {
        logger.info('Cliente criando comanda', { estabelecimentoId: data.estabelecimentoId, tipo: data.tipoComanda });

        if (data.tipoComanda === 'mesa' && !data.mesaId) {
            throw new BadRequestError('Mesa é obrigatória para comanda de mesa');
        }

        return await comandaService.criarComanda({
            estabelecimentoId: data.estabelecimentoId,
            nomeCliente: data.nomeCliente,
            telefoneCliente: data.telefoneCliente,
            emailCliente: data.emailCliente,
            mesaId: data.mesaId,
            tipoComanda: data.tipoComanda || 'individual',
            formaPagamento: data.formaPagamento || 'final',
            clienteId: data.clienteId,
            enderecoEntregaId: data.enderecoEntregaId,
            taxaEntrega: data.taxaEntrega,
        });
    }

    /**
     * Criar pedido (cliente)
     */
    async criarPedido(
        comandaId: string,
        itens: Array<{ produtoId: string; quantidade: number; observacoes?: string }>,
        observacoes?: string
    ) {
        logger.info('Cliente criando pedido', { comandaId });
        const comanda = await comandaService.buscarPorId(comandaId);
        if (comanda.status !== 'ativa') throw new BadRequestError('Comanda não está ativa');
        return await pedidoService.criarPedido({ comandaCodigo: comanda.codigo, itens, observacoes });
    }

    // =========================================================
    // DELIVERY - Registro/Login de cliente final
    // =========================================================

    /**
     * Registrar cliente (delivery)
     */
    async registrarCliente(data: RegistrarClienteDTO) {
        logger.info('Registrando cliente delivery', { telefone: data.telefone });

        const existe = await prisma.cliente.findFirst({
            where: { estabelecimentoId: data.estabelecimentoId, telefone: data.telefone },
        });

        if (existe) {
            // Se existir, retornar o cliente em vez de erro (fluxo "identificar/entrar")
            return { cliente: existe, novo: false };
        }

        let senhaHash: string | undefined;
        if (data.senha) {
            senhaHash = await bcrypt.hash(data.senha, 10);
        }

        const cliente = await prisma.cliente.create({
            data: {
                estabelecimentoId: data.estabelecimentoId,
                nome: data.nome,
                telefone: data.telefone,
                email: data.email || undefined,
                senha: senhaHash || undefined,
                cpf: data.cpf || undefined,
            },
        });

        return { cliente, novo: true };
    }

    /**
     * Login/identificação do cliente (delivery)
     */
    async loginCliente(data: LoginClienteDTO) {
        const cliente = await prisma.cliente.findFirst({
            where: { estabelecimentoId: data.estabelecimentoId, telefone: data.telefone },
            include: { enderecos: { orderBy: { padrao: 'desc' } } },
        });

        if (!cliente) throw new NotFoundError('Cliente não encontrado. Faça seu primeiro pedido para se cadastrar.');

        // Se tiver senha cadastrada, validar
        if (cliente.senha && data.senha) {
            const senhaValida = await bcrypt.compare(data.senha, cliente.senha);
            if (!senhaValida) throw new BadRequestError('Senha incorreta');
        }

        return { cliente, enderecos: cliente.enderecos };
    }

    /**
     * Buscar cliente por ID
     */
    async buscarCliente(clienteId: string) {
        const cliente = await prisma.cliente.findUnique({
            where: { id: clienteId },
            include: { enderecos: { orderBy: { padrao: 'desc' } } },
        });
        if (!cliente) throw new NotFoundError('Cliente não encontrado');
        return cliente;
    }

    /**
     * Listar endereços do cliente
     */
    async listarEnderecos(clienteId: string) {
        return await prisma.enderecoCliente.findMany({
            where: { clienteId },
            orderBy: [{ padrao: 'desc' }, { createdAt: 'desc' }],
        });
    }

    /**
     * Adicionar endereço
     */
    async adicionarEndereco(data: CriarEnderecoClienteDTO) {
        const cliente = await prisma.cliente.findUnique({ where: { id: data.clienteId } });
        if (!cliente) throw new NotFoundError('Cliente não encontrado');

        // Se for marcado como padrão, desmarcar os outros
        if (data.padrao) {
            await prisma.enderecoCliente.updateMany({
                where: { clienteId: data.clienteId },
                data: { padrao: false },
            });
        }

        return await prisma.enderecoCliente.create({
            data: {
                clienteId: data.clienteId,
                cep: data.cep,
                logradouro: data.logradouro,
                numero: data.numero,
                complemento: data.complemento || undefined,
                bairro: data.bairro,
                cidade: data.cidade,
                estado: data.estado,
                referencia: data.referencia || undefined,
                padrao: data.padrao ?? false,
            },
        });
    }

    /**
     * [FLUXO PRINCIPAL DELIVERY]
     * Iniciar pedido delivery completo:
     * 1. Identifica ou cadastra o cliente pelo telefone
     * 2. Cria ou reutiliza o endereço de entrega
     * 3. Cria a comanda do tipo "delivery"
     * 4. Cria o pedido com os itens
     */
    async iniciarPedidoDelivery(data: IniciarPedidoDeliveryDTO) {
        logger.info('Iniciando pedido delivery', {
            estabelecimentoId: data.estabelecimentoId,
            telefone: data.cliente.telefone,
        });

        // 1. Identificar/registrar cliente
        const { cliente } = await this.registrarCliente({
            estabelecimentoId: data.estabelecimentoId,
            nome: data.cliente.nome,
            telefone: data.cliente.telefone,
            email: data.cliente.email,
            senha: data.cliente.senha,
        });

        // 2. Criar o endereço de entrega (sempre cria um novo nessa sessão)
        const endereco = await prisma.enderecoCliente.create({
            data: {
                clienteId: cliente.id,
                cep: data.endereco.cep,
                logradouro: data.endereco.logradouro,
                numero: data.endereco.numero,
                complemento: data.endereco.complemento || undefined,
                bairro: data.endereco.bairro,
                cidade: data.endereco.cidade,
                estado: data.endereco.estado,
                referencia: data.endereco.referencia || undefined,
                padrao: false,
            },
        });

        // 3. Criar a comanda do tipo delivery
        const comanda = await comandaService.criarComanda({
            estabelecimentoId: data.estabelecimentoId,
            nomeCliente: data.cliente.nome,
            telefoneCliente: data.cliente.telefone,
            emailCliente: data.cliente.email,
            tipoComanda: 'delivery',
            formaPagamento: data.formaPagamento || 'imediato',
            clienteId: cliente.id,
            enderecoEntregaId: endereco.id,
            taxaEntrega: data.taxaEntrega ?? 0,
        });

        // 4. Criar o pedido com os itens
        const pedido = await pedidoService.criarPedido({
            comandaCodigo: comanda.codigo,
            itens: data.itens,
            observacoes: data.observacoes,
        });

        return {
            cliente,
            endereco,
            comanda,
            pedido,
        };
    }
}

export const clienteService = new ClienteService();
