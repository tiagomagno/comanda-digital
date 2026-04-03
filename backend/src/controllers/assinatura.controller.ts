import { Request, Response } from 'express';
import { AuthRequest } from '../types/express.js';
import prisma from '../config/database.js';
import { stripeService } from '../services/stripe.service.js';
import { asyncHandler } from '../middlewares/error.middleware.js';
import { BadRequestError, NotFoundError } from '../types/errors.js';

/**
 * Retorna todos os planos disponíveis no sistema
 */
export const getPlanos = asyncHandler(async (_req: Request, res: Response) => {
    const planos = await prisma.plano.findMany({
        orderBy: {
            preco: 'asc',
        },
    });

    res.json(planos);
});

/**
 * Retorna o status atual da assinatura do estabelecimento do Gestor Logado
 */
export const statusAssinatura = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.estabelecimentoId) {
        throw new BadRequestError('Estabelecimento não encontrado no token');
    }

    const estabelecimento = await prisma.estabelecimento.findUnique({
        where: { id: req.estabelecimentoId },
        include: {
            assinatura: {
                include: { plano: true }
            }
        }
    });

    if (!estabelecimento) {
        throw new NotFoundError('Estabelecimento não encontrado');
    }

    res.json({
        assinatura: estabelecimento.assinatura || null,
        // Helper util para o frontend
        isTrial: estabelecimento.assinatura?.status === 'trialing',
        isActive: estabelecimento.assinatura?.status === 'active' || estabelecimento.assinatura?.status === 'trialing',
    });
});

/**
 * Inicia o processo de assinatura de um Plano criando uma sessão no Stripe
 */
export const assinarPlano = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { planoId, returnUrl } = req.body;
    const { estabelecimentoId, userId } = req;

    if (!estabelecimentoId) {
        throw new BadRequestError('Estabelecimento não encontrado no token');
    }

    if (!planoId || !returnUrl) {
        throw new BadRequestError('Plano ID e Return URL são obrigatórios');
    }

    const plano = await prisma.plano.findUnique({ where: { id: planoId } });
    if (!plano || !plano.stripePriceId) {
        throw new NotFoundError('Plano não encontrado ou mal configurado no gateway de pagamento');
    }

    const usuario = await prisma.usuario.findUnique({ where: { id: userId } });
    
    // Iniciar Checkout na Stripe
    const checkoutUrl = await stripeService.criarSessaoCheckout(
        estabelecimentoId,
        usuario?.email || '',
        plano.stripePriceId,
        returnUrl
    );

    res.json({ checkoutUrl });
});

/**
 * Webhook Stripe: Rota não autenticada no sentido tradicional, mas validada pelo Header X-Stripe-Signature
 */
export const webhookStripe = async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
        res.status(400).send('Webhook Secret ou Assinatura não encontrados');
        return;
    }

    let event;

    try {
        // Importante: No express, req.body aqui precisa ser o RAW buffer para o constructEvent funcionar.
        // Necessário configurar o express express.raw({ type: 'application/json' }) específico para essa rota no `server.ts`
        event = stripeService.construirEventoWebhook(req.body, signature as string, webhookSecret);
    } catch (err: any) {
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as any;
                const estabelecimentoId = session.client_reference_id;
                
                if (estabelecimentoId) {
                    // Localiza a assinatura do cara e atualiza
                    await prisma.assinatura.updateMany({
                        where: { estabelecimentoId },
                        data: {
                            status: 'active',
                            stripeSubscriptionId: session.subscription as string,
                            trialEndsAt: null // Zera trial caso venha confirmar pgto
                        }
                    });
                }
                break;
            }
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as any;
                await prisma.assinatura.updateMany({
                    where: { stripeSubscriptionId: subscription.id },
                    data: { status: 'canceled' }
                });
                break;
            }
            case 'customer.subscription.updated': {
                const subscription = event.data.object as any;
                await prisma.assinatura.updateMany({
                    where: { stripeSubscriptionId: subscription.id },
                    data: { status: subscription.status }
                });
                break;
            }
            // Tratar outros eventos necessários (ex: pagamentos falhos)
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        res.status(200).json({ received: true });
    } catch (dbError) {
        console.error('Database Error processing webhook:', dbError);
        res.status(500).send('Erro interno ao processar webhook');
        return;
    }
};
