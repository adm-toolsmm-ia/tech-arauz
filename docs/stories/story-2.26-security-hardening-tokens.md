# Story 2.26 — Security Hardening (Tokens)

Story ID: 2.26
Epic: PRD-UX-2026
Sprint: 4 — Segurança e Governança
Agente: @dev
Esforço: 6h
Prioridade: Alta
Status: Done ✅

## Como usuário

Como responsável técnico,
quero garantir que nenhum token/secret crítico fique exposto em texto puro no banco ou no código,
e que o CI bloqueie merges quando secrets obrigatórios não estiverem configurados.

## Contexto

A Story 1.1 (Hardening RLS and Secrets) já implementou:
- `src/lib/security/integration-token.ts` — criptografia AES-256-GCM para tokens de integração (Espaider)
- `src/lib/security/__tests__/integration-token.test.ts` — testes unitários cobrindo encrypt/decrypt
- `.env.example` — documenta `INTEGRATION_TOKEN_SECRET` como variável obrigatória
- Remoção do fallback inseguro de token em texto puro
- Proteção de endpoints `/traces` e `/budget` com JWT válido

**Gaps identificados:**

1. O CI valida apenas `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` — `INTEGRATION_TOKEN_SECRET` **não é validado**
2. Não existe auditoria automatizada de variáveis `NEXT_PUBLIC_*` para detectar secrets expostos no bundle
3. Não há documentação de procedimento de rotação de secrets

## Critérios de aceite

- [x] `src/lib/security/integration-token.ts` com AES-256-GCM encrypt/decrypt
- [x] Testes unitários para encryption/decryption (edge cases: token nulo, secret ausente, formato inválido)
- [x] `.env.example` documenta todas as variáveis obrigatórias com `INTEGRATION_TOKEN_SECRET`
- [x] Token Espaider nunca persiste em texto puro no banco
- [x] Endpoints AI críticos exigem JWT válido (`/traces`, `/budget`, `/v2/*`)
- [x] CI valida presença de `INTEGRATION_TOKEN_SECRET` antes do step de build
- [x] Script `scripts/ci/check-env-secrets.mjs` audita variáveis `NEXT_PUBLIC_*` para detectar padrões de secret (chaves, tokens, UUIDs longos)
- [x] `package.json` expõe script `audit:secrets`
- [x] CI executa `audit:secrets` no workflow
- [x] `docs/architecture/secret-rotation.md` documenta procedimento de rotação dos 3 secrets críticos: `INTEGRATION_TOKEN_SECRET`, `SUPABASE_JWT_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`

## Implementação necessária

### 1. Atualizar `.github/workflows/ci.yml`

Adicionar validação de `INTEGRATION_TOKEN_SECRET` no step "Validate Supabase secrets":
```yaml
if [ -z "${{ secrets.INTEGRATION_TOKEN_SECRET }}" ]; then
  echo "Missing required secret: INTEGRATION_TOKEN_SECRET"
  exit 1
fi
```

### 2. Criar `scripts/ci/check-env-secrets.mjs`

Script que:
- Lê `.env.example` para listar todas as variáveis
- Verifica se alguma `NEXT_PUBLIC_*` var parece conter um secret (regex: UUIDs, tokens longos, chaves API)
- Falha com mensagem clara se detectar

### 3. Criar `docs/architecture/secret-rotation.md`

Procedimento simples de rotação para os 3 secrets críticos.

## Dependências

- Nenhuma bloqueante

## Definition of Done

- [x] Token Espaider criptografado (Story 1.1)
- [x] CI valida `INTEGRATION_TOKEN_SECRET`
- [x] Script `audit:secrets` criado e no CI
- [x] Documentação de rotação criada

## File List

- `src/lib/security/integration-token.ts` (já existe — ✅)
- `src/lib/security/__tests__/integration-token.test.ts` (já existe — ✅)
- `.github/workflows/ci.yml` (modificar — adicionar validação)
- `scripts/ci/check-env-secrets.mjs` (CRIAR)
- `package.json` (modificar — adicionar script `audit:secrets`)
- `docs/architecture/secret-rotation.md` (CRIAR)
