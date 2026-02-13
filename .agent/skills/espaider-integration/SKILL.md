---
name: espaider-integration
description: Espaider API integration patterns, field mapping, error handling, sync workflows.
category: Backend Integration
tags: espaider, api, data-sync, error-handling, validation
version: 1.0
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Espaider Integration Skill

## 🎯 Overview

This skill centralizes all knowledge regarding the integration with the Espaider API. It is the SINGLE SOURCE OF TRUTH for field mappings, sync logic, and error handling strategies. Any agent working on `src/integrations/espaider` or related database schemas MUST load this skill.

## 📑 Content Map

| File                                      | When to Read                                           |
| ----------------------------------------- | ------------------------------------------------------ |
| `references/field-mapping.md`             | Implementing new endpoint, adding field to schema      |
| `references/field-mapping.json`           | Programmatic access to field definitions (for scripts) |
| `references/workflow-sync.md`             | Creating sync routine, understanding data flow         |
| `references/error-handling.md`            | Debugging sync failures, implementing retry logic      |
| `references/data-validation-checklist.md` | Null/undefined handling, defensive programming         |
| `references/examples/sync-new-field.md`   | Step-by-step guide: "How do I add field X?"            |
| `references/examples/error-recovery.md`   | Step-by-step guide: "How do I debug API timeout?"      |

## 🔗 Related Skills

- @[skills/api-patterns/SKILL.md] -- HTTP/REST patterns
- @[skills/database-design/SKILL.md] -- Schema design
- @[skills/nodejs-best-practices/SKILL.md] -- Async error handling

## ✅ Decision Checklist

Before implementing Espaider sync:

- [ ] Identified which Espaider entities (Projeto/Entrega/Cronograma/Requisito)?
- [ ] Documented which API fields map to database columns?
- [ ] Planned error handling strategy (timeout/parsing/rate-limit)?
- [ ] Designed null/undefined fallback values?
- [ ] Planned logging to `integration_log_entries`?
- [ ] Tested with incomplete API responses?

## ❌ Anti-Patterns

**DON'T:**

- Trust Espaider API responses are always complete (fields can be null)
- Skip retry logic on timeout
- Store API response directly without mapping to schema
- Assume field types are consistent (dates might be strings or nulls)

**DO:**

- Use field mapping reference before coding
- Implement exponential backoff for retries
- Validate before INSERT/UPDATE
- Use integration_log_entries for audit trail
