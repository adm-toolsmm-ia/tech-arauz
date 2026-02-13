---
id: {{UUID}} -- generate with: python -c "import uuid; print(uuid.uuid4())"
date: {{YYYY-MM-DD}}
time: {{HH:MM}}
trigger: {{User request or event}}
status: {{SUCCESS/FAILURE/IN_PROGRESS}}
tags: [{{TAG1}}, {{TAG2}}]  -- e.g., [espaider, security, performance]
related_logs: [{{ID1}}, {{ID2}}]  -- links to previous related logs
---

# 🧠 Agent Memory Log: {{TASK_NAME}}

> One-line summary of what was accomplished

## 1. Context & Objective

**What was requested?**
> {{DESCRIPTION}} — Keep to 2-3 sentences.

**Why is this necessary?**
- {{REASON_1}}
- {{REASON_2}}

**Business impact if not done:**
> {{IMPACT}}

---

## 2. Strategy & Team Assembly

**Agents Involved:**
- [ ] `@orchestrator` — Coordination
- [ ] `@backend-specialist` — API implementation
- [ ] `@frontend-specialist` — UI implementation

**Skills Loaded (by Phase):**

### Phase 1 (Ingestion)
- `@orchestrator`: `architecture`, `memory-management`

### Phase 3 (Execution)
- `@backend-specialist`: `api-patterns`

---

## 3. Execution & Changes

**Files Modified:**

| File             | Action | Justification    |
| ---------------- | ------ | ---------------- |
| `src/example.ts` | Edit   | Fix bug in logic |

**Critical Technical Decisions:**

1.  **Decision:** {{DECISION_TITLE}}
    -   **Context:** {{CONTEXT}}
    -   **Options:** {{OPTION_A}} vs {{OPTION_B}}
    -   **Choice:** {{CHOSEN_OPTION}}
    -   **Consequence:** {{CONSEQUENCE}}

---

## 4. Testing & Validation

**Test Coverage:**
- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual verification

**Test Results:**
```
✅ All tests passing
```

---

## 5. Retrospective & Lessons Learned

**What went well?**
- ...

**What could improve?**
- ...

**Advice for next time:**
> {{ADVICE}}

---

## 6. Follow-up Actions

**Required:**
- [ ] ...

**Optional (Future):**
- [ ] ...
