import crypto from 'crypto';
import { logger } from '../../utils/logger.js';
import {
    PaymentGatewayAdapter,
    CriarCobrancaPixInput,
    CriarCheckoutCartaoInput,
    CobrancaPixResult,
    CobrancaCartaoResult,
    ConsultaPagamentoResult,
    CredencialDecrypted,
} from './payment-gateway.adapter.js';

const MP_API_BASE = 'https://api.mercadopago.com';

async function mpFetch(path: string, credencial: CredencialDecrypted, init: RequestInit = {}): Promise<any> {
    const response = await fetch(`${MP_API_BASE}${path}`, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${credencial.secretKey}`,
            ...(init.headers as Record<string, string> | undefined),
        },
    });

    const body: any = await response.json().catch(() => ({}));

    if (!response.ok) {
        logger.warn('Erro na chamada ao Mercado Pago', { path, status: response.status, body });
        throw new Error(body?.message || `Mercado Pago respondeu ${response.status}`);
    }

    return body;
}

export class MercadoPagoAdapter implements PaymentGatewayAdapter {
    async criarCobrancaPix(input: CriarCobrancaPixInput): Promise<CobrancaPixResult> {
        const body = await mpFetch('/v1/payments', input.credencial, {
            method: 'POST',
            headers: { 'X-Idempotency-Key': crypto.randomUUID() },
            body: JSON.stringify({
                transaction_amount: input.valor,
                description: input.descricao,
                payment_method_id: 'pix',
                external_reference: input.referenciaExterna,
                payer: { email: input.payerEmail || 'cliente@dine.app' },
            }),
        });

        const transactionData = body?.point_of_interaction?.transaction_data;

        return {
            providerId: String(body.id),
            qrCodeBase64: transactionData?.qr_code_base64 ?? null,
            copiaECola: transactionData?.qr_code ?? null,
            status: body.status,
        };
    }

    async criarCheckoutCartao(input: CriarCheckoutCartaoInput): Promise<CobrancaCartaoResult> {
        const body = await mpFetch('/checkout/preferences', input.credencial, {
            method: 'POST',
            body: JSON.stringify({
                items: [
                    {
                        title: input.descricao,
                        quantity: 1,
                        currency_id: 'BRL',
                        unit_price: input.valor,
                    },
                ],
                external_reference: input.referenciaExterna,
                back_urls: input.backUrls,
                auto_return: 'approved',
            }),
        });

        return {
            providerId: String(body.id),
            checkoutUrl: body.init_point,
            status: 'pendente',
        };
    }

    async consultarPagamento(providerId: string, credencial: CredencialDecrypted): Promise<ConsultaPagamentoResult> {
        const body = await mpFetch(`/v1/payments/${providerId}`, credencial, { method: 'GET' });
        return { status: body.status, raw: body };
    }
}

export const mercadoPagoAdapter = new MercadoPagoAdapter();
