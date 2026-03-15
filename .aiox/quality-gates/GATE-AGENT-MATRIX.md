# Wave 3 Quality Gates — Agent Responsibility Matrix

**Period:** 2026-03-15 → 2026-04-25
**Framework:** Synkra AIOX Authority Model
**Status:** ACTIVE (Non-blocking execution)

---

## 📊 Gate Ownership

| Gate | Primary Owner | Secondary Support | Authority |
|------|---------------|-------------------|-----------|
| **Gate 1: CodeRabbit** | Automated System | @dev (Dex) — fixes | Automated (no escalation needed) |
| **Gate 2: Architecture** | @architect (Aria) | @qa (Quinn) — review | Constitutional (ADR-001, Design Authority) |
| **Gate 3: QA Verification** | @qa (Quinn) | @dev (Dex) — coordination | Exclusive (QA Authority) |

---

## 🎯 Agent-Specific Responsibilities

### @dev (Dex) — Code Implementation

**Responsibilities:**
- ✅ Address all 12 linting errors before final merge
- ✅ Fix all 14 TypeScript errors in Wave 3 code
- ✅ Implement Wave 3 stories (11.11-11.14)
- ✅ Add new tests for Wave 3 features
- ⚠️ Do NOT break existing tests (0 new failures target)
- ⚠️ Do NOT commit code with linting errors (run `npm run lint` locally)
- ⚠️ Do NOT merge without TypeScript compliance (run `npm run typecheck`)
- ❌ Do NOT push to remote (delegate to @devops)
- ❌ Do NOT create pull requests (delegate to @devops)

**Linting Errors to Fix (12 total):**

| # | File | Issue | Line | Fix |
|---|------|-------|------|-----|
| 1 | ProcessCockpit360.tsx | Missing BarChart3 import | 130 | Import from lucide-react |
| 2-5 | ProcessMetrics.stories.tsx | React hooks in render (4×) | 275, 299, 356, 384 | Move to component wrapper |
| 6-13 | Various stories | Unescaped JSX entities (8×) | Multiple | Use &quot; instead of " |
| 14 | ProcessCockpit360.tsx | Missing label htmlFor | 349 | Add htmlFor="..." |

**TypeScript Errors to Fix (14 total):**

| # | File | Error | Type | Fix |
|---|------|-------|------|-----|
| 1 | IntegrationStep.tsx | Invalid Checkbox prop `id` | TS2322 | Remove invalid prop |
| 2 | StructureStep.tsx | string assigned to number | TS2322 | Parse string or adjust type |
| 3 | TemplatesStep.tsx | Cannot find radio-group module | TS2307 | Verify component exists |
| 4 | TemplatesStep.tsx | No exported AlertInfo | TS2305 | Use AlertCircle or Info |
| 5 | ProcessCockpit360.tsx | BarChart3 not found | TS2304 | Import from lucide-react |
| 6 | import-export.ts | Type casting error | TS2352 | Use `as unknown` first |
| 7-14 | ProcessMetrics.stories.tsx | Missing mock properties (8×) | TS2739 | Add tenant_id, metric_name |

**Timeline:**
- Complete fixes: Before 2026-04-25 final merge
- Checkpoint review: 2026-04-21

**Authority Delegated:**
- ✅ Can commit locally (to own branch)
- ✅ Can create pull requests (to feature branch)
- ❌ Cannot push to remote (escalate to @devops)
- ❌ Cannot merge PR (escalate to @devops)

---

### @qa (Quinn) — Quality Assurance Authority

**Responsibilities:**
- ✅ Monitor all test executions during Wave 3 development
- ✅ Verify 0 new test failures introduced (currently 0 ✅)
- ✅ Validate accessibility compliance (WCAG AA)
- ✅ Verify RLS enforcement on all new features
- ✅ Document pre-existing test failures (9 waived, 0 new)
- ✅ Provide weekly test status updates
- ✅ Escalate any NEW failures immediately to @dev
- ⚠️ Do NOT fix code (coordinate with @dev for fixes)
- ⚠️ Pre-existing test failures are WAIVED for Wave 3
- ⚠️ Only NEW failures trigger action items

**Pre-existing Failures (Waived):**

| Category | Count | Files | Action |
|----------|-------|-------|--------|
| Supabase mock chain | 5 | organization-responsible-roles.test.ts | Phase 5 fix |
| SSR context mocking | 3 | bootstrap.test.ts | Phase 5 fix |
| Spy assertion ordering | 1 | organization-systems-metrics.test.ts | Phase 5 fix |
| UI snapshots | 8 | organization/__tests__/ | Phase 5 refresh |

**Quality Metrics Monitored:**

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| New test failures | 0 | 0 | ✅ GREEN |
| Accessibility compliance | 100% | 100% | ✅ GREEN |
| RLS test coverage | ≥20 tests | 9 tests | 🟡 ADEQUATE |
| Pass rate (total) | 95% | 78.8% (pre-existing) | 🟡 YELLOW |

**Authority Delegated:**
- ✅ Can flag failing tests
- ✅ Can request @dev fix code issues
- ✅ Can waive pre-existing failures
- ❌ Cannot modify test code (escalate to @dev)
- ❌ Cannot commit to repository

---

### @architect (Aria) — Architecture Authority

**Responsibilities:**
- ✅ Review Wave 3 architecture requirements (done: APPROVED 95/100)
- ✅ Verify Phase 5 architectural dependencies
- ✅ Approve any database schema changes
- ✅ Review integration patterns for new features
- ✅ Assess scalability/performance impact
- ✅ Ensure ADR-001 (RLS) compliance on all changes
- ✅ Provide architectural guidance (non-binding)
- ⚠️ Architecture gate: APPROVED (no re-review needed unless major changes)
- ❌ Cannot modify code (advisory role only)

**Architecture Gate Status:**

✅ **APPROVED** — All 10/10 criteria satisfied

| Criterion | Status | Score |
|-----------|--------|-------|
| RLS Enforcement (ADR-001) | ✅ PASS | 10/10 |
| Error Handling | ✅ PASS | 10/10 |
| Component Integration | ✅ PASS | 10/10 |
| Server Actions | ✅ PASS | 10/10 |
| Database Schema | ✅ PASS | 10/10 |
| API Design | ✅ PASS | 10/10 |
| Scalability | ✅ PASS | 10/10 |
| Performance | ✅ PASS | 10/10 |
| Security | ✅ PASS | 10/10 |
| Accessibility | ✅ PASS | 10/10 |

**Authority Delegated:**
- ✅ Can approve architecture changes
- ✅ Can provide design recommendations
- ✅ Can flag ADR violations
- ❌ Cannot enforce code changes
- ❌ Cannot modify test suite

---

### @devops (Gage) — Release & Infrastructure

**Responsibilities:**
- ✅ Manage CI/CD pipeline (ensure gates can run)
- ✅ Prepare for v0.2.4 release (2026-04-25)
- ✅ Monitor infrastructure health
- ❌ Do NOT push code (wait for @dev or coordinator instruction)
- ❌ Do NOT merge PRs until gates are GREEN/YELLOW (non-blocking)
- ⚠️ Standby for final push at Gate decision (2026-04-25)

**Release Timeline:**

| Date | Action | Owner |
|------|--------|-------|
| 2026-04-18 | Gate decision made | @qa + @architect |
| 2026-04-21 | Checkpoint 1 review | All agents |
| 2026-04-25 | Final push approved | @devops (if gates GREEN) |
| 2026-04-25 | v0.2.4 release | @devops |

**Authority Delegated:**
- ✅ EXCLUSIVE: Can execute `git push`
- ✅ EXCLUSIVE: Can create/merge pull requests
- ✅ EXCLUSIVE: Can manage release branches
- ✅ EXCLUSIVE: Can deploy to production

---

### @pm (Morgan) — Product Management

**Responsibilities:**
- ✅ Coordinate Wave 3 story priorities
- ✅ Monitor epic progress (EPIC-11 tracking)
- ✅ Manage stakeholder communication
- ⚠️ Gate participation: Observer (non-blocking)
- ❌ Do NOT override quality gates

**Reporting to @pm:**
- Weekly wave status updates
- Blocker escalations (if any)
- Release readiness assessment

---

## 🔄 Cross-Agent Workflows

### Linting Issue Fix Workflow

```
@dev detects lint error
  ↓
@dev fixes locally (npm run lint)
  ↓
@dev commits to feature branch
  ↓
Automated linting passes ✅
  ↓
READY FOR MERGE (2026-04-25)
```

**Owners:** @dev (primary), @qa (validation)

### Test Failure Escalation Workflow

```
@qa detects NEW test failure
  ↓
@qa isolates root cause
  ↓
@qa creates issue ticket for @dev
  ↓
@dev fixes code
  ↓
@dev commits fix
  ↓
@qa validates fix passes
  ↓
GATE CONTINUES ✅
```

**Owners:** @qa (primary), @dev (secondary)

### Architecture Gate Escalation Workflow

```
@architect detects ADR violation
  ↓
@architect documents finding
  ↓
@architect requests @dev fix
  ↓
@dev modifies code/design
  ↓
@architect re-reviews
  ↓
APPROVAL or BLOCK ✅ / 🔴
```

**Owners:** @architect (primary), @dev (secondary)

### Release Decision Workflow

```
2026-04-18: Gate Decision Day
  ↓
@qa reports test status (0 new failures) ✅
@architect confirms architecture (APPROVED) ✅
CodeRabbit reports linting (fixable issues) 🟡
  ↓
@dev prioritizes remaining linting fixes
  ↓
2026-04-21: Checkpoint 1
All gates confirmed still GREEN/YELLOW ✅
  ↓
2026-04-25: Final Merge Day
@dev finalizes all fixes
All gates: GREEN ✅
  ↓
@devops executes push + release
```

**Owners:** @qa + @architect (decision), @devops (execution)

---

## 📋 Escalation Matrix

### When to Escalate to @aiox-master

| Situation | Escalation Trigger | Primary Owner | When |
|-----------|-------------------|---|--------|
| **Code blocker** | @dev cannot resolve issue | @dev | Immediately |
| **Architecture blocker** | @architect gates BLOCKED | @architect | Immediately |
| **Constitutional violation** | Any AIOX Article violation | @qa / @architect | Immediately |
| **Gate deadlock** | Multiple gates BLOCKED | @qa + @architect | Day 3+ |
| **Release decision conflict** | Disagreement on v0.2.4 readiness | @qa + @architect | 2026-04-18 |

### Escalation Protocol

1. Document issue thoroughly
2. Contact primary owner with context
3. If unresolved in 24h → escalate to @aiox-master
4. @aiox-master makes binding decision
5. All agents follow decision

---

## 📅 Checkpoint Dates & Assignments

### Checkpoint 1 (2026-04-21)

**Attendees:** @dev, @qa, @architect, @pm, @devops

**Agenda:**
- [ ] @dev: Review linting fixes progress (target: 100% addressed)
- [ ] @qa: Confirm 0 new test failures still true
- [ ] @architect: Validate Phase 5 architecture
- [ ] @pm: Report stakeholder status
- [ ] @devops: Confirm release readiness

**Decision:** Proceed to final merge (2026-04-25) or address blockers

### Gate Decision Day (2026-04-18)

**Attendees:** @qa, @architect, @pm

**Decision Points:**
- [ ] CodeRabbit: Linting fixable? YES ✅
- [ ] Architecture: APPROVED? YES ✅
- [ ] QA: 0 new failures? YES ✅

**Verdict:** PROCEED with v0.2.4 release prep

### Release Day (2026-04-25)

**Attendees:** @dev, @devops

**Pre-release Checks:**
- [ ] All linting fixed (npm run lint passes)
- [ ] All TypeScript fixed (npm run typecheck passes)
- [ ] All tests passing (npm test passes)
- [ ] No pre-existing code violations

**Release Authority:** @devops (EXCLUSIVE)

---

## 🚦 Authority Summary Table

| Authority | Agent | Exclusive | Authority Type |
|-----------|-------|-----------|-----------------|
| Code Implementation | @dev | — | Technical Authority |
| Quality Assurance | @qa | YES | Exclusive (Article V) |
| Architecture Review | @architect | YES | Exclusive (Design) |
| Release/Push | @devops | YES | Exclusive (Article V) |
| Product Decisions | @pm | — | Advisory |
| Constitutional Enforcement | @aiox-master | YES | Framework Governance |

---

## 📞 Contact & Escalation

### For Each Gate

**Gate 1 (CodeRabbit) Issue:**
- Primary: @dev (Dex) — fixes code
- Contact: Slack #dev-team or GitHub issue

**Gate 2 (Architecture) Concern:**
- Primary: @architect (Aria) — approves design
- Contact: Slack #architecture or design review

**Gate 3 (QA) Failure:**
- Primary: @qa (Quinn) — manages tests
- Contact: Slack #qa-team or test report

**Release/Push Question:**
- Primary: @devops (Gage) — manages releases
- Contact: Slack #devops or GitHub PR

**Constitutional Violation:**
- Primary: @aiox-master
- Contact: Escalation required immediately

---

## 🎯 Success Criteria (By 2026-04-25)

| Criterion | Owner | Target | Current |
|-----------|-------|--------|---------|
| Linting errors fixed | @dev | 0 | 12 (in progress) |
| TypeScript errors fixed | @dev | 0 | 14 (in progress) |
| New test failures | @qa | 0 | 0 ✅ |
| Architecture approved | @architect | APPROVED | APPROVED ✅ |
| Release ready | @devops | YES | TBD (2026-04-25) |

---

**Framework:** Synkra AIOX 10/10
**Matrix Status:** ACTIVE (2026-03-15 → 2026-04-25)
**Last Updated:** 2026-03-15 14:00:00Z
