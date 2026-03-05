# 📰 Noticias360 - Setup Local (Windows + Laragon + MySQL)

Projeto Full-Stack com **Strapi** (backend) + **Next.js** (frontend) rodando localmente no Windows.

---

## 📋 Pré-requisitos Instalados

✅ **Node.js**: v25.2.1  
✅ **npm**: 11.6.2  
✅ **Git**: 2.52.0  
✅ **Laragon**: Com MySQL rodando  

---

## 🗂️ Estrutura do Projeto

```
noticias360/
├── backend-strapi/          # Backend (Strapi + MySQL)
│   ├── config/              # Configurações do Strapi
│   ├── src/                 # Código-fonte (APIs, componentes)
│   ├── public/uploads/      # Uploads de mídia
│   ├── .env                 # Variáveis de ambiente
│   └── package.json
│
├── frontend-next/           # Frontend (Next.js + TypeScript + Tailwind)
│   ├── app/                 # App Router do Next.js
│   ├── app/teste/           # Página de teste de integração
│   ├── .env.local           # Variáveis de ambiente
│   └── package.json
│
└── setup-database.sql       # Script SQL para criar banco
```

---

## 🗄️ PASSO 1: Configurar MySQL no Laragon

### 1.1 Iniciar Laragon
1. Abra o **Laragon**
2. Clique em **"Start All"**
3. Verifique se o MySQL está **"Running"** (ícone verde)

### 1.2 Criar Banco de Dados

**Opção A: Usar phpMyAdmin** (recomendado para iniciantes)
1. No Laragon, clique em **"Database"** → **"Open phpMyAdmin"**
2. Vá em **"SQL"** (aba superior)
3. Cole o conteúdo do arquivo `setup-database.sql`
4. Clique em **"Executar"**

**Opção B: Linha de comando**
```powershell
# Abra o terminal do Laragon
cd C:\Projects\noticias360
mysql -u root -p < setup-database.sql
```

**Opção C: Usar root sem senha** (mais simples para DEV)
- Se preferir, pode usar o usuário `root` sem senha
- Neste caso, ajuste o arquivo `backend-strapi\.env`:
  ```env
  DATABASE_USERNAME=root
  DATABASE_PASSWORD=
  ```

### 1.3 Verificar Credenciais
Após executar o script, você terá:
- **Host**: `127.0.0.1`
- **Porta**: `3306`
- **Banco**: `noticias360`
- **Usuário**: `strapi_user`
- **Senha**: `strapi_pass_2026`

---

## 🚀 PASSO 2: Rodar o Backend (Strapi)

### 2.1 Abrir Terminal no Backend
```powershell
cd C:\Projects\noticias360\backend-strapi
```

### 2.2 Instalar Dependências (se necessário)
```powershell
npm install
```

### 2.3 Rodar o Strapi em Modo Desenvolvimento
```powershell
npm run develop
```

### 2.4 Aguardar Inicialização
Você verá algo como:
```
[2026-01-31 17:30:00.000] info: Server started on http://localhost:1337
[2026-01-31 17:30:00.000] info: ✨ Admin panel: http://localhost:1337/admin
```

### 2.5 Criar Usuário Admin (Primeiro Acesso)
1. Acesse: **http://localhost:1337/admin**
2. Preencha o formulário:
   - Nome
   - Email
   - Senha (mínimo 8 caracteres)
3. Clique em **"Let's start"**

✅ **Strapi está rodando!**

---

## 🎨 PASSO 3: Rodar o Frontend (Next.js)

### 3.1 Abrir NOVO Terminal no Frontend
⚠️ **IMPORTANTE**: Deixe o terminal do Strapi rodando e abra um **NOVO terminal**

```powershell
cd C:\Projects\noticias360\frontend-next
```

### 3.2 Instalar Dependências (se necessário)
```powershell
npm install
```

### 3.3 Rodar o Next.js em Modo Desenvolvimento
```powershell
npm run dev
```

### 3.4 Aguardar Inicialização
Você verá algo como:
```
  ▲ Next.js 15.x.x
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000

 ✓ Starting...
 ✓ Ready in 2.5s
```

✅ **Next.js está rodando!**

---

## 🧪 PASSO 4: Testar a Integração

### 4.1 Acessar Página de Teste
Abra no navegador:
👉 **http://localhost:3000/teste**

### 4.2 Verificar Status
Você deve ver:
- ✅ **Strapi está rodando** (fundo verde)
- ✅ **Next.js rodando** (você está vendo a página)

### 4.3 Checklist de Verificação

| Item | Status | URL |
|------|--------|-----|
| MySQL rodando no Laragon | ⬜ | - |
| Banco `noticias360` criado | ⬜ | phpMyAdmin |
| Strapi rodando | ⬜ | http://localhost:1337 |
| Admin do Strapi acessível | ⬜ | http://localhost:1337/admin |
| Next.js rodando | ⬜ | http://localhost:3000 |
| Página de teste OK | ⬜ | http://localhost:3000/teste |

---

## 🔧 TROUBLESHOOTING (Erros Comuns)

### ❌ Erro: "ER_ACCESS_DENIED_ERROR" (MySQL)
**Causa**: Usuário/senha incorretos ou permissões não concedidas

**Solução**:
1. Verifique se executou o `setup-database.sql`
2. Confirme as credenciais no arquivo `backend-strapi\.env`
3. Tente usar `root` sem senha (apenas para DEV):
   ```env
   DATABASE_USERNAME=root
   DATABASE_PASSWORD=
   ```

---

### ❌ Erro: "ECONNREFUSED 127.0.0.1:3306"
**Causa**: MySQL não está rodando

**Solução**:
1. Abra o Laragon
2. Clique em "Start All"
3. Verifique se o ícone do MySQL está verde

---

### ❌ Erro: "CORS error" no navegador
**Causa**: Strapi bloqueando requisições do Next.js

**Solução**:
✅ Já configurado! O arquivo `backend-strapi/config/middlewares.js` permite `localhost:3000`

Se ainda tiver erro, verifique se o Next está rodando em outra porta e ajuste.

---

### ❌ Erro: "Port 1337 already in use"
**Causa**: Outra aplicação usando a porta 1337

**Solução**:
1. Feche outras aplicações Strapi
2. OU mude a porta no `backend-strapi\.env`:
   ```env
   PORT=1338
   ```
3. Atualize também o `frontend-next\.env.local`:
   ```env
   NEXT_PUBLIC_STRAPI_URL=http://localhost:1338
   ```

---

### ❌ Erro: "Port 3000 already in use"
**Causa**: Outra aplicação usando a porta 3000

**Solução**:
```powershell
# Rode o Next em outra porta
npm run dev -- -p 3001
```

---

### ❌ Erro: "Unsupported engine" (Node.js)
**Causa**: Strapi 5.x requer Node 20-24, mas você tem Node 25

**Solução**:
✅ Já resolvido! Este projeto usa **Strapi 4.x** que funciona com Node 25.

Se quiser usar Strapi 5 no futuro:
1. Instale **nvm-windows**: https://github.com/coreybutler/nvm-windows
2. Instale Node 22:
   ```powershell
   nvm install 22
   nvm use 22
   ```

---

## 📦 Comandos Úteis

### Backend (Strapi)
```powershell
cd C:\Projects\noticias360\backend-strapi

# Modo desenvolvimento (com hot-reload)
npm run develop

# Modo produção (build + start)
npm run build
npm run start

# Acessar console do Strapi
npm run strapi
```

### Frontend (Next.js)
```powershell
cd C:\Projects\noticias360\frontend-next

# Modo desenvolvimento
npm run dev

# Build de produção
npm run build

# Rodar build de produção
npm run start

# Linter
npm run lint
```

---

## 🎯 Próximos Passos

### 1. Criar Content Types no Strapi
1. Acesse http://localhost:1337/admin
2. Vá em **"Content-Type Builder"**
3. Crie um novo **Collection Type** (ex: "Noticia")
4. Adicione campos:
   - `titulo` (Text)
   - `conteudo` (Rich Text)
   - `imagem` (Media)
   - `publicadoEm` (Date)

### 2. Adicionar Dados de Teste
1. Vá em **"Content Manager"**
2. Crie algumas notícias
3. **Publique** (clique em "Publish")

### 3. Configurar Permissões da API
1. Vá em **"Settings"** → **"Users & Permissions Plugin"** → **"Roles"**
2. Clique em **"Public"**
3. Em **"Noticia"**, marque:
   - ✅ `find` (listar)
   - ✅ `findOne` (buscar por ID)
4. Salve

### 4. Consumir API no Next.js
Crie uma página para listar notícias:

```typescript
// app/noticias/page.tsx
export default async function NoticiasPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/noticias`);
  const data = await res.json();

  return (
    <div>
      <h1>Notícias</h1>
      {data.data.map((noticia: any) => (
        <div key={noticia.id}>
          <h2>{noticia.attributes.titulo}</h2>
          <p>{noticia.attributes.conteudo}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 🔒 Segurança (Produção)

⚠️ **IMPORTANTE**: As configurações atuais são para **DESENVOLVIMENTO LOCAL**.

Antes de colocar em produção:

1. **Trocar senhas**:
   - Banco de dados
   - Secrets do Strapi (`.env`)

2. **Usar HTTPS**

3. **Configurar CORS** apenas para domínios específicos

4. **Usar PostgreSQL** (mais robusto que MySQL para produção)

5. **Variáveis de ambiente** em servidor seguro (não commitar `.env`)

---

## 💰 Custos

### Local (seu PC)
- **Custo**: R$ 0,00
- **Hardware**: Usa recursos do seu computador

### Produção (Opções)
1. **Strapi Cloud** (oficial):
   - Free tier: Limitado
   - Pro: ~$99/mês

2. **VPS** (DigitalOcean, Linode, etc.):
   - Básico: $5-10/mês
   - Médio: $20-40/mês

3. **Vercel** (Next.js) + **Railway/Render** (Strapi):
   - Next.js: Grátis (Vercel)
   - Strapi: $5-20/mês

---

## 🐘 PostgreSQL Local (Opcional)

Se quiser usar PostgreSQL em vez de MySQL:

### 1. Instalar PostgreSQL
- Download: https://www.postgresql.org/download/windows/
- Instalar com pgAdmin 4

### 2. Criar Banco
```sql
CREATE DATABASE noticias360;
CREATE USER strapi_user WITH PASSWORD 'strapi_pass_2026';
GRANT ALL PRIVILEGES ON DATABASE noticias360 TO strapi_user;
```

### 3. Ajustar Strapi
No `backend-strapi\.env`:
```env
DATABASE_CLIENT=postgres
DATABASE_HOST=127.0.0.1
DATABASE_PORT=5432
DATABASE_NAME=noticias360
DATABASE_USERNAME=strapi_user
DATABASE_PASSWORD=strapi_pass_2026
```

### 4. Instalar Driver
```powershell
cd backend-strapi
npm install pg
```

---

## 📞 Suporte

Se encontrar problemas:

1. **Verifique os logs** nos terminais do Strapi e Next.js
2. **Consulte a documentação**:
   - Strapi: https://docs.strapi.io
   - Next.js: https://nextjs.org/docs
3. **Copie a mensagem de erro completa** para pesquisar

---

## ✅ Checklist Final

- [ ] Laragon rodando com MySQL
- [ ] Banco `noticias360` criado
- [ ] Strapi rodando em http://localhost:1337
- [ ] Admin do Strapi acessível
- [ ] Usuário admin criado
- [ ] Next.js rodando em http://localhost:3000
- [ ] Página de teste mostrando conexão OK
- [ ] Pronto para criar Content Types!

---

**🎉 Parabéns! Seu ambiente está configurado!**

Agora você pode começar a desenvolver o **Noticias360**! 🚀
