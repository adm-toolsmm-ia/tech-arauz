# Constitutional Compliance — 6 Principles Validation (AIOX 10/10)

**Version:** 1.0.0 (Inviolable)
**Status:** Binding

---

## The 6 Principles

### I: CLI First
**How:** All work via `*commands`
**Check:** Task definitions in `.aiox-core/development/tasks/`
**Status:** ✅ Enforced

### II: Agent Authority
**How:** Exclusive operations matrix
**Check:** Agent-authority.md defines boundaries
**Status:** ✅ Enforced

### III: Story-Driven
**How:** Every commit tags [Story X.Y]
**Check:** Git hook validates story ID in message
**Status:** ✅ Enforced

### IV: No Invention
**How:** Spec statements trace to FR/NFR/research
**Check:** Spec Pipeline Phase 5 critique gate
**Status:** ✅ Enforced

### V: Quality First
**How:** Pre-push gate mandatory
**Check:** `npm run gate` blocks non-compliant code
**Status:** ✅ Enforced

### VI: Absolute Imports
**How:** ESLint rule: no `../../../` imports
**Check:** `npm run lint` enforces `@/` prefix
**Status:** ✅ Enforced

---

## Compliance Per Story Phase

| Phase | Principles Checked | Owner |
|-------|-------------------|-------|
| Create | I, III, IV | @sm |
| Validate | I, II, III, IV | @po |
| Implement | I, II, III, V, VI | @dev |
| QA | I, II, III, IV, V, VI | @qa |
| Merge | I, II, III | @devops |

---

**Authored by:** Claude Code (Haiku 4.5)
