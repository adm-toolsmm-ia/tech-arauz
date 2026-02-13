---
name: supabase-rls-patterns
description: Row-Level Security patterns, multi-tenant isolation, testing, debugging.
category: Database Security
tags: rls, security, multi-tenant, supabase, authorization
version: 1.0
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Supabase RLS Patterns

## 🎯 Overview

RLS (Row-Level Security) is the **PRIMARY** security mechanism for multi-tenant data isolation in tech-arauz. This skill provides the patterns, templates, and validation logic to ensure every table is securely isolated.

## 📑 Content Map

| File                                  | When to Read                                        |
| ------------------------------------- | --------------------------------------------------- |
| `references/rls-fundamentals.md`      | Learning RLS from scratch                           |
| `references/rls-templates.sql`        | Creating new RLS policy (copy-paste templates)      |
| `references/rls-patterns-by-table.md` | Understanding tech-arauz table structure + policies |
| `references/rls-testing-guide.md`     | Testing RLS (manual + automated)                    |
| `references/rls-debugging.md`         | Debugging "access denied" errors                    |
| `references/rls-checklist.md`         | Pre-deployment validation                           |

## 🔗 Related Skills

- @[skills/database-design/SKILL.md] -- Schema design best practices
- @[skills/vulnerability-scanner/SKILL.md] -- Security auditing
- @[skills/testing-patterns/SKILL.md] -- General testing strategies

## ✅ Decision Checklist

Before deploying ANY table to production, verify:

- [ ] **ENABLE RLS:** Is `ALTER TABLE x ENABLE ROW LEVEL SECURITY` applied?
- [ ] **Coverage:** Are there policies for SELECT, INSERT, UPDATE, and DELETE?
- [ ] **Isolation:** Do policies use `get_user_tenant_id()` or equivalent?
- [ ] **Testing:** Have you tested with 2+ distinct tenants? (Cross-tenant access MUST fail)
- [ ] **Admin:** Have you verified service key bypass (for admin ops)?
- [ ] **Audit:** Is the policy change logged in the migration comment?

## ❌ Anti-Patterns

**DON'T:**

- Drop RLS locally without backup (`DROP POLICY`)
- Create policy with `TRUE` condition (allows public access)
- Use service key on the frontend (critical security leak)
- Assume RLS works without writing a negative test case
- Enable RLS but forget to add policies (locks the table completely)

**DO:**

- Always create a negative test (verify access IS blocked)
- Use helper functions like `get_user_tenant_id()` for consistency
- Document the "Why" of each policy
- Review RLS during Phase 4 (Security Audit)
