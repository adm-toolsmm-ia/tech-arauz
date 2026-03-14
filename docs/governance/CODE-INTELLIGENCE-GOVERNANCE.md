# Code Intelligence Governance — IDS, Entity Registry (AIOX 10/10)

**Version:** 0.2.3
**Status:** Governance

---

## IDS (Incremental Development System)

**Purpose:** Track entities (components, functions, schemas) to enable REUSE/ADAPT/CREATE recommendations

---

## Pre-Create Check

**Command:** `@aiox-master *ids check {intent}`

**Response:**
```
REUSE: ComponentX (existing)
  → Use as-is

ADAPT: ComponentY
  → Modify for new use case

CREATE: NewComponent
  → No match, must create
```

---

## Post-Create Register

**Automatic:** After `*create component`, system registers in IDS

**Metadata:**
- Type (component, hook, service, schema)
- Owner (@agent)
- Status (stable, experimental)
- Dependencies
- Consumers (usedBy)

---

## Impact Analysis

**Command:** `@aiox-master *ids impact {entity-id}`

**Output:** All consumers of this entity (direct + indirect)

**Use:** Before modifying, understand impact

---

## Registry Health

**Command:** `@aiox-master *ids health`

**Checks:**
- Orphaned entities (no consumers)
- Circular dependencies
- Unmaintained code

---

**Authored by:** Claude Code (Haiku 4.5)
