# CLAUDE.md - Instruções para Claude Code

> **Este projeto opera sob um sistema de governança de agentes em `.agent/`.**

---

## OBRIGATÓRIO

### 1. Usar Arquitetura e Rotinas de `.agent/`

**Em TODA execução**, você DEVE utilizar:

- **Protocolos**: `.agent/workflows/` (orchestration, memory, etc.)
- **Agentes Especialistas**: `.agent/agents/` (invocar conforme necessidade)
- **Skills**: `.agent/skills/` (conhecimento modular por domínio)

**Fluxo padrão** (`.agent/workflows/orchestration-protocol.md`):

```
Ingestion → Strategy → Execution → Validation → Documentation → Memory Commit
```

### 2. Criar Memory Logs (Pós-Implementação)

**Após implementações significativas**, você DEVE:

1. Criar log em `.agent/memory/YYYY-MM-DD_{task-slug}.md`
2. Seguir template `.agent/memory/TEMPLATE.md`
3. Documentar: contexto, decisões, arquivos alterados, lições aprendidas

**Isso garante rastreabilidade e contexto para sessões futuras.**

---

## REFERÊNCIAS

### Leitura Obrigatória (antes de implementar)

| Arquivo | Propósito |
|---------|-----------|
| `.agent/ARCHITECTURE.md` | Sistema de agentes, skills, workflows |
| `.agent/workflows/orchestration-protocol.md` | Fluxo do CTO (6 fases) |
| `.agent/workflows/agent-selection-guide.md` | Decision matrix e routing (qual agente usar?) |
| `.context/00-MASTER.md` | Regras de negócio |

### Leitura Opcional (quando necessário contexto histórico)

| Arquivo | Propósito |
|---------|-----------|
| `.agent/memory/` | Logs de implementações anteriores |
| `MEMORY.md` (em `.claude/projects/`) | Estado atual do projeto |

---

## AGENTES PRINCIPAIS (18 Aplicáveis)

**Para matriz completa de decisão e detalhes, consulte:** `.agent/workflows/agent-selection-guide.md`

### 🔴 TIER 1: Sempre Ativo
| Agente | Função |
|--------|--------|
| `orchestrator` | Maestro central, coordena todas as 6 fases |
| `explorer-agent` | Mapeamento inicial, descoberta arquitetural |

### 🟡 TIER 2: Desenvolvimento Core
| Agente | Função |
|--------|--------|
| `frontend-specialist` | React/Next.js, componentes, UI/UX |
| `backend-specialist` | APIs, lógica negócio, server actions, Espaider |
| `database-architect` | Supabase, schema, migrations, RLS |
| `security-auditor` | RLS, autenticação, validação (obrigatório Phase 4) |
| `debugger` | Root cause analysis, troubleshooting |

### 🟢 TIER 3: Especializado
| Agente | Função |
|--------|--------|
| `test-engineer` | Unit/integration tests, TDD, coverage |
| `qa-automation-engineer` | E2E tests (Playwright), CI pipelines |
| `performance-optimizer` | Web Vitals, profiling, bundle optimization |
| `devops-engineer` | CI/CD, deployment, infrastructure |
| `documentation-writer` | API docs, arquitetura, runbooks (obrigatório Phase 5) |
| `project-planner` | Feature scoping, discovery, planning |
| `product-manager` | User stories, requirements, prioritization |
| `code-archaeologist` | Refactoring, legacy code, modernization |
| `seo-specialist` | SEO, ranking, Core Web Vitals, meta tags |

---

## REGRAS DO PROJETO

### Supabase
- SEMPRE definir RLS policies ao criar tabelas
- Usar `get_user_tenant_id()` e `get_user_role()`
- Migrations em `supabase/migrations/`

### Espaider
- API: `BI_SOLICITACOES_SUPORTEESPAIDER`
- Validar dados externos para null/undefined
- Logs em `integration_log_entries`

---

## RESUMO

```
┌─────────────────────────────────────────────────────┐
│  OBRIGATÓRIO:                                       │
│  1. Seguir protocolos de .agent/workflows/          │
│  2. Usar agentes especialistas de .agent/agents/    │
│  3. Criar memory log após implementações            │
├─────────────────────────────────────────────────────┤
│  OPCIONAL:                                          │
│  - Ler .agent/memory/ para contexto histórico       │
└─────────────────────────────────────────────────────┘
```
