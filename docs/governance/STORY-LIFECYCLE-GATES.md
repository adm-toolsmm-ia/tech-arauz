# Story Lifecycle Gates — State Transitions & Acceptance (AIOX 10/10)

**Version:** 0.2.3
**Status:** Authoritative

---

## Story States

```
Draft ──→ Ready ──→ InProgress ──→ InReview ──→ Done
  ↓ NO-GO ↓
 Fixed    Blocked/Fix
```

---

## Gate: Draft → Ready

**Owner:** @po

**Checklist (10 points):**
- [ ] Title clear
- [ ] AC ≥5 bullets, specific
- [ ] Effort estimated
- [ ] File list identified
- [ ] Dependencies documented
- [ ] NFRs included
- [ ] User story format
- [ ] AC testable
- [ ] Edge cases noted
- [ ] A11y requirements included

**Decision:** GO (≥7/10) or NO-GO (<7/10)

---

## Gate: InProgress → InReview

**Owner:** @dev

**Checklist:**
- [ ] Code written
- [ ] Tests added (≥85% coverage)
- [ ] Pre-push gate passed (lint + typecheck + test)
- [ ] Story File List updated
- [ ] Commit message has [Story X.Y] tag

---

## Gate: InReview → Done

**Owner:** @qa

**7-Point Checklist:**
- [ ] Lint pass
- [ ] TypeScript pass
- [ ] Tests pass
- [ ] No hardcoded secrets
- [ ] Error handling complete
- [ ] A11y (WCAG AA)
- [ ] Documentation

**Decision:** PASS, CONCERNS, FAIL, WAIVE

---

**Authored by:** Claude Code (Haiku 4.5)
