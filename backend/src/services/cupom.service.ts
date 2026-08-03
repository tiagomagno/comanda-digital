import prisma from '../config/database.js';
import { BadRequestError, NotFoundError } from '../types/errors.js';
import { logger } from '../utils/logger.js';

export interface ValidarCupomResult {
    valido: boolean;
    cupomId: string;
    desconto: number;
    tipo: string;
    mensagem: string;
}

export class CupomService {
    /**
     * Valida um cupom contra o total do pedido.
     * Retorna o valor de desconto calculado.
     */
    async validar(estabelecimentoId: string, codigo: string, total: number): Promise<ValidarCupomResult> {
        const cupom = await prisma.cupom.findUnique({
            where: { estabelecimentoId_codigo: { estabelecimentoId, codigo: codigo.toUpperCase() } },
        });

        if (!cupom || !cupom.ativo) throw new BadRequestError('Cupom inválido ou expirado');

        const agora = new Date();
        if (cupom.dataInicio && agora < cupom.dataInicio) throw new BadRequestError('Este cupom ainda não está vigente');
        if (cupom.dataFim   && agora > cupom.dataFim)    throw new BadRequestError('Cupom expirado');
        if (cupom.usoMaximo !== null && cupom.usoAtual >= cupom.usoMaximo) throw new BadRequestError('Cupom atingiu o limite de usos');
        if (cupom.valorMinimo && total < Number(cupom.valorMinimo)) {
            throw new BadRequestError(`Pedido mínimo para este cupom é R$ ${Number(cupom.valorMinimo).toFixed(2)}`);
        }

        let desconto = 0;
        if (cupom.tipo === 'percentual') {
            desconto = (total * Number(cupom.valor)) / 100;
        } else {
            desconto = Math.min(Number(cupom.valor), total);
        }

        return {
            valido: true,
            cupomId: cupom.id,
            desconto: parseFloat(desconto.toFixed(2)),
            tipo: cupom.tipo,
            mensagem: cupom.tipo === 'percentual'
                ? `${Number(cupom.valor)}% de desconto aplicado`
                : `R$ ${desconto.toFixed(2)} de desconto aplicado`,
        };
    }

    /**
     * Aplica o cupom à comanda (incrementa uso e grava cupomId/desconto).
     */
    async aplicarNaComanda(comandaId: string, cupomId: string, desconto: number) {
        await prisma.$transaction([
            prisma.comanda.update({
                where: { id: comandaId },
                data: { cupomId, desconto },
            }),
            prisma.cupom.update({
                where: { id: cupomId },
                data: { usoAtual: { increment: 1 } },
            }),
        ]);
        logger.info('Cupom aplicado na comanda', { comandaId, cupomId, desconto });
    }

    // ─── Admin CRUD ───────────────────────────────────────────────────────────

    async listar(estabelecimentoId: string) {
        return prisma.cupom.findMany({
            where: { estabelecimentoId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async criar(estabelecimentoId: string, data: {
        codigo: string; descricao?: string; tipo: 'percentual' | 'fixo'; valor: number;
        valorMinimo?: number; usoMaximo?: number; dataInicio?: string; dataFim?: string;
    }) {
        return prisma.cupom.create({
            data: {
                estabelecimentoId,
                codigo: data.codigo.toUpperCase(),
                descricao: data.descricao,
                tipo: data.tipo,
                valor: data.valor,
                valorMinimo: data.valorMinimo ?? null,
                usoMaximo: data.usoMaximo ?? null,
                dataInicio: data.dataInicio ? new Date(data.dataInicio) : null,
                dataFim: data.dataFim ? new Date(data.dataFim) : null,
            },
        });
    }

    async atualizar(id: string, estabelecimentoId: string, data: Partial<{
        descricao: string; tipo: 'percentual' | 'fixo'; valor: number;
        valorMinimo: number; usoMaximo: number; ativo: boolean;
        dataInicio: string; dataFim: string;
    }>) {
        const cupom = await prisma.cupom.findFirst({ where: { id, estabelecimentoId } });
        if (!cupom) throw new NotFoundError('Cupom não encontrado');
        return prisma.cupom.update({
            where: { id },
            data: {
                ...data,
                dataInicio: data.dataInicio ? new Date(data.dataInicio) : undefined,
                dataFim: data.dataFim ? new Date(data.dataFim) : undefined,
            },
        });
    }

    async deletar(id: string, estabelecimentoId: string) {
        const cupom = await prisma.cupom.findFirst({ where: { id, estabelecimentoId } });
        if (!cupom) throw new NotFoundError('Cupom não encontrado');
        await prisma.cupom.delete({ where: { id } });
    }
}

export const cupomService = new CupomService();
