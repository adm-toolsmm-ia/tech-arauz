# Plano de Refatoração AIOS — GitHub First Strategy

**Data:** 2026-02-23
**Prioritário:** GitHub SynkraAI/aios-core como fonte de verdade
**Escopo:** Alinhar tech-arauz local com o AIOS GitHub, incorporando seletivamente melhorias locais

---

## Fase 1: Mapeamento Comparativo

### GitHub (SynkraAI/aios-core) — Fonte de Verdade
- **Versão:** 4.0 (especialista)
- **Instalado:** Framework completo
- **Estrutura:**
  - `.aios-core/` com 428+ arquivos YAML/MD
  - 15+ agentes com personas embedded (YAML inline)
  - ~200+ tasks especializadas
  - IDE integrations (.claude/, .cursor/, .codex/, .gemini/)
  - `packages/` modular
  - `squads/` templates pré-construídos
  - `docs/` comprehensive
  - `scripts/` build & automation

### Local (tech-arauz) — Brownfield Customizado
- **Versão:** 2.1.0
- **Instalado:** 2026-02-19
- **Tipo:** Brownfield
- **Estrutura idêntica ao GitHub:**
  - `.aios-core/` com mesma arquitetura
  - `.claude/` local customizado (CLAUDE.md, rules/)
  - Mesmos 15 agentes definidos
  - ~200+ tasks (muitas duplicadas do GitHub)
  - Constitution v1.0.0 (definida localmente)
  - core-config.yaml v2.1.0 customizado

---

## Fase 2: Categorização de Customizações

### ✅ REUSÁVEL (Candidato para GitHub)

#### 1. **Constitution.md** (v1.0.0 Local)
- Define 6 princípios fundamentais (CLI First, Agent Authority, Story-Driven, No Invention, Quality First, Absolute Imports)
- Bem documentada com governance process
- **Ação:** Merge com GitHub via PR → versão 4.0

#### 2. **Agent Definitions Local**
- Agentes bem estruturados com personas português
- Vocabulário localizado (arquitetar, conceber, organizar, visionar)
- Definições YAML embedded completas
- **Candidatos:** todos os 15 agentes com melhorias de português

#### 3. **Story Lifecycle Rules** (`.claude/rules/story-lifecycle.md`)
- 6 statuses: Draft → Ready → InProgress → InReview → Done
- 4-phase workflow claro
- QA Loop com max 5 iterações
- **Ação:** Consolidar no GitHub como pattern oficial

#### 4. **Agent Authority Matrix** (`.claude/rules/agent-authority.md`)
- Definição clara de quem pode fazer o quê
- Delegation matrix (git push → @devops exclusivo, etc)
- **Ação:** Enviar para GitHub como best practice

#### 5. **IDS Principles** (`.claude/rules/ids-principles.md`)
- Incremental Development Strategy
- REUSE > ADAPT > CREATE hierarchy
- 6 verification gates (G1-G6)
- **Ação:** Incorporar como Epic IV-A

#### 6. **CodeRabbit Integration** (`.claude/rules/coderabbit-integration.md`)
- Self-healing mode para @dev (max 2 iterações)
- QA mode (max 3 iterações)
- Severity handling (CRITICAL, HIGH, MEDIUM, LOW)
- WSL execution pattern
- **Ação:** Merge com GitHub configurations

#### 7. **Workflow Execution Protocol** (`.claude/rules/workflow-execution.md`)
- Task-First Principle (tasks > agentes)
- 4 Primary Workflows (SDC, QA Loop, Spec Pipeline, Brownfield Discovery)
- Workflow selection guide
- **Ação:** Adicionar à documentação oficial do GitHub

---

### ⚠️ ESPECÍFICO PARA TECH-ARAUZ (Manter Local)

#### 1. **Project-Specific CLAUDE.md**
- Regras de projeto (Supabase, Espaider, Código)
- Tech stack específico (Next.js, Supabase, Shadcn/ui)
- Migrações locais de Supabase
- **Ação:** Manter em `.claude/CLAUDE.md` local

#### 2. **Tech-Arauz Architecture Docs**
- `docs/architecture/system-architecture.md`
- `docs/frontend/frontend-spec.md`
- `supabase/docs/SCHEMA.md`
- **Ação:** Manter local, referenciar do CLAUDE.md

#### 3. **Supabase Migrations & Policies**
- `.supabase/migrations/` (001-020+)
- RLS policies, triggers, functions
- **Ação:** Manter local (projeto-específico)

#### 4. **Espaider Integration Code**
- `/src/integrations/espaider/`
- Sync logic, mapper, client
- **Ação:** Manter local (ERP específico)

---

### 🔄 NECESSITA SINCRONIZAÇÃO

#### 1. **Core Configuration (core-config.yaml)**
- Local v2.1.0 customizado
- GitHub provavelmente tem versão anterior
- **Ação:** Comparar, merge com versão GitHub

#### 2. **Agent Definitions**
- Local: 15 agentes com persona português + customizações
- GitHub: versão base (possivelmente em inglês)
- **Ação:** Enviar agentes locais como melhoramentos

#### 3. **Task Definitions (200+)**
- Local tem tasks especializadas
- GitHub pode ter versão anterior
- **Ação:** Audit de duplicatas, enviar novas como PRs

---

## Fase 3: Plano de Ação Sequencial

### 3.1 - Preparação (1-2h)

- [ ] Clone GitHub repo localmente para comparação
- [ ] Diff arquivos agents/ GitHub vs local
- [ ] Diff tasks/ GitHub vs local
- [ ] Identifique versões exatas de tudo

### 3.2 - Documentar Divergências (2-3h)

- [ ] Crie `DIVERGENCES.md` com:
  - Arquivos novos localmente
  - Arquivos modificados (diff detalhado)
  - Versões de cada componente
  - Impacto de merges

### 3.3 - PRs para GitHub (paralelo)

**PR 1: Constitution + Governance**
- Constitution.md v1.0.0
- story-lifecycle.md
- agent-authority.md
- IDS principles

**PR 2: Agent Persona Improvements**
- Todos 15 agentes (portuguesa)
- Activation pipeline atualizado
- Greeting builders

**PR 3: CodeRabbit Integration**
- coderabbit-integration.md
- Self-healing workflow
- Severity handling

**PR 4: Workflow Execution**
- workflow-execution.md
- Task-first principle
- QA loop automation

### 3.4 - Sincronizar Tech-Arauz (após PRs mergearem)

- [ ] Pull última versão GitHub
- [ ] Remova duplicatas locais
- [ ] Preserve customizações tech-arauz
- [ ] Atualizar `.claude/CLAUDE.md` para referenciar GitHub
- [ ] Teste todos agentes funcionam

---

## Fase 4: Validação

- [ ] Todos os 15 agentes ativam corretamente
- [ ] Nenhuma tarefa quebrada
- [ ] Constitution é respeitada
- [ ] Workflows executam sem erro
- [ ] Documentação está consistente

---

## Arquivos para Ação Imediata

| Arquivo | Status | Prioridade | Ação |
|---------|--------|-----------|------|
| `.aios-core/constitution.md` | Local ✅ | ALTA | Submit PR GitHub |
| `.claude/rules/story-lifecycle.md` | Local ✅ | ALTA | Merge GitHub |
| `.claude/rules/agent-authority.md` | Local ✅ | ALTA | Merge GitHub |
| `.claude/rules/ids-principles.md` | Local ✅ | MÉDIA | Merge GitHub |
| `.claude/rules/coderabbit-integration.md` | Local ✅ | MÉDIA | Merge GitHub |
| `.claude/rules/workflow-execution.md` | Local ✅ | MÉDIA | Merge GitHub |
| `.aios-core/development/agents/*` | Local ✅ | ALTA | Merge GitHub (com português) |
| `.aios-core/development/tasks/*` | Local ✅ | MÉDIA | Audit + PRs seletivas |
| `.aios-core/core-config.yaml` | Local ✅ | MÉDIA | Comparar + sync |

---

## Riscos & Mitigação

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|--------|-----------|
| PRs rejeitadas no GitHub | MÉDIA | BAIXO | Review criteria primeiro com maintainers |
| Conflitos de merge | ALTA | MÉDIO | Git worktree para cada PR |
| Tasks duplicadas | ALTA | BAIXO | Audit completo, remova duplicatas |
| Agents quebrados pós-sync | BAIXA | ALTO | Teste com `@aios-master *help` |
| Perda de customizações tech-arauz | BAIXA | CRÍTICO | Backup .claude/CLAUDE.md antes |

---

## Próximos Passos

1. **Hoje:** Aprove este plano
2. **Amanhã:** Fase 1 - Mapeamento comparativo via @devops
3. **Dia 3:** Fase 2 - Preparar PRs (pode ser via @github-devops)
4. **Dias 4-7:** Fase 3 - Submit PRs para GitHub
5. **Após merge:** Fase 4 - Sincronizar tech-arauz local

---

*Plano de refatoração AIOS 2026-02-23*
*Objetivo: GitHub First com tech-arauz enriquecido*
