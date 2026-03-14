# Quality Gates Framework — Pre-Push, Pre-PR, Pre-Deploy (AIOX 10/10)

**Version:** 0.2.3
**Status:** Authoritative

---

## 3-Layer Gate System

### PRE-PUSH GATE (Local)

**Command:** `npm run gate`

**Checks:**
- [ ] ESLint: zero errors
- [ ] TypeScript: zero errors (strict mode)
- [ ] Tests: all pass, ≥85% coverage
- [ ] Prettier: code style correct

**Bypass:** None (mandatory)

**Failure Action:** Fix locally, re-run gate

---

### PRE-PR GATE (CI)

**Automated on every PR**

**Checks:**
- [ ] CodeRabbit: no critical issues
- [ ] npm audit: no critical vulnerabilities
- [ ] Build size: < 500KB main JS
- [ ] Accessibility: jest-axe WCAG AA pass

**Bypass:** Waive specific check (rare, @qa approval)

---

### PRE-DEPLOY GATE (Release)

**Before pushing to production**

**Checks:**
- [ ] QA gate: all 7 points PASS
- [ ] Database migrations: reviewed + tested
- [ ] Environment variables: all present
- [ ] Release notes: generated
- [ ] Rollback plan: documented

**Bypass:** None (release-blocking)

---

## Gate Results

| Result | Action | Next Step |
|--------|--------|-----------|
| **PASS** | All checks pass | Proceed to next phase |
| **FAIL** | One or more checks fail | Fix issue, re-run gate |
| **WAIVE** | Intentionally skip check | Document reason, @qa approval |

---

**Authored by:** Claude Code (Haiku 4.5)
