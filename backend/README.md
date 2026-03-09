# Backend - Sistema de Comandas Digitais

API REST com WebSocket para o sistema de comandas digitais.

## 🚀 Tecnologias

- **Node.js** 18+
- **Express** - Framework web
- **TypeScript** - Tipagem estática
- **Prisma** - ORM
- **PostgreSQL** - Banco de dados
- **Socket.io** - WebSocket para tempo real
- **JWT** - Autenticação
- **Zod** - Validação de dados

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
# Copiar arquivo de exemplo
cp .env.example .env

# Editar .env com suas configurações
```

### 3. Configurar banco de dados

```bash
# Gerar cliente Prisma
npm run prisma:generate

# Executar migrations
npm run prisma:migrate

# (Opcional) Popular banco com dados de exemplo
npm run prisma:seed
```

## 🏃 Executar

### Desenvolvimento

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3001`

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
| `npm run dev` | Inicia servidor em modo desenvolvimento |
| `npm run build` | Compila TypeScript para JavaScript |
| `npm start` | Inicia servidor em produção |
| `npm run prisma:generate` | Gera cliente Prisma |
| `npm run prisma:migrate` | Executa migrations |
| `npm run prisma:studio` | Abre Prisma Studio (GUI do banco) |
| `npm run prisma:seed` | Popula banco com dados iniciais |
| `npm test` | Executa testes |
| `npm run lint` | Verifica código com ESLint |
| `npm run format` | Formata código com Prettier |

## 🗂️ Estrutura de Pastas

```
backend/
├── src/
│   ├── config/          # Configurações (database, etc)
│   ├── controllers/     # Controllers das rotas
│   ├── routes/          # Definição de rotas
│   ├── services/        # Lógica de negócio
│   ├── middlewares/     # Middlewares (auth, error, etc)
│   ├── utils/           # Funções utilitárias
│   ├── types/           # Tipos TypeScript
│   └── server.ts        # Arquivo principal
├── prisma/
│   ├── schema.prisma    # Schema do banco
│   ├── migrations/      # Migrations
│   └── seed.ts          # Dados iniciais
├── uploads/             # Arquivos enviados
├── dist/                # Build (gerado)
└── package.json
```

## 🔌 Endpoints da API

### Health Check
```
GET /health
```

### Autenticação
```
POST /api/auth/login
POST /api/auth/register
```

### Comandas
```
POST   /api/comandas
GET    /api/comandas/:id
GET    /api/comandas/:id/pedidos
PATCH  /api/comandas/:id/status
```

### Pedidos
```
POST   /api/pedidos
GET    /api/pedidos/:id
PATCH  /api/pedidos/:id/status
DELETE /api/pedidos/:id
```

### Cardápio
```
GET    /api/cardapio
GET    /api/categorias
GET    /api/produtos
```

### Garçom
```
GET    /api/garcom/comandas
POST   /api/garcom/pedidos/:id/pagar
PATCH  /api/garcom/pedidos/:id
```

### Bar/Cozinha
```
GET    /api/preparo/pedidos
PATCH  /api/preparo/pedidos/:id/status
```

### Admin
```
POST   /api/admin/produtos
PUT    /api/admin/produtos/:id
DELETE /api/admin/produtos/:id
POST   /api/admin/categorias
GET    /api/admin/metricas
```

## 🔐 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação.

### Obter token
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "senha": "senha123"
}
```

### Usar token
```bash
GET /api/comandas
Authorization: Bearer SEU_TOKEN_AQUI
```

## 🌐 WebSocket

### Conectar
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3001');
```

### Entrar em sala (estabelecimento)
```javascript
socket.emit('join:estabelecimento', 'uuid-do-estabelecimento');
```

### Eventos disponíveis
- `pedido:novo` - Novo pedido criado
- `pedido:atualizado` - Status do pedido atualizado
- `pedido:cancelado` - Pedido cancelado

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Executar em modo watch
npm run test:watch

# Ver cobertura
npm run test:coverage
```

## 📝 Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `DATABASE_URL` | URL de conexão do PostgreSQL | - |
| `NODE_ENV` | Ambiente (development/production) | development |
| `PORT` | Porta do servidor | 3001 |
| `JWT_SECRET` | Chave secreta para JWT | - |
| `JWT_EXPIRES_IN` | Tempo de expiração do token | 7d |
| `CORS_ORIGIN` | Origem permitida para CORS | http://localhost:3000 |
| `UPLOAD_MAX_SIZE` | Tamanho máximo de upload (bytes) | 5242880 |

## 🐛 Debug

### Prisma Studio
Visualize e edite dados do banco:
```bash
npm run prisma:studio
```

### Logs
O servidor registra logs no console em desenvolvimento.

## 🚀 Deploy

### Preparar para produção
1. Configurar variáveis de ambiente
2. Executar build: `npm run build`
3. Executar migrations: `npm run prisma:migrate`
4. Iniciar: `npm start`

### Plataformas recomendadas
- **Railway** - https://railway.app
- **Render** - https://render.com
- **Heroku** - https://heroku.com
- **DigitalOcean** - https://digitalocean.com

## 📄 Licença

MIT
