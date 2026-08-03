# ADR-005: Modelo de Billing SaaS

**Status:** Aceito  
**Data:** 2025-2026  
**Revisado em:** 2026-06-30

---

## Contexto

O Dine precisa monetizar através de assinaturas recorrentes de restaurantes. O modelo deve suportar trial sem cartão, planos escalonados e cobrança automática.

---

## Decisão

Usar **Stripe** como gateway de cobrança para as assinaturas SaaS da plataforma.

- Trial de 15 dias sem cartão (Product-Led Growth)
- 3 planos: Start, Growth, Scale
- Cobrança mensal recorrente via Stripe Subscriptions
- Estados da assinatura gerenciados via webhooks Stripe

---

## Consequências

### Positivas
- Stripe é o padrão de mercado para SaaS billing
- Webhooks confiáveis para atualização de status
- Stripe Customer Portal para autoatendimento do cliente
- Dashboard rico para visualização de MRR, churn, etc.
- SDK bem documentado para TypeScript

### Negativas
- Stripe não está disponível diretamente no Brasil para recebimento em R$ (requer Stripe com conta US ou parceiro)
- Taxa de 2.9% + $0.30 por transação
- Complexidade de dunning para mercado brasileiro (Pix é preferido)

---

## Alternativas Consideradas

| Alternativa | Razão da Rejeição |
|------------|-------------------|
| Pagar.me Assinaturas | Menor ecossistema de SDK, menos features |
| Asaas | Focado no mercado brasileiro, mas SDK menos robusto |
| Iugu | Descontinuação de algumas features, incerteza |
| Implementação própria | Alto custo, sem vantagem competitiva |

---

## Revisão Futura

Avaliar suporte a Pix recorrente como método de pagamento alternativo para o mercado brasileiro, via integração com Banco Inter ou Asaas.
