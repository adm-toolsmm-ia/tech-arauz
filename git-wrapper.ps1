# PowerShell wrapper para git
# Uso: powershell -NoProfile -File git-wrapper.ps1 commit -m "message"

param(
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$Arguments
)

# Executa git com os argumentos passados
& git @Arguments
exit $LASTEXITCODE
