#!/bin/bash
# Tech Arauz Build Wrapper
# Executa comandos npm/git/builds via PowerShell para evitar erros de path
# Uso: ./run.sh npm install
#      ./run.sh git status
#      ./run.sh build

COMMAND=$1
shift
ARGS="$@"

case "$COMMAND" in
  npm)
    powershell -NoProfile -Command "npm $ARGS" && exit 0 || exit 1
    ;;
  git)
    powershell -NoProfile -Command "git $ARGS" && exit 0 || exit 1
    ;;
  node)
    powershell -NoProfile -Command "node $ARGS" && exit 0 || exit 1
    ;;
  npx)
    powershell -NoProfile -Command "npx $ARGS" && exit 0 || exit 1
    ;;
  build|lint|test|dev)
    powershell -NoProfile -Command "npm run $COMMAND" && exit 0 || exit 1
    ;;
  *)
    echo "Uso: ./run.sh <comando> [args]"
    echo ""
    echo "Comandos suportados:"
    echo "  npm <args>      - Executa npm"
    echo "  git <args>      - Executa git"
    echo "  node <args>     - Executa node"
    echo "  npx <args>      - Executa npx"
    echo "  build           - npm run build"
    echo "  lint            - npm run lint"
    echo "  test            - npm run test"
    echo "  dev             - npm run dev"
    echo ""
    echo "Exemplos:"
    echo "  ./run.sh npm install"
    echo "  ./run.sh git status"
    echo "  ./run.sh build"
    exit 1
    ;;
esac
