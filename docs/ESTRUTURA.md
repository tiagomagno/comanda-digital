# 📂 Estrutura do Projeto - Comanda Digital

## 📁 Visão Geral Atual

```
comanda-digital/
├── 📄 .env.example              # Template de variáveis de ambiente
├── 📄 .gitignore                # Arquivos ignorados pelo Git
├── 📄 README.md                 # Documentação principal do projeto
│
├── 📁 backend/                  # API e lógica de negócio (vazio - pronto para setup)
│
├── 📁 database/                 # Schemas e migrations
│   └── 📄 schema.sql            # Schema completo do PostgreSQL
│
├── 📁 docs/                     # Documentação do projeto
│   ├── 📄 CHECKLIST.md          # Checklist de implementação
│   ├── 📄 HISTORIAS_USUARIO.md  # 19 User Stories detalhadas
│   ├── 📄 INICIO_RAPIDO.md      # Guia de início rápido
│   ├── 📄 PLANEJAMENTO_TECNICO.md # Arquitetura e decisões técnicas
│   └── 📄 RESUMO_EXECUTIVO.md   # Visão geral do projeto
│
└── 📁 frontend/                 # Interface do usuário (vazio - pronto para setup)
```

---

## 📁 Estrutura Futura - Backend (Node.js + Express)

```
backend/
├── 📁 src/
│   ├── 📁 config/
│   │   ├── database.ts          # Configuração do Prisma
│   │   ├── redis.ts             # Configuração do Redis
│   │   └── socket.ts            # Configuração do Socket.io
│   │
│   ├── 📁 controllers/
│   │   ├── auth.controller.ts
│   │   ├── comanda.controller.ts
│   │   ├── pedido.controller.ts
│   │   ├── produto.controller.ts
│   │   ├── categoria.controller.ts
│   │   ├── estabelecimento.controller.ts
│   │   ├── garcom.controller.ts
│   │   └── preparo.controller.ts
│   │
│   ├── 📁 middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── logger.middleware.ts
│   │
│   ├── 📁 routes/
│   │   ├── index.ts
│   │   ├── auth.routes.ts
│   │   ├── comanda.routes.ts
│   │   ├── pedido.routes.ts
│   │   ├── produto.routes.ts
│   │   ├── categoria.routes.ts
│   │   ├── garcom.routes.ts
│   │   └── preparo.routes.ts
│   │
│   ├── 📁 services/
│   │   ├── auth.service.ts
│   │   ├── comanda.service.ts
│   │   ├── pedido.service.ts
│   │   ├── produto.service.ts
│   │   ├── qrcode.service.ts
│   │   ├── upload.service.ts
│   │   └── sync.service.ts
│   │
│   ├── 📁 utils/
│   │   ├── jwt.util.ts
│   │   ├── validation.util.ts
│   │   ├── logger.util.ts
│   │   └── helpers.util.ts
│   │
│   ├── 📁 types/
│   │   ├── express.d.ts
│   │   └── index.d.ts
│   │
│   └── 📄 server.ts             # Arquivo principal do servidor
│
├── 📁 prisma/
│   ├── schema.prisma            # Schema do Prisma
│   ├── 📁 migrations/           # Migrations do banco
│   └── seed.ts                  # Dados iniciais
│
├── 📁 tests/
│   ├── 📁 unit/
│   ├── 📁 integration/
│   └── 📁 e2e/
│
├── 📁 uploads/                  # Imagens de produtos (local)
│
├── 📄 .env                      # Variáveis de ambiente (não commitado)
├── 📄 .env.example
├── 📄 .gitignore
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 jest.config.js
└── 📄 README.md
```

---

## 📁 Estrutura Futura - Frontend (Next.js)

```
frontend/
├── 📁 app/
│   ├── 📁 (cliente)/            # Grupo de rotas do cliente
│   │   ├── 📁 comanda/
│   │   │   ├── 📁 [codigo]/
│   │   │   │   ├── page.tsx     # Página da comanda
│   │   │   │   └── layout.tsx
│   │   │   └── nova/
│   │   │       └── page.tsx     # Criar nova comanda
│   │   │
│   │   ├── 📁 cardapio/
│   │   │   └── page.tsx         # Cardápio
│   │   │
│   │   └── 📁 pedido/
│   │       ├── page.tsx         # Resumo do pedido
│   │       └── [id]/
│   │           └── page.tsx     # Status do pedido
│   │
│   ├── 📁 (staff)/              # Grupo de rotas da equipe
│   │   ├── 📁 garcom/
│   │   │   ├── page.tsx         # Dashboard do garçom
│   │   │   ├── comandas/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx # Detalhes da comanda
│   │   │   └── layout.tsx
│   │   │
│   │   ├── 📁 bar/
│   │   │   ├── page.tsx         # Painel do bar
│   │   │   └── layout.tsx
│   │   │
│   │   └── 📁 cozinha/
│   │       ├── page.tsx         # Painel da cozinha
│   │       └── layout.tsx
│   │
│   ├── 📁 admin/                # Área administrativa
│   │   ├── page.tsx             # Dashboard
│   │   │
│   │   ├── 📁 produtos/
│   │   │   ├── page.tsx         # Lista de produtos
│   │   │   ├── novo/
│   │   │   │   └── page.tsx     # Novo produto
│   │   │   └── [id]/
│   │   │       └── page.tsx     # Editar produto
│   │   │
│   │   ├── 📁 categorias/
│   │   │   ├── page.tsx         # Lista de categorias
│   │   │   └── nova/
│   │   │       └── page.tsx     # Nova categoria
│   │   │
│   │   ├── 📁 estabelecimento/
│   │   │   └── page.tsx         # Configurações
│   │   │
│   │   └── layout.tsx
│   │
│   ├── 📁 auth/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── layout.tsx               # Layout raiz
│   ├── globals.css              # Estilos globais
│   └── page.tsx                 # Página inicial
│
├── 📁 components/
│   ├── 📁 ui/                   # Componentes base (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── modal.tsx
│   │   ├── drawer.tsx
│   │   ├── badge.tsx
│   │   ├── select.tsx
│   │   ├── textarea.tsx
│   │   └── ...
│   │
│   ├── 📁 comanda/
│   │   ├── ComandaForm.tsx
│   │   ├── ComandaCard.tsx
│   │   ├── ComandaStatus.tsx
│   │   └── ComandaList.tsx
│   │
│   ├── 📁 produto/
│   │   ├── ProdutoCard.tsx
│   │   ├── ProdutoForm.tsx
│   │   ├── ProdutoList.tsx
│   │   └── ProdutoModal.tsx
│   │
│   ├── 📁 pedido/
│   │   ├── PedidoCard.tsx
│   │   ├── PedidoItem.tsx
│   │   ├── PedidoStatus.tsx
│   │   └── PedidoTimeline.tsx
│   │
│   ├── 📁 carrinho/
│   │   ├── Carrinho.tsx
│   │   ├── CarrinhoItem.tsx
│   │   └── CarrinhoDrawer.tsx
│   │
│   └── 📁 layout/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       ├── Footer.tsx
│       └── Navigation.tsx
│
├── 📁 lib/
│   ├── api.ts                   # Cliente HTTP (Axios)
│   ├── socket.ts                # Cliente WebSocket
│   ├── utils.ts                 # Funções utilitárias
│   └── validations.ts           # Schemas de validação (Zod)
│
├── 📁 stores/
│   ├── comanda.store.ts         # Estado da comanda (Zustand)
│   ├── carrinho.store.ts        # Estado do carrinho
│   ├── auth.store.ts            # Estado de autenticação
│   └── ui.store.ts              # Estado da UI
│
├── 📁 hooks/
│   ├── useComanda.ts
│   ├── usePedido.ts
│   ├── useCarrinho.ts
│   ├── useSocket.ts
│   └── useAuth.ts
│
├── 📁 types/
│   ├── comanda.ts
│   ├── pedido.ts
│   ├── produto.ts
│   └── index.ts
│
├── 📁 public/
│   ├── 📁 icons/                # Ícones do PWA
│   │   ├── icon-192x192.png
│   │   ├── icon-512x512.png
│   │   └── ...
│   ├── 📁 images/
│   ├── manifest.json            # Manifest do PWA
│   └── sw.js                    # Service Worker
│
├── 📁 tests/
│   ├── 📁 components/
│   ├── 📁 pages/
│   └── 📁 e2e/
│
├── 📄 .env.local                # Variáveis de ambiente (não commitado)
├── 📄 .env.example
├── 📄 .gitignore
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 next.config.js
├── 📄 tailwind.config.ts
├── 📄 postcss.config.js
└── 📄 README.md
```

---

## 📊 Mapeamento de Rotas

### Cliente
| Rota | Descrição |
|------|-----------|
| `/comanda/nova` | Criar nova comanda |
| `/comanda/[codigo]` | Visualizar comanda |
| `/cardapio` | Ver cardápio |
| `/pedido` | Resumo do pedido |
| `/pedido/[id]` | Status do pedido |

### Garçom
| Rota | Descrição |
|------|-----------|
| `/garcom` | Dashboard |
| `/garcom/comandas/[id]` | Detalhes da comanda |

### Bar/Cozinha
| Rota | Descrição |
|------|-----------|
| `/bar` | Painel do bar |
| `/cozinha` | Painel da cozinha |

### Admin
| Rota | Descrição |
|------|-----------|
| `/admin` | Dashboard |
| `/admin/produtos` | Gerenciar produtos |
| `/admin/produtos/novo` | Novo produto |
| `/admin/produtos/[id]` | Editar produto |
| `/admin/categorias` | Gerenciar categorias |
| `/admin/estabelecimento` | Configurações |

---

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais
```
estabelecimentos
    ↓
categorias → produtos
    ↓
comandas
    ↓
pedidos → pedido_itens
    ↓
historico_status_pedido
```

### Relacionamentos
- **1:N** - Um estabelecimento tem várias categorias
- **1:N** - Uma categoria tem vários produtos
- **1:N** - Uma comanda tem vários pedidos
- **1:N** - Um pedido tem vários itens
- **N:1** - Vários itens referenciam um produto

---

## 📦 Dependências Principais

### Backend
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "@prisma/client": "^5.0.0",
    "jsonwebtoken": "^9.0.0",
    "bcrypt": "^5.1.0",
    "socket.io": "^4.6.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "qrcode": "^1.5.0",
    "multer": "^1.4.5-lts.1"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/express": "^4.17.0",
    "ts-node-dev": "^2.0.0",
    "prisma": "^5.0.0",
    "jest": "^29.0.0"
  }
}
```

### Frontend
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "axios": "^1.6.0",
    "socket.io-client": "^4.6.0",
    "zustand": "^4.4.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "qrcode.react": "^3.1.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/react": "^18.0.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

---

## 🎯 Próximos Passos

1. **Escolher Stack Definitiva**
   - Confirmar Node.js + Next.js ou Laravel
   
2. **Setup Backend**
   ```bash
   cd backend
   npm init -y
   # Instalar dependências
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npx create-next-app@latest .
   # Configurar
   ```

4. **Iniciar Desenvolvimento**
   - Seguir checklist em `docs/CHECKLIST.md`
   - Implementar Sprint 1

---

**Estrutura criada em:** 29/12/2025  
**Status:** ✅ Pronto para desenvolvimento
