# 🧪 GUIA DE TESTES - APENAS NO PC

## ✅ CONFIGURAÇÃO ATUAL

- ✅ Backend rodando: http://localhost:3001
- ✅ Frontend rodando: http://localhost:3000
- ✅ Banco de dados populado (Bar do Zé)
- ✅ 17 produtos cadastrados

---

## 🎯 FLUXO DE TESTE COMPLETO

### 1️⃣ PÁGINA DA MESA (QR Code)
**URL:** http://localhost:3000/mesa

**O que testar:**
- ✅ Vê QR Code da Mesa 10
- ✅ Vê nome do estabelecimento (Bar do Zé)
- ✅ Vê instruções de uso
- ✅ Clica no botão "Abrir Cardápio"

**Resultado esperado:**
- Redireciona para `/comanda/nova?mesa=10`

---

### 2️⃣ CRIAR COMANDA
**URL:** http://localhost:3000/comanda/nova?mesa=10

**O que testar:**
- ✅ Formulário com 2 campos (Nome e Telefone)
- ✅ Preencher nome: "Teste Cliente"
- ✅ Preencher telefone: "(11) 99999-9999"
- ✅ Clicar "Continuar"

**Resultado esperado:**
- ✅ Comanda criada com código único (ex: ABC123)
- ✅ Redireciona DIRETO para o cardápio
- ✅ Sem erros!

---

### 3️⃣ CARDÁPIO
**URL:** http://localhost:3000/cardapio?comanda=ABC123

**O que testar:**
- ✅ Vê 4 categorias (Bebidas, Porções, Pratos, Sobremesas)
- ✅ Vê 17 produtos no total
- ✅ Busca funciona (digite "cerveja")
- ✅ Clica em um produto (ex: Cerveja Heineken)

**Resultado esperado:**
- ✅ Modal abre com detalhes do produto
- ✅ Vê preço promocional: ~~R$ 12,00~~ **R$ 10,00**
- ✅ Pode adicionar observações
- ✅ Pode alterar quantidade (+/-)

---

### 4️⃣ ADICIONAR AO CARRINHO
**No modal do produto:**

**O que testar:**
- ✅ Adicionar observação: "Bem gelada"
- ✅ Alterar quantidade para 2
- ✅ Clicar "Adicionar R$ 20,00"

**Resultado esperado:**
- ✅ Modal fecha
- ✅ Bottom bar aparece na parte inferior
- ✅ Mostra "1 item" e "R$ 20,00"
- ✅ Badge no carrinho mostra "1"

---

### 5️⃣ CARRINHO
**Clicar em "Ver carrinho" no bottom bar**

**URL:** http://localhost:3000/carrinho?comanda=ABC123

**O que testar:**
- ✅ Vê lista de itens
- ✅ Vê observação "Bem gelada"
- ✅ Pode alterar quantidade (+/-)
- ✅ Pode remover item (ícone lixeira)
- ✅ Vê resumo com taxa de serviço (10%)
- ✅ Vê total calculado

**Resultado esperado:**
- ✅ Subtotal: R$ 20,00
- ✅ Taxa: R$ 2,00
- ✅ Total: R$ 22,00

---

### 6️⃣ FINALIZAR PEDIDO
**Clicar em "Finalizar Pedido R$ 22,00"**

**O que testar:**
- ✅ Loading aparece
- ✅ Pedido é criado
- ✅ Redireciona para acompanhamento

**Resultado esperado:**
- ✅ Vai para `/pedido/[id]?comanda=ABC123`

---

### 7️⃣ ACOMPANHAMENTO
**URL:** http://localhost:3000/pedido/[id]?comanda=ABC123

**O que testar:**
- ✅ Vê status atual (Pedido Criado)
- ✅ Vê timeline visual
- ✅ Vê lista de itens do pedido
- ✅ Vê total do pedido
- ✅ Página atualiza automaticamente (5s)

**Resultado esperado:**
- ✅ Status: "Pedido Criado"
- ✅ Timeline com 3 etapas
- ✅ Itens: 2x Cerveja Heineken
- ✅ Total: R$ 22,00

---

## 🔄 TESTE RÁPIDO (5 MINUTOS)

### Sequência Completa
```
1. http://localhost:3000/mesa
   ↓ Clicar "Abrir Cardápio"
   
2. Preencher nome e telefone
   ↓ Clicar "Continuar"
   
3. Clicar em "Cerveja Heineken"
   ↓ Adicionar 2 unidades
   ↓ Observação: "Bem gelada"
   ↓ Clicar "Adicionar"
   
4. Clicar "Ver carrinho"
   ↓ Verificar itens
   ↓ Clicar "Finalizar Pedido"
   
5. Ver acompanhamento
   ✅ SUCESSO!
```

---

## 📊 CHECKLIST DE FUNCIONALIDADES

### Página da Mesa
- [ ] QR Code aparece
- [ ] Botão "Abrir Cardápio" funciona
- [ ] Redireciona corretamente

### Criar Comanda
- [ ] Formulário aparece
- [ ] Validação funciona
- [ ] Comanda é criada
- [ ] Redireciona para cardápio

### Cardápio
- [ ] 4 categorias aparecem
- [ ] 17 produtos aparecem
- [ ] Busca funciona
- [ ] Modal abre ao clicar
- [ ] Preço promocional aparece

### Modal de Produto
- [ ] Imagem/placeholder aparece
- [ ] Nome e descrição corretos
- [ ] Preço correto
- [ ] Campo de observações funciona
- [ ] Quantidade +/- funciona
- [ ] Botão adicionar funciona

### Carrinho
- [ ] Itens aparecem
- [ ] Observações aparecem
- [ ] Quantidade editável
- [ ] Remover funciona
- [ ] Resumo correto
- [ ] Taxa calculada (10%)
- [ ] Total correto

### Finalizar Pedido
- [ ] Loading aparece
- [ ] Pedido criado
- [ ] Redireciona

### Acompanhamento
- [ ] Status aparece
- [ ] Timeline visual
- [ ] Itens listados
- [ ] Total correto
- [ ] Atualização automática

---

## 🐛 SE ALGO NÃO FUNCIONAR

### Erro ao criar comanda
**Verificar:**
- Backend está rodando?
- Console do navegador (F12) mostra erro?
- Logs do backend mostram erro?

### Cardápio vazio
**Verificar:**
- Seed foi executado? (`npm run prisma:seed`)
- Backend retorna produtos? (http://localhost:3001/api/cardapio?estabelecimentoId=estab-seed-001)

### Erro ao finalizar pedido
**Verificar:**
- Carrinho tem itens?
- Backend está rodando?
- Console mostra erro?

---

## 🎯 RESULTADO ESPERADO

Ao final do teste, você deve ter:
- ✅ 1 comanda criada
- ✅ 1 pedido finalizado
- ✅ Dados salvos no banco
- ✅ Experiência completa testada

---

## 📸 PONTOS DE ATENÇÃO

### Design
- ✅ Responsivo (redimensione a janela)
- ✅ Cores corretas por módulo
- ✅ Ícones aparecem
- ✅ Loading states funcionam

### Performance
- ✅ Páginas carregam rápido
- ✅ Transições suaves
- ✅ Sem travamentos

### UX
- ✅ Fluxo intuitivo
- ✅ Mensagens claras
- ✅ Feedback visual

---

## 🎉 SUCESSO!

Se todos os itens acima funcionarem, o sistema está **100% operacional** para testes locais!

**Próximo passo:** Melhorias e ajustes finos

---

**Criado em:** 30/12/2025 21:28  
**Modo:** Testes apenas no PC  
**Tempo estimado:** 5-10 minutos  
**Status:** ✅ PRONTO PARA TESTAR
