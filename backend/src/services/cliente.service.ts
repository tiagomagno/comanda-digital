import prisma from '../config/database.js';
import { NotFoundError, BadRequestError } from '../types/errors.js';
import { comandaService } from './comanda.service.js';
import { pedidoService } from './pedido.service.js';
import { produtoService } from './produto.service.js';
import { logger } from '../utils/logger.js';



interface CriarComandaClienteDTO {
    estabelecimentoId: string;
    mesaId?: string;
    tipoComanda: 'mesa' | 'individual';
    nomeCliente: string;
    telefoneCliente: string;
    emailCliente?: string;
    formaPagamento?: 'imediato' | 'final';
}

export class ClienteService {
    /**
     * Escanear QR Code da mesa
     */
    async escanearQRCode(estabelecimentoId: string, mesaId: string) {
        logger.info('Escaneamento de QR Code', { estabelecimentoId, mesaId });

        // Buscar mesa
        const mesa = await prisma.mesa.findFirst({
            where: {
                id: mesaId,
                estabelecimentoId,
                ativo: true,
            },
            include: {
                estabelecimento: true,
            },
        });

        if (!mesa) {
            throw new NotFoundError('Mesa não encontrada');
        }

        // Verificar se há comanda ativa na mesa
        const comandaAtiva = await prisma.comanda.findFirst({
            where: {
                mesaId,
                status: 'ativa',
            },
            include: {
                pedidos: {
                    include: {
                        itens: true,
                    },
                },
            },
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
        return await produtoService.buscarCardapio(estabelecimentoId);
    }

    /**
     * Visualizar comanda do cliente
     */
    async visualizarComanda(codigo: string) {
        const comanda = await comandaService.buscarPorCodigo(codigo);

        // Calcular total acumulado
        const totalAcumulado = comanda.pedidos
            .filter((p) => p.status !== 'cancelado')
            .reduce((sum, p) => sum + Number(p.total), 0);

        return {
            ...comanda,
            totalAcumulado,
        };
    }

    /**
     * Criar comanda (cliente)
     */
    async criarComanda(data: CriarComandaClienteDTO) {
        logger.info('Cliente criando comanda', { estabelecimentoId: data.estabelecimentoId, tipo: data.tipoComanda });

        // Se for comanda de mesa, validar mesaId
        if (data.tipoComanda === 'mesa' && !data.mesaId) {
            throw new BadRequestError('Mesa é obrigatória para comanda de mesa');
        }

        // Usar ComandaService mas ajustar dados
        return await comandaService.criarComanda({
            estabelecimentoId: data.estabelecimentoId,
            nomeCliente: data.nomeCliente,
            telefoneCliente: data.telefoneCliente,
            emailCliente: data.emailCliente,
            mesaId: data.mesaId,
            tipoComanda: data.tipoComanda || 'individual',
            formaPagamento: data.formaPagamento || 'final',
        });
    }

    /**
     * Criar pedido (cliente)
     */
    async criarPedido(comandaId: string, itens: Array<{ produtoId: string; quantidade: number; observacoes?: string }>, observacoes?: string) {
        logger.info('Cliente criando pedido', { comandaId });

        // Validar comanda
        const comanda = await comandaService.buscarPorId(comandaId);

        if (comanda.status !== 'ativa') {
            throw new BadRequestError('Comanda não está ativa');
        }

        // Usar PedidoService
        return await pedidoService.criarPedido({
            comandaCodigo: comanda.codigo,
            itens,
            observacoes,
        });
    }
}

export const clienteService = new ClienteService();
