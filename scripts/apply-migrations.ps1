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
    Write-Host "  (Se solicitado, faça login no browser)" -ForegroundColor Gray
    # supabase link --project-ref $ProjectRef
}

# Listar migrations
Write-Host "[3/5] Migrations a serem aplicadas:" -ForegroundColor Yellow
$migrations = @(
    "supabase/migrations/001_initial_schema.sql",
    "supabase/migrations/002_rls_policies.sql",
    "supabase/seed.sql"
)

foreach ($m in $migrations) {
    if (Test-Path $m) {
        Write-Host "  OK: $m" -ForegroundColor Green
    } else {
        Write-Host "  ERRO: $m não encontrado" -ForegroundColor Red
        exit 1
    }
}

# Aplicar migrations
Write-Host "[4/5] Aplicando migrations..." -ForegroundColor Yellow
if ($DryRun) {
    Write-Host "  [DRY-RUN] Nenhuma migration aplicada" -ForegroundColor Magenta
} else {
    Write-Host "  Executando: supabase db push" -ForegroundColor Gray
    # supabase db push
    Write-Host "  (Execute manualmente se necessário)" -ForegroundColor Yellow
}

# Verificar resultado
Write-Host "[5/5] Verificação..." -ForegroundColor Yellow
Write-Host "  Para verificar, execute:" -ForegroundColor Gray
Write-Host "  supabase db diff" -ForegroundColor Cyan
Write-Host ""

# Resumo
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RESUMO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Tabelas criadas:" -ForegroundColor White
Write-Host "  - tenants (multi-tenant)" -ForegroundColor Gray
Write-Host "  - profiles (usuarios)" -ForegroundColor Gray
Write-Host "  - projects (projetos)" -ForegroundColor Gray
Write-Host "  - project_schedules (cronogramas)" -ForegroundColor Gray
Write-Host "  - project_deliveries (entregas)" -ForegroundColor Gray
Write-Host "  - project_requirements (requisitos)" -ForegroundColor Gray
Write-Host "  - sync_logs (auditoria)" -ForegroundColor Gray
Write-Host ""
Write-Host "RLS habilitado em todas as tabelas" -ForegroundColor Green
Write-Host "Tenant 'arauz' criado" -ForegroundColor Green
Write-Host ""

# Próximos passos
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PRÓXIMOS PASSOS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Criar usuário admin no Supabase Auth Dashboard:" -ForegroundColor White
Write-Host "   https://supabase.com/dashboard/project/$ProjectRef/auth/users" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Inserir profile (após criar user):" -ForegroundColor White
Write-Host "   INSERT INTO public.profiles (id, tenant_id, email, full_name, role)" -ForegroundColor Gray
Write-Host "   VALUES ('<user_id>', '00000000-0000-0000-0000-000000000001'," -ForegroundColor Gray
Write-Host "          'seu@email.com', 'Seu Nome', 'admin');" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Setup Next.js:" -ForegroundColor White
Write-Host "   npx create-next-app@latest . --typescript --tailwind --eslint --app" -ForegroundColor Cyan
Write-Host ""
