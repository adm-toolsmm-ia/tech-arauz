# Framework Layer Model — L1-L4 Mutation Rules (AIOX 10/10)

**Version:** 1.0.0
**Status:** Architectural governance

---

## 4-Layer Model

### Layer 1 (NEVER Modify)
**Path:** `.aiox-core/core/`, `.aiox-core/constitution.md`, `bin/aiox.js`

**Protection:** Read-only (protected by deny rules)

**Contents:**
- Framework engine
- Constitution (6 principles)
- Core orchestrator

---

### Layer 2 (Extend-Only)
**Path:** `.aiox-core/development/` (tasks, templates, checklists, workflows)

**Mutation:** Add new, don't modify existing

**Pattern:**
- Add new task: `create-custom-task.md`
- Don't modify: `create-next-story.md` (core task)

---

### Layer 3 (Mutable)
**Path:** `.aiox-core/data/`, `agents/*/MEMORY.md`, `core-config.yaml`

**Mutation:** Full (update, delete, add)

**Example:**
- `core-config.yaml`: Can update project config
- Agent MEMORY: Can update per-agent context

---

### Layer 4 (ALWAYS Modify)
**Path:** `docs/stories/`, `src/`, `supabase/`, `packages/`

**Mutation:** Full (this is project code)

**Example:**
- Source code: Add/modify features
- Migrations: Add new schema
- Stories: Track progress

---

## Protection Toggle

**File:** `core-config.yaml`

```yaml
boundary:
  frameworkProtection: true  # L1-L2 read-only
```

**For Contributors:** Set to `false` (allows framework changes)

---

**Authored by:** Claude Code (Haiku 4.5)
