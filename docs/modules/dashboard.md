# Módulo: Dashboard

> 2026-06-30

---

## Objetivo

Fornecer visibilidade operacional e financeira em tempo real para o gestor do estabelecimento.

---

## Rotas

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | /api/gestor/dashboard | admin | Métricas gerais |
| GET | /api/gestor/analytics | admin | Analytics avançado |

---

## Tela do Frontend

| Rota | Descrição |
|------|-----------|
| /admin/dashboard | Dashboard principal do gestor |
| /admin/relatorios | Relatórios avançados |

---

## Métricas Esperadas (implementação em dashboard.controller.ts)

- Total de vendas do dia/semana/mês
- Número de comandas abertas
- Ticket médio
- Pedidos por destino (bar vs cozinha)
- Top produtos vendidos
- Comandas por status

---

## Integração com Módulos

O dashboard agrega dados de:
- Comandas (total e status)
- Pedidos (volumes)
- Clientes (CRM — novos vs recorrentes)
- Avaliações (média de notas)
- Assinatura (status do plano atual)
