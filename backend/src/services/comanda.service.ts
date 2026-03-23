import prisma from '../config/database.js';
import QRCode from 'qrcode';
import { CriarComandaDTO } from '../types/dto.js';
import { NotFoundError } from '../types/errors.js';
import { comandaInclude } from '../utils/prisma-includes.js';
import { gerarCodigoComanda, calcularTotalComanda } from '../utils/comanda-utils.js';
import { logger } from '../utils/logger.js';

export class ComandaService {
    /**
     * Criar nova comanda
     */
    async criarComanda(data: CriarComandaDTO) {
        logger.info('Criando nova comanda', { nomeCliente: data.nomeCliente });

        // Gerar código único
        const codigo = await gerarCodigoComanda();

        // Criar comanda
        const comanda = await prisma.comanda.create({
            data: {
                codigo,
                estabelecimentoId: data.estabelecimentoId,
                nomeCliente: data.nomeCliente,
                telefoneCliente: data.telefoneCliente,
                emailCliente: data.emailCliente || undefined,
                mesa: data.mesa,
                mesaId: data.mesaId,
                tipoComanda: data.tipoComanda || 'individual',
                formaPagamento: data.formaPagamento || 'final',
                status: 'ativa',
                // Delivery
                clienteId: data.clienteId || undefined,
                enderecoEntregaId: data.enderecoEntregaId || undefined,
                taxaEntrega: data.taxaEntrega ?? 0,
            },
        });

        // Gerar QR Code
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const qrCodeUrl = `${frontendUrl}/comanda/${comanda.codigo}`;

        let qrCodeDataUrl: string | null = null;
        try {
            qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl);
        } catch (error) {
            logger.warn('Erro ao gerar QR Code', { comandaId: comanda.id });
        }

        // Atualizar comanda com QR Code
        const comandaAtualizada = await prisma.comanda.update({
            where: { id: comanda.id },
            data: { qrCodeUrl: qrCodeDataUrl },
            include: comandaInclude,
        });

        logger.info('Comanda criada com sucesso', { comandaId: comandaAtualizada.id, codigo });
        return comandaAtualizada;
    }

    /**
     * Buscar comanda por código
     */
    async buscarPorCodigo(codigo: string) {
        const comanda = await prisma.comanda.findUnique({
            where: { codigo },
            include: comandaInclude,
        });

        if (!comanda) {
            throw new NotFoundError('Comanda não encontrada');
        }

        return comanda;
    }

    /**
     * Buscar comanda por ID
     */
    async buscarPorId(id: string) {
        const comanda = await prisma.comanda.findUnique({
            where: { id },
            include: comandaInclude,
        });

        if (!comanda) {
            throw new NotFoundError('Comanda não encontrada');
        }

        return comanda;
    }

    /**
     * Listar comandas ativas
     */
    async listarAtivas(estabelecimentoId: string) {
        const comandas = await prisma.comanda.findMany({
            where: {
                estabelecimentoId,
                status: {
                    in: ['ativa', 'aguardando_pagamento'],
                },
            },
            include: {
                pedidos: {
                    select: {
                        id: true,
                        status: true,
                        total: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Calcular totais
        const comandasComTotais = comandas.map((comanda) => ({
            ...comanda,
            totalPedidos: comanda.pedidos.length,
            totalGeral: calcularTotalComanda(comanda.pedidos),
        }));

        return comandasComTotais;
    }

    /**
     * Atualizar status da comanda
     */
    async atualizarStatus(id: string, status: string) {
        const comanda = await prisma.comanda.findUnique({
            where: { id },
        });

        if (!comanda) {
            throw new NotFoundError('Comanda não encontrada');
        }

        const dataAtualizacao: any = { status };

        if (status === 'finalizada') {
            dataAtualizacao.finalizadaAt = new Date();
        } else if (status === 'cancelada') {
            dataAtualizacao.canceladaAt = new Date();
        }

        return await prisma.comanda.update({
            where: { id },
            data: dataAtualizacao,
        });
    }

    /**
     * Listar pedidos da comanda
     */
    async listarPedidos(comandaId: string) {
        const comanda = await this.buscarPorId(comandaId);
        return comanda.pedidos;
    }
}

export const comandaService = new ComandaService();
