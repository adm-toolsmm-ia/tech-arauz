# git-commit.ps1 — Rotina local: add + commit (sem push)
# Uso: npm run sync:commit -- "feat(scope): description"
# Ou: powershell -File ./scripts/git-commit.ps1 "feat(auth): add login"
# Convenção: type(scope): description — feat, fix, docs, refactor, test, chore, ci

param(
    [Parameter(Position = 0)]
    [string]$Message = "chore: sync project updates"
)

$ErrorActionPreference = "Stop"

# Remover arquivo 'nul' inválido se existir
if (Test-Path -LiteralPath "nul") {
    Write-Host "Removendo arquivo 'nul' inválido..."
    Remove-Item -LiteralPath "nul" -Force -ErrorAction SilentlyContinue
}

Write-Host "Adicionando arquivos..."
git add .
if ($LASTEXITCODE -ne 0) { throw "Falha em git add" }

$status = git status --porcelain
if (-not $status) {
    Write-Host "Nenhuma mudança para commitar."
    exit 0
}

Write-Host "Commit: $Message"
git commit -m $Message
if ($LASTEXITCODE -ne 0) { throw "Falha no commit" }

Write-Host "Commit local concluído. Para enviar ao GitHub: npm run sync:push"
