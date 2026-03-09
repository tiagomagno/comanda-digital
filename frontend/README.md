# Frontend - Sistema de Comandas Digitais

Interface web responsiva (PWA) para o sistema de comandas digitais.

## 🚀 Tecnologias

- **Next.js 14** - Framework React com App Router
- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **Zustand** - Gerenciamento de estado
- **Axios** - Cliente HTTP
- **Socket.io Client** - WebSocket para tempo real
- **React Hook Form** - Formulários
- **Zod** - Validação de dados
- **Lucide React** - Ícones

## 📦 Instalação

### 1. Instalar dependências

```bash
# Com npm
npm install

# Ou com yarn
yarn install

# Ou com pnpm
pnpm install
```

### 2. Configurar variáveis de ambiente

```bash
# Criar arquivo .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

## 🏃 Executar

### Desenvolvimento

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:3000`

### Produção

```bash
# Build
npm run build

# Start
npm start
```

## 📚 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Cria build de produção |
| `npm start` | Inicia servidor de produção |
| `npm run lint` | Verifica código com ESLint |
| `npm run format` | Formata código com Prettier |

## 🗂️ Estrutura de Pastas

```
frontend/
├── app/                    # Rotas do Next.js (App Router)
│   ├── (cliente)/         # Grupo de rotas do cliente
│   │   ├── comanda/
│   │   └── cardapio/
│   ├── (staff)/           # Grupo de rotas da equipe
│   │   ├── garcom/
│   │   ├── bar/
│   │   └── cozinha/
│   ├── admin/             # Área administrativa
│   ├── auth/              # Autenticação
│   ├── layout.tsx         # Layout raiz
│   ├── page.tsx           # Página inicial
│   └── globals.css        # Estilos globais
├── components/            # Componentes React
│   ├── ui/               # Componentes base
│   ├── comanda/          # Componentes de comanda
│   ├── produto/          # Componentes de produto
│   └── ...
├── lib/                  # Bibliotecas e utilitários
│   ├── api.ts           # Cliente HTTP
│   ├── socket.ts        # Cliente WebSocket
│   └── utils.ts         # Funções utilitárias
├── stores/              # Stores Zustand
│   ├── comanda.store.ts
│   ├── carrinho.store.ts
│   └── auth.store.ts
├── hooks/               # Custom hooks
│   ├── useComanda.ts
│   └── useSocket.ts
├── types/               # Tipos TypeScript
│   └── index.ts
└── public/              # Arquivos estáticos
    ├── icons/          # Ícones PWA
    └── manifest.json   # Manifest PWA
```

## 🎨 Design System

### Cores

```css
/* Primary */
--primary-500: #0ea5e9;
--primary-600: #0284c7;
--primary-700: #0369a1;

/* Success */
--success-500: #10b981;

/* Warning */
--warning-500: #f59e0b;

/* Error */
--error-500: #ef4444;
```

### Componentes Base

Todos os componentes seguem o padrão:
- Responsivos (mobile-first)
- Acessíveis (ARIA labels)
- Consistentes (design system)
- Reutilizáveis

## 📱 PWA (Progressive Web App)

O aplicativo é configurado como PWA, permitindo:
- ✅ Instalação no dispositivo
- ✅ Funcionamento offline
- ✅ Notificações push (futuro)
- ✅ Ícone na tela inicial

### Manifest

```json
{
  "name": "Comanda Digital",
  "short_name": "Comanda",
  "description": "Sistema de Comandas Digitais",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#0ea5e9",
  "background_color": "#ffffff"
}
```

## 🔌 Integração com API

### Fazer requisição

```typescript
import api from '@/lib/api';

// GET
const response = await api.get('/api/comandas');

// POST
const response = await api.post('/api/comandas', {
  nomeCliente: 'João',
  telefoneCliente: '11999999999',
});

// PATCH
const response = await api.patch('/api/pedidos/123/status', {
  status: 'pronto',
});
```

### WebSocket

```typescript
import { useEffect } from 'react';
import { socket } from '@/lib/socket';

useEffect(() => {
  // Conectar
  socket.connect();

  // Entrar em sala
  socket.emit('join:estabelecimento', 'uuid-estabelecimento');

  // Escutar eventos
  socket.on('pedido:novo', (pedido) => {
    console.log('Novo pedido:', pedido);
  });

  // Cleanup
  return () => {
    socket.disconnect();
  };
}, []);
```

## 🎯 Rotas Principais

### Cliente
- `/` - Página inicial
- `/comanda/nova` - Criar comanda
- `/comanda/[codigo]` - Visualizar comanda
- `/cardapio` - Ver cardápio
- `/pedido` - Resumo do pedido

### Garçom
- `/garcom` - Dashboard
- `/garcom/comandas/[id]` - Detalhes da comanda

### Bar/Cozinha
- `/bar` - Painel do bar
- `/cozinha` - Painel da cozinha

### Admin
- `/admin` - Dashboard
- `/admin/produtos` - Gerenciar produtos
- `/admin/categorias` - Gerenciar categorias
- `/admin/estabelecimento` - Configurações

## 🧪 Testes

```bash
# Executar testes
npm test

# Testes em modo watch
npm run test:watch

# Cobertura
npm run test:coverage
```

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório no Vercel
2. Configure variáveis de ambiente
3. Deploy automático a cada push

### Outras plataformas

- **Netlify** - https://netlify.com
- **Cloudflare Pages** - https://pages.cloudflare.com
- **AWS Amplify** - https://aws.amazon.com/amplify

## 📝 Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `NEXT_PUBLIC_API_URL` | URL da API | http://localhost:3001 |
| `NEXT_PUBLIC_WS_URL` | URL do WebSocket | ws://localhost:3001 |

## 🎨 Customização

### Cores

Edite `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Suas cores aqui
      },
    },
  },
}
```

### Fonte

Edite `app/layout.tsx`:

```typescript
import { Roboto } from 'next/font/google';

const roboto = Roboto({ 
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});
```

## 📱 Responsividade

Breakpoints do Tailwind:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

Exemplo:

```tsx
<div className="text-sm md:text-base lg:text-lg">
  Texto responsivo
</div>
```

## ♿ Acessibilidade

- Todos os botões têm labels descritivos
- Imagens têm alt text
- Formulários têm labels associados
- Navegação por teclado funciona
- Contraste de cores adequado

## 📄 Licença

MIT

---

**Desenvolvido com ❤️ usando Next.js**
