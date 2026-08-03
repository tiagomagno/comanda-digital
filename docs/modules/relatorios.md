# Módulo: Relatórios

> 2026-06-30

---

## Objetivo

Fornecer análises e relatórios de desempenho para o gestor do estabelecimento.

---

## Rotas Disponíveis

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | /api/gestor/analytics | admin | Analytics avançado |
| GET | /api/caixa/relatorio | admin | Relatório de vendas (dataInicio, dataFim) |
| GET | /api/crm/resumo | admin | Resumo CRM |

---

## Tela do Frontend

| Rota | Descrição |
|------|-----------|
| /admin/relatorios | Relatórios avançados |

---

## Relatórios por Plano

| Plano | Relatórios |
|-------|-----------|
| Start | Vendas do dia (básico) |
| Growth | Curva ABC, rentabilidade mensal |
| Scale | Completos + multi-lojas |

---

## Métricas Disponíveis

Implementadas nos controllers:
- `dashboard.controller.getDashboardStats` — métricas do dia
- `dashboard.controller.getAnalytics` — analytics por período
- `caixa.controller.relatorioVendas` — vendas por período
- `crm.controller.resumo` — CRM summary
