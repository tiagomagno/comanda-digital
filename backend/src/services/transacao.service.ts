import prisma from '../config/database.js';
import { NotFoundError, BadRequestError } from '../types/errors.js';
import { logger } from '../utils/logger.js';
import { pedidoService } from './pedido.service.js';

const TRANSICOES_VALIDAS: Record<string, string[]> = {
    pendente:     ['processando', 'pago', 'falhou', 'cancelado'],
    processando:  ['pago', 'falhou', 'cancelado'],
    pago:         ['reembolsado', 'chargeback'],
    falhou:       ['pendente'],   // permite retry
    reembolsado:  [],
    cancelado:    [],
    chargeback:   [],
};

export class TransacaoService {
    /**
     * Cria uma nova tentativa de pagamento
     */
    async criar(dados: {
        comandaId: string;
        valor: number;
        metodo?: string;
        provedor?: string;
        providerId?: string;
        observacao?: string;
        status?: 'pendente' | 'pago'; // admin pode criar já como pago
    }) {
        const comanda = await prisma.comanda.findUnique({ where: { id: dados.comandaId } });
        if (!comanda) throw new NotFoundError('Comanda não encontrada');

        const transacao = await prisma.transacao.create({
            data: {
                comandaId: dados.comandaId,
                valor: dados.valor,
                status: dados.status ?? 'pendente',
                metodo: dados.metodo,
                provedor: dados.provedor ?? 'manual',
                providerId: dados.providerId,
                observacao: dados.observacao,
            },
        });

        // Se transação já criada como paga, atualiza status da comanda
        if (transacao.status === 'pago') {
            await this._sincronizarStatusComanda(dados.comandaId);
        }

        logger.info('Transação criada', { transacaoId: transacao.id, status: transacao.status });
        return transacao;
    }

    /**
     * Lista transações de uma comanda
     */
    async listarPorComanda(comandaId: string) {
        return prisma.transacao.findMany({
            where: { comandaId },
            orderBy: { criadoAt: 'desc' },
        });
    }

    /**
     * Atualiza status de uma transação
     */
    async atualizarStatus(id: string, novoStatus: string, observacao?: string) {
        const transacao = await prisma.transacao.findUnique({ where: { id } });
        if (!transacao) throw new NotFoundError('Transação não encontrada');

        const permitidos = TRANSICOES_VALIDAS[transacao.status] ?? [];
        if (!permitidos.includes(novoStatus)) {
            throw new BadRequestError(
                `Transição inválida: ${transacao.status} → ${novoStatus}. Permitido: [${permitidos.join(', ') || 'nenhum'}]`
            );
        }

        const atualizada = await prisma.transacao.update({
            where: { id },
            data: {
                status: novoStatus as any,
                observacao: observacao ?? transacao.observacao,
            },
        });

        // Sincroniza status da comanda quando pagamento é confirmado ou revertido
        if (['pago', 'reembolsado', 'chargeback'].includes(novoStatus)) {
            await this._sincronizarStatusComanda(transacao.comandaId);
        }

        // Libera para produção o(s) pedido(s) cobrados por esta transação
        if (novoStatus === 'pago') {
            await this._propagarPagamentoParaPedidos(atualizada);
        }

        logger.info('Transação atualizada', { id, status: novoStatus });
        return atualizada;
    }

    /**
     * Libera para produção o(s) pedido(s) associados a uma transação confirmada como paga.
     * pedidoId setado = cobrança de um pedido específico (formaPagamento 'imediato');
     * pedidoId nulo = cobrança da comanda inteira (formaPagamento 'final').
     */
    private async _propagarPagamentoParaPedidos(transacao: { comandaId: string; pedidoId: string | null }) {
        if (transacao.pedidoId) {
            const pedido = await prisma.pedido.findUnique({ where: { id: transacao.pedidoId } });
            if (pedido && ['criado', 'aguardando_pagamento'].includes(pedido.status)) {
                await pedidoService.atualizarStatus(transacao.pedidoId, 'pago');
            }
            return;
        }

        const pedidos = await prisma.pedido.findMany({
            where: { comandaId: transacao.comandaId, status: { in: ['criado', 'aguardando_pagamento'] } },
        });
        for (const pedido of pedidos) {
            await pedidoService.atualizarStatus(pedido.id, 'pago');
        }
    }

    /**
     * Webhook genérico: busca transação pelo providerId e atualiza status
     */
    async processarWebhook(dados: {
        providerId: string;
        provedor: string;
        status: string;
        observacao?: string;
    }) {
        const mapa: Record<string, string> = {
            // MercadoPago
            approved: 'pago', rejected: 'falhou', refunded: 'reembolsado',
            cancelled: 'cancelado', in_process: 'processando', charged_back: 'chargeback',
            // PagarmE / genérico
            paid: 'pago', failed: 'falhou', pending: 'processando',
            waiting_payment: 'pendente', chargedback: 'chargeback',
            // Stripe
            succeeded: 'pago', requires_payment_method: 'falhou',
            processing: 'processando', requires_action: 'processando',
        };

        const statusNormalizado = mapa[dados.status] ?? dados.status;

        const transacao = await prisma.transacao.findFirst({
            where: { providerId: dados.providerId, provedor: dados.provedor },
        });

        if (!transacao) {
            logger.warn('Webhook recebido para transação desconhecida', { providerId: dados.providerId });
            return { processado: false, motivo: 'Transação não encontrada' };
        }

        const permitidos = TRANSICOES_VALIDAS[transacao.status] ?? [];
        if (!permitidos.includes(statusNormalizado)) {
            return { processado: false, motivo: `Transição ${transacao.status}→${statusNormalizado} inválida` };
        }

        const atualizada = await this.atualizarStatus(transacao.id, statusNormalizado, dados.observacao);
        return { processado: true, transacao: atualizada };
    }

    /**
     * Atualiza o status da comanda com base nas transações.
     * Só fecha a comanda inteira ('paga') quando a transação cobre a comanda toda
     * (pedidoId nulo — fechamento de conta); uma cobrança de um pedido específico
     * (formaPagamento 'imediato') libera só aquele pedido, sem fechar a comanda.
     */
    private async _sincronizarStatusComanda(comandaId: string) {
        const transacoes = await prisma.transacao.findMany({ where: { comandaId } });
        const temPagoComandaInteira = transacoes.some(t => t.status === 'pago' && t.pedidoId === null);
        const temReembolsado = transacoes.some(t => t.status === 'reembolsado' || t.status === 'chargeback');

        if (temReembolsado) {
            await prisma.comanda.update({ where: { id: comandaId }, data: { status: 'ativa' } });
        } else if (temPagoComandaInteira) {
            await prisma.comanda.update({ where: { id: comandaId }, data: { status: 'paga' } });
        }
    }
}

export const transacaoService = new TransacaoService();
