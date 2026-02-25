# Candidatos a _deprecated — Análise pela engenharia/arquitetura AIOS

Documento gerado após arquivamento dos itens das seções 2–8 e 10.  
Nova análise com base na **fonte de verdade AIOS** e em referências quebradas.

**Ver também:** [AUDITORIA-CANDIDATOS-DEPRECATED-2026-02.md](./AUDITORIA-CANDIDATOS-DEPRECATED-2026-02.md) — auditoria de temp_pptx, design-system, push_error, run-migration-038, supabase/*.sql, scripts/, docs/agents-refactor, docs/archive, STORY-00x, audit, .cursor/rules (.md vs .mdc), .agent/ARCHITECTURE.md.

---

## 1. Fonte de verdade AIOS (referência para a análise)

Conforme `.cursor/rules/project.mdc`, AGENTS.md e CLAUDE.md:

| Área | Fonte de verdade | Observação |
|------|-------------------|------------|
| Constituição / regras inegociáveis | `.aios-core/constitution.md` | Projeto pode não ter .aios-core no disco; regras refletidas em project.mdc |
| Agentes | `.aios-core/development/agents/` → sync para `.cursor/rules/agents/`, `.claude/commands/AIOS/agents/` | Não editar agents manualmente; `npm run sync:ide` |
| Proibido | Nunca carregar `_deprecated/` | Backup histórico |
| Arquivos de referência prioritários | project.mdc lista `.context/00-MASTER.md`, `.context/IMPLEMENTATIONS.md`, `.context/DEVELOPMENT_ROADMAP.md`, `.context/03-specs/adr/`, etc. | **Problema:** a pasta `.context/` **não existe** no repositório |
| Decisões de arquitetura | `docs/architecture/project-decisions/` (ADR-001 a ADR-005 runtime) + `docs/prd/specs/adr/` (2026-02-ADR-001 a 004 foundation) | Dois sistemas; decision-logs-index referencia `.context/03-specs/adr/` |
| Stories / epics | `docs/stories/` (epics, STORY-00x) | Ativo |
| Padrão Kanban/View Toggle | `docs/architecture/PADRAO-KANBAN-VIEW-TOGGLE.md` | Ativo |

Conclusão: várias referências oficiais apontam para `.context/`, que **não existe**. O conteúdo equivalente está em `docs/sprints/` (IMPLEMENTATIONS.md, DEVELOPMENT_ROADMAP.md) e em `docs/prd/` (specs, adr, foundation). Isso gera **referências quebradas** e **candidatos a atualização ou a deprecated**.

---

## 2. Candidatos a atualização de referência (não deprecated)

Arquivos que citam `.context/` e devem ser **atualizados** para o caminho real (evitar deprecated quando o conteúdo for válido).

| Caminho | O que fazer |
|---------|-------------|
| `.cursor/rules/project.mdc` | Trocar `.context/00-MASTER.md` → `docs/sprints/README.md` ou criar `docs/00-MASTER.md`; `.context/IMPLEMENTATIONS.md` → `docs/sprints/IMPLEMENTATIONS.md`; `.context/DEVELOPMENT_ROADMAP.md` → `docs/sprints/DEVELOPMENT_ROADMAP.md`; `.context/03-specs/adr/` → `docs/prd/specs/adr/`; `.context/03-specs/tokens_brand.json` e `component-patterns.md` → `docs/prd/specs/` ou `.context/` criado sob docs |
| `CLAUDE.md` | `.context/00-MASTER.md` → apontar para ponto de entrada real (ex.: docs/sprints/README ou docs/prd) |
| `.claude/project_instructions.md` | `.context/00-MASTER.md` → caminho real |
| `docs/architecture/project-decisions/decision-logs-index.md` | `.context/03-specs/adr/` → `docs/prd/specs/adr/` |
| `docs/sprints/IMPLEMENTATIONS.md` | Referências internas a `.context/` → ajustar para `docs/sprints/` ou `docs/prd/specs/` conforme o caso |
| `docs/framework/source-tree.md` | `.context/` → descrever estrutura real (docs/sprints, docs/prd) |
| `docs/architecture.md` | Links para `.context/01-foundation/`, `.context/02-rules/`, `.context/03-specs/` → `docs/prd/foundation/`, `docs/prd/rules/`, `docs/prd/specs/` |
| `docs/prd/specs/component-patterns.md` | `.context/03-specs/...` → `docs/prd/specs/...` |
| `docs/prd/specs/QUICK_REFERENCE.md` | `.context/...` → caminhos reais ou remover se arquivos não existirem |
| `docs/prd/specs/adr/README.md` | Menções `.context/` ↔ `.ai/` → alinhar a docs/prd e docs/architecture |
| `docs/stories/STORY-004-notas-projeto.md` | `.context/03-specs/...` → `docs/prd/specs/...` |
| `src/integrations/espaider/README.md` | `/.context/03-specs/...` → `/docs/prd/specs/...` |
| `services/ai/README.md` | `/.context/03-specs/...` → `/docs/prd/specs/...` |
| `docs/architecture/arvore-de-origem.md` | `.context/` → estrutura real |
| `.cursor/rules/supabase.mdc` | `IMPLEMENTATIONS.md` → `docs/sprints/IMPLEMENTATIONS.md` |
| `.agent/skills/supabase-mcp/SKILL.md` | `.context/` e `IMPLEMENTATIONS.md` → caminhos reais |

---

## 3. Candidatos a deprecated (arquivar em _deprecated)

Arquivos ou pastas que, na visão AIOS, estão **obsoletos**, **duplicados** ou **fora da árvore de referência** e podem ser movidos para `_deprecated/`.

### 3.1 docs/sprints/README.md

| Caminho | Motivo |
|---------|--------|
| `docs/sprints/README.md` | Descreve a pasta como “.context/ (Business Rules & Requirements)” e indica `00-MASTER.md` como ponto de entrada; `00-MASTER.md` foi arquivado. O README ficou inconsistente. **Opções:** (1) Reescrever o README para refletir apenas docs/sprints (IMPLEMENTATIONS, DEVELOPMENT_ROADMAP, índice de sprints) e remover menção a .context/ e 00-MASTER; (2) Arquivar e criar um README novo alinhado a AIOS. |

### 3.2 Duplicidade / possível consolidação

| Caminho | Motivo |
|---------|--------|
| `docs/architecture.md` (na raiz de docs/) | Arquivo de visão geral que repete links para “.context/” e estrutura antiga. Pode ser consolidado em `docs/architecture/README.md` ou em `docs/architecture/system-architecture.md` após atualizar links; depois, mover `docs/architecture.md` para _deprecated. |
| `docs/prd.md` | Página PRD que referencia `.context/02-rules/requirements.md`; equivalente em `docs/prd/rules/requirements.md`. Atualizar referência ou arquivar se redundante com docs/prd/ structure. |

### 3.3 Brownfield (não arquivar agora)

| Caminho | Motivo |
|---------|--------|
| `docs/brownfield/*` | Workflow de descoberta ativo. **Não** mover para _deprecated. Após conclusão das fases, artefatos pontuais (ex.: PHASE-1-COMPLETION, EXECUTIVE-SUMMARY por fase) podem ser candidatos. |

### 3.4 .agent/workflows/*.md (exceto os já preservados)

| Caminho | Motivo |
|---------|--------|
| `.agent/workflows/*.md` (um .md por agente) | Workflows ativos estão em `.aios-core/` e em `.claude/rules/workflow-execution.md`. Por decisão anterior, **não alterar** por enquanto; quando for válido, candidatos a arquivar com motivo “Substituído por .claude/commands/AIOS/agents e workflow-execution”. |

---

## 4. Resumo

| Ação | Quantidade / observação |
|------|--------------------------|
| **Atualizar referência** (.context/ → docs/sprints ou docs/prd) | ~15 arquivos listados na seção 2 |
| **Candidatos a deprecated** (seção 3) | 2–3 (docs/sprints/README.md, docs/architecture.md, eventualmente docs/prd.md após consolidar) |
| **Não arquivar** | docs/brownfield/*, .agent/workflows (até nova decisão) |

---

## 5. Próximos passos sugeridos

1. **Decisão de estrutura de “contexto”:** Definir se o projeto passa a usar `docs/sprints/` + `docs/prd/` como substituto oficial de `.context/` e atualizar project.mdc e CLAUDE.md de uma vez.
2. **Correção em lote:** Aplicar as atualizações da seção 2 (substituir `.context/` pelos caminhos reais).
3. **README docs/sprints:** Reescrever ou arquivar `docs/sprints/README.md` conforme opção escolhida em 3.1.
4. **Consolidar docs/architecture.md:** Integrar conteúdo em docs/architecture/ e arquivar `docs/architecture.md` na raiz de docs.
