# Debugging RLS Errors

> **Symptom:** "new row violates row-level security policy"
> **Meaning:** You tried to write data that you don't have permission to write.

---

## 🔍 Common Causes

### 1. Missing `id_tenant` in Insert
**Scenario:** Function tries to insert a project but forgets to supply `id_tenant`.
**RLS Check:** The policy says `WITH CHECK (id_tenant = get_user_tenant_id(auth.uid()))`.
**Result:** NULL != 'my-tenant-id' -> **BLOCK**.
**Fix:** Explicitly pass `id_tenant` in your insert payload.

### 2. User Context Missing (Server-Side)
**Scenario:** Calling Supabase from a Next.js API route without setting the session.
**RLS Check:** `auth.uid()` is null.
**Result:** **BLOCK**.
**Fix:** Initialize Supabase client with cookies/headers to forward the user session.

### 3. Service Role vs Anon Key
**Scenario:** Using `createClient(url, SERVICE_KEY)` on the frontend.
**Result:** **SECURITY RISK.** It works, but it bypasses RLS.
**Fix:** NEVER use service key on client. Use `ANON_KEY`.

### 4. Policy logic is "too distinct"
**Scenario:** Implementation of `get_user_tenant_id()` has a bug or returns NULL.
**Result:** Nobody can access anything.
**Fix:** Test the helper function in SQL Editor: `SELECT get_user_tenant_id('my-user-id');`

---

## 🛠️ Debugging Steps

1.  **Isolate the User:** Get the UUID of the user failing the action.
2.  **Isolate the Data:** What exact JSON are they trying to send?
3.  **Simulate in SQL:**
    ```sql
    SET request.jwt.claim.sub = 'USER_UUID';
    INSERT INTO table (...) VALUES (...);
    ```
4.  **Check Policies:**
    ```sql
    SELECT * FROM pg_policies WHERE tablename = 'target_table';
    ```
