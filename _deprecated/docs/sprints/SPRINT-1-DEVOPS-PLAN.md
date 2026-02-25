# Sprint 1 DevOps Plan

**Sprint Duration:** Feb 24 - Feb 28, 2026
**Release Target:** Staging (Feb 28, 2026)
**Team:** @devops

---

## Pre-Deployment Checklist (Feb 27-28)

- [ ] Feature branches created and tracked
- [ ] All PRs created and under review
- [ ] All tests passing locally
- [ ] No merge conflicts identified
- [ ] Linting/TypeScript: 0 errors
- [ ] Vercel environment variables verified
- [ ] Staging branch up-to-date

---

## Deployment Steps (Feb 28)

### 1. Pre-Deployment (9:00 AM)

```bash
# Verify staging branch exists and is up-to-date
git fetch origin
git status

# Check feature branches are ready
git log --oneline origin/feat/dark-mode-ui -5
git log --oneline origin/feat/rls-policy-framework -5
git log --oneline origin/feat/tests-dark-mode -5
```

### 2. Merge to Staging (9:30 AM)

```bash
# Checkout staging
git checkout staging

# Pull latest
git pull origin staging

# Merge feature branches
git merge origin/feat/dark-mode-ui --no-ff -m "merge: S1-1 dark mode UI [Sprint-1]"
git merge origin/feat/rls-policy-framework --no-ff -m "merge: S1-2 RLS policy framework [Sprint-1]"
git merge origin/feat/tests-dark-mode --no-ff -m "merge: S1-3 dark mode tests [Sprint-1]"

# Push to origin (triggers Vercel deployment)
git push origin staging
```

### 3. Vercel Deployment (9:40 AM)

- Vercel detects push to staging
- Builds and deploys automatically (~3-5 minutes)
- Check deployment status: https://vercel.com/[team]/[project]
- Wait for status: "Ready"

### 4. Post-Deployment Smoke Tests (9:50 AM)

```bash
# Run smoke tests against staging URL
npm run test:smoke -- --baseUrl=https://tech-arauz-staging.vercel.app

# OR manual checks:
# - Open homepage
# - Check dark toggle visible in Sidebar
# - Click toggle → dark mode applies
# - Check browser console for errors (F12)
# - Test authentication flow
# - Test RLS (login as different user, verify isolation)
```

### 5. Stakeholder Notification (10:00 AM)

Send email/Slack:
```
Subject: Sprint 1 Staging Deployment Ready for Testing

Staging URL: https://tech-arauz-staging.vercel.app
Features: Dark Mode UI + RLS Policy Framework
Testing Window: Feb 28 - Mar 2

Key features to test:
1. Dark mode toggle in Sidebar (upper right)
2. Theme persists after page refresh
3. No layout breaks on mobile
4. Authentication still works
5. RLS isolation verified

Feedback form: [link]
Issues: Please report in Slack #tech-arauz-dev
```

---

## Vercel Configuration

**Current Setup:**
- Vercel project: `tech-arauz`
- Deployment branches: `main` (prod), `staging` (preview)
- Auto-deploy: enabled for all branches
- Environment variables: verified and up-to-date

**Preview URL Pattern:**
- Staging: https://tech-arauz-staging.vercel.app
- Feature PRs: https://tech-arauz-[pr-number].vercel.app

---

## Rollback Plan

If deployment fails or critical issue found:

```bash
# Option 1: Revert last merge
git revert -m 1 HEAD
git push origin staging
# Vercel auto-redeploys previous version

# Option 2: Force previous version
git reset --hard origin/staging~3
git push origin staging --force
# Use only if Option 1 doesn't work
```

---

## Success Criteria

- [x] All 3 feature branches merged to staging
- [ ] Deployment successful (Vercel status: Ready)
- [ ] Homepage loads without 5xx errors
- [ ] Dark mode toggle visible and functional
- [ ] Auth/RLS working (no permission errors)
- [ ] No critical console errors
- [ ] Stakeholders notified
- [ ] Staging URL shared in team Slack

---

## Timeline

| Date | Time | Task | Status |
|------|------|------|--------|
| Feb 28 | 9:00 AM | Pre-deployment checklist | Pending |
| Feb 28 | 9:30 AM | Merge to staging | Pending |
| Feb 28 | 9:40 AM | Vercel deployment | Pending |
| Feb 28 | 9:50 AM | Smoke tests | Pending |
| Feb 28 | 10:00 AM | Stakeholder notification | Pending |
| Feb 28 | 10:15 AM | Sprint 1 staging complete | Pending |

---

## Monitoring & Support

**During Deployment:**
- Monitor Vercel logs in real-time
- Check deployment status every 2 minutes
- Be ready to rollback if needed

**Post-Deployment:**
- Monitor staging environment for 24h
- Watch for error spikes in Vercel Analytics
- Response SLA: <1h for critical issues

**Contact:**
- Vercel Status: https://vercel.statuspage.io
- Team: @devops (primary), @aios-master (escalation)

---

## Production Merge (Separate Decision)

After stakeholder testing and approval:
1. Create PR from staging → main
2. Require @architect review
3. Merge after approval
4. Monitor prod metrics closely

This is scheduled for **Week of Mar 3** (TBD based on feedback).
