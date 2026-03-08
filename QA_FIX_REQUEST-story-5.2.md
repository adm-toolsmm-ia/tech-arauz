# QA FIX REQUEST — Story 5.2: Design Tokens DTCG

**Story ID:** 5.2
**Issued by:** Quinn (@qa)
**Date Issued:** 2026-03-08
**Priority:** HIGH
**Blocks Merge:** YES

---

## ⚠️ Summary

Story 5.2 is **60% complete** with 2 of 3 acceptance criteria met. **AC-003 and critical documentation are missing**, blocking merge to main.

**Issue:** Visual regression testing and token documentation not completed.

**Action Required:** Complete AC-003 items before story can be approved.

---

## Missing Items (Blocking)

### 🔴 **CRITICAL: AC-003 — Validação de Compatibilidade com Componentes**

#### Issue 1: Visual Regression Testing (NOT DONE)
**Status:** ❌ MISSING
**Impact:** Cannot verify 109 components render identically with new token integration

**Checklist to Complete:**
```
- [ ] Select 10 critical components (Button, Input, Card, Modal, Select, Badge, Alert, Toast, Tabs, Dropdown)
- [ ] Take BEFORE screenshot of current state (without token changes)
- [ ] Apply token integration (tailwind.config.ts + design/tokens.json)
- [ ] Run: npm run build (verify 0 errors, 0 warnings)
- [ ] Run: npm run dev (verify starts without errors)
- [ ] Take AFTER screenshot of same 10 components
- [ ] Compare pixel-by-pixel or visual inspection
- [ ] Document result: "✅ PASSED — No visual regressions" OR "❌ FAILED — [list regressions]"
- [ ] Sign-off with before/after evidence
```

**Estimated Time:** 2-3 hours
**Owner:** @dev or @ux-design-expert

---

#### Issue 2: Documentation (NOT DONE)
**Status:** ❌ MISSING
**Impact:** Developers don't know how to use tokens, defeating the entire purpose of standardization

**Files to Create:**

**File 1: `docs/design/tokens.md`**
```
Required Sections:
- [ ] Introduction: What are tokens? Why do they matter?
- [ ] Token Catalog: Complete listing of all 85 tokens with:
      * Token name (e.g., color-primary-500)
      * Value (e.g., #3b82f6)
      * Category (color, typography, spacing, etc)
      * Usage example
- [ ] Naming Convention: Explain {category}-{name} pattern
- [ ] Usage Examples: How to use colors, spacing, typography in Tailwind
- [ ] Accessibility: Which color pairs meet WCAG AA contrast requirements
- [ ] Extending Tokens: How to add new tokens (for Phase 2)
- [ ] Migration Guide: Reference to token-migration-guide.md
```

**File 2: `docs/design/token-migration-guide.md`**
```
Required Sections:
- [ ] Overview: "Phase 2 migration strategy for using tokens in components"
- [ ] Before/After Examples: Show hardcoded vs token-based code
- [ ] Step-by-Step: How to migrate a single component
- [ ] Patterns: Recommended approaches for:
      * Color usage (semantic vs direct)
      * Spacing consistency
      * Typography hierarchy
- [ ] FAQs: Common questions developers will ask
```

**Estimated Time:** 1-2 hours
**Owner:** @dev or @ux-design-expert

---

### 🟡 **MEDIUM: Definition of Done Items**

#### Issue 3: Build & Test Validation (NOT DOCUMENTED)
**Status:** ❌ NOT VERIFIED
**Impact:** Unknown if integration works end-to-end

**Checklist to Complete:**
```
- [ ] Run: npm run build
      * [ ] 0 errors
      * [ ] 0 warnings
      * [ ] Build output contains token references (CSS variables or Tailwind classes)

- [ ] Run: npm test
      * [ ] 100% pass rate
      * [ ] No new test failures
      * [ ] Verify no regressions in existing tests

- [ ] Run: npm run typecheck (if TypeScript)
      * [ ] 0 errors
      * [ ] Tokens are properly typed for imports

- [ ] Run: npm run lint
      * [ ] 0 errors on new/modified files
      * [ ] JSON lint on design/tokens.json — PASSED
```

**Estimated Time:** 1 hour
**Owner:** @dev

---

#### Issue 4: Accessibility Validation (NOT DONE)
**Status:** ❌ NOT VERIFIED
**Impact:** Design tokens may not meet WCAG AA color contrast requirements

**Checklist to Complete:**
```
- [ ] Validate all semantic colors (success, warning, error, info) against white background
      * [ ] success #22c55e on #ffffff — PASS (contrast ratio > 4.5:1)
      * [ ] warning #f59e0b on #ffffff — PASS
      * [ ] error #ef4444 on #ffffff — PASS
      * [ ] info #3b82f6 on #ffffff — PASS

- [ ] Validate text color accessibility:
      * [ ] Dark text (#1f2937) on light backgrounds — PASS
      * [ ] Light text (#f3f4f6) on dark backgrounds — PASS

- [ ] Document accessible color pairs in `docs/design/tokens.md`
      * [ ] Light theme: text + background pairs
      * [ ] Dark theme: text + background pairs
      * [ ] Use WCAG AA as minimum standard
```

**Tool:** WebAIM Color Contrast Checker or Accessible Colors tool
**Estimated Time:** 0.5 hours
**Owner:** @ux-design-expert

---

#### Issue 5: CodeRabbit Review (NOT DONE)
**Status:** ❌ NOT EXECUTED
**Impact:** Potential code quality, security, or architecture issues not caught

**Checklist to Complete:**
```
- [ ] Run CodeRabbit on design/tokens.json
      * [ ] Check DTCG schema compliance
      * [ ] Validate token naming consistency
      * [ ] Ensure no hardcoded values in structure

- [ ] Run CodeRabbit on tailwind.config.ts
      * [ ] Validate token extraction helpers
      * [ ] Check for hardcoded values
      * [ ] Verify fallback strategy

- [ ] Address all CRITICAL + HIGH severity issues
      * [ ] No security vulnerabilities
      * [ ] No architectural anti-patterns

- [ ] Document CodeRabbit findings in PR description
```

**Estimated Time:** 0.5 hours
**Owner:** @dev

---

## Summary of Effort

| Item | Time | Owner | Status |
|------|------|-------|--------|
| Visual Regression Testing | 2-3h | @dev/@ux-design-expert | ❌ PENDING |
| Create tokens.md | 1h | @dev/@ux-design-expert | ❌ PENDING |
| Create token-migration-guide.md | 1h | @dev/@ux-design-expert | ❌ PENDING |
| Build/Test/Lint Validation | 1h | @dev | ❌ PENDING |
| Accessibility Validation | 0.5h | @ux-design-expert | ❌ PENDING |
| CodeRabbit Review | 0.5h | @dev | ❌ PENDING |
| **TOTAL** | **6-7 hours** | **@dev + @ux-design-expert** | **BLOCKED** |

---

## Next Steps

1. **Immediately:** Share this QA_FIX_REQUEST with @dev and @ux-design-expert
2. **Assign Owner:** One of them coordinates completion of all items
3. **Prioritize:** Visual regression testing + documentation are most critical
4. **Timeline:** Target completion within 1 working day
5. **Notify QA:** Once items are complete, @qa will re-review and approve

---

## Re-Review Criteria

Story 5.2 will be **APPROVED** once:
- ✅ Visual regression testing complete (no regressions found)
- ✅ `docs/design/tokens.md` created with full catalog
- ✅ `docs/design/token-migration-guide.md` created with examples
- ✅ Build/test/lint validation passed
- ✅ Accessibility validation completed (WCAG AA verified)
- ✅ CodeRabbit review passed (0 CRITICAL/HIGH issues)

---

**Issued by:** Quinn (@qa)
**Gate Status:** 🔴 **BLOCKED** — Awaiting AC-003 completion
**Required for:** Merge to main

*QA Fix Request — Story 5.2: Design Tokens DTCG Standard*
