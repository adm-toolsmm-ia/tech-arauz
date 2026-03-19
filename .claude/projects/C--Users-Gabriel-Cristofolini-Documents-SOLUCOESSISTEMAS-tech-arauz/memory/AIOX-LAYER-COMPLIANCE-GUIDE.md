---
name: AIOX L1-L4 Layer Compliance Guide
description: Standard patterns for organizing files in correct AIOX framework layers — prevents root directory pollution
type: project
---

# AIOX L1-L4 Layer Compliance — File Organization Guide

**Updated:** 2026-03-18 (Post-Architecture-Cleanup)
**Framework:** Synkra AIOX v1.0.0
**Enforcement:** Constitutional (Article III+IV)

---

## Quick Reference — Where Does My File Go?

| File Type | Layer | Location | Mutable? | Examples |
|-----------|-------|----------|----------|----------|
| **Agent definitions** | L2 | `.aiox-core/development/agents/` | Extend-only | `*.md`, `*.yaml` |
| **Reusable scripts** | L2 | `.aiox-core/infrastructure/scripts/{category}/` | Extend-only | `extract.js`, `validator.js` |
| **Task templates** | L2 | `.aiox-core/development/tasks/` | Extend-only | `*.md` workflow files |
| **Design templates** | L2 | `.aiox-core/development/templates/` | Extend-only | `prd-tmpl.yaml`, `story-tmpl.md` |
| **Project config** | L3 | `.aiox-core/data/` | **Mutable** | `core-config.yaml`, `team-manifest.yaml` |
| **Stories/epics** | L4 | `docs/stories/` | **Always** | `EPIC-*.md`, `*.story.md` |
| **Project assets** | L4 | `docs/assets/{category}/` | **Always** | images, designs, media |
| **Source code** | L4 | `src/`, `packages/` | **Always** | `.tsx`, `.ts`, `.js` files |
| **Tests** | L4 | `tests/`, `{src}/__tests__/` | **Always** | `*.test.ts`, `*.spec.ts` |
| **Public assets** | L4 | `public/` | **Always** | logos, favicons, static files |

---

## The 4 AIOX Layers

### **Layer 1 (L1) — Framework Core** 🔴 NEVER MODIFY
**Location:** `.aiox-core/core/`, `.aiox-core/constitution.md`, `bin/aiox.js`

**Rules:**
- Controlled by framework maintainers only
- Constitution is inviolable (Article I-VI)
- Protected by `.claude/settings.json` deny rules
- Examples: Core governance, framework bootstrap

**If you break this:** Constitutional violation — system gates will block you

---

### **Layer 2 (L2) — Framework Templates** 🟡 EXTEND-ONLY
**Location:** `.aiox-core/development/`, `.aiox-core/infrastructure/`

**Rules:**
- Create **new** components here (agents, tasks, workflows, scripts)
- **DO NOT modify** existing L2 files unless specifically allowed
- Reusable across all projects
- Subject to framework standards and naming conventions
- Protected by `.claude/settings.json` allow rules

**What goes here:**
- ✅ New task templates (`.aiox-core/development/tasks/`)
- ✅ New utility scripts (`.aiox-core/infrastructure/scripts/{category}/`)
- ✅ New agent definitions (`.aiox-core/development/agents/`)
- ✅ Framework documentation (README files explaining reuse)

**What NEVER goes here:**
- ❌ Project-specific code
- ❌ Project-specific assets
- ❌ Hardcoded configuration values
- ❌ Project team names or personalization

**Example from cleanup:** `extract.{js,py,ps1}` → `.aiox-core/infrastructure/scripts/design-tools/`
- **Why:** Utility scripts reusable by multiple projects → L2 framework component

---

### **Layer 3 (L3) — Project Configuration** 🟠 MUTABLE (EXCEPTIONS)
**Location:** `.aiox-core/data/`, `agents/*/MEMORY.md`, `core-config.yaml`

**Rules:**
- Project-specific configuration (not code)
- Mutable **only** via allow rules in `.claude/settings.json`
- Governance data (team manifest, registry)
- Configuration is law for the project

**What goes here:**
- ✅ Team manifest (who is responsible for what)
- ✅ Entity registry (code intelligence cache)
- ✅ Core configuration (feature flags, layer boundaries)
- ✅ Agent memory files (MEMORY.md in agent folders)

**What NEVER goes here:**
- ❌ Source code
- ❌ Design assets
- ❌ Stories or documentation
- ❌ Test files

---

### **Layer 4 (L4) — Project Runtime** 🟢 ALWAYS MUTABLE
**Location:** `docs/`, `src/`, `packages/`, `public/`, `tests/`

**Rules:**
- Where actual project work happens
- Your code, assets, and documentation live here
- Change freely (subject to code standards)
- No L1-L2-L3 files allowed here

**What goes here:**
- ✅ Source code (`src/`, `packages/`)
- ✅ Project assets (`docs/assets/`, `public/`)
- ✅ Stories and epics (`docs/stories/`)
- ✅ Tests (`tests/`, `__tests__/`)
- ✅ Project documentation (`docs/guides/`, `docs/adr/`)
- ✅ Build output, coverage reports, etc.

**What NEVER goes here:**
- ❌ Framework core files
- ❌ Agent definitions
- ❌ Task templates
- ❌ Utility scripts (if reusable, move to L2)

---

## Anti-Patterns to Avoid ❌

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| **Files in root** | `extract.js`, `extract.py` in project root | Move to `.aiox-core/infrastructure/scripts/{category}/` (L2) |
| **`docs/temp/` folders** | Temporary folders in docs | Use `docs/assets/{category}/` (L4) or `.gitignore` temp dirs |
| **Utility scripts in `src/`** | Helper scripts mixed with app code | Move to `.aiox-core/infrastructure/scripts/` (L2) |
| **Config in project code** | Hardcoded paths/settings | Move to `.aiox-core/data/` (L3) |
| **Modified L2 files** | Changing framework templates | Only extend/add new components (notify @devops if critical) |
| **Temporary `.ts` files** | Debugging files left behind | Either commit properly or add to `.gitignore` |

---

## Decision Tree — Where Does This Go?

```
┌─ Is this reusable across multiple projects?
│  │
│  ├─ YES → Is it a script/utility/tool?
│  │  │
│  │  ├─ YES → Layer 2 (.aiox-core/infrastructure/scripts/{category}/)
│  │  │         Example: extract.js (color extraction utility)
│  │  │
│  │  └─ NO → Is it an agent/task/workflow/template?
│  │     │
│  │     ├─ YES → Layer 2 (.aiox-core/development/{type}/)
│  │     │         Example: prd-template.yaml (PRD writing template)
│  │     │
│  │     └─ NO → Layer 3 configuration (.aiox-core/data/)
│  │             Example: team-manifest.yaml
│  │
│  └─ NO → Is this project-specific code/assets/docs?
│     │
│     ├─ YES → Layer 4 (docs/, src/, public/, tests/)
│     │         Examples: Story 14.1, logo.png, App.tsx
│     │
│     └─ NO → This is probably an error — consult @aiox-master
```

---

## Real Examples from Tech Arauz Cleanup

### ✅ **Example 1: Utility Scripts**

**Question:** Where should color extraction scripts go?

**Analysis:**
- Are they reusable? YES (could be used for other branding projects)
- Are they project-specific? NO (generic color extraction)
- Are they tools/infrastructure? YES

**Answer:** Layer 2 (Framework)
**Location:** `.aiox-core/infrastructure/scripts/design-tools/`
**File:** `extract.{js,py,ps1}`

---

### ✅ **Example 2: Design Assets**

**Question:** Where should brand logos go?

**Analysis:**
- Are they reusable across projects? NO (Tech Arauz specific)
- Are they runtime artifacts? YES (used in app, documentation)
- Are they project assets? YES

**Answer:** Layer 4 (Project Runtime)
**Location:** `docs/assets/design-system/logos/`
**File:** `logo.png`, `logo-dark.png`, etc.

---

### ✅ **Example 3: Design Documentation**

**Question:** Where should design system definitions go?

**Analysis:**
- Are they project-specific? YES (Tech Arauz brand guidelines)
- Are they documentation? YES (guides/references)
- Are they runtime? YES (used by developers + designers)

**Answer:** Layer 4 (Project Runtime)
**Location:** `docs/assets/design-system/DESIGN-SYSTEM.md`

---

### ✅ **Example 4: Task Template**

**Question:** Where should a new task template go?

**Analysis:**
- Is it reusable across projects? YES (workflow pattern)
- Is it a task definition? YES
- Is it framework infrastructure? YES

**Answer:** Layer 2 (Framework)
**Location:** `.aiox-core/development/tasks/your-task.md`

---

## Enforcement & Quality Gates

### Automatic Enforcement
- `.claude/settings.json` deny rules prevent L1 modifications
- `.claude/settings.json` allow rules control L3 mutations
- Git hooks can prevent root-directory pollution

### Manual Enforcement
- Code review checklist before commits
- Architecture audits (like cleanup on 2026-03-18)
- @aiox-master can validate on request

### If You're Unsure
**Ask:** Is this part of the framework (L1-L2) or the project (L4)?
- **Framework**: Reusable, abstract, governance-related → L2 (if new)
- **Project**: Specific implementation, assets, documentation → L4

---

## When to Escalate

| Situation | Action |
|-----------|--------|
| Want to modify existing L2 file | Check `.claude/rules/agent-authority.md` — may require @devops approval |
| Want to add new L2 component | Follow `*create` command in @aiox-master agent |
| Found L1 violation | Call @aiox-master immediately (constitutional breach) |
| Need to organize new asset type | Use `docs/assets/{category}/` template (L4) |
| Unsure about layer | Ask in conversation or check this guide |

---

## Related Files

- **CLAUDE.md** (root) — Project instructions (mentions layer compliance)
- **Constitution.md** (`.aiox-core/`) — Framework governance (Article III+IV)
- **agent-authority.md** (`.claude/rules/`) — Who can modify what
- **bash-windows-quirks.md** (`.claude/rules/`) — Platform-specific guidance
- **ARCHITECTURE-CLEANUP-REPORT** (`.aiox/`) — Detailed cleanup audit from 2026-03-18

---

## Checklist Before Committing

- [ ] Is this file in the right layer (L1-L4)?
- [ ] Does it follow naming conventions for that layer?
- [ ] Does it have proper documentation (README if applicable)?
- [ ] Is root directory free of project files?
- [ ] Are temporary folders not in version control?
- [ ] Have I updated relevant layer documentation?

---

**Status:** Established 2026-03-18 | Verified AIOX 10/10 | Active
**Compliance:** Constitutional (Article III: Story-Driven, Article IV: No Invention)
