# Mapa de Rotas — API Dine

> Fonte: `backend/src/routes/` | Base URL: `/api` | Atualizado em: 2026-06-30

---

## Autenticação (`/api/auth`)

| Método | Rota | Auth | Body/Params | Descrição |
|--------|------|------|-------------|-----------|
| POST | /auth/login | Não | `{ email, senha }` | Login |
| POST | /auth/register | Não | `{ nome, email, senha, ... }` | Criar admin |
| POST | /auth/onboarding | Não | `{ nomeEstab, nome, email, senha, ... }` | Self-onboarding |
| POST | /auth/forgot-password | Não | `{ email }` | Recuperar senha |
| POST | /auth/reset-password | Não | `{ token, senha }` | Redefinir senha |
| GET | /auth/me | Sim | — | Usuário autenticado |
| PUT | /auth/me/estabelecimento | Sim | `{ nome, ... }` | Atualizar estabelecimento |
| POST | /auth/pre-cadastro | Não | `{ email, nomeEstab, ... }` | Lead landing page |
| GET | /auth/pre-cadastro/:token | Não | — | Buscar lead por token |

---

## Gestor (`/api/gestor`) — Auth: admin

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /gestor/dashboard | Métricas do dashboard |
| GET | /gestor/analytics | Analytics avançado |
| GET | /gestor/avaliacoes | Listar avaliações recebidas |
| GET | /gestor/mesas | Listar mesas |
| POST | /gestor/mesas | Criar mesa (gera QR Code) |
| PUT | /gestor/mesas/:id | Atualizar mesa |
| DELETE | /gestor/mesas/:id | Deletar mesa |
| POST | /gestor/mesas/:id/regenerate-qr | Regenerar QR Code |
| GET | /gestor/mesas/:id/qrcode | Download QR Code (PNG) |
| POST | /gestor/recepcao/fila | Adicionar à fila de espera |
| GET | /gestor/recepcao/fila | Listar fila de espera |
| PATCH | /gestor/recepcao/fila/:id/status | Atualizar status na fila |
| DELETE | /gestor/recepcao/fila/:id | Remover da fila |
| POST | /gestor/recepcao/reservas | Criar reserva |
| GET | /gestor/recepcao/reservas | Listar reservas |
| PATCH | /gestor/recepcao/reservas/:id/status | Atualizar status da reserva |
| DELETE | /gestor/recepcao/reservas/:id | Remover reserva |

---

## Garçom (`/api/garcom`) — Auth: garcom/admin

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /garcom/comandas | Listar comandas ativas |
| GET | /garcom/comandas/:id | Detalhes da comanda |
| POST | /garcom/pedidos/:id/aprovar | Aprovar pedido |
| POST | /garcom/pedidos/:id/rejeitar | Rejeitar pedido |
| POST | /garcom/comandas/:id/pagar | Processar pagamento imediato |
| POST | /garcom/comandas/:id/fechar | Fechar comanda |
| PUT | /garcom/mesas/:id/capacidade | Ajustar capacidade da mesa |
| GET | /garcom/grupos-mesa | Listar grupos de mesas |
| POST | /garcom/grupos-mesa | Criar grupo de mesas |
| PUT | /garcom/grupos-mesa/:id | Atualizar grupo |
| DELETE | /garcom/grupos-mesa/:id | Desfazer agrupamento |

---

## Cozinha/Bar (`/api/cozinha`) — Auth: cozinha/bar/admin

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /cozinha/pedidos | Listar pedidos (Kanban, filtros: destino, status) |
| PUT | /cozinha/pedidos/:id/status | Atualizar status (em_preparo, pronto, entregue) |
| GET | /cozinha/estatisticas | Estatísticas da cozinha/bar |

---

## Caixa (`/api/caixa`) — Auth: admin

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /caixa/comandas | Listar comandas aguardando pagamento |
| POST | /caixa/comandas/:id/pagar | Processar pagamento final |
| POST | /caixa/comandas/:id/fechar | Fechar comanda |
| GET | /caixa/relatorio | Relatório de vendas (dataInicio, dataFim) |

---

## Cliente (`/api/cliente`) — Público

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /cliente/mesa/:estabelecimentoId/:mesaId | Escanear QR Code / verificar comanda ativa |
| POST | /cliente/comandas | Criar comanda (mesa/individual) |
| GET | /cliente/cardapio/:estabelecimentoId | Ver cardápio |
| POST | /cliente/pedidos | Criar pedido |
| GET | /cliente/comandas/:codigo | Ver status da comanda |
| POST | /cliente/delivery/registrar | Registrar/identificar cliente delivery |
| POST | /cliente/delivery/login | Login cliente delivery por telefone |
| GET | /cliente/delivery/:id | Buscar dados do cliente |
| GET | /cliente/delivery/:clienteId/enderecos | Listar endereços salvos |
| POST | /cliente/delivery/enderecos | Adicionar endereço |
| POST | /cliente/delivery/pedido | Fluxo completo delivery (cliente + endereço + comanda + pedido) |

---

## Comandas (`/api/comandas`) — Público

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /comandas | Criar comanda |
| GET | /comandas/codigo/:codigo | Buscar por código |
| GET | /comandas/:id | Buscar por ID |
| GET | /comandas/:id/pedidos | Listar pedidos da comanda |
| GET | /comandas | Listar comandas ativas |
| PATCH | /comandas/:id/status | Atualizar status |

---

## Pedidos (`/api/pedidos`) — Público/Misto

| Método | Rota | Descrição |
|--------|------|-----------|
| (ver controller pedido.controller) | — | CRUD de pedidos |

---

## Categorias (`/api/categorias`) — Misto

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | /categorias | Sim | Listar categorias do estabelecimento |
| GET | /categorias/:id | Não | Buscar categoria por ID |
| POST | /categorias | Admin | Criar categoria |
| PUT | /categorias/:id | Admin | Atualizar categoria |
| DELETE | /categorias/:id | Admin | Deletar categoria |
| POST | /categorias/reordenar | Admin | Reordenar categorias |

---

## Produtos (`/api/produtos`) — Misto

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| (CRUD padrão) | — | Admin | CRUD produtos |

---

## Cardápio (`/api/cardapio`) — Público

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /cardapio | Cardápio completo (?estabelecimentoId=) |
| GET | /cardapio/estabelecimentos | Listar estabelecimentos ativos |
| GET | /cardapio/estabelecimento/:id | Detalhes de um estabelecimento |

---

## Preparo (`/api/preparo`) — Auth: cozinha/bar/admin

| Método | Rota | Descrição |
|--------|------|-----------|
| (ver controller preparo.controller) | — | Ações de preparo KDS |

---

## Super Admin (`/api/superadmin`) — Auth: superadmin

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /superadmin/dashboard | Métricas da plataforma |
| GET | /superadmin/estabelecimentos | Listar estabelecimentos |
| POST | /superadmin/estabelecimentos | Criar estabelecimento + admin |
| GET | /superadmin/estabelecimentos/:id | Detalhes do estabelecimento |
| PUT | /superadmin/estabelecimentos/:id | Atualizar estabelecimento |
| PATCH | /superadmin/estabelecimentos/:id/toggle | Ativar/desativar |
| GET | /superadmin/usuarios | Listar gestores da plataforma |
| POST | /superadmin/criar-superadmin | Criar novo superadmin |

---

## Assinaturas (`/api/assinaturas`) — Misto

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | /assinaturas/planos | Não | Listar planos disponíveis |
| POST | /assinaturas/webhook/stripe | Não | Webhook Stripe (express.raw) |
| GET | /assinaturas/meustatus | Sim | Status da assinatura do gestor |
| POST | /assinaturas/assinar | Sim | Iniciar checkout Stripe |

---

## Gateways BYOG (`/api/gateways`) — Auth: admin

| Método | Rota | Descrição |
|--------|------|-----------|
| (ver controller gateway.controller) | — | CRUD credenciais de gateway do lojista |

---

## Pagamentos Parciais (`/api/pagamentos-parciais`) — Público

| Método | Rota | Descrição |
|--------|------|-----------|
| (ver controller pagamento.controller) | — | Divisão de conta |

---

## Avaliações (`/api/avaliacoes`) — Público/Admin

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | /avaliacoes | Não | Criar avaliação pós-comanda |
| GET | /avaliacoes/:estabelecimentoId | Não | Listar avaliações por estabelecimento |

---

## Cupons (`/api/cupons`) — Misto

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | /cupons/validar | Não | Validar cupom |
| GET | /cupons | Sim | Listar cupons |
| POST | /cupons | Admin | Criar cupom |
| PUT | /cupons/:id | Admin | Atualizar cupom |
| DELETE | /cupons/:id | Admin | Deletar cupom |

---

## Expedição (`/api/expedicao`) — Auth: admin

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /expedicao/pedidos | Kanban de expedição |
| PUT | /expedicao/pedidos/:id/status | Transicionar status |

---

## Transações (`/api/transacoes`) — Auth: admin

| Método | Rota | Descrição |
|--------|------|-----------|
| (ver controller transacao.controller) | — | Consulta de transações |

---

## Delivery / Entregadores (`/api/delivery`) — Misto

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | /delivery/entregadores | Admin | Listar entregadores |
| GET | /delivery/entregadores/:id/localizacao | Admin | Última localização |
| POST | /delivery/corridas | Admin | Criar corrida |
| GET | /delivery/corridas | Admin | Listar corridas |
| PATCH | /delivery/corridas/:id/status | Admin | Atualizar status (admin) |
| PATCH | /delivery/meu-status | Entregador | Atualizar status próprio |
| GET | /delivery/minhas-corridas | Entregador | Corridas do entregador |
| PATCH | /delivery/corridas/:id/acao | Entregador | Aceitar/recusar/avançar corrida |
| POST | /delivery/localizacao | Entregador | Enviar localização GPS |

---

## Automações (`/api/automacoes`) — Auth: admin

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /automacoes | Listar regras |
| POST | /automacoes | Criar regra |
| PUT | /automacoes/:id | Atualizar regra |
| DELETE | /automacoes/:id | Deletar regra |
| POST | /automacoes/processar | Executar automações pendentes |
| GET | /automacoes/:id/historico | Histórico de execuções |

---

## CRM (`/api/crm`) — Auth: admin

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /crm/clientes | Listar clientes com histórico |
| GET | /crm/resumo | Resumo/métricas CRM |
| POST | /crm/campanha | Criar campanha de marketing |

---

## Omnichannel (`/api/omnichannel`) — Misto

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | /omnichannel/canais | Admin | Listar canais externos |
| POST | /omnichannel/canais | Admin | Criar canal |
| PUT | /omnichannel/canais/:id | Admin | Atualizar canal |
| DELETE | /omnichannel/canais/:id | Admin | Deletar canal |
| GET | /omnichannel/canais/:id/pedidos | Admin | Listar pedidos externos |
| POST | /omnichannel/webhook/:canalId | Não | Receber pedido externo (webhook) |

---

## Importar (`/api/importar`) — Auth: admin

| Método | Rota | Descrição |
|--------|------|-----------|
| (ver controller importar.controller) | — | Importação de produtos via CSV |

---

## Upload (`/api/upload`) — Auth: Sim

| Método | Rota | Descrição |
|--------|------|-----------|
| (ver controller upload) | — | Upload de imagens via Multer |
