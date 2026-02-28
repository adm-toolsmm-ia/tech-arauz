# PowerShell wrapper para npm
# Uso: powershell -NoProfile -File npm-wrapper.ps1 build
# Ou adicione ao PATH e chame diretamente

param(
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$Arguments
)

# Executa npm com os argumentos passados
& npm @Arguments
exit $LASTEXITCODE
