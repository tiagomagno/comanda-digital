import prisma from '../config/database.js';
import { NotFoundError, BadRequestError } from '../types/errors.js';
import { logger } from '../utils/logger.js';

interface AcaoAutomacao {
    tipo: 'avaliacao' | 'cupom' | 'mensagem';
    cupomCodigo?: string;
    mensagem?: string;
}

export class AutomacaoService {

    // ─── CRUD de Regras ────────────────────────────────────────────────────────

    async listar(estabelecimentoId: string) {
        return prisma.regraAutomacao.findMany({
            where: { estabelecimentoId },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: { select: { execucoes: true } },
            },
        });
    }

    async criar(estabelecimentoId: string, data: {
        nome: string;
        tipo: 'apos_entrega' | 'cliente_inativo';
        delayMinutos?: number;
        diasInatividade?: number;
        acao: AcaoAutomacao;
    }) {
        if (data.tipo === 'cliente_inativo' && !data.diasInatividade) {
            throw new BadRequestError('diasInatividade é obrigatório para regras de inatividade');
        }
        return prisma.regraAutomacao.create({
            data: {
                estabelecimentoId,
                nome: data.nome,
                tipo: data.tipo,
                delayMinutos: data.delayMinutos ?? 30,
                diasInatividade: data.diasInatividade,
                acao: data.acao as any,
            },
        });
    }

    async atualizar(id: string, estabelecimentoId: string, data: Partial<{
        nome: string; delayMinutos: number; diasInatividade: number; ativo: boolean; acao: AcaoAutomacao;
    }>) {
        const regra = await prisma.regraAutomacao.findFirst({ where: { id, estabelecimentoId } });
        if (!regra) throw new NotFoundError('Regra não encontrada');
        return prisma.regraAutomacao.update({ where: { id }, data: data as any });
    }

    async deletar(id: string, estabelecimentoId: string) {
        const regra = await prisma.regraAutomacao.findFirst({ where: { id, estabelecimentoId } });
        if (!regra) throw new NotFoundError('Regra não encontrada');
        await prisma.regraAutomacao.delete({ where: { id } });
    }

    // ─── Engine de Processamento ───────────────────────────────────────────────

    /**
     * Processa todas as regras ativas do estabelecimento.
     * Deve ser chamado periodicamente (cron) ou manualmente pelo admin.
     */
    async processar(estabelecimentoId: string): Promise<{ processadas: number; acoes: number }> {
        const regras = await prisma.regraAutomacao.findMany({
            where: { estabelecimentoId, ativo: true },
        });

        let totalAcoes = 0;
        for (const regra of regras) {
            const acoes = await this._processarRegra(regra);
            totalAcoes += acoes;
        }

        logger.info('Automações processadas', { estabelecimentoId, regras: regras.length, acoes: totalAcoes });
        return { processadas: regras.length, acoes: totalAcoes };
    }

    private async _processarRegra(regra: any): Promise<number> {
        if (regra.tipo === 'apos_entrega') {
            return this._processarAposEntrega(regra);
        }
        if (regra.tipo === 'cliente_inativo') {
            return this._processarClienteInativo(regra);
        }
        return 0;
    }

    /** Regra: após entrega — dispara N minutos depois do pedido ser entregue */
    private async _processarAposEntrega(regra: any): Promise<number> {
        const limiteData = new Date(Date.now() - regra.delayMinutos * 60 * 1000);

        // Pedidos entregues no período elegível
        const pedidos = await prisma.pedido.findMany({
            where: {
                comanda: { estabelecimentoId: regra.estabelecimentoId },
                status: 'entregue',
                entregueAt: { lte: limiteData, gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // últimas 24h
            },
            select: { id: true, comandaId: true },
        });

        let acoes = 0;
        for (const pedido of pedidos) {
            // Verifica se já foi executado para este pedido
            const jaExecutado = await prisma.execucaoAutomacao.findFirst({
                where: { regraId: regra.id, referencia: pedido.id },
            });
            if (jaExecutado) continue;

            // Registra execução
            const acao = regra.acao as AcaoAutomacao;
            const resultado = await this._executarAcao(regra, acao, pedido.id, 'pedido');
            await prisma.execucaoAutomacao.create({
                data: {
                    regraId: regra.id,
                    referencia: pedido.id,
                    status: resultado.sucesso ? 'executado' : 'erro',
                    resultado: resultado as any,
                },
            });
            acoes++;
        }
        return acoes;
    }

    /** Regra: cliente inativo — dispara para clientes sem compra há X dias */
    private async _processarClienteInativo(regra: any): Promise<number> {
        const diasAtras = new Date(Date.now() - regra.diasInatividade * 24 * 60 * 60 * 1000);

        // Clientes do estabelecimento com última compra antes de X dias
        const clientes = await prisma.cliente.findMany({
            where: {
                estabelecimentoId: regra.estabelecimentoId,
                comandas: {
                    some: { createdAt: { lte: diasAtras } },  // tem compra antiga
                    none: { createdAt: { gt: diasAtras } },    // não tem compra recente
                },
            },
            select: { id: true, nome: true, email: true, telefone: true },
            take: 100, // limite por processamento
        });

        let acoes = 0;
        for (const cliente of clientes) {
            const jaExecutado = await prisma.execucaoAutomacao.findFirst({
                where: {
                    regraId: regra.id,
                    referencia: cliente.id,
                    criadoAt: { gt: new Date(Date.now() - regra.diasInatividade * 24 * 60 * 60 * 1000) },
                },
            });
            if (jaExecutado) continue;

            const acao = regra.acao as AcaoAutomacao;
            const resultado = await this._executarAcao(regra, acao, cliente.id, 'cliente');
            await prisma.execucaoAutomacao.create({
                data: {
                    regraId: regra.id,
                    referencia: cliente.id,
                    status: resultado.sucesso ? 'executado' : 'erro',
                    resultado: resultado as any,
                },
            });
            acoes++;
        }
        return acoes;
    }

    /** Executa a ação definida na regra */
    private async _executarAcao(regra: any, acao: AcaoAutomacao, _referencia: string, _tipo: 'pedido' | 'cliente') {
        try {
            if (acao.tipo === 'cupom' && acao.cupomCodigo) {
                // Gera cupom personalizado com sufixo único
                const sufixo = Date.now().toString(36).toUpperCase();
                const codigoPersonalizado = `${acao.cupomCodigo}-${sufixo}`;

                // Busca cupom template
                const cupomTemplate = await prisma.cupom.findFirst({
                    where: { estabelecimentoId: regra.estabelecimentoId, codigo: acao.cupomCodigo.toUpperCase() },
                });

                if (cupomTemplate) {
                    await prisma.cupom.create({
                        data: {
                            estabelecimentoId: regra.estabelecimentoId,
                            codigo: codigoPersonalizado,
                            descricao: `Gerado automaticamente — regra: ${regra.nome}`,
                            tipo: cupomTemplate.tipo,
                            valor: cupomTemplate.valor,
                            valorMinimo: cupomTemplate.valorMinimo,
                            usoMaximo: 1,
                            dataFim: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
                        },
                    });
                    return { sucesso: true, acao: 'cupom_criado', codigo: codigoPersonalizado };
                }
            }

            if (acao.tipo === 'avaliacao') {
                // Registra que deve enviar link de avaliação (integração futura com WhatsApp)
                return { sucesso: true, acao: 'avaliacao_agendada', pendente_envio: true };
            }

            if (acao.tipo === 'mensagem') {
                // Registra mensagem para envio futuro (integração futura com WhatsApp)
                return { sucesso: true, acao: 'mensagem_agendada', mensagem: acao.mensagem, pendente_envio: true };
            }

            return { sucesso: false, erro: 'Tipo de ação não reconhecido' };
        } catch (error: any) {
            return { sucesso: false, erro: error.message };
        }
    }

    /** Retorna histórico de execuções de uma regra */
    async historicoExecucoes(regraId: string, estabelecimentoId: string) {
        const regra = await prisma.regraAutomacao.findFirst({ where: { id: regraId, estabelecimentoId } });
        if (!regra) throw new NotFoundError('Regra não encontrada');

        return prisma.execucaoAutomacao.findMany({
            where: { regraId },
            orderBy: { criadoAt: 'desc' },
            take: 50,
        });
    }
}

export const automacaoService = new AutomacaoService();
