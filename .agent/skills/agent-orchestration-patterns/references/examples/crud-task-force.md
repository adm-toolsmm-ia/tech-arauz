# Task Force Plan: Products Module

**Pattern:** Trio
**Objective:** Implement Products CRUD

## 👥 Roster

1.  **P0:** `database-architect`
    -   Task: Create `products` table + RLS policies.
    -   Output: SQL Migration file.

2.  **P1:** `backend-specialist`
    -   Task: Create Next.js API Routes (GET/POST/PUT/DELETE).
    -   Dependency: Waits for P0 (needs table).
    -   Output: `src/pages/api/products/*`

3.  **P2:** `frontend-specialist`
    -   Task: Create List/Edit/Create views.
    -   Dependency: Waits for P1 (needs API).
    -   Output: `src/components/products/*`

## ✅ Success Criteria

-   [ ] Table created with RLS.
-   [ ] API endpoints tested with Postman/Curl.
-   [ ] UI allows user to creating/editing products.
