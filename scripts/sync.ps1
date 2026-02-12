Write-Host "Iniciando sincronização com GitHub..."

# Ignorar arquivo 'nul' se existir
if (Test-Path -LiteralPath '\\?\c:\Users\Gabriel Cristofolini\Documents\SOLUCOESSISTEMAS\tech-arauz\nul') {
    Write-Host "Removendo arquivo 'nul' inválido..."
    Remove-Item -LiteralPath '\\?\c:\Users\Gabriel Cristofolini\Documents\SOLUCOESSISTEMAS\tech-arauz\nul' -Force -ErrorAction SilentlyContinue
}

# Adicionar arquivos (excluindo 'nul' explicitamente se a remoção falhar)
Write-Host "Adicionando arquivos..."
git add . ':!nul'
if ($LASTEXITCODE -ne 0) { 
    Write-Host "Tentando git add . sem exclusão..."
    git add . 
}

# Verificar se há mudanças para commit
$status = git status --porcelain
if (-not $status) {
    Write-Host "Nenhuma mudança para commitar."
}
else {
    # Commit
    $commitMsg = If ($args[0]) { $args[0] } Else { "chore: sync project updates" }
    Write-Host "Realizando commit: $commitMsg"
    git commit -m "$commitMsg"
    if ($LASTEXITCODE -ne 0) { Write-Error "Falha no commit"; exit 1 }
}

# Detectar branch atual
$branch = git branch --show-current
Write-Host "Branch atual: $branch"

# Pull rebase
Write-Host "Atualizando (pull origin $branch --rebase)..."
git pull origin $branch --rebase
if ($LASTEXITCODE -ne 0) { Write-Error "Falha no pull"; exit 1 }

# Push
Write-Host "Enviando (push origin $branch)..."
git push origin $branch
if ($LASTEXITCODE -ne 0) { Write-Error "Falha no push"; exit 1 }

Write-Host "Sincronização concluída com sucesso!"
