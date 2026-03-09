# EXECUTAR COMO ADMINISTRADOR
# Clique com botão direito → "Executar como Administrador"

Write-Host "🔥 Liberando portas no Firewall do Windows..." -ForegroundColor Yellow
Write-Host ""

# Porta 3000 (Frontend)
try {
    New-NetFirewallRule -DisplayName "Next.js Frontend - Comanda Digital" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow -ErrorAction Stop
    Write-Host "✅ Porta 3000 (Frontend) liberada!" -ForegroundColor Green
}
catch {
    Write-Host "⚠️  Porta 3000 já existe ou erro: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Porta 3001 (Backend)
try {
    New-NetFirewallRule -DisplayName "Node.js Backend - Comanda Digital" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow -ErrorAction Stop
    Write-Host "✅ Porta 3001 (Backend) liberada!" -ForegroundColor Green
}
catch {
    Write-Host "⚠️  Porta 3001 já existe ou erro: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Firewall configurado!" -ForegroundColor Green
Write-Host ""
Write-Host "Agora você pode acessar do celular:" -ForegroundColor Cyan
Write-Host "http://192.168.100.4:3000" -ForegroundColor White
Write-Host ""
Pause
