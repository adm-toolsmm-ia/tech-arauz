# Story 1.3 - CI and Observability Hardening

Status: Ready for Review  
Epic: TD-EPIC-01  
Prioridade: Alta

## User Story

Como lider tecnico,  
quero fortalecer quality gates e observabilidade,  
para detectar regressao mais cedo e reduzir incidentes em producao.

## Acceptance Criteria

1. Pipeline CI executa `lint`, `typecheck`, `test` e build de forma confiavel.
2. Existe cobertura minima para fluxos criticos de sync e autorizacao.
3. Logs tecnicos incluem dados suficientes para diagnostico rapido.
4. Politica de retencao para logs de integracao definida.

## Tasks

- [x] Incluir `npm run typecheck` no workflow CI.
- [x] Adicionar testes para rotas criticas de integracao e agents proxy.
- [x] Melhorar padronizacao de logs de erro operacional.
- [x] Definir e documentar politica de retencao de logs.

## Testes

- [x] CI passa em branch limpa com novos gates.
- [x] Testes de regressao para fluxo de sincronizacao.
- [x] Validacao de observabilidade em erros simulados.

## File List

- .github/workflows/ci.yml
- scripts/ci/check-rls-audit.mjs
- src/app/api/integracoes/*/route.ts
- src/app/api/agents/*/route.ts
- src/app/api/integracoes/sync/__tests__/route.test.ts
- src/app/api/agents/__tests__/route.test.ts
- src/components/integracoes/__tests__/APIManager.test.tsx
- docs/architecture/* (documentacao de operacao)
