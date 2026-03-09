# Script para iniciar frontend com acesso via rede local

Write-Host "🚀 Iniciando Frontend Next.js..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Configuração:" -ForegroundColor Cyan
Write-Host "- Porta: 3000" -ForegroundColor White
Write-Host "- Host: 0.0.0.0 (aceita conexões externas)" -ForegroundColor White
Write-Host "- IP Local: 192.168.100.4" -ForegroundColor White
Write-Host ""
Write-Host "Acesse de:" -ForegroundColor Cyan
Write-Host "- PC: http://localhost:3000" -ForegroundColor Green
Write-Host "- Celular: http://192.168.100.4:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Pressione Ctrl+C para parar" -ForegroundColor Yellow
Write-Host "==========================================`n" -ForegroundColor Yellow

# Iniciar Next.js com host 0.0.0.0
npm run dev -- -H 0.0.0.0
