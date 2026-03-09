# Painel admin: EJS vs Kibo UI

## Situação atual (EJS)

O painel em **`views/admin/`** usa **EJS**: HTML renderizado no servidor, sem React. É simples, não exige build e já funciona em **http://localhost:3001/admin**.

## Por que Kibo UI não está no painel hoje

**Kibo UI** é uma biblioteca de **componentes React** (TypeScript, Tailwind, shadcn/ui). Ela roda no **navegador**, dentro de uma aplicação React. Não dá para usar Kibo UI dentro de templates EJS, porque EJS só gera HTML estático.

## Usar Kibo UI no painel: como fazer

Para ter o painel **com Kibo UI** e ainda **servido pelo backend**:

1. **Criar um mini-app React** (ex.: Vite + React) na pasta **`admin-ui/`** dentro do backend (ou em outro repositório).
2. Nesse app: **React + Tailwind + shadcn/ui + Kibo UI** (Table, Form, etc.), como no [setup do Kibo UI](https://www.kibo-ui.com/docs/setup).
3. O app consome a **mesma API** do backend (`GET /admin/noticias`, `POST /auth/login`, etc.).
4. **Build** do app (`npm run build`) gera a pasta **`admin-ui/dist`** (HTML, JS, CSS).
5. O **Fastify** passa a servir essa pasta em **`/admin`** com `@fastify/static`: quem acessa `http://localhost:3001/admin` recebe o `index.html` do SPA; o SPA carrega e chama a API no mesmo backend.

Resultado: o painel continua “no backend” (mesma origem, mesmo deploy), mas a **UI é feita com Kibo UI** (React).

## Resumo

| Abordagem | Prós | Contras |
|-----------|------|--------|
| **EJS (atual)** | Simples, sem build, tudo no backend | UI mais básica, sem componentes Kibo UI |
| **SPA React + Kibo UI servida pelo backend** | UI rica com Kibo UI, mesmo servidor/origem | Exige projeto `admin-ui`, build e servir estáticos |

**Conclusão:** Kibo UI **é** adequado para o painel; para usá-lo, o painel precisa ser um **SPA React** (por exemplo em `admin-ui/`) que o backend **serve** em `/admin`. O EJS pode ser mantido como fallback ou substituído por esse SPA.
