# Roadmap Comercial — Dine

> Baseado em PLANO_TATICO_90_DIAS_BRANDING_BILLING.md | 2026-06-30

---

## Ciclo 90 Dias (Branding + Billing + SaaS)

### Sprint 1-2 (Semanas 1-4) — Definição e Fundação
- Arquitetura de marca e guidelines
- Modelo comercial (planos, trial, grace period)
- Escolha de gateway de cobrança
- Migrations de billing (plans, subscriptions)
- Camada de entitlements por plano

### Sprint 3-4 (Semanas 5-8) — Produto e Cobrança
- Design system nas telas core
- Área "Plano e Faturamento" no painel do gestor
- Onboarding PLG com trial automatizado
- Cobrança recorrente + webhooks Stripe
- Máquina de estados da assinatura
- Dunning básico

### Sprint 5-6 (Semanas 9-12) — BYOG e Go-Live
- Tela de configuração de gateway para o lojista
- Checkout usando credenciais dinâmicas do lojista
- Piloto com grupo reduzido de clientes
- Runbook de operação e suporte

---

## Backlog Priorizado

### P0 — Obrigatório
- Assinatura recorrente (Stripe + Pix)
- Entitlements por plano
- Onboarding trial completo
- Cadastro de chaves BYOG pelo restaurante

### P1 — Escala
- Dunning avançado (réguas de cobrança)
- Upgrade/downgrade com prorata no painel
- Mais gateways de lojistas
- Dashboard financeiro de assinaturas no superadmin

### P2 — Otimização
- Cupons promocionais de assinatura
- Plano anual com desconto
- Planos por perfil operacional (local/hospedado/delivery)

---

## KPIs de Acompanhamento

| KPI | Frequência de revisão |
|-----|----------------------|
| Conversão trial → pago | Semanal |
| MRR | Mensal |
| ARPA | Mensal |
| Churn | Mensal |
| Inadimplência e recuperação | Semanal |
| CSAT/NPS | Trimestral |
