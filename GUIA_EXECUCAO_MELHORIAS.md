# 🚀 GUIA DE EXECUÇÃO DAS MELHORIAS

## ⚠️ IMPORTANTE: Pré-requisitos

Antes de executar os comandos abaixo, certifique-se de que:

1. ✅ **MySQL está rodando** (XAMPP ou outro servidor MySQL)
2. ✅ **Banco de dados `comanda_digital` existe**
3. ✅ **Backend está parado** (feche o servidor antes de rodar migrations/seed)

---

## 📋 PASSO A PASSO

### 1️⃣ Executar Migrations (se necessário)

```bash
cd C:\Projects\comanda-digital\backend
npm run prisma:migrate
```

### 2️⃣ Executar Seed Atualizado

```bash
cd C:\Projects\comanda-digital\backend
npm run prisma:seed
```

**O que o seed vai criar:**
- ✅ 1 Estabelecimento (Bar do Zé)
- ✅ 4 Usuários com códigos de acesso:
  - Admin: `ADMIN2026`
  - Garçom: `GARCOM01`
  - Cozinha: `COZINHA01`
  - Bar: `BAR01`
- ✅ 4 Categorias (Bebidas, Porções, Pratos, Sobremesas)
- ✅ 17 Produtos

### 3️⃣ Adicionar Mesas (Opcional)

```bash
cd C:\Projects\comanda-digital\backend
npx tsx prisma/add-mesas.ts
```

**O que vai criar:**
- ✅ 15 Mesas com QR Codes
- Mesas 1-5: Capacidade 2 pessoas
- Mesas 6-10: Capacidade 4 pessoas
- Mesas 11-15: Capacidade 6 pessoas

### 4️⃣ Iniciar Servidores

```bash
# Terminal 1 - Backend
cd C:\Projects\comanda-digital\backend
npm run dev

# Terminal 2 - Frontend
cd C:\Projects\comanda-digital\frontend
npm run dev
```

### 5️⃣ Testar Login

Acesse: http://localhost:3000/auth/login

**Códigos de Acesso:**
- `ADMIN2026` - Painel do Administrador
- `GARCOM01` - Painel do Garçom
- `COZINHA01` - Painel da Cozinha
- `BAR01` - Painel do Bar

---

## 🔧 ALTERAÇÕES IMPLEMENTADAS

### ✅ Backend

1. **Seed Atualizado** (`prisma/seed.ts`)
   - ✅ Admin agora tem código de acesso: `ADMIN2026`
   - ✅ Criados 3 usuários de teste (Garçom, Cozinha, Bar)
   - ✅ Todos com códigos de acesso funcionais

2. **Script de Mesas** (`prisma/add-mesas.ts`)
   - ✅ Adiciona 15 mesas com QR Codes
   - ✅ Pode ser executado separadamente

### 🚧 Frontend (Em Implementação)

As seguintes melhorias estão sendo implementadas:

1. **Escolha de Forma de Pagamento** (Cliente)
   - Adicionar tela para escolher "Pagar Agora" ou "Pagar no Final"
   
2. **Painel do Garçom** (`/garcom`)
   - Visualização de comandas ativas
   - Diferenciação visual entre formas de pagamento
   - Processamento de pagamento imediato

3. **Painel da Cozinha** (`/cozinha`)
   - Kanban com 3 colunas (Novos, Em Preparo, Prontos)
   - Drag-and-drop entre status
   - Timer de preparo

4. **Painel do Bar** (`/bar`)
   - Mesma estrutura da cozinha
   - Filtrado para pedidos de bebidas

5. **Painel do Caixa** (`/caixa`)
   - Comandas aguardando pagamento final
   - Processamento de fechamento
   - Relatórios do dia

---

## 🐛 Solução de Problemas

### Erro: "Can't connect to MySQL server"

**Solução:**
1. Abra o XAMPP Control Panel
2. Inicie o MySQL
3. Aguarde ficar verde
4. Execute os comandos novamente

### Erro: "Unknown database 'comanda_digital'"

**Solução:**
1. Acesse: http://localhost/phpmyadmin
2. Clique em "Novo"
3. Nome: `comanda_digital`
4. Agrupamento: `utf8mb4_unicode_ci`
5. Clique em "Criar"

### Erro: "Access denied for user 'root'"

**Solução:**
Se o MySQL tem senha, edite o arquivo `.env` no backend:

```env
DATABASE_URL="mysql://root:SUA_SENHA@localhost:3306/comanda_digital"
```

### Erro 500 no Login

**Causa:** Seed não foi executado ou não tem códigos de acesso

**Solução:**
1. Execute o seed atualizado (passo 2️⃣)
2. Verifique se os usuários foram criados:
   ```sql
   SELECT nome, codigoAcesso, tipo FROM usuarios;
   ```

---

## 📊 Próximos Passos

Após executar o seed com sucesso:

1. ✅ Testar login com todos os códigos
2. ✅ Verificar se as mesas foram criadas
3. ✅ Testar criação de comanda como cliente
4. ⏳ Aguardar implementação dos painéis (em andamento)

---

**Última atualização:** 07/01/2026 17:15
