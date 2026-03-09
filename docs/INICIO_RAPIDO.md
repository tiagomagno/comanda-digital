# 🚀 Guia de Início Rápido

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 15+ ([Download](https://www.postgresql.org/download/))
- **Redis** (Opcional, mas recomendado) ([Download](https://redis.io/download))
- **Git** ([Download](https://git-scm.com/))

## 📦 Instalação

### 1. Clone o repositório (ou use a pasta existente)

```bash
cd C:\Projects\comanda-digital
```

### 2. Configure o Banco de Dados

#### Criar o banco de dados PostgreSQL

```bash
# Conecte ao PostgreSQL
psql -U postgres

# Crie o banco de dados
CREATE DATABASE comanda_digital;

# Saia do psql
\q
```

#### Execute o schema

```bash
psql -U postgres -d comanda_digital -f database/schema.sql
```

### 3. Configure as Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o arquivo .env com suas configurações
# Use seu editor preferido (VSCode, Notepad++, etc)
```

## 🛠️ Escolha da Stack

### Opção 1: Next.js + Node.js (Recomendado)

Esta é a opção mais moderna e adequada para PWA.

#### Backend (API)

```bash
cd backend
npm init -y
npm install express prisma @prisma/client jsonwebtoken bcrypt cors dotenv socket.io
npm install -D typescript @types/node @types/express ts-node-dev nodemon
```

#### Frontend

```bash
cd ../frontend
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir
npm install axios socket.io-client zustand react-hook-form zod @hookform/resolvers
npm install qrcode qrcode.react
```

### Opção 2: Laravel (PHP)

Se preferir usar Laravel:

```bash
cd backend
composer create-project laravel/laravel .
composer require laravel/sanctum pusher/pusher-php-server
```

## 🏃 Executando o Projeto

### Backend

```bash
cd backend

# Com Node.js
npm run dev

# Com Laravel
php artisan serve
```

### Frontend

```bash
cd frontend
npm run dev
```

Acesse: `http://localhost:3000`

## 📱 Testando o Sistema

### 1. Acesse o Admin

- URL: `http://localhost:3000/admin`
- Login: `admin@bardojoao.com.br`
- Senha: `senha123`

### 2. Cadastre Produtos

- Acesse "Produtos" no menu
- Adicione produtos de teste
- Configure categorias (Bar/Cozinha)

### 3. Gere um QR Code

- Acesse "Comandas"
- Clique em "Gerar QR Code"
- Escaneie com seu celular ou acesse a URL diretamente

### 4. Faça um Pedido

- Abra a comanda no celular
- Adicione produtos ao carrinho
- Finalize o pedido

### 5. Teste o Painel do Garçom

- URL: `http://localhost:3000/garcom`
- Visualize comandas ativas
- Confirme pagamento

### 6. Teste o Painel Bar/Cozinha

- URL: `http://localhost:3000/bar` ou `/cozinha`
- Visualize pedidos pendentes
- Atualize status

## 🔧 Scripts Úteis

### Backend (Node.js)

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  }
}
```

### Frontend (Next.js)

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

## 📂 Estrutura de Pastas Recomendada

### Backend (Node.js + Express)

```
backend/
├── src/
│   ├── controllers/
│   │   ├── comanda.controller.ts
│   │   ├── pedido.controller.ts
│   │   ├── produto.controller.ts
│   │   └── auth.controller.ts
│   ├── routes/
│   │   ├── comanda.routes.ts
│   │   ├── pedido.routes.ts
│   │   └── index.ts
│   ├── services/
│   │   ├── comanda.service.ts
│   │   ├── pedido.service.ts
│   │   └── qrcode.service.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   └── error.middleware.ts
│   ├── utils/
│   │   └── jwt.util.ts
│   ├── config/
│   │   └── database.ts
│   └── server.ts
├── prisma/
│   └── schema.prisma
├── package.json
└── tsconfig.json
```

### Frontend (Next.js)

```
frontend/
├── app/
│   ├── (cliente)/
│   │   ├── comanda/
│   │   │   └── [codigo]/
│   │   │       └── page.tsx
│   │   └── cardapio/
│   │       └── page.tsx
│   ├── (staff)/
│   │   ├── garcom/
│   │   │   └── page.tsx
│   │   ├── bar/
│   │   │   └── page.tsx
│   │   └── cozinha/
│   │       └── page.tsx
│   ├── admin/
│   │   ├── produtos/
│   │   │   └── page.tsx
│   │   └── dashboard/
│   │       └── page.tsx
│   └── layout.tsx
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── input.tsx
│   ├── comanda/
│   │   ├── ComandaForm.tsx
│   │   └── ComandaStatus.tsx
│   └── produto/
│       └── ProdutoCard.tsx
├── lib/
│   ├── api.ts
│   └── socket.ts
├── stores/
│   ├── comanda.store.ts
│   └── carrinho.store.ts
└── package.json
```

## 🐳 Docker (Opcional)

Se preferir usar Docker:

```bash
# Criar arquivo docker-compose.yml na raiz do projeto
docker-compose up -d
```

Exemplo de `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: comanda_digital
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

## 🧪 Testes

### Backend

```bash
cd backend
npm install -D jest @types/jest ts-jest supertest @types/supertest
npm test
```

### Frontend

```bash
cd frontend
npm install -D @testing-library/react @testing-library/jest-dom vitest
npm test
```

## 📝 Próximos Passos

1. ✅ Configurar ambiente de desenvolvimento
2. ✅ Criar estrutura de pastas
3. ⏳ Implementar autenticação
4. ⏳ Desenvolver API de comandas
5. ⏳ Criar interface do cliente
6. ⏳ Implementar sistema de QR Code
7. ⏳ Desenvolver painéis de staff
8. ⏳ Adicionar modo offline
9. ⏳ Testes e deploy

## 🆘 Problemas Comuns

### Erro ao conectar no PostgreSQL

```bash
# Verifique se o PostgreSQL está rodando
# Windows:
services.msc
# Procure por "PostgreSQL" e inicie o serviço

# Ou via linha de comando:
pg_ctl -D "C:\Program Files\PostgreSQL\15\data" start
```

### Porta 3000 já em uso

```bash
# Altere a porta no .env
PORT=3001
```

### Erro de permissão no banco

```bash
# Verifique as credenciais no .env
# Certifique-se de que o usuário tem permissões adequadas
```

## 📚 Recursos Adicionais

- [Documentação Next.js](https://nextjs.org/docs)
- [Documentação Prisma](https://www.prisma.io/docs)
- [Documentação PostgreSQL](https://www.postgresql.org/docs/)
- [Documentação Socket.io](https://socket.io/docs/)

---

**Dúvidas?** Consulte a documentação completa em `/docs/PLANEJAMENTO_TECNICO.md`
