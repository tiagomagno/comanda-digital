# Módulo: Garçom

> 2026-06-30

---

## Objetivo

Permitir que garçons visualizem comandas e pedidos em tempo real, aprovem/rejeitem pedidos, processem pagamentos e gerenciem mesas e grupos.

---

## Rotas

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/garcom/comandas | Listar comandas ativas |
| GET | /api/garcom/comandas/:id | Detalhes da comanda |
| POST | /api/garcom/pedidos/:id/aprovar | Aprovar pedido |
| POST | /api/garcom/pedidos/:id/rejeitar | Rejeitar pedido |
| POST | /api/garcom/comandas/:id/pagar | Processar pagamento imediato |
| POST | /api/garcom/comandas/:id/fechar | Fechar comanda |
| PUT | /api/garcom/mesas/:id/capacidade | Ajustar capacidade |
| GET | /api/garcom/grupos-mesa | Listar grupos |
| POST | /api/garcom/grupos-mesa | Criar grupo |
| PUT | /api/garcom/grupos-mesa/:id | Atualizar grupo |
| DELETE | /api/garcom/grupos-mesa/:id | Desfazer agrupamento |

---

## Telas do Frontend

| Rota | Descrição |
|------|-----------|
| /garcom | Lista de comandas ativas |
| /garcom/comanda/:id | Detalhe da comanda com pedidos |

---

## Grupos de Mesa

Permite unir mesas para eventos ou grupos grandes:
- `GrupoMesa` com capacidade total
- `MesaGrupo` como tabela pivot (N:M entre Mesa e GrupoMesa)
- Comanda pode ser vinculada ao grupo inteiro

---

## Formas de Pagamento

O garçom pode processar pagamento de duas formas:
1. **Imediato** (`formaPagamento = imediato`) — paga antes do preparo
2. **Final** (`formaPagamento = final`) — paga ao fechar a comanda

---

## Acesso

Auth: `garcomMiddleware` → tipo `garcom` ou `admin`

Login: email/senha ou código de acesso (`codigoAcesso`)
