import { api } from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type MetodoCobranca = 'pix' | 'cartao';

export interface IniciarCobrancaDto {
    comandaCodigo: string;
    pedidoId?: string;
    metodo: MetodoCobranca;
}

export interface CobrancaPix {
    transacaoId: string;
    providerId: string;
    qrCodeBase64: string | null;
    copiaECola: string | null;
}

export interface CobrancaCartao {
    transacaoId: string;
    providerId: string;
    checkoutUrl: string;
}

export type CobrancaResult = CobrancaPix | CobrancaCartao;

// ─── Service ──────────────────────────────────────────────────────────────────

export const gatewayService = {
    /**
     * Inicia uma cobrança real (gateway BYOG do estabelecimento) de um pedido
     * específico ou da comanda inteira. Não exige autenticação (cliente paga
     * o próprio pedido).
     */
    async iniciarCobranca(dados: IniciarCobrancaDto): Promise<CobrancaResult> {
        return api.post<CobrancaResult>('/cliente/pagamento/iniciar', dados, { skipAuth: true });
    },
};
