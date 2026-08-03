# Módulo: Delivery

> 2026-06-30

---

## Objetivo

Gerenciar pedidos de delivery do cliente final até a entrega, incluindo cadastro de clientes, endereços, corridas de entregadores e rastreamento GPS.

---

## Fluxo Completo de Delivery

```mermaid
sequenceDiagram
    participant C as Cliente
    participant API
    participant Admin
    participant Entregador

    C->>API: POST /api/cliente/delivery/registrar { telefone }
    API-->>C: clienteId (cria ou retorna existente)
    C->>API: POST /api/cliente/delivery/enderecos { cep, logradouro, ... }
    API-->>C: enderecoId
    C->>API: POST /api/cliente/delivery/pedido { itens, enderecoId, cupomId? }
    API-->>C: { comandaId, pedidoId, codigo }

    Note over API,Admin: Pedido aparece no painel do gestor

    Admin->>API: POST /api/delivery/corridas { comandaId, entregadorId }
    API-->>Entregador: Socket evento corrida oferecida

    Entregador->>API: PATCH /api/delivery/corridas/:id/acao { acao: aceitar }
    API-->>Admin: Socket: corrida aceita

    Entregador->>API: POST /api/delivery/localizacao { lat, lng }
    API-->>C: Socket: posição do entregador

    Entregador->>API: PATCH /api/delivery/corridas/:id/acao { acao: em_entrega }
    Entregador->>API: PATCH /api/delivery/corridas/:id/acao { acao: entregue }
    API-->>Admin: Corrida finalizada
```

---

## Entidades

### Cliente
- Identificado por telefone + estabelecimentoId
- Pode ter múltiplos endereços
- Pode ter senha para login subsequente

### Corrida
Representa a entrega física:

| Status | Descrição |
|--------|-----------|
| `oferecida` | Admin criou, aguarda aceitação |
| `aceita` | Entregador aceitou |
| `recusada` | Entregador recusou |
| `em_coleta` | Entregador a caminho do estabelecimento |
| `coletada` | Entregador coletou o pedido |
| `em_entrega` | Entregador a caminho do cliente |
| `entregue` | Entrega confirmada |
| `cancelada` | Corrida cancelada |

---

## Status do Entregador

```
offline → online → em_corrida
                 → pausado
```

---

## Rotas

### Admin
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/delivery/entregadores | Listar entregadores |
| GET | /api/delivery/entregadores/:id/localizacao | Última localização |
| POST | /api/delivery/corridas | Criar corrida |
| GET | /api/delivery/corridas | Listar corridas |
| PATCH | /api/delivery/corridas/:id/status | Atualizar status (admin) |

### Entregador
| Método | Rota | Descrição |
|--------|------|-----------|
| PATCH | /api/delivery/meu-status | Atualizar status próprio |
| GET | /api/delivery/minhas-corridas | Ver corridas próprias |
| PATCH | /api/delivery/corridas/:id/acao | Avançar estado da corrida |
| POST | /api/delivery/localizacao | Enviar GPS |

---

## Telas do Frontend

| Rota | Papel | Descrição |
|------|-------|-----------|
| /pedido/delivery | Cliente | Checkout delivery |
| /pedido/confirmar | Cliente | Confirmação do pedido |
| /pedido/pagamento | Cliente | Pagamento |
| /pedido/acompanhar | Cliente | Rastreamento |
| /entregador | Entregador | App do entregador |
| /admin/entregadores | Admin | Gestão de entregadores |
| /admin/pedidos | Admin | Kanban incluindo delivery |
