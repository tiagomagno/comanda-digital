# 🔄 PROJETO ADAPTADO PARA MYSQL (XAMPP)

## ✅ ALTERAÇÕES REALIZADAS

### 1. Prisma Schema
- ✅ Provider alterado de `postgresql` para `mysql`
- ✅ Prisma Client regenerado para MySQL

### 2. Variáveis de Ambiente
- ✅ `.env.example` atualizado com connection string MySQL
- ✅ `.env` criado automaticamente

### 3. Connection String
```
mysql://root@localhost:3306/comanda_digital
```

**Explicação:**
- `root` = usuário padrão do XAMPP
- `localhost:3306` = servidor MySQL local
- `comanda_digital` = nome do banco de dados

---

## 🚀 PRÓXIMOS PASSOS (3 PASSOS SIMPLES)

### 1️⃣ Criar Banco de Dados no phpMyAdmin

#### Opção A: Via phpMyAdmin (Interface Gráfica) ⭐ RECOMENDADO

1. Abra o navegador
2. Acesse: **http://localhost/phpmyadmin**
3. Clique em **"Novo"** (ou "New") no menu lateral esquerdo
4. Em "Nome do banco de dados", digite: **`comanda_digital`**
5. Em "Agrupamento", selecione: **`utf8mb4_unicode_ci`**
6. Clique em **"Criar"**

**Pronto! Banco criado!** ✅

#### Opção B: Via SQL (Linha de Comando)

Se preferir usar SQL direto no phpMyAdmin:

1. Acesse: http://localhost/phpmyadmin
2. Clique na aba **"SQL"**
3. Cole este comando:

```sql
CREATE DATABASE comanda_digital 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;
```

4. Clique em **"Executar"**

---

### 2️⃣ Executar Migrations do Prisma

Depois de criar o banco, execute no terminal:

```bash
cd C:\Projects\comanda-digital\backend
powershell -ExecutionPolicy Bypass -Command "npm run prisma:migrate"
```

Isso vai:
- ✅ Criar todas as tabelas
- ✅ Criar os índices
- ✅ Configurar relacionamentos
- ✅ Criar enums

---

### 3️⃣ Executar o Backend

```bash
cd C:\Projects\comanda-digital\backend
powershell -ExecutionPolicy Bypass -Command "npm run dev"
```

**Servidor rodando em:** http://localhost:3001

---

## 🔍 VERIFICAR SE XAMPP ESTÁ RODANDO

### MySQL deve estar ativo:

1. Abra o **XAMPP Control Panel**
2. Verifique se **MySQL** está com status **"Running"** (verde)
3. Se não estiver, clique em **"Start"** ao lado de MySQL

### Portas:
- **MySQL:** 3306
- **Apache:** 80 (para phpMyAdmin)

---

## 🧪 TESTAR CONEXÃO

Depois de criar o banco e executar as migrations, teste:

### 1. Health Check
```bash
curl http://localhost:3001/health
```

### 2. Criar Admin
```bash
curl -X POST http://localhost:3001/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"nome\":\"Admin\",\"email\":\"admin@example.com\",\"senha\":\"senha123\"}"
```

### 3. Login
```bash
curl -X POST http://localhost:3001/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@example.com\",\"senha\":\"senha123\"}"
```

---

## 📊 ESTRUTURA DO BANCO (Será Criada Automaticamente)

Após executar as migrations, você terá estas tabelas:

1. **estabelecimentos** - Dados dos estabelecimentos
2. **usuarios** - Usuários do sistema
3. **categorias** - Categorias de produtos
4. **produtos** - Produtos do cardápio
5. **comandas** - Comandas dos clientes
6. **pedidos** - Pedidos realizados
7. **pedido_itens** - Itens de cada pedido
8. **historico_status_pedido** - Auditoria de mudanças

---

## ⚙️ CONFIGURAÇÕES DO .ENV

O arquivo `.env` já foi criado com estas configurações:

```bash
# Database (MySQL - XAMPP)
DATABASE_URL="mysql://root@localhost:3306/comanda_digital"

# Server
NODE_ENV=development
PORT=3001

# JWT
JWT_SECRET=sua_chave_secreta_muito_forte_aqui_mude_em_producao
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Upload
UPLOAD_MAX_SIZE=5242880
UPLOAD_DIR=uploads
```

**⚠️ IMPORTANTE:** Altere o `JWT_SECRET` para uma chave forte e única!

Exemplo de chave forte:
```
JWT_SECRET=c0m4nd4_d1g1t4l_s3cr3t_k3y_2024_pr0duc4o
```

---

## 🐛 SOLUÇÃO DE PROBLEMAS

### Erro: "Can't connect to MySQL server"

**Solução:**
1. Abra XAMPP Control Panel
2. Clique em "Start" no MySQL
3. Aguarde ficar verde
4. Tente novamente

### Erro: "Access denied for user 'root'"

**Solução:**
Se o seu MySQL tem senha, altere a connection string:

```bash
DATABASE_URL="mysql://root:SUA_SENHA@localhost:3306/comanda_digital"
```

### Erro: "Unknown database 'comanda_digital'"

**Solução:**
Você ainda não criou o banco. Siga o passo 1️⃣ acima.

### Erro: "Port 3306 is already in use"

**Solução:**
Outra aplicação está usando a porta MySQL. 
1. Feche outros programas que usam MySQL
2. Ou altere a porta no XAMPP

---

## ✅ CHECKLIST

- [x] Prisma schema alterado para MySQL
- [x] .env criado com connection string
- [x] Prisma Client regenerado
- [ ] XAMPP MySQL iniciado
- [ ] Banco de dados criado no phpMyAdmin
- [ ] Migrations executadas
- [ ] Backend testado

---

## 🎉 PRONTO!

Agora é só:
1. ✅ Criar o banco no phpMyAdmin
2. ✅ Executar as migrations
3. ✅ Rodar o backend

**Tempo estimado:** 2-3 minutos

---

**Adaptado para MySQL em:** 29/12/2025 22:03  
**Status:** ✅ PRONTO PARA CRIAR O BANCO  
**Próximo passo:** Abrir phpMyAdmin e criar o banco
