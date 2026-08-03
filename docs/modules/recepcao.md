# Módulo: Recepção

> Fila de Espera + Reservas | 2026-06-30

---

## Objetivo

Gerenciar a entrada de clientes no estabelecimento, controle de fila de espera e reservas de mesas.

---

## Fila de Espera

### Rotas

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | /api/gestor/recepcao/fila | admin | Adicionar à fila |
| GET | /api/gestor/recepcao/fila | admin | Listar fila |
| PATCH | /api/gestor/recepcao/fila/:id/status | admin | Atualizar status |
| DELETE | /api/gestor/recepcao/fila/:id | admin | Remover da fila |

### Status da Fila

```
aguardando → chamado → sentado | cancelado
```

### Tela

| Rota | Descrição |
|------|-----------|
| /admin/recepcao/fila | Painel de fila de espera |

---

## Reservas

### Rotas

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | /api/gestor/recepcao/reservas | admin | Criar reserva |
| GET | /api/gestor/recepcao/reservas | admin | Listar reservas |
| PATCH | /api/gestor/recepcao/reservas/:id/status | admin | Atualizar status |
| DELETE | /api/gestor/recepcao/reservas/:id | admin | Remover reserva |

### Status da Reserva

```
pendente → confirmada → concluida | cancelada
```

### Campos da Reserva

| Campo | Descrição |
|-------|-----------|
| `nomeCliente` | Nome do cliente |
| `telefone` | Contato |
| `quantidadePessoas` | Número de pessoas |
| `dataHora` | Data e hora da reserva |
| `observacoes` | Notas especiais |

### Tela

| Rota | Descrição |
|------|-----------|
| /admin/recepcao/reservas | Gestão de reservas |
