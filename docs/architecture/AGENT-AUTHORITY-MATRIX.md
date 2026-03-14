# Agent Authority Matrix — Exclusive Operations & Delegations (AIOX 10/10)

**Version:** 0.2.3 (Production Live)
**Last Updated:** 2026-03-14
**Status:** Authoritative — binding on all development
**Framework:** Synkra AIOX v1.0.0

---

## Purpose

This document defines **who can do what** in the development process. It prevents ambiguity, ensures accountability, and protects critical operations (like git push) with proper authorization.

**Key Principle:** Each agent has **exclusive operations** (only they can do it) and **delegated operations** (they delegate to other agents).

---

## 1. Exclusive Operations Summary

### 1.1 The 3 Exclusive Operations

| Operation | Exclusive Agent | Why | Delegation |
|-----------|-----------------|-----|-----------|
| **`git push`** | @devops | Quality gate enforcement | Any agent → @devops |
| **`gh pr create/merge`** | @devops | Code review gate | Any agent → @devops |
| **`*create-epic` / `*execute-epic`** | @pm | Requirements authority | @sm, @po, @dev cannot create epics |

### 1.2 Why Exclusive?

**@devops git push:**
- Prevents code reaching main without quality gate
- Enforces: lint ✅ + typecheck ✅ + tests ✅ + CodeRabbit ✅
- Single point of accountability (can audit all pushes)

**@devops gh pr create/merge:**
- Code review requires @qa approval before merge
- Prevents accidental merges of incomplete work
- All PRs must be traceable to story ID

**@pm *create-epic:**
- Ensures epics align with business strategy
- No developer can unilaterally create new epics
- Product decisions centralized

---

## 2. Full Delegation Matrix

### 2.1 @devops (Gage) — The Operator

| Operation | Exclusive? | Who Else? | Notes |
|-----------|-----------|----------|-------|
| `git push` | ✅ YES | BLOCKED | Only @devops can push |
| `git push --force` | ✅ YES | BLOCKED | Dangerous; only @devops with review |
| `gh pr create` | ✅ YES | BLOCKED | Code review gate |
| `gh pr merge` | ✅ YES | BLOCKED | Merge gate |
| `gh pr review` | ✅ YES | BLOCKED | Final approval authority |
| MCP add/remove | ✅ YES | BLOCKED | Infrastructure governance |
| CI/CD pipeline management | ✅ YES | BLOCKED | Deploy gates |
| Release management | ✅ YES | BLOCKED | Version tags, notes, deployments |
| Environment variable setup | ✅ YES | BLOCKED | Secrets governance |
| Database backup/restore | ✅ YES | BLOCKED | Disaster recovery |

**Delegation Pattern:**
```
@dev: "I'm ready to push"
  ↓
@devops *push  # @devops reviews + pushes
  ↓
Code on main (with guarantee of quality gates)
```

**@devops Responsibilities:**
- Verify pre-push gate: `npm run lint && npm run typecheck && npm run test`
- Verify CodeRabbit: no critical issues
- Verify story ID in commit message
- Merge to main
- Tag release (if release push)
- Deploy to production

---

### 2.2 @pm (Morgan) — The Strategist

| Operation | Exclusive? | Delegated From | Notes |
|-----------|-----------|---------|-------|
| `*create-epic` | ✅ YES | — | Only @pm creates epics |
| `*execute-epic` | ✅ YES | — | Epic orchestration, phasing |
| EPIC-{ID}-EXECUTION.yaml management | ✅ YES | — | Manages execution workflow |
| Requirements gathering | ✅ YES | — | Collects FR/NFR/CON |
| Spec writing (Spec Pipeline Phase 4) | ✅ YES | — | Writes formal spec.md |
| Backlog prioritization | ✅ YES | — | Orders work by value |

**Delegation Pattern:**
```
@pm *create-epic "Dashboard Team Performance Phase 2"
  ↓
EPIC-7 created with 5 stories
  ↓
@sm *draft-story (creates individual stories from epic)
  ↓
@po *validate-story-draft (validates each story)
  ↓
@dev *develop-story (implements each story)
```

**@pm Responsibilities:**
- Define epic scope, acceptance criteria, success metrics
- Gather requirements from stakeholders
- Create PRD (Product Requirement Document)
- Orchestrate multi-story epics
- Communicate status to leadership
- Make business priority decisions

---

### 2.3 @po (Pax) — The Validator

| Operation | Exclusive? | Details |
|-----------|-----------|---------|
| `*validate-story-draft` | ✅ YES | 10-point checklist validation |
| Story context tracking | ✅ YES | Maintains epic-to-story links |
| Epic context management | ✅ YES | Tracks story dependencies |
| Story approval (GO/NO-GO) | ✅ YES | Can block stories from dev |

**10-Point Story Validation Checklist:**

```
[ ] Title is clear and actionable
[ ] Acceptance criteria ≥5 bullets, specific
[ ] Effort estimate (hours) provided
[ ] File list (affected files) identified
[ ] Dependencies on other stories listed
[ ] Non-functional requirements included
[ ] User story format correct
[ ] Acceptance criteria are testable
[ ] Edge cases considered
[ ] Accessibility requirements (WCAG AA) included
```

**Validation Result:**
- **GO** (≥7/10) → Story ready for @dev
- **NO-GO** (<7/10) → Return to @sm with fixes required

**@po Responsibilities:**
- Validate story quality (checklist)
- Identify story dependencies
- Block low-quality stories (protect @dev time)
- Maintain context of epic vision
- Escalate scope changes (prevent scope creep)

---

### 2.4 @sm (River) — The Facilitator

| Operation | Exclusive? | From | Notes |
|-----------|-----------|------|-------|
| `*draft-story` / `*create-story` | ✅ YES | EPIC or PRD | Only @sm creates stories |
| Story template selection | ✅ YES | — | Chooses correct template |
| Sprint planning | ❌ NO | Shared with @pm | Coordinate story prioritization |

**Story Creation Flow:**

```
@pm: "Create story 7.2 for dashboard team performance"
  ↓
@sm *create-story EPIC-7
  ↓
[Elicitation: Title, AC, estimate, files]
  ↓
story-7.2.story.md created (Draft status)
  ↓
@po *validate-story-draft
  ↓
Story → Ready status
```

**@sm Responsibilities:**
- Create story from epic/PRD guidance
- Use correct story template
- Define acceptance criteria (testable)
- Estimate effort (hours)
- Identify impacted files
- Link to epic context

---

### 2.5 @dev (Dex) — The Implementor

| Operation | Allowed | Blocked | Notes |
|-----------|---------|---------|-------|
| `git add` | ✅ YES | — | Stage files |
| `git commit` | ✅ YES | — | Commit with message |
| `git status` | ✅ YES | — | Inspect working tree |
| `git diff` | ✅ YES | — | View changes |
| `git branch` | ✅ YES | — | Create/list branches (local) |
| `git checkout` | ✅ YES | — | Switch branches |
| `git merge` (local) | ✅ YES | — | Merge branches locally |
| `git stash` | ✅ YES | — | Save work in progress |
| `npm run lint` | ✅ YES | — | Check code style |
| `npm run typecheck` | ✅ YES | — | Check types |
| `npm run test` | ✅ YES | — | Run tests |
| Update story File List | ✅ YES | — | Mark tasks complete |
| Update story **Acceptance Criteria** | ❌ NO | @po | Cannot change scope |
| `git push` | ❌ NO | @devops | Delegate to devops |
| `gh pr create` | ❌ NO | @devops | Delegate to devops |
| `gh pr merge` | ❌ NO | @devops | Delegate to devops |

**Development Workflow:**

```
@dev *develop-story {story-id}
  ↓
[Read story + AC]
  ↓
[Create feature branch]
  ↓
[Write code following module-standards.md]
  ↓
[Run: npm run lint + npm run typecheck + npm run test]
  ↓
[git add + git commit "feat: ... [Story X.Y]"]
  ↓
[Update story File List - mark tasks complete]
  ↓
[Request code review from @qa]
  ↓
@qa *qa-gate
  ↓
@devops *push (if PASS)
```

**@dev Responsibilities:**
- Implement story acceptance criteria precisely
- Follow code standards (module-standards.md)
- Write self-documenting code
- Add unit tests (≥85% coverage)
- Run pre-push gate (lint + typecheck + test)
- Update story progress (File List)
- Commit with conventional message + story ID

**@dev Constraints:**
- Cannot push to remote (→ @devops)
- Cannot create/merge PRs (→ @devops)
- Cannot change story scope/acceptance criteria (→ @po)
- Cannot update story title (→ @po)

---

### 2.6 @qa (Quinn) — The Validator

| Operation | Exclusive? | Delegated From | Notes |
|-----------|-----------|---------|-------|
| `*qa-gate` | ✅ YES | @dev | 7-point quality checklist |
| `*qa-loop` | ✅ YES | @dev | Iterative review-fix (max 5) |
| Test strategy | ✅ YES | @architect | Defines test coverage targets |
| CodeRabbit interpretation | ✅ YES | — | Makes sense of auto-review |
| Issue triage | ✅ YES | — | Categorizes bugs (critical/high/medium/low) |

**7-Point QA Gate Checklist:**

```
[ ] Code passes lint (npm run lint)
[ ] Code passes typecheck (npm run typecheck)
[ ] All tests pass (npm run test ≥85% coverage)
[ ] No hardcoded values (credentials, URLs)
[ ] Error handling comprehensive (try/catch, edge cases)
[ ] Accessibility (WCAG AA): semantic HTML, ARIA, keyboard nav
[ ] Documentation: comments on complex logic, README updated
```

**QA Gate Result:**
- **PASS** → Approve for @devops merge
- **CONCERNS** → Mark specific issues for @dev to fix
- **FAIL** → Reject; stop progress; escalate
- **WAIVED** → Skip check with justification (rare)

**QA Loop:**

```
@dev code → @qa review
  ↓
  VERDICT = REJECT ("Missing error handling")
  ↓
  @dev fixes
  ↓
  @qa re-review (iteration 2)
  ↓
  VERDICT = APPROVE
  ↓
  @devops merges
```

**@qa Responsibilities:**
- Execute quality gate checklist
- Make pass/fail decision
- If FAIL: specify issues for @dev to fix
- Run CodeRabbit (auto-review)
- Manage QA loop (iterative fixes)
- Escalate critical issues to @architect/@pm

---

### 2.7 @architect (Aria) — The Designer

| Operation | Exclusive? | Delegated To | Notes |
|-----------|-----------|---------|-------|
| System architecture decisions | ✅ YES | — | Technology selection, patterns |
| Technology selection | ✅ YES | — | Framework, library, database choices |
| High-level data architecture | ✅ YES | @data-engineer | @dara implements detailed DDL |
| Integration patterns | ✅ YES | @data-engineer | @dara optimizes queries |
| Complexity assessment | ✅ YES | — | Rates story complexity (simple/standard/complex) |
| ADR creation | ✅ YES | — | Documents architectural decisions |

**Delegations from @architect:**

```
@architect (decides: "Use PostgreSQL + RLS")
  ↓
@data-engineer (implements: schema, indexes, RLS policies)
  ↓
@dev (uses: via Supabase client)
```

**@architect Responsibilities:**
- Make high-level tech decisions
- Create ADRs (Architectural Decision Records)
- Review complex stories (assess architectural impact)
- Define integration patterns (how components talk)
- Mentor @dev on architecture questions
- Own system-wide non-functional requirements

---

### 2.8 @data-engineer (Dara) — The Database Specialist

| Operation | Delegated From | Authority | Notes |
|-----------|---------|-----------|-------|
| Schema design (detailed DDL) | @architect | Owns | Creates tables, columns, constraints |
| Query optimization | @architect | Owns | Indexes, query plans, performance |
| RLS policy implementation | @architect | Owns | Row-level security enforcement |
| Index strategy | @architect | Owns | B-tree, composite, partial indexes |
| Migration planning | @architect | Owns | Versioning, backwards compatibility |
| Database testing (pgTAP) | @architect | Owns | RLS validation, data integrity |

**Delegation Pattern:**

```
@architect: "Need multi-tenant isolation with RLS"
  ↓
@data-engineer:
  1. Design schema (tenants, users, projects, tasks, etc)
  2. Define RLS policies (tenant_id filtering)
  3. Create migration SQL
  4. Write pgTAP tests
  5. Optimize indexes
  ↓
@dev: "Uses via Supabase client"
```

**@data-engineer Responsibilities:**
- Own database design (schema, constraints, relationships)
- Implement RLS policies (multi-tenant isolation)
- Write migrations (versioned, non-breaking)
- Create tests for RLS (pgTAP)
- Optimize queries (indexes, execution plans)
- Monitor performance (query logs, slow query detection)

---

### 2.9 @analyst (Alex) — The Researcher

| Operation | Exclusive? | Owner | Notes |
|-----------|-----------|-------|-------|
| Market research | ✅ YES | — | Competitive analysis, trends |
| Brainstorming facilitation | ✅ YES | — | Ideation sessions |
| Data analysis | ✅ YES | — | Usage patterns, KPI interpretation |
| Requirement research | ✅ YES | @pm | Gathers FR/NFR/CON for spec |

**Research Workflow (Spec Pipeline):**

```
@pm: "Research dashboard analytics competitors"
  ↓
@analyst *brainstorm (or *research)
  ↓
[Competitive analysis: Tableau, Metabase, Grafana]
  ↓
research.json output
  ↓
@pm: Uses research to write spec.md
```

**@analyst Responsibilities:**
- Conduct market research (competitors, trends)
- Analyze user data (usage patterns, pain points)
- Facilitate brainstorming sessions
- Produce research findings document
- Support spec pipeline Phase 3
- Generate insights for product decisions

---

### 2.10 @ux-design-expert (Uma) — The Designer

| Operation | Exclusive? | Authority | Notes |
|-----------|-----------|-----------|-------|
| UI/UX design | ✅ YES | — | Figma wireframes, prototypes |
| Accessibility standards (WCAG AA) | ✅ YES | — | Sets a11y requirements |
| Design system governance | ✅ YES | — | Design tokens, components, patterns |
| Design-to-code handoff | ✅ YES | — | Defines component API, behavior |

**Design Workflow:**

```
@pm: "Design new project dashboard"
  ↓
@ux-design-expert:
  1. Create wireframes (Figma)
  2. Define interactions
  3. Ensure WCAG AA compliance
  4. Extract design tokens
  5. Hand off to @dev
  ↓
@dev: "Implements per design spec"
```

**@ux-design-expert Responsibilities:**
- Create UI/UX designs (Figma prototypes)
- Ensure accessibility (WCAG 2.1 AA)
- Define design tokens (colors, spacing, typography)
- Create design system (reusable components)
- Hand off to @dev with specifications
- Review @dev implementation (against design)

---

### 2.11 @aiox-master (Orion) — The Orchestrator

| Operation | Exclusive? | Authority | Notes |
|-----------|-----------|-----------|-------|
| *create agent | ✅ YES | — | Framework governance |
| *modify agent | ✅ YES | — | Framework evolution |
| *create workflow | ✅ YES | — | New workflow definitions |
| Framework governance | ✅ YES | — | Constitutional enforcement |
| Agent coordination | ✅ YES | — | Multi-agent orchestration |
| Escalation resolution | ✅ YES | — | Breaks deadlock |

**Escalation Pattern:**

```
@dev: "Blocked on architecture decision"
  ↓
@architect: "Need more context"
  ↓
@aiox-master *correct-course
  ↓
[Analyze, recommend, execute]
  ↓
Work unblocked
```

**@aiox-master Responsibilities:**
- Govern AIOX framework evolution
- Create/modify agents as needed
- Coordinate multi-agent workflows
- Resolve cross-team conflicts
- Enforce Constitutional principles
- Maintain IDS Entity Registry

---

## 3. Escalation Rules

### 3.1 When to Escalate

| Situation | Escalate To | Action |
|-----------|-------------|--------|
| Agent cannot complete task | @aiox-master | Analyze blockers, provide guidance |
| Quality gate fails (FAIL verdict) | @qa → @architect | Determine if architectural issue |
| Constitutional violation detected | @aiox-master | BLOCK, fix required before proceed |
| Agent boundary conflict | @aiox-master | Mediate, clarify authority |
| Business decision needed | @pm | Prioritization, scope change approval |
| Technical disagreement | @architect | Design authority |

### 3.2 Escalation Example

```
@dev: "I need to change story acceptance criteria"
  ↓
Story says: "Only @po can change AC"
  ↓
@dev escalates to @po
  ↓
@po reviews change request
  ↓
@po approves OR denies
  ↓
Work proceeds (or returns to @dev)
```

---

## 4. Handoff Rules

### 4.1 Agent-to-Agent Handoff

When work passes from one agent to another:

```
@sm (creates story)
  ↓
  [Story → Ready status]
  ↓
@dev (ready to implement)
  ↓
  @dev reads acceptance criteria
  ↓
  @dev starts implementation
  ↓
  [Story → InProgress status]
  ↓
  @qa reviews code
  ↓
  [Story → InReview status]
  ↓
  @devops merges
  ↓
  [Story → Done status]
```

### 4.2 Authority Handoff Rules

- ✅ Handoff is allowed when **previous agent completes their phase**
- ✅ Next agent can **reject work** if it doesn't meet their standards
- ✅ If **rejected, returns to previous agent** for rework
- ❌ **No skipping agents** — each phase must be completed by designated agent

---

## 5. Non-Invasive Design

This authority matrix is **designed to evolve**:

- **New operations** can be added (with new agent assignment)
- **Agent scopes** can shift (with explicit update to matrix)
- **Delegations** can be renegotiated (if project needs change)
- **Exclusive operations** can be revoked (if trust/process changes)

**Process for Change:**
1. Propose modification to authority matrix
2. Get consensus from @pm + @architect + @devops
3. Update this document
4. Announce to team
5. Implement new rules

---

## References

- **AI & Agent Architecture:** `docs/architecture/AI-AGENT-ARCHITECTURE.md`
- **Workflow Map:** `docs/architecture/AIOX-WORKFLOW-MAP.md`
- **Constitution:** `.aiox-core/constitution.md`
- **Agent Authority Rule:** `.claude/rules/agent-authority.md`

---

**Authored by:** Claude Code (Haiku 4.5) — AIOX Master Orchestrator
**Framework:** Synkra AIOX v1.0.0
**Last Reviewed:** 2026-03-14
**Next Review:** 2026-06-30 (quarterly)
