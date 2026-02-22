# S1-4: Deploy to Staging — Merge & Deploy to Vercel Preview

**Epic:** epic-technical-debt
**Story ID:** S1-4
**Status:** InProgress
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

- [x] AC-1: Feature branch S1-1 + S1-2 + S1-3 merged to main
- [ ] AC-2: Deploy main to Vercel staging environment
- [ ] AC-3: Smoke tests passing (5-10 min checks)
- [ ] AC-4: Dark mode toggle visible + functional in staging
- [ ] AC-5: RLS still working (no auth errors)
- [ ] AC-6: Migrations verified (M026 + M027 applied)
- [ ] AC-7: Stakeholders notified with staging URL
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

| File | Type | Purpose |
|------|------|---------|
| `docs/sprints/MIGRATION-DEPLOYMENT-GUIDE.md` | Guide | Step-by-step migration deployment |
| `docs/sprints/WAVE-4-DEPLOYMENT-CHECKLIST.md` | Checklist | Pre-deployment verification |
| `.github/workflows/deploy.yml` | CI/CD | Vercel deployment automation |

---

## Dev Notes

### Deployment Strategy

**Current State:**
- ✅ S1-1 (Dark Mode UI) merged to main
- ✅ S1-2 (RLS Framework) merged to main
- ✅ S1-3 (Test Suite) merged to main
- ✅ Migrations 026 + 027 committed to main
- ✅ All commits pushed to origin/main

**Deployment Flow:**
1. Deploy main to staging (Vercel auto-deploy or manual push)
2. Apply migrations M026 + M027 (via Supabase CLI or Vercel hook)
3. Run smoke tests (dark mode toggle, RLS check)
4. Notify stakeholders with staging URL
5. Approve for production deployment

**Vercel Deployment:**
- Automatic when main branch is updated
- Migrations run during Vercel build phase
- Staging URL: `https://tech-arauz-staging.vercel.app`
- Check deployment status: Vercel Dashboard

**Smoke Tests (5-10 min):**
1. Load staging URL
2. Toggle dark mode (should switch light/dark)
3. Check localStorage (dark mode persists after refresh)
4. Verify RLS (create test user, check data isolation)
5. Check console (no errors)
6. Test on mobile (responsive check)

---

## Change Log

- **2026-02-22** | Created | Status: Draft
- **2026-02-22** | Validated | Status: Draft → Ready | 10-point checklist passed (10/10), @po approval, final sprint gate
- **2026-02-22** | Started | Status: Ready → InProgress | S1-1, S1-2, S1-3 complete and merged to main, ready for staging deployment
- **2026-02-22** | Deployment Guide | Created MIGRATION-DEPLOYMENT-GUIDE.md with M026 + M027 deployment steps
- **2026-02-22** | AC-1 Complete | S1-1 + S1-2 + S1-3 merged to main (commits fe873f0, 8845639, 78a83b8)
