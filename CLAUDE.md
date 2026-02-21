# CLAUDE.md — tech-arauz AI Engineering

> **Este projeto usa a arquitetura AIOS + Antigravity unificada.**
> Leia os arquivos abaixo antes de qualquer ação.
> ⚠️ **NUNCA carregue arquivos de `_deprecated/`** — backup histórico, fora de uso.

---

## 📐 Fonte de Verdade

| Documento                            | Caminho                                      | O que define                                     |
| ------------------------------------ | -------------------------------------------- | ------------------------------------------------ |
| Constituição (6 regras inegociáveis) | `.aios-core/constitution.md`                 | Regras que NUNCA podem ser quebradas             |
| Agentes AIOS                         | `.aios-core/development/agents/`             | Personas, comandos, permissões                   |
| Skills técnicas                      | `.agent/skills/`                             | Receitas de especialidade (React, RLS, OWASP...) |
| Protocolo de orquestração            | `.agent/workflows/orchestration-protocol.md` | Fluxo de 6 fases para demandas complexas         |
| Memória histórica                    | `.agent/memory/`                             | Logs de implementações anteriores                |
| Decisões arquiteturais               | `.ai/decision-logs-index.md`                 | ADRs (por que cada decisão foi tomada)           |

---

## 🤖 Fluxo Padrão de Atendimento

**Todo pedido passa pelo orquestrador primeiro.**

```
Você → @aios-master (analisa + monta equipe) → agentes especialistas → plano de ação conjunto
```

**Ativação:** `@nome-do-agente` ou `*comando`

| Agente              | Quando usar                                  |
| ------------------- | -------------------------------------------- |
| `@aios-master`      | Ponto de entrada padrão — orquestra a equipe |
| `@pm`               | PRD, epics, roadmap                          |
| `@sm`               | Stories, sprint planning                     |
| `@architect`        | Arquitetura, ADRs                            |
| `@data-engineer`    | Supabase, RLS, migrations, Espaider          |
| `@dev`              | Implementação, debug, APIs                   |
| `@frontend`         | React, Next.js, Tailwind                     |
| `@mobile`           | App mobile (React Native, Expo, iOS/Android) |
| `@qa`               | Testes, quality gates, E2E                   |
| `@security`         | OWASP, RLS audit, vulnerabilidades           |
| `@devops`           | **ÚNICO** autorizado para `git push`, CI/CD  |
| `@po`               | Backlog, priorização                         |
| `@analyst`          | Pesquisa, brainstorming, discovery           |
| `@ux-design-expert` | UX, wireframes, design system                |

---

## 📋 Regras do Projeto (Tech-Arauz Specific)

### Supabase
- SEMPRE definir RLS policies ao criar tabelas
- Usar `get_user_tenant_id()` e `get_user_role()`
- Migrations em `supabase/migrations/`

### Espaider
- API: `BI_SOLICITACOES_SUPORTEESPAIDER`
- Validar dados externos para null/undefined
- Logs em `integration_log_entries`
- UPSERT via `UNIQUE(tenant_id, espaider_id)`

### Código
- Imports absolutos com `@/` — nunca relativos (`../`)
- Named exports — nunca `export default`
- Tailwind utility-first + `cn()` helper
- Commits: `feat:`, `fix:`, `docs:` + `[STORY-XXX]`

### Leitura obrigatória antes de implementar
- `.context/00-MASTER.md` — regras de negócio
- `docs/framework/coding-standards.md` — padrões de código
- `docs/framework/tech-stack.md` — stack tecnológica
