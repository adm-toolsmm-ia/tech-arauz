# .agent/ — Runtime de AI Engineering

> **Versão:** 2.0 (pós-migração AIOS) | **Última atualização:** 2026-02-20

Este diretório é o **runtime da engenharia de AI** do projeto tech-arauz.  
Trabalha em conjunto com `.aios-core/` — **não é substituto**.

---

## 🏗️ Responsabilidade de cada pasta

```
.aios-core/          ← AGENTES (fonte de verdade — não editar aqui)
  └── development/
      └── agents/    ← Personas, comandos, permissões de cada agente

.agent/              ← RUNTIME (o que os LLMs usam para operar)
  ├── skills/        ← Conhecimento técnico que os LLMs leem antes de codar
  ├── workflows/     ← Slash commands (/dev, /qa, /mobile...)
  ├── memory/        ← Logs históricos de implementações
  ├── scripts/       ← Scripts de automação (checklist.py, verify_all.py)
  ├── templates/     ← Templates de documentação
  ├── rules/         ← Regras globais do projeto
  ├── planning/      ← Artefatos de planejamento
  └── mcp_config.json ← Configuração de MCP servers

_deprecated/         ← ARQUIVO HISTÓRICO (nunca carregue — apenas backup)
```

---

## 🤖 Agentes AIOS (fonte de verdade)

> 🚫 `.agent/agents/` foi **removida**. Todos os agentes vivem em `.aios-core/development/agents/`.

| Agente              | Slash               | Escopo                                                 |
| ------------------- | ------------------- | ------------------------------------------------------ |
| `@aios-master`      | `/aios-master`      | Orquestrador — ponto de entrada para tarefas complexas |
| `@dev`              | `/dev`              | Full stack, debug, APIs, refactoring                   |
| `@frontend`         | `/frontend`         | React, Next.js, Tailwind CSS                           |
| `@mobile`           | `/mobile`           | React Native, Expo — **app mobile portal tech-arauz**  |
| `@security`         | `/security`         | OWASP, RLS audit, vulnerabilidades                     |
| `@qa`               | `/qa`               | Testes, quality gates, E2E                             |
| `@devops`           | `/devops`           | **ÚNICO** autorizado para `git push`, CI/CD            |
| `@data-engineer`    | `/data-engineer`    | Supabase, RLS, schema, Espaider                        |
| `@architect`        | `/architect`        | Arquitetura técnica, ADRs                              |
| `@pm` / `@po`       | `/pm` `/po`         | Produto, backlog, stories                              |
| `@sm`               | `/sm`               | Scrum, sprint planning                                 |
| `@analyst`          | `/analyst`          | Pesquisa, brainstorming                                |
| `@ux-design-expert` | `/ux-design-expert` | UX, wireframes, design system                          |

---

## 🧠 Skills (168 arquivos)

Guias técnicos que os LLMs leem antes de implementar. Cada skill tem um `SKILL.md` como index.

| Domínio    | Skills principais                                                  |
| ---------- | ------------------------------------------------------------------ |
| Frontend   | `react-best-practices`, `tailwind-patterns`, `frontend-design`     |
| Mobile     | `mobile-design`                                                    |
| Backend    | `api-patterns`, `nodejs-best-practices`                            |
| Banco      | `supabase-rls-patterns`, `database-design`, `espaider-integration` |
| Segurança  | `vulnerability-scanner`, `red-team-tactics`                        |
| Testes     | `testing-patterns`, `tdd-workflow`, `webapp-testing`               |
| Deploy     | `deployment-procedures`                                            |
| Debug/Perf | `systematic-debugging`, `performance-profiling`                    |
| UX/Design  | `frontend-design`, `web-design-guidelines`, `mobile-design`        |

---

## ⚡ Workflows (Slash Commands)

Comandos que ativam agentes ou executam fluxos específicos.

| Comando                           | O que faz                                    |
| --------------------------------- | -------------------------------------------- |
| `/aios-master`                    | Ativa orquestrador AIOS                      |
| `/dev`, `/frontend`, `/mobile`... | Ativa agente especialista                    |
| `/orchestrate`                    | Modo orquestração multi-agente               |
| `/orchestration-protocol`         | Protocolo de 6 fases para demandas complexas |
| `/debug`                          | Debugging sistemático                        |
| `/sync`                           | Commit + push via `@devops`                  |
| `/preview`                        | Gerencia servidor de desenvolvimento local   |
| `/ui-ux-pro-max`                  | Design system inteligente com 50+ estilos    |
| `/memory-protocol`                | Registra memória de longo prazo              |

---

## 📜 Scripts de Automação

| Script               | Quando usar                       |
| -------------------- | --------------------------------- |
| `checklist.py`       | Auditoria de qualidade do projeto |
| `verify_all.py`      | Verificação completa pré-deploy   |
| `auto_preview.py`    | Start/stop servidor local         |
| `session_manager.py` | Gerenciamento de sessão           |

---

## 🔗 Dependências

| Runtime                | Depende de                                  |
| ---------------------- | ------------------------------------------- |
| `@[agente]` activation | `.aios-core/development/agents/[agente].md` |
| Skill loading          | `.agent/skills/[skill]/SKILL.md`            |
| Constitution           | `.aios-core/constitution.md`                |
| Memória histórica      | `.agent/memory/`                            |
