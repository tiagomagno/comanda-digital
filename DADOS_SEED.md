# 🎉 BANCO POPULADO COM SUCESSO!

## ✅ DADOS CRIADOS

### 🏪 Estabelecimento
- **Nome:** Bar do Zé
- **ID:** `estab-seed-001`
- **CNPJ:** 12.345.678/0001-90
- **Telefone:** (11) 98765-4321
- **Email:** contato@bardoze.com.br
- **Endereço:** Rua das Flores, 123 - São Paulo/SP

### 👤 Usuário Admin
- **Email:** admin@bardoze.com.br
- **Senha:** admin123
- **Tipo:** admin

### 📂 Categorias (4)
1. **Bebidas** (BAR) - Roxo
2. **Porções** (COZINHA) - Laranja
3. **Pratos Principais** (COZINHA) - Vermelho
4. **Sobremesas** (COZINHA) - Rosa

### 🍽️ Produtos (17)

#### Bebidas (5)
1. Cerveja Heineken Long Neck - R$ 12,00 (Promoção: R$ 10,00) ⭐
2. Cerveja Brahma Duplo Malte - R$ 8,00
3. Coca-Cola Lata - R$ 6,00
4. Suco de Laranja Natural - R$ 10,00
5. Água Mineral - R$ 4,00

#### Porções (5)
1. Porção de Batata Frita - R$ 25,00 (Promoção: R$ 20,00) ⭐
2. Porção de Frango à Passarinho - R$ 35,00
3. Porção de Calabresa Acebolada - R$ 30,00
4. Porção de Mandioca Frita - R$ 22,00
5. Tábua de Frios - R$ 45,00

#### Pratos Principais (4)
1. Filé Mignon com Fritas - R$ 55,00 ⭐
2. Picanha na Chapa - R$ 65,00
3. Feijoada Completa - R$ 45,00
4. Parmegiana de Frango - R$ 40,00

#### Sobremesas (3)
1. Pudim de Leite - R$ 12,00
2. Petit Gateau - R$ 18,00 (Promoção: R$ 15,00) ⭐
3. Sorvete (2 bolas) - R$ 10,00

---

## 🧪 COMO TESTAR AGORA

### 1. Login como Admin
```bash
POST http://localhost:3001/api/auth/login
Body: {
  "email": "admin@bardoze.com.br",
  "senha": "admin123"
}
```

### 2. Ver Cardápio
```bash
GET http://localhost:3001/api/cardapio?estabelecimentoId=estab-seed-001
```

### 3. Criar Comanda (Cliente)
```bash
POST http://localhost:3001/api/comandas
Body: {
  "estabelecimentoId": "estab-seed-001",
  "nomeCliente": "João Silva",
  "telefoneCliente": "(11) 99999-9999"
}
```

---

## 🌐 TESTAR NO FRONTEND

### 1. Criar Comanda
```
http://localhost:3000/comanda/nova
```
- Nome: João Silva
- Telefone: (11) 99999-9999

### 2. Escanear Mesa
- Digite: Mesa 10

### 3. Ver Cardápio
```
http://localhost:3000/cardapio?comanda=ABC123
```
Agora você verá:
- ✅ 4 categorias
- ✅ 17 produtos
- ✅ Preços e promoções
- ✅ Produtos em destaque

### 4. Fazer Pedido
- Clique em um produto
- Adicione observações
- Selecione quantidade
- Adicione ao carrinho
- Finalize o pedido

### 5. Acompanhar Pedido
- Veja o status em tempo real
- Timeline visual
- Atualização automática

---

## 🔑 CREDENCIAIS IMPORTANTES

### Admin
- **Email:** admin@bardoze.com.br
- **Senha:** admin123

### Estabelecimento ID
- **ID:** estab-seed-001

**Use este ID nas requisições da API!**

---

## 📊 VERIFICAR NO BANCO

### Via phpMyAdmin
```
http://localhost/phpmyadmin
```

Veja as tabelas:
- `estabelecimentos` (1 registro)
- `usuarios` (1 admin)
- `categorias` (4 registros)
- `produtos` (17 registros)

### Via Prisma Studio
```bash
cd C:\Projects\comanda-digital\backend
npm run prisma:studio
```
Abre em: http://localhost:5555

---

## 🔄 EXECUTAR SEED NOVAMENTE

Se quiser limpar e recriar os dados:

```bash
cd C:\Projects\comanda-digital\backend

# Resetar banco
powershell -ExecutionPolicy Bypass -Command "npm run prisma:migrate reset"

# Executar seed
powershell -ExecutionPolicy Bypass -Command "npm run prisma:seed"
```

**⚠️ ATENÇÃO:** Isso vai apagar TODOS os dados!

---

## 🎯 FLUXO COMPLETO DE TESTE

### 1. Backend
```bash
# Já está rodando em http://localhost:3001
```

### 2. Frontend
```bash
# Já está rodando em http://localhost:3000
```

### 3. Teste o Fluxo
```
1. Acesse: http://localhost:3000/comanda/nova
2. Crie uma comanda
3. Digite mesa: 10
4. Veja o cardápio com 17 produtos
5. Adicione produtos ao carrinho
6. Finalize o pedido
7. Acompanhe o status
```

---

## 🍺 PRODUTOS EM DESTAQUE

Os seguintes produtos têm a flag `destaque: true`:
- ⭐ Cerveja Heineken (com promoção)
- ⭐ Porção de Batata Frita (com promoção)
- ⭐ Filé Mignon com Fritas
- ⭐ Petit Gateau (com promoção)

---

## 💰 PRODUTOS EM PROMOÇÃO

Produtos com preço promocional:
- Cerveja Heineken: ~~R$ 12,00~~ **R$ 10,00**
- Batata Frita: ~~R$ 25,00~~ **R$ 20,00**
- Petit Gateau: ~~R$ 18,00~~ **R$ 15,00**

---

## 🎉 PRONTO PARA TESTAR!

**Agora você tem:**
- ✅ Estabelecimento completo
- ✅ Admin configurado
- ✅ 4 categorias
- ✅ 17 produtos variados
- ✅ Preços e promoções
- ✅ Produtos em destaque
- ✅ Separação BAR/COZINHA

**Teste todas as funcionalidades!** 🚀

---

**Seed executado em:** 29/12/2025 23:02  
**Status:** ✅ BANCO POPULADO  
**Pronto para:** TESTES COMPLETOS!
