# 📋 Planejamento Técnico - Sistema de Comandas Digitais

## 🎯 Visão Geral

Este documento detalha as decisões técnicas, arquitetura e implementação do MVP do Sistema de Comandas Digitais.

---

## 🏗️ Arquitetura do Sistema

### Arquitetura Geral

```
┌─────────────────────────────────────────────────────────────┐
│                    CAMADA DE APRESENTAÇÃO                    │
├─────────────────────────────────────────────────────────────┤
│  Cliente (PWA)  │  Garçom (Web)  │  Bar/Cozinha  │  Admin   │
└────────┬────────┴────────┬────────┴───────┬───────┴────┬────┘
         │                 │                │            │
         └─────────────────┼────────────────┼────────────┘
                           │                │
                    ┌──────▼────────────────▼──────┐
                    │      API REST/GraphQL        │
                    │    (Backend Principal)       │
                    └──────┬────────────────┬──────┘
                           │                │
                    ┌──────▼────────┐  ┌───▼──────┐
                    │   PostgreSQL  │  │  Redis   │
                    │   (Principal) │  │  (Cache) │
                    └───────────────┘  └──────────┘
```

### Modo Offline/Local

```
┌─────────────────────────────────────────┐
│        Estabelecimento (Local)          │
├─────────────────────────────────────────┤
│  Tablets  │  QR Codes  │  Dispositivos  │
└─────┬─────┴─────┬──────┴────────┬───────┘
      │           │               │
      └───────────┼───────────────┘
                  │
          ┌───────▼────────┐
          │  Servidor Local│
          │  (Sync Server) │
          └───────┬────────┘
                  │
          ┌───────▼────────┐
          │  SQLite Local  │
          └────────────────┘
```

---

## 🛠️ Stack Tecnológica Recomendada

### Backend

**Opção 1: Node.js (Recomendado para MVP)**
- **Framework:** Express.js ou Fastify
- **ORM:** Prisma ou Sequelize
- **Validação:** Zod ou Joi
- **Real-time:** Socket.io
- **Autenticação:** JWT

**Opção 2: Laravel (PHP)**
- **Framework:** Laravel 10+
- **ORM:** Eloquent
- **Real-time:** Laravel Echo + Pusher/Socket.io
- **API:** Laravel Sanctum

### Frontend

**PWA com React/Next.js**
- **Framework:** Next.js 14+ (App Router)
- **UI Library:** Tailwind CSS + shadcn/ui
- **State Management:** Zustand ou Redux Toolkit
- **Forms:** React Hook Form + Zod
- **HTTP Client:** Axios ou Fetch API
- **Real-time:** Socket.io-client

### Database

**Produção/Online:**
- PostgreSQL 15+
- Redis (cache e sessões)

**Local/Offline:**
- SQLite (sincronização local)
- IndexedDB (cache do navegador)

### DevOps

- **Containerização:** Docker + Docker Compose
- **CI/CD:** GitHub Actions
- **Hosting:** Vercel (Frontend) + Railway/Render (Backend)
- **Monitoramento:** Sentry (erros)

---

## 📊 Modelagem de Dados Detalhada

### Diagrama ER

```
┌─────────────────┐
│ Estabelecimento │
└────────┬────────┘
         │ 1
         │
         │ N
┌────────▼────────┐      ┌──────────┐
│    Categoria    │──────│ Produto  │
└────────┬────────┘ 1  N └──────────┘
         │
         │
┌────────▼────────┐
│     Comanda     │
└────────┬────────┘
         │ 1
         │
         │ N
┌────────▼────────┐      ┌──────────────┐
│     Pedido      │──────│ PedidoItem   │
└─────────────────┘ 1  N └──────────────┘
```

### Tabelas SQL

#### estabelecimentos
```sql
CREATE TABLE estabelecimentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(14) UNIQUE,
    telefone VARCHAR(20),
    endereco TEXT,
    configuracoes JSONB DEFAULT '{}',
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### usuarios
```sql
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estabelecimento_id UUID REFERENCES estabelecimentos(id),
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(255) UNIQUE,
    senha_hash VARCHAR(255),
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('cliente', 'garcom', 'cozinha', 'bar', 'admin')),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### categorias
```sql
CREATE TABLE categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estabelecimento_id UUID REFERENCES estabelecimentos(id),
    nome VARCHAR(100) NOT NULL,
    destino VARCHAR(20) NOT NULL CHECK (destino IN ('BAR', 'COZINHA')),
    ordem INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### produtos
```sql
CREATE TABLE produtos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    categoria_id UUID REFERENCES categorias(id),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10, 2) NOT NULL,
    imagem_url VARCHAR(500),
    disponivel BOOLEAN DEFAULT true,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### comandas
```sql
CREATE TABLE comandas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estabelecimento_id UUID REFERENCES estabelecimentos(id),
    codigo VARCHAR(10) UNIQUE NOT NULL, -- Código curto para identificação
    nome_cliente VARCHAR(255) NOT NULL,
    telefone_cliente VARCHAR(20) NOT NULL,
    mesa VARCHAR(20), -- Opcional
    status VARCHAR(20) NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'aguardando_pagamento', 'paga', 'finalizada', 'cancelada')),
    total_estimado DECIMAL(10, 2) DEFAULT 0,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finalizada_at TIMESTAMP
);
```

#### pedidos
```sql
CREATE TABLE pedidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comanda_id UUID REFERENCES comandas(id),
    numero_pedido INTEGER NOT NULL, -- Sequencial por comanda
    status VARCHAR(20) NOT NULL DEFAULT 'criado' CHECK (status IN ('criado', 'aguardando_pagamento', 'pago', 'em_preparo', 'pronto', 'entregue', 'cancelado')),
    destino VARCHAR(20) CHECK (destino IN ('BAR', 'COZINHA')),
    total DECIMAL(10, 2) NOT NULL,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pago_at TIMESTAMP,
    pronto_at TIMESTAMP
);
```

#### pedido_itens
```sql
CREATE TABLE pedido_itens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID REFERENCES pedidos(id),
    produto_id UUID REFERENCES produtos(id),
    quantidade INTEGER NOT NULL DEFAULT 1,
    preco_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Índices Importantes

```sql
-- Performance em consultas frequentes
CREATE INDEX idx_comandas_estabelecimento ON comandas(estabelecimento_id);
CREATE INDEX idx_comandas_status ON comandas(status);
CREATE INDEX idx_comandas_codigo ON comandas(codigo);
CREATE INDEX idx_pedidos_comanda ON pedidos(comanda_id);
CREATE INDEX idx_pedidos_status ON pedidos(status);
CREATE INDEX idx_pedidos_destino ON pedidos(destino);
CREATE INDEX idx_produtos_categoria ON produtos(categoria_id);
```

---

## 🔐 Autenticação e Autorização

### Fluxo de Autenticação

#### Cliente (Sem Login)
- Acessa via QR Code
- Cria comanda com nome + telefone
- Recebe token temporário (JWT)
- Token válido apenas para aquela comanda

#### Garçom/Cozinha/Bar/Admin
- Login com email + senha
- JWT com refresh token
- Permissões baseadas em role

### Estrutura do JWT

```json
{
  "sub": "user_id",
  "tipo": "cliente|garcom|cozinha|bar|admin",
  "estabelecimento_id": "uuid",
  "comanda_id": "uuid", // Apenas para clientes
  "exp": 1234567890
}
```

---

## 🌐 API REST - Endpoints Principais

### Comandas

```
POST   /api/comandas                    # Criar nova comanda
GET    /api/comandas/:id                # Detalhes da comanda
GET    /api/comandas/:id/pedidos        # Listar pedidos da comanda
PATCH  /api/comandas/:id/status         # Atualizar status
```

### Pedidos

```
POST   /api/pedidos                     # Criar novo pedido
GET    /api/pedidos/:id                 # Detalhes do pedido
PATCH  /api/pedidos/:id/status          # Atualizar status
DELETE /api/pedidos/:id                 # Cancelar pedido
```

### Cardápio

```
GET    /api/cardapio                    # Listar produtos disponíveis
GET    /api/categorias                  # Listar categorias
```

### Garçom

```
GET    /api/garcom/comandas             # Listar comandas ativas
POST   /api/garcom/pedidos/:id/pagar    # Confirmar pagamento
```

### Bar/Cozinha

```
GET    /api/preparo/pedidos             # Listar pedidos por destino
PATCH  /api/preparo/pedidos/:id/status  # Atualizar status
```

### Admin

```
POST   /api/admin/produtos              # Cadastrar produto
PUT    /api/admin/produtos/:id          # Editar produto
GET    /api/admin/metricas              # Dashboard de métricas
```

---

## 🔄 Sistema de Sincronização Offline

### Estratégia de Sincronização

1. **Service Worker**
   - Cache de assets estáticos
   - Cache de API responses
   - Background sync

2. **IndexedDB**
   - Armazenamento local de dados
   - Fila de operações pendentes

3. **Sincronização**
   - Detectar conectividade
   - Enviar operações pendentes
   - Resolver conflitos (last-write-wins)

### Fluxo Offline

```javascript
// Pseudocódigo
if (navigator.onLine) {
  // Enviar para servidor
  await api.post('/pedidos', data);
} else {
  // Salvar localmente
  await db.pedidos.add({
    ...data,
    _pendingSync: true,
    _timestamp: Date.now()
  });
}

// Quando voltar online
window.addEventListener('online', async () => {
  const pending = await db.pedidos.where('_pendingSync').equals(true).toArray();
  for (const item of pending) {
    await api.post('/pedidos', item);
    await db.pedidos.update(item.id, { _pendingSync: false });
  }
});
```

---

## 📱 Interface do Usuário - Wireframes

### Cliente - Fluxo Principal

```
┌─────────────────────────┐
│   Escanear QR Code      │
│                         │
│   [QR Code Scanner]     │
│                         │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│   Criar Comanda         │
│                         │
│   Nome: [_________]     │
│   Tel:  [_________]     │
│                         │
│   [Criar Comanda]       │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│   Cardápio              │
│                         │
│   🥤 Bebidas            │
│   🍔 Comidas            │
│   🍰 Sobremesas         │
│                         │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│   Carrinho              │
│                         │
│   2x Coca-Cola  R$ 10   │
│   1x Hambúrguer R$ 25   │
│                         │
│   Total: R$ 35,00       │
│                         │
│   [Finalizar Pedido]    │
└─────────────────────────┘
```

### Garçom - Dashboard

```
┌─────────────────────────────────────┐
│   Comandas Ativas                   │
├─────────────────────────────────────┤
│                                     │
│   Mesa 5 - João Silva               │
│   3 pedidos | R$ 120,00             │
│   [Ver] [Pagar] [Editar]            │
│                                     │
│   ─────────────────────────────     │
│                                     │
│   Mesa 8 - Maria Santos             │
│   1 pedido | R$ 45,00               │
│   [Ver] [Pagar] [Editar]            │
│                                     │
└─────────────────────────────────────┘
```

### Bar/Cozinha - Painel de Pedidos

```
┌─────────────────────────────────────┐
│   🥤 BAR - Pedidos Pendentes        │
├─────────────────────────────────────┤
│                                     │
│   Pedido #123 - Mesa 5              │
│   2x Coca-Cola                      │
│   1x Suco de Laranja                │
│   [Em Preparo] [Pronto]             │
│                                     │
│   ─────────────────────────────     │
│                                     │
│   Pedido #124 - Mesa 3              │
│   3x Cerveja                        │
│   [Em Preparo] [Pronto]             │
│                                     │
└─────────────────────────────────────┘
```

---

## 🎨 Design System - Diretrizes

### Cores

```css
:root {
  /* Primary */
  --primary-50: #f0f9ff;
  --primary-500: #3b82f6;
  --primary-700: #1d4ed8;
  
  /* Success */
  --success-500: #10b981;
  
  /* Warning */
  --warning-500: #f59e0b;
  
  /* Error */
  --error-500: #ef4444;
  
  /* Neutral */
  --gray-50: #f9fafb;
  --gray-900: #111827;
}
```

### Tipografia

```css
/* Fonte principal */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

body {
  font-family: 'Inter', sans-serif;
}

/* Tamanhos */
.text-xs { font-size: 0.75rem; }
.text-sm { font-size: 0.875rem; }
.text-base { font-size: 1rem; }
.text-lg { font-size: 1.125rem; }
.text-xl { font-size: 1.25rem; }
.text-2xl { font-size: 1.5rem; }
```

### Componentes Base

- **Botões:** Grandes (min 48px altura) para acessibilidade
- **Cards:** Sombras suaves, bordas arredondadas
- **Inputs:** Feedback visual claro
- **Status:** Cores semânticas (verde=pronto, amarelo=preparo, vermelho=cancelado)

---

## 🧪 Estratégia de Testes

### Backend
- **Unitários:** Jest ou Vitest
- **Integração:** Supertest
- **E2E:** Playwright

### Frontend
- **Unitários:** Vitest + Testing Library
- **Componentes:** Storybook
- **E2E:** Playwright ou Cypress

### Cobertura Mínima
- Backend: 70%
- Frontend: 60%

---

## 📈 Métricas e Monitoramento

### KPIs do Sistema

1. **Performance**
   - Tempo de resposta da API < 200ms
   - Tempo de carregamento da página < 2s
   - Taxa de sucesso de sincronização offline > 95%

2. **Negócio**
   - Número de comandas criadas
   - Ticket médio por comanda
   - Tempo médio de atendimento
   - Taxa de cancelamento de pedidos

3. **Técnicas**
   - Uptime > 99.5%
   - Taxa de erro < 1%
   - Tempo de resposta do banco < 50ms

---

## 🚀 Roadmap de Desenvolvimento

### Sprint 1 (Semana 1-2): Fundação
- [ ] Setup do projeto (backend + frontend)
- [ ] Modelagem e criação do banco de dados
- [ ] Autenticação básica
- [ ] CRUD de estabelecimentos

### Sprint 2 (Semana 3-4): Cardápio
- [ ] CRUD de categorias
- [ ] CRUD de produtos
- [ ] API de cardápio
- [ ] Interface de cadastro (admin)

### Sprint 3 (Semana 5-6): Comanda
- [ ] Criação de comanda
- [ ] Geração de QR Code
- [ ] Interface do cliente (PWA)
- [ ] Carrinho de compras

### Sprint 4 (Semana 7-8): Pedidos
- [ ] Criação de pedidos
- [ ] Separação por destino
- [ ] Interface de garçom
- [ ] Confirmação de pagamento

### Sprint 5 (Semana 9-10): Bar/Cozinha
- [ ] Painel de pedidos
- [ ] Atualização de status
- [ ] Real-time com WebSocket
- [ ] Notificações

### Sprint 6 (Semana 11-12): Offline & Polish
- [ ] Service Worker
- [ ] Sincronização offline
- [ ] Testes E2E
- [ ] Ajustes de UX
- [ ] Deploy

---

## 📝 Considerações Finais

### Pontos de Atenção

1. **UX Acessível:** Botões grandes, contraste adequado, fonte legível
2. **Performance:** Otimizar queries, usar cache, lazy loading
3. **Segurança:** Validação de dados, proteção contra SQL injection
4. **Escalabilidade:** Preparar para múltiplos estabelecimentos
5. **Manutenibilidade:** Código limpo, documentado, testado

### Próximos Passos Após MVP

- Integração com pagamentos online
- Sistema de fidelidade
- Delivery
- Relatórios avançados
- App nativo (React Native)
- Integração com impressoras térmicas

---

**Documento vivo - Atualizado em: 29/12/2025**
