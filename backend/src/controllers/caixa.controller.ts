import { Response } from 'express';
import { AuthRequest } from '../types/express.js';
import { comandaService } from '../services/comanda.service.js';
import { asyncHandler } from '../middlewares/error.middleware.js';
import { BadRequestError } from '../types/errors.js';
import prisma from '../config/database.js';
import { calcularTotalComanda } from '../utils/comanda-utils.js';
import { logger } from '../utils/logger.js';

/**
 * Listar comandas aguardando pagamento final
 */
export const listarComandasPendentes = asyncHandler(async (req: AuthRequest, res: Response) => {
    const estabelecimentoId = req.estabelecimentoId || req.user?.estabelecimentoId;

    if (!estabelecimentoId) {
        throw new BadRequestError('Estabelecimento não identificado');
    }

    const comandas = await prisma.comanda.findMany({
        where: {
            estabelecimentoId,
            status: 'ativa',
            formaPagamento: 'final',
        },
        include: {
            mesaRelacao: true,
            GrupoMesa: {
                include: {
                    mesas: {
                        include: { mesa: true },
                    },
                },
            },
            pedidos: {
                where: {
                    status: {
                        in: ['pago', 'em_preparo', 'pronto', 'entregue'],
                    },
                },
                include: {
                    itens: {
                        include: { produto: true },
                    },
                },
            },
        },
        orderBy: { createdAt: 'asc' },
    });

    const comandasComTotal = comandas.map((comanda) => ({
        ...comanda,
        totalCalculado: calcularTotalComanda(comanda.pedidos || []),
    }));

    res.json(comandasComTotal);
});

/**
 * Processar pagamento final
 */
export const processarPagamentoFinal = asyncHandler(async (req: AuthRequest, res: Response) => {
    const estabelecimentoId = req.estabelecimentoId || req.user?.estabelecimentoId;
    const { id } = req.params;
    const { metodoPagamento } = req.body;

    if (!estabelecimentoId) {
        throw new BadRequestError('Estabelecimento não identificado');
    }

    if (!metodoPagamento) {
        throw new BadRequestError('Método de pagamento é obrigatório');
    }

    const comanda = await prisma.comanda.findFirst({
        where: { id, estabelecimentoId },
        include: {
            pedidos: {
                where: {
                    status: {
                        in: ['pago', 'em_preparo', 'pronto', 'entregue'],
                    },
                },
            },
        },
    });

    if (!comanda) {
        throw new BadRequestError('Comanda não encontrada');
    }

    if (comanda.status !== 'ativa') {
        throw new BadRequestError('Comanda não está ativa');
    }

    const total = calcularTotalComanda(comanda.pedidos);

    // Atualizar todos os pedidos com método de pagamento
    await prisma.pedido.updateMany({
        where: {
            comandaId: id,
            status: {
                in: ['pago', 'em_preparo', 'pronto', 'entregue'],
            },
        },
        data: { metodoPagamento },
    });

    // Atualizar comanda para paga
    const comandaAtualizada = await prisma.comanda.update({
        where: { id },
        data: {
            formaPagamento: 'final',
            status: 'paga',
            totalEstimado: total,
        },
        include: {
            pedidos: true,
            mesaRelacao: true,
        },
    });

    logger.info('Pagamento final processado', { comandaId: id, metodoPagamento, total });
    res.json(comandaAtualizada);
});

/**
 * Fechar comanda (após pagamento)
 */
export const fecharComanda = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const comanda = await comandaService.buscarPorId(id);

    if (comanda.status !== 'paga') {
        throw new BadRequestError('Comanda deve estar paga para ser fechada');
    }

    const comandaFechada = await comandaService.atualizarStatus(id, 'finalizada');

    logger.info('Comanda fechada no caixa', { comandaId: id });
    res.json(comandaFechada);
});

/**
 * Relatório de vendas
 */
export const relatorioVendas = asyncHandler(async (req: AuthRequest, res: Response) => {
    const estabelecimentoId = req.estabelecimentoId || req.user?.estabelecimentoId;
    const { dataInicio, dataFim } = req.query;

    if (!estabelecimentoId) {
        throw new BadRequestError('Estabelecimento não identificado');
    }

    const inicio = dataInicio
        ? new Date(dataInicio as string)
        : new Date(new Date().setHours(0, 0, 0, 0));

    const fim = dataFim
        ? new Date(dataFim as string)
        : new Date(new Date().setHours(23, 59, 59, 999));

    const comandas = await prisma.comanda.findMany({
        where: {
            estabelecimentoId,
            status: 'finalizada',
            finalizadaAt: {
                gte: inicio,
                lte: fim,
            },
        },
        include: {
            pedidos: {
                include: {
                    itens: {
                        include: {
                            produto: {
                                include: { categoria: true },
                            },
                        },
                    },
                },
            },
        },
    });

    const totalVendas = comandas.reduce((sum, c) => sum + Number(c.totalEstimado), 0);
    const quantidadeComandas = comandas.length;

    // Agrupar por método de pagamento
    const porMetodoPagamento: Record<string, { quantidade: number; total: number }> = {};

    comandas.forEach((comanda) => {
        comanda.pedidos.forEach((pedido) => {
            const metodo = pedido.metodoPagamento || 'Não especificado';
            if (!porMetodoPagamento[metodo]) {
                porMetodoPagamento[metodo] = { quantidade: 0, total: 0 };
            }
            porMetodoPagamento[metodo].quantidade += 1;
            porMetodoPagamento[metodo].total += Number(pedido.total);
        });
    });

    // Produtos mais vendidos
    const produtosVendidos: Record<string, { nome: string; quantidade: number; total: number }> = {};

    comandas.forEach((comanda) => {
        comanda.pedidos.forEach((pedido) => {
            pedido.itens.forEach((item) => {
                const produtoId = item.produtoId;
                if (!produtosVendidos[produtoId]) {
                    produtosVendidos[produtoId] = {
                        nome: item.produto.nome,
                        quantidade: 0,
                        total: 0,
                    };
                }
                produtosVendidos[produtoId].quantidade += item.quantidade;
                produtosVendidos[produtoId].total += Number(item.subtotal);
            });
        });
    });

    const topProdutos = Object.values(produtosVendidos)
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 10);

    res.json({
        periodo: {
            inicio: inicio.toISOString(),
            fim: fim.toISOString(),
        },
        resumo: {
            totalVendas,
            quantidadeComandas,
            ticketMedio: quantidadeComandas > 0 ? totalVendas / quantidadeComandas : 0,
        },
        porMetodoPagamento,
        topProdutos,
    });
});
