# Dependency Chains (P0 → P1 → P2)

> **Golden Rule:** Dependencies dictate execution order. You cannot build a roof (P2) before the foundation (P0).

---

## 📊 Priority Levels

### 🔴 P0 - Foundation (Blocking)
**What:** Database schemas, Core types, Authentication, Environment config.
**Agents:** `database-architect`, `orchestrator`, `devops-engineer`.
**Constraint:** Must be **100% Complete & Verified** before P1 starts.

### 🟡 P1 - Core Logic (Dependent)
**What:** API Endpoints, Business Logic, Services, State Management.
**Agents:** `backend-specialist`, `mobile-developer` (logic layer).
**Constraint:** Blocks P2.

### 🟢 P2 - Interface & Polish (Final)
**What:** UI Components, CSS, Animations, Documentation.
**Agents:** `frontend-specialist`, `documentation-writer`, `seo-specialist`.
**Constraint:** Can often run in parallel with P1 *if contracts are defined*.

---

## 🔗 Common Chains

### 1. The CRUD Chain
`Schema (P0)` → `API (P1)` → `UI (P2)`

### 2. The Integration Chain
`API Discovery (P0)` → `Mapper Logic (P1)` → `Sync Job (P1)` → `Dashboard UI (P2)`

### 3. The Security Chain
`Audit Scope (P0)` → `Vulnerability Scan (P1)` → `Fix Implementation (P2)`
