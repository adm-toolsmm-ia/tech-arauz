# 🎯 Vercel Production Validation Gate

**Framework:** AIOX Quality Gate Pattern  
**Status:** ✅ Active  
**Responsibility:** QA team + Admin (tecnologia@arauz.com.br)  
**Execution:** Post-deployment validation (every deploy)

---

## 📊 Pre-Deployment Checklist (Before Push)

- [ ] **Code Quality:** `npm run lint` → ✅ No errors
- [ ] **Type Safety:** `npm run typecheck` → ✅ No errors
- [ ] **Tests:** `npm test` → ✅ All passing
- [ ] **Build:** `npm run build` → ✅ Success
- [ ] **Git Status:** No uncommitted changes
- [ ] **Branch:** On `main` or PR ready for merge
- [ ] **Story Status:** Marked as "Done" or "Ready for Review"

**Gate Result:** ✅ PASS → Proceed to push

---

## 🚀 Post-Deployment Checklist (After Push)

### Phase 1: Vercel Build Status (2-3 minutes)
- [ ] **URL:** Navigate to https://arauz-tech.vercel.app/
- [ ] **Load Time:** Page loads within 3 seconds
- [ ] **Console Errors:** No JavaScript errors in browser console
- [ ] **Build Logs:** Check Vercel dashboard — no build warnings
- [ ] **Environment Variables:** All `.env` vars injected correctly

**Gate Result:** ✅ PASS → Continue to Phase 2

---

### Phase 2: Application Validation (10 minutes)

#### 2.1 Authentication
- [ ] **Login Page:** Loads and renders correctly
- [ ] **Login Flow:** Can authenticate with Supabase
- [ ] **Session:** Auth token persists in localStorage
- [ ] **Logout:** Can logout and session clears

#### 2.2 Core Features (EPIC-19 Espaider v2)
- [ ] **Projects List:** Loads from API (v2 or v1)
- [ ] **Project Detail:** Can view project information
- [ ] **Integration Status:** Shows "Connected" or "Needs Config"
- [ ] **Sync Logs:** Can view sync history
- [ ] **API Version Toggle:** Settings → Integrations → Espaider (shows v1/v2 option)

#### 2.3 Data Validation
- [ ] **Project Count:** Non-zero projects displayed
- [ ] **Activity Count:** Activities load without errors
- [ ] **Pagination:** Can navigate pages (if applicable)
- [ ] **Search:** Search functionality works
- [ ] **Filters:** Any filters apply correctly

#### 2.4 Error Handling
- [ ] **Network Error:** App handles gracefully (shows error message)
- [ ] **API Error:** 500 error renders fallback UI
- [ ] **Missing Data:** Empty states show placeholder

**Gate Result:** ✅ PASS → Continue to Phase 3

---

### Phase 3: Integration Testing (5 minutes)

#### 3.1 Supabase Integration
- [ ] **Database Connection:** API calls succeed
- [ ] **RLS Policies:** User sees only their tenant's data
- [ ] **Real-time Updates:** Subscriptions work (if applicable)
- [ ] **Query Performance:** Queries complete in <500ms

#### 3.2 Espaider Integration (v1 + v2)
- [ ] **v1 API:** Sync works with v1 endpoint
- [ ] **v2 API:** Sync works with v2 endpoint (if toggled)
- [ ] **Token Rotation:** Refresh token handling works
- [ ] **Error Recovery:** Failed sync shows meaningful error

#### 3.3 AI Service (if configured)
- [ ] **Connection:** AI service endpoint responds
- [ ] **Inference:** Can call AI models (embedding, completion, etc)
- [ ] **Response Time:** <3 seconds for typical requests
- [ ] **Error Handling:** API errors handled gracefully

**Gate Result:** ✅ PASS → Deployment validated

---

## ⚠️ Failure Recovery

If ANY checklist item fails at Phase 1, 2, or 3:

| Phase | Action | Rollback |
|-------|--------|----------|
| **Phase 1** | Build failed | `git revert <commit> && git push origin main` |
| **Phase 2** | UI broken | Same as Phase 1 |
| **Phase 3** | API integration broken | Same as Phase 1 |

**Rollback Time:** ~2-3 minutes (Vercel redeploys previous commit)

---

## 📝 Sign-Off

**Validation Date:** ___________  
**Validated By:** ___________  
**Notes:** 

```
Phase 1: ☐ Pass  ☐ Fail
Phase 2: ☐ Pass  ☐ Fail
Phase 3: ☐ Pass  ☐ Fail

Overall Gate: ☐ APPROVED  ☐ REJECTED
```

---

## 🔄 Automation (Future)

When full CI/CD is enabled:

```yaml
# .github/workflows/vercel-validation.yml
trigger: on_vercel_deployment_complete
jobs:
  - Run Phase 1 checks (automated)
  - Run Phase 2 checks (automated)
  - Run Phase 3 checks (automated)
  - Post results to GitHub
  - Notify Slack if failures
```

---

**Framework:** AIOX Quality Gate Pattern  
**Last Updated:** 2026-05-15  
**Owner:** DevOps (Gage) + QA Team
