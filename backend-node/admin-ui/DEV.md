# Desenvolvimento do painel admin (hot reload)

Para **ver alterações no código sem precisar dar build** a cada vez:

1. **Terminal 1 – backend** (API e uploads):
   ```bash
   cd backend-node
   npm run dev
   ```
   Deixe rodando (porta 3001).

2. **Terminal 2 – painel em modo dev** (Vite com atualização automática):
   ```bash
   cd backend-node
   npm run dev:admin
   ```
   Ou, de dentro do `backend-node`: `cd admin-ui && npm run dev`.

3. **Acesse o painel em:**  
   **http://localhost:5173/admin/**

Ao editar arquivos em `admin-ui/src`, a página atualiza sozinha.  
As chamadas de API e as mídias (`/api`, `/uploads`) são atendidas pelo backend na porta 3001 (via proxy do Vite).

---

**Produção / build:**  
Para usar o painel junto do backend em uma única URL (`http://localhost:3001/admin`), rode `npm run build` em `admin-ui` e reinicie o backend. Aí o backend serve os arquivos da pasta `dist`.
