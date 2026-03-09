# 🧪 GUIA COMPLETO DE TESTES - COMANDA DIGITAL

**Data:** 09/01/2026  
**Versão:** 3.0.0  
**Status:** ✅ Servidores Rodando

---

## 🚀 SERVIDORES ATIVOS

✅ **Backend:** http://localhost:3001  
✅ **Frontend:** http://localhost:3000  
✅ **Login:** http://localhost:3000/auth/login

---

## 🔑 CREDENCIAIS DE ACESSO

### **Códigos de Acesso:**
- `ADMIN2026` → Administrador
- `GARCOM01` → Garçom
- `COZINHA01` → Cozinha
- `BAR01` → Bar

### **Login com Email (Admin):**
- Email: `admin@bardoze.com.br`
- Senha: `admin123`

---

## 📋 ROTEIRO DE TESTES COMPLETO

### **TESTE 1: LOGIN DO ADMIN** ✅

**Objetivo:** Testar autenticação e acesso ao dashboard

**Passos:**
1. Acesse: http://localhost:3000/auth/login
2. Digite: `ADMIN2026`
3. Clique em "Entrar"
4. **Resultado Esperado:** Redireciona para `/admin/dashboard`

**O que verificar:**
- ✅ Login bem-sucedido
- ✅ Dashboard carrega
- ✅ Estatísticas aparecem
- ✅ Módulos clicáveis

---

### **TESTE 2: GESTÃO DE MESAS** 🪑

**Objetivo:** Criar mesa e baixar QR Code

**Passos:**
1. No dashboard, clique em "Mesas"
2. Clique em "Nova Mesa"
3. Preencha:
   - Número: `16`
   - Capacidade: `4`
4. Clique em "Criar Mesa"
5. Clique em "Baixar" QR Code

**Resultado Esperado:**
- ✅ Mesa criada
- ✅ Aparece na lista
- ✅ QR Code baixado (mesa-16-qrcode.png)

---

### **TESTE 3: GESTÃO DE USUÁRIOS** 👥

**Objetivo:** Criar novo usuário com código de acesso

**Passos:**
1. Volte ao dashboard
2. Clique em "Usuários"
3. Clique em "Novo Usuário"
4. Preencha:
   - Nome: `Maria Silva`
   - Tipo: `Garçom`
   - Email: `maria@bardoze.com.br`
   - Telefone: `(11) 98888-8888`
   - Senha: `maria123`
5. Clique em "Criar Usuário"

**Resultado Esperado:**
- ✅ Usuário criado
- ✅ Código gerado (ex: GARCOM02)
- ✅ Toast mostra o código
- ✅ Aparece na lista

**Teste adicional:**
- Clique no toggle "Ativo/Inativo"
- ✅ Status muda

---

### **TESTE 4: GESTÃO DE PRODUTOS** 🍽️

**Objetivo:** Criar produto e marcar como destaque

**Passos:**
1. Volte ao dashboard
2. Clique em "Produtos"
3. Clique em "Novo Produto"
4. Preencha:
   - Código: `BEB010`
   - Nome: `Suco de Laranja Natural`
   - Descrição: `Suco fresco de laranja 500ml`
   - Preço: `15.00`
   - Promoção: `12.00`
   - ✅ Marque "Produto em destaque"
5. Clique em "Criar Produto"

**Resultado Esperado:**
- ✅ Produto criado
- ✅ Aparece no grid
- ✅ Badge "⭐ Destaque"
- ✅ Preço riscado + promocional

**Teste adicional:**
- Use filtros: Todos, Bar, Cozinha
- Toggle disponibilidade
- Toggle destaque

---

### **TESTE 5: RELATÓRIOS** 📊

**Objetivo:** Visualizar relatórios e estatísticas

**Passos:**
1. Volte ao dashboard
2. Clique em "Relatórios"
3. Teste os filtros:
   - Clique em "Hoje"
   - Clique em "Esta Semana"
   - Clique em "Este Mês"
4. Observe as mudanças nos valores

**Resultado Esperado:**
- ✅ Estatísticas mudam por período
- ✅ Gráficos de vendas por método
- ✅ Gráficos de vendas por hora
- ✅ Top 5 produtos
- ✅ Botão "Exportar" funciona

---

### **TESTE 6: LOGOUT E LOGIN GARÇOM** 🍽️

**Objetivo:** Testar acesso do garçom

**Passos:**
1. Faça logout (se houver botão) ou abra nova aba anônima
2. Acesse: http://localhost:3000/auth/login
3. Digite: `GARCOM01`
4. Clique em "Entrar"

**Resultado Esperado:**
- ✅ Redireciona para `/garcom`
- ✅ Vê painel do garçom
- ✅ Estatísticas aparecem
- ✅ Filtros funcionam

**Teste adicional:**
- Clique em "Todas"
- Clique em "Pagar Agora"
- Clique em "Pagar no Final"

---

### **TESTE 7: LOGIN COZINHA** 👨‍🍳

**Objetivo:** Testar Kanban da cozinha

**Passos:**
1. Nova aba ou logout
2. Login: `COZINHA01`
3. **Resultado:** Redireciona para `/cozinha`

**O que verificar:**
- ✅ 3 colunas (Novos, Em Preparo, Prontos)
- ✅ Estatísticas por coluna
- ✅ Botão "Atualizar"

---

### **TESTE 8: LOGIN BAR** 🍹

**Objetivo:** Testar Kanban do bar

**Passos:**
1. Nova aba ou logout
2. Login: `BAR01`
3. **Resultado:** Redireciona para `/bar`

**O que verificar:**
- ✅ Interface igual à cozinha
- ✅ Tema roxo/rosa
- ✅ 3 colunas funcionais

---

### **TESTE 9: FLUXO DO CLIENTE** 👤

**Objetivo:** Criar comanda com escolha de pagamento

**Passos:**
1. Acesse: http://localhost:3000/comanda/nova
2. Preencha:
   - Nome: `João Silva`
   - Telefone: `(11) 99999-9999`
3. Clique em "Continuar"
4. **Tela de Pagamento Aparece!**
5. Escolha: "💳 Pagar Agora" OU "📋 Pagar no Final"

**Resultado Esperado:**
- ✅ Step 1: Formulário de dados
- ✅ Step 2: Escolha de pagamento
- ✅ Botão "Voltar" funciona
- ✅ Comanda criada
- ✅ Toast de sucesso
- ✅ Redireciona para escanear mesa

---

### **TESTE 10: CAIXA** 💰

**Objetivo:** Fechar comanda

**Passos:**
1. Acesse: http://localhost:3000/caixa
2. Veja comandas pendentes
3. Clique em "Fechar Conta"
4. Modal abre com detalhes
5. Selecione método: Dinheiro, Cartão ou PIX
6. Clique em "Confirmar Pagamento"

**Resultado Esperado:**
- ✅ Modal abre
- ✅ Detalhes da comanda
- ✅ Lista de itens
- ✅ Total calculado
- ✅ Seleção de método
- ✅ Pagamento processado
- ✅ Comanda removida da lista

---

## 🎯 CHECKLIST DE VERIFICAÇÃO

### **Interface e Design:**
- [ ] Cores corretas por módulo
- [ ] Ícones aparecem
- [ ] Botões responsivos
- [ ] Modais abrem/fecham
- [ ] Toasts aparecem
- [ ] Loading states funcionam

### **Navegação:**
- [ ] Login redireciona corretamente
- [ ] Botões "Voltar" funcionam
- [ ] Links do dashboard funcionam
- [ ] Breadcrumbs corretos

### **Funcionalidades:**
- [ ] Criar mesa
- [ ] Baixar QR Code
- [ ] Criar usuário
- [ ] Gerar código de acesso
- [ ] Criar produto
- [ ] Toggle de status
- [ ] Filtros funcionam
- [ ] Relatórios mudam por período
- [ ] Escolha de pagamento
- [ ] Fechar comanda

### **Dados:**
- [ ] Estatísticas aparecem
- [ ] Listas carregam
- [ ] Formulários validam
- [ ] Dados persistem

---

## 🐛 POSSÍVEIS PROBLEMAS E SOLUÇÕES

### **Problema: Página em branco**
**Solução:** 
- Verifique console do navegador (F12)
- Recarregue a página (Ctrl+R)
- Limpe cache (Ctrl+Shift+R)

### **Problema: Erro 404**
**Solução:**
- Verifique se frontend está rodando
- URL correta: http://localhost:3000

### **Problema: Erro 500**
**Solução:**
- Verifique se backend está rodando
- Verifique console do backend
- MySQL está rodando?

### **Problema: Login não funciona**
**Solução:**
- Código correto? (ADMIN2026, GARCOM01, etc)
- Backend rodando?
- Verifique Network tab (F12)

### **Problema: Dados não aparecem**
**Solução:**
- Seed foi executado?
- MySQL está rodando?
- Verifique console do backend

---

## 📸 SCREENSHOTS ESPERADOS

### **1. Login**
- Campo de código
- Botão azul "Entrar"
- Mensagem de rodapé

### **2. Dashboard Admin**
- 4 cards de estatísticas
- 6 módulos clicáveis
- Top 3 produtos

### **3. Gestão de Mesas**
- Tabela de mesas
- Botão "Nova Mesa"
- Botão "Baixar" QR Code

### **4. Gestão de Usuários**
- Tabela de usuários
- Badges coloridos
- Códigos de acesso visíveis

### **5. Gestão de Produtos**
- Grid de cards
- Filtros (Todos, Bar, Cozinha)
- Produtos com preços

### **6. Relatórios**
- Filtros de período
- Gráficos de barras
- Top 5 produtos

### **7. Painel Garçom**
- Lista de comandas
- Filtros de pagamento
- Estatísticas

### **8. Kanban Cozinha**
- 3 colunas
- Cards de pedidos
- Botões de ação

### **9. Kanban Bar**
- 3 colunas (tema roxo)
- Cards de pedidos

### **10. Escolha de Pagamento**
- 2 cards grandes
- Pagar Agora (vermelho)
- Pagar no Final (azul)

---

## ✅ RESULTADO ESPERADO FINAL

Após todos os testes:
- ✅ Todos os módulos funcionam
- ✅ Todas as páginas carregam
- ✅ Todos os formulários validam
- ✅ Todos os dados aparecem
- ✅ Navegação fluida
- ✅ Design consistente
- ✅ **Sistema 100% funcional!**

---

**Boa sorte nos testes! 🚀**
