import prisma from '../config/database.js';
import QRCode from 'qrcode';
import { NotFoundError, BadRequestError, ConflictError } from '../types/errors.js';
import { logger } from '../utils/logger.js';

interface CriarMesaDTO {
    estabelecimentoId: string;
    numero: string;
    capacidade?: number;
}

interface AtualizarMesaDTO {
    numero?: string;
    capacidade?: number;
    ativo?: boolean;
}

export class MesaService {
    /**
     * Listar mesas do estabelecimento
     */
    async listar(estabelecimentoId: string) {
        const mesas = await prisma.mesa.findMany({
            where: {
                estabelecimentoId,
                ativo: true,
            },
            include: {
                _count: {
                    select: {
                        comandas: {
                            where: {
                                status: 'ativa',
                            },
                        },
                    },
                },
            },
            orderBy: {
                numero: 'asc',
            },
        });

        // Adicionar status (livre/ocupada) baseado em comandas ativas
        return mesas.map((mesa) => ({
            ...mesa,
            status: mesa._count.comandas > 0 ? 'ocupada' : 'livre',
            comandasAtivas: mesa._count.comandas,
        }));
    }

    /**
     * Buscar mesa por ID
     */
    async buscarPorId(id: string, estabelecimentoId: string) {
        const mesa = await prisma.mesa.findFirst({
            where: {
                id,
                estabelecimentoId,
            },
        });

        if (!mesa) {
            throw new NotFoundError('Mesa não encontrada');
        }

        return mesa;
    }

    /**
     * Criar nova mesa com QR Code
     */
    async criar(data: CriarMesaDTO) {
        logger.info('Criando nova mesa', { numero: data.numero, estabelecimentoId: data.estabelecimentoId });

        // Verificar se já existe mesa com esse número
        const mesaExistente = await prisma.mesa.findFirst({
            where: {
                estabelecimentoId: data.estabelecimentoId,
                numero: data.numero,
            },
        });

        if (mesaExistente) {
            throw new ConflictError('Já existe uma mesa com este número');
        }

        // Criar mesa
        const mesa = await prisma.mesa.create({
            data: {
                estabelecimentoId: data.estabelecimentoId,
                numero: data.numero,
                capacidade: data.capacidade || 4,
            },
        });

        // Gerar QR Code
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const qrCodeUrl = `${frontendUrl}/mesa/${data.estabelecimentoId}/${mesa.id}`;
        
        let qrCodeDataUrl: string | null = null;
        try {
            qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF',
                },
            });
        } catch (error) {
            logger.warn('Erro ao gerar QR Code para mesa', { mesaId: mesa.id });
        }

        // Atualizar mesa com QR Code
        const mesaAtualizada = await prisma.mesa.update({
            where: { id: mesa.id },
            data: { qrCodeUrl: qrCodeDataUrl },
        });

        logger.info('Mesa criada com sucesso', { mesaId: mesaAtualizada.id, numero: data.numero });
        return mesaAtualizada;
    }

    /**
     * Atualizar mesa
     */
    async atualizar(id: string, estabelecimentoId: string, data: AtualizarMesaDTO) {
        // Verificar se mesa existe e pertence ao estabelecimento
        const mesa = await this.buscarPorId(id, estabelecimentoId);

        // Se mudou o número, verificar se não existe outra com esse número
        if (data.numero && data.numero !== mesa.numero) {
            const mesaExistente = await prisma.mesa.findFirst({
                where: {
                    estabelecimentoId,
                    numero: data.numero,
                    id: { not: id },
                },
            });

            if (mesaExistente) {
                throw new ConflictError('Já existe uma mesa com este número');
            }
        }

        const mesaAtualizada = await prisma.mesa.update({
            where: { id },
            data: {
                ...(data.numero && { numero: data.numero }),
                ...(data.capacidade && { capacidade: data.capacidade }),
                ...(data.ativo !== undefined && { ativo: data.ativo }),
            },
        });

        logger.info('Mesa atualizada', { mesaId: id });
        return mesaAtualizada;
    }

    /**
     * Deletar mesa (soft delete)
     */
    async deletar(id: string, estabelecimentoId: string) {
        // Verificar se mesa existe
        await this.buscarPorId(id, estabelecimentoId);

        // Verificar se há comandas ativas
        const comandasAtivas = await prisma.comanda.count({
            where: {
                mesaId: id,
                status: 'ativa',
            },
        });

        if (comandasAtivas > 0) {
            throw new BadRequestError('Não é possível deletar mesa com comandas ativas');
        }

        // Soft delete
        await prisma.mesa.update({
            where: { id },
            data: { ativo: false },
        });

        logger.info('Mesa deletada (soft delete)', { mesaId: id });
        return { message: 'Mesa deletada com sucesso' };
    }

    /**
     * Regenerar QR Code da mesa
     */
    async regenerarQRCode(id: string, estabelecimentoId: string) {
        // Verificar se mesa existe
        await this.buscarPorId(id, estabelecimentoId);

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const qrCodeUrl = `${frontendUrl}/mesa/${estabelecimentoId}/${id}`;
        
        let qrCodeDataUrl: string | null = null;
        try {
            qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF',
                },
            });
        } catch (error) {
            logger.warn('Erro ao regenerar QR Code', { mesaId: id });
            throw new BadRequestError('Erro ao gerar QR Code');
        }

        const mesaAtualizada = await prisma.mesa.update({
            where: { id },
            data: { qrCodeUrl: qrCodeDataUrl },
        });

        logger.info('QR Code regenerado', { mesaId: id });
        return mesaAtualizada;
    }

    /**
     * Obter QR Code para download
     */
    async obterQRCodeDownload(id: string, estabelecimentoId: string) {
        const mesa = await this.buscarPorId(id, estabelecimentoId);

        if (!mesa.qrCodeUrl) {
            throw new NotFoundError('QR Code não encontrado. Regenere o QR Code primeiro.');
        }

        // Converter data URL para buffer
        const base64Data = mesa.qrCodeUrl.replace(/^data:image\/png;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        return {
            buffer,
            filename: `mesa-${mesa.numero}-qrcode.png`,
        };
    }
}

export const mesaService = new MesaService();
