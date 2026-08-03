# Setup do Ambiente de Desenvolvimento — Dine

> Fonte: CLAUDE.md + README.md | 2026-06-30

---

## Pré-requisitos

- Node.js 18+
- MySQL 8.x
- npm 9+
- Git

---

## Variáveis de Ambiente

### Backend (`backend/.env`)

```env
DATABASE_URL=mysql://root:senha@localhost:3306/dine
JWT_SECRET=sua-chave-secreta-muito-segura-aqui
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
PORT=3001

# Opcional — SaaS Billing
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## Backend

```bash
# 1. Instalar dependências
cd backend
npm install

# 2. Gerar cliente Prisma
npm run prisma:generate

# 3. Executar migrations
npm run prisma:migrate

# 4. Popular banco com dados iniciais
npm run prisma:seed

# 5. Iniciar em desenvolvimento
npm run dev
```

O servidor sobe em `http://localhost:3001`.

Health check: `GET http://localhost:3001/health`

---

## Frontend

```bash
# 1. Instalar dependências
cd frontend
npm install

# 2. Iniciar em desenvolvimento
npm run dev
```

O frontend sobe em `http://localhost:3000`.

---

## Servir na Rede Local (Frontend)

Para servir o frontend na rede local (ex: testar em celular):

```powershell
# No Windows:
.\start-rede.ps1
```

---

## Testes

```bash
cd backend
npm test
```

---

## Seed de Personas

Para popular o banco com dados de teste (3 estabelecimentos com produtos e usuários):

```bash
# Via API (apenas em development):
POST http://localhost:3001/api/seed-personas
```

Ou via script Prisma:
```bash
cd backend && npm run prisma:seed
```

### Personas criadas:
| Persona | Estabelecimento | Email | Senha |
|---------|-----------------|-------|-------|
| Carlos | Bar do Carlos | carlos@bar.com | 123456 |
| Mariana | Restaurante Sabor | mariana@rest.com | 123456 |
| Ricardo | Mix Gastrobar | ricardo@mix.com | 123456 |

---

## Estrutura de Branches

| Branch | Finalidade |
|--------|-----------|
| `main` | Produção |
| `pre-prod` | Homologação |
| `dev` | Desenvolvimento |
| `feature/*` | Novas features |
| `fix/*` | Correções |
| `hotfix/*` | Urgências |

Nunca desenvolver diretamente em `main`. Ver `docs/development/conventions.md`.
