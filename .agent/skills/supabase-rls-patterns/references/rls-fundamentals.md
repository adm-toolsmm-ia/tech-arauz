# Supabase RLS Fundamentals

> **Concept:** Security at the database layer. Even if the API has a bug, the database prevents unauthorized access.

---

## 1. What is RLS?

Row-Level Security (RLS) is a PostgreSQL feature that restricts which rows a user can access based on defined policies.

- **Granular:** Controls access row-by-row.
- **Deep:** Executed by the database engine, below the API layer.
- **Universal:** Applies to SQL queries, Supabase Client, and even some admin tools (unless bypassed).

## 2. Tech-Arauz Architecture

We use a **Multi-Tenant** strategy where data is isolated by `id_tenant`.

| Component                 | Role                                                           |
| ------------------------- | -------------------------------------------------------------- |
| `auth.uid()`              | The authenticated user's ID (from JWT)                         |
| `get_user_tenant_id(uid)` | Custom database function that returns the tenant ID for a user |
| `id_tenant` column        | The column in every table that owns the data                   |

**The Golden Rule:**
> A user can ONLY access rows where `table.id_tenant == get_user_tenant_id(auth.uid())`.

## 3. Policy Structure

A policy has 3 main parts:

```sql
CREATE POLICY "policy_name"
ON table_name
FOR [SELECT | INSERT | UPDATE | DELETE]  -- Operation
USING ( condition_expression );           -- Boolean check
```

- **USING ( ... )**: Used for SELECT, UPDATE, DELETE to check if *existing* rows are visible.
- **WITH CHECK ( ... )**: Used for INSERT and UPDATE to check if *new* data is valid.

## 4. Hierarchy of Access

1.  **Service Role (Admin):** Bypasses ALL RLS. Use carefully in backend functions.
2.  **Authenticated User:** Subject to RLS policies.
3.  **Public/Anon:** Usually denied access to everything (default deny).
