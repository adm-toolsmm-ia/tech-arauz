# AGENTS.md — tech-arauz AI Engineering (Codex CLI)

> **Este projeto usa a arquitetura AIOS + Antigravity unificada.**
> ⚠️ **NUNCA carregue arquivos de `_deprecated/`** — backup histórico, fora de uso.

<!-- AIOS-MANAGED-START: core -->
## Core Rules

1. Siga a Constitution em `.aios-core/constitution.md`
2. Priorize `CLI First → Observability Second → UI Third`
3. Trabalhe por stories em `docs/stories/`
4. Não invente requisitos fora dos artefatos existentes
5. **Todo pedido complexo passa primeiro por `@aios-master`**
<!-- AIOS-MANAGED-END: core -->

<!-- AIOS-MANAGED-START: quality -->
## Quality Gates

- Rode `npm run lint`
- Rode `npm run typecheck`
- Rode `npm test`
- Atualize checklist e file list da story antes de concluir
<!-- AIOS-MANAGED-END: quality -->

<!-- AIOS-MANAGED-START: codebase -->
## Project Map

- Constituição: `.aios-core/constitution.md`
- Agentes: `.aios-core/development/agents/`
- Skills: `.agent/skills/`
- Protocolo de orquestração: `.agent/workflows/orchestration-protocol.md`
- Memória: `.agent/memory/`
- Stories: `docs/stories/`
<!-- AIOS-MANAGED-END: codebase -->

<!-- AIOS-MANAGED-START: commands -->
## Common Commands

- `npm run sync:ide`
- `npm run sync:ide:check`
- `npm run validate:structure`
- `npm run validate:agents`
<!-- AIOS-MANAGED-END: commands -->

<!-- AIOS-MANAGED-START: shortcuts -->
## Agent Shortcuts

**Fluxo padrão:** `@aios-master` → analisa → delega → agentes respondem → plano conjunto

Ative carregando o arquivo em `.aios-core/development/agents/`:

- `@aios-master`, `/aios-master` → `aios-master.md` — **Orquestrador (ponto de entrada padrão)**
- `@architect`, `/architect` → `architect.md`
- `@dev`, `/dev` → `dev.md`
- `@qa`, `/qa` → `qa.md`
- `@pm`, `/pm` → `pm.md`
- `@po`, `/po` → `po.md`
- `@sm`, `/sm` → `sm.md`
- `@analyst`, `/analyst` → `analyst.md`
- `@devops`, `/devops` → `devops.md`
- `@data-engineer`, `/data-engineer` → `data-engineer.md`
- `@ux-design-expert`, `/ux-design-expert` → `ux-design-expert.md`
- `@frontend`, `/frontend` → `frontend.md`
- `@mobile`, `/mobile` → `mobile.md` — **App mobile portal tech-arauz (futuro)**
- `@security`, `/security` → `security.md`
- `@squad-creator`, `/squad-creator` → `squad-creator.md`
<!-- AIOS-MANAGED-END: shortcuts -->
