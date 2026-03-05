# Backend Notícias360 (Node.js + Fastify + Prisma)

API em Node.js com Fastify e Prisma 7.

## Prisma 7 – conexão com o banco

No Prisma 7 a URL do banco **não fica mais no `schema.prisma`**. Ela é definida em:

1. **`prisma.config.ts`** – usado pelo CLI (`prisma migrate`, `prisma generate`, etc.).
2. **`.env`** – variável `DATABASE_URL` usada em runtime pelo PrismaClient.

Certifique-se de ter no `.env`:

```env
DATABASE_URL="file:./prisma/dev.db"
```

E rode os comandos sempre na raiz do backend-node (onde está o `package.json`):

- `npm run prisma:generate`
- `npm run prisma:migrate`
- `npm run dev`

## Scripts

- `npm run dev` – sobe o servidor (porta 3001).
- `npm run seed` – popula o banco (ex.: `node prisma/seed-direct.mjs`).
- `npm run prisma:generate` – gera o client Prisma.
- `npm run prisma:migrate` – aplica migrações.

## Dependência opcional: dotenv

Foi adicionado `dotenv` para carregar o `.env` no servidor e no `prisma.config.ts`. Se ainda não instalou:

```bash
npm install
```

Se o `npm install` falhar por causa de `better-sqlite3` (build nativo no Windows), use Node LTS (ex.: 20) ou instale as ferramentas de build do Visual Studio.
