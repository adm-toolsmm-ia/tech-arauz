# ⛔ _deprecated — Arquivo Global do Projeto

## Convenção

Esta pasta é o **arquivo centralizado** de tudo que foi descontinuado no projeto.

**Regra universal:** qualquer LLM, agente, script, lint ou ferramenta deve **ignorar completamente** esta pasta.

---

## Estrutura

A organização **espelha a estrutura original do projeto**. Isso permite saber exatamente de onde cada arquivo veio:

```
_deprecated/
└── <caminho-original-no-projeto>/
    └── arquivo-descontinuado.md
```

**Exemplo:** um agente que estava em `.agent/agents/orchestrator.md` fica em:
```
_deprecated/.agent/agents/orchestrator.md
```

---

## Regras para LLMs e Ferramentas

> 🔴 **Se você é um LLM lendo isso**: Esta pasta NÃO FAZ PARTE do projeto ativo. Não carregue, não referencie, não use nenhum arquivo aqui.

| Ferramenta / Contexto | Comportamento                                   |
| --------------------- | ----------------------------------------------- |
| Antigravity / Gemini  | Ignorar — não listar como agente/skill ativo    |
| Claude Code           | Ignorar — não incluir no contexto de projeto    |
| Codex CLI / Cursor    | Ignorar — excluído via AGENTS.md                |
| ESLint / lint tools   | Excluído via `.eslintignore` / `ignorePatterns` |
| Git                   | Rastreado normalmente (backup histórico)        |

---

## Como Mover um Arquivo para Aqui

1. Identifique o caminho original: ex. `.agent/agents/meu-agente.md`
2. Crie o mesmo caminho dentro de `_deprecated/`: `_deprecated/.agent/agents/`
3. Mova o arquivo: `Move-Item <origem> <destino>`
4. Atualize as referências nos arquivos de configuração (ex. `GEMINI.md`)

---

## Conteúdo Atual

### Lote 2026-03 (AIOX Brownfield Cleanup - Docs Standardization)

| Pasta | Conteúdo | Origem | Motivo |
|-------|----------|--------|--------|
| `docs-feb-27/` | 9 arquivos pré-Brownfield | `docs/` | Documentação descontinuada (Fev 2026, supersedida por AIOX FASES 1-9) |
| `adr-old/` | 2 ADRs antigos (ADR-005, ADR-009) | `docs/architecture/adr/` | Serão substituídos por novos ADRs pós-AIOX |
| `audits/` | 7 relatórios de auditoria/cleanup | `docs/` (raiz) | Metadocumentação de processo AIOX (CLEANUP, DOCS-AUDIT, etc.) |
| `stories-old-cycles/` | Epics antigos descontinuados | `docs/stories/` | Ciclos de desenvolvimento encerrados (epic-4, epic-5, epic-ux, epic-technical-debt) |

**Exemplo de conteúdo em `docs-feb-27/`:**
- `data-fetching-patterns.md` — Integrado em `module-standards.md`
- `design-system.md` — Supersedido por `frontend-spec.md` (AIOX FASE 3)
- `PLANO-ACAO-10-10.md` — Pré-Brownfield, consolidado em technical-debt-assessment
- `personas.md` — Pré-UX specialist review (não validado)
- `portal-tech-ai-evolution-masterplan.md` — AIOS-era, deprecated 2026-03-06

### Lote Anterior (AIOS Migration)

| Arquivo                                   | Origem Original  | Substituído Por  |
| ----------------------------------------- | ---------------- | ---------------- |
| `.agent/agents/orchestrator.md`           | `.agent/agents/` | `@aios-master`   |
| `.agent/agents/project-planner.md`        | `.agent/agents/` | `@aios-master`   |
| `.agent/agents/backend-specialist.md`     | `.agent/agents/` | `@dev`           |
| `.agent/agents/security-auditor.md`       | `.agent/agents/` | `@security`      |
| `.agent/agents/penetration-tester.md`     | `.agent/agents/` | `@security`      |
| `.agent/agents/devops-engineer.md`        | `.agent/agents/` | `@devops`        |
| `.agent/agents/qa-automation-engineer.md` | `.agent/agents/` | `@qa`            |
| `.agent/agents/test-engineer.md`          | `.agent/agents/` | `@qa`            |
| `.agent/agents/database-architect.md`     | `.agent/agents/` | `@data-engineer` |

### Lote 2026-02 (raiz, .cursor, .agent)

| Arquivo | Origem | Substituído por / Motivo |
| ------- | ------ | ------------------------ |
| `MIGRATION_038_*.md` (8) + `DEPLOYMENT_CHECKLIST_037_038.md` | Raiz | Migração 038 concluída; deploy atual em docs/devops |
| `ADR-006-PERIODO-CENTRALIZADO.md` | Raiz | ADRs oficiais em docs/architecture/project-decisions/ |
| `AJUSTES_MAPEADOS_E_ROADMAP.md`, `ENTREGA_FINAL_STAGING_READY.md`, `PLANO_EXECUCAO_ORQUESTRADO_360.md`, `SUMARIO_EXECUTIVO_AJUSTES.md` | Raiz | Entregas/sumários de período; estado atual em epics/stories |
| `.cursor/PLANO_IMPLEMENTACAO_AGENTES.md` e demais 7 .md | .cursor/ | Agentes em .aios-core; fluxo atual AIOS |
| `.agent/workflows/agent-selection-guide.md`, `orchestration-protocol.md`, `ui-ux-pro-max.md`, `supabase-ops/WORKFLOW.md` | .agent/workflows/ | Workflows ativos em .aios-core + workflow-execution.md |
| `.agent/merge-analysis/*` (4) | .agent/merge-analysis/ | Merge já executado |
| `.agent/pr-drafts/*`, `.agent/pr-final/*` (3) | .agent/ | PRs atuais via @devops e story lifecycle |
| `.agent/planning/phase-2-skills/*` (10 .md) | .agent/planning/phase-2-skills/ | Plano daquele ciclo; planos atuais em epics |
| `.agent/analysis/DEBUG_ESPAIDER_FLOW_2026-02-21.md`, `PLANO_CORRECAO_ESPAIDER.md` | .agent/analysis/ | Análise pontual já incorporada |
| `.agent/AIOS-REFACTOR-COMPLETO.md` | .agent/ | Refactor concluído; estado atual em .aios-core |

### Lote 2026-02 (itens 2–8 — candidatos alta probabilidade)

| Origem | Conteúdo | Substituído por / Motivo |
| ------ | -------- | ------------------------ |
| `.cursor/` | 15 .md (entregas, validações, glossário, padrões) | Quality gates, story lifecycle, docs/architecture, glossary em docs/prd |
| `docs/sprints/` | 25 .md (SPRINT-1, WAVE-4, 00–14, M026, KANBAN_REFACTOR, etc.) | DEVELOPMENT_ROADMAP, epics, docs/architecture |
| `docs/agents-refactor/` | FASE-4-UI-AVANCADA.md, STATUS_GERAL.md | .aios-core, AGENTS.md |
| `docs/plans/` | PLANO_UX_UI_FORNECEDORES_MODELOS_AGENTES.md | Epics, @aios-master |
| `docs/reports/`, `docs/audit/`, `docs/reviews/` | TECHNICAL-DEBT-REPORT, AUDIT-FINDINGS, RLS-AUDIT, db/qa/ux reviews | Brownfield, epic technical-debt, @security |
| `docs/prd/` | technical-debt-DRAFT.md, specs/SPRINT-2-VALIDATION-FILTER-* | PRD atual, Brownfield |
| `.agent/memory/` | 68 arquivos (logs por data, FASE-*, PROGRESSO, SPRINT-2, etc.) | Epics/stories, Brownfield; política de retenção |

### Lote 2026-02 (seção 10 — contexto fora AIOS)

| Origem | Conteúdo | Motivo |
| ------ | -------- | ------ |
| Raiz | DESENVOLVIMENTO_LOCAL.md | Guia local; padrão em docs/framework ou README |
| docs/agents-refactor/ | VALIDATION-AGENTS-CREATION.md, PHASE-2-PYTHON-API.md, PHASE-3-JWT-WIRING.md | Refactor concluído; .aios-core |
| docs/ | dashboards-cards.md | Doc solto sem epic/ADR |
| docs/sprints/ | 00-SUMMARY-FILTROS, 07-filter-data-context, SPRINT-1-AGENT-INSTRUCTIONS, SPRINT-1-QA-PLAN, 11-CODE-READY-SNIPPETS, SMOKE-TESTS-S1-4, SPRINT-2-PLANNING | Ciclos fechados |
| .cursor/ | rules.md | Fonte: .cursor/rules/*.mdc e project.mdc |
| design-system/gestao_usuarios/ | MASTER.md | Contexto fora de stories/epic |
| docs/qa/ | qa-gate-s1-1-s1-2-2026-02-22.md | Gate pontual |
| docs/devops/ | DEPLOY_WAIVER_2026-02-20.md | Waiver pontual |
| docs/architecture/ | MCP-CONFIGURATION-PLAN.md, db-audit.md, DB-AUDIT-brownfield.md, SCHEMA-brownfield.md, system-architecture-brownfield.md | Plano/audit consolidar em mcp-usage e project-decisions |
