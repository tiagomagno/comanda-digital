# Teste da API - Criar Admin

$body = @{
    nome = "Admin"
    email = "admin@example.com"
    senha = "senha123"
} | ConvertTo-Json

try {
    Write-Host "Criando admin..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register" -Method Post -Body $body -ContentType "application/json"
    
    Write-Host "`nAdmin criado com sucesso!" -ForegroundColor Green
    Write-Host "Token: $($response.token.Substring(0, 50))..." -ForegroundColor Cyan
    Write-Host "Nome: $($response.usuario.nome)" -ForegroundColor Cyan
    Write-Host "Email: $($response.usuario.email)" -ForegroundColor Cyan
    Write-Host "Tipo: $($response.usuario.tipo)" -ForegroundColor Cyan
    
    # Salvar token para uso posterior
    $response.token | Out-File -FilePath "token.txt"
    Write-Host "`nToken salvo em token.txt" -ForegroundColor Green
    
} catch {
    Write-Host "`nErro ao criar admin:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
