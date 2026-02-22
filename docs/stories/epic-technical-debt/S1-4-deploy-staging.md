# S1-4: Deploy to Staging — Merge & Deploy to Vercel Preview

**Epic:** epic-technical-debt
**Story ID:** S1-4
**Status:** Ready
**Complexity:** 6/25 (SIMPLE)
**Story Points:** 3
**Effort:** 2h
**Owner:** @devops
**Priority:** P1 (release)
**Validated By:** @po (Pax)
**Validation Date:** 2026-02-22
**Validation Score:** 10/10
**Verdict:** GO

---

## User Story

Como DevOps,
Quero mergear S1-1, S1-2, S1-3 para staging branch e deploy,
Para que stakeholders testem dark mode + RLS em ambiente preview.

---

## Acceptance Criteria

- [ ] AC-1: Feature branch S1-1 + S1-2 + S1-3 merged to staging
- [ ] AC-2: Deployed to Vercel preview environment
- [ ] AC-3: Smoke tests passing (5-10 min checks)
- [ ] AC-4: Dark mode toggle visible + functional in staging
- [ ] AC-5: RLS still working (no auth errors)
- [ ] AC-6: Stakeholders notified with staging URL
- [ ] AC-7: Deployment logs documented
- [ ] AC-8: Ready for production merge approval

---

## Scope

### IN
- Merge staging
- Deploy Vercel
- Smoke tests
- Stakeholder notification

### OUT
- Production merge (separate decision)
- Monitoring setup
- Rollback procedures

---

## Dependencies

- S1-1, S1-2, S1-3 all completed
- All PRs reviewed + approved

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Merge conflict | MEDIUM | MEDIUM | Resolve early, communicate |
| Deploy fails | LOW | HIGH | Test locally first, rollback ready |
| Staging env down | LOW | HIGH | Contact Vercel, use backup |

---

## Definition of Done

- [ ] All 3 PRs merged to staging
- [ ] Deployed successfully
- [ ] Smoke tests passing
- [ ] Stakeholders testing
- [ ] Zero critical issues found
- [ ] Deployment documented
- [ ] Reviewed by @devops peer
- [ ] Commit: `chore: deploy S1-1,2,3 to staging preview [S1-4]`

---

## File List

(will be populated by @devops)

---

## Dev Notes

(will be populated by @devops)

---

## Change Log

- **2026-02-22** | Created | Status: Draft
- **2026-02-22** | Validated | Status: Draft → Ready | 10-point checklist passed (10/10), @po approval, final sprint gate
