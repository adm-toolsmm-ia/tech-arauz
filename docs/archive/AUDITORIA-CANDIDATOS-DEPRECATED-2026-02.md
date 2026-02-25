# Auditoria — Candidatos a deprecated e arquivos de exemplo

Análise dos itens solicitados: contexto, aplicabilidade AIOS e recomendação (manter / atualizar / arquivar / excluir).

---

## 1. Itens não encontrados ou já removidos

| Item | Situação |
|------|----------|
| **temp_pptx** | Não existe no repositório (0 arquivos). Se for pasta de export PPTX temporária, convém estar em `.gitignore` e não versionada. |
| **design-siste** | Não existe. Provável typo de **design-system**: a pasta `design-system/` na raiz não existe mais; apenas `_deprecated/design-system/gestao_usuarios/MASTER.md` (já arquivado). |

---

## 2. Arquivos de exemplo / temporários (candidatos a remover ou _deprecated)

### push_error3.txt (raiz)

| Campo | Conteúdo |
|-------|----------|
| **O que é** | Saída de erro de `git push` (GitHub push protection — secret scanning: Anthropic API Key em `scripts/claude.ps1`). |
| **Uso** | Debug pontual; não é artefato de projeto. |
| **Recomendação** | **Remover** (ou mover para `_deprecated/` se quiser guardar como histórico de incidente). Não versionar logs de erro. Ideal: garantir que `scripts/claude.ps1` não contenha secrets e adicionar `push_error*.txt` ao `.gitignore`. |

### run-migration-038.cmd (raiz)

| Campo | Conteúdo |
|-------|----------|
| **O que é** | Script batch que verifica estado e orienta aplicação da Migration 038 (seed curated models). |
| **Referências** | Cita `MIGRATION_038_README.md`, `MIGRATION_038_VALIDATION.md` e `038_*.sql` — os .md já estão em `_deprecated/`. |
| **Recomendação** | **Arquivar** em `_deprecated/run-migration-038.cmd`. Migração 038 já foi tratada; comando atual é `npx supabase db push` (e fluxo em `docs/devops` / supabase.mdc). |

---

## 3. supabase/**/*.sql — Para que servem?

| Caminho / tipo | Função |
|----------------|--------|
| **supabase/migrations/NNN_*.sql** | Migrações oficiais do schema (001 a 038). Ordem numérica obrigatória. Aplicadas com `npx supabase db push`. **Manter** — são a fonte de verdade do DDL. |
| **supabase/seed.sql** | Dados iniciais de desenvolvimento. |
| **supabase/seed_api_projetos.sql**, **seed_*.sql** (outros) | Seeds adicionais ou específicos. |
| **supabase/fix_espaider_api.sql**, **cleanup_sync_data.sql** | Scripts corretivos ou de limpeza; podem ser pontuais (rodados à mão ou por runbook). |
| **supabase/tests/test-smoke-m026-m027.sql** | Teste de smoke de migrations. |

**Recomendação:** Nenhum .sql do Supabase deve ir para _deprecated como “exemplo”. Migrations e seeds são ativos. Scripts de fix/cleanup: manter em `supabase/` ou documentar em runbook; se obsoletos, mover para `_deprecated/supabase/` com nome que deixe claro que não são mais executados.

---

## 4. scripts/ — Já não estão na AIOS?

| Campo | Conteúdo |
|-------|----------|
| **Conteúdo atual** | 15 arquivos: `sync.ps1`, `git-commit.ps1`, `git-push.ps1`, `git-pr.ps1`, `apply-migrations.ps1`, `trigger-sync.mjs`, `create-admin.mjs`, `test-sync.mjs`, `reset-and-sync.ts`, `reset-project-db.ts`, `check-schedules.ts`, `apply-schema.sql`, `audit-rls-tables.sql`, `RUN-MIGRATIONS-S1-4.sh`, `demo_observability.py`. |
| **Uso no projeto** | `package.json` chama explicitamente: `scripts/sync.ps1`, `scripts/git-commit.ps1`, `scripts/git-push.ps1`, `scripts/git-pr.ps1`, `scripts/apply-migrations.ps1`. Ou seja, **scripts/** é a pasta de automação do repositório (sync, git, DB). |
| **AIOS** | AGENTS.md cita "CLI entrypoints: `bin/`" — no repo não há arquivos em `bin/`. O sync de agentes é `npm run sync:ide` (script em `.aios-core/infrastructure/scripts/ide-sync/`). Ou seja: **AIOS** usa `.aios-core/.../scripts` para ide-sync; **projeto** usa **scripts/** para git, sync de dados e migrations. |
| **Recomendação** | **Manter scripts/** — não é duplicata da AIOS; é camada de automação do tech-arauz. Opcional: renomear ou documentar que `bin/` (AIOS) é para CLI de agentes e `scripts/` para operações do app/DB. |

---

## 5. docs/agents-refactor

| Campo | Conteúdo |
|-------|----------|
| **Situação** | Pasta **vazia** (0 arquivos). Conteúdo já foi movido para `_deprecated/docs/agents-refactor/` (FASE-4, STATUS_GERAL, VALIDATION-AGENTS-CREATION, PHASE-2, PHASE-3). |
| **Recomendação** | **Remover** a pasta vazia `docs/agents-refactor/` ou deixar um README mínimo tipo "Histórico em _deprecated/docs/agents-refactor". Preferível remover para evitar pasta órfã. |

---

## 6. docs/aguardando-analise

| Campo | Conteúdo |
|-------|----------|
| **Situação** | **Não existe** no repositório (nenhum arquivo/pasta com esse nome em `docs/`). |
| **Recomendação** | Nada a fazer. Se for criada no futuro, definir se é fila de docs a revisar ou candidata a virar backlog em `docs/stories` / epic. |

---

## 7. docs/archive — Não deveria estar em _deprecated?

| Campo | Conteúdo |
|-------|----------|
| **Conteúdo** | Apenas `CANDIDATOS-DEPRECATED-ALTA-PROBABILIDADE.md` (e esta auditoria). |
| **Função** | **Archive** = índice e listas de candidatos a deprecated + auditorias; ** _deprecated** = arquivos/pastas **efetivamente** descontinuados (backup histórico). |
| **Recomendação** | **Manter docs/archive/** como pasta de “metadocumentação” (o que arquivar, por quê, auditorias). Não mover para _deprecated: _deprecated não carregado por LLMs; archive deve continuar acessível para decisão e rastreabilidade. Se quiser, pode renomear para `docs/governance/archive` ou `docs/archive-deprecation` para deixar claro o propósito. |

---

## 8. docs/stories/STORY-00x — Não são stories antigas?

| Arquivo | Conteúdo | Conclusão |
|---------|----------|-----------|
| STORY-001-dashboard-interativo.md | Dashboard com KPIs, gráficos, drill-down; critérios [x] concluídos. | Story **concluída** mas ainda **referência de implementação** (file list, dev notes). Não é “obsoleta” no sentido de descontinuada. |
| STORY-002-project-cockpit-360.md | Cockpit 360°; provável conclusão. | Idem. |
| STORY-003-fix-sync-histories-approvers.md | Correção de sync. | Idem. |
| STORY-004-notas-projeto.md | Notas de projeto. | Idem. |

**Recomendação:** **Manter** em `docs/stories/`. São stories fechadas que servem como registro do que foi feito e de onde está no código. Padrão AIOS (project.mdc, story-lifecycle) é trabalhar por stories em `docs/stories/`; não arquivar só por estarem concluídas. Se no futuro houver política de “arquivar stories &gt; N sprints”, aí sim mover para `_deprecated/docs/stories/` ou `docs/archive/stories/`.

---

## 9. audit (??)

| Campo | Conteúdo |
|-------|----------|
| **Situação** | Não existe pasta **audit** na raiz. O que existia era **docs/audit/** (AUDIT-FINDINGS.md, RLS-AUDIT-REPORT-2026-02-22.md), já movido para ** _deprecated/docs/audit/**. |
| **Referências** | Há menções a “audit” em docs (RLS audit, security audit); fluxo atual é via @security e quality gates. |
| **Recomendação** | Nada a fazer na pasta audit (já arquivada). Novos relatórios de auditoria podem ir para `docs/security/` ou `docs/audit/` se recriada como pasta ativa. |

---

## 10. .cursor/rules — .md e .mdc: padrão AIOS e uso

### O que existe

- **.cursor/rules/*.mdc** (governança): `project.mdc`, `agent-authority.mdc`, `workflow-execution.mdc`, `story-lifecycle.mdc`, `mcp-usage.mdc`, `devops-execution-safety.mdc`, `supabase.mdc`.
- **.cursor/rules/*.md** (agentes na raiz de rules): `aios-master.md`, `architect.md`, `dev.md`, `qa.md`, `pm.md`, `po.md`, `sm.md`, `analyst.md`, `devops.md`, `data-engineer.md`, `ux-design-expert.md`, `squad-creator.md` (e variantes como `aios-orchestrator.md`, `aios-developer.md`, `github-devops.md`, `db-sage.md`).
- **.cursor/rules/agents/*.md**: mesmos agentes (aios-master, architect, dev, qa, …).

### O que o padrão AIOS diz

- **project.mdc:** "Agentes: `.cursor/rules/agents/` — **gerados via `npm run sync:ide`**. Não editar manualmente. Fonte: `.aios-core/development/agents/`."
- **ide-parity-cursor.md:** "Gerado: `.cursor/rules/agents/*.md`"; "Manual: project.mdc, agent-authority.mdc, workflow-execution.mdc, story-lifecycle.mdc, mcp-usage.mdc, supabase.mdc".

Conclusão: a **fonte de verdade** dos agentes é `.aios-core/development/agents/`; o sync gera em **`.cursor/rules/agents/`**. Os **.md na raiz de .cursor/rules/** (fora de `agents/`) **não** são gerados pelo sync atual; são resquício de quando os agentes ficavam só na raiz ou eram copiados em dois níveis.

### Onde está sendo utilizado

- Cursor carrega regras de `.cursor/rules/` (incluindo subpastas). Se existirem dois arquivos para o mesmo agente (ex.: `rules/dev.md` e `rules/agents/dev.md`), o Cursor pode carregar ambos ou um deles conforme configuração/ordem.
- O design intencional AIOS é **apenas** `agents/*.md` como agentes; o resto são .mdc de governança.

### Aplicabilidade e motivo da configuração

- **.mdc na raiz:** definem regras globais (projeto, autoridade, workflow, story, MCP, devops, supabase). **Manter.**
- **.md na raiz de rules/** (um por agente): duplicam `agents/*.md`. Aumentam ruído e risco de drift (alguém editar na raiz em vez de em .aios-core + sync).

**Recomendação:**  
- **Manter** apenas `.cursor/rules/agents/*.md` como agentes (gerados por `sync:ide`).  
- **Remover ou arquivar** os `.md` de agente que estão **na raiz** de `.cursor/rules/` (aios-master.md, dev.md, qa.md, architect.md, …), após confirmar que o Cursor (e qualquer outro consumidor) usa somente `agents/*.md`.  
- Se o sync ou a doc do Cursor indicar que “regras de agente” devem estar na raiz, então documentar isso e manter só uma das duas camadas (raiz ou agents/), não as duas.

---

## 11. .agent/ARCHITECTURE.md — É necessária?

| Campo | Conteúdo |
|-------|----------|
| **O que é** | Documento que descreve a estrutura de `.agent/` (skills, workflows, memory, scripts, templates, rules, planning) e a relação com `.aios-core/` e _deprecated. Lista agentes AIOS, skills por domínio, comandos de workflow. |
| **Uso** | Referência para quem opera o runtime de AI (onde estão skills, workflows, que agentes existem). |
| **Recomendação** | **Manter**. É o “README” do runtime .agent/ e complementa project.mdc. Opcional: mover para `docs/framework/agent-runtime.md` e deixar em `.agent/` um README.md curto que aponte para esse doc, para centralizar documentação em `docs/`. |

---

## 12. Resumo de ações sugeridas

| Item | Ação |
|------|------|
| temp_pptx | Inexistente; se criar, usar só local e .gitignore. |
| design-siste | Inexistente; design-system já em _deprecated. |
| push_error3.txt | Remover ou _deprecated; não versionar; checar secrets em scripts. |
| run-migration-038.cmd | Mover para _deprecated/run-migration-038.cmd. |
| supabase/*.sql | Manter; são migrations/seeds/scripts ativos. |
| scripts/ | Manter; automação do projeto, distinta do ide-sync da AIOS. |
| docs/agents-refactor | Remover pasta vazia (ou README mínimo). |
| docs/aguardando-analise | Inexistente. |
| docs/archive | Manter; não mover para _deprecated. |
| docs/stories/STORY-00x | Manter como referência de implementação. |
| audit | Já em _deprecated; nada a fazer. |
| .cursor/rules .md na raiz | Avaliar remoção/arquivamento dos .md de agente na raiz, mantendo só .cursor/rules/agents/*.md. |
| .agent/ARCHITECTURE.md | Manter (ou centralizar em docs/framework). |

---

*Auditoria gerada em 2026-02; revisar após mudanças em sync:ide ou estrutura Cursor.*
