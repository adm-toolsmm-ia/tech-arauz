# When to Create a Memory Log

> **Golden Rule:** If a future developer (human or AI) would ask *"Why did they do this?"*, write a memory log.

---

## 🌳 Decision Tree

1.  **Is this a Multi-Agent Task?** (Start of workflow)
    -   **YES** → 🛑 **MANDATORY**. Create log to coordinate context.
    -   **NO** → Proceed to 2.

2.  **Does it impact Architecture?** (Database schema, API contract, Project structure)
    -   **YES** → 🛑 **MANDATORY**. Document the design decision.
    -   **NO** → Proceed to 3.

3.  **Is it a Security Audit or Fix?**
    -   **YES** → 🛑 **MANDATORY**. Audit trail is required for compliance.
    -   **NO** → Proceed to 4.

4.  **Is it a Critical Production Bug?**
    -   **YES** → 🛑 **MANDATORY**. Document root cause to prevent regression.
    -   **NO** → Proceed to 5.

5.  **Is it Refactoring (>100 lines)?**
    -   **YES** → ⚠️ **RECOMMENDED**. Explain the "Why" behind the restructure.
    -   **NO** → Proceed to 6.

6.  **Is it a small fix, typo, or docs update?**
    -   **YES** → ✅ **OPTIONAL**. Commit message is usually sufficient.

---

## 🏷️ Examples

| Task                    | Log Required? | Reason                               |
| ----------------------- | ------------- | ------------------------------------ |
| Create `projects` table | **YES**       | Architecture change + RLS decisions  |
| Sync new Espaider field | **YES**       | Integration strategy + Mapping logic |
| Fix typo in README      | **NO**        | Trivial                              |
| Fix crash in login      | **YES**       | Critical bug + Root cause analysis   |
| Upgrade dependencies    | **MAYBE**     | Only if breaking changes involved    |
