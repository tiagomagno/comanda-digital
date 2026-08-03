import prisma from '../config/database.js';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';
import { NotFoundError, BadRequestError } from '../types/errors.js';
import { comandaService } from './comanda.service.js';
import { pedidoService } from './pedido.service.js';
import { produtoService } from './produto.service.js';
import { pedidoInclude } from '../utils/prisma-includes.js';
import { gerarCodigoComanda, calcularTotalComanda } from '../utils/comanda-utils.js';
import { getIO } from '../config/socket.js';
import { logger } from '../utils/logger.js';
import {
    RegistrarClienteDTO,
    LoginClienteDTO,
    CriarEnderecoClienteDTO,
    IniciarPedidoDeliveryDTO,
} from '../types/dto.js';
import { cupomService } from './cupom.service.js';
import { decrypt } from '../utils/gateway-crypto.js';
import { mercadoPagoAdapter } from './gateway/mercadopago.adapter.js';

interface IniciarPagamentoDTO {
    comandaCodigo: string;
    pedidoId?: string;
    metodo: 'pix' | 'cartao';
}

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

        const categorias = await produtoService.buscarCardapio(estabelecimentoId);

        let pedidoMinimo: number | null = null;
        try {
            const cfg = typeof estab.configuracoes === 'string'
                ? JSON.parse(estab.configuracoes as string)
                : ((estab.configuracoes as any) ?? {});
            const val = parseFloat(cfg.pedidoMinimo);
            if (!isNaN(val) && val > 0) pedidoMinimo = val;
        } catch {}

        return { categorias, pedidoMinimo };
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
        itens: Array<{ produtoId: string; quantidade: number; observacoes?: string; adicionaisIds?: string[] }>,
        observacoes?: string,
        cupomCodigo?: string
    ) {
        logger.info('Cliente criando pedido', { comandaId });
        const comanda = await comandaService.buscarPorId(comandaId);
        if (comanda.status !== 'ativa') throw new BadRequestError('Comanda não está ativa');

        const pedido = await pedidoService.criarPedido({ comandaCodigo: comanda.codigo, itens, observacoes });

        // Aplicar cupom na comanda (se fornecido e ainda não aplicado)
        if (cupomCodigo && !comanda.cupomId) {
            try {
                const resultado = await cupomService.validar(comanda.estabelecimentoId, cupomCodigo, Number(pedido.total));
                await cupomService.aplicarNaComanda(comanda.id, resultado.cupomId, resultado.desconto);
            } catch (e) {
                logger.warn('Cupom inválido ao criar pedido — ignorado', { cupomCodigo });
            }
        }

        return pedido;
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
     * Iniciar pedido delivery completo em uma única transação atômica.
     * Garante que cliente, endereço, comanda e pedido são criados juntos
     * ou nenhum deles persiste em caso de falha.
     */
    async iniciarPedidoDelivery(data: IniciarPedidoDeliveryDTO) {
        logger.info('Iniciando pedido delivery', {
            estabelecimentoId: data.estabelecimentoId,
            telefone: data.cliente.telefone,
        });

        // Buscar estabelecimento para validações antes da transação
        const estab = await prisma.estabelecimento.findUnique({
            where: { id: data.estabelecimentoId },
        });
        if (!estab) throw new NotFoundError('Estabelecimento não encontrado');

        let pedidoMinimo: number | null = null;
        try {
            const cfg = typeof estab.configuracoes === 'string'
                ? JSON.parse(estab.configuracoes as string)
                : ((estab.configuracoes as any) ?? {});
            const val = parseFloat(cfg.pedidoMinimo);
            if (!isNaN(val) && val > 0) pedidoMinimo = val;
        } catch {}

        // Gerar código único antes da transação (leitura simples, sem write lock)
        const codigo = await gerarCodigoComanda();

        // Pré-gerar QR code fora da transação (operação CPU local)
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        let qrCodeDataUrl: string | null = null;
        try {
            qrCodeDataUrl = await QRCode.toDataURL(`${frontendUrl}/comanda/${codigo}`);
        } catch {
            logger.warn('Erro ao gerar QR Code para comanda delivery', { codigo });
        }

        const resultado = await prisma.$transaction(async (tx) => {
            // 1. Identificar/registrar cliente
            let cliente = await tx.cliente.findFirst({
                where: {
                    estabelecimentoId: data.estabelecimentoId,
                    telefone: data.cliente.telefone,
                },
            });

            if (!cliente) {
                const senhaHash = data.cliente.senha
                    ? await bcrypt.hash(data.cliente.senha, 10)
                    : undefined;

                cliente = await tx.cliente.create({
                    data: {
                        estabelecimentoId: data.estabelecimentoId,
                        nome: data.cliente.nome,
                        telefone: data.cliente.telefone,
                        email: data.cliente.email || undefined,
                        senha: senhaHash,
                    },
                });
            }

            // 2. Resolver endereço: reutilizar salvo ou criar novo
            let endereco;
            if (data.enderecoId) {
                const existente = await tx.enderecoCliente.findFirst({
                    where: { id: data.enderecoId, clienteId: cliente.id },
                });
                if (!existente) {
                    throw new BadRequestError('Endereço não encontrado ou não pertence a este cliente');
                }
                endereco = existente;
            } else if (data.endereco) {
                endereco = await tx.enderecoCliente.create({
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
            } else {
                throw new BadRequestError('Endereço é obrigatório');
            }

            // 3. Criar comanda delivery com QR já embutido
            const comanda = await tx.comanda.create({
                data: {
                    codigo,
                    estabelecimentoId: data.estabelecimentoId,
                    nomeCliente: data.cliente.nome,
                    telefoneCliente: data.cliente.telefone,
                    emailCliente: data.cliente.email || undefined,
                    tipoComanda: 'delivery',
                    formaPagamento: data.formaPagamento || 'imediato',
                    status: 'ativa',
                    clienteId: cliente.id,
                    enderecoEntregaId: endereco.id,
                    taxaEntrega: data.taxaEntrega ?? 0,
                    qrCodeUrl: qrCodeDataUrl,
                    metodoPagamento: data.metodoPagamento || null,
                },
            });

            // 4. Validar produtos em lote (evita N+1) e criar pedido
            const produtoIds = data.itens.map((i) => i.produtoId);
            const produtos = await tx.produto.findMany({
                where: { id: { in: produtoIds } },
                include: { categoria: true },
            });

            for (const item of data.itens) {
                const produto = produtos.find((p) => p.id === item.produtoId);
                if (!produto) throw new NotFoundError(`Produto ${item.produtoId} não encontrado`);
                if (!produto.disponivel) throw new BadRequestError(`Produto ${produto.nome} não está disponível`);
            }

            // Buscar adicionais em lote
            const todosAdicionaisIds = data.itens.flatMap((i) => i.adicionaisIds ?? []);
            const adicionaisMap = new Map<string, { preco: number }>();
            if (todosAdicionaisIds.length > 0) {
                const adicionais = await tx.adicional.findMany({
                    where: { id: { in: todosAdicionaisIds }, disponivel: true },
                    select: { id: true, preco: true },
                });
                adicionais.forEach((a) => adicionaisMap.set(a.id, { preco: Number(a.preco) }));
            }

            let total = 0;
            let destino: string | null = null;
            const itensComPreco = data.itens.map((item) => {
                const produto = produtos.find((p) => p.id === item.produtoId)!;
                const precoUnitario = Number(produto.preco);
                const precoAdicionais = (item.adicionaisIds ?? []).reduce(
                    (sum, id) => sum + (adicionaisMap.get(id)?.preco ?? 0), 0
                );
                const subtotal = (precoUnitario + precoAdicionais) * item.quantidade;
                total += subtotal;
                if (!destino) destino = produto.categoria.destino;
                return {
                    produtoId: produto.id,
                    quantidade: item.quantidade,
                    precoUnitario,
                    subtotal,
                    observacoes: item.observacoes,
                    ...(item.adicionaisIds?.length ? {
                        adicionais: {
                            create: item.adicionaisIds
                                .filter((id) => adicionaisMap.has(id))
                                .map((id) => ({
                                    adicionalId: id,
                                    preco: adicionaisMap.get(id)!.preco,
                                })),
                        },
                    } : {}),
                };
            });

            if (pedidoMinimo !== null && total < pedidoMinimo) {
                throw new BadRequestError(
                    `Pedido mínimo é R$ ${pedidoMinimo.toFixed(2)}. Valor atual: R$ ${total.toFixed(2)}`
                );
            }

            const pedido = await tx.pedido.create({
                data: {
                    comandaId: comanda.id,
                    numeroPedido: 1,
                    status: 'criado',
                    destino: destino as any,
                    total,
                    observacoes: data.observacoes,
                    itens: { create: itensComPreco },
                },
                include: pedidoInclude,
            });

            return { cliente, endereco, comanda, pedido, total };
        });

        // Aplicar cupom após transação (fora do tx para não bloquear)
        if (data.cupomCodigo && resultado.comanda && !resultado.comanda.cupomId) {
            try {
                const validacao = await cupomService.validar(data.estabelecimentoId, data.cupomCodigo, resultado.total);
                await cupomService.aplicarNaComanda(resultado.comanda.id, validacao.cupomId, validacao.desconto);
            } catch (e) {
                logger.warn('Cupom inválido no delivery — ignorado', { cupomCodigo: data.cupomCodigo });
            }
        }

        // Emitir evento WebSocket após commit da transação
        try {
            const io = getIO();
            io.to(`estabelecimento:${data.estabelecimentoId}`).emit('pedido:novo', resultado.pedido);
        } catch {
            logger.warn('Socket.IO não inicializado, evento não emitido', {
                estabelecimentoId: data.estabelecimentoId,
            });
        }

        logger.info('Pedido delivery criado com sucesso', {
            pedidoId: resultado.pedido.id,
            comandaCodigo: codigo,
        });

        return resultado;
    }

    // =========================================================
    // PAGAMENTO (gateway real, modelo BYOG)
    // =========================================================

    /**
     * Iniciar cobrança real via gateway do estabelecimento, de um pedido
     * específico (formaPagamento 'imediato') ou da comanda inteira
     * (formaPagamento 'final', ao fechar a conta).
     */
    async iniciarPagamento(data: IniciarPagamentoDTO) {
        const comanda = await comandaService.buscarPorCodigo(data.comandaCodigo);

        if (comanda.status !== 'ativa') {
            throw new BadRequestError('Comanda não está ativa');
        }

        const pedidosNaoCancelados = comanda.pedidos.filter((p) => p.status !== 'cancelado');

        let pedidosAlvo: typeof pedidosNaoCancelados;
        let valor: number;

        if (data.pedidoId) {
            const pedido = pedidosNaoCancelados.find((p) => p.id === data.pedidoId);
            if (!pedido) throw new NotFoundError('Pedido não encontrado nesta comanda');
            pedidosAlvo = [pedido];
            valor = Number(pedido.total);
        } else {
            if (pedidosNaoCancelados.length === 0) {
                throw new BadRequestError('Não há pedidos para cobrar nesta comanda');
            }
            pedidosAlvo = pedidosNaoCancelados;
            valor = calcularTotalComanda(pedidosNaoCancelados) + Number(comanda.taxaEntrega) - Number(comanda.desconto);
        }

        for (const pedido of pedidosAlvo) {
            if (pedido.status !== 'criado' && pedido.status !== 'aguardando_pagamento') {
                throw new BadRequestError(`Pedido já está em '${pedido.status}' e não pode receber nova cobrança`);
            }
        }

        const credencial = await prisma.credencialGateway.findFirst({
            where: { estabelecimentoId: comanda.estabelecimentoId, provedor: 'mercadopago', ativo: true },
        });

        if (!credencial || !credencial.secretKey) {
            throw new BadRequestError('Este estabelecimento não configurou pagamento online. Use o pagamento manual.');
        }

        const credencialDecrypted = {
            publicKey: credencial.publicKey,
            secretKey: decrypt(credencial.secretKey),
        };

        // Idempotência: reaproveita cobrança PIX pendente já existente para o mesmo alvo
        const transacaoExistente = await prisma.transacao.findFirst({
            where: {
                comandaId: comanda.id,
                pedidoId: data.pedidoId ?? null,
                status: { in: ['pendente', 'processando'] },
                provedor: 'mercadopago',
            },
            orderBy: { criadoAt: 'desc' },
        });

        if (transacaoExistente?.providerId && data.metodo === 'pix') {
            try {
                const consulta = await mercadoPagoAdapter.consultarPagamento(transacaoExistente.providerId, credencialDecrypted);
                const transactionData = (consulta.raw as any)?.point_of_interaction?.transaction_data;
                if (transactionData?.qr_code) {
                    return {
                        transacaoId: transacaoExistente.id,
                        providerId: transacaoExistente.providerId,
                        qrCodeBase64: transactionData.qr_code_base64 ?? null,
                        copiaECola: transactionData.qr_code ?? null,
                    };
                }
            } catch (error) {
                logger.warn('Falha ao reconsultar cobrança PIX existente, criando uma nova', { transacaoId: transacaoExistente.id });
            }
        }

        const referenciaExterna = data.pedidoId ?? comanda.id;
        const descricao = `Pedido ${comanda.codigo} — ${comanda.estabelecimento?.nome ?? 'Dine'}`;

        if (data.metodo === 'pix') {
            const cobranca = await mercadoPagoAdapter.criarCobrancaPix({
                valor,
                descricao,
                referenciaExterna,
                credencial: credencialDecrypted,
                payerEmail: comanda.emailCliente || undefined,
            });

            const transacao = await prisma.transacao.create({
                data: {
                    comandaId: comanda.id,
                    pedidoId: data.pedidoId ?? null,
                    valor,
                    status: 'pendente',
                    metodo: 'pix',
                    provedor: 'mercadopago',
                    providerId: cobranca.providerId,
                },
            });

            await this._prepararPedidosParaCobranca(pedidosAlvo);

            return {
                transacaoId: transacao.id,
                providerId: cobranca.providerId,
                qrCodeBase64: cobranca.qrCodeBase64,
                copiaECola: cobranca.copiaECola,
            };
        }

        // Cartão — Checkout Pro (redirect hospedado pelo Mercado Pago)
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const cobranca = await mercadoPagoAdapter.criarCheckoutCartao({
            valor,
            descricao,
            referenciaExterna,
            credencial: credencialDecrypted,
            backUrls: {
                success: `${frontendUrl}/pedido/pagamento?comanda=${comanda.codigo}&status=success`,
                failure: `${frontendUrl}/pedido/pagamento?comanda=${comanda.codigo}&status=failure`,
                pending: `${frontendUrl}/pedido/pagamento?comanda=${comanda.codigo}&status=pending`,
            },
        });

        const transacao = await prisma.transacao.create({
            data: {
                comandaId: comanda.id,
                pedidoId: data.pedidoId ?? null,
                valor,
                status: 'pendente',
                metodo: 'cartao_credito',
                provedor: 'mercadopago',
                providerId: cobranca.providerId,
            },
        });

        await this._prepararPedidosParaCobranca(pedidosAlvo);

        return {
            transacaoId: transacao.id,
            providerId: cobranca.providerId,
            checkoutUrl: cobranca.checkoutUrl,
        };
    }

    /** Move para 'aguardando_pagamento' os pedidos que ainda estão em 'criado' */
    private async _prepararPedidosParaCobranca(pedidos: Array<{ id: string; status: string }>) {
        for (const pedido of pedidos) {
            if (pedido.status === 'criado') {
                await pedidoService.atualizarStatus(pedido.id, 'aguardando_pagamento');
            }
        }
    }
}

export const clienteService = new ClienteService();
