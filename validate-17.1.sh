#!/bin/bash

# Script de Validação Automática - Story 17.1
# Uso: bash validate-17.1.sh <seu-jwt-token>

set -e

# Colors para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# URL do projeto
VERCEL_URL="https://arauz-tech.vercel.app"

# Validar argumentos
if [ -z "$1" ]; then
  echo -e "${RED}❌ JWT Token não fornecido!${NC}"
  echo ""
  echo "Como usar:"
  echo "  bash validate-17.1.sh 'seu-jwt-token-aqui'"
  echo ""
  echo "Para obter seu JWT token:"
  echo "  1. Abra https://arauz-tech.vercel.app"
  echo "  2. Faça login"
  echo "  3. Pressione F12 (Developer Tools)"
  echo "  4. Vá para 'Storage' ou 'Application'"
  echo "  5. Clique em 'Local Storage'"
  echo "  6. Procure por 'auth' ou 'session'"
  echo "  7. Copie o valor do token (começa com 'eyJ...')"
  echo ""
  exit 1
fi

JWT_TOKEN="$1"

# Headers padrão
HEADERS="-H 'Authorization: Bearer $JWT_TOKEN' -H 'Content-Type: application/json'"

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  VALIDAÇÃO AUTOMÁTICA - EPIC 17.1                     ║${NC}"
echo -e "${BLUE}║  Story 17.1: Graph Data API + Schema                  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}URL testada:${NC} $VERCEL_URL"
echo ""

# Inicializar contadores
PASSED=0
FAILED=0

# Função para testar endpoint
test_endpoint() {
  local step=$1
  local name=$2
  local url=$3
  local method=${4:-GET}

  echo -e "${BLUE}[Passo $step] $name${NC}"
  echo "  URL: $url"

  # Fazer requisição
  if [ "$method" = "POST" ]; then
    response=$(curl -s -X POST "$url" $HEADERS)
  else
    response=$(curl -s "$url" $HEADERS)
  fi

  # Verificar resposta
  if echo "$response" | jq . &>/dev/null; then
    echo -e "  ${GREEN}✅ Resposta válida (JSON)${NC}"

    # Extrair informações específicas
    if echo "$response" | jq '.error' &>/dev/null && [ "$(echo "$response" | jq -r '.error')" != "null" ]; then
      echo -e "  ${RED}❌ Erro na resposta: $(echo "$response" | jq -r '.error')${NC}"
      FAILED=$((FAILED + 1))
    else
      echo -e "  ${GREEN}✅ PASSOU${NC}"

      # Mostrar preview de dados
      if echo "$response" | jq '.nodes' &>/dev/null; then
        count=$(echo "$response" | jq '.nodes | length')
        echo "  📊 Nós encontrados: $count"
      fi

      if echo "$response" | jq '.documents' &>/dev/null; then
        count=$(echo "$response" | jq '.documents | length')
        echo "  📄 Documentos encontrados: $count"
      fi

      if echo "$response" | jq '.success' &>/dev/null; then
        echo "  🎯 Success: $(echo "$response" | jq '.success')"
      fi

      PASSED=$((PASSED + 1))
    fi
  else
    echo -e "  ${RED}❌ Resposta inválida ou erro de conexão${NC}"
    echo "  Resposta: $response"
    FAILED=$((FAILED + 1))
  fi

  echo ""
}

# ============================================================
# TESTES
# ============================================================

echo -e "${YELLOW}Executando testes...${NC}"
echo ""

# Passo 1: API de Grafo
test_endpoint 1 "API de Grafo" \
  "$VERCEL_URL/api/knowledge/graph"

# Passo 2: API de Documentos
test_endpoint 2 "API de Documentos" \
  "$VERCEL_URL/api/knowledge/documents?limit=5"

# Passo 3: View Count (precisa de um doc ID)
# Primeiro pega um doc ID
echo -e "${BLUE}[Passo 3] View Count (incrementar)${NC}"
DOC_RESPONSE=$(curl -s "$VERCEL_URL/api/knowledge/documents?limit=1" $HEADERS)

if echo "$DOC_RESPONSE" | jq '.documents[0].id' &>/dev/null; then
  DOC_ID=$(echo "$DOC_RESPONSE" | jq -r '.documents[0].id')
  if [ "$DOC_ID" != "null" ] && [ -n "$DOC_ID" ]; then
    echo "  Testando com documento ID: $DOC_ID"
    test_endpoint 3 "View Count (POST)" \
      "$VERCEL_URL/api/knowledge/documents/$DOC_ID/view" \
      "POST"
  else
    echo -e "  ${RED}❌ Nenhum documento encontrado para testar view count${NC}"
    FAILED=$((FAILED + 1))
    echo ""
  fi
else
  echo -e "  ${RED}❌ Erro ao buscar documento${NC}"
  FAILED=$((FAILED + 1))
  echo ""
fi

# Passo 4: Documentos Relacionados
if [ -n "$DOC_ID" ] && [ "$DOC_ID" != "null" ]; then
  test_endpoint 4 "Documentos Relacionados" \
    "$VERCEL_URL/api/knowledge/documents/$DOC_ID/related"
else
  echo -e "${BLUE}[Passo 4] Documentos Relacionados${NC}"
  echo -e "  ${YELLOW}⏭️  Pulado (nenhum documento para testar)${NC}"
  echo ""
fi

# ============================================================
# RESUMO
# ============================================================

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  RESULTADO FINAL                                       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

TOTAL=$((PASSED + FAILED))

echo -e "  ${GREEN}✅ Passou:${NC} $PASSED/$TOTAL"
echo -e "  ${RED}❌ Falhou:${NC} $FAILED/$TOTAL"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║  🎉 VALIDAÇÃO COMPLETA - STORY 17.1 = APPROVED       ║${NC}"
  echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
  exit 0
else
  echo -e "${RED}╔════════════════════════════════════════════════════════╗${NC}"
  echo -e "${RED}║  ⚠️  FALHAS DETECTADAS - REVISAR ACIMA               ║${NC}"
  echo -e "${RED}╚════════════════════════════════════════════════════════╝${NC}"
  exit 1
fi
