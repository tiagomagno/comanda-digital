# Visão Geral da API — Dine

> 2026-06-30

---

## Base URL

```
http://localhost:3001/api        # desenvolvimento
https://api.dine.com.br/api      # produção (exemplo)
```

---

## Autenticação

A API usa **Bearer Token JWT** no header Authorization:

```
Authorization: Bearer <token>
```

Tokens são obtidos via `POST /api/auth/login` ou `POST /api/auth/onboarding`.

### Rotas Públicas (sem autenticação)

- `GET /api/cardapio`
- `GET /api/cardapio/estabelecimento/:id`
- `POST /api/cliente/comandas`
- `POST /api/cliente/pedidos`
- `GET /api/cliente/comandas/:codigo`
- `POST /api/cupons/validar`
- `POST /api/avaliacoes`
- `POST /api/omnichannel/webhook/:canalId`
- `GET /api/assinaturas/planos`

---

## Formato de Resposta

### Sucesso
```json
{
  "id": "uuid",
  "nome": "...",
  ...
}
```

Listas retornam array diretamente ou paginado:
```json
[{ ... }, { ... }]
```

### Erro
```json
{
  "error": "Descrição do erro",
  "code": "PRISMA_ERROR_CODE",
  "details": {}
}
```

---

## Códigos HTTP

| Código | Significado |
|--------|-------------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request (validação) |
| 401 | Unauthorized (sem token) |
| 403 | Forbidden (papel insuficiente) |
| 404 | Not Found |
| 409 | Conflict (ex: CNPJ duplicado) |
| 500 | Internal Server Error |

---

## Endpoints de Sistema

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /health | Health check: `{ status, timestamp, uptime }` |
| GET | / | Info da API |
| GET | /api/ping | Pong |

---

## Módulos da API

| Módulo | Prefixo | Docs |
|--------|---------|------|
| Auth | /api/auth | [auth.md](../backend/auth.md) |
| Gestor | /api/gestor | [routes.md](../backend/routes.md) |
| Garçom | /api/garcom | [garcom.md](../modules/garcom.md) |
| Cozinha/Bar | /api/cozinha | [kds.md](../modules/kds.md) |
| Caixa | /api/caixa | [caixa.md](../modules/caixa.md) |
| Cliente | /api/cliente | [cliente.md](../modules/cliente.md) |
| Comandas | /api/comandas | [comanda.md](../modules/comanda.md) |
| Pedidos | /api/pedidos | [pedido.md](../modules/pedido.md) |
| Cardápio | /api/cardapio | [cardapio.md](../modules/cardapio.md) |
| Cupons | /api/cupons | [cupons.md](../modules/cupons.md) |
| Expedição | /api/expedicao | [expedicao.md](../modules/expedicao.md) |
| Delivery | /api/delivery | [delivery.md](../modules/delivery.md) |
| Automações | /api/automacoes | [automacoes.md](../modules/automacoes.md) |
| CRM | /api/crm | [crm.md](../modules/crm.md) |
| Omnichannel | /api/omnichannel | [omnichannel.md](../modules/omnichannel.md) |
| Assinaturas | /api/assinaturas | [assinaturas.md](../modules/assinaturas.md) |
| Super Admin | /api/superadmin | [superadmin.md](../modules/superadmin.md) |

---

## Referência Completa de Rotas

Ver `docs/backend/routes.md` para o mapa completo de todas as rotas.
