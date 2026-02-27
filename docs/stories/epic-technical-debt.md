# Epic: Resolucao de Debitos Tecnicos - Tech Arauz

Epic ID: TD-EPIC-01  
Data: 2026-02-26  
Base: `docs/prd/technical-debt-assessment.md`

Status: Done  

## Objetivo

Reduzir risco tecnico critico/alto em seguranca, isolamento multi-tenant, qualidade de entrega e manutenibilidade de frontend.

## Escopo

- Hardening de seguranca em AI service e integracoes
- Fortalecimento de RLS e governanca de secrets
- Melhorias de pipeline de qualidade (typecheck + testes alvo)
- Refatoracao incremental de frontend com foco em consistencia de regras
- Padronizacao arquitetural de novos modulos (tabela -> pagina -> UX)

## Nao escopo

- Reescrita completa da plataforma
- Mudanca de produto fora dos debitos priorizados

## Criterios de sucesso do epic

1. Endpoints criticos protegidos por autenticacao/autorizacao.
2. Validacao de RLS automatizada no CI.
3. Fluxos criticos com cobertura minima de regressao.
4. Reducao perceptivel de complexidade em modulos frontend chave.
5. Novos modulos seguem baseline de engenharia/UX definido em `docs/architecture/module-standards.md`.

## Timeline sugerida

- Sprint 1: Story 1.1 (seguranca + RLS/secrets)
- Sprint 2: Story 1.2 (frontend domain/modularizacao)
- Sprint 3: Story 1.3 (quality gates + observabilidade)

## Stories planejadas

1. `story-1.1-hardening-rls-and-secrets.md`
2. `story-1.2-refactor-front-domain-and-components.md`
3. `story-1.3-ci-and-observability-hardening.md`

## Execucao concluida

- [x] Story 1.1 concluida
- [x] Story 1.2 concluida
- [x] Story 1.3 concluida
