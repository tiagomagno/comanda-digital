import { Request, Response } from 'express';
import prisma from '../config/database.js';

// ─── Analytics Avançados ──────────────────────────────────────────────────────

export const getAnalytics = async (req: Request, res: Response) => {
    try {
        const estabelecimentoId = (req as any).user?.estabelecimentoId;
        if (!estabelecimentoId) return res.status(400).json({ message: 'Estabelecimento não identificado' });

        const hoje = new Date();
        const inicioHoje = new Date(hoje); inicioHoje.setHours(0, 0, 0, 0);
        const inicio7Dias = new Date(hoje); inicio7Dias.setDate(hoje.getDate() - 6); inicio7Dias.setHours(0, 0, 0, 0);
        const inicio30Dias = new Date(hoje); inicio30Dias.setDate(hoje.getDate() - 29); inicio30Dias.setHours(0, 0, 0, 0);

        // ── 1. Receita por canal (30 dias) ──────────────────────────────────────
        const comandas30Dias = await prisma.comanda.findMany({
            where: { estabelecimentoId, status: { in: ['paga', 'finalizada'] }, createdAt: { gte: inicio30Dias } },
            select: { tipoComanda: true, pedidos: { select: { total: true, status: true } } },
        });

        let receitaMesa = 0, pedidosMesa = 0, receitaDelivery = 0, pedidosDelivery = 0;
        for (const c of comandas30Dias) {
            const total = c.pedidos.filter(p => p.status !== 'cancelado').reduce((s, p) => s + Number(p.total), 0);
            if (c.tipoComanda === 'delivery') { receitaDelivery += total; pedidosDelivery++; }
            else { receitaMesa += total; pedidosMesa++; }
        }

        // ── 2. Evolução diária (últimos 7 dias) ────────────────────────────────
        const pedidosSemana = await prisma.pedido.findMany({
            where: {
                comanda: { estabelecimentoId },
                status: { in: ['pago', 'entregue'] },
                createdAt: { gte: inicio7Dias },
            },
            select: { total: true, createdAt: true },
        });

        const evolucao: Record<string, number> = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date(hoje); d.setDate(hoje.getDate() - i);
            const key = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            evolucao[key] = 0;
        }
        for (const p of pedidosSemana) {
            const key = new Date(p.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            if (key in evolucao) evolucao[key] += Number(p.total);
        }

        // ── 3. Taxa de recompra (30 dias) ──────────────────────────────────────
        const clientesComPedidos = await prisma.cliente.findMany({
            where: { estabelecimentoId, comandas: { some: { createdAt: { gte: inicio30Dias } } } },
            select: { _count: { select: { comandas: true } } },
        });
        const totalClientes30d = clientesComPedidos.length;
        const recorrentesCount = clientesComPedidos.filter(c => c._count.comandas > 1).length;
        const taxaRecompra = totalClientes30d > 0 ? (recorrentesCount / totalClientes30d) * 100 : 0;

        // ── 4. LTV médio ────────────────────────────────────────────────────────
        const todosClientes = await prisma.cliente.findMany({
            where: { estabelecimentoId },
            select: {
                comandas: {
                    where: { status: { in: ['paga', 'finalizada'] } },
                    select: { pedidos: { select: { total: true }, where: { status: { notIn: ['cancelado'] } } } },
                },
            },
        });
        const ltvTotal = todosClientes.reduce((sum, c) => {
            const gasto = c.comandas.reduce((s, cmd) => s + cmd.pedidos.reduce((ps, p) => ps + Number(p.total), 0), 0);
            return sum + gasto;
        }, 0);
        const ltv = todosClientes.length > 0 ? ltvTotal / todosClientes.length : 0;

        // ── 5. Top 5 clientes (gasto total) ────────────────────────────────────
        const topClientesRaw = await prisma.cliente.findMany({
            where: { estabelecimentoId },
            select: {
                nome: true, telefone: true,
                comandas: {
                    where: { status: { in: ['paga', 'finalizada'] } },
                    select: { pedidos: { select: { total: true }, where: { status: { notIn: ['cancelado'] } } } },
                },
            },
            take: 50,
        });

        const topClientes = topClientesRaw
            .map(c => ({
                nome: c.nome,
                telefone: c.telefone,
                totalGasto: c.comandas.reduce((s, cmd) => s + cmd.pedidos.reduce((ps, p) => ps + Number(p.total), 0), 0),
                totalPedidos: c.comandas.length,
            }))
            .sort((a, b) => b.totalGasto - a.totalGasto)
            .slice(0, 5);

        // ── 6. Taxa de chargeback / reembolso ──────────────────────────────────
        const totalTransacoes30d = await prisma.transacao.count({
            where: { comanda: { estabelecimentoId }, criadoAt: { gte: inicio30Dias } },
        });
        const chargebacks30d = await prisma.transacao.count({
            where: { comanda: { estabelecimentoId }, criadoAt: { gte: inicio30Dias }, status: { in: ['chargeback', 'reembolsado'] } },
        });
        const taxaChargeback = totalTransacoes30d > 0 ? (chargebacks30d / totalTransacoes30d) * 100 : 0;

        return res.json({
            canais: { mesa: { receita: receitaMesa, pedidos: pedidosMesa }, delivery: { receita: receitaDelivery, pedidos: pedidosDelivery } },
            evolucaoDiaria: Object.entries(evolucao).map(([data, receita]) => ({ data, receita })),
            taxaRecompra: Number(taxaRecompra.toFixed(1)),
            ltv: Number(ltv.toFixed(2)),
            topClientes,
            taxaChargeback: Number(taxaChargeback.toFixed(2)),
        });
    } catch (error) {
        console.error('Erro no getAnalytics:', error);
        return res.status(500).json({ message: 'Erro ao buscar analytics' });
    }
};

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const estabelecimentoId = (req as any).user?.estabelecimentoId;

        if (!estabelecimentoId) {
            return res.status(400).json({ message: 'Estabelecimento não identificado' });
        }

        // Determinar o inicio do dia de hoje para métricas diárias
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. Receita total do dia (Pedidos Pagos)
        const pedidosHoje = await prisma.pedido.findMany({
            where: {
                comanda: {
                    estabelecimentoId
                },
                createdAt: {
                    gte: today
                },
                status: 'pago'
            },
            select: {
                total: true
            }
        });

        const receitaTotal = pedidosHoje.reduce((acc: number, pedido: any) => acc + Number(pedido.total), 0);
        const totalPedidos = pedidosHoje.length;
        const ticketMedio = totalPedidos > 0 ? receitaTotal / totalPedidos : 0;

        // 2. Tipos de comandas do dia
        const comandasHoje = await prisma.comanda.findMany({
            where: {
                estabelecimentoId,
                createdAt: {
                    gte: today
                }
            },
            select: {
                tipoComanda: true
            }
        });

        const salao = comandasHoje.filter((c: any) => c.tipoComanda === 'mesa' || c.tipoComanda === 'individual').length;
        const paraLevar = comandasHoje.filter((c: any) => c.tipoComanda === 'delivery').length;

        // 3. Comandas Ativas
        const comandasAtivas = await prisma.comanda.count({
            where: {
                estabelecimentoId,
                status: 'ativa'
            }
        });

        // 4. Produtos em Alta
        // (Agrupamento via groupBy do Prisma ou puxando top 5 itens dos pedidos hoje)
        const itensHoje = await prisma.pedidoItem.groupBy({
            by: ['produtoId'],
            where: {
                pedido: {
                    comanda: { estabelecimentoId },
                    createdAt: { gte: today }
                }
            },
            _sum: {
                quantidade: true
            },
            orderBy: {
                _sum: {
                    quantidade: 'desc'
                }
            },
            take: 5
        });

        const nomesProdutosConfig = await prisma.produto.findMany({
            where: {
                id: { in: itensHoje.map((i: any) => i.produtoId) }
            },
            select: { id: true, nome: true }
        });

        const produtosEmAlta = itensHoje.map((item: any) => ({
            nome: nomesProdutosConfig.find((p: any) => p.id === item.produtoId)?.nome || 'Produto Indefinido',
            pedidos: item._sum.quantidade || 0
        }));

        // 5. Estoque Esgotado
        const estoqueEsgotadoDb = await prisma.produto.findMany({
            where: {
                categoria: { estabelecimentoId },
                estoqueControlado: true,
                quantidadeEstoque: { lte: 0 },
                disponivel: true
            },
            select: { nome: true },
            take: 10
        });

        const estoqueEsgotado = estoqueEsgotadoDb.map((p: any) => ({
            nome: p.nome,
            disponivelEm: 'Indisponível'
        }));

        // 6. Avaliações (Média)
        const avaliacoesDb = await prisma.avaliacao.findMany({
            where: {
                estabelecimentoId
            },
            select: {
                notaAtendimento: true,
                notaComida: true,
            }
        });

        const totalAvaliacoes = avaliacoesDb.length;
        const mediaAtendimento = totalAvaliacoes > 0 ? avaliacoesDb.reduce((acc: number, av: any) => acc + av.notaAtendimento, 0) / totalAvaliacoes : 0;
        const mediaComida = totalAvaliacoes > 0 ? avaliacoesDb.reduce((acc: number, av: any) => acc + av.notaComida, 0) / totalAvaliacoes : 0;

        return res.json({
            receitaTotal,
            totalPedidos,
            salao,
            paraLevar,
            ticketMedio,
            comandasAtivas,
            produtosEmAlta,
            estoqueEsgotado,
            avaliacoes: {
                total: totalAvaliacoes,
                mediaAtendimento: Number(mediaAtendimento.toFixed(1)),
                mediaComida: Number(mediaComida.toFixed(1))
            }
        });
    } catch (error) {
        console.error('Erro no getDashboardStats:', error);
        return res.status(500).json({ message: 'Erro ao buscar métricas do dashboard' });
    }
};
