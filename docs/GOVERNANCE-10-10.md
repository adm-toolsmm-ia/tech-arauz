# Governance 10/10 — Quality Gates, Lifecycle, Constitutional Compliance

**Version:** 1.0.0
**Framework:** Synkra AIOX v1.0.0

---

## Governance Pillars

1. **[QUALITY-GATES-FRAMEWORK.md](./governance/QUALITY-GATES-FRAMEWORK.md)** — Pre-push, pre-PR, pre-deploy gates
2. **[STORY-LIFECYCLE-GATES.md](./governance/STORY-LIFECYCLE-GATES.md)** — State transitions & acceptance
3. **[CONSTITUTIONAL-COMPLIANCE.md](./governance/CONSTITUTIONAL-COMPLIANCE.md)** — 6 principles validation
4. **[FRAMEWORK-LAYER-MODEL.md](./governance/FRAMEWORK-LAYER-MODEL.md)** — L1-L4 mutation rules
5. **[CODE-INTELLIGENCE-GOVERNANCE.md](./governance/CODE-INTELLIGENCE-GOVERNANCE.md)** — IDS + entity registry
6. **[SECURITY-STANDARDS.md](./governance/SECURITY-STANDARDS.md)** — OWASP + RLS + auth

---

## Gate Hierarchy

```
Pre-Push (Local)         Pre-PR (CI)           Pre-Merge (QA)
↓                        ↓                     ↓
npm run gate            CodeRabbit             @qa *qa-gate
• lint ✅               • security ✅         • 7-point checklist ✅
• typecheck ✅          • perf ✅
• test ✅               • audit ✅
```

---

## Story Lifecycle

```
Draft → Ready → InProgress → InReview → Done
@po ✅  @dev ✅   @qa ✅      @devops ✅
```

---

## Constitutional Principles

| # | Principle | Enforcement |
|---|-----------|------------|
| I | CLI First | Task-based execution |
| II | Agent Authority | Exclusive ops matrix |
| III | Story-Driven | [Story X.Y] tag in commits |
| IV | No Invention | Spec gate traces to FR/NFR |
| V | Quality First | Pre-push gate blocks bad code |
| VI | Absolute Imports | ESLint enforces @/ prefix |

---

**Authored by:** Claude Code (Haiku 4.5)
