---
name: agent-orchestration-patterns
description: Multi-agent task force assembly, dependency management, conflict resolution.
category: Governance & Orchestration
tags: orchestration, task-force, multi-agent, coordination, dependencies
version: 1.0
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Agent Orchestration Patterns

## 🎯 Overview

Task forces are multi-agent teams assembled for complex tasks. This skill defines how to *choose* the right agents and how they *work together*.

| Type      | Agents    | Phase     | Example                        |
| --------- | --------- | --------- | ------------------------------ |
| **Pair**  | 2 agents  | Phase 3   | Database schema → API endpoint |
| **Trio**  | 3 agents  | Phase 3   | Feature CRUD (DB + API + UI)   |
| **Squad** | 4+ agents | Phase 4-5 | Major refactor or deployment   |

## 📑 Content Map

| File                                | When to Read                       |
| ----------------------------------- | ---------------------------------- |
| `references/task-force-patterns.md` | Assembling a team (Recipes)        |
| `references/dependency-chains.md`   | Ordering work (P0 before P1)       |
| `references/conflict-resolution.md` | When agents disagree on strategy   |
| `references/decision-matrix.md`     | "Which agent does X?" lookup table |
| `references/examples/`              | Real task force logs               |

## ✅ Decision Checklist

Before dispatching a Task Force:

- [ ] **Complexity:** Is it a Pair, Trio, or Squad?
- [ ] **Roles:** Did you assign specific responsibilities to each agent?
- [ ] **Dependencies:** Is the critical path clear (P0 → P1 → P2)?
- [ ] **Conflict:** Is there a tie-breaker (usually Orchestrator or CTO)?
- [ ] **Success:** Are acceptance criteria defined for *each* agent?

## 🚦 Dependency Rules

1.  **P0 Constraints (Database/Core):** Must be stable before P1 starts.
2.  **P1 Constraints (API/Logic):** Must be stable before P2 starts.
3.  **P2 Constraints (UI/Docs):** Dependent on P1.

> **Visualizer:** Use `scripts/dependency-visualizer.py` to check your plan.
