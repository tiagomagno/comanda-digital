# 🚀 CONFIGURAÇÃO RÁPIDA - ACESSO VIA CELULAR

## SEU IP: 192.168.100.4

---

## ✅ PASSO A PASSO (5 MINUTOS)

### 1️⃣ LIBERAR FIREWALL (OBRIGATÓRIO)

**Clique com botão direito no arquivo abaixo e selecione "Executar como Administrador":**
```
C:\Projects\comanda-digital\liberar-firewall.ps1
```

Ou execute manualmente no PowerShell (como Admin):
```powershell
New-NetFirewallRule -DisplayName "Next.js Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Node.js Backend" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
```

---

### 2️⃣ CRIAR ARQUIVO `.env.local` NO FRONTEND

**Crie o arquivo:**
```
C:\Projects\comanda-digital\frontend\.env.local
```

**Com o conteúdo:**
```
NEXT_PUBLIC_API_URL=http://192.168.100.4:3001
```

---

### 3️⃣ EDITAR `.env` NO BACKEND

**Abra:**
```
C:\Projects\comanda-digital\backend\.env
```

**Altere a linha do CORS:**
```env
CORS_ORIGIN=*
```

---

### 4️⃣ REINICIAR SERVIDORES

**Terminal 1 - Backend:**
```bash
cd C:\Projects\comanda-digital\backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd C:\Projects\comanda-digital\frontend
npm run dev -- -H 0.0.0.0
```

---

### 5️⃣ ACESSAR DO CELULAR

**Conecte o celular na mesma WiFi do PC**

**Abra no navegador do celular:**
```
http://192.168.100.4:3000/comanda/nova
```

---

## 🧪 TESTAR

### Do PC:
```
http://localhost:3000/comanda/nova
```

### Do Celular:
```
http://192.168.100.4:3000/comanda/nova
```

Ambos devem funcionar!

---

## ⚠️ SE NÃO FUNCIONAR

1. **Firewall bloqueando?**
   - Execute o script `liberar-firewall.ps1` como Admin

2. **Celular não conecta?**
   - Verifique se está na mesma WiFi
   - Ping do celular para o PC: `192.168.100.4`

3. **CORS error?**
   - Verifique se `.env` tem `CORS_ORIGIN=*`

---

## 📱 RESULTADO ESPERADO

No celular você verá:
- ✅ Página de criar comanda
- ✅ Formulário funcionando
- ✅ Design responsivo
- ✅ Experiência mobile real

---

**Pronto! Agora teste no celular! 🎉**
