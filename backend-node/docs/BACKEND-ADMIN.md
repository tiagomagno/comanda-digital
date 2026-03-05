# Backend – Inserir notícias, usuários e painel admin

Onde está cada coisa no backend Node (Fastify + Prisma) e o que falta para a área de redação e admin.

---

## Arquitetura: painel no back, front só o site

- **Backend** = API (JSON) **+ painel administrativo** (login, notícias, revisão, publicação, usuários, configurações). O painel é servido e controlado pelo próprio backend (páginas HTML com templates ou SPA estático em `/admin`).
- **Frontend (Next.js)** = **apenas o site público**: home, editorias, últimas, busca, página da notícia. Não possui rotas de admin; o jornalista/editor acessa o painel pela URL do backend (ex.: `http://localhost:3001/admin`).

Assim o front fica só em exibir o site; todo o controle (criar, editar, remover, revisar, publicar) fica no back.

**Painel UI já no backend:** as rotas que servem o painel (HTML) estão implementadas com **EJS** em `views/admin/`. Acesso: **http://localhost:3001/admin** (redireciona para login ou dashboard). Rotas: `GET /admin`, `GET /admin/login`, `POST /admin/login`, `GET /admin/dashboard`, `GET /admin/logout`. Credenciais: iguais ao login da redação (variáveis `REDACAO_USER` e `REDACAO_PASSWORD` no `.env`, ou qualquer usuário/senha em dev).

---

## Estrutura do backend

| O quê | Onde fica |
|-------|-----------|
| **Rotas (URLs)** | `src/routes.ts` |
| **Lógica de notícias** | `src/controllers/noticias.controller.ts` |
| **Modelos / tabelas** | `prisma/schema.prisma` |
| **Conexão com o banco** | `src/lib/prisma.ts` |
| **Seed (dados iniciais)** | `prisma/seed-prisma.mjs` |

---

## 1. Notícias (inserir / editar)

### Já existe
- **GET** `/noticias` – lista com paginação, filtro por editoria (`?editoriaSlug=`) e busca (`?q=`)
- **GET** `/noticias/:slug` – uma notícia por slug

### Para criar/editar (onde implementar)
- **POST** `/noticias` – criar notícia  
  - Implementado em: `src/controllers/noticias.controller.ts` (função `createNoticia`) e registrado em `src/routes.ts`.
- **PUT** `/noticias/:id` ou **PATCH** `/noticias/:slug` – editar notícia  
  - Ainda não existe: adicionar em `noticias.controller.ts` e em `routes.ts`.
- **DELETE** `/noticias/:id` – apagar (opcional)  
  - Idem: controller + rota.

Corpo sugerido para **POST** (JSON):

- `titulo`, `subtitulo?`, `conteudo`, `editoriaId`, `autorId`
- `slug` (opcional; se não enviar, o backend gera a partir do título)
- `imagemDestaque` – **URL** da imagem (por enquanto só URL; upload de arquivo pode vir depois)

---

## 2. Modelo de Admin (painel no backend)

O **painel administrativo** fica no **backend**: usuários, perfis (roles), login, e as **páginas do painel** (listar/editar notícias, revisão, publicação) são servidas pelo próprio Fastify (templates SSR ou SPA em pasta estática). O frontend Next.js **não** tem telas de admin.

### Onde fica cada parte do admin

| Parte | Onde no backend |
|-------|------------------|
| **Tabela de usuários** | `prisma/schema.prisma` → model `User` (e opcionalmente `Role` ou campo `role`) |
| **Login / sessão** | `src/routes.ts` (POST `/auth/login`) + `src/controllers/auth.controller.ts` |
| **Proteção das rotas** | Middleware/hook no Fastify que valida o JWT e (se quiser) o role (admin, editor, etc.) |
| **Rotas só para admin** | Mesmo `routes.ts`: ex. GET/PUT `/admin/usuarios`, PUT `/config`, etc. |

### Passos para ter um admin “de verdade”

1. **Modelo User (e role)** em `prisma/schema.prisma`  
   - Campos: `id`, `email`, `passwordHash`, `nome`, `role` (ex.: `admin` \| `editor`), `createdAt`, `updatedAt`.  
   - Senha sempre hasheada (ex.: `bcrypt`); nunca salvar senha em texto puro.

2. **Migração**  
   - `npx prisma migrate dev` para criar a tabela `User`.

3. **Seed do primeiro admin**  
   - Em `prisma/seed-prisma.mjs` (ou script separado): criar um usuário com `role: 'admin'` e senha hasheada.

4. **Auth controller**  
   - Em `src/controllers/auth.controller.ts`: login que busca User por email, compara senha com `bcrypt.compare`, gera JWT (ex.: com `jsonwebtoken`) e retorna `{ jwt, user }`.  
   - Opcional: refresh token, “esqueci a senha”, etc.

5. **Middleware de autenticação**  
   - Em `src/` (ex.: `lib/auth.ts` ou `middlewares/auth.ts`): função que lê `Authorization: Bearer <token>`, valida o JWT, anexa o usuário em `request.user` e, se não houver token válido, responde 401.

6. **Proteção das rotas**  
   - Em `routes.ts`: nas rotas de redação/admin (POST/PUT/DELETE notícias, PUT config, CRUD usuários), chamar esse middleware antes do handler.  
   - Opcional: middleware “só admin” que, além de autenticado, exige `request.user.role === 'admin'`.

7. **Painel (UI)**  
   - As telas do painel (login, lista de notícias, edição) são servidas pelo backend (ex.: GET /admin com HTML). O front Next.js não tem /admin nem /redacao; acesso ao painel pela URL do backend (ex.: http://localhost:3001/admin). O “modelo” de admin (quem pode fazer o quê) é definido e aplicado no backend.

---

## 3. Usuários (login / área do jornalista) – detalhes

### Situação atual
- Não existe modelo **User** no Prisma; o login usa só `.env` (REDACAO_USER / REDACAO_PASSWORD).
- A página `/redacao` do frontend espera login (JWT) e depois envia notícias.

### O que fazer (quando for implementar User no banco)
1. **Modelo de usuário**  
   - Em `prisma/schema.prisma`: criar model `User` (ex.: `id`, `email`, `passwordHash`, `nome`, `role`, `createdAt`).
2. **Migração**  
   - Rodar `npx prisma migrate dev` para criar a tabela.
3. **Login**  
   - Em `src/controllers/auth.controller.ts`: receber `identifier` (email) e `password`, buscar User, comparar com `bcrypt`, retornar JWT.
4. **Proteção das rotas de redação**  
   - Rotas **POST** `/noticias`, **PUT** `/noticias/:id` etc. só aceitarem requisições com o token válido (middleware que lê o header `Authorization` e valida o JWT).

---

## 4. Configurações adicionais (home, destaque, etc.)

### Já existe (somente leitura)
- **GET** `/home-config` – retorna destaque principal e laterais (montado a partir das últimas notícias no banco).

### Para “configurações” editáveis (onde criar)
- **Modelo**  
  - Em `prisma/schema.prisma`: por exemplo um model `Config` com `chave` (string única) e `valor` (string ou JSON). Ou um model `HomeConfig` com campos fixos (id da notícia em destaque, ids dos laterais, etc.).
- **Rotas**  
  - Em `src/routes.ts`:  
    - **GET** `/config` ou `/home-config` (já existe um GET; pode passar a ler do novo model).  
    - **PUT** `/config` ou **PUT** `/home-config` – salvar destaque principal, laterais, texto do site, etc. (só para usuários autenticados).

Assim você concentra **configurações adicionais** em um lugar: model em `schema.prisma` + rotas em `routes.ts` + um controller em `src/controllers/` se quiser separar a lógica.

---

## 5. Resumo rápido: onde ver para criar o quê

| Objetivo | Onde ver / criar |
|----------|-------------------|
| **Inserir notícias** | `POST /noticias` em `routes.ts` + `createNoticia` em `noticias.controller.ts` (já implementado). Front: área “Redação” em `/redacao`. |
| **Listar/editar notícias** | Mesmo controller: adicionar `updateNoticia`, `deleteNoticia` e registrar PUT/DELETE em `routes.ts`. |
| **Usuários (login)** | `schema.prisma` (model `User`), novo `auth.controller.ts`, rotas `POST /auth/login` em `routes.ts`, e proteção das rotas de escrita com JWT. |
| **Configurações (home, etc.)** | `schema.prisma` (model `Config` ou `HomeConfig`), rotas GET/PUT em `routes.ts` e controller de config. |

---

## 6. Testar a API

- Base URL (exemplo): `http://localhost:3001`
- Listar notícias: `GET http://localhost:3001/noticias`
- Criar notícia: `POST http://localhost:3001/noticias` com body JSON (veja exemplo no controller).
- Login (quando implementado): `POST http://localhost:3001/auth/login` com `{ "identifier": "email", "password": "senha" }`.

A área do frontend para **inserir notícias** é a página **Redação** em `/redacao` (link “Área do Editor” no menu).

---

## 7. Login da área de redação (atual)

- **POST** `/auth/login` – body: `{ "identifier": "email ou usuário", "password": "senha" }`.
- Se no `.env` do backend existirem `REDACAO_USER` e `REDACAO_PASSWORD`, o login só aceita essas credenciais.
- Se não existirem, qualquer usuário/senha é aceito (apenas para desenvolvimento).
- Resposta: `{ "jwt": "token", "user": { ... } }` – o frontend envia esse `jwt` no header `Authorization: Bearer <token>` ao criar notícias.
