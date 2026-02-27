# Story 1.1 - Hardening RLS and Secrets

Status: Done  
Epic: TD-EPIC-01  
Prioridade: Critica

## User Story

Como responsavel tecnico,  
quero reforcar isolamento multi-tenant e seguranca de credenciais,  
para reduzir risco de incidente de dados e exposicao de segredos.

## Acceptance Criteria

1. Endpoints AI criticos exigem JWT valido.
2. Nao existe fallback inseguro para segredo JWT em producao.
3. Estrategia de secrets para integracao Espaider definida e aplicada.
4. Suite SQL de validacao RLS executa no CI com bloqueio em falha.

## Tasks

- [x] Proteger `/traces` e `/budget` com o mesmo guard de JWT dos endpoints v2.
- [x] Tornar obrigatorio `SUPABASE_JWT_SECRET` no AI service.
- [x] Remover dependencia de token em texto puro (ou aplicar criptografia controlada).
- [x] Adicionar teste SQL de auditoria RLS no pipeline.
- [x] Documentar matriz de autorizacao (DB x API).

## Testes

- [x] Teste de autorizacao por role para endpoints de integracao/AI.
- [x] Teste de regressao RLS por tabela critica.
- [x] Smoke test de sync apos mudanca de secrets.

## File List

- services/ai/app/api/routes.py
- services/ai/app/main.py
- services/ai/app/config.py
- src/app/api/integracoes/*.ts
- src/lib/security/integration-token.ts
- src/lib/sync/espaider-sync.ts
- src/app/api/agents/route.ts
- src/app/api/integracoes/sync/__tests__/route.test.ts
- src/app/api/agents/__tests__/route.test.ts
- src/components/integracoes/__tests__/APIManager.test.tsx
- src/lib/security/__tests__/integration-token.test.ts
- src/lib/sync/__tests__/espaider-sync-token.test.ts
- scripts/ci/check-rls-audit.mjs
- docs/architecture/authorization-matrix.md
- supabase/migrations/*.sql (se aplicavel)
- .github/workflows/ci.yml
