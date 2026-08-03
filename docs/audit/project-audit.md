# Auditoria do Projeto — Dine

> Gerado em: 2026-06-30 | Fonte: código-fonte (backend/frontend)

---

## 1. Visão Geral

| Item | Valor |
|------|-------|
| Nome | Dine |
| Tipo | SaaS B2B — Gestão Gastronômica |
| Stack Backend | Node.js + Express + TypeScript + Prisma + MySQL |
| Stack Frontend | Next.js 14 App Router + TypeScript + Tailwind |
| Banco de Dados | MySQL (via Prisma ORM) |
| Realtime | Socket.io |
| Autenticação | JWT (Bearer Token) |
| Pagamentos | Stripe (SaaS) + BYOG (MercadoPago, Pagar.me, Asaas) |

---

## 2. Estrutura de Pastas

```
dine/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Schema completo (30+ models)
│   └── src/
│       ├── app.ts                 # Express + Socket.io setup
│       ├── server.ts              # HTTP server entry point
│       ├── config/
│       │   ├── database.ts        # Prisma client singleton
│       │   └── socket.ts          # Socket.io global instance
│       ├── controllers/           # 30 controllers
│       ├── routes/                # 27 route files + index.ts
│       ├── middlewares/           # auth, error, role, upload, validate
│       ├── services/              # 13 services
│       ├── schemas/               # Zod validation schemas
│       ├── types/                 # DTOs, errors, express extensions
│       └── utils/                 # logger, prisma helpers
├── frontend/
│   └── app/
│       ├── (painel)/              # Admin panel (Next.js route group)
│       │   ├── admin/             # Gestor screens
│       │   ├── bar/               # Bar KDS
│       │   ├── caixa/             # Cashier
│       │   ├── cozinha/           # Kitchen KDS
│       │   ├── expedicao/         # Dispatch
│       │   └── garcom/            # Waiter screens
│       ├── auth/                  # Login, forgot/reset password
│       ├── boas-vindas/           # Onboarding flow
│       ├── cadastro/              # Self-registration
│       ├── cardapio/              # Public menu
│       ├── carrinho/              # Cart
│       ├── cliente/               # Client comanda view
│       ├── comanda/               # Comanda flow
│       ├── entregador/            # Delivery driver
│       ├── pedido/                # Order flow (delivery)
│       └── superadmin/            # Platform admin
└── docs/                          # Documentation (esta pasta)
```

---

## 3. Entidades do Banco de Dados (Prisma Schema)

### Entidades Principais

| Model | Tabela | Descrição |
|-------|--------|-----------|
| Estabelecimento | estabelecimentos | Tenant principal do sistema |
| Usuario | usuarios | Todos os tipos de usuário |
| Mesa | mesas | Mesas físicas com QR Code |
| GrupoMesa | grupos_mesa | Agrupamento de mesas para eventos |
| Categoria | categorias | Categoria do cardápio (BAR ou COZINHA) |
| Produto | produtos | Item do cardápio |
| AdicionalGrupo | adicional_grupos | Grupos de opcionais do produto |
| Adicional | adicionais | Item opcional/adicional |
| Comanda | comandas | Sessão de consumo do cliente |
| Pedido | pedidos | Conjunto de itens dentro de uma comanda |
| PedidoItem | pedido_itens | Item individual do pedido |
| PedidoItemAdicional | pedido_item_adicionais | Adicional aplicado a um item |
| HistoricoStatusPedido | historico_status_pedido | Auditoria de mudanças de status |
| Cliente | clientes | Cliente cadastrado (delivery/CRM) |
| EnderecoCliente | enderecos_cliente | Endereços salvos do cliente |

### Entidades SaaS / Financeiro

| Model | Tabela | Descrição |
|-------|--------|-----------|
| Plano | planos | Planos da plataforma (Start/Growth/Scale) |
| Assinatura | assinaturas | Assinatura SaaS do estabelecimento |
| CredencialGateway | credenciais_gateway | Chaves BYOG do lojista |
| PreCadastroLead | pre_cadastro_leads | Leads da landing page |
| Transacao | transacoes | Registro de transações de pagamento |
| PagamentoParcial | pagamentos_parciais | Divisão de conta entre comensais |

### Entidades Delivery

| Model | Tabela | Descrição |
|-------|--------|-----------|
| Corrida | corridas | Corrida de entrega |
| LocalizacaoEntregador | localizacao_entregadores | GPS do entregador |

### Entidades Avançadas

| Model | Tabela | Descrição |
|-------|--------|-----------|
| Avaliacao | avaliacoes | Avaliação pós-consumo |
| CanalExterno | canais_externos | Canais omnichannel (iFood, WhatsApp, etc.) |
| PedidoExterno | pedidos_externos | Pedidos recebidos via webhook externo |
| RegraAutomacao | regras_automacao | Regras de automação de marketing |
| ExecucaoAutomacao | execucoes_automacao | Log de execuções de automação |
| FilaEspera | filas_espera | Fila de espera de recepção |
| Reserva | reservas | Reservas de mesas |
| Cupom | cupons | Cupons de desconto |

---

## 4. Enums e Status

| Enum | Valores |
|------|---------|
| TipoUsuario | cliente, garcom, entregador, cozinha, bar, admin, superadmin |
| StatusEntregador | offline, online, pausado, em_corrida |
| StatusComanda | ativa, aguardando_pagamento, paga, finalizada, cancelada |
| TipoComanda | mesa, individual, delivery |
| FormaPagamento | imediato, final |
| StatusPedido | criado, aguardando_pagamento, pago, em_preparo, pronto, em_expedicao, entregue, cancelado |
| DestinoCategoria | BAR, COZINHA |
| StatusAssinatura | trialing, active, past_due, canceled, incomplete, incomplete_expired, unpaid, paused |
| ProvedorGateway | mercadopago, pagarme, asaas, stripe |
| StatusCorrida | oferecida, aceita, recusada, em_coleta, coletada, em_entrega, entregue, cancelada |
| StatusTransacao | pendente, processando, pago, falhou, reembolsado, cancelado, chargeback |
| TipoCanal | whatsapp, ifood, rappi, instagram, site_proprio, telefone, generico |
| TipoAutomacao | apos_entrega, cliente_inativo |
| StatusFilaEspera | aguardando, chamado, sentado, cancelado |
| StatusReserva | pendente, confirmada, cancelada, concluida |
| TipoCupom | percentual, fixo |

---

## 5. Controllers (30 arquivos)

| Controller | Descrição |
|-----------|-----------|
| assinatura.controller | Gestão de planos e assinaturas SaaS + webhook Stripe |
| auth.controller | Login, register, onboarding, recuperação de senha |
| automacao.controller | CRUD regras de automação de marketing |
| avaliacao.controller | Avaliações pós-comanda |
| caixa.controller | Processamento de pagamentos finais |
| categoria.controller | CRUD categorias do cardápio |
| cliente.controller | Fluxo do cliente (QR, comanda, delivery) |
| comanda.controller | CRUD comandas |
| cozinha.controller | KDS cozinha/bar |
| crm.controller | Relatórios CRM e campanhas |
| cupom.controller | CRUD cupons de desconto |
| dashboard.controller | Métricas do gestor |
| entregador.controller | Gestão de entregadores e corridas |
| expedicao.controller | Painel de expedição |
| garcom.controller | Ações do garçom |
| gateway.controller | CRUD credenciais BYOG |
| importar.controller | Importação de produtos (CSV/planilha) |
| mesa.controller | CRUD mesas + QR Code |
| omnichannel.controller | Canais externos + webhooks |
| pagamento.controller | Pagamentos parciais |
| pedido.controller | CRUD pedidos |
| preparo.controller | Preparo (bar/cozinha) |
| produto.controller | CRUD produtos + cardápio público |
| recepcao.controller | Fila de espera + reservas |
| superadmin.controller | Gestão da plataforma |
| transacao.controller | Registros de transações |

---

## 6. Rotas da API (mapeamento completo)

### Prefixo base: `/api`

| Módulo | Prefixo | Auth | Role |
|--------|---------|------|------|
| Auth | /auth | Misto | — |
| Gestor | /gestor | Sim | admin |
| Garçom | /garcom | Sim | garcom/admin |
| Cozinha/Bar | /cozinha | Sim | cozinha/bar/admin |
| Caixa | /caixa | Sim | admin |
| Cliente | /cliente | Não | público |
| Comandas | /comandas | Não | público |
| Pedidos | /pedidos | Não | público |
| Categorias | /categorias | Misto | admin (escrita) |
| Produtos | /produtos | Misto | admin (escrita) |
| Cardápio | /cardapio | Não | público |
| Preparo | /preparo | Sim | cozinha/bar/admin |
| Importar | /importar | Sim | admin |
| Upload | /upload | Sim | — |
| SuperAdmin | /superadmin | Sim | superadmin |
| Assinaturas | /assinaturas | Misto | admin (gestor) |
| Gateways | /gateways | Sim | admin |
| Pagamentos Parciais | /pagamentos-parciais | Não | público |
| Avaliações | /avaliacoes | Não | público |
| Cupons | /cupons | Misto | admin (escrita) |
| Expedição | /expedicao | Sim | admin |
| Transações | /transacoes | Sim | admin |
| Delivery | /delivery | Misto | entregador/admin |
| Automações | /automacoes | Sim | admin |
| CRM | /crm | Sim | admin |
| Omnichannel | /omnichannel | Misto | admin (gestão) |

---

## 7. Middlewares

| Middleware | Arquivo | Função |
|-----------|---------|--------|
| authMiddleware | auth.middleware.ts | Verifica JWT Bearer, injeta userId/userTipo/estabelecimentoId |
| adminMiddleware | auth.middleware.ts | Restringe acesso a tipo=admin |
| garcomMiddleware | auth.middleware.ts | Permite garcom e admin |
| preparoMiddleware | auth.middleware.ts | Permite cozinha, bar e admin |
| requireGestor | role.middleware.ts | Alias para admin |
| requireGarcom | role.middleware.ts | Alias para garcom+admin |
| requireCozinha | role.middleware.ts | Alias para cozinha+bar+admin |
| requireEntregador | role.middleware.ts | Permite entregador e admin |
| requireSuperAdmin | role.middleware.ts | Restringe a superadmin |
| errorHandler | error.middleware.ts | Handler global de erros |
| validate | validate.middleware.ts | Validação Zod de req.body/params |
| upload | upload.middleware.ts | Multer para upload de imagens |

---

## 8. Serviços

| Serviço | Arquivo | Função |
|---------|---------|--------|
| auth.service | auth.service.ts | Login, register, JWT |
| automacao.service | automacao.service.ts | Execução de automações |
| categoria.service | categoria.service.ts | CRUD categorias |
| cliente.service | cliente.service.ts | Fluxo cliente delivery/mesa |
| comanda.service | comanda.service.ts | Lógica de negócio da comanda |
| crm.service | crm.service.ts | Relatórios e campanhas |
| cupom.service | cupom.service.ts | Validação e CRUD de cupons |
| entregador.service | entregador.service.ts | Corridas e rastreamento |
| mesa.service | mesa.service.ts | QR Code e CRUD mesas |
| omnichannel.service | omnichannel.service.ts | Normalização de webhooks externos |
| pedido.service | pedido.service.ts | Criação e transição de pedidos |
| produto.service | produto.service.ts | CRUD produtos |
| stripe.service | stripe.service.ts | Integração Stripe (checkout, webhooks) |
| superadmin.service | superadmin.service.ts | Gestão da plataforma |
| transacao.service | transacao.service.ts | Registro de transações |

---

## 9. Páginas do Frontend (Next.js App Router)

### Painel Operacional `/(painel)/`

| Rota | Descrição |
|------|-----------|
| /admin | Dashboard gestor |
| /admin/dashboard | Dashboard com métricas |
| /admin/produtos | Gestão de produtos |
| /admin/produtos/importar | Importação CSV |
| /admin/mesas | Gestão de mesas |
| /admin/pedidos | Pedidos Kanban |
| /admin/clientes | CRM clientes |
| /admin/cupons | Cupons de desconto |
| /admin/entregadores | Gestão entregadores |
| /admin/relatorios | Relatórios avançados |
| /admin/automacoes | Regras de automação |
| /admin/avaliacoes | Avaliações recebidas |
| /admin/canais | Canais omnichannel |
| /admin/usuarios | Gestão de usuários |
| /admin/configuracoes | Configurações do estabelecimento |
| /admin/recepcao/fila | Fila de espera |
| /admin/recepcao/reservas | Reservas |
| /bar | KDS do bar |
| /caixa | Painel do caixa |
| /cozinha | KDS da cozinha |
| /expedicao | Painel de expedição |
| /garcom | Tela principal do garçom |
| /garcom/comanda/[id] | Detalhes da comanda |

### Fluxo do Cliente

| Rota | Descrição |
|------|-----------|
| /cliente/comanda/[codigo] | Acompanhamento da comanda |
| /cliente/mesa/[estabId]/[mesaId] | Entrada pela mesa via QR Code |
| /comanda/[codigo] | Comanda ativa |
| /comanda/[codigo]/mesa | Comanda numa mesa |
| /comanda/nova | Nova comanda |
| /cardapio | Cardápio público |
| /cardapio/estabelecimento/[id] | Cardápio de estabelecimento específico |
| /carrinho | Carrinho de compras |
| /pedido/delivery | Checkout delivery |
| /pedido/confirmar | Confirmação de pedido |
| /pedido/pagamento | Pagamento |
| /pedido/acompanhar | Rastreamento do pedido |
| /pedido/[id] | Detalhes do pedido |

### Autenticação e Onboarding

| Rota | Descrição |
|------|-----------|
| /auth/login | Login |
| /auth/esqueci-senha | Recuperação de senha |
| /auth/resetar-senha | Redefinição de senha |
| /cadastro | Cadastro de estabelecimento |
| /boas-vindas | Welcome após cadastro |
| /boas-vindas/completar-perfil | Completar perfil onboarding |
| /acesso | Acesso por código (garçom/etc) |
| /operacao/login | Login operacional |
| /mesa | Mesa (redirect) |
| /entregador | App do entregador |

### Super Admin

| Rota | Descrição |
|------|-----------|
| /superadmin/login | Login superadmin |
| /superadmin/dashboard | Dashboard da plataforma |
| /superadmin/estabelecimentos | Lista estabelecimentos |
| /superadmin/estabelecimentos/novo | Criar estabelecimento |
| /superadmin/estabelecimentos/[id] | Detalhe estabelecimento |
| /superadmin/usuarios | Usuários da plataforma |

---

## 10. Variáveis de Ambiente (Backend)

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| DATABASE_URL | Sim | Connection string MySQL |
| JWT_SECRET | Sim | Secret para assinar tokens JWT |
| CORS_ORIGIN | Sim | URL(s) do frontend (separar por vírgula) |
| STRIPE_SECRET_KEY | Não | Chave secreta Stripe (SaaS billing) |
| STRIPE_WEBHOOK_SECRET | Não | Secret para validar webhooks Stripe |
| NODE_ENV | Não | development / production |
| PORT | Não | Porta do servidor (padrão: 3001) |

---

## 11. Integrações

| Integração | Tipo | Descrição |
|-----------|------|-----------|
| Stripe | SaaS Billing | Checkout, assinaturas recorrentes, webhooks |
| MercadoPago | BYOG | Gateway de pagamento do lojista |
| Pagar.me | BYOG | Gateway de pagamento do lojista |
| Asaas | BYOG | Gateway de pagamento do lojista |
| Socket.io | Realtime | Eventos em tempo real por estabelecimento |
| Multer | Upload | Upload de imagens de produtos |
| QRCode (lib) | Utilidade | Geração de QR Codes para mesas e comandas |

---

## 12. Testes

- Localização: `backend/src/__tests__/simple.test.ts`
- Framework: não identificado (arquivo simples, provavelmente Jest)
- Cobertura: mínima (apenas testes básicos)

---

## 13. Observações Importantes

1. O RESUMO_EXECUTIVO.md menciona PostgreSQL mas o código real usa **MySQL**
2. O modelo `Usuario` unifica todos os tipos de usuário em uma única tabela
3. O campo `comanda.mesa` (String) está marcado como `// Deprecated: usar mesaId`
4. A autenticação do cliente no delivery usa telefone como identificador, não JWT
5. O Socket.io usa salas por `estabelecimentoId` para eventos em tempo real
6. O webhook do Stripe usa `express.raw()` para preservar o body de assinatura
