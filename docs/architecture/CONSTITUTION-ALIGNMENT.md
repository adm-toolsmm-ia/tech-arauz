# Constitution Alignment — The 6 Inviolable Principles (AIOX 10/10)

**Version:** 0.2.3 (Production Live)
**Last Updated:** 2026-03-14
**Status:** Authoritative & Binding
**Framework:** Synkra AIOX v1.0.0
**Source:** `.aiox-core/constitution.md` (v1.0.0)

---

## Purpose

The **AIOX Constitution** defines 6 **non-negotiable principles** that govern all development. They are enforced through automated gates and team discipline.

**Critical:** Constitution is NOT negotiable, but **CAN be amended** via formal process (rare).

---

## The 6 Principles

### Principle I: CLI First

**Definition:** All work is executed via CLI commands, not manual steps. The framework is the source of truth.

**Enforcement:**

| Component | How It's Enforced |
|-----------|------------------|
| Story creation | `@sm *create-story` (not manual Markdown files) |
| Story validation | `@po *validate-story-draft` (not eyeballing) |
| Feature implementation | `@dev *develop-story` (task-driven) |
| Code review | `@qa *qa-gate` (systematic checklist) |
| Deployments | `@devops *push` (not manual git push) |
| Workflow execution | `@aiox-master *workflow` (not ad-hoc agent messaging) |

**Rationale:**
- **Reproducibility:** Steps are documented, auditable, repeatable
- **Automation:** Framework handles boilerplate (checklists, templates, gates)
- **Consistency:** Everyone follows same process (no variations)
- **Scalability:** As team grows, process doesn't break

**In Tech Arauz:**
✅ All work via tasks in `.aiox-core/development/tasks/`
✅ Stories created via `*create-story` command
✅ No manual story YAML edits (framework-generated)

**Non-Invasive:** CLI is a tool; project can add new commands without breaking existing ones.

---

### Principle II: Agent Authority

**Definition:** Each agent has exclusive operations. No other agent can perform them. Delegation is explicit.

**Enforcement:**

| Exclusive Operation | Exclusive Agent | Enforcement |
|-------------------|-----------------|------------|
| `git push` | @devops | GitHub API permissions + team agreement |
| `gh pr merge` | @devops | GitHub branch protection rules |
| `*create-epic` | @pm | Framework gate (only @pm can execute) |
| `*create-story` | @sm | Framework gate (only @sm can execute) |
| `*validate-story-draft` | @po | Framework gate (only @po can execute) |
| `*qa-gate` | @qa | Framework gate (only @qa can execute) |

**Rationale:**
- **Accountability:** No ambiguity (who did what?)
- **Specialization:** Each agent is expert in their domain
- **Quality:** Exclusive operations enforce standards
- **Auditability:** Can trace decisions to agent

**In Tech Arauz:**
✅ @devops exclusively pushes (enforce quality gate)
✅ @pm exclusively creates epics (ensure strategy)
✅ @qa exclusively runs QA gate (ensure quality)
✅ Authorization matrix in `docs/architecture/AGENT-AUTHORITY-MATRIX.md`

**Non-Invasive:** New agents can be added; matrix updated to reflect scopes.

---

### Principle III: Story-Driven Development

**Definition:** All work is traceable to a story. Every code change references a story ID.

**Enforcement:**

| Requirement | How Enforced |
|------------|-------------|
| Story must exist | @dev cannot start without story ID |
| Every commit must reference story | Git hook checks: commit message contains story ID |
| Code changes listed in story | @dev updates story File List (marks tasks complete) |
| Acceptance criteria must be met | @qa gate verifies AC implementation |

**Rationale:**
- **Traceability:** Can see why code exists (what feature/fix?)
- **Context:** Developers understand acceptance criteria
- **Accountability:** Can link bug fixes to decisions
- **Product alignment:** Every line of code supports product goal

**In Tech Arauz:**
✅ 18 total stories (3 completed, 15 in progress)
✅ All commits tagged: `[Story 7.2]`, `[Story 8.1]`, etc.
✅ Story File List tracks: `[x] Criterion 1`, `[x] Criterion 2`
✅ Story lifecycle: Draft → Ready → InProgress → InReview → Done

**Git Hook (Pre-Commit):**
```bash
# .git/hooks/pre-commit
# Check: Is commit message tagged with story ID?
if ! grep -q "\[Story [0-9]\+\.[0-9]\+\]" "$1"; then
  echo "❌ Commit message must reference story: [Story X.Y]"
  exit 1
fi
```

**Non-Invasive:** Stories can change; acceptance criteria can evolve; matrix of old stories preserved.

---

### Principle IV: No Invention

**Definition:** All features must be traced to requirements (FR, NFR, CON) or research. Zero invented features.

**Enforcement:**

| Phase | Gate | Owner | Check |
|-------|------|-------|-------|
| Spec Pipeline Phase 5 | Critique verdict | @qa | Spec statements trace to FR/NFR/research |
| Code Review | CodeRabbit | @dev | No feature creep (implemented ≠ requested) |
| Story Validation | PO checklist | @po | AC matches requirements (no new features) |

**Constitutional Gate (Spec Phase 5):**

**APPROVED:** Spec is traceable
```
Spec says: "Feature X will do ABC"
  ↓
Check: Is there FR/NFR/research backing ABC?
  ✅ YES → APPROVED
  ❌ NO → REJECTED ("invented feature")
```

**BLOCKED:** Ambiguous or invented
```
Spec says: "We should add cool mood widget"
  ↓
Check: Is there FR/NFR/research?
  ❌ NO research → BLOCKED
  ✅ Researcher must investigate first
```

**Rationale:**
- **Focus:** Build what users need, not what developers think is cool
- **ROI:** Every feature costs time (engineering, testing, maintenance)
- **Scope creep prevention:** Stops accidental bloat
- **Product coherence:** Features align with product vision

**In Tech Arauz:**
✅ Spec Pipeline Phase 3 (Research) gathers requirements
✅ Every story traces to acceptance criteria (from PRD/epic)
✅ Code review checks: "Does code match AC? Or extra features?"

**Example: Detected Invention**

```
Story 7.2: "Add KPI cards to dashboard"

AC:
- [ ] Display total projects count
- [ ] Display active projects count
- [ ] Display overdue projects count

Developer implements:
- ✅ Total projects
- ✅ Active projects
- ✅ Overdue projects
- ❌ INVENTED: "Trend sparklines" (not in AC)

@qa verdict: "Remove trend sparklines. Not in AC."
```

**Non-Invasive:** Requirements can evolve; but through proper Spec Pipeline phase (gather → assess → research → spec), not surprise implementations.

---

### Principle V: Quality First

**Definition:** All work passes quality gates before merging. No shortcuts. Zero technical debt accumulation.

**Enforcement:**

| Gate | Command | Checks | Pass Condition |
|------|---------|--------|---------|
| **Pre-push** (local) | `npm run gate` | lint + typecheck + test | Zero errors + ≥85% coverage |
| **Pre-PR** (CI) | CodeRabbit | security + perf + complexity | No critical issues |
| **Pre-merge** (QA) | `@qa *qa-gate` | 7-point checklist | All checks PASS |
| **Pre-deploy** | Release checklist | migrations + env vars | All verified |

**Pre-Push Gate (Mandatory):**

```bash
npm run gate
  ↓
  npm run lint        # ESLint (zero errors allowed)
  npm run typecheck   # TypeScript strict (zero errors)
  npm run test        # Vitest (all pass, ≥85% coverage)
  npm run format:check # Prettier (code style)
  ↓
IF all pass:
  git commit OK
ELSE:
  ❌ BLOCKED: Fix issues before commit
```

**7-Point QA Gate:**

```
[ ] Lint pass
[ ] TypeScript pass
[ ] Tests pass (≥85% coverage)
[ ] No hardcoded secrets
[ ] Error handling comprehensive
[ ] Accessibility (WCAG AA)
[ ] Documentation (comments, README)

Result:
  PASS → Approved for @devops merge
  CONCERNS → @dev fixes (max 5 iterations)
  FAIL → Escalate
```

**Rationale:**
- **Production reliability:** Quality code = fewer bugs
- **Developer sanity:** Tests make refactoring safe
- **Scalability:** Poor quality compounds (slowing down team)
- **Business:** Quality code = less support burden

**In Tech Arauz:**
✅ All code passes ESLint (next lint: zero warnings)
✅ TypeScript strict: true (no `any` types)
✅ Test coverage: 92% (target: ≥85%)
✅ Pre-push gate: mandatory (no exceptions)
✅ QA gate: 7-point checklist (enforced)

**Metrics:**
```
Current QA Score: 96/100 (consolidated)
Current Test Coverage: 92% (above target)
Linting Errors: 0 (zero tolerance)
TypeScript Errors: 0 (strict mode)
```

**Non-Invasive:** Quality gates can be adjusted (more strict in hardening phases, relaxed in early exploration), but never skipped.

---

### Principle VI: Absolute Imports

**Definition:** All TypeScript imports use `@/` alias (never `../../../`). This is a code style principle, enforced by ESLint.

**Enforcement:**

| Rule | Tool | Config |
|------|------|--------|
| **No relative imports** | ESLint | `@typescript-eslint/no-restricted-imports: error` |
| **All imports use @/** | TypeScript | `tsconfig.json` path alias |
| **Format check** | Prettier | Automatic formatting |

**ESLint Rule:**

```json
// .eslintrc.json
{
  "rules": {
    "@typescript-eslint/no-restricted-imports": [
      "error",
      {
        "patterns": ["../*"]  // Block relative imports
      }
    ]
  }
}
```

**Correct:**
```typescript
// ✅ CORRECT: Absolute import
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils/date-utils';
import type { Project } from '@/lib/types';
```

**Incorrect:**
```typescript
// ❌ WRONG: Relative import (error on lint)
import { Button } from '../../../components/ui/button';
import { formatDate } from '../../lib/utils/date-utils';
```

**Rationale:**
- **Clarity:** Absolute paths are clearer (where am I importing from?)
- **Refactoring safety:** Moving files doesn't break imports
- **IDE support:** Auto-completion works better
- **Consistency:** Every import follows same pattern

**In Tech Arauz:**
✅ `tsconfig.json`: `"@/*": ["./src/*"]`
✅ All imports use `@/` prefix
✅ ESLint enforces (error on relative imports)
✅ Prettier formats consistently

**Non-Invasive:** Alias can be changed (e.g., `@app/` instead of `@/`) with global refactor.

---

## 7. Compliance Checklist (Per Phase)

### 7.1 Story Creation Phase

| Principle | Checklist |
|-----------|-----------|
| **I: CLI First** | [ ] Used `@sm *create-story` (not manual file) |
| **II: Agent Authority** | [ ] Only @sm created story |
| **III: Story-Driven** | [ ] Story has ID (auto-assigned) |
| **IV: No Invention** | [ ] AC derived from epic/PRD (not invented) |
| **V: Quality First** | [ ] 10-point validation checklist complete |
| **VI: Absolute Imports** | [ ] N/A (no code yet) |

### 7.2 Implementation Phase

| Principle | Checklist |
|-----------|-----------|
| **I: CLI First** | [ ] Used `@dev *develop-story` command |
| **II: Agent Authority** | [ ] Only @dev implemented (didn't push) |
| **III: Story-Driven** | [ ] Every commit tagged [Story X.Y] |
| **IV: No Invention** | [ ] No features beyond AC |
| **V: Quality First** | [ ] Pre-push gate pass (lint + typecheck + test) |
| **VI: Absolute Imports** | [ ] All imports use `@/` prefix |

### 7.3 Code Review Phase

| Principle | Checklist |
|-----------|-----------|
| **I: CLI First** | [ ] Used `@qa *qa-gate` command |
| **II: Agent Authority** | [ ] Only @qa reviewed + approved |
| **III: Story-Driven** | [ ] Code matches AC exactly |
| **IV: No Invention** | [ ] No extra features (code matches AC) |
| **V: Quality First** | [ ] 7-point gate pass (all checks PASS) |
| **VI: Absolute Imports** | [ ] ESLint passed (no relative imports) |

### 7.4 Merge Phase

| Principle | Checklist |
|-----------|-----------|
| **I: CLI First** | [ ] Used `@devops *push` command |
| **II: Agent Authority** | [ ] Only @devops merged |
| **III: Story-Driven** | [ ] Commit messages contain story ID |
| **IV: No Invention** | [ ] Deployed code = accepted code |
| **V: Quality First** | [ ] All gates passed before merge |
| **VI: Absolute Imports** | [ ] N/A (verified at code review) |

---

## 8. Amending the Constitution

**The Constitution CAN be amended, but only through formal process:**

### 8.1 Proposal Process

1. **Propose:** Write detailed RFC (Request for Comment)
   - Include: What principle? Why change? What's the impact?
   - Post to team discussion

2. **Review:** Get consensus from 80% of agents
   - @architect, @pm, @qa, @dev, @devops vote
   - Minority can abstain, not block

3. **Implement:** Update `.aiox-core/constitution.md`
   - Tag change with version (v1.0.1, v1.1, etc)
   - Archive old version

4. **Communicate:** Announce to team
   - Training if needed
   - Grace period (1 sprint) to adjust

### 8.2 Example: Amending Principle V

**Current:** All code must pass pre-push gate

**Proposed:** Hotfixes can skip lint check (via waiver)

**Rationale:** In production emergencies, we need speed

**Impact:** Developers might commit lint errors

**Vote:**
- @architect: YES
- @pm: YES
- @qa: NO (concerned about quality slide)
- @dev: YES
- @devops: YES

**Result:** 4/5 approve → Amendment accepted

**New Principle V (v1.1):**
```
Quality First (with hotfix exception)

All work passes quality gates, EXCEPT:
- Hotfixes to production incidents
- Waived by @qa + @devops
- Must remediate within 24h
```

---

## 9. Violation Penalties

### 9.1 Severity Levels

| Violation | Principle | Severity | Action |
|-----------|-----------|----------|--------|
| Pushed without quality gate | V | CRITICAL | Revert PR + RCA |
| Invented feature (no AC) | IV | HIGH | Remove feature + RCA |
| Relative import in code | VI | MEDIUM | Fix + re-lint |
| Skipped story validation | III | HIGH | Reject + return to SM |
| Manual story creation | I | HIGH | Delete + recreate via CLI |

### 9.2 Incident Response

**If constitutional violation detected:**

```
Violation found (e.g., code pushed without gate)
  ↓
Stop: Revert commit
  ↓
Post-mortem: Why did gate fail?
  ↓
Fix: Update process/automation
  ↓
Document: Add to known issues + lessons learned
  ↓
Resume: Code can re-land (after gate passes)
```

---

## 10. Non-Invasive Constitution

The Constitution is **designed to endure**:

- **Principles are timeless** — they'll likely never change
- **Implementations evolve** — how we enforce principles can change
- **Exceptions are possible** (rare) — waiver system for emergencies
- **Team grows** — Constitution scales with team size

**Example of Evolution:**

```
v1.0 (current): All code via @dev *develop-story
  ↓
v1.1 (future): Add AI pair programming agent
  ↓
@dev + @ai-pair *develop-story
  ↓
Still CLI-first, story-driven, quality-first
```

---

## References

- **Full Constitution:** `.aiox-core/constitution.md`
- **Agent Authority:** `docs/architecture/AGENT-AUTHORITY-MATRIX.md`
- **Workflow Map:** `docs/architecture/AIOX-WORKFLOW-MAP.md`
- **Story Lifecycle:** `.claude/rules/story-lifecycle.md`

---

**Authored by:** Claude Code (Haiku 4.5) — AIOX Master Orchestrator
**Framework:** Synkra AIOX v1.0.0
**Last Reviewed:** 2026-03-14
**Constitution Version:** v1.0.0 (ratified 2026-01-15)
**Next Review:** 2026-06-30 (quarterly)
