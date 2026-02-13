# Chesterton's Fence

> **Principle:** Do not remove a fence until you know why it was put up in the first place.

In Software Engineering: **Do not refactor code until you understand why it was written that way.**

---

## 🚧 How to Apply in Tech-Arauz

When you encounter "weird", "complex", or "legacy" code:

1.  **STOP.** Do not delete it yet.
2.  **SEARCH.** Look for Memory Logs related to this file/feature.
    -   Use `@memory-management/scripts/memory-search.py`
    -   Check `git blame` for the commit hash and search for it.
3.  **READ.** Find the "Critical Decisions" section.
    -   Was it for performance?
    -   Was it a workaround for an Espaider API bug?
    -   Was it a security requirement?
4.  **DECIDE.**
    -   If the reason is obsolete → Remove the fence (and document why in a NEW log).
    -   If the reason is valid → Keep the fence (and maybe add a comment to explain it).

---

## ❌ Example of Violation

**Scenario:**
Agent sees a `sleep(5000)` in the code.
*"This is inefficient! I'll remove it."*

**Consequence:**
Production breaks because the external API needed a 5-second cooldown between auth and query.

**Correct Approach:**
Search memory logs → Find `2026-01-15_fix-api-race-condition.md` → Read: *"Added 5s delay because API returns 404 immediately after creation."* → **Keep the sleep.**
