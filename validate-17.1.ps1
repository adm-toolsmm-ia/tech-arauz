# PowerShell Validation Script - Story 17.1
# Uso: .\validate-17.1.ps1 -Token "seu-jwt-token"

param(
    [Parameter(Mandatory=$true)]
    [string]$Token
)

# Cores
$Green = 'Green'
$Red = 'Red'
$Yellow = 'Yellow'
$Blue = 'Cyan'

# URL
$VercelUrl = "https://tech-arauz.vercel.app"

# Headers
$Headers = @{
    'Authorization' = "Bearer $Token"
    'Content-Type' = 'application/json'
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor $Blue
Write-Host "║  VALIDAÇÃO AUTOMÁTICA - EPIC 17.1                     ║" -ForegroundColor $Blue
Write-Host "║  Story 17.1: Graph Data API + Schema                  ║" -ForegroundColor $Blue
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor $Blue
Write-Host ""
Write-Host "URL testada: $VercelUrl" -ForegroundColor $Yellow
Write-Host ""

$Passed = 0
$Failed = 0

# Função para testar endpoint
function Test-Endpoint {
    param(
        [int]$Step,
        [string]$Name,
        [string]$Url,
        [string]$Method = 'GET'
    )

    Write-Host "[Passo $Step] $Name" -ForegroundColor $Blue
    Write-Host "  URL: $Url"

    try {
        if ($Method -eq 'POST') {
            $Response = Invoke-WebRequest -Uri $Url -Headers $Headers -Method POST -ErrorAction Stop
        } else {
            $Response = Invoke-WebRequest -Uri $Url -Headers $Headers -ErrorAction Stop
        }

        $JsonContent = $Response.Content | ConvertFrom-Json

        if ($JsonContent.error) {
            Write-Host "  ❌ Erro na resposta: $($JsonContent.error)" -ForegroundColor $Red
            return $false
        } else {
            Write-Host "  ✅ Resposta válida (JSON)" -ForegroundColor $Green
            Write-Host "  ✅ PASSOU" -ForegroundColor $Green

            # Mostrar informações específicas
            if ($JsonContent.nodes) {
                $NodeCount = @($JsonContent.nodes).Count
                Write-Host "  📊 Nós encontrados: $NodeCount"
            }

            if ($JsonContent.documents) {
                $DocCount = @($JsonContent.documents).Count
                Write-Host "  📄 Documentos encontrados: $DocCount"
            }

            if ($JsonContent.success) {
                Write-Host "  🎯 Success: $($JsonContent.success)"
            }

            return $true
        }
    } catch {
        Write-Host "  ❌ Erro: $($_.Exception.Message)" -ForegroundColor $Red
        return $false
    }

    Write-Host ""
}

# ============================================================
# TESTES
# ============================================================

Write-Host "Executando testes..." -ForegroundColor $Yellow
Write-Host ""

# Passo 1: API de Grafo
if (Test-Endpoint 1 "API de Grafo" "$VercelUrl/api/knowledge/graph") {
    $Passed++
} else {
    $Failed++
}
Write-Host ""

# Passo 2: API de Documentos
if (Test-Endpoint 2 "API de Documentos" "$VercelUrl/api/knowledge/documents?limit=5") {
    $Passed++
} else {
    $Failed++
}
Write-Host ""

# Passo 3: View Count
Write-Host "[Passo 3] View Count (incrementar)" -ForegroundColor $Blue

try {
    $DocsResponse = Invoke-WebRequest -Uri "$VercelUrl/api/knowledge/documents?limit=1" -Headers $Headers -ErrorAction Stop
    $DocsJson = $DocsResponse.Content | ConvertFrom-Json

    if ($DocsJson.documents -and $DocsJson.documents.Count -gt 0) {
        $DocId = $DocsJson.documents[0].id
        Write-Host "  Testando com documento ID: $DocId"

        $ViewResponse = Invoke-WebRequest -Uri "$VercelUrl/api/knowledge/documents/$DocId/view" -Headers $Headers -Method POST -ErrorAction Stop
        $ViewJson = $ViewResponse.Content | ConvertFrom-Json

        if ($ViewJson.success) {
            Write-Host "  ✅ Resposta válida (JSON)" -ForegroundColor $Green
            Write-Host "  ✅ PASSOU" -ForegroundColor $Green
            Write-Host "  🎯 Success: $($ViewJson.success)"
            $Passed++
        } else {
            Write-Host "  ❌ Falhou" -ForegroundColor $Red
            $Failed++
        }
    } else {
        Write-Host "  ❌ Nenhum documento encontrado" -ForegroundColor $Red
        $Failed++
    }
} catch {
    Write-Host "  ❌ Erro: $($_.Exception.Message)" -ForegroundColor $Red
    $Failed++
}

Write-Host ""

# Passo 4: Documentos Relacionados
if ($DocId) {
    if (Test-Endpoint 4 "Documentos Relacionados" "$VercelUrl/api/knowledge/documents/$DocId/related") {
        $Passed++
    } else {
        $Failed++
    }
} else {
    Write-Host "[Passo 4] Documentos Relacionados" -ForegroundColor $Blue
    Write-Host "  ⏭️  Pulado (nenhum documento para testar)" -ForegroundColor $Yellow
}

Write-Host ""

# ============================================================
# RESUMO
# ============================================================

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor $Blue
Write-Host "║  RESULTADO FINAL                                       ║" -ForegroundColor $Blue
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor $Blue
Write-Host ""

$Total = $Passed + $Failed

Write-Host "  ✅ Passou: $Passed/$Total" -ForegroundColor $Green
Write-Host "  ❌ Falhou: $Failed/$Total" -ForegroundColor $Red
Write-Host ""

if ($Failed -eq 0) {
    Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor $Green
    Write-Host "║  🎉 VALIDAÇÃO COMPLETA - STORY 17.1 = APPROVED       ║" -ForegroundColor $Green
    Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor $Green
    exit 0
} else {
    Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor $Red
    Write-Host "║  ⚠️  FALHAS DETECTADAS - REVISAR ACIMA               ║" -ForegroundColor $Red
    Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor $Red
    exit 1
}
