# Script PowerShell para usar Claude CLI - VERSÃO UTF-8 CORRIGIDA
# Salve isso como: claude-cli.ps1

param(
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$arguments
)

# Usa ANTHROPIC_API_KEY do .env ou variável de ambiente (nunca commitar a chave)
$apiKey = $env:ANTHROPIC_API_KEY
if (-not $apiKey) {
    Write-Host "❌ Defina ANTHROPIC_API_KEY no .env ou nas variáveis de ambiente" -ForegroundColor Red
    exit 1
}

# Pega os argumentos passados
$userMessage = $arguments -join " "

# Se não passar nada, show erro
if (-not $userMessage) {
    Write-Host "❌ Erro: você precisa passar uma mensagem" -ForegroundColor Red
    Write-Host "Uso: claude 'sua pergunta aqui'" -ForegroundColor Yellow
    exit 1
}

Write-Host "🔄 Aguardando resposta do Claude..." -ForegroundColor Cyan
Write-Host "Mensagem: $userMessage`n" -ForegroundColor Gray

try {
    # Escapar caracteres especiais corretamente
    $escapedMessage = $userMessage -replace '\\', '\\' -replace '"', '\"' -replace "`n", '\n' -replace "`r", '\r' -replace "`t", '\t'
    
    # Criar o JSON de forma segura
    $jsonBody = @{
        model = "claude-opus-4-5-20251101"
        max_tokens = 2000
        messages = @(
            @{
                role = "user"
                content = $escapedMessage
            }
        )
    } | ConvertTo-Json -Depth 10
    
    # Converter para bytes UTF-8 sem BOM
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    $bodyBytes = $utf8NoBom.GetBytes($jsonBody)
    
    # Headers corretos
    $headers = @{
        "Content-Type" = "application/json; charset=utf-8"
        "x-api-key" = $apiKey
        "anthropic-version" = "2023-06-01"
    }
    
    $response = Invoke-RestMethod -Uri "https://api.anthropic.com/v1/messages" `
        -Method Post `
        -Headers $headers `
        -Body $bodyBytes `
        -ContentType "application/json"
    
    # Extrai a resposta
    if ($response.content -and $response.content.Count -gt 0) {
        $resposta = $response.content[0].text
        Write-Host "`n✅ RESPOSTA DO CLAUDE:`n" -ForegroundColor Green
        Write-Host $resposta -ForegroundColor White
    } else {
        Write-Host "❌ Nenhuma resposta recebida" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Erro na API:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    # Tentar extrair mais detalhes do erro
    try {
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $reader.BaseStream.Position = 0
            $reader.DiscardBufferedData()
            $responseBody = $reader.ReadToEnd()
            Write-Host "`nDetalhes: $responseBody" -ForegroundColor Yellow
        }
    } catch {
        # Ignorar erros ao ler detalhes
    }
    
    exit 1
}