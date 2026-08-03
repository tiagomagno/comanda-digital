# Módulo: CRM

> 2026-06-30

---

## Objetivo

Fornecer visibilidade sobre a base de clientes do restaurante, histórico de consumo, e ferramentas básicas de relacionamento.

---

## Rotas

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | /api/crm/clientes | admin | Listar clientes com histórico de comandas |
| GET | /api/crm/resumo | admin | Métricas de CRM (LTV, frequência, etc.) |
| POST | /api/crm/campanha | admin | Criar campanha de marketing |

---

## Tela do Frontend

| Rota | Descrição |
|------|-----------|
| /admin/clientes | Listagem e análise de clientes |

---

## Entidade Cliente

```prisma
model Cliente {
  estabelecimentoId String  // scoped por estabelecimento
  nome              String
  telefone          String  // identificador principal
  email             String?
  cpf               String?
  enderecos         EnderecoCliente[]
  comandas          Comanda[]
}
```

Clientes são scoped por estabelecimento — o mesmo telefone pode ser cliente de diferentes restaurantes.

---

## Métricas Disponíveis (via /crm/resumo)

Implementação no `crm.service.ts`. Métricas prováveis:
- Total de clientes
- Clientes ativos (com pedido nos últimos 30 dias)
- Ticket médio por cliente
- Frequência média de visitas

---

## Integração com Automações

O módulo CRM se integra com Automações para campanhas de retenção:
- Clientes inativos → `TipoAutomacao.cliente_inativo`
- Pós-consumo → `TipoAutomacao.apos_entrega`
