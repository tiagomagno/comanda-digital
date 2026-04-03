import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia', // Utilizando última versão provável
  typescript: true,
});

export class StripeService {
  /**
   * Cria uma sessão de Checkout no Stripe para assinatura de um plano Saas.
   */
  async criarSessaoCheckout(
    estabelecimentoId: string,
    email: string,
    stripePriceId: string,
    returnUrl: string
  ): Promise<string> {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        customer_email: email, // Opcional, pode ser atrelado ao Customer ID se já existir
        line_items: [
          {
            price: stripePriceId,
            quantity: 1,
          },
        ],
        success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}&status=success`,
        cancel_url: `${returnUrl}?status=cancelled`,
        client_reference_id: estabelecimentoId, // Para identificarmos no webhook
        subscription_data: {
          metadata: {
            estabelecimentoId,
          },
        },
      });

      return session.url as string;
    } catch (error) {
      console.error('Erro ao criar sessão no Stripe:', error);
      throw new Error('Não foi possível iniciar o pagamento com a operadora.');
    }
  }

  /**
   * Constrói o evento a partir do webhook garantindo a assinatura do cabeçalho
   */
  construirEventoWebhook(payload: string | Buffer, signature: string, webhookSecret: string): Stripe.Event {
    try {
      return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      throw new Error('Falha na validação de segurança do Webhook');
    }
  }

  /**
   * Cancela uma assinatura ativa no Stripe
   */
  async cancelarAssinatura(stripeSubscriptionId: string): Promise<Stripe.Subscription> {
    try {
      return await stripe.subscriptions.cancel(stripeSubscriptionId);
    } catch (error) {
      console.error('Erro ao cancelar assinatura no Stripe:', error);
      throw new Error('Não foi possível cancelar a assinatura na operadora.');
    }
  }
}

export const stripeService = new StripeService();
