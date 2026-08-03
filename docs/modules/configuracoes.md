# Módulo: Configurações

> 2026-06-30

---

## Objetivo

Permitir que o gestor configure as preferências e dados do estabelecimento.

---

## Rota

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| PUT | /api/auth/me/estabelecimento | admin | Atualizar dados do estabelecimento |

---

## Tela do Frontend

| Rota | Descrição |
|------|-----------|
| /admin/configuracoes | Configurações do estabelecimento |

---

## Dados Configuráveis

| Campo | Descrição |
|-------|-----------|
| `nome` | Nome do estabelecimento |
| `telefone` | Telefone de contato |
| `email` | Email do estabelecimento |
| `endereco` / `cidade` / `estado` / `cep` | Localização |
| `lotacaoMaxima` | Capacidade máxima do salão |
| `permiteCmdIndiv` | Permitir comandas individuais |
| `operaLocal` | Opera em modo salão |
| `operaHospedado` | Opera em modo hospedagem |
| `operaDelivery` | Opera delivery |
| `configuracoes` | JSON livre para configurações extras |

---

## Modos de Operação

O estabelecimento pode operar em um ou mais modos:
- **Local:** comandas de mesa e individuais no salão
- **Hospedado:** comandas em hotéis/eventos
- **Delivery:** pedidos com endereço de entrega
