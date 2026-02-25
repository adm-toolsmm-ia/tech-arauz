# Auditoria — Candidatos a deprecated e arquivos de exemplo

Análise dos itens solicitados: contexto, aplicabilidade AIOS e recomendação (manter / atualizar / arquivar / excluir).

---

## Tratado em 2026-02 (já executado)

| Item | Ação realizada |
|------|----------------|
| **temp_pptx** | Não existia no repositório; nada a excluir. |
| **design-system** (raiz) | Não existia; conteúdo já estava em _deprecated/design-system/. |
| **audit** (raiz) | Não existia; docs/audit já estava em _deprecated/docs/audit/. |
| **push_error3.txt** | Excluído (arquivo de log de push; não versionar). |
| **run-migration-038.cmd** | Excluído (migração 038 já tratada; uso atual: `npx supabase db push`). |
| **docs/agents-refactor** | Pasta vazia removida (conteúdo já em _deprecated/docs/agents-refactor/). |
| **.cursor/rules/*.md** (na raiz) | Removidos os .md de agente na raiz de `.cursor/rules/` (14 arquivos). Mantidos apenas `.cursor/rules/agents/*.md` (gerados por `sync:ide`) e os `.mdc` de governança. |

---

## Referência — Itens mantidos ou sem ação

### supabase/**/*.sql — Para que servem?

| Caminho / tipo | Função |
|----------------|--------|
| **supabase/migrations/NNN_*.sql** | Migrações oficiais do schema (001 a 038). Ordem numérica obrigatória. Aplicadas com `npx supabase db push`. **Manter** — fonte de verdade do DDL. |
| **supabase/seed.sql**, **seed_*.sql** | Dados iniciais ou específicos de desenvolvimento. |
| **supabase/fix_*.sql**, **cleanup_*.sql** | Scripts corretivos ou de limpeza (runbook). |
| **supabase/tests/*.sql** | Testes de smoke de migrations. |

Nenhum .sql deve ir para _deprecated como “exemplo”; migrations e seeds são ativos.

---

### scripts/ — Já não estão na AIOS?

**scripts/** é a pasta de automação do repositório (sync, git, DB), referenciada no `package.json`. **AIOS** usa `.aios-core/.../scripts` para `sync:ide`; **projeto** usa **scripts/** para operações do app/DB. **Manter scripts/.**

---

### docs/aguardando-analise

Não existe no repositório. Se for criada no futuro, definir se é fila de docs a revisar ou backlog em `docs/stories` / epic.

---

### docs/archive — Não deveria estar em _deprecated?

**Manter docs/archive/.** Archive = índice e listas de candidatos + auditorias (decisão e rastreabilidade). _deprecated = backup histórico não carregado por LLMs. Opcional: renomear para `docs/governance/archive`.

---

### docs/stories/STORY-00x — Não são stories antigas?

São stories **concluídas** mas ainda **referência de implementação** (file list, critérios). Padrão AIOS é trabalhar por stories em `docs/stories/`. **Manter**; não arquivar só por estarem fechadas.

---

### audit

Não existe pasta **audit** na raiz. **docs/audit/** já foi movida para _deprecated/docs/audit/. Novos relatórios podem ir para `docs/security/` ou `docs/audit/` se recriada.

---

### .cursor/rules — Padrão após limpeza

- **.cursor/rules/*.mdc** — Governança (project, agent-authority, workflow-execution, story-lifecycle, mcp-usage, devops-execution-safety, supabase). **Manter.**
- **.cursor/rules/agents/*.md** — Agentes AIOS gerados por `npm run sync:ide` a partir de `.aios-core/development/agents/`. **Única** camada de agentes; não editar manualmente.

---

### .agent/ARCHITECTURE.md — É necessária?

Documento que descreve a estrutura de `.agent/` e a relação com `.aios-core/` e _deprecated. **Manter** (ou mover conteúdo para `docs/framework/agent-runtime.md` e deixar README curto em `.agent/`).

---

*Auditoria gerada em 2026-02; itens tratados aplicados na mesma data. Revisar após mudanças em sync:ide ou estrutura Cursor.*
