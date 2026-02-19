# CLAUDE.md - Instruções para Claude Code

> **Este projeto opera com dois sistemas de AI integrados: AIOS (processo) + Antigravity (contexto).**

---

## HIERARQUIA DOS SISTEMAS

```
┌─────────────────────────────────────────────────────────────────┐
│  AIOS (.aios-core/)           → PROCESSO & EXECUÇÃO            │
│  Stories, PRD, quality gates, tasks DB/DevOps, checklists      │
│  Ativação: @agente + *comando                                  │
├─────────────────────────────────────────────────────────────────┤
│  Antigravity (.agent/)        → PERSONAS & CONTEXTO TÉCNICO    │
│  Skills Espaider/RLS, memória histórica, protocolo 6 fases     │
│  Referência: .agent/agents/, .agent/skills/, .agent/workflows/ │
└─────────────────────────────────────────────────────────────────┘
```

---

## OBRIGATÓRIO

### 1. Story-Driven Development (AIOS)

**Todo desenvolvimento DEVE partir de uma story** em `docs/stories/`:
- Criar story antes de implementar (`@sm` ou manual)
- Atualizar checkboxes conforme progresso
- Manter File List atualizada na story
- Commits com referência: `feat: descrição [STORY-XXX]`

### 2. Usar Contexto Técnico do Antigravity

**Em TODA execução**, consulte quando relevante:
- **Skills**: `.agent/skills/` (espaider-integration, supabase-rls-patterns)
- **Memória**: `.agent/memory/` (logs de implementações anteriores)
- **Protocolos**: `.agent/workflows/orchestration-protocol.md` (6 fases)

### 3. Criar Memory Logs (Pós-Implementação)

**Após implementações significativas**, você DEVE:
1. Criar log em `.agent/memory/YYYY-MM-DD_{task-slug}.md`
2. Seguir template `.agent/memory/TEMPLATE.md`
3. Documentar: contexto, decisões, arquivos alterados, lições aprendidas

### 4. Decision Logging (AIOS)

**Decisões arquiteturais** vão em `.ai/` no formato ADR:
- Índice: `.ai/decision-logs-index.md`
- ADRs existentes: ADR-001 a ADR-004

---

## AGENTES AIOS (Sistema Principal)

Ativação: `@nome-do-agente` | Comandos: `*help`, `*comando`

| Agente | Persona | Quando Usar |
|--------|---------|-------------|
| `@aios-master` | Orchestrator | Coordenação multi-agente |
| `@pm` | Strategist | Criar PRD, epics, roadmap |
| `@sm` | Facilitator | Criar stories, sprint planning |
| `@architect` | Visionary | Arquitetura, design de API |
| `@data-engineer` | Sage | Schema DB, Supabase, RLS, migrations |
| `@dev` | Builder | Implementação, debugging, refactoring |
| `@qa` | Guardian | Testes, quality gates, security |
| `@devops` | Operator | Git push (ÚNICO autorizado), CI/CD |
| `@po` | Balancer | Backlog, priorização |
| `@analyst` | Decoder | Pesquisa, discovery, brainstorming |
| `@ux-design-expert` | Empathizer | UX, wireframes, design system |

### Modos de Desenvolvimento (@dev)

| Modo | Comando | Quando |
|------|---------|--------|
| YOLO | `*develop-yolo "Story X"` | Stories simples, bugs |
| Interactive | `*develop-story "Story X"` | Stories complexas (padrão) |
| Pre-Flight | `*develop-preflight "Story X"` | Features críticas |

---

## AGENTES ANTIGRAVITY (Contexto Técnico)

**Consultar para contexto do projeto** (não substituem AIOS para processo):

| Agente | Quando Preferir ao AIOS |
|--------|------------------------|
| `frontend-specialist` | UI com padrões específicos do projeto |
| `backend-specialist` | Integração Espaider (skill específica) |
| `database-architect` | Contexto de migrations existentes |
| `security-auditor` | RLS com padrões Supabase do projeto |
| `debugger` | Root cause analysis (tem contexto histórico em `.agent/memory/`) |

**Para matriz completa**: `.agent/workflows/agent-selection-guide.md`

---

## MAPEAMENTO: QUAL AGENTE USAR?

| Tarefa | Usar |
|--------|------|
| Nova feature (planejamento) | AIOS `@pm` + `@sm` |
| Banco de dados / Migrations | AIOS `@data-engineer` + tasks `db-*` |
| Frontend / UI | Antigravity `frontend-specialist` |
| Integração Espaider | Antigravity `backend-specialist` |
| Security / RLS | Ambos (AIOS `@qa` + Antigravity `security-auditor`) |
| Git / Deploy | AIOS `@devops` |
| Debugging | Antigravity `debugger` |
| Testes | AIOS `@qa` |
| Documentação | AIOS `@pm` ou `@architect` |

---

## REFERÊNCIAS

### Leitura Obrigatória

| Arquivo | Propósito |
|---------|-----------|
| `.context/00-MASTER.md` | Regras de negócio |
| `docs/framework/coding-standards.md` | Padrões de código |
| `docs/framework/tech-stack.md` | Stack tecnológica |
| `docs/framework/source-tree.md` | Mapa de pastas |
| `.ai/decision-logs-index.md` | Decisões arquiteturais (ADRs) |

### Leitura Contextual

| Arquivo | Propósito |
|---------|-----------|
| `.agent/ARCHITECTURE.md` | Sistema Antigravity (agentes, skills, workflows) |
| `.agent/workflows/orchestration-protocol.md` | Protocolo de 6 fases |
| `.agent/memory/` | Logs de implementações anteriores |
| `docs/stories/` | Stories de desenvolvimento |

---

## REGRAS DO PROJETO

### Supabase
- SEMPRE definir RLS policies ao criar tabelas
- SEMPRE incluir `USING (true) WITH CHECK (true)` em policies `FOR ALL`
- Usar `get_user_tenant_id()` e `get_user_role()`
- Migrations em `supabase/migrations/`

### Espaider
- API: `BI_SOLICITACOES_SUPORTEESPAIDER`
- Validar dados externos para null/undefined
- Logs em `integration_log_entries`
- UPSERT via `UNIQUE(tenant_id, espaider_id)`

### Código
- Imports absolutos com `@/`
- Named exports (não default)
- Tailwind utility-first + `cn()` helper
- Commits: `feat:`, `fix:`, `docs:` + `[STORY-XXX]`
