# Accessibility Roadmap — Known Issues & Phase 2 Plan

**Created:** 2026-03-08  
**Current Phase:** 1 (Automated Testing + Manual Audit)  
**Next Phase:** 2 (Remediation + Enhancement)  

---

## Severity Levels

- 🔴 **CRITICAL** — Blocks accessibility compliance, must fix immediately
- 🟠 **MAJOR** — Significant impact on accessibility, fix in Phase 2
- 🟡 **MINOR** — Nice-to-have improvements, low priority
- 🟢 **RESOLVED** — Fixed in Phase 1

---

## Phase 1 Issues (Current — 2026-03)

### 🟢 Resolved

- ✅ Core UI components have jest-axe tests (21 components, 40+ tests)
- ✅ Test suite passes all axe-core checks
- ✅ CI/CD integration via GitHub Actions
- ✅ Component a11y guide documented
- ✅ Color contrast validated for main palette

---

## Phase 2 Issues (Planned — 2026-04+)

### 🟠 MAJOR: Dark Mode Color Palette

**Issue:** Dark mode color tokens not validated for WCAG AA contrast  
**Impact:** Users preferring dark mode may see insufficient contrast  
**Owner:** @ux-design-expert (Uma)  
**Effort:** 2-3h  
**Timeline:** April 2026  

**Resolution:** Create dark-mode color palette with validated contrast ratios

```
- Gray-800 background with light text
- Re-validate all semantic colors (success, warning, error, info)
- Update jest-axe tests to include dark mode variants
```

---

### 🟠 MAJOR: Focus Indicator Consistency

**Issue:** Focus indicators inconsistent across components  
**Impact:** Users navigating with Tab key may miss focus  
**Owner:** @ux-design-expert (Uma)  
**Effort:** 1-2h  
**Timeline:** April 2026  

**Resolution:** Standardize focus ring styling:
- Use 2px solid outline
- Color: primary-500 (#0061E0)
- Offset: 2px
- Test with keyboard navigation

---

### 🟡 MINOR: Tooltip Accessibility

**Issue:** Tooltips may not announce to screen readers in all contexts  
**Impact:** Screen reader users miss helpful context  
**Owner:** @ux-design-expert (Uma)  
**Effort:** 1-2h  
**Timeline:** May 2026  

**Resolution:** Add aria-live regions to critical tooltips

---

### 🟡 MINOR: Form Validation Messages

**Issue:** Some validation messages not associated with inputs  
**Impact:** Users may not understand why field is invalid  
**Owner:** @dev (Dex)  
**Effort:** 2-3h  
**Timeline:** May 2026  

**Resolution:** Add aria-describedby to all error messages

```tsx
// Before
<input type="email" />
<span className="error">Invalid email</span>

// After
<input
  type="email"
  aria-invalid="true"
  aria-describedby="email-error"
/>
<span id="email-error" role="alert">
  Invalid email format. Example: user@domain.com
</span>
```

---

### 🟡 MINOR: Document Structure Headings

**Issue:** Some pages missing h1 or have multiple h1 tags  
**Impact:** Screen reader users cannot navigate page structure  
**Owner:** @dev (Dex)  
**Effort:** 1-2h  
**Timeline:** May 2026  

**Resolution:** Audit page headers and ensure:
- One h1 per page
- Heading hierarchy (h1 → h2 → h3)
- Descriptive heading text

---

## Dependencies & Blocking

| Task | Depends On | Blocked By |
|------|-----------|-----------|
| Dark Mode Colors | Color palette finalized | Design token refactor (TBD) |
| Focus Indicators | Current focus styles | Theme system update (Phase 2) |
| Tooltip A11y | Tooltip component | Component refactor (May) |

---

## Testing Validation

All Phase 2 fixes must:
1. ✅ Pass jest-axe automated tests
2. ✅ Pass WCAG 2.1 Level AA manual audit
3. ✅ Work with keyboard navigation (Tab, Arrow, Enter, Escape)
4. ✅ Work with NVDA screen reader (Windows)
5. ✅ Updated in component test files

---

## Success Criteria

**Phase 2 Complete when:**
- ✅ All MAJOR issues resolved
- ✅ MINOR issues documented with fix timeline
- ✅ All tests passing (jest-axe + manual)
- ✅ Documentation updated
- ✅ @qa sign-off on accessibility gate

---

## Questions & Escalations

- **Q: Do we need AAA compliance?**  
  A: No, WCAG AA is sufficient for LGPD. AAA is optional.

- **Q: What about macOS / VoiceOver?**  
  A: NVDA on Windows is primary. VoiceOver testing in Phase 2+ if needed.

- **Q: Do we need to support older browsers?**  
  A: Yes, IE11 and older. Test with axe-core in older browsers.

---

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [jest-axe](https://github.com/nickcolley/jest-axe)
- [NVDA Download](https://www.nvaccess.org/)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

*Last updated: 2026-03-08 | Owner: @ux-design-expert (Uma) | Framework: React + Radix UI*
