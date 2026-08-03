# Arquitetura do Frontend — Dine

> Fonte: `frontend/app/` | Atualizado em: 2026-06-30

---

## Stack

| Tecnologia | Uso |
|-----------|-----|
| Next.js 14+ (App Router) | Framework React com SSR/SSG |
| TypeScript | Tipagem estática |
| Tailwind CSS | Estilização utilitária |
| shadcn/ui | Componentes UI base |
| axios | HTTP client para a API |
| framer-motion | Animações |
| js-cookie | Gerenciamento de cookies (JWT) |
| Socket.io Client | Realtime |

---

## Estrutura de Rotas (App Router)

```
frontend/app/
├── layout.tsx                    # Root layout (providers globais)
├── globals.css                   # Estilos globais
├── page.tsx                      # Landing page (/)
│
├── (painel)/                     # Route group — Painel Operacional
│   ├── layout.tsx                # Layout do painel (sidebar, auth guard)
│   ├── admin/                    # Área do gestor
│   │   ├── page.tsx              # /admin — redirect para dashboard
│   │   ├── dashboard/page.tsx    # /admin/dashboard
│   │   ├── produtos/page.tsx     # /admin/produtos
│   │   ├── produtos/importar/    # /admin/produtos/importar
│   │   ├── mesas/page.tsx        # /admin/mesas
│   │   ├── pedidos/page.tsx      # /admin/pedidos (Kanban)
│   │   ├── clientes/page.tsx     # /admin/clientes (CRM)
│   │   ├── cupons/page.tsx       # /admin/cupons
│   │   ├── entregadores/page.tsx # /admin/entregadores
│   │   ├── relatorios/page.tsx   # /admin/relatorios
│   │   ├── automacoes/page.tsx   # /admin/automacoes
│   │   ├── avaliacoes/page.tsx   # /admin/avaliacoes
│   │   ├── canais/page.tsx       # /admin/canais (omnichannel)
│   │   ├── usuarios/page.tsx     # /admin/usuarios
│   │   ├── configuracoes/page.tsx# /admin/configuracoes
│   │   └── recepcao/
│   │       ├── fila/page.tsx     # /admin/recepcao/fila
│   │       └── reservas/page.tsx # /admin/recepcao/reservas
│   ├── bar/page.tsx              # /bar — KDS Bar
│   ├── caixa/page.tsx            # /caixa — Caixa
│   ├── cozinha/page.tsx          # /cozinha — KDS Cozinha
│   ├── expedicao/page.tsx        # /expedicao — Expedição
│   └── garcom/
│       ├── page.tsx              # /garcom — Lista de comandas
│       └── comanda/[id]/page.tsx # /garcom/comanda/:id
│
├── auth/                         # Autenticação
│   ├── login/page.tsx            # /auth/login
│   ├── esqueci-senha/page.tsx    # /auth/esqueci-senha
│   └── resetar-senha/page.tsx    # /auth/resetar-senha
│
├── boas-vindas/                  # Onboarding
│   ├── page.tsx                  # /boas-vindas
│   └── completar-perfil/page.tsx # /boas-vindas/completar-perfil
│
├── cadastro/                     # Cadastro de estabelecimento
│   └── page.tsx                  # /cadastro
│
├── cardapio/                     # Cardápio público
│   ├── page.tsx                  # /cardapio
│   └── estabelecimento/[id]/     # /cardapio/estabelecimento/:id
│
├── carrinho/page.tsx             # /carrinho
│
├── cliente/                      # Área do cliente
│   ├── comanda/[codigo]/page.tsx # /cliente/comanda/:codigo
│   └── mesa/[estabId]/[mesaId]/  # /cliente/mesa/:estabId/:mesaId
│
├── comanda/                      # Fluxo de comanda
│   ├── [codigo]/page.tsx         # /comanda/:codigo
│   ├── [codigo]/mesa/page.tsx    # /comanda/:codigo/mesa
│   └── nova/page.tsx             # /comanda/nova
│
├── entregador/page.tsx           # /entregador — App do entregador
│
├── pedido/                       # Fluxo de pedido
│   ├── [id]/page.tsx             # /pedido/:id
│   ├── acompanhar/page.tsx       # /pedido/acompanhar
│   ├── confirmar/page.tsx        # /pedido/confirmar
│   ├── delivery/page.tsx         # /pedido/delivery
│   └── pagamento/page.tsx        # /pedido/pagamento
│
├── painel/page.tsx               # /painel — redirect
├── mesa/page.tsx                 # /mesa
├── acesso/page.tsx               # /acesso (login por código)
├── operacao/login/page.tsx       # /operacao/login
│
└── superadmin/                   # Super Admin
    ├── layout.tsx
    ├── login/page.tsx            # /superadmin/login
    ├── page.tsx                  # /superadmin — redirect
    ├── dashboard/page.tsx        # /superadmin/dashboard
    ├── estabelecimentos/page.tsx # /superadmin/estabelecimentos
    ├── estabelecimentos/novo/    # /superadmin/estabelecimentos/novo
    ├── estabelecimentos/[id]/    # /superadmin/estabelecimentos/:id
    └── usuarios/page.tsx         # /superadmin/usuarios
```

---

## Diagrama de Fluxo de Navegação

```mermaid
graph TD
    LP[/ Landing Page] --> Cadastro[/cadastro]
    LP --> Login[/auth/login]
    
    Cadastro --> Boas[/boas-vindas]
    Boas --> Perfil[/boas-vindas/completar-perfil]
    Perfil --> Admin[/admin/dashboard]
    
    Login --> Admin
    Login --> Garcom[/garcom]
    Login --> Cozinha[/cozinha]
    Login --> Bar[/bar]
    Login --> Caixa[/caixa]
    Login --> Expedicao[/expedicao]
    
    QR[QR Code Mesa] --> ClienteMesa[/cliente/mesa/:estabId/:mesaId]
    ClienteMesa --> Comanda[/comanda/:codigo]
    Comanda --> Cardapio[/cardapio/estab/:id]
    Cardapio --> Carrinho[/carrinho]
    Carrinho --> ComandaAtiva[/comanda/:codigo]
    
    QR2[Link Delivery] --> PedidoDelivery[/pedido/delivery]
    PedidoDelivery --> PedidoConfirmar[/pedido/confirmar]
    PedidoConfirmar --> PedidoPagamento[/pedido/pagamento]
    PedidoPagamento --> PedidoAcompanhar[/pedido/acompanhar]
    
    SuperLogin[/superadmin/login] --> SuperDash[/superadmin/dashboard]
```

---

## Grupos de Rota

### `(painel)` — Route Group
- **Layout compartilhado:** sidebar, header, verificação de autenticação
- **Acesso:** usuários com JWT válido (admin, garcom, cozinha, bar, entregador)
- Não aparece na URL (parênteses = route group no Next.js)

### `superadmin` — Área Isolada
- Layout próprio separado do painel operacional
- Acesso restrito a tipo=superadmin

---

## Comunicação com Backend

```typescript
// Padrão de chamada via axios
// Base URL configurada por variável de ambiente

// Token JWT armazenado em cookie (js-cookie)
// Interceptor axios adiciona automaticamente:
// Authorization: Bearer <token>
```

---

## Realtime (Socket.io)

```typescript
// Cliente Socket.io conecta no load do painel
// Entra na sala do estabelecimento:
socket.emit('join:estabelecimento', estabelecimentoId)

// Escuta eventos:
socket.on('pedido:novo', handler)
socket.on('pedido:status', handler)
socket.on('comanda:atualizada', handler)
```

---

## Telas por Papel de Usuário

| Papel | Telas Principais |
|-------|-----------------|
| Admin (Gestor) | /admin/dashboard, /admin/produtos, /admin/mesas, /admin/pedidos, /admin/clientes, /admin/relatorios |
| Garçom | /garcom, /garcom/comanda/:id |
| Cozinha | /cozinha (KDS) |
| Bar | /bar (KDS) |
| Caixa | /caixa |
| Expedição | /expedicao |
| Entregador | /entregador |
| Cliente | /cliente/mesa/:id, /comanda/:codigo, /cardapio, /carrinho |
| SuperAdmin | /superadmin/dashboard, /superadmin/estabelecimentos |
