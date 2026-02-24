# Sprint 1 Agent Instructions

**Date:** 2026-02-22
**Target Audience:** @po, @dev, @data-engineer, @qa, @devops
**Status:** Ready for Execution

---

## For @po (Product Owner)

**Timeline:** Feb 23-24 (2 days)

### Task: Validate 4 Stories

**Command:** `@po *validate-story-draft S1-1`

**For each story (S1-1 through S1-4):**

1. Open story file in `/docs/stories/epic-technical-debt/S1-[N]-*.md`
2. Run 10-point validation checklist:
   - Clear and objective title
   - Complete description
   - Testable acceptance criteria (Given/When/Then format)
   - Well-defined scope (IN and OUT)
   - Dependencies mapped
   - Complexity estimate (provided)
   - Business value (clear)
   - Risks documented (provided)
   - Criteria of Done (provided)
   - Alignment with PRD/Epic

3. Decision:
   - **GO (≥7/10):** Update story status from Draft → Ready
   - **NO-GO (<7/10):** List required fixes, return to author

4. Update story file:
   - Change `Status: Draft` to `Status: Ready`
   - Add entry to Change Log: `2026-02-XX | Validated | Status: Draft → Ready`

**Priority Order:** S1-1 first (other stories depend on it)

**Success Criteria:**
- All 4 stories marked as Ready
- Zero mandatory fixes remaining
- File List and Dev Notes sections remain empty (to be filled by implementers)

---

## For @dev (Developer)

**Timeline:** Feb 24-27 (4 days)

### Task: Implement S1-1 (Dark Mode UI)

**Story:** `/docs/stories/epic-technical-debt/S1-1-dark-mode-ui.md`

**Command:** `@dev *develop S1-1`

**What to build:**

1. **Toggle Switch in Sidebar**
   - Add sun/moon icon toggle button
   - Location: top-right of Sidebar component
   - State: stored in React context or Zustand

2. **CSS Variables for Dark Theme**
   - Define variables in globals.css or theme file
   - Cover: background, text color, borders, shadows
   - Apply to: all 5 main pages (dashboard, projetos, cronogramas, entregas, integracoes)

3. **localStorage Persistence**
   - Save preference when user toggles
   - Load preference on app mount
   - Fallback: light mode if no stored preference

4. **WCAG AA Compliance**
   - Contrast ratio ≥4.5:1 for all text
   - Test with accessibility tools
   - Validate with WAVE or similar

5. **Smooth Animation**
   - 0.3s transition on theme switch
   - No jarring color changes

**Acceptance Criteria:** All 8 ACs must be met (see story file)

**Definition of Done:**
- [ ] Dark mode toggle visible in Sidebar
- [ ] CSS variables defined
- [ ] localStorage working
- [ ] Tests passing (S1-3 covers testing)
- [ ] Linting: 0 errors
- [ ] TypeScript: 0 errors
- [ ] Peer review: approved by @dev peer
- [ ] WCAG AA validated
- [ ] Commit: `feat: add dark mode UI with theme persistence [S1-1]`

**File List:** Update story file as you modify/create files
**Dev Notes:** Document decisions and blockers

---

## For @data-engineer (Database Engineer)

**Timeline:** Feb 24-27 (4 days)

### Task: Implement S1-2 (RLS Policy Framework)

**Story:** `/docs/stories/epic-technical-debt/S1-2-rls-policy-framework.md`

**Command:** `@data-engineer *develop S1-2`

**What to build:**

1. **audit_rls_policy() SQL Function**
   - Input: table name (or run all 11 tables)
   - Output: report of missing/overly permissive policies
   - Check each table for: USING clause, WITH CHECK clause, row-level filtering

2. **Audit All 11 Tables**
   - tenants
   - profiles
   - projects
   - deliveries
   - schedules
   - requirements
   - project_histories
   - project_approvers
   - project_budgets
   - integration_log_entries
   - espaider_apis

3. **Generate RLS-AUDIT-REPORT.md**
   - List all tables and their policies
   - Document any gaps found
   - Recommend fixes

4. **Fix Any Critical Gaps**
   - Update RLS policies if needed
   - Create migrations for any fixes
   - Test that Service role can sync, users cannot cross-tenant access

5. **Multi-Tenant Isolation Tests**
   - Verify Tenant A cannot access Tenant B data
   - Verify Service role (for Espaider sync) can still operate
   - Run with real Supabase credentials

**Acceptance Criteria:** All 8 ACs must be met (see story file)

**Definition of Done:**
- [ ] audit_rls_policy() function created
- [ ] All 11 tables audited
- [ ] RLS-AUDIT-REPORT.md generated
- [ ] Zero critical gaps (1-2 medium acceptable)
- [ ] Service role can sync
- [ ] User isolation tests passing
- [ ] Migrations committed
- [ ] Peer review: approved by @architect
- [ ] Commit: `feat: add RLS policy framework and audit [S1-2]`

**File List:** Update story file as you modify/create migrations and reports
**Dev Notes:** Document audit findings and fix rationale

---

## For @qa (QA Engineer)

**Timeline:** Feb 24-27 (4 days)

### Task 1: Follow SPRINT-1-QA-PLAN.md

**File:** `/docs/sprints/SPRINT-1-QA-PLAN.md`

Execute testing strategy as documented:
- Setup Jest, Cypress, Supabase test client
- Create test files for S1-1 (dark mode)
- Create integration tests for S1-2 (RLS)
- Ensure 80% coverage
- All tests passing by Feb 27

### Task 2: Create S1-3 (Tests Story Deliverable)

**Story:** `/docs/stories/epic-technical-debt/S1-3-tests-dark-mode.md`

**What to deliver:**

1. **Unit Tests**
   - Toggle state logic (on/off)
   - localStorage save/load
   - CSS variable application
   - Preference persistence across mounts

2. **Integration Tests**
   - CSS vars applied to all components
   - No layout breaks (responsive)
   - Animation timing (0.3s)
   - Color contrast (WCAG AA ≥4.5:1)

3. **E2E Tests**
   - User clicks toggle → dark mode visible
   - Refresh page → dark mode persists
   - Toggle again → light mode returns
   - All 5 pages render correctly in dark mode

4. **Coverage Report**
   - Target: ≥80% for dark mode code
   - Generate coverage report (npm test -- --coverage)

5. **Test Documentation**
   - Document test suites and what they cover
   - Instructions for running tests

**Definition of Done:**
- [ ] All tests created (unit + integration + E2E)
- [ ] Coverage ≥80%
- [ ] All tests passing
- [ ] Tests documented
- [ ] Peer review: approved by @qa peer
- [ ] Commit: `test: add comprehensive dark mode test suite [S1-3]`

**File List:** Update story file as you create test files
**Dev Notes:** Document test strategy and any edge cases

---

## For @devops (DevOps Engineer)

**Timeline:** Feb 27-28 (2 days)

### Task: Deploy S1 to Staging

**Story:** `/docs/stories/epic-technical-debt/S1-4-deploy-staging.md`

**Deployment Plan:** `/docs/sprints/SPRINT-1-DEVOPS-PLAN.md`

**Timeline:** Feb 28, 9:00 AM - 10:15 AM

**Command:** `@devops *deploy S1-4`

**Step-by-step execution (from SPRINT-1-DEVOPS-PLAN.md):**

1. **9:00 AM - Pre-Deployment Checks**
   - Verify feature branches exist
   - Check all PRs reviewed and approved
   - Confirm tests passing locally
   - No merge conflicts identified

2. **9:30 AM - Merge to Staging**
   ```bash
   git checkout staging
   git pull origin staging
   git merge origin/feat/dark-mode-ui --no-ff
   git merge origin/feat/rls-policy-framework --no-ff
   git merge origin/feat/tests-dark-mode --no-ff
   git push origin staging
   ```

3. **9:40 AM - Vercel Deployment**
   - Wait for Vercel to detect push
   - Monitor deployment (~3-5 minutes)
   - Check deployment status: Ready

4. **9:50 AM - Post-Deployment Smoke Tests**
   - Homepage loads without 5xx errors
   - Dark mode toggle visible in Sidebar
   - Dark mode toggle functional
   - Auth/RLS not broken
   - No critical console errors
   - Mobile responsive

5. **10:00 AM - Stakeholder Notification**
   - Send email with staging URL
   - Share testing checklist
   - Provide feedback form link
   - Expected testing window: Feb 28 - Mar 2

**Definition of Done:**
- [ ] All 3 feature branches merged
- [ ] Deployment successful
- [ ] Smoke tests passing
- [ ] Stakeholders notified
- [ ] Zero critical issues
- [ ] Commit: `chore: deploy S1-1,2,3 to staging preview [S1-4]`

**File List:** Update story file with deployment record
**Dev Notes:** Document any deployment issues and resolutions

---

## Execution Checklist

### Pre-Sprint (Feb 22-23)
- [ ] All story files reviewed by team
- [ ] No questions about acceptance criteria
- [ ] Test infrastructure prepared

### Story Validation (Feb 23-24)
- [ ] @po validates S1-1
- [ ] @po validates S1-2
- [ ] @po validates S1-3
- [ ] @po validates S1-4
- [ ] All stories marked Ready

### Development Phase (Feb 24-27)
- [ ] @dev starts S1-1
- [ ] @data-engineer starts S1-2
- [ ] @qa starts test infrastructure + S1-3
- [ ] Daily standup: blockers discussion
- [ ] By Feb 26: All implementation 80% complete
- [ ] By Feb 27: Code review ready

### QA & Deploy (Feb 27-28)
- [ ] @qa runs QA gate on S1-1, S1-2
- [ ] @qa approves or lists fixes
- [ ] @devops deploys to staging (9:00-10:15 AM Feb 28)
- [ ] Smoke tests passing
- [ ] Stakeholders notified

### Post-Sprint (Mar 1+)
- [ ] Stakeholder feedback collected
- [ ] Production merge planned
- [ ] Sprint 2 planning begins

---

## Escalation Path

**Blocker encountered?**
1. Notify team in Slack #tech-arauz-dev
2. If not resolved in 2 hours: escalate to @aios-master
3. Document blocker in story file Dev Notes

**Test failure that won't fix?**
1. Document in story file QA section
2. Notify @qa of severity
3. If CRITICAL: escalate to @aios-master
4. Maximum 2 iterations before escalation

**Deployment issue?**
1. Use rollback procedure from SPRINT-1-DEVOPS-PLAN.md
2. Notify team immediately
3. Document in story file Dev Notes
4. Escalate to @aios-master if needed

---

## Communication Protocol

- **Daily:** Async updates in Slack #tech-arauz-dev
- **Blockers:** Real-time escalation to team
- **Status:** Story file checkboxes updated continuously
- **Deployment:** Team notification 30min before, then post-deploy status

---

## Final Notes

- All stories are in Draft status - @po must validate first
- Parallelization: S1-1 & S1-2 can start immediately after validation
- S1-3 depends on S1-1 being ~60% complete
- S1-4 depends on all others being completed + reviewed
- Target: Staging deployment by Feb 28, 10:15 AM
- Production merge: Feedback-driven (week of Mar 3)

Questions? Ask in #tech-arauz-dev or escalate to @aios-master.

Good luck! 🚀
