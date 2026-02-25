# git-push.ps1 — Rotina: pull --rebase + push (sem add/commit)
# Uso: npm run sync:push
# Autoridade: @devops (git push é EXCLUSIVO @devops — agent-authority.mdc)
# Pré-requisito: commits já feitos localmente (ex.: npm run sync:commit)

$ErrorActionPreference = "Stop"

$branch = git branch --show-current
if (-not $branch) { throw "Não foi possível obter a branch atual" }

Write-Host "Branch atual: $branch"

# Pull rebase (falha se a branch ainda não existir no remoto — nesse caso só faz push -u)
# Git escreve progresso em stderr; capturar 2>&1 evita que PowerShell trate como erro.
Write-Host "Atualizando (pull origin $branch --rebase)..."
$null = git pull origin $branch --rebase 2>&1
if ($LASTEXITCODE -ne 0) {
    $refExists = git ls-remote origin $branch 2>&1
    if (-not $refExists) {
        Write-Host "Branch ainda não existe no remoto. Enviando com -u..."
        git push -u origin $branch
        if ($LASTEXITCODE -ne 0) { throw "Falha no push (primeira vez)" }
        Write-Host "Push concluído com sucesso (branch criada no remoto)."
        exit 0
    }
    throw "Falha no pull (rebase)"
}

Write-Host "Enviando (push origin $branch)..."
git push origin $branch
if ($LASTEXITCODE -ne 0) { throw "Falha no push" }

Write-Host "Push concluído com sucesso."
