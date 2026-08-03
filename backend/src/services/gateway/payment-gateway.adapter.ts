/**
 * Contrato comum para integrações de gateway de pagamento (modelo BYOG:
 * as credenciais pertencem ao estabelecimento, nunca à Dine).
 */

export interface CredencialDecrypted {
    publicKey: string | null;
    secretKey: string;
}

export interface CobrancaPixResult {
    providerId: string;
    qrCodeBase64: string | null;
    copiaECola: string | null;
    status: string;
}

export interface CobrancaCartaoResult {
    providerId: string;
    checkoutUrl: string;
    status: string;
}

export interface ConsultaPagamentoResult {
    status: string;
    raw: unknown;
}

export interface CriarCobrancaPixInput {
    valor: number;
    descricao: string;
    referenciaExterna: string;
    credencial: CredencialDecrypted;
    payerEmail?: string;
}

export interface CriarCheckoutCartaoInput {
    valor: number;
    descricao: string;
    referenciaExterna: string;
    credencial: CredencialDecrypted;
    backUrls: {
        success: string;
        failure: string;
        pending: string;
    };
}

export interface PaymentGatewayAdapter {
    criarCobrancaPix(input: CriarCobrancaPixInput): Promise<CobrancaPixResult>;
    criarCheckoutCartao(input: CriarCheckoutCartaoInput): Promise<CobrancaCartaoResult>;
    consultarPagamento(providerId: string, credencial: CredencialDecrypted): Promise<ConsultaPagamentoResult>;
}
