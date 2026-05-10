# AIOX Workflow Map — Execution Flows & Gates (AIOX 10/10)

**Version:** 0.2.4 (EPIC 11 Complete)
**Last Updated:** 2026-03-16
**Status:** Authoritative — task-first execution
**Framework:** Synkra AIOX v1.0.0

---

## Overview

AIOX framework defines **4 primary workflows** for all development. Each workflow is:

- **Task-first:** Steps are defined in `.aiox-core/development/tasks/`
- **Gate-enforced:** Quality/approval gates at phase transitions
- **Agent-executed:** Each phase assigned to specific agent
- **Auditable:** Every transition logged to story/workflow file

| Workflow | Purpose | Phases | Primary Agent | Duration |
|----------|---------|--------|---------------|----------|
| **SDC** | Feature implementation | 4 | @dev | 8-40h |
| **QA Loop** | Iterative review-fix | 2 (loop) | @qa | 2-10h |
| **Spec Pipeline** | Pre-implementation spec | 6 | @pm | 4-16h |
| **Brownfield Discovery** | Legacy assessment | 10 | @architect | 20-40h |

---

## 1. Story Development Cycle (SDC)

**The main workflow for all development work.**

### 1.0 PM Perspective

As Product Manager (Morgan), you orchestrate the SDC by:

1. **Setting Scope** — Work with @po to validate that stories are sized correctly and dependencies are clear
2. **Monitoring Velocity** — Track Phase 3 (dev) progress against effort estimates
3. **Escalating Blockers** — Identify when stories are stuck and coordinate resolution
4. **Planning Next Wave** — As stories complete, prepare backlog for next cycle
5. **Decision Gates** — Sign off on Phase 2 validation and Phase 4 QA decisions when contentious

**Key PM Deliverables:**
- Epic prioritization and story ordering (backlog)
- Effort estimation review (Phase 1: validate realistic hours)
- Stakeholder communication on completion (Phase 4: announce Done stories)
- Dependency mapping (block/blockedBy relationships)

**PM Role in Each Phase:**
- Phase 1 (CREATE): @sm creates, **@pm reviews** effort and AC scope
- Phase 2 (VALIDATE): @po validates, **@pm escalates** if NO-GO requires epic review
- Phase 3 (IMPLEMENT): @dev codes, **@pm monitors** progress (checkpoint: 50% done = midway check)
- Phase 4 (QA): @qa reviews, **@pm signs off** before @devops pushes

---

### 1.1 Overview

```
┌──────────────────────────────────────────────────────────────┐
│ PHASE 1: CREATE (Task: create-next-story.md)                │
│ Agent: @sm (Scrum Master River)                             │
│ Input: PRD, epic context                                    │
│ Output: draft story.md file (10-point checklist)            │
│ Status: Draft                                               │
│ Duration: 1-2h                                              │
└──────────────────┬───────────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────────┐
│ PHASE 2: VALIDATE (Task: validate-next-story.md)            │
│ Agent: @po (Product Owner Pax)                              │
│ Input: draft story + 10-point checklist                     │
│ Gate: Score ≥7 = GO, <7 = NO-GO (fixes required)          │
│ Output: approved story (or return for fixes)                │
│ Status: Ready (if GO) or Draft (if NO-GO)                  │
│ Duration: 0.5-1h                                            │
└──────────────────┬───────────────────────────────────────────┘
                   │ GO
                   ▼
┌──────────────────────────────────────────────────────────────┐
│ PHASE 3: IMPLEMENT (Task: dev-develop-story.md)             │
│ Agent: @dev (Developer Dex)                                 │
│ Input: Acceptance criteria, file list                       │
│ Modes: Interactive / YOLO / Pre-Flight                      │
│ CodeRabbit: Auto-healing (max 2 iterations)                │
│ Output: code + tests + commit                               │
│ Status: InProgress → InReview                              │
│ Duration: 4-32h (per estimate in story)                    │
└──────────────────┬───────────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────────┐
│ PHASE 4: QA GATE (Task: qa-gate.md)                         │
│ Agent: @qa (QA Quinn)                                       │
│ Input: Code + tests (from @dev)                             │
│ Gate: 7-point checklist (lint, typecheck, tests, a11y, etc)│
│ Decision: PASS / CONCERNS / FAIL / WAIVED                  │
│ Output: approved for merge OR return for fixes              │
│ Status: InReview → Done (if PASS) or InProgress (if fixes) │
│ Duration: 1-2h per review                                   │
└──────────────────┬───────────────────────────────────────────┘
                   │ PASS
                   ▼
            @devops *push
               (merge)
                  │
                  ▼
            [Story DONE]
            [Deployed to production]
```

### 1.2 Phase 1: CREATE (@sm)

**Task:** `create-next-story.md` (in `.aiox-core/development/tasks/`)

**PM Checkpoint:**
- **Input:** Epic context (goals, dependencies, priority)
- **Decision:** "Is this story the right size for one sprint?" (4-16h)
- **Action:** If >16h, break into smaller stories; if <2h, combine with others
- **Sign-off:** @pm approves effort estimate and file list scope

**Elicitation Points (Interactive):**
```
1. "What's the story title?" → @sm enters title
2. "What's the epic?" → User selects epic
3. "List 5+ acceptance criteria" → @sm types AC bullets
4. "What files will be affected?" → @sm lists files
5. "Estimate effort (hours)" → @sm estimates (4h, 8h, 16h, etc)
6. "Any dependencies?" → @sm lists blocking stories
```

**EPIC 11 Example — Phase 1:**

**Story 11.1: Add responsible_roles to Activities (DB)**
- **Title:** Clear ✅ ("Add responsible_roles JSONB column to org_activities table")
- **AC:** ≥5 ✅ (migration, index, RLS, types, validation)
- **Files:** Clear ✅ (migration file, TypeScript types, rollback script)
- **Effort:** 3-4h ✅ (database-only, no frontend)
- **Dependencies:** None ✅
- **PM Decision:** "This is Phase 1 of 14. Unblock Phase 2 backend. Approve. Priority CRITICAL."

**Story 11.6: Implement Server Actions for responsible roles (Backend)**
- **Title:** Clear ✅ ("Server Actions: CRUD for responsible roles in activities")
- **AC:** ≥5 ✅ (Create, Read, Update, Delete, audit logging)
- **Files:** Clear ✅ (server action file, types, tests)
- **Effort:** 6-8h ✅ (5 actions + RLS + tests)
- **Dependencies:** Blocks 11.11 (frontend) ✅
- **PM Decision:** "This unblocks Phase 3 UI. Approve. Can parallelize with 11.7-11.9."

**Output:** `docs/stories/story-{epic}.{num}.story.md`

**Template Used:** `story-tmpl.yaml`

**Validation Checklist:**
- [ ] Title present and clear
- [ ] Acceptance criteria ≥5, specific
- [ ] File list identified
- [ ] Effort estimated (2-16h range)
- [ ] Dependencies mapped
- [ ] Story status = Draft
- [ ] PM reviewed scope ✅

**Story Format:**

```markdown
# Story {ID}: {Title}

**Epic:** {Epic number}
**Effort Estimate:** {hours}h
**Status:** Draft
**Assigned to:** {Agent}

## Acceptance Criteria

- Criterion 1 (specific, testable)
- Criterion 2
- Criterion 3
- ...

## File List

- `src/components/ComponentName.tsx` (new)
- `src/lib/utils/helper.ts` (modified)
- `package.json` (dependencies added)

## Implementation Notes

[Optional: architecture notes, gotchas, research findings]

---

**Task Progress:**

- [ ] Criterion 1 implemented
- [ ] Criterion 2 implemented
- ...
```

### 1.3 Phase 2: VALIDATE (@po)

**Task:** `validate-next-story.md`

**PM Checkpoint:**
- **Input:** Draft story from @sm
- **Decision Point 1:** "Are AC realistic and measurable?" (If not → escalate)
- **Decision Point 2:** "Is this story too big or too small?" (Adjust with @sm)
- **Decision Point 3:** "Will @qa be able to verify this?" (If not → clarify AC)
- **Action:**
  - If **GO (≥7/10):** Story ready for @dev, @pm tracks in sprint backlog
  - If **NO-GO (<7/10):** Return to @sm with specific fixes, @pm re-validates within 24h

**EPIC 11 Example — Phase 2:**

Story 11.1 validation:
```
[ ✅ ] Title: Clear, specific (JSONB column to org_activities)
[ ✅ ] AC: 6 criteria (migration, index, RLS, types, rollback, no data loss)
[ ✅ ] Estimation: 3-4h is realistic for pure DB work
[ ✅ ] File List: migration file, TypeScript types, rollback script identified
[ ✅ ] Dependencies: None, can start immediately
[ ✅ ] NFRs: RLS compliance, zero downtime mentioned
[ ✅ ] Edge Cases: Rollback scenario documented
[ ✅ ] A11y: N/A (database-only story)
[ ✅ ] Testability: @qa can verify migration applied, data integrity
[ ✅ ] User Story Format: Technical story (acceptable for EPIC 11)

Score: 10/10 → GO ✅
@pm action: Approve, prioritize after Stories 11.2-11.5 dependencies mapped
```

Story 11.11 validation (Phase 3, frontend):
```
[ ✅ ] Title: Clear (ResponsibleRolesInput in OrgEntityFormSheet)
[ ⚠️ ] AC: "Add autocomplete tagging" — too vague, needs examples
[ ✅ ] Estimation: 6-8h is realistic
[ ✅ ] Dependencies: Blocks 11.12, depends on 11.6 server actions
[ ⚠️ ] A11y: Mentions WCAG AA but no specific requirements (aria-labels, keyboard nav)

Score: 7/10 → GO with concerns
@pm action: Approve (can fix AC details in 11.6 review), flag A11y for @dev to address
```

**Checklist (10 points):**

```
[ ] Title
    - Clear and actionable
    - Describes outcome (not process)

[ ] Acceptance Criteria
    - ≥5 bullets
    - Each is specific, testable, measurable
    - No ambiguous language ("should," "might")

[ ] Estimation
    - Effort hours provided
    - Realistic (not "100h" for small task)

[ ] File List
    - Lists affected files
    - Identifies new vs modified

[ ] Dependencies
    - Blocks/blockedBy documented
    - No circular dependencies

[ ] Non-Functional Requirements
    - Performance targets (if applicable)
    - Accessibility requirements (WCAG AA)
    - Scalability notes

[ ] User Story Format
    - "As a [role], I want [feature]" format (if applicable)
    - Context is clear

[ ] Testability
    - AC can be verified by @qa

[ ] Edge Cases
    - Error scenarios considered
    - Boundary conditions documented

[ ] Accessibility (WCAG AA)
    - Semantic HTML required
    - ARIA labels specified
    - Keyboard navigation noted
```

**Gate Decision:**

- **GO** (≥7/10): Story ready for @dev
- **NO-GO** (<7/10): Return to @sm with specific fixes
  - Example: "AC #3 is vague. Say 'sort by status, priority, updated_at' not 'sortable'."

**@po Action:**
```
If NO-GO:
  - Return story to @sm
  - Mark status: Draft (was Ready)
  - Explain what's missing

If GO:
  - Mark status: Ready
  - Assign to @dev
  - Story now eligible for implementation phase
```

### 1.4 Phase 3: IMPLEMENT (@dev)

**Task:** `dev-develop-story.md`

**PM Checkpoint:**
- **Kickoff:** @pm confirms story is still prioritized, answers AC clarifications
- **Midway (50% done):** @pm checks if on track to finish in estimated hours
  - If **ahead:** Celebrate, look ahead to next story
  - If **on-track:** Maintain course
  - If **behind:** Root cause? Escalate to @architect if blocked, @po if AC unclear
- **Completion:** @pm updates sprint backlog, prepares stakeholder communication
- **Sign-off:** @pm notifies stakeholders "Story moving to QA"

**EPIC 11 Example — Phase 3 Progress Tracking:**

**Story 11.1 (3-4h estimated):**
```
Hour 0:    @dev kicks off: "Setting up migration 066"
Hour 1.5:  @pm checkpoint: "On track? ✅ Yes, migration written + index added"
Hour 3:    @dev: "Migration complete, testing rollback" ✅
Hour 3.5:  @pm: "Approved for QA, Story 11.2 can start (dependency ready)"
→ Moved to InReview (Phase 4)
```

**Story 11.6 (6-8h estimated):**
```
Hour 0:    @dev kicks off: "Implementing 5 server actions"
Hour 3:    @dev: "3 actions done (Create, Read, Update), tests passing"
Hour 4:    @pm checkpoint: "On track? ✅ Yes, Delete + audit logging next"
Hour 7:    @dev: "All 5 actions + RLS verified, tests at 92% coverage"
Hour 8:    @dev: "Code ready for review, unblocks Story 11.11 (frontend)"
→ Moved to InReview (Phase 4)
→ @pm notifies: "Server actions ready for frontend integration"
```

**Modes:**

1. **Interactive Mode** (default)
   - @dev asks for clarification on AC
   - Iterative development (run tests frequently)
   - Can pause, ask @po for AC clarification

2. **YOLO Mode** (simple stories)
   - @dev assumes AC is clear
   - Fast implementation (no questions)
   - Suitable for ≤4h stories

3. **Pre-Flight Mode** (complex)
   - @dev plans before coding
   - Creates detailed implementation steps
   - Technical design review with @architect

**Workflow:**

```
@dev *develop-story {story-id}

Step 1: Read story + AC
  → Understand requirements

Step 2: Create feature branch
  → git checkout -b feature/story-{id}

Step 3: Code (follow module-standards.md)
  → Create components, implement logic
  → Write unit tests (≥85% coverage)
  → Add error handling
  → Add comments on complex logic

Step 4: Run pre-push gate
  → npm run lint (zero errors)
  → npm run typecheck (zero errors)
  → npm run test (all pass, ≥85% coverage)
  → npm run format:check (code style)

Step 5: Commit with conventional message
  → git add .
  → git commit -m "feat: description [Story X.Y]"
  → Include story ID in message!

Step 6: Update story File List
  → Mark completed tasks with [x]
  → List all modified files
  → Add any implementation notes

Step 7: Request code review
  → @qa *qa-gate
  → (Automated if using CodeRabbit)
```

**CodeRabbit Integration (Auto-Healing):**

```
CodeRabbit runs on commit:
  ↓
  Issue found: "Missing error handling on fetch"
  ↓
  CodeRabbit suggests: "Add try/catch block"
  ↓
  @dev reviews suggestion
  ↓
  IF agree:
    - Apply fix (auto or manual)
    - Commit again
    - Max 2 iterations
  ELSE:
    - Mark suggestion as reviewed
    - Continue (can address in next PR)
```

**@dev Responsibilities:**
- Implement AC precisely (not approximate)
- Follow code standards
- Add tests (unit + integration)
- Write clear commit messages
- Update story progress
- Ask @po if AC is unclear

### 1.5 Phase 4: QA GATE (@qa)

**Task:** `qa-gate.md`

**PM Checkpoint:**
- **Before QA Review:** @pm confirms Story is ready (File List updated, commit message has [Story X.Y] tag)
- **QA Verdict Scenarios:**
  - **PASS:** @pm announces completion, story auto-moves to Done, triggers next-wave story kickoff
  - **CONCERNS:** @dev fixes (1-2 iterations expected), @pm monitors turnaround
  - **FAIL:** Story blocked, @pm escalates (architecture issue? scope creep?)
  - **WAIVED:** Rare, @pm documents justification (e.g., hotfix, emergency)
- **Sign-off:** @pm approves @devops push (very rare, only for high-visibility merges)

**EPIC 11 Example — Phase 4 Outcomes:**

**Story 11.1 QA Review:**
```
@qa checklist:
  [✅] Lint: Zero errors
  [✅] TypeScript: Migration types correct
  [✅] Tests: Migration test passes (apply + rollback)
  [✅] No hardcoded values: Migration uses env-based credentials
  [✅] Error handling: Rollback documented, failure cases handled
  [✅] A11y: N/A (database story)
  [✅] Documentation: Migration SQL includes comments

Verdict: PASS ✅
@qa: "Schema clean, ready to merge"
@pm action: "Story 11.1 DONE. Unblocks Phase 2 (11.2-11.5 can proceed)"
@devops: Pushes to main → production deployed
```

**Story 11.11 QA Review (Phase 3 example, more complex):**
```
@qa checklist:
  [✅] Lint: Zero errors (formatting correct)
  [✅] TypeScript: Component types strict
  [❌] Tests: 78% coverage (requirement: ≥85%)
  [✅] No hardcoded values: Config via server actions
  [⚠️] Error handling: Missing error toast on failed responsible role update
  [✅] A11y: ARIA labels present, keyboard nav tested
  [✅] Documentation: Component comments explain props

Verdict: CONCERNS (fixable, low priority)
@qa: "Component works. Need: +test coverage +error handling."
@dev action: "Adding 2 tests (edge cases) + error toast. 30 min fix."
→ Iteration 2: Resubmit
@qa: "✅ Now 88% coverage + error handling complete"

Verdict: PASS ✅
@pm action: "Story 11.11 DONE. Unblocks bulk operations (11.14)"
```

**Checklist (7 points):**

```
[ ] Lint
    npm run lint passes (zero errors)

[ ] TypeScript
    npm run typecheck passes (zero errors)
    No `any` types

[ ] Tests
    npm run test passes (all tests pass)
    Coverage ≥85% (or higher per story)

[ ] No Hardcoded Values
    No credentials, URLs, API keys in code
    All configurable via env vars

[ ] Error Handling
    Try/catch on async operations
    Error boundaries on React components
    User-friendly error messages

[ ] Accessibility (WCAG AA)
    Semantic HTML (<button> not <div>)
    ARIA labels where needed
    Keyboard navigation works
    Focus management correct

[ ] Documentation
    Complex logic has comments
    README updated (if user-facing)
    Commit message clear + story ID included
```

**Gate Verdict:**

- **PASS**: Code ready for merge
  - → @devops *push
  - → Story marked Done
  - → Deployed to production

- **CONCERNS**: Issues found (not blocking)
  - → Return to @dev for fixes
  - → Can merge with waiver (rare)

- **FAIL**: Critical issues
  - → Return to @dev
  - → Must fix before re-review
  - → Max 5 iterations (QA Loop)

- **WAIVED**: Skip check with justification
  - → Rare (hotfix, emergency)
  - → Requires @qa signature

**Example:**

```
@dev: "Code ready for review"
  ↓
@qa checks:
  ✅ Lint pass
  ✅ TypeScript pass
  ✅ Tests pass (92% coverage)
  ❌ Missing error handling on API call
  ✅ No hardcoded values
  ✅ A11y: semantic HTML, ARIA labels
  ✅ Comments on complex logic

Verdict: CONCERNS
  → @dev adds try/catch
  → @dev commits: "fix: add error handling [Story X.Y]"
  → @qa re-reviews
  ↓
@qa: PASS
  → @devops *push
  → Story marked Done
```

### 1.6 Stakeholder Involvement Matrix (PM Coordination)

**Who participates in each phase of SDC:**

| Phase | @sm | @po | @dev | @qa | @pm | @architect | Stakeholders |
|-------|-----|-----|-----|-----|-----|-----------|--------------|
| **1: CREATE** | ✅ Lead | 👁️ Review | — | — | 👁️ Review scope/effort | 👁️ If complex | None (internal) |
| **2: VALIDATE** | — | ✅ Lead | — | — | 👁️ Escalate if NO-GO | — | None (internal) |
| **3: IMPLEMENT** | — | 👁️ Clarify AC | ✅ Lead | — | 👁️ Midway check | 👁️ If blocked | None (in progress) |
| **4: QA GATE** | — | — | ↔️ Fix issues | ✅ Lead | 👁️ Sign-off | — | ✅ Notify on PASS |

**Legend:**
- ✅ **Lead:** Owns the phase, makes decisions
- 👁️ **Review:** Monitors, provides input, can escalate
- ↔️ **Collaborate:** Works with other agents
- — **Not involved**

**EPIC 11 Stakeholder Communication Timeline:**

```
PHASE 1-2 (Creation & Validation):
  → Backlog grooming session: @pm + @po + @sm align on Stories 11.1-11.14
  → Stakeholders (execs, clients): "EPIC 11 ready for implementation, 4-5 week timeline"

PHASE 3 (Implementation):
  → Week 1 (11.1-11.5): Database team working (Dara @data-engineer)
    - @pm: Daily standup, communicate "foundation complete" mid-week
  → Week 2-3 (11.6-11.9): Backend team working (Dex @dev)
    - @pm: Mid-sprint review, "server actions 75% complete"
  → Week 3-4 (11.10-11.14): Frontend team + AI context
    - @pm: Parallel tracks, communicate "UI integration starting"

PHASE 4 (QA):
  → Stories 11.1-11.5 PASS: @pm announces "Schema ready for frontend"
  → Stories 11.6-11.9 PASS: @pm announces "Backend ready for testing"
  → Stories 11.10-11.14 PASS: @pm announces "EPIC 11 DONE, v0.2.4 ready for release"
  → Stakeholders: "Feature complete, entering production validation"

RELEASE:
  → @pm: Coordinates release communication, customer launch plan
```

---

## 2. QA Loop (Iterative Review-Fix)

**For refinement and iteration after initial QA gate.**

### 2.1 Overview

```
@qa review code
  ↓
  VERDICT = APPROVE/REJECT/BLOCKED
  ↓
  IF REJECT:
    @dev fixes
    → re-review (iteration 2)
    → max 5 iterations
  ELIF APPROVE:
    complete & mark Done
  ELIF BLOCKED:
    escalate to @aiox-master
```

### 2.2 QA Loop Commands

```bash
# Start loop
@qa *qa-loop {story-id}

# Resume from review (if interrupted)
@qa *qa-loop-review {story-id}

# Resume from fix (if interrupted)
@qa *qa-loop-fix {story-id}

# Pause & save state
@qa *stop-qa-loop {story-id}

# Resume from saved state
@qa *resume-qa-loop {story-id}

# Force escalation
@qa *escalate-qa-loop {story-id}
```

### 2.3 Iteration Limits

```
Iteration 1: Initial review
Iteration 2: First fix
Iteration 3: Second fix
Iteration 4: Third fix
Iteration 5: Final fix

If still not APPROVED after iteration 5:
  → Escalate to @aiox-master
  → Review: architecture issue? scope problem? timeline?
```

### 2.4 Status File

`qa/loop-status.json`:

```json
{
  "story_id": "7.2",
  "iterations": 3,
  "current_iteration": 3,
  "verdicts": [
    {"iteration": 1, "verdict": "REJECT", "reason": "missing error handling"},
    {"iteration": 2, "verdict": "CONCERNS", "reason": "a11y issues"},
    {"iteration": 3, "verdict": "APPROVE", "timestamp": "2026-03-14T10:30:00Z"}
  ],
  "escalation_trigger": null
}
```

---

## 3. Spec Pipeline (Pre-Implementation)

**Transform requirements into executable spec.**

### 3.1 Complexity Assessment

**Scoring System (1-5 per dimension):**

| Dimension | Score 1 | Score 3 | Score 5 |
|-----------|---------|---------|---------|
| **Scope** | Single file | 5-10 files | 15+ files |
| **Integration** | No APIs | 1 API | 3+ APIs |
| **Infrastructure** | No setup | Minor config | DB migration |
| **Knowledge** | Team familiar | Partial | Novel |
| **Risk** | Low | Medium | Critical |

**Total Score:**
- **≤8:** SIMPLE (3 phases)
- **9-15:** STANDARD (6 phases)
- **≥16:** COMPLEX (6 phases + revision)

### 3.2 6-Phase Pipeline

```
Phase 1: GATHER (@pm)
  → Collect FR/NFR/CON from stakeholders
  → Output: requirements.json

Phase 2: ASSESS (@architect)
  → Rate complexity (1-5 per dimension)
  → Output: complexity.json
  → Route to 3-phase or 6-phase pipeline

Phase 3: RESEARCH (@analyst) [CONDITIONAL: STANDARD or COMPLEX]
  → Research competitors, patterns, best practices
  → Output: research.json
  → [SKIP if SIMPLE]

Phase 4: WRITE SPEC (@pm)
  → Write formal spec.md (Constitutional: trace all to FR/NFR/research)
  → Output: spec.md
  → Must include: design, API, examples, edge cases

Phase 5: CRITIQUE (@qa)
  → Review spec for clarity, completeness
  → Rate: APPROVED (≥4.0 avg) / NEEDS_REVISION (3.0-3.9) / BLOCKED (<3.0)
  → Output: critique.json

Phase 6: PLAN (@architect) [IF APPROVED]
  → Create implementation plan (tasks, phases, dependencies)
  → Output: implementation.yaml
  → Ready for SDC
```

### 3.3 Constitutional Gate (Article IV — No Invention)

**Every statement in spec.md must trace to:**

- **FR-\*:** Functional requirement
- **NFR-\*:** Non-functional requirement
- **CON-\*:** Constraint
- **Research finding** (from Phase 3)

**Example:**

```markdown
## Feature: Search Suggestions

This feature provides autocomplete suggestions as users type in the search box.

### FR-1: Autocomplete API
- Use OpenRouter LLM API (research finding: best latency among providers)
- Max 100ms response time (NFR-1: performance)
- Return top 5 suggestions (FR-1 spec)

### FR-2: Caching
- Cache suggestions for 5 minutes (NFR-2: user experience)
- Clear cache on manual refresh (FR-3: user control)

### Edge Cases (from research)
- Empty search → no suggestions (from Metabase pattern study)
- Exact match → highlight in suggestions (from Tableau UX)
```

**Constitutional Violation:**

```markdown
## Feature: Dashboard Redesign

We should add a cool new widget showing team mood.
❌ NO RESEARCH BACKING
❌ NO FR/NFR TRACE
→ REJECTED (revisit in next spec phase with research)
```

---

## 4. Brownfield Discovery (Legacy Assessment)

**For joining existing projects or assessing technical debt.**

### 4.1 10-Phase Process

```
PHASE 1-3: DATA COLLECTION
├─ @architect: System architecture analysis
├─ @data-engineer: Database audit + schema extraction
└─ @ux-design-expert: Frontend spec + component inventory

PHASE 4-7: DRAFT & VALIDATION
├─ @architect: Technical debt DRAFT report
├─ @data-engineer: DB specialist review
├─ @ux-design-expert: UX specialist review
└─ @qa: QA gate (APPROVED or NEEDS WORK)

PHASE 8-10: FINALIZATION
├─ @architect: Final technical debt assessment
├─ @analyst: TECHNICAL-DEBT-REPORT (executive summary)
└─ @pm: Create EPIC + stories ready for development
```

### 4.2 Deliverables

**Phase 8 Output: technical-debt-assessment.md**
- Architecture issues (coupled, complex)
- Database issues (unindexed, poor RLS)
- Frontend issues (accessibility, performance)
- Security issues (exposed credentials, missing validation)
- Recommendations (priority, effort, risk)

**Phase 9 Output: TECHNICAL-DEBT-REPORT.md**
- Executive summary
- Top 3-5 highest-impact items
- Effort estimates
- ROI analysis (time saved vs effort spent)

**Phase 10 Output: EPIC creation**
- Epic 1: Critical fixes (security, performance)
- Epic 2: Medium-priority debt
- Epic 3: Nice-to-have refactoring
- Each with 3-5 stories ready for development

---

## 5. Status Transitions & Gates

### 5.1 Story Status Lifecycle

```
Draft ──────→ Ready ──────→ InProgress ──────→ InReview ──────→ Done

  @po          @dev          @qa            @devops
  validates    implements    reviews        merges
  (10-pt)      (code)        (7-pt)         (pushes)

NO-GO ←────────┘            FAIL ←──────────┘
(return)                     (return for fixes)

                  QA Loop max 5 iterations ←──────
```

### 5.2 Gate Conditions

| Transition | Gate | Owner | Pass Condition |
|-----------|------|-------|---------|
| Draft → Ready | 10-point checklist | @po | Score ≥7 |
| Ready → InProgress | (automatic, @dev claims) | @dev | Commitment |
| InProgress → InReview | Pre-push gate | @dev | lint + typecheck + test pass |
| InReview → Done | 7-point QA gate | @qa | All checks PASS |
| InReview → InProgress | QA Loop | @qa | REJECT verdict (max 5 loops) |

### 5.3 Blocked State

If story cannot proceed:

```
Story blocked on Story 5.4
  ↓
Status: Blocked (special state)
  ↓
Reason: "Awaiting Story 5.4 database schema"
  ↓
[Wait for Story 5.4 to complete]
  ↓
Story 5.4 marked Done
  ↓
Story dependency resolved
  ↓
Status: Ready (resume development)
```

---

## 6. Non-Invasive Design

Workflows are **designed to evolve**:

- **New phases** can be added (with new gates, new agents)
- **Workflows** can be created (for special cases)
- **Gates** can be adjusted (stricter or relaxed per project stage)
- **Agent roles** can shift (with authority matrix update)

**Example:** If project matures, @qa gate could be relaxed for simple bug fixes (WAIVED verdict).

---

## References

- **Story Lifecycle:** `.claude/rules/story-lifecycle.md`
- **Agent Authority:** `docs/architecture/AGENT-AUTHORITY-MATRIX.md`
- **Constitution:** `.aiox-core/constitution.md`
- **Tasks:** `.aiox-core/development/tasks/`
- **EPIC 11 Master Spec:** `docs/stories/EPIC-11-Organizational-Enrichment-BPM-Mastery.md` (14 stories, 4 phases, 55-70h)
- **PM Handbook:** Sections 1.0-1.6 (PM Perspective + Phase Descriptions + Stakeholder Matrix)

---

**Coordination Note:**

This document (AIOX-WORKFLOW-MAP.md) is **co-led by @architect (Aria) and @pm (Morgan)**:
- **@architect:** Owns workflow structure, gates, technical accuracy, 4-workflow framework
- **@pm:** Owns PM perspective, checkpoints, stakeholder communication, Phase descriptions with EPIC 11 examples

Both agents validate changes to ensure coherence.

---

**Authored by:** Claude Code (Haiku 4.5) — AIOX Master Orchestrator
**Framework:** Synkra AIOX v1.0.0
**Last Reviewed:** 2026-03-16 (PM perspective + EPIC 11 examples added)
**Last Updated By:** Morgan (@pm) — Phase descriptions, PM checkpoints, stakeholder matrix
**Next Review:** 2026-06-30 (quarterly)
**Version:** 0.2.4 (with PM perspective)
