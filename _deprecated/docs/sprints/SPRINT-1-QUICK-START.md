# Sprint 1 Quick Start Guide

**For busy people: 3-minute read**

---

## What Just Happened?

Sprint 1 bootstrap is complete. 4 stories created. Ready to go.

---

## Start Here (Choose Your Role)

### For @po (Product Owner)
**DO THIS NOW:** Open and validate all 4 stories
```
@po *validate-story-draft S1-1
@po *validate-story-draft S1-2
@po *validate-story-draft S1-3
@po *validate-story-draft S1-4
```
**Timeline:** Feb 23-24 (2 days)
**File:** `/SPRINT-1-AGENT-INSTRUCTIONS.md` (search for "For @po")

### For @dev (Developer)
**DO THIS:** Implement Dark Mode UI (S1-1)
```
@dev *develop S1-1
```
**Timeline:** Feb 24-27 (4 days)
**Effort:** 8 hours
**File:** `/SPRINT-1-AGENT-INSTRUCTIONS.md` (search for "For @dev")

### For @data-engineer (Database Engineer)
**DO THIS:** RLS Policy Framework (S1-2)
```
@data-engineer *develop S1-2
```
**Timeline:** Feb 24-27 (4 days)
**Effort:** 12 hours
**File:** `/SPRINT-1-AGENT-INSTRUCTIONS.md` (search for "For @data-engineer")

### For @qa (QA Engineer)
**DO THIS:** Create tests (S1-3) + QA Plan
```
@qa *develop S1-3
```
Follow: `/docs/sprints/SPRINT-1-QA-PLAN.md`
**Timeline:** Feb 24-27 (4 days)
**Effort:** 4 hours
**File:** `/SPRINT-1-AGENT-INSTRUCTIONS.md` (search for "For @qa")

### For @devops (DevOps Engineer)
**DO THIS:** Deploy to Staging (S1-4)
Follow: `/docs/sprints/SPRINT-1-DEVOPS-PLAN.md`
**Timeline:** Feb 28 (1 day, 9:00-10:15 AM)
**Effort:** 2 hours
**File:** `/SPRINT-1-AGENT-INSTRUCTIONS.md` (search for "For @devops")

---

## The 4 Stories at a Glance

| Story | What | Who | When | Points |
|-------|------|-----|------|--------|
| S1-1 | Dark Mode UI | @dev | Feb 24-27 | 8 |
| S1-2 | RLS Audit | @data-engineer | Feb 24-27 | 12 |
| S1-3 | Tests | @qa | Feb 24-27 | 5 |
| S1-4 | Deploy | @devops | Feb 28 | 3 |

**Total:** 28 points (1 sprint)

---

## Files You Need

### For Stories
- `/docs/stories/epic-technical-debt/S1-1-dark-mode-ui.md`
- `/docs/stories/epic-technical-debt/S1-2-rls-policy-framework.md`
- `/docs/stories/epic-technical-debt/S1-3-tests-dark-mode.md`
- `/docs/stories/epic-technical-debt/S1-4-deploy-staging.md`

### For Planning
- `/docs/sprints/SPRINT-1-QA-PLAN.md`
- `/docs/sprints/SPRINT-1-DEVOPS-PLAN.md`

### For Reference
- `/SPRINT-1-BOOTSTRAP.md` (master overview)
- `/SPRINT-1-AGENT-INSTRUCTIONS.md` (step-by-step)
- `/SPRINT-1-EXECUTIVE-SUMMARY.md` (metrics + risks)

---

## Timeline (Feb 23-28)

```
Feb 23-24: @po validates stories
Feb 24-27: @dev, @data-engineer, @qa work in parallel
Feb 27-28: @qa testing + approvals
Feb 28 9AM: @devops deploys to staging
Feb 28 10AM: Stakeholders get staging URL
```

---

## Success = All 4 Stories Done by Feb 28

That's it. When all 4 reach Done status, Sprint 1 is successful.

---

## If You're Blocked

1. Slack #tech-arauz-dev with blocker
2. If not resolved in 2 hours → escalate to @aios-master
3. Document blocker in story file Dev Notes

---

## That's It

Questions? Check the detailed files above.

Ready? Start with your role's command above.

Go! 🚀
