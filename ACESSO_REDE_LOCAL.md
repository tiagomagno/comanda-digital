# 📱 CONFIGURAÇÃO PARA ACESSO VIA CELULAR (REDE LOCAL)

## 🌐 SEU IP LOCAL
**IP do PC:** `192.168.100.4`

---

## ⚙️ PASSO 1: CONFIGURAR BACKEND

### 1.1 Editar arquivo `.env`
Abra: `C:\Projects\comanda-digital\backend\.env`

Altere a linha do CORS:
```env
# Antes
CORS_ORIGIN=http://localhost:3000

# Depois
CORS_ORIGIN=*
```

Ou se quiser mais seguro:
```env
CORS_ORIGIN=http://192.168.100.4:3000,http://localhost:3000
```

### 1.2 Reiniciar Backend
```bash
# Parar o servidor (Ctrl+C)
# Iniciar novamente
cd C:\Projects\comanda-digital\backend
npm run dev
```

O backend vai rodar em:
- **PC:** http://localhost:3001
- **Celular:** http://192.168.100.4:3001

---

## ⚙️ PASSO 2: CONFIGURAR FRONTEND

### 2.1 Criar arquivo de configuração
Crie: `C:\Projects\comanda-digital\frontend\.env.local`

Conteúdo:
```env
NEXT_PUBLIC_API_URL=http://192.168.100.4:3001
```

### 2.2 Atualizar chamadas da API
Edite: `frontend/app/comanda/nova/page.tsx`

Altere:
```typescript
// Antes
const response = await fetch('http://localhost:3001/api/comandas', {

// Depois
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/comandas`, {
```

### 2.3 Reiniciar Frontend
```bash
# Parar o servidor (Ctrl+C)
# Iniciar novamente
cd C:\Projects\comanda-digital\frontend
npm run dev -- -H 0.0.0.0
```

O frontend vai rodar em:
- **PC:** http://localhost:3000
- **Celular:** http://192.168.100.4:3000

---

## 🔥 PASSO 3: LIBERAR FIREWALL DO WINDOWS

### Opção 1: Via Interface Gráfica
1. Abra o **Firewall do Windows**
2. Clique em **"Configurações avançadas"**
3. Clique em **"Regras de Entrada"**
4. Clique em **"Nova Regra..."**
5. Selecione **"Porta"** → Avançar
6. Selecione **"TCP"** e digite: `3000, 3001`
7. Selecione **"Permitir a conexão"**
8. Marque todas as redes
9. Nome: `Node.js Comanda Digital`
10. Finalizar

### Opção 2: Via PowerShell (Mais Rápido)
Execute como Administrador:
```powershell
# Liberar porta 3000 (Frontend)
New-NetFirewallRule -DisplayName "Next.js Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow

# Liberar porta 3001 (Backend)
New-NetFirewallRule -DisplayName "Node.js Backend" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
```

---

## 📱 PASSO 4: ACESSAR DO CELULAR

### 4.1 Conectar na Mesma WiFi
Certifique-se que o celular está na mesma rede WiFi do PC.

### 4.2 Acessar URLs

**Frontend (Interface):**
```
http://192.168.100.4:3000
```

**Backend (API - para testar):**
```
http://192.168.100.4:3001/health
```

### 4.3 Criar Comanda
1. Acesse: `http://192.168.100.4:3000/comanda/nova`
2. Preencha nome e telefone
3. Clique "Continuar"
4. Deve funcionar! 🎉

---

## 🧪 TESTAR CONEXÃO

### Do PC (Terminal)
```bash
# Testar se o backend responde
curl http://192.168.100.4:3001/health

# Testar se o frontend responde
curl http://192.168.100.4:3000
```

### Do Celular (Navegador)
```
http://192.168.100.4:3001/health
```

Deve retornar:
```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": 123
}
```

---

## 🐛 TROUBLESHOOTING

### Erro: "Não foi possível acessar o site"
**Causa:** Firewall bloqueando
**Solução:** Execute os comandos do PowerShell como Admin

### Erro: "CORS policy"
**Causa:** CORS não configurado
**Solução:** Altere `CORS_ORIGIN=*` no `.env` do backend

### Erro: "Connection refused"
**Causa:** Servidor não está escutando em 0.0.0.0
**Solução:** 
- Backend: Já escuta em 0.0.0.0 por padrão
- Frontend: Use `npm run dev -- -H 0.0.0.0`

### Celular não conecta
**Verificar:**
1. PC e celular na mesma WiFi?
2. IP correto? (192.168.100.4)
3. Firewall liberado?
4. Servidores rodando?

---

## 📋 CHECKLIST RÁPIDO

- [ ] Editar `.env` do backend (CORS_ORIGIN=*)
- [ ] Criar `.env.local` do frontend
- [ ] Atualizar URLs no código
- [ ] Liberar portas no firewall
- [ ] Reiniciar backend
- [ ] Reiniciar frontend com `-H 0.0.0.0`
- [ ] Testar do celular

---

## 🎯 COMANDOS FINAIS

```bash
# Terminal 1 - Backend
cd C:\Projects\comanda-digital\backend
npm run dev

# Terminal 2 - Frontend
cd C:\Projects\comanda-digital\frontend
npm run dev -- -H 0.0.0.0
```

**Acesse do celular:**
```
http://192.168.100.4:3000/comanda/nova
```

---

## 🎉 PRONTO!

Agora você pode testar o sistema completo no celular, simulando o uso real de um cliente no restaurante!

**Vantagens:**
- ✅ Teste real em dispositivo móvel
- ✅ Experiência de usuário real
- ✅ Teste de responsividade
- ✅ Teste de performance
- ✅ Teste de UX/UI

---

**Criado em:** 30/12/2025 21:07  
**IP Local:** 192.168.100.4  
**Portas:** 3000 (Frontend), 3001 (Backend)
