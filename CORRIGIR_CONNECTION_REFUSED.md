# ⚡ CONFIGURAÇÃO RÁPIDA - ACESSO VIA CELULAR

## 🎯 PROBLEMA: Connection Refused

**Causa:** Frontend não está aceitando conexões externas

**Solução:** Reiniciar frontend com `-H 0.0.0.0`

---

## ✅ PASSO A PASSO (3 MINUTOS)

### 1️⃣ PARAR O FRONTEND ATUAL

No terminal onde o frontend está rodando:
- Pressione `Ctrl+C`

### 2️⃣ REINICIAR COM ACESSO EXTERNO

**Opção A - Script Automático (Recomendado):**
```powershell
cd C:\Projects\comanda-digital\frontend
.\start-rede.ps1
```

**Opção B - Comando Manual:**
```powershell
cd C:\Projects\comanda-digital\frontend
npm run dev -- -H 0.0.0.0
```

### 3️⃣ VERIFICAR SE FUNCIONOU

Você deve ver:
```
▲ Next.js 14.2.35
- Local:    http://localhost:3000
- Network:  http://192.168.100.4:3000
```

**Se aparecer "Network:", está funcionando!** ✅

---

## 🔥 LIBERAR FIREWALL (SE AINDA NÃO FEZ)

Execute como **Administrador**:
```powershell
cd C:\Projects\comanda-digital
.\liberar-firewall.ps1
```

Ou manualmente:
```powershell
New-NetFirewallRule -DisplayName "Next.js Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Node.js Backend" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
```

---

## 📱 TESTAR DO CELULAR

### 1. Conectar na Mesma WiFi
Celular e PC na mesma rede

### 2. Acessar URLs

**Página da Mesa (QR Code):**
```
http://192.168.100.4:3000/mesa
```

**Criar Comanda Direto:**
```
http://192.168.100.4:3000/comanda/nova?mesa=10
```

**Cardápio:**
```
http://192.168.100.4:3000/cardapio
```

---

## 🧪 TESTE DE CONEXÃO

### Do Celular (Navegador)

**1. Testar Backend:**
```
http://192.168.100.4:3001/health
```
Deve retornar JSON com status "ok"

**2. Testar Frontend:**
```
http://192.168.100.4:3000
```
Deve abrir a página inicial

---

## 🐛 SE AINDA NÃO FUNCIONAR

### Verificar Firewall
```powershell
# Listar regras do firewall
Get-NetFirewallRule | Where-Object {$_.DisplayName -like "*Next*" -or $_.DisplayName -like "*Node*"}
```

### Verificar se Frontend está escutando
```powershell
# Ver processos na porta 3000
netstat -ano | findstr :3000
```

### Testar Ping
Do celular, abra o terminal/app de ping:
```
ping 192.168.100.4
```
Deve responder!

---

## ✅ CHECKLIST

- [ ] Frontend parado (Ctrl+C)
- [ ] Frontend reiniciado com `-H 0.0.0.0`
- [ ] Aparece "Network: http://192.168.100.4:3000"
- [ ] Firewall liberado (portas 3000 e 3001)
- [ ] Celular na mesma WiFi
- [ ] Testado http://192.168.100.4:3000/mesa

---

## 🎯 COMANDOS FINAIS

### Terminal 1 - Backend
```bash
cd C:\Projects\comanda-digital\backend
npm run dev
```

### Terminal 2 - Frontend (COM -H 0.0.0.0)
```bash
cd C:\Projects\comanda-digital\frontend
npm run dev -- -H 0.0.0.0
```

---

## 🎉 RESULTADO ESPERADO

### No Terminal do Frontend:
```
▲ Next.js 14.2.35
- Local:    http://localhost:3000
- Network:  http://192.168.100.4:3000  ← DEVE APARECER!

✓ Ready in 2s
```

### No Celular:
```
http://192.168.100.4:3000/mesa
```
Deve abrir a página com QR Code! 📱

---

**Criado em:** 30/12/2025 21:19  
**IP:** 192.168.100.4  
**Comando chave:** `npm run dev -- -H 0.0.0.0`
