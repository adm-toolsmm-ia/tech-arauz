# PowerShell wrapper para builds (npm run, npm test, etc)
# Uso: powershell -NoProfile -File build-wrapper.ps1 build

param(
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$Arguments
)

# Se nenhum argumento, mostra uso
if ($Arguments.Count -eq 0) {
    Write-Host "Uso: powershell -NoProfile -File build-wrapper.ps1 <comando> [args]"
    Write-Host "Exemplos:"
    Write-Host "  powershell -NoProfile -File build-wrapper.ps1 build"
    Write-Host "  powershell -NoProfile -File build-wrapper.ps1 lint"
    Write-Host "  powershell -NoProfile -File build-wrapper.ps1 test"
    exit 1
}

# Executa npm run com os argumentos
& npm run @Arguments
exit $LASTEXITCODE
