# 🔍 GUIA DE DEBUG - LOADING INFINITO

## ✅ Servidores Rodando

- ✅ **Backend:** http://localhost:3001 (rodando)
- ✅ **Frontend:** http://localhost:3000 (reiniciado)

---

## 🧪 TESTE PASSO A PASSO

### 1. Abrir Console do Navegador
1. Pressione `F12` ou `Ctrl+Shift+I`
2. Clique na aba **"Console"**
3. Limpe o console (ícone 🚫 ou Ctrl+L)

### 2. Acessar a Página
```
http://localhost:3000/comanda/nova
```

### 3. Preencher Formulário
- **Nome:** Tiago
- **Telefone:** 92981168163

### 4. Clicar "Continuar"

### 5. Observar Console
Você deve ver os seguintes logs **NA ORDEM**:

```
1. Iniciando criação de comanda... {nomeCliente: "Tiago", telefoneCliente: "92981168163"}
2. Fazendo requisição para: http://localhost:3001/api/comandas
3. Resposta recebida: 201 Created
4. Dados da resposta: {id: "...", codigo: "...", ...}
5. Comanda criada com sucesso! {...}
6. Redirecionando para: /comanda/XXXXXX/mesa
7. Finalizando...
```

---

## 🐛 POSSÍVEIS PROBLEMAS

### Se parar no passo 1 ou 2:
**Problema:** Requisição não está sendo enviada
**Solução:** 
- Verificar se o botão está desabilitado
- Verificar se há erro de JavaScript no console

### Se parar no passo 2 (sem passo 3):
**Problema:** Requisição travada (CORS ou timeout)
**Solução:**
- Verificar se backend está rodando
- Verificar aba "Network" do DevTools
- Ver se a requisição aparece como "pending"

### Se aparecer erro CORS:
```
Access to fetch at 'http://localhost:3001/api/comandas' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```
**Solução:** Backend precisa reiniciar

### Se aparecer erro 500:
**Problema:** Erro no backend
**Solução:** Ver logs do backend

---

## 🔧 VERIFICAÇÕES ADICIONAIS

### Aba Network (DevTools)
1. Vá na aba **"Network"** (Rede)
2. Clique em "Continuar"
3. Procure por `comandas` na lista
4. Clique nele
5. Veja:
   - **Status:** Deve ser 201
   - **Response:** Deve ter os dados da comanda
   - **Headers:** Deve ter CORS permitido

### Backend Logs
Veja o terminal do backend. Deve mostrar:
```
prisma:query BEGIN
prisma:query INSERT INTO `crm-comanda`.`comandas` ...
prisma:query COMMIT
```

---

## 🎯 TESTE ALTERNATIVO (DIRETO NO CONSOLE)

Se o formulário não funcionar, teste direto no console do navegador:

```javascript
fetch('http://localhost:3001/api/comandas', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    nomeCliente: 'Teste',
    telefoneCliente: '11999999999',
    estabelecimentoId: 'estab-seed-001'
  })
})
.then(r => r.json())
.then(d => console.log('Sucesso:', d))
.catch(e => console.error('Erro:', e))
```

**Resultado esperado:**
```javascript
Sucesso: {
  id: "...",
  codigo: "ABC123",
  nomeCliente: "Teste",
  ...
}
```

---

## 📸 O QUE ENVIAR

Se ainda não funcionar, me envie:

1. **Screenshot do Console** (aba Console)
2. **Screenshot do Network** (aba Network, mostrando a requisição)
3. **Último log que apareceu** (qual foi o último console.log?)

---

## 🚀 SOLUÇÃO RÁPIDA

Se nada funcionar, tente:

```bash
# Parar tudo (Ctrl+C nos terminais)

# Reiniciar backend
cd C:\Projects\comanda-digital\backend
npm run dev

# Reiniciar frontend (em outro terminal)
cd C:\Projects\comanda-digital\frontend
npm run dev

# Limpar cache do navegador
Ctrl+Shift+Delete → Limpar cache
```

---

**Última atualização:** 30/12/2025 20:56  
**Status:** Frontend reiniciado com logs de debug  
**Próximo passo:** Testar e enviar logs do console
