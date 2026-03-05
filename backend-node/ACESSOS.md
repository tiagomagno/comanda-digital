# Portas e acessos – Notícias 360

## Visão geral

| Porta | Serviço              | Uso |
|------|----------------------|-----|
| **3001** | Backend (Fastify)   | API REST, auth, uploads, arquivos estáticos do admin (build) |
| **5173** | Admin (Vite dev)    | Apenas desenvolvimento: painel com hot reload |
| **3000** | *(não usado)*      | Este projeto não usa a porta 3000. |

---

## Cenários de acesso

### 1. Produção / build (uma única porta)

- **Backend** roda na porta **3001** e serve:
  - API: `http://localhost:3001/api/...`, `http://localhost:3001/auth/...`
  - Uploads: `http://localhost:3001/uploads/...`
  - Painel admin (SPA): `http://localhost:3001/admin/` (arquivos em `admin-ui/dist`)
- **Acesso:** abra `http://localhost:3001/admin/` (ou o host em produção).
- A variável **`PORT`** no `.env` do backend altera a porta (padrão: 3001).

### 2. Desenvolvimento com hot reload (duas portas)

- **Terminal 1 – Backend:** porta **3001** (`npm run dev` em `backend-node`).
- **Terminal 2 – Admin (Vite):** porta **5173** (`npm run dev:admin` ou `cd admin-ui && npm run dev`).
- **Acesso ao painel:** `http://localhost:5173/admin/`.
- O Vite faz proxy de `/api` e `/uploads` para `http://localhost:3001`, então o front na 5173 usa a API na 3001 sem CORS.

### 3. Variáveis de ambiente

**Backend (`backend-node/.env`):**

- `PORT` – porta do servidor (opcional; padrão no código: 3001).

**Admin (`admin-ui/.env` ou `.env.example`):**

- `VITE_API_URL` – URL base da API quando o painel **não** está na mesma origem (ex.: build servido por outro host). Em dev com proxy, não é necessária (usa mesma origem).
- `VITE_DEV_PROXY_TARGET` – (opcional) Alvo do proxy do Vite em dev; padrão `http://localhost:3001`. Use se o backend rodar em outra porta (ex.: `http://localhost:3000`).

---

## Onde as portas/URLs são definidas

- **Backend:** `src/server.ts` usa `process.env.PORT || 3001`.
- **Admin – chamadas de API:** `admin-ui/src/lib/api.ts` (constante `API_BASE` / origem da API).
- **Admin – URLs de mídia (img, link):** mesmo origem em dev (5173 com proxy); em prod usa `window.location.origin` ou `VITE_API_URL` (refatorado para usar `getApiOrigin()` de `api.ts`).
- **Vite proxy:** `admin-ui/vite.config.ts` – `target: 'http://localhost:3001'` para `/api` e `/uploads`.

---

## Resumo para refatoração

- Uma única fonte para “origem da API” no front: `admin-ui/src/lib/api.ts` (exportar `getApiOrigin()` e usar em todas as páginas que montam URL de mídia).
- Backend: porta configurável via `PORT` no `.env`.
- Porta 3000 não é utilizada neste projeto.
