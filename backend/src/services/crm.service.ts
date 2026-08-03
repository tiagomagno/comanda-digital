import prisma from '../config/database.js';
import { logger } from '../utils/logger.js';

export interface ClienteMetricas {
    id: string;
    nome: string;
    telefone: string;
    email?: string | null;
    totalPedidos: number;
    totalGasto: number;
    ticketMedio: number;
    ultimaCompra: Date | null;
    diasSemComprar: number;
    segmento: 'ativo' | 'em_risco' | 'inativo' | 'novo';
}

export class CrmService {

    /**
     * Retorna lista de clientes com métricas agregadas
     */
    async listarClientes(estabelecimentoId: string, filtros?: {
        segmento?: string;
        diasInatividade?: number;
        busca?: string;
    }): Promise<ClienteMetricas[]> {

        const clientes = await prisma.cliente.findMany({
            where: {
                estabelecimentoId,
                ...(filtros?.busca && {
                    OR: [
                        { nome: { contains: filtros.busca } },
                        { telefone: { contains: filtros.busca } },
                        { email: { contains: filtros.busca } },
                    ],
                }),
            },
            include: {
                comandas: {
                    where: { status: { in: ['paga', 'finalizada'] } },
                    select: {
                        totalEstimado: true,
                        desconto: true,
                        taxaEntrega: true,
                        createdAt: true,
                        pedidos: {
                            select: { total: true },
                            where: { status: { notIn: ['cancelado'] } },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        const agora = new Date();

        const resultado: ClienteMetricas[] = clientes.map(cliente => {
            const comandas = cliente.comandas;
            const totalPedidos = comandas.length;

            const totalGasto = comandas.reduce((acc, c) => {
                const totalPedidosComanda = c.pedidos.reduce((s, p) => s + Number(p.total), 0);
                return acc + totalPedidosComanda;
            }, 0);

            const ticketMedio = totalPedidos > 0 ? totalGasto / totalPedidos : 0;
            const ultimaCompra = comandas[0]?.createdAt ?? null;
            const diasSemComprar = ultimaCompra
                ? Math.floor((agora.getTime() - ultimaCompra.getTime()) / (1000 * 60 * 60 * 24))
                : 9999;

            let segmento: ClienteMetricas['segmento'];
            if (totalPedidos === 1 && diasSemComprar <= 30) segmento = 'novo';
            else if (diasSemComprar <= 14) segmento = 'ativo';
            else if (diasSemComprar <= 30) segmento = 'em_risco';
            else segmento = 'inativo';

            return {
                id: cliente.id,
                nome: cliente.nome,
                telefone: cliente.telefone,
                email: cliente.email,
                totalPedidos,
                totalGasto,
                ticketMedio,
                ultimaCompra,
                diasSemComprar,
                segmento,
            };
        });

        // Filtrar por segmento
        if (filtros?.segmento && filtros.segmento !== 'todos') {
            return resultado.filter(c => c.segmento === filtros.segmento);
        }

        // Filtrar por dias de inatividade
        if (filtros?.diasInatividade) {
            return resultado.filter(c => c.diasSemComprar >= filtros.diasInatividade!);
        }

        return resultado.sort((a, b) => (b.ultimaCompra?.getTime() ?? 0) - (a.ultimaCompra?.getTime() ?? 0));
    }

    /**
     * Resumo/métricas do CRM do estabelecimento
     */
    async resumo(estabelecimentoId: string) {
        const clientes = await this.listarClientes(estabelecimentoId);
        const total = clientes.length;
        const ativos = clientes.filter(c => c.segmento === 'ativo').length;
        const emRisco = clientes.filter(c => c.segmento === 'em_risco').length;
        const inativos = clientes.filter(c => c.segmento === 'inativo').length;
        const novos = clientes.filter(c => c.segmento === 'novo').length;
        const ltv = total > 0 ? clientes.reduce((s, c) => s + c.totalGasto, 0) / total : 0;
        const taxaRecompra = total > 0 ? clientes.filter(c => c.totalPedidos > 1).length / total * 100 : 0;

        return { total, ativos, emRisco, inativos, novos, ltv, taxaRecompra };
    }

    /**
     * Cria uma campanha: gera cupons personalizados para um segmento de clientes
     */
    async criarCampanha(estabelecimentoId: string, dados: {
        segmento: string;
        diasInatividade?: number;
        cupomTemplate: string;
        diasValidade?: number;
    }) {
        const clientes = await this.listarClientes(estabelecimentoId, {
            segmento: dados.segmento !== 'todos' ? dados.segmento : undefined,
            diasInatividade: dados.diasInatividade,
        });

        // Busca cupom template
        const cupomTemplate = await prisma.cupom.findFirst({
            where: { estabelecimentoId, codigo: dados.cupomTemplate.toUpperCase() },
        });
        if (!cupomTemplate) throw new Error(`Cupom template '${dados.cupomTemplate}' não encontrado`);

        const dataFim = new Date(Date.now() + (dados.diasValidade ?? 7) * 24 * 60 * 60 * 1000);
        const cuponsGerados: string[] = [];

        for (const cliente of clientes) {
            const sufixo = Date.now().toString(36).toUpperCase().slice(-4);
            const codigo = `${dados.cupomTemplate.toUpperCase()}-${sufixo}`;

            try {
                await prisma.cupom.create({
                    data: {
                        estabelecimentoId,
                        codigo,
                        descricao: `Campanha CRM para ${cliente.nome} (${cliente.segmento})`,
                        tipo: cupomTemplate.tipo,
                        valor: cupomTemplate.valor,
                        valorMinimo: cupomTemplate.valorMinimo,
                        usoMaximo: 1,
                        dataFim,
                    },
                });
                cuponsGerados.push(codigo);
            } catch { /* ignora duplicados */ }
        }

        logger.info('Campanha CRM criada', {
            estabelecimentoId,
            segmento: dados.segmento,
            clientes: clientes.length,
            cuponsGerados: cuponsGerados.length,
        });

        return {
            clientesAlcancados: clientes.length,
            cuponsGerados: cuponsGerados.length,
            cupons: cuponsGerados,
        };
    }
}

export const crmService = new CrmService();
