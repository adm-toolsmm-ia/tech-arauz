# RLS Deployment Checklist

> **Mandatory** check before any release involving database changes.

---

## 📋 Table Audit

For EVERY new table:

- [ ] **RLS Enabled?** (`ALTER TABLE x ENABLE ROW LEVEL SECURITY`)
- [ ] **SELECT Policy?** Can users fetch their data?
- [ ] **INSERT Policy?** Can users create new data?
- [ ] **UPDATE Policy?** Can users edit their data?
- [ ] **DELETE Policy?** Can users delete (or is it restricted)?

## 🧠 Logic Audit

- [ ] **Tenant Isolation:** Do ALL policies filter by `id_tenant`?
- [ ] **Helper Function:** Are we using `get_user_tenant_id()` (Standard) or ad-hoc queries (Risky)?
- [ ] **Permissiveness:** Are there any `USING (true)` policies? If so, is the table genuinely public?

## 🛡️ Security Audit

- [ ] **Cross-Tenant Test:** Attempt to query Tenant B's ID as User A. Did it return 0 rows?
- [ ] **Injection Test:** Attempt to INSERT record with Tenant B's ID as User A. Did it throw an error?
- [ ] **Service Key:** Verified that admin scripts use the Service Key (bypass RLS)?

---

## 📝 Migration Log

*Copy this to your PR/Commit message:*

```markdown
## Security/RLS
- [x] Enabled RLS on table `new_table`
- [x] Added standard multi-tenant policies
- [x] Verified isolation with `scripts/test-rls-bypass.py`
```
