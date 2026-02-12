# =============================================================================
# Tech Arauz - Script de Aplicação de Migrations
# =============================================================================
# Uso: .\scripts\apply-migrations.ps1
# Requer: Supabase CLI instalado e projeto linkado
# =============================================================================

param(
    [switch]$DryRun,
    [string]$ProjectRef = "pybmawlwpmxshtccpqui"
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Tech Arauz - Migration Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Supabase CLI
Write-Host "[1/5] Verificando Supabase CLI..." -ForegroundColor Yellow
try {
    $version = supabase --version 2>&1
    Write-Host "  OK: $version" -ForegroundColor Green
} catch {
    Write-Host "  ERRO: Supabase CLI não encontrado" -ForegroundColor Red
    Write-Host ""
    Write-Host "  Instale com: npm install -g supabase" -ForegroundColor Yellow
    Write-Host "  Ou use: npx supabase ..." -ForegroundColor Yellow
    exit 1
}

# Verificar link do projeto
Write-Host "[2/5] Verificando link do projeto..." -ForegroundColor Yellow
if ($DryRun) {
    Write-Host "  [DRY-RUN] Pulando verificação de link" -ForegroundColor Magenta
} else {
    Write-Host "  Linkando projeto: $ProjectRef" -ForegroundColor Gray
    # supabase link --project-ref $ProjectRef
}

# Listar migrations
Write-Host "[3/5] Migrations a serem aplicadas:" -ForegroundColor Yellow
$migrations = Get-ChildItem "supabase/migrations/*.sql" | Sort-Object Name
foreach ($m in $migrations) {
    Write-Host "  - $($m.Name)" -ForegroundColor Green
}

# Aplicar migrations
Write-Host "[4/5] Aplicando migrations..." -ForegroundColor Yellow
if ($DryRun) {
    Write-Host "  [DRY-RUN] Nenhuma migration aplicada" -ForegroundColor Magenta
} else {
    Write-Host "  Executando: supabase db push" -ForegroundColor Gray
    supabase db push
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ERRO ao aplicar migrations" -ForegroundColor Red
        exit 1
    }
}

# Verificar resultado
Write-Host "[5/5] Verificação..." -ForegroundColor Yellow
Write-Host "  Para verificar, execute:" -ForegroundColor Gray
Write-Host "  supabase db diff" -ForegroundColor Cyan
Write-Host ""

# Resumo
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CONCLUSÃO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Script finalizado com sucesso." -ForegroundColor Green
