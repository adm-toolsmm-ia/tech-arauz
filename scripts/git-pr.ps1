# git-pr.ps1 — Cria PR no GitHub após push (gh pr create)
# Uso: npm run sync:pr -- "Título do PR" "Corpo opcional"
# Requer: gh CLI instalado e autenticado (GITHUB_TOKEN ou gh auth login)
# Autoridade: @devops (gh pr create é EXCLUSIVO @devops — agent-authority.mdc)

param(
    [Parameter(Position = 0, Mandatory = $true)]
    [string]$Title,
    [Parameter(Position = 1)]
    [string]$Body = ""
)

$ErrorActionPreference = "Stop"

$branch = git branch --show-current
if (-not $branch) { throw "Não foi possível obter a branch atual" }

# Verificar se gh está disponível
$gh = Get-Command gh -ErrorAction SilentlyContinue
if (-not $gh) { throw "gh CLI não encontrado. Instale: https://cli.github.com/" }

$ghArgs = @("pr", "create", "--title", $Title)
if ($Body) { $ghArgs += "--body"; $ghArgs += $Body }

Write-Host "Criando PR: $Title (branch: $branch)"
& gh @ghArgs
if ($LASTEXITCODE -ne 0) { throw "Falha ao criar PR" }

Write-Host "PR criado com sucesso."
