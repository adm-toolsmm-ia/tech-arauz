# AI & Agent Architecture — Orquestração, Personas, Fluxos (AIOX 10/10)

**Version:** 0.2.3 (Production Live)
**Last Updated:** 2026-03-14
**Status:** Authoritative
**Framework:** Synkra AIOX v1.0.0

---

## Executive Summary

Tech Arauz is integrated with **Synkra AIOX v1.0.0**, a meta-framework for orchestrating AI agents across full-stack development. The framework manages:

- **10 specialized agents** with distinct personas and scopes
- **4 primary workflows** (Story Development Cycle, QA Loop, Spec Pipeline, Brownfield Discovery)
- **Constitutional gates** enforcing 6 non-negotiable principles
- **Task-first execution** — tasks are law; agents are executors
- **Memory & context management** — story context, decisions, blockers

| Component | Count | Status |
|-----------|-------|--------|
| **Agents** | 10 | All active |
| **Workflows** | 4 | All active |
| **Constitutional Principles** | 6 | Enforced |
| **Agent Commands** | 50+ | Available |
| **IDS Entity Registry** | ~200 entities | Active |

---

## 1. The 10 Agents (Personas)

Each agent has a distinct **archetype**, **core principles**, and **exclusive operations**.

### 1.1 Agent Registry

| # | Agent | ID | Persona | Archetype | Core Scope |
|---|-------|----|---------|-----------|----|
| 1 | **Dex** | @dev | Developer | Implementor | Code implementation, git commit, story updates |
| 2 | **Aria** | @architect | Architect | Designer | System architecture, technology selection |
| 3 | **Quinn** | @qa | QA Engineer | Validator | Quality gates, test strategy, issue triage |
| 4 | **Morgan** | @pm | Product Manager | Strategist | Epic orchestration, requirements, PRD writing |
| 5 | **Pax** | @po | Product Owner | Validator | Story validation (10-point checklist) |
| 6 | **River** | @sm | Scrum Master | Facilitator | Story creation, sprint coordination |
| 7 | **Alex** | @analyst | Data Analyst | Researcher | Market research, competitive analysis, data insights |
| 8 | **Dara** | @data-engineer | Database Engineer | Specialist | Schema design, query optimization, RLS policies |
| 9 | **Uma** | @ux-design-expert | UX/UI Designer | Specialist | UI/UX design, accessibility, design systems |
| 10 | **Gage** | @devops | DevOps Engineer | Operator | Git push, PR merge, CI/CD, releases (EXCLUSIVE) |
| 11 | **Orion** | @aiox-master | Orchestrator | Master | Framework development, agent coordination |

### 1.2 Agent Activation Syntax

**Two ways to activate agents:**

```bash
# Option 1: @ mention (context switching)
@dev *task implement-feature

# Option 2: Command alias (agent delegation)
/AIOX:agents:dev *implement-feature

# Option 3: Master orchestrator
@aiox-master *execute-epic
```

### 1.3 Example: Dex the Developer

**Persona:** Implementor — builds features with precision

**Role:** `Developer`

**Archetype:** `⚙️ Implementor`

**Core Principles:**
- Write clean, self-documenting code
- Follow existing patterns in codebase
- Include comprehensive error handling
- Add unit tests for all new functionality
- Use TypeScript/JavaScript best practices

**Exclusive Operations:**
- `git add`, `git commit` — commit code with conventional messages
- `git status`, `git diff` — inspect working tree
- `git branch`, `git checkout` — switch branches (local)
- Update story File List (mark tasks complete)
- Run tests: `npm test`, `npm run lint`

**Delegated Operations (NOT allowed):**
- ❌ `git push` → delegate to @devops
- ❌ `gh pr create/merge` → delegate to @devops
- ❌ Update story acceptance criteria (scope, title) → delegate to @po

**Typical Workflow:**

```
Story assigned to @dev
  ↓
  @dev reads story acceptance criteria
  ↓
  @dev writes code (following module-standards.md)
  ↓
  @dev runs: npm run lint + npm run typecheck + npm run test
  ↓
  @dev commits: git add + git commit (conventional message)
  ↓
  @dev updates story File List (mark tasks complete)
  ↓
  @dev requests code review from @qa OR @devops
  ↓
  @devops merges PR (exclusive operation)
```

---

## 2. Agent Memory & Context

### 2.1 Memory Layer

Each agent has access to a **persistent memory system** for:

- **Story context** — current task, acceptance criteria, progress
- **Key decisions** — ADRs, blockers, workarounds
- **Team knowledge** — patterns, conventions, lessons learned
- **Code intelligence** — dependencies, usages, impact analysis (IDS registry)

**Memory Structure:**

```
agents/
├── dev/MEMORY.md              # Dex's persistent memory
├── architect/MEMORY.md        # Aria's persistent memory
├── qa/MEMORY.md              # Quinn's persistent memory
└── ...

projects/{project}/memory/    # Project-specific context
├── ARCHITECTURE-DECISIONS.md
├── TEAM-PATTERNS.md
├── KNOWN-ISSUES.md
└── ...
```

### 2.2 Story Context Tracking

When a story is active, the agent remembers:

```yaml
story_context:
  story_id: "7.2"
  story_path: "docs/stories/epic-7-quick-wins-strategic-initiatives.md"
  story_status: "InProgress"
  current_task: "Implement KPI calculation logic"
  acceptance_criteria: [ ... ]
  file_list: [ ... modified files ... ]
  branch: "feature/dashboard-team-performance"
  blockers: [ ... ]
  decisions:
    - "Use Zustand for local state (not Redux)"
    - "Query limit: 50 items per page"
```

### 2.3 Handoff Protocol

When switching agents (e.g., @dev → @qa), the framework:

1. Compacts @dev's full definition (~5K tokens) into a **handoff artifact** (~379 tokens)
2. Preserves essential context: story ID, decisions, blockers, next action
3. Loads @qa's full definition
4. @qa continues from where @dev left off

**Purpose:** Prevent context bloat during multi-agent workflows (3+ agents = 60% context savings)

---

## 3. The 4 Primary Workflows

### 3.1 Story Development Cycle (SDC)

**The main workflow for all development work.**

**Phases:**

```
Phase 1: CREATE (@sm)
├─ Input: PRD, epic context
├─ Output: Draft story (10-point checklist)
├─ Status: Draft
│
Phase 2: VALIDATE (@po)
├─ Input: Draft story
├─ Decision: GO (≥7/10 checklist) or NO-GO (fixes required)
├─ Status: Ready
│
Phase 3: IMPLEMENT (@dev)
├─ Input: Acceptance criteria
├─ Modes: Interactive / YOLO / Pre-Flight
├─ CodeRabbit: Auto-healing (max 2 iterations)
├─ Status: InProgress → InReview
│
Phase 4: QA GATE (@qa)
├─ Input: Code + tests
├─ Decision: PASS / CONCERNS / FAIL / WAIVED
├─ Status: InReview → Done
```

**Example: Story 8.6 (Search Suggestions)**

```
@sm *draft
  → story-8.6.story.md (draft)

@po *validate-story-draft
  → ✅ GO (8/10) — ready for dev

@dev *develop-story
  → Implement search component
  → Run CodeRabbit
  → Commit code

@qa *qa-gate
  → ✅ PASS (all checks) → deployed v0.2.3
```

### 3.2 QA Loop (Iterative Review-Fix)

**Automated review-fix cycle for refining stories.**

**Loop:**

```
@qa review
  ↓
  verdict: APPROVE | REJECT | BLOCKED
  ↓
  IF REJECT:
    @dev fixes → re-review (max 5 iterations)
  ELIF BLOCKED:
    escalate to @aiox-master
  ELIF APPROVE:
    complete & mark Done
```

**Configuration:**
- Max iterations: 5
- Status file: `qa/loop-status.json`
- Verdicts: APPROVE, REJECT, BLOCKED

**Example:**

```
Iteration 1: @qa REJECT "Missing error handling on fetch"
  ↓
@dev adds try-catch, error boundary
  ↓
Iteration 2: @qa APPROVE "Ready for production"
```

### 3.3 Spec Pipeline (Pre-Implementation)

**Transform informal requirements into executable spec.**

**Phases:**

```
Phase 1: GATHER (@pm)
  ↓
Phase 2: ASSESS (@architect)
  ↓
Phase 3: RESEARCH (@analyst)   [conditional: STANDARD or COMPLEX]
  ↓
Phase 4: WRITE SPEC (@pm)
  ↓
Phase 5: CRITIQUE (@qa)
  ↓
Phase 6: PLAN (@architect)     [if APPROVED verdict]
```

**Complexity Classes:**

- **SIMPLE** (score ≤ 8) → 3 phases: gather → spec → critique
- **STANDARD** (score 9-15) → 6 phases (all)
- **COMPLEX** (score ≥ 16) → 6 phases + revision cycle

**Constitutional Gate (Article IV — No Invention):**
Every statement in spec.md must trace to:
- FR-* (functional requirement)
- NFR-* (non-functional requirement)
- CON-* (constraint)
- Research finding
- NO invented features allowed

### 3.4 Brownfield Discovery (Legacy Assessment)

**10-phase technical debt assessment for existing codebases.**

**Phases 1-3 (Data Collection):**
- @architect: System architecture analysis
- @data-engineer: Database audit
- @ux-design-expert: Frontend spec

**Phases 4-7 (Draft & Validation):**
- @architect: Draft technical debt report
- @data-engineer: DB specialist review
- @ux-design-expert: UX specialist review
- @qa: QA gate (APPROVED or NEEDS WORK)

**Phases 8-10 (Finalization):**
- @architect: Final technical debt assessment
- @analyst: Executive summary report
- @pm: Create EPIC + stories ready for development

---

## 4. Agent Authority & Exclusive Operations

### 4.1 Delegation Matrix (Summary)

| Agent | Exclusive Operations | Delegated From |
|-------|------|---------|
| **@devops** | `git push`, `gh pr create/merge`, CI/CD, releases | — |
| **@pm** | Epic orchestration, spec pipeline, PRD writing | — |
| **@po** | Story validation (10-point checklist) | — |
| **@sm** | Story creation from epic/PRD | — |
| **@architect** | System design, tech selection decisions | — |
| **@data-engineer** | Schema design, query optimization | @architect (delegated) |
| **@dev** | Code implementation, `git add/commit` | — |
| **@qa** | Quality gates, test strategy | — |
| **@analyst** | Research, brainstorming, data analysis | — |
| **@ux-design-expert** | UI/UX design, accessibility, design system | — |
| **@aiox-master** | Framework development, agent coordination | — |

### 4.2 Critical: @devops is EXCLUSIVE for Git Push

**ONLY @devops can push code to remote:**

```bash
# ❌ @dev CANNOT do this
git push origin feature-branch

# ✅ @devops MUST do this
git push origin feature-branch

# ✅ @dev prepares, @devops executes
@dev → commits locally
@devops → reviews + pushes
```

**Reason:** Enforce quality gates before code reaches main. @devops verifies all checks pass before pushing.

### 4.3 Cross-Agent Delegation Patterns

**Pattern 1: Schema Design**

```
@architect (high-level design)
  ↓
@data-engineer (detailed DDL, indexes, RLS)
  ↓
@dev (use schema in code)
```

**Pattern 2: Feature Story**

```
@sm (draft story)
  ↓
@po (validate)
  ↓
@dev (implement)
  ↓
@qa (gate)
  ↓
@devops (push + release)
```

**Pattern 3: Epic Execution**

```
@pm (orchestrate epic)
  ↓
@sm (create stories per epic)
  ↓
[SDC workflow repeats for each story]
```

---

## 5. Commands & Task Execution

### 5.1 Agent Commands (*command syntax)

All agent commands use `*` prefix:

```bash
# @sm (Scrum Master)
*draft                      # Draft new story
*create-story              # Create story from PRD

# @po (Product Owner)
*validate-story-draft      # Validate story (10-point checklist)
*validate-story            # Shorthand

# @dev (Developer)
*develop-story             # Implement story (interactive mode)
*task {name}              # Execute specific task

# @qa (QA)
*qa-gate                   # Quality gate (7-point checklist)
*qa-loop {story}          # Start iterative review-fix loop

# @architect (Architect)
*design-system            # Design system decisions
*technology-selection     # Tech stack recommendations

# @pm (Product Manager)
*create-epic              # Create epic orchestration
*execute-epic             # Execute epic (phase-by-phase)

# @aiox-master (Orchestrator)
*workflow {name}          # Start any workflow
*plan                     # Create workflow plan
*ids check {intent}       # Pre-check registry for REUSE/ADAPT/CREATE
```

### 5.2 Task Execution Flow

**Tasks are executable workflows** (YAML + steps):

```yaml
# Example: create-next-story task
task:
  name: create-next-story
  elicit: true             # Requires user interaction
  steps:
    - step: gather-context
      action: Read PRD + epic context
      input: epic_id

    - step: draft-story
      action: Generate story markdown
      input: |
        - Title
        - Acceptance criteria (5+ bullets)
        - File list
        - Effort estimate
      template: story-tmpl.yaml

    - step: save-story
      action: Write to docs/stories/
      output: story-{epic}.{num}.story.md

    - step: validate-checklist
      action: Run 10-point checklist
      gates: [title, ac, estimate, ...]
```

**Execution (Interactive):**

```
@sm *create-story
  ↓
System elicits: "Which epic? Enter epic ID"
  ↓
User: "7"
  ↓
System: "Creating story for EPIC 7..."
  ↓
[Gather context, draft, validate]
  ↓
System: "Story 7.3 created: docs/stories/story-7.3-*.md"
```

---

## 6. Constitutional Framework

### 6.1 The 6 Principles

| Article | Principle | Enforcement | Details |
|---------|-----------|------------|---------|
| **I** | CLI First | Task-based execution | All work via CLI tasks (not manual steps) |
| **II** | Agent Authority | Delegation matrix | Each agent has exclusive operations |
| **III** | Story-Driven | Lifecycle gates | All work ties to story + acceptance criteria |
| **IV** | No Invention | Spec gate | Specs must trace to FR/NFR/research |
| **V** | Quality First | Pre-push gate | Zero linting errors, all tests pass |
| **VI** | Absolute Imports | ESLint rule | Code uses `@/` not `../../../` |

### 6.2 Constitutional Gates

**Gate 1: CLI First**
- Task: Check all work is via `*commands` (not ad-hoc steps)
- When: Pre-merge to main
- Owner: @qa

**Gate 2: Agent Authority**
- Task: Verify delegation matrix respected (@devops push, etc)
- When: Code review (pre-merge)
- Owner: @qa

**Gate 3: Story-Driven**
- Task: Every commit references story ID
- When: Pre-commit (via git hook)
- Owner: Git hook

**Gate 4: No Invention**
- Task: Spec validation (all statements traceable)
- When: Spec pipeline Phase 5 critique
- Owner: @qa

**Gate 5: Quality First**
- Task: Pre-push gate (lint + typecheck + tests)
- When: Before `git commit`
- Owner: @dev

**Gate 6: Absolute Imports**
- Task: ESLint rule enforcement
- When: `npm run lint`
- Owner: ESLint

---

## 7. IDS (Incremental Development System)

### 7.1 Entity Registry

The **IDS Entity Registry** tracks:

- **Code artifacts** (components, hooks, services)
- **Documentation** (stories, ADRs, guides)
- **Data schemas** (tables, migrations)
- **Team members** (agents, roles, expertise)

**Metadata per entity:**

```yaml
entity:
  id: "comp-project-kanban-card"
  type: "component"
  name: "ProjectKanbanCard"
  owner: "@dev"
  category: "domain"
  created: "2026-02-15"
  status: "stable"
  usedBy: [  # Consumers
    "projetos-page",
    "cronogramas-page",
    "dashboard"
  ]
  dependencies: [  # What it uses
    "@radix-ui/react-dialog",
    "recharts",
    "zustand"
  ]
  codeIntelMetadata:
    imports: 45
    exports: 3
    LOC: 250
```

### 7.2 Pre-Check: REUSE/ADAPT/CREATE

**Before creating a new component, check IDS:**

```bash
@aiox-master *ids check "create kanban view for tasks"
```

**Response:**

```
REUSE: ProjectKanbanCard (existing)
  → Reuse for new feature

ADAPT: ProjectListView
  → Adapt column layout for tasks

CREATE: TaskKanbanView
  → No existing match, create new
```

### 7.3 Post-Create: Auto-Register

After creating new entity:

```bash
@dev *create ProjectKanbanCard
  ↓
[Code written, tested]
  ↓
System auto-registers in IDS:
  - Type: component
  - Owner: @dev
  - Category: domain
  - Status: stable
```

---

## 8. Memory & Handoff

### 8.1 Persistent Memory Layers

**L0: Project Memory** (shared by all agents)
```
project/memory/
├── ARCHITECTURE-DECISIONS.md
├── TEAM-PATTERNS.md
└── KNOWN-ISSUES.md
```

**L1: Agent Memory** (per-agent persistent)
```
agents/dev/MEMORY.md          # Dex's context
agents/architect/MEMORY.md    # Aria's context
```

**L2: Story Context** (during active story)
```
Current story:
  - Acceptance criteria
  - File list (modified files)
  - Blockers
  - Key decisions
```

### 8.2 Context Compaction on Agent Switch

**Example: 3-agent workflow**

```
@sm (draft story)             ← Persona: ~5K tokens
  ↓
  [Handoff artifact created]  ← Compact: ~379 tokens

@po (validate story)          ← Persona: ~5K tokens
  ↓
  [Handoff artifact created]  ← Compact: ~379 tokens

@dev (implement)              ← Persona: ~5K tokens
  ↓

Total context without handoff: 5+5+5 = 15K tokens
Total context with handoff: 5+379+379+5 = 763 tokens (95% savings)
```

---

## 9. Non-Invasive Design

The agent framework is **designed to evolve**:

- **New agents** can be added (new archetypes, new expertise)
- **New workflows** can be created (new phases, new gates)
- **New commands** can be added (*command_name)
- **Agent scopes** can shift (with delegation matrix update)
- **Constitutional principles** can be amended (but rarely)

**Principle:** Agents serve the project; project doesn't serve agents. Framework adapts to project needs.

---

## 10. Getting Started with Agents

### 10.1 For New Team Members

1. Read `.aiox-core/constitution.md` (6 principles, 2 min)
2. Read `docs/stories/EPIC-INDEX.md` (current work, 5 min)
3. Find assigned agent → read persona (10 min)
4. Read active story → understand acceptance criteria
5. Execute assigned command (`*develop-story`, `*qa-gate`, etc)

### 10.2 For Adding New Agents

1. Define new persona (archetype, principles, commands)
2. Create agent definition (YAML file in `.aiox-core/development/agents/`)
3. Add to delegation matrix (document exclusive operations)
4. Create MEMORY.md for persistent context
5. Add agent to workflow chains (where does it participate?)

---

## 11. AI Context Embeddings & Knowledge Retrieval (Story 11.11)

### 11.1 Semantic Search with pgvector

Tech Arauz integrates **OpenAI embeddings** with PostgreSQL **pgvector** for semantic knowledge retrieval:

**Architecture:**
```
Query (natural language)
  ↓
Generate embedding (OpenAI API)
  ↓
Vector similarity search (pgvector IVFFlat index)
  ↓
Retrieve top-K similar entries (similarity_score > 0.5)
  ↓
Return ranked knowledge entries
```

**Performance:**
- Embedding generation: ~500ms (cached)
- Vector similarity search: 30-100ms
- Full retrieval pipeline: < 1 second

### 11.2 Knowledge Entry Types

| Type | Purpose | Example |
|------|---------|---------|
| **process** | Process definitions & workflows | "Credit Recovery Initial Filing Process" |
| **best_practice** | Operational guidance | "How to efficiently interview clients" |
| **case_study** | Historical examples | "Case #123: Successful settlement in 45 days" |
| **template** | Reusable activity patterns | "Activity template: Legal document review" |
| **role_guide** | Role-specific documentation | "Paralegal responsibilities in judicial recovery" |

### 11.3 Server Action: Semantic Search

**From:** `src/app/actions/organization.ts`

```typescript
export async function semanticSearchKnowledgeAction(
  query: string,
  limit: number = 10,
  threshold: number = 0.5
): Promise<KnowledgeEntry[]> {
  const supabase = await createClient();

  // 1. Generate embedding for query using OpenAI
  const queryEmbedding = await generateEmbedding(query);

  // 2. Search using pgvector similarity (cosine distance)
  const results = await supabase.rpc(
    'match_knowledge_entries',
    {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit
    }
  );

  return results || [];
}
```

**Usage Pattern 1: Process Bottleneck Detection**

```typescript
// AI agent analyzes process metrics to find inefficiencies
const bottlenecks = await semanticSearchKnowledgeAction(
  'credit recovery process optimization techniques',
  3
);

// Returns top 3 knowledge entries with highest semantic similarity
// Example: ["Best practice: Parallel document processing", "Case study: 30-day achievement", ...]
```

**Usage Pattern 2: Role-Specific Guidance**

```typescript
// AI assists paralegal with task
const guidance = await semanticSearchKnowledgeAction(
  'paralegal document preparation checklist',
  5
);

// Agent uses entries to provide step-by-step instructions
```

### 11.4 AI Context Injection Pattern

**Build high-quality context for agent decisions:**

```typescript
async function buildHighQualityContext(entityId: string): Promise<AIContext> {
  // Check data freshness (< 1 hour old)
  const lastUpdate = await getLastUpdate(entityId);
  if (Date.now() - lastUpdate > 3600000) {
    await refreshMetrics(entityId);
  }

  // Gather context from multiple sources
  const context = {
    entity: await getEntity(entityId),
    metrics: await getMetrics(entityId),
    roles: await getInvolvedRoles(entityId),
    knowledge: await searchRelevantKnowledge(entityId),
    historical: await getHistoricalPatterns(entityId)
  };

  // Filter to relevant items only (< 4K tokens for optimal LLM performance)
  return pruneContextToSize(context, 4000);
}
```

### 11.5 Sample AI Prompt with Embeddings

**Process Optimization Scenario:**

```
You are a business process optimization consultant analyzing Tech Arauz processes.

# Process Context
${processMetrics}

# Organization Context
${organizationStructure}

# Role Context (Process Owner)
${roleContext}

# Relevant Knowledge Base (from semantic search)
${relevantKnowledge.map(k => `
- [${k.type}] ${k.title}
  ${k.content.substring(0, 200)}...
`).join('\n')}

Task: Identify the top 3 bottlenecks in this process with recommendations.

Your analysis should:
1. Identify bottlenecks with quantitative evidence
2. Reference relevant knowledge base entries
3. Calculate potential impact of removing each bottleneck
4. Suggest specific, actionable improvements
5. Prioritize by ROI (impact / effort)
```

### 11.6 Real-World Example: Credit Recovery Optimization

**Scenario:** AI agent analyzes why credit recovery cases take 45 days (actual) vs 30 days (SLA target).

**Knowledge retrieval:**
```typescript
const knowledge = await semanticSearchKnowledgeAction(
  'credit recovery timeline optimization',
  5
);
// Returns:
// 1. "Best practice: Document checklist for initial filing" (similarity: 0.89)
// 2. "Case study: 30-day case completion" (similarity: 0.87)
// 3. "Template: Paralegal document preparation" (similarity: 0.84)
```

**AI Analysis using injected knowledge:**
```
## Bottleneck Analysis: Credit Recovery Initial Filing

### Bottleneck 1: Document Preparation (8 hours actual vs 4 hours benchmark)
- **Evidence**: From knowledge base best practice
- **Root Cause**: New paralegals not using checklist template
- **Recommendation**: Mandatory template usage + training
- **Expected Impact**: -4 hours = 10% faster completion

### Bottleneck 2: Legal Review Queue (6 hours wait time)
- **Evidence**: Historical case data from knowledge base
- **Root Cause**: Single lawyer bottleneck
- **Recommendation**: Cross-train paralegal_senior or hire/promote
- **Expected Impact**: -6 hours = 15% faster completion

### Projected Impact
- Implementing all 3 recommendations: 30-day SLA achievable ✓
- Priority: Bottleneck 1 (high ROI, low effort)
```

---

## References

- **Constitution:** `.aiox-core/constitution.md`
- **Agent Authority Matrix:** `docs/architecture/AGENT-AUTHORITY-MATRIX.md`
- **Workflow Map:** `docs/architecture/AIOX-WORKFLOW-MAP.md`
- **Story Lifecycle:** `.claude/rules/story-lifecycle.md`
- **Agent Handoff:** `.claude/rules/agent-handoff.md`
- **AI-CONTEXT-ENGINEERING Guide:** `docs/guides/AI-CONTEXT-ENGINEERING.md`
- **Organization Schema:** `docs/architecture/ORGANIZATION-SCHEMA.md`

---

**Authored by:** Claude Code (Haiku 4.5) — AIOX Master Orchestrator
**Framework:** Synkra AIOX v1.0.0
**Last Reviewed:** 2026-03-16
**Next Review:** 2026-06-30 (quarterly)
