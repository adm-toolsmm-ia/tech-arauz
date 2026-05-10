# AI & Agent Architecture — Orquestração, Personas, Fluxos (AIOX 10/10)

**Version:** 0.2.4 (EPIC 11 Complete — AI Context Engineering Ready)
**Last Updated:** 2026-03-16
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

## 11. AI Context Engineering (EPIC 11 — Organizational Enrichment)

**Status:** ✅ **COMPLETE** (Phase 2 — Story 11.14, Production Ready v0.2.4)

Tech Arauz integrates **AI context embeddings** with PostgreSQL **pgvector** for semantic knowledge retrieval, role context injection, and metrics-driven agent decisions. This section documents the complete AI context engineering pattern used by AIOX agents.

### 11.1 Architecture Overview

**Three-Layer AI Context System:**

```
Layer 1: Data Collection
├─ org_process_metrics (real-time metrics)
├─ org_process_slas (compliance targets)
├─ org_role_definitions (role metadata)
└─ org_activity_templates (reusable patterns)
  ↓
Layer 2: Context Transformation
├─ Role Context Injection
├─ Metrics Transformer
└─ Knowledge Base Retrieval (pgvector)
  ↓
Layer 3: Agent Decision-Making
├─ Process Analysis & Recommendations
├─ Capacity Planning
└─ Activity Planning with Role Assignment
```

**Data Freshness Requirements:**
- Metrics: < 1 hour old (auto-refresh if older)
- Role context: < 1 day old
- Knowledge base: updated on-demand
- SLA thresholds: < 1 hour old

**Runtime fallback note:** when the FastAPI AI service is unavailable, the Next.js chat route injects a tenant-scoped organizational snapshot via `src/lib/ai/organization-context.ts` and `buildAgentOrganizationContext()`. The snapshot is limited by design to recent areas, nuclei, processes, routines, and activities so the fallback stays safe and bounded.

---

### 11.2 Role Context Injection

**Purpose:** Enrich agent prompts with structured role metadata to improve assignment decisions.

**Data Sources:**

| Table | Fields | Use |
|-------|--------|-----|
| `org_role_definitions` | role_id, role_name, category, level | Role taxonomy |
| `org_activities` | responsible_roles (JSONB) | Role assignments |
| `org_processes` | responsible_roles (JSONB) | Process coverage |
| `org_process_metrics` | avg_duration_days, compliance_pct | Performance baseline |
| `org_role_permissions` | scope, conditions | Authorization rules |

**Example 1: Retrieve Role Context**

```typescript
// Server action: getRoleContextAction()
export async function getRoleContextAction(
  tenant_id: string,
  role_id: string
): Promise<RoleContext> {
  const supabase = await createClient();

  // Query all activities assigned to role
  const { data: activities } = await supabase
    .from('org_activities')
    .select('id, name, complexity, priority, responsible_roles')
    .contains('responsible_roles', [role_id])
    .eq('tenant_id', tenant_id);

  // Query all processes with this role
  const { data: processes } = await supabase
    .from('org_processes')
    .select('id, name, responsible_roles')
    .contains('responsible_roles', [role_id])
    .eq('tenant_id', tenant_id);

  // Get performance metrics
  const { data: metrics } = await supabase
    .from('org_process_metrics')
    .select('*')
    .eq('tenant_id', tenant_id)
    .order('period_end', { ascending: false })
    .limit(30);

  // Get role definition
  const { data: roleDef } = await supabase
    .from('org_role_definitions')
    .select('*')
    .eq('role_id', role_id)
    .single();

  return {
    role_id,
    role_name: roleDef?.role_name,
    category: roleDef?.category,
    activities_count: activities?.length || 0,
    processes_count: processes?.length || 0,
    avg_performance: calculateAvgPerformance(metrics),
    escalation_path: getEscalationPath(role_id),
    available_capacity: calculateCapacity(activities)
  };
}
```

**Example 2: Format Role Context for Prompt Injection**

```typescript
// Format as natural language for AI agent
function formatRoleContextForPrompt(roleContext: RoleContext): string {
  return `
# Role Context: ${roleContext.role_name}

**Scope:** ${roleContext.category} role | Hierarchy Level: ${roleContext.level}

**Responsibilities:**
- Assigned to ${roleContext.activities_count} activities across ${roleContext.processes_count} processes
- Average performance on metrics: ${(roleContext.avg_performance * 100).toFixed(1)}%
- Current capacity: ${roleContext.available_capacity}% utilized

**Escalation Chain:** ${roleContext.escalation_path.join(' → ')}

**Permissions:**
${roleContext.permissions.map(p => `- ${p.action} on ${p.resource_type}`).join('\n')}
`;
}
```

**Example 3: Inject into Agent Planning Prompt**

```typescript
// When planning an activity assignment
const roleContext = await getRoleContextAction(tenant_id, role_id);
const contextString = formatRoleContextForPrompt(roleContext);

const systemPrompt = `
You are an organizational activity planner. Recommend the best person for this task.

${contextString}

Consider their expertise, current workload, and quality history.
`;

// Use with Claude API for activity recommendations
const recommendation = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 512,
  system: systemPrompt,
  messages: [{
    role: 'user',
    content: 'Who should handle the legal review for this new contract?'
  }]
});
```

---

### 11.3 Process Metrics Transformer

**Purpose:** Convert raw metrics into agent-friendly natural language for process analysis.

**Available Metrics (from `org_process_metrics`):**

| Metric | Type | Range | Meaning |
|--------|------|-------|---------|
| `avg_duration_days` | Decimal | 0-1000 | Average process duration |
| `compliance_pct` | Decimal | 0-100 | % of cases meeting SLA |
| `instances_count` | Integer | 0-N | Cases in period |
| `period_start` / `period_end` | Date | - | Reporting period |

**Example 1: Query Process Metrics**

```typescript
// Get metrics for last 30 days
export async function getProcessMetricsAction(
  tenant_id: string,
  process_id: string,
  days: number = 30
): Promise<ProcessMetricsContext> {
  const supabase = await createClient();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: metrics } = await supabase
    .from('org_process_metrics')
    .select('*')
    .eq('tenant_id', tenant_id)
    .eq('process_id', process_id)
    .gte('period_start', startDate.toISOString().split('T')[0])
    .order('period_start', { ascending: true });

  // Calculate trends
  const trend = calculateTrend(metrics || []);
  const forecast = forecastMetrics(metrics || []);

  return {
    process_id,
    current_metrics: metrics?.[metrics.length - 1],
    historical_avg: calculateAverage(metrics),
    trend,
    forecast,
    anomalies: detectAnomalies(metrics)
  };
}
```

**Example 2: Transform Metrics to Prompt Context**

```typescript
// Convert metrics to natural language narrative
function transformMetricsForPrompt(metrics: ProcessMetricsContext): string {
  const curr = metrics.current_metrics;
  const avg = metrics.historical_avg;

  return `
# Process Performance Context

**Current Performance (Latest Period):**
- Average Duration: ${curr?.avg_duration_days?.toFixed(1)} days
- SLA Compliance: ${curr?.compliance_pct?.toFixed(1)}%
- Cases Processed: ${curr?.instances_count}

**30-Day Trend:**
- Duration: ${metrics.trend.duration > 0 ? '📈 Increasing (slower)' : '📉 Decreasing (faster)'}
- Compliance: ${metrics.trend.compliance > 0 ? '📈 Improving' : '📉 Declining'}
- Volume: ${metrics.trend.volume > 0 ? '📈 Growing' : '📉 Decreasing'}

**Baseline Comparison:**
- Avg Duration: ${avg?.avg_duration_days?.toFixed(1)} days vs current ${curr?.avg_duration_days?.toFixed(1)}
- Target: 30 days | ${curr && curr.avg_duration_days > 30 ? '⚠️ ABOVE' : '✓ WITHIN'} SLA

**Anomalies:** ${metrics.anomalies.length > 0 ? '⚠️ Detected' : '✓ None'}
${metrics.anomalies.map(a => `- ${a.description}`).join('\n')}
`;
}
```

**Example 3: Use Metrics in Analysis Prompt**

```typescript
// AI agent analyzes bottlenecks with metric context
const metricsContext = await getProcessMetricsAction(tenant_id, process_id, 30);
const metricsNarrative = transformMetricsForPrompt(metricsContext);

const analysisPrompt = `
${metricsNarrative}

# Task: Identify Top 3 Bottlenecks

Analyze the above metrics and recommend:
1. Root cause of each bottleneck (with metric evidence)
2. Specific action to fix (with implementation effort)
3. Expected impact on SLA compliance (quantified)
4. Risk of recommendation (schedule, quality, cost)

Format as JSON:
{
  "bottlenecks": [
    {
      "name": "string",
      "impact_pct": number,
      "root_cause": "string",
      "recommendation": "string",
      "effort": "low|medium|high",
      "expected_improvement_pct": number
    }
  ]
}
`;

const analysis = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  messages: [{ role: 'user', content: analysisPrompt }]
});
```

---

### 11.4 Knowledge Base Retrieval (pgvector Semantic Search)

**Purpose:** Retrieve contextually relevant best practices, templates, and case studies for agent decision-making.

**Architecture:**

```
Natural Language Query
  ↓
Generate Embedding (OpenAI API — dimension 1536)
  ↓
Cosine Similarity Search (pgvector IVFFlat index)
  ↓
Filter by threshold (default: 0.5)
  ↓
Rank by similarity score
  ↓
Return top-K entries
```

**Performance:**
- Embedding generation: ~500ms (client-side, cached)
- Vector similarity search: 30-100ms (database)
- Full pipeline: < 1 second

**Example 1: Semantic Search Query**

```typescript
export async function semanticSearchKnowledgeAction(
  tenant_id: string,
  query: string,
  limit: number = 5,
  threshold: number = 0.5
): Promise<KnowledgeEntry[]> {
  // 1. Generate embedding using OpenAI
  const queryEmbedding = await generateEmbedding(query);

  // 2. Vector similarity search via Supabase RPC
  const { data: results } = await supabase.rpc(
    'match_knowledge_entries',
    {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
      tenant_id
    }
  );

  return results || [];
}
```

**Example 2: Real-World Query Patterns**

```typescript
// Pattern 1: Process Bottleneck Resolution
const bottleneckGuidance = await semanticSearchKnowledgeAction(
  tenant_id,
  'how to optimize credit recovery process timeline',
  3,
  0.6  // Higher confidence threshold
);
// Returns: Best practices matching the optimization query

// Pattern 2: Role-Specific Training
const roleGuide = await semanticSearchKnowledgeAction(
  tenant_id,
  'paralegal responsibilities in contract review process',
  5
);
// Returns: Role guides, templates, case studies

// Pattern 3: Activity Template Discovery
const templates = await semanticSearchKnowledgeAction(
  tenant_id,
  'document preparation activity template',
  2
);
// Returns: Reusable activity templates
```

**Knowledge Entry Types:**

| Type | Use Case | Example |
|------|----------|---------|
| `process` | Understand workflow | "Credit Recovery Initial Filing Process Definition" |
| `best_practice` | Operational guidance | "Efficient paralegal document prep using templates" |
| `case_study` | Learn from examples | "Case #456: Achieved 30-day target with parallel review" |
| `template` | Reuse patterns | "Activity template: Legal document review (4h)" |
| `role_guide` | Onboarding | "Paralegal handbook: Initial filing responsibilities" |

---

### 11.5 Agent Personas Updated for EPIC 11 (AI Context)

Each AIOX agent now receives **AI context enrichment** for improved decision-making:

**@dev (Dex) — Implementation Expert**
- Context: Role assignments, activity templates, process metrics
- Use: Validate implementation against process SLA, use templates for consistency
- Example: When implementing activity, check `org_process_slas` to understand time constraints

**@architect (Aria) — Design Authority**
- Context: Process architecture, role hierarchies, integration patterns
- Use: Design systems that respect role responsibilities and escalation paths
- Example: Design decision on approval flow considers `org_role_permissions`

**@qa (Quinn) — Quality Validator**
- Context: Process SLA targets, quality baselines, role performance history
- Use: Set QA gates based on role capability and process metrics
- Example: QA acceptance criteria includes SLA compliance checks

**@pm (Morgan) — Product Manager**
- Context: Process metrics, capacity trends, SLA forecasts
- Use: Make roadmap decisions based on process bottlenecks and capacity
- Example: Recommend automation if `org_process_metrics` show compliance < 80%

**@data-engineer (Dara) — Database Specialist**
- Context: Schema relationships, role permissions, metrics tracking
- Use: Design queries and RLS policies respecting role hierarchy
- Example: Implement RLS policies on `org_activities` based on `org_role_permissions`

---

### 11.6 Prompt Engineering Best Practices

**Pattern 1: Process Optimization Analysis**

```
You are a business process consultant analyzing this process:

# Process Metrics (Last 30 Days)
${processMetricsContext}

# Involved Roles
${roleContexts.map(r => `- ${r.role_name}: ${r.activities_count} activities, ${r.avg_performance}% avg performance`).join('\n')}

# Relevant Knowledge Base
${knowledgeEntries.map(k => `- [${k.type}] ${k.title}`).join('\n')}

# Task
Identify 3 specific, actionable improvements to increase SLA compliance by 20%.

Requirements:
1. Each recommendation must have metric evidence
2. Include implementation effort (days)
3. Reference knowledge base entries
4. Consider role capacity constraints
5. Output as JSON for integration
```

**Pattern 2: Role Assignment Decision**

```
You are planning activities for process: ${processName}

# Available Roles
${roleContexts.map(r => `
- ${r.role_name} (${r.category})
  - Capacity: ${r.available_capacity}%
  - Performance: ${r.avg_performance}%
  - Expertise: ${r.activities_count} similar activities
  - Escalation: ${r.escalation_path.join(' → ')}
`).join('\n')}

# Activity to Assign
- Name: ${activityName}
- Complexity: ${complexity}
- Estimated Duration: ${duration} hours
- Quality Target: ${qualityTarget}%
- SLA: ${slaHours} hours

# Relevant Templates
${templates.map(t => `- ${t.name} (${t.complexity})`).join('\n')}

# Task
Recommend the best role assignment with rationale.

Consider:
1. Role expertise and performance history
2. Current capacity and workload
3. Escalation paths if assignment fails
4. Training needs if role is new
```

---

### 11.7 Real-World Example: Credit Recovery Optimization

**Scenario:** AI agent analyzes why credit recovery cases take 45 days vs. 30-day SLA target.

**Step 1: Gather Context**

```typescript
// Metrics context
const metrics = await getProcessMetricsAction(
  tenant_id,
  creditRecoveryProcessId,
  30  // Last 30 days
);

// Role context
const lawyerContext = await getRoleContextAction(tenant_id, 'advogado_senior');
const paralegalContext = await getRoleContextAction(tenant_id, 'paralegal');

// Knowledge base
const optimizationGuides = await semanticSearchKnowledgeAction(
  tenant_id,
  'credit recovery timeline optimization techniques',
  3
);
```

**Step 2: AI Analysis with Enriched Context**

```typescript
const analysisPrompt = `
Process Performance:
${transformMetricsForPrompt(metrics)}

Role Context:
${formatRoleContextForPrompt(lawyerContext)}
${formatRoleContextForPrompt(paralegalContext)}

Relevant Knowledge Base:
${optimizationGuides.map(g => `- ${g.title}`).join('\n')}

Task: Why are cases taking 45 days instead of 30? Recommend 3 improvements.
`;

const analysis = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  messages: [{ role: 'user', content: analysisPrompt }]
});
```

**Step 3: Expected Output**

```
## Bottleneck Analysis: Credit Recovery

### Bottleneck 1: Document Preparation (8h actual vs 4h SLA)
- **Evidence**: Metrics show avg_duration 8h, baseline 4h
- **Root Cause**: New paralegals not using templates
- **Recommendation**: Mandatory paralegal-prep-template usage
- **Impact**: Save 4 hours = 10% overall reduction
- **Effort**: 2 days (template training)

### Bottleneck 2: Legal Review Queue (6h wait)
- **Evidence**: Lawyer capacity at 95%, bottleneck
- **Root Cause**: advogado_senior overloaded
- **Recommendation**: Cross-train paralegal_senior for basic review
- **Impact**: Save 6 hours = 15% overall reduction
- **Effort**: 5 days (training) + ongoing supervision

### Combined Impact
- Current: 45 days (150% of SLA)
- With improvements: 30 days (100% of SLA) ✓
```

---

### 11.8 Integration with Agent System (AIOX)

**How agents activate AI context:**

```bash
# @architect activates with AI context enrichment
@architect *design-process {
  process_id: "process-123",
  enrich_with: ["metrics", "role_context", "knowledge_base"]
}

# @dev implements with template guidance
@dev *implement-activity {
  activity_id: "activity-456",
  template_guidance: true,
  validate_against_sla: true
}

# @qa validates with role-based criteria
@qa *qa-gate {
  story_id: "11.14",
  check_sla_compliance: true,
  validate_role_assignments: true
}
```

**Handoff Between Agents (with AI Context):**

```yaml
handoff:
  from_agent: architect
  to_agent: dev
  story_context:
    story_id: '11.14'
    task: 'Implement activity assignment logic'
  ai_context:
    metrics_context: org_process_metrics
    role_definitions: org_role_definitions
    templates: org_activity_templates
    sla_targets: org_process_slas
  decisions:
    - 'Use role context injection for assignment quality'
    - 'Validate implementations against process SLA'
    - 'Reference templates for consistency'
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
