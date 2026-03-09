# Teste de endpoints do admin

Write-Host "Testando endpoints..." -ForegroundColor Yellow

# Teste 1: Produtos
Write-Host "`n1. Testando GET /api/produtos" -ForegroundColor Cyan
try {
    $produtos = Invoke-RestMethod -Uri "http://localhost:3001/api/produtos?estabelecimentoId=estab-seed-001" -Method Get
    Write-Host "   Sucesso! Total de produtos: $($produtos.Count)" -ForegroundColor Green
}
catch {
    Write-Host "   Erro: $($_.Exception.Message)" -ForegroundColor Red
}

# Teste 2: Categorias
Write-Host "`n2. Testando GET /api/categorias" -ForegroundColor Cyan
try {
    $categorias = Invoke-RestMethod -Uri "http://localhost:3001/api/categorias?estabelecimentoId=estab-seed-001" -Method Get
    Write-Host "   Sucesso! Total de categorias: $($categorias.Count)" -ForegroundColor Green
}
catch {
    Write-Host "   Erro: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTeste concluído!" -ForegroundColor Yellow
