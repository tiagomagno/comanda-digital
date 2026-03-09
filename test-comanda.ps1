# Teste de criação de comanda

$body = @{
    nomeCliente       = "Tiago"
    telefoneCliente   = "92981168163"
    estabelecimentoId = "estab-seed-001"
} | ConvertTo-Json

Write-Host "Testando criação de comanda..." -ForegroundColor Yellow
Write-Host "Body: $body" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/comandas" -Method Post -Body $body -ContentType "application/json"
    
    Write-Host "`nSucesso!" -ForegroundColor Green
    Write-Host "Comanda criada:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 5
    
}
catch {
    Write-Host "`nErro ao criar comanda!" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Mensagem: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        Write-Host "Detalhes:" -ForegroundColor Red
        $_.ErrorDetails.Message
    }
}
