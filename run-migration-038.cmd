@echo off
REM Script de execução segura para Migration 038
REM Pre-verifies migration state antes de aplicar

echo ========================================
echo Migration 038: Seed Curated Models
echo ========================================
echo.

echo [1/3] Verificando migrations existentes...
npx supabase migration list
echo.

echo [2/3] Status da migration 038...
dir "supabase\migrations\038_*.sql"
echo.

echo [3/3] Preparado para aplicar migration 038
echo Arquivos criados:
echo   - supabase/migrations/038_seed_curated_models.sql
echo   - MIGRATION_038_README.md
echo   - MIGRATION_038_VALIDATION.md
echo.

echo ========================================
echo PROXIMOS PASSOS:
echo ========================================
echo 1. Revisar: cat MIGRATION_038_README.md
echo 2. Detalhar: cat MIGRATION_038_VALIDATION.md
echo 3. Executar: npx supabase db push
echo 4. Validar: [Query de verificacao comentada no SQL]
echo.

pause
