# Testing RLS Policies

> **Trust, but Verify.** An RLS policy is code, and code has bugs. Security bugs are critical.

---

## 🏗️ Testing Strategy

We test RLS at 3 levels:

1.  **SQL Logic Test:** Verify the query logic in a localized environment.
2.  **Application Test:** Verify the frontend/API behavior when blocked.
3.  **Security Audit:** Verify that *unauthorized* access is actually blocked.

---

## 🧪 Level 1: SQL Verification

Run these snippets in the Supabase SQL Editor to simulate users.

**Test 1: Check Tenant Isolation**

```sql
-- Simulate User A (Tenant 1)
SET request.jwt.claim.sub = 'user-uuid-tenant-1';
SET request.jwt.claim.role = 'authenticated';

SELECT count(*) FROM projects;
-- Expected: X rows (only Tenant 1 projects)

-- Simulate User B (Tenant 2)
SET request.jwt.claim.sub = 'user-uuid-tenant-2';
SELECT count(*) FROM projects;
-- Expected: Y rows (only Tenant 2 projects)
-- CRITICAL: Should NOT see any of User A's projects.
```

---

## 🧪 Level 2: Frontend Check

In your application code, handle the lack of data gracefully.

```javascript
/* Correct handling of RLS filtering */
const { data, error } = await supabase
  .from('projects')
  .select('*');

if (data.length === 0) {
  console.log("No projects found (or RLS filtered them out)");
  // Show "Empty State", do NOT crash.
}
```

---

## 🧪 Level 3: Security Bypass Test (The "Hacker" Test)

Try to force an INSERT into another tenant.

```javascript
/* Malicious Attempt */
const { error } = await supabase
  .from('projects')
  .insert({
    title: 'Hacked Project',
    id_tenant: 'target-tenant-uuid' // ❌ Trying to inject into victim's tenant
  });

/* Verification */
if (error && error.message.includes("violates row-level security policy")) {
  console.log("✅ Security PASS: RLS blocked the attack.");
} else {
  console.error("❌ Security FAIL: RLS allowed the insertion!");
  alert("CRITICAL SECURITY VULNERABILITY");
}
```
