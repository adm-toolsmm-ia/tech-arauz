# Migration Principles

> Safe migration strategy for zero-downtime changes.

## 🚨 Anti-Pattern for AI Agents: Reading old migrations 🚨

**Do not** read historical migration files (`supabase/migrations/*.sql`) to understand the current state of the database schema. Old migrations do not represent the current reality because subsequent scripts often alter or drop those structures.
**Rule:** ALWAYS use living database introspection tools (like Supabase MCP `list_tables`, `get_table_schema`, or executing `SELECT` on `information_schema`) to analyze the current database schema.


## Safe Migration Strategy

```
For zero-downtime changes:
│
├── Adding column
│   └── Add as nullable → backfill → add NOT NULL
│
├── Removing column
│   └── Stop using → deploy → remove column
│
├── Adding index
│   └── CREATE INDEX CONCURRENTLY (non-blocking)
│
└── Renaming column
    └── Add new → migrate data → deploy → drop old
```

## Migration Philosophy

- Never make breaking changes in one step
- Test migrations on data copy first
- Have rollback plan
- Run in transaction when possible

## Serverless Databases

### Neon (Serverless PostgreSQL)

| Feature           | Benefit          |
| ----------------- | ---------------- |
| Scale to zero     | Cost savings     |
| Instant branching | Dev/preview      |
| Full PostgreSQL   | Compatibility    |
| Autoscaling       | Traffic handling |

### Turso (Edge SQLite)

| Feature             | Benefit           |
| ------------------- | ----------------- |
| Edge locations      | Ultra-low latency |
| SQLite compatible   | Simple            |
| Generous free tier  | Cost              |
| Global distribution | Performance       |
