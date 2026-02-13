---
name: memory-management
description: Agent memory protocols, logging, context preservation, indexing.
category: Governance & Orchestration
tags: memory, logging, context, decision-tracking, audit-trail
version: 1.0
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Memory Management

## 🎯 Overview

Agent memory is the **CORE** of the governance system. It enables:
- Context preservation across sessions
- Decision tracking and rationale (Why did we do X?)
- Preventing regression (Same mistakes don't repeat)
- Audit trail for compliance

## 📑 Content Map

| File                               | When to Read                           |
| ---------------------------------- | -------------------------------------- |
| `references/TEMPLATE.md`           | Creating ANY new memory log            |
| `references/when-to-create-log.md` | Deciding if a log is necessary         |
| `references/chesterton-fence.md`   | Understanding "why is this code here?" |
| `references/examples/`             | Real examples of well-written logs     |
| `references/MEMORY-INDEXING.md`    | Finding past decisions                 |

## ✅ Decision Checklist

Before committing a memory log to `.agent/memory/`:

- [ ] **Context:** Did you explain *what* was requested and *why*?
- [ ] **Team:** Did you list the agents involved?
- [ ] **Changes:** Did you list files modified?
- [ ] **Decisions:** Did you document critical technical choices?
- [ ] **Lessons:** Did you record what went wrong/right?
- [ ] **Tags:** Did you add searchable tags (e.g., `[security]`, `[api]`)?

## 🚦 When to Create Memory Log

**MANDATORY:**
- ✅ Multi-agent task forces
- ✅ Architecture changes (Schema, API, Structure)
- ✅ Security audits
- ✅ Critical bug fixes
- ✅ Major refactoring

**OPTIONAL:**
- ⭕ Small fixes (<50 lines)
- ⭕ Documentation updates
