# Módulo: Expedição

> 2026-06-30

---

## Objetivo

Gerenciar a separação e saída de pedidos prontos, tanto para consumo no salão quanto para delivery.

---

## Rotas

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | /api/expedicao/pedidos | admin | Kanban de expedição |
| PUT | /api/expedicao/pedidos/:id/status | admin | Transicionar status |

---

## Fluxo

```
KDS (pronto) → Expedição (em_expedicao) → Entregue
```

Pedidos que atingem `pronto` no KDS aparecem no painel de expedição.

---

## Tela do Frontend

| Rota | Descrição |
|------|-----------|
| /expedicao | Painel de expedição |

---

## Integração com Delivery

Para pedidos de delivery, o status `em_expedicao` corresponde ao momento em que o entregador coleta o pedido no estabelecimento.
