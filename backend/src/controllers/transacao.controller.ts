import { Response } from 'express';
import { AuthRequest } from '../types/express.js';
import { transacaoService } from '../services/transacao.service.js';
import { asyncHandler } from '../middlewares/error.middleware.js';
import { BadRequestError } from '../types/errors.js';
import prisma from '../config/database.js';
import { decrypt } from '../utils/gateway-crypto.js';
import { mercadoPagoAdapter } from '../services/gateway/mercadopago.adapter.js';
import { logger } from '../utils/logger.js';

/** Listar transações de uma comanda */
export const listarPorComanda = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { comandaId } = req.params;
    const transacoes = await transacaoService.listarPorComanda(comandaId);
    res.json(transacoes);
});

/** Criar transação (admin) */
export const criar = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { comandaId, valor, metodo, provedor, providerId, observacao, status } = req.body;
    if (!comandaId || !valor) throw new BadRequestError('comandaId e valor são obrigatórios');
    const transacao = await transacaoService.criar({ comandaId, valor: Number(valor), metodo, provedor, providerId, observacao, status });
    res.status(201).json(transacao);
});

/** Atualizar status (admin) */
export const atualizarStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status, observacao } = req.body;
    if (!status) throw new BadRequestError('status é obrigatório');
    const transacao = await transacaoService.atualizarStatus(id, status, observacao);
    res.json(transacao);
});

/** Webhook genérico de gateway */
export const webhook = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { provedor } = req.params;
    const body = req.body;

    // Normaliza payload dos principais gateways
    let providerId: string | undefined;
    let status: string | undefined;

    if (provedor === 'mercadopago') {
        // O Mercado Pago só avisa "algo mudou" no corpo do webhook — o status oficial
        // sempre é obtido consultando a API de pagamentos, nunca confiando no payload recebido.
        providerId = body?.data?.id ?? (req.query['data.id'] as string | undefined) ?? body?.id;

        if (providerId) {
            try {
                const transacao = await prisma.transacao.findFirst({
                    where: { providerId: String(providerId), provedor: 'mercadopago' },
                    include: { comanda: true },
                });

                if (transacao) {
                    const credencial = await prisma.credencialGateway.findFirst({
                        where: { estabelecimentoId: transacao.comanda.estabelecimentoId, provedor: 'mercadopago', ativo: true },
                    });

                    if (credencial?.secretKey) {
                        const consulta = await mercadoPagoAdapter.consultarPagamento(String(providerId), {
                            publicKey: credencial.publicKey,
                            secretKey: decrypt(credencial.secretKey),
                        });
                        status = consulta.status;
                    }
                }
            } catch (error) {
                logger.warn('Falha ao consultar pagamento no Mercado Pago via webhook', { providerId });
            }
        }
    } else if (provedor === 'pagarme') {
        providerId = body?.id;
        status = body?.status;
    } else if (provedor === 'stripe') {
        const obj = body?.data?.object;
        providerId = obj?.id ?? body?.id;
        status = obj?.status ?? body?.type?.split('.')?.[2];
    } else {
        providerId = body?.id ?? body?.transaction_id ?? body?.providerId;
        status = body?.status;
    }

    if (!providerId || !status) {
        res.status(200).json({ processado: false, motivo: 'Payload incompleto — ignorado' });
        return;
    }

    const resultado = await transacaoService.processarWebhook({ providerId, provedor, status, observacao: JSON.stringify(body) });
    res.json(resultado);
});
