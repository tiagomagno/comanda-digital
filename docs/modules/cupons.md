# Módulo: Cupons

> 2026-06-30

---

## Objetivo

Gerenciar cupons de desconto para uso nas comandas de delivery e consumo no local.

---

## Tipos de Cupom

| Tipo | Descrição | Exemplo |
|------|-----------|---------|
| `percentual` | Desconto em % sobre o total | 10% off |
| `fixo` | Valor fixo de desconto | R$ 5,00 off |

---

## Campos do Cupom

| Campo | Descrição |
|-------|-----------|
| `codigo` | Código do cupom (ex: BEMVINDO10) |
| `tipo` | percentual ou fixo |
| `valor` | Valor ou percentual do desconto |
| `valorMinimo` | Valor mínimo de pedido para usar |
| `usoMaximo` | Limite de usos totais (null = ilimitado) |
| `usoAtual` | Contador de usos |
| `dataInicio` / `dataFim` | Período de validade |
| `ativo` | Ativo/inativo |

---

## Rotas

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | /api/cupons/validar | Não | Validar cupom (cliente) |
| GET | /api/cupons | admin | Listar cupons |
| POST | /api/cupons | admin | Criar cupom |
| PUT | /api/cupons/:id | admin | Atualizar |
| DELETE | /api/cupons/:id | admin | Deletar |

---

## Validação

A rota pública `/api/cupons/validar` recebe `{ codigo, estabelecimentoId, valor }` e retorna:
- Se cupom existe e está ativo
- Se valor mínimo é atendido
- Valor do desconto calculado

O desconto é aplicado na `Comanda.desconto`.

---

## Tela do Frontend

| Rota | Descrição |
|------|-----------|
| /admin/cupons | Gestão de cupons |
