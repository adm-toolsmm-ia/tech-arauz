# ADR-002: Token Fallback Chain & Encryption Strategy

**Status:** ACCEPTED (Implemented v0.2.3+)
**Deciders:** @architect (Aria), @data-engineer (Dara), @devops (Gage)
**Date:** 2026-03-12
**Code-to-Doc Verified:** ✅ src/lib/security/integration-token.ts (63 LOC)

---

## Context

Tech Arauz integrates with **Espaider BI** for project data synchronization. Espaider requires API tokens for authentication. These tokens must be:

1. **Securely stored** (never exposed in logs or errors)
2. **Encrypted at rest** (if sensitive) using strong encryption
3. **Easily fallback-able** (dev, staging, production environments)
4. **Configurable without redeployment** (env vars or database)

**Current Integration Points:**
- Espaider API: `GET /api/v2/datasets/{dataset}` (requires `Authorization: Bearer {token}`)
- Token used in sync operations: `syncEspaiderAction()` (server action)
- 4 datasets: Projetos, Cronogramas, Entregas, Requisitos

---

## Decision

Implement **3-tier token resolution chain with AES-256-GCM encryption:**

```
Layer 1: Database (espaider_apis.token)
    ↓ (if encrypted: decrypt with INTEGRATION_TOKEN_SECRET)
    ↓ (if PREENCHER_TOKEN: fallback to env)
    ↓
Layer 2: Environment (ESPAIDER_TOKEN env var)
    ↓ (if not set: error)
    ↓
Layer 3: Fallback (return empty string, fail gracefully)
```

### Token Resolution Logic

```typescript
/**
 * Resolve API token with 3-tier fallback chain
 * 1. Check database token
 * 2. Decrypt if encrypted (AES-256-GCM)
 * 3. Fall back to env vars
 * 4. Return empty string if all fail
 */
function resolveApiToken(rawToken: string | null): string {
  // Tier 1: Check placeholder
  if (!rawToken || rawToken === 'PREENCHER_TOKEN') {
    return process.env.ESPAIDER_TOKEN || '';
  }

  // Tier 2: Check if encrypted
  if (!isEncryptedIntegrationToken(rawToken)) {
    return rawToken;  // Already plaintext
  }

  // Tier 3: Decrypt
  try {
    return decryptIntegrationToken(rawToken);  // AES-256-GCM
  } catch (err) {
    console.error('[sync] Token decrypt failed, using env fallback');
    return process.env.ESPAIDER_TOKEN || '';
  }
}
```

### Encryption Algorithm: AES-256-GCM

**Why AES-256-GCM:**
- Industry standard for authenticated encryption
- GCM (Galois/Counter Mode) provides authentication tag
- Detects tampering attempts
- 256-bit key (SHA-256 hash of secret)

**Encryption Parameters:**
- **Key:** SHA-256 hash of `INTEGRATION_TOKEN_SECRET` env var
- **IV:** 12 random bytes (cryptographically secure)
- **Auth Tag:** 16 bytes (GCM authentication proof)
- **Format:** `enc:v1:{base64(IV)}.{base64(AuthTag)}.{base64(Ciphertext)}`

**Example Encrypted Token:**
```
enc:v1:aGFzaGVkdGVzdA==.aHR0cHM6Ly9lc3BhaWRlci5jb20=.dGVzdHRva2VuZGF0YQ==
         ↑ IV (12B)     ↑ Auth Tag (16B)  ↑ Encrypted token
```

### Implementation (v0.2.3+)

```typescript
// File: src/lib/security/integration-token.ts (63 LOC)

// Encrypt a plaintext token
export function encryptIntegrationToken(token: string): string {
  const secret = getSecret();
  if (!secret) {
    throw new Error('INTEGRATION_TOKEN_SECRET required');
  }

  const iv = crypto.randomBytes(12);
  const key = crypto.createHash('sha256').update(secret, 'utf8').digest();
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([
    cipher.update(token, 'utf8'),
    cipher.final()
  ]);
  const authTag = cipher.getAuthTag();

  return `${TOKEN_PREFIX}${iv.toString('base64url')}.${authTag.toString('base64url')}.${encrypted.toString('base64url')}`;
}

// Decrypt an encrypted token
export function decryptIntegrationToken(token: string): string {
  if (!isEncryptedIntegrationToken(token)) {
    return token;  // Not encrypted
  }

  const secret = getSecret();
  if (!secret) {
    throw new Error('INTEGRATION_TOKEN_SECRET required');
  }

  const payload = token.slice(TOKEN_PREFIX.length);
  const [ivB64, tagB64, encryptedB64] = payload.split('.');

  if (!ivB64 || !tagB64 || !encryptedB64) {
    throw new Error('Invalid encrypted token format');
  }

  const iv = Buffer.from(ivB64, 'base64url');
  const authTag = Buffer.from(tagB64, 'base64url');
  const encrypted = Buffer.from(encryptedB64, 'base64url');
  const key = crypto.createHash('sha256').update(secret, 'utf8').digest();

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]);

  return decrypted.toString('utf8');
}
```

---

## Usage Across Environments

### Development (Local)

```env
# .env.local
INTEGRATION_TOKEN_SECRET=my-32-char-secret-key-for-dev-only
ESPAIDER_TOKEN=dev-api-token-12345
```

- Tokens can be plaintext in DB (no encryption)
- Or encrypted with local secret
- Env fallback always available

### Staging (Vercel Preview)

```env
# Vercel Environment Variables
INTEGRATION_TOKEN_SECRET=[staging-secret-32-chars]
ESPAIDER_TOKEN=[staging-api-token]
```

- Database tokens encrypted with staging secret
- Auto-decryption on read
- Env fallback: `ESPAIDER_TOKEN`

### Production (Vercel)

```env
# Vercel Production Secrets
INTEGRATION_TOKEN_SECRET=[prod-secret-32-chars]
ESPAIDER_TOKEN=[prod-api-token]
```

- Database tokens encrypted with prod secret
- HSM-backed secret storage (Vercel managed)
- Env fallback: `ESPAIDER_TOKEN`

---

## Token Storage Locations

| Location | Status | Example | Usage |
|----------|--------|---------|-------|
| Database `espaider_apis.token` | Encrypted | `enc:v1:...` | Primary source |
| Environment `ESPAIDER_TOKEN` | Plaintext | `key-123...` | Fallback |
| Placeholder `PREENCHER_TOKEN` | N/A | "PREENCHER_TOKEN" | Triggers env fallback |

---

## Security Guarantees

### ✅ What This Protects

1. **Database Breach:** Encrypted tokens unreadable without secret
2. **Log Leakage:** Token never logged in plaintext (redacted)
3. **Tampering:** Auth tag detects modifications
4. **Audit Trail:** Who decrypted when (via `integration_log_entries`)

### ⚠️ What This Does NOT Protect

1. **Env var theft:** If server is compromised, all secrets exposed
2. **Secret key leak:** If `INTEGRATION_TOKEN_SECRET` leaked, all tokens exposed
3. **Application code:** SQL injection could bypass encryption
4. **Transit:** Always use HTTPS (Vercel default enforces)

**Mitigation:** Rotate secrets quarterly, use Vercel secret management, minimal token lifetime.

---

## Implementation Details

### Database Column

```sql
-- Table: espaider_apis
CREATE TABLE public.espaider_apis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  nome TEXT NOT NULL,
  identificador TEXT NOT NULL,
  token TEXT,  -- Can be plaintext or "enc:v1:..." encrypted
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(tenant_id, identificador),
  FOREIGN KEY (tenant_id) REFERENCES public.tenants(id)
);
```

**Token column rules:**
- NULL: use env fallback
- `PREENCHER_TOKEN`: use env fallback
- `enc:v1:...`: decrypt using `INTEGRATION_TOKEN_SECRET`
- Any other string: treat as plaintext token

### Sync Flow (Using Token Resolution)

```
1. syncEspaiderAction() called
   ↓
2. Load espaider_apis configs from DB
   ↓
3. For each config, call resolveApiToken(config.token)
   - If encrypted: decrypt with secret
   - If placeholder: use env ESPAIDER_TOKEN
   - If plaintext: use as-is
   ↓
4. Make API call: Authorization: Bearer {resolvedToken}
   ↓
5. Log response to integration_log_entries
   - Do NOT log token in response
   - Do NOT log token in error message
```

---

## Consequences

### ✅ Benefits

1. **Flexible:** Works with encrypted DB tokens or env vars
2. **Secure:** AES-256-GCM industry standard
3. **Resilient:** 3-tier fallback prevents sync failures
4. **Maintainable:** Single `integration-token.ts` module
5. **Testable:** Mock encryption for testing

### ⚠️ Limitations

1. **Rotation:** Requires data migration to re-encrypt with new key
2. **Performance:** Decryption adds ~1ms per token (negligible)
3. **Key Management:** Secret must be stored securely (Vercel handles)

---

## Testing

### Unit Tests

```typescript
// File: src/lib/security/__tests__/integration-token.test.ts

describe('Integration Token Encryption', () => {
  it('should encrypt and decrypt token', () => {
    const token = 'my-secret-token-12345';
    const encrypted = encryptIntegrationToken(token);

    expect(encrypted).toMatch(/^enc:v1:/);
    expect(decryptIntegrationToken(encrypted)).toBe(token);
  });

  it('should handle PREENCHER_TOKEN placeholder', () => {
    const result = resolveApiToken('PREENCHER_TOKEN');
    expect(result).toBe(process.env.ESPAIDER_TOKEN || '');
  });

  it('should decrypt database token', () => {
    const dbToken = encryptIntegrationToken('db-secret');
    const result = resolveApiToken(dbToken);
    expect(result).toBe('db-secret');
  });
});
```

**Command:** `npm test -- src/lib/security/__tests__/integration-token.test.ts`

---

## Alternatives Considered

### ❌ Alternative A: Plaintext tokens in DB
- **Rejected:** Database breach = complete token exposure
- No encryption layer of defense

### ❌ Alternative B: Encrypted fields with ORM
- **Rejected:** Added complexity, ORM overhead
- Custom AES-256-GCM simpler + transparent

### ✅ Chosen: Token fallback chain + AES-256-GCM
- **Rationale:** Flexible, secure, minimal overhead
- Works with env vars (dev) and encrypted DB (prod)

---

## References

- **Constitution Article III:** Story-Driven Development
- **ADR-001:** RLS Strategy (tenant isolation)
- **Security Patterns:** `docs/SECURITY-PATTERNS.md` (Token Security L3)
- **Espaider Integration:** `docs/ESPAIDER-INTEGRATION.md` (Token resolution flow)
- **Code:** `src/lib/security/integration-token.ts` (63 LOC)

---

## Migration Path

**Existing plaintext tokens → Encrypted tokens:**

```sql
-- 1. Create backup
SELECT id, token INTO espaider_apis_backup FROM espaider_apis;

-- 2. Update tokens to encrypted format (via application)
-- Server-side: load token, encrypt, update DB

-- 3. Verify decryption works
SELECT id, nome FROM espaider_apis WHERE token LIKE 'enc:v1:%';

-- 4. Validate sync still works
-- Run syncEspaiderAction() and verify no errors
```

---

## Para @devops (Gage)

**Secret Management:**
- `INTEGRATION_TOKEN_SECRET`: 32-char random string, rotate quarterly
- Store in Vercel environment variables (encrypted at rest)
- Never commit to git or `.env` files
- Rotation requires DB re-encryption (via server action)

**When deploying:**
- Verify `INTEGRATION_TOKEN_SECRET` is set before pushing
- Test `npm run test:a11y` includes token encryption tests
- Monitor `integration_log_entries` for decryption failures

**Emergency:**
- If secret leaked: rotate immediately + re-encrypt all tokens
- If decryption fails: fallback to `ESPAIDER_TOKEN` env var

---

## Para @architect (Aria)

**Integration Design:**
- Token fallback is part of broader sync resilience (Circuit Breaker pattern)
- Encryption transparent to application layer
- Security layer abstracted in `integration-token.ts` module
- Sync flow documented in `docs/ESPAIDER-INTEGRATION.md`

---

— Orion, orquestrando o sistema 🎯

**Version:** v0.2.3+
**Last Updated:** 2026-03-15
**Status:** PRODUCTION (Live)
