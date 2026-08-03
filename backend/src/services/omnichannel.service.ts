import prisma from '../config/database.js';
import { clienteService } from './cliente.service.js';
import { NotFoundError, BadRequestError } from '../types/errors.js';
import { logger } from '../utils/logger.js';

/**
 * Formato normalizado de pedido externo
 * Todos os adaptadores (WhatsApp, iFood, etc.) devem produzir este formato.
 */
interface PedidoNormalizado {
    externalId?: string;
    cliente: { nome: string; telefone: string; email?: string };
    endereco: {
        cep: string; logradouro: string; numero: string;
        complemento?: string; bairro: string; cidade: string; estado: string;
    };
    itens: Array<{ produtoId: string; quantidade: number; observacoes?: string }>;
    metodoPagamento?: string;
    taxaEntrega?: number;
    observacoes?: string;
    cupomCodigo?: string;
}

export class OmnichannelService {

    // ─── Canais ────────────────────────────────────────────────────────────────

    async listarCanais(estabelecimentoId: string) {
        return prisma.canalExterno.findMany({
            where: { estabelecimentoId },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: { select: { pedidosExternos: true } },
            },
        });
    }

    async criarCanal(estabelecimentoId: string, data: {
        nome: string; tipo: string; webhookSecret?: string; configuracoes?: object;
    }) {
        return prisma.canalExterno.create({
            data: {
                estabelecimentoId,
                nome: data.nome,
                tipo: data.tipo as any,
                webhookSecret: data.webhookSecret,
                configuracoes: data.configuracoes ?? {},
            },
        });
    }

    async atualizarCanal(id: string, estabelecimentoId: string, data: Partial<{
        nome: string; ativo: boolean; webhookSecret: string; configuracoes: object;
    }>) {
        const canal = await prisma.canalExterno.findFirst({ where: { id, estabelecimentoId } });
        if (!canal) throw new NotFoundError('Canal não encontrado');
        return prisma.canalExterno.update({ where: { id }, data: data as any });
    }

    async deletarCanal(id: string, estabelecimentoId: string) {
        const canal = await prisma.canalExterno.findFirst({ where: { id, estabelecimentoId } });
        if (!canal) throw new NotFoundError('Canal não encontrado');
        await prisma.canalExterno.delete({ where: { id } });
    }

    async listarPedidosExternos(canalId: string, estabelecimentoId: string) {
        // Valida que o canal pertence ao estabelecimento
        const canal = await prisma.canalExterno.findFirst({ where: { id: canalId, estabelecimentoId } });
        if (!canal) throw new NotFoundError('Canal não encontrado');
        return prisma.pedidoExterno.findMany({
            where: { canalId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }

    // ─── Webhook: recebe pedido externo e cria comanda ────────────────────────

    async receberWebhook(canalId: string, rawPayload: any): Promise<{ pedidoExternoId: string; processado: boolean; comandaId?: string; erro?: string }> {
        const canal = await prisma.canalExterno.findUnique({ where: { id: canalId } });
        if (!canal || !canal.ativo) throw new BadRequestError('Canal inativo ou não encontrado');

        // Registra o pedido externo com status "recebido"
        const pedidoExterno = await prisma.pedidoExterno.create({
            data: {
                canalId,
                externalId: rawPayload.id ?? rawPayload.orderId ?? null,
                status: 'recebido',
                payload: rawPayload,
            },
        });

        try {
            // Normaliza o payload de acordo com o tipo de canal
            const normalizado = this._normalizarPayload(canal.tipo as string, rawPayload);

            // Cria comanda + pedido via clienteService
            const resultado = await clienteService.iniciarPedidoDelivery({
                estabelecimentoId: canal.estabelecimentoId,
                cliente: normalizado.cliente,
                endereco: normalizado.endereco,
                itens: normalizado.itens,
                metodoPagamento: normalizado.metodoPagamento as any,
                taxaEntrega: normalizado.taxaEntrega,
                observacoes: normalizado.observacoes,
                cupomCodigo: normalizado.cupomCodigo,
            });

            // Vincula pedido externo à comanda criada
            await prisma.pedidoExterno.update({
                where: { id: pedidoExterno.id },
                data: { status: 'processado', comandaId: resultado.comanda.id },
            });

            logger.info('Pedido externo processado', {
                canalId, canal: canal.nome, comandaId: resultado.comanda.id,
            });

            return { pedidoExternoId: pedidoExterno.id, processado: true, comandaId: resultado.comanda.id };
        } catch (error: any) {
            await prisma.pedidoExterno.update({
                where: { id: pedidoExterno.id },
                data: { status: 'erro', erroMensagem: error.message },
            });

            logger.error('Erro ao processar pedido externo', { canalId, erro: error.message });
            return { pedidoExternoId: pedidoExterno.id, processado: false, erro: error.message };
        }
    }

    /**
     * Normaliza o payload bruto de cada tipo de canal para o formato interno.
     * Cada integração tem seu próprio formato — aqui centralizamos a lógica.
     */
    private _normalizarPayload(tipoCanal: string, payload: any): PedidoNormalizado {
        switch (tipoCanal) {
            case 'ifood': return this._normalizarIfood(payload);
            case 'whatsapp': return this._normalizarWhatsapp(payload);
            default: return this._normalizarGenerico(payload);
        }
    }

    /** Adaptador para iFood */
    private _normalizarIfood(p: any): PedidoNormalizado {
        const customer = p.customer ?? {};
        const delivery = p.deliveryAddress ?? {};
        return {
            externalId: p.id ?? p.reference,
            cliente: {
                nome: customer.name ?? 'Cliente iFood',
                telefone: customer.phone?.number ?? '00000000000',
                email: customer.email,
            },
            endereco: {
                cep: delivery.postalCode ?? '00000000',
                logradouro: delivery.streetName ?? 'Rua não informada',
                numero: delivery.streetNumber ?? 's/n',
                complemento: delivery.complement,
                bairro: delivery.neighborhood ?? '',
                cidade: delivery.city ?? '',
                estado: delivery.state ?? '',
            },
            itens: (p.items ?? []).map((item: any) => ({
                produtoId: item.externalCode ?? item.id,
                quantidade: item.quantity ?? 1,
                observacoes: item.observations,
            })),
            metodoPagamento: p.payments?.[0]?.name?.toLowerCase().includes('pix') ? 'pix' : 'cartao_credito',
            taxaEntrega: Number(p.deliveryFee ?? 0),
            observacoes: p.merchant?.observation,
        };
    }

    /** Adaptador para WhatsApp (Evolution API / Baileys) */
    private _normalizarWhatsapp(p: any): PedidoNormalizado {
        // Formato genérico — cada implementação de WhatsApp Bot terá seu próprio schema
        return {
            externalId: p.messageId ?? p.id,
            cliente: {
                nome: p.customerName ?? p.pushName ?? 'Cliente WhatsApp',
                telefone: p.phoneNumber ?? p.from?.replace('@s.whatsapp.net', ''),
            },
            endereco: p.deliveryAddress ?? {
                cep: '00000000', logradouro: 'A confirmar', numero: 's/n',
                bairro: '', cidade: '', estado: '',
            },
            itens: p.items ?? [],
            metodoPagamento: p.paymentMethod ?? 'pix',
            taxaEntrega: p.deliveryFee ?? 0,
            observacoes: p.notes ?? p.observation,
        };
    }

    /** Adaptador genérico (formato Dine padronizado) */
    private _normalizarGenerico(p: any): PedidoNormalizado {
        if (!p.cliente || !p.itens) throw new BadRequestError('Payload inválido: campos cliente e itens são obrigatórios');
        return p as PedidoNormalizado;
    }
}

export const omnichannelService = new OmnichannelService();
