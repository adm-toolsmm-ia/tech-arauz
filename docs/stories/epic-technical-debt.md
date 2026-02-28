# Epic: Padronização UX/UI — PRD 2026

Epic ID: PRD-UX-2026
Data: 2026-02-28
Base: `docs/prd/technical-debt-assessment.md` v2.0
PRD: Padronização UX/UI + Cronogramas Read-Only + Tecnologia & IA
Orquestração: @aios-master (Orion)

Status: Ready for Development

## Objetivo

Implementar os requisitos do PRD de padronização UX/UI: completar Cronogramas (3 views read-only), alinhar Tecnologia & IA com CRUD, padronizar layout/filtros/navegação entre módulos, e resolver débitos de segurança/governança do banco.

## Escopo

- Cronogramas: Kanban + Tabela + Agenda (read-only, com banner ERP)
- Projetos: reforçar read-only (desabilitar DnD, banner ERP)
- Sidebar: reorganizar para "Tecnologia & IA" + "Tabelas Auxiliares"
- Agentes AI: Kanban por Tipo, FilterBar padrão
- UX Universal: a11y WCAG AA, feedback async, empty/loading/error
- Database: índices, RLS CI, token handling, governança

## Não escopo

- Edição de Projetos/Cronogramas no portal
- Escrita no ERP ou tabelas locais desses domínios
- Grid view
- i18n completo (apenas pt-BR)
- Telemetria completa (apenas placeholders)

## Critérios de sucesso

1. Cronogramas com 3 visualizações funcionais, 100% read-only
2. Interseção de período correta (bordas inclusivas, ISO-8601)
3. Projetos sem ações de mutação, com banner ERP
4. Sidebar conforme PRD
5. Agentes AI com Kanban por Tipo e FilterBar padrão
6. WCAG AA nas telas-alvo
7. 80% cobertura novos componentes; E2E para read-only e período
8. RLS validado no CI; token protegido

## Stories

### Sprint 1 — Fundação

1. `story-2.13-sidebar-reorganization.md` — Reorganizar sidebar para PRD
2. `story-2.14-erp-readonly-banner.md` — Criar ErpReadOnlyBanner + inserir em módulos
3. `story-2.15-db-period-indexes.md` — Índices de período + status mapping
4. `story-2.16-fix-week-start-bug.md` — Fix getWeekStart() ISO-8601

### Sprint 2 — Core PRD

5. `story-2.17-cronogramas-kanban.md` — Kanban Cronogramas read-only
6. `story-2.18-cronogramas-table.md` — Tabela Cronogramas com paginação
7. `story-2.19-cronogramas-filters-defaults.md` — Exclusão de concluídos + atalhos
8. `story-2.20-projetos-readonly-hardening.md` — Desabilitar DnD + tooltips
9. `story-2.21-agentes-filterbar-kanban.md` — Migrar Agentes para FilterBar + Kanban por Tipo

### Sprint 3 — Qualidade e consistência

10. `story-2.22-accessibility-baseline.md` — WCAG AA baseline
11. `story-2.23-async-feedback-patterns.md` — Padrão feedback async
12. `story-2.24-ux-consistency-polish.md` — States, ModelCockpit, DashboardHeader, bugs

### Sprint 4 — Segurança e governança

13. `story-2.25-rls-ci-automation.md` — RLS test suite no CI
14. `story-2.26-security-hardening.md` — Token handling + tenant hardcode
15. `story-2.27-db-governance.md` — Retenção de logs + constraints + restore drill
