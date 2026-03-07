# Tech Arauz — Documentation Date Mapping Report

**Executado:** 2026-03-07
**Escopo:** Análise completa de 91 arquivos `.md` em `/docs`
**Objetivo:** Mapear formatos de data e categorizar por período (Fevereiro vs Março 2026)

---

## Executive Summary

| Métrica | Valor | Status |
|---------|-------|--------|
| **Total de Arquivos** | 91 | — |
| **Arquivo com datas explícitas** | 15 | 16.5% |
| **Arquivos SEM datas** | 76 | 83.5% |
| **Março 2026 (2026-03-*)** | 20 | Current/AIOX |
| **Fevereiro 2026 (2026-02-*)** | 5 | Archived/Pre-Brownfield |
| **Março 2026 (pré-Brownfield)** | 4 | Archived/Stale |
| **Sem data mas Status "Current"** | 62 | Active stories (não têm timestamps) |

---

## Distribuição por Categoria de Data

### 1. MARÇO 2026 — CURRENT (20 arquivos)

**Período:** 2026-03-06 a 2026-03-07
**Contexto:** AIOX Brownfield Discovery Workflow (FASES 1-9)
**Contêm BROWNFIELD:** 13/20 (65%)
**Contêm AIOX:** 13/20 (65%)

| Arquivo | Data | Hora | Fase | Agente | Status |
|---------|------|------|------|--------|--------|
| `docs/architecture/system-architecture.md` | 2026-03-06 | — | FASE 1 | Aria | ✅ Current |
| `docs/frontend/frontend-spec.md` | 2026-03-06 | — | FASE 3 | Uma | ✅ Current |
| `docs/reviews/db-specialist-review.md` | 2026-03-06 | — | FASE 5 | Dara | ✅ Current |
| `docs/reviews/ux-specialist-review.md` | 2026-03-06 | — | FASE 6 | Uma | ✅ Current |
| `docs/prd/technical-debt-assessment.md` | 2026-03-06 | — | FASE 8 | Aria | ✅ FINAL v3.0 |
| `docs/prd/technical-debt-DRAFT.md` | 2026-03-06 | — | FASE 4 | — | 🔄 Draft (superseded) |
| `docs/alert-system-implementation-plan.md` | 2026-03-06 | — | Future | Aria+Uma+Dex+Dara | ✅ Documented |
| `docs/CLEANUP-FINAL-SUMMARY.md` | 2026-03-07 | — | Admin | Aria | ✅ Complete |
| `docs/CLEANUP-STRATEGY.md` | 2026-03-07 | — | Admin | Aria | ✅ Complete |
| `docs/DOCS-ANALYSIS-DEEP-SCAN.md` | 2026-03-07 | — | Admin | Orion | ✅ Complete |
| `docs/DOCS-AUDIT-REPORT.md` | 2026-03-07 | — | Admin | Aria | ✅ Complete |
| `docs/DOCS-FINAL-AUDIT-REPORT.md` | 2026-03-07 | 21:30 UTC | Admin | Orion | ✅ Complete |
| `docs/AGGRESSIVE-CLEANUP-PLAN.md` | 2026-03-07 | 22:00 UTC | Admin | Orion | ✅ Complete |
| `docs/architecture/BROWNFIELD-DISCOVERY-AUDIT.md` | 2026-03-07 | — | QA | Aria | ✅ Complete |
| `docs/qa/fase7-quality-gate.md` | 2026-03-07 | — | FASE 7 | Quinn | ✅ Current |
| `docs/reports/TECHNICAL-DEBT-REPORT.md` | 2026-03-07 | — | FASE 9 | Atlas | ✅ FINAL |

**Observações:**
- Todos têm referências AIOX Brownfield Discovery
- Documentação consolidada e validada por especialistas
- Pronto para FASE 10 (Implementation Planning)

---

### 2. FEVEREIRO 2026 — PRÉ-BROWNFIELD (5 arquivos)

**Período:** 2026-02-26 a 2026-02-27
**Contexto:** Antes da execução do AIOX Brownfield Discovery
**Status:** ❌ ARCHIVED (Stubs com redirecionamentos criados)
**Contêm BROWNFIELD:** 0/5
**Contêm AIOX:** 0/5

| Arquivo | Data Original | Supersedido Por | Motivo |
|---------|---------------|-----------------|--------|
| `docs/architecture/data-fetching-patterns.md` | 2026-02-26 | `docs/architecture/system-architecture.md` (FASE 1) | Padrões desatualizados, versão Mar 6 more comprehensive |
| `docs/architecture/log-retention-policy.md` | 2026-02-26 | `docs/prd/technical-debt-assessment.md` (FASE 8) | Policy supercedida por FASE 8 assessment |
| `docs/architecture/module-standards.md` | 2026-02-26 | `docs/frontend/frontend-spec.md` (FASE 3) | Standards refatorados em FASE 3 |
| `docs/design-system.md` | 2026-02-27 | `docs/frontend/frontend-spec.md` (FASE 3) | Antigo design system, supersedido por FASE 3 |
| `docs/ux/personas.md` | 2026-02-27 | `docs/reviews/ux-specialist-review.md` (FASE 6) | Personas pré-validação de UX specialists |

**Observações:**
- Criados PRÉ-BROWNFIELD Discovery
- Versões atualizadas existem em FASES 1-9
- Stubs informativos deixados com referências para versões correntes
- **Ação:** Archivados em `_deprecated/docs-feb-27/`

---

### 3. MARÇO 2026 (PRÉ-BROWNFIELD) — ARCHIVED (4 arquivos)

**Período:** 2026-03-01 a 2026-03-01
**Contexto:** Março mas antes de FASES 5-9 completarem
**Status:** ❌ ARCHIVED (Stale/AIOS-era)
**Contêm BROWNFIELD:** 0/4
**Contêm AIOX:** 0/4

| Arquivo | Data Original | Status | Razão |
|---------|---|---|---|
| `docs/plans/portal-tech-ai-evolution-masterplan.md` | 2026-03-01 20:55 | STALE | AIOS-era references (@aios-master deprecated) |
| `docs/stories/epic-4-ai-features-chat-360.md` | 2026-03-01 | OLD CYCLE | Supercedido por Stories 4.1-4.7 |
| `docs/stories/epic-5-auxiliares-ia-alignment.md` | 2026-03-01 | OLD CYCLE | Supercedido por Stories 5.1-5.4 |
| `docs/reports/portal-tech-ai-agents-context.md` | 2026-03-01 | STALE CONTEXT | Dados de Mar 1, desatualizados após FASES 5-9 |

**Observações:**
- Criados em Março mas PRÉ-execução completa de FASES 5-9
- Contêm referências AIOS (framework removido em 2026-03-06)
- Contexto desatualizado para uso em IA
- **Ação:** Archivados em `_deprecated/aios-era/` ou `_deprecated/stories-old-cycles/`

---

### 4. SEM DATA EXPLÍCITA — 62 ARQUIVOS

**Status:** Active/Current (63 arquivos Story + Outros)
**Padrão:** Stories não têm timestamps nos headers (apenas status como "Done", "InProgress")
**Contêm BROWNFIELD:** 0/62
**Contêm AIOX:** 0/62

#### Subgrupo A: Completed Stories (Epic 3) — 5 arquivos
- `docs/stories/story-3.1-remover-todas-atividades.md` → Status: Done (2026-03-01)
- `docs/stories/story-3.2-reposicionar-kpis-cronogramas.md` → Status: Done (2026-03-01)
- `docs/stories/story-3.3-padronizar-icone-kanban.md` → Status: Done (2026-03-01)
- `docs/stories/story-3.4-botao-sincronizar-cronogramas.md` → Status: Done (2026-03-01)
- `docs/stories/story-3.5-schedule-cockpit-dados-projeto.md` → Status: Done (2026-03-01)

#### Subgrupo B: Active Stories (Serie 1, 2, 4-8) — 57 arquivos
- Story 1.x (3 files) — RLS hardening, frontend refactoring, CI hardening
- Story 2.x (27 files) — Design system, error boundaries, accessibility, etc.
- Story 4.x (9 files) — Backend/frontend migration, metrics alignment
- Story 5.x (4 files) — IA providers and models terminology
- Story 6.x (1 file) — Database cleanup
- Story 7.x (2 files) — Modules and governance gaps
- Story 8.x (3 files) — Documents CRUD and viewers
- Story 4.11 (1 file) — Project time in stage

---

## Padrões de Data Encontrados

### Formato 1: ISO Date (YYYY-MM-DD) em Headers
```markdown
**Date:** March 6, 2026
**Date:** 2026-03-06
```
**Frequência:** 15 arquivos
**Exemplo:** `docs/architecture/system-architecture.md`

### Formato 2: Data Explícita com Campo
```markdown
**Data da revisão:** 2026-02-26
**Data da análise:** 2026-02-26
**Original Date:** 2026-02-27
```
**Frequência:** 5 arquivos
**Exemplo:** `docs/architecture/data-fetching-patterns.md`

### Formato 3: Status Field (Stories)
```markdown
Status: Done
Sprint: 5 — Padronização de UI
```
**Frequência:** 62 arquivos
**Contexto:** Stories não usam datas explícitas; usam status + contextual metadata

### Formato 4: Sem Data
```markdown
# Story Title
(sem campo Date/Updated/Created)
```
**Frequência:** 62 arquivos
**Observação:** Padrão normal para stories; versionamento acontece via git commits

---

## Análise de "BROWNFIELD" e "AIOX"

### Arquivos Contendo "BROWNFIELD"
**Total:** 14 arquivos (15.4%)
**Padrão:** Todos de Março 6-7 (FASES 1-9, Admin, QA)
**Significado:** Parte formal do AIOX Brownfield Discovery Workflow

### Arquivos Contendo "AIOX"
**Total:** 13 arquivos (14.3%)
**Padrão:** Todos de Março 6-7, ou UT/Design-system referências
**Significado:** Documentação AIOX-current; não contém AIOS references

### Arquivos SEM BROWNFIELD ou AIOX
**Total:** 77 arquivos (84.6%)
**Categorias:**
- Stories (62) — Padrão: não referenciam o framework, apenas conteúdo técnico
- Architecture (8) — Padrão: documentação técnica pura
- Utilities (7) — Padrão: guides, setup docs, matrix

**Observação:** Falta de "AIOX/BROWNFIELD" keywords não significa arquivo é antigo; stories e utilities são naturalmente neutros ao framework.

---

## Recomendações & Status Consolidado

### ✅ MANTER (76 arquivos)

**Stories Ativas (62):**
- Sem timestamps por design (git commit history é source of truth)
- Padrão de status = Done/InProgress/Backlog
- Manter como estão

**Architecture/Documentation (14):**
- Marzo 6-7 com FASES 1-9 completas
- Validadas por especialistas
- Referenciam AIOX Brownfield formalmente
- Manter como estão

**Utilities (3):**
- SETUP-AI-SERVICE.md (no timestamp needed)
- ADR files (current standards)
- Manter como estão

### ❌ ARCHIVED (9 arquivos)

**Pré-Brownfield Feb (5):**
- `docs/architecture/data-fetching-patterns.md`
- `docs/architecture/log-retention-policy.md`
- `docs/architecture/module-standards.md`
- `docs/design-system.md`
- `docs/ux/personas.md`
- **Status:** Replaced by _deprecated/docs-feb-27/ stubs (with redirects)

**AIOS-era / Stale Mar (4):**
- `docs/plans/portal-tech-ai-evolution-masterplan.md`
- `docs/stories/epic-4-ai-features-chat-360.md`
- `docs/stories/epic-5-auxiliares-ia-alignment.md`
- `docs/reports/portal-tech-ai-agents-context.md`
- **Status:** Moved to _deprecated/aios-era/ or _deprecated/stories-old-cycles/

🔄 **Draft (1):**
- `docs/prd/technical-debt-DRAFT.md`
- **Status:** Kept (superseded by FINAL v3.0, but kept for reference)

---

## Data Mapping Summary Table

```
Período                    | Arquivos | % Total | Status         | Ação
---------------------------|----------|---------|---------------|---------
Março 6-7 (AIOX Current)  | 20       | 21.9%   | ✅ CURRENT     | KEEP
Fevereiro 26-27 (Pre-BD)  | 5        | 5.5%    | ❌ ARCHIVED    | DEPRECATED
Março 1 (AIOS-era)        | 4        | 4.4%    | ❌ ARCHIVED    | DEPRECATED
Sem data (Stories/Utils)  | 62       | 68.1%   | ✅ CURRENT     | KEEP
---------------------------|----------|---------|---------------|---------
TOTAL                     | 91       | 100%    | —              | —
```

---

## Contexto Técnico para Validação

### AIOX Brownfield Discovery (FASES 1-9)
- **FASE 1:** System Architecture (Mar 6)
- **FASE 2:** Database Audit (Mar 6 via Supabase)
- **FASE 3:** Frontend Spec (Mar 6-7)
- **FASE 4:** Initial Draft (Mar 6)
- **FASE 5:** DB Specialist Review (Mar 6-7)
- **FASE 6:** UX Specialist Review (Mar 6-7)
- **FASE 7:** QA Gate (Mar 7)
- **FASE 8:** Final Assessment (Mar 6-7)
- **FASE 9:** Executive Report (Mar 7)
- **QA Audit:** Brownfield Discovery Audit (Mar 7)

### AIOS Removal (Completed 2026-03-06)
- Framework AIOS fully removed
- @aios-master references obsolete
- Replaced by @aiox-master, @dev, @qa, etc.
- All AIOS docs must reference deprecation

---

## Como Usar Este Relatório

1. **Para auditar documentação:** Use a coluna "Status" para identificar arquivos ARCHIVED vs CURRENT
2. **Para rastrear origem histórica:** Use coluna "Data Encontrada" + "Categoria"
3. **Para contexto de IA:** Priorize arquivos com "Contém AIOX" = Yes para contexto mais recente
4. **Para referências cruzadas:** Use coluna "Observações" para identificar relações (e.g., FASE 1 referenced in FASE 5)

---

**Gerado por:** Orion (Documentation Analysis)
**Data:** 2026-03-07
**CSV Completo:** `DOCS_DATE_ANALYSIS.csv` (91 linhas, 8 colunas)
