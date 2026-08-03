# Módulo: Assinaturas

> 2026-06-30

---

## Objetivo

Gerenciar o ciclo de vida das assinaturas SaaS dos estabelecimentos, desde o trial até o cancelamento.

---

## Rotas

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | /api/assinaturas/planos | Não | Listar planos (para landing page) |
| POST | /api/assinaturas/webhook/stripe | Não | Webhook Stripe |
| GET | /api/assinaturas/meustatus | admin | Status da assinatura do gestor |
| POST | /api/assinaturas/assinar | admin | Iniciar checkout Stripe |

---

## Entidades

```
Estabelecimento 1:1 Assinatura N:1 Plano
```

---

## Ciclo de Vida

Ver documentação completa em `docs/business/plans.md`.

---

## Webhook Stripe

O webhook usa `express.raw()` para preservar o body original, necessário para validação da assinatura HMAC.

Eventos processados:
- `checkout.session.completed` → status = active
- `invoice.payment_succeeded` → renova currentPeriodEnd
- `invoice.payment_failed` → status = past_due
- `customer.subscription.deleted` → status = canceled

---

## Tela do Frontend

A área "Plano e Faturamento" no painel do gestor (implementação em `/admin/configuracoes` ou rota dedicada) exibe:
- Plano atual
- Data de vencimento / fim do trial
- Botão para upgrade/downgrade
- Histórico de faturas (via Stripe Customer Portal)
