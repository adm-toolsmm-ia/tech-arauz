# Security Standards — OWASP, RLS, Auth (AIOX 10/10)

**Version:** 0.2.3
**Status:** Authoritative

---

## OWASP Top 10 Prevention

### 1. Injection (SQL, NoSQL, Command)
**Prevention:**
- Use parameterized queries (Supabase client does this)
- No string concatenation for SQL
- Validate all inputs (Zod schemas)

### 2. XSS (Cross-Site Scripting)
**Prevention:**
- React auto-escapes JSX
- DOMPurify for user-generated HTML
- CSP headers (set in next.config.mjs)

### 3. Broken Authentication
**Prevention:**
- Use Supabase Auth (OAuth2, JWT)
- Never store passwords (auth service does it)
- Secure cookies (HttpOnly, SameSite)

### 4. Insecure Deserialization
**Prevention:**
- Use JSON.parse safely
- Validate with Zod schemas
- No `eval()` on user input

### 5. Broken Access Control
**Prevention:**
- RLS policies on all tables (tenant_id isolation)
- Check user roles before sensitive operations
- No trusting client-side role claims

### 6. Sensitive Data Exposure
**Prevention:**
- HTTPS-only (Vercel enforces)
- No secrets in code (use env vars)
- Encrypt sensitive fields (future)

### 7. XML/XXE
**Prevention:**
- Don't parse XML (use JSON)
- If needed, disable external entity parsing

### 8. Broken Access Control (CORS)
**Prevention:**
- CORS headers restricted to origin
- No `Access-Control-Allow-Origin: *`

### 9. Deserialization of Untrusted Data
**Prevention:**
- Validate all API responses (Zod)
- No direct object instantiation from user input

### 10. Logging & Monitoring
**Prevention:**
- Log all auth events (successful + failed)
- Monitor error rates
- Alert on suspicious patterns

---

## RLS Enforcement

**Every table requires:**
```sql
ENABLE ROW LEVEL SECURITY;

CREATE POLICY {table}_isolation ON {table}
  USING (tenant_id = get_user_tenant_id());
```

**Verification:**
```bash
npm run test:rls
# → Validates RLS policies
```

---

## Secrets Management

**Never in Code:**
```typescript
// ❌ WRONG
const API_KEY = "sk-abc123";

// ✅ CORRECT
const API_KEY = process.env.OPENROUTER_API_KEY;
```

**Environment Variables:**
- Local: `.env.local` (gitignored)
- Production: Vercel secrets (encrypted)

---

## Security Review Checklist

- [ ] No hardcoded API keys
- [ ] All inputs validated (Zod)
- [ ] RLS policies on new tables
- [ ] CORS headers correct
- [ ] HTTPS enforced (Vercel does this)
- [ ] CSP headers set (next.config.mjs)
- [ ] No eval() or dangerouslySetInnerHTML
- [ ] Error messages don't leak internals

---

**Authored by:** Claude Code (Haiku 4.5)
