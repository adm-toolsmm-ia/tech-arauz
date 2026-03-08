# CORS Architecture Discovery — Story 7-B-1

**Date:** 2026-03-08 | **Architect:** Aria | **Mode:** Discovery Analysis
**Status:** Architecture Planning Phase 1 COMPLETE

---

## Executive Summary

Tech Arauz uses **Next.js 14 (App Router)** with **Supabase** backend. Current security headers are partially implemented in `next.config.mjs`, but **CORS middleware is missing** for cross-origin API requests.

**Current State:**
- ✅ Basic security headers implemented (X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
- ✅ Supabase integrated with client-side auth (ANON_KEY available)
- ❌ **CORS middleware not configured** → May cause CORS errors in production
- ❌ **Dynamic origin validation missing** → Cannot handle multiple environments
- ❌ **HSTS, CSP headers missing** → Not production-ready

---

## 1. Current State Analysis

### 1.1 Project Architecture

```
Tech Arauz (Next.js 14 + Supabase)
├── Frontend
│   ├── src/app/           (Next.js App Router)
│   ├── src/app/actions/   (Server Actions for API calls)
│   ├── src/components/    (React components)
│   └── src/stories/       (Storybook - newly setup Phase 1)
│
├── Backend
│   ├── Supabase (pybmawlwpmxshtccpqui.supabase.co)
│   │   ├── PostgREST API  (Auto-generated REST endpoints)
│   │   ├── Realtime       (WebSocket for subscriptions)
│   │   ├── Edge Functions (If used)
│   │   └── RLS Policies   (Row-level security on tables)
│   │
│   └── Next.js API Routes (TODO: Not yet created)
│       └── /api/          (For custom business logic)
│
└── Deployment
    ├── Frontend: Vercel (https://tech-arauz.vercel.app)
    ├── Backend: Supabase Cloud (https://pybmawlwpmxshtccpqui.supabase.co)
    └── Database: PostgreSQL on Supabase
```

### 1.2 Current Security Headers (next.config.mjs)

✅ **Already Implemented:**
```javascript
{
  'X-Frame-Options': 'DENY',           // Clickjacking protection
  'X-Content-Type-Options': 'nosniff', // MIME sniffing protection
  'Referrer-Policy': 'strict-origin-when-cross-origin'
}
```

❌ **Missing (Required for Production):**
- HSTS (Strict-Transport-Security)
- CSP (Content-Security-Policy)
- CORS headers (Access-Control-*)

---

## 2. Identified Frontend Origins (Environment Analysis)

| Environment | Origin | Protocol | Use Case |
|-------------|--------|----------|----------|
| **Local Dev** | `http://localhost:3000` | HTTP | Developer machines |
| **Local Test** | `http://localhost:3001` | HTTP | E2E testing, Cypress |
| **Staging** | `https://staging-arauz.vercel.app` | HTTPS | Pre-production validation |
| **Production** | `https://tech-arauz.vercel.app` | HTTPS | Live environment |

**Note:** Currently, only production origin is deployed. Dev/staging can be added as needed.

---

## 3. Supabase Auth Token Flow (CORS Context)

### 3.1 Current Authentication Flow

```
Frontend (Next.js)
    ↓ (1. Login via Supabase UI or Custom Form)
Supabase Auth Service
    ↓ (2. Returns JWT Token + Session)
Frontend Store (zustand or cookies)
    ↓ (3. Include token in API headers)
Supabase PostgREST API
    ↓ (4. Validate JWT + Apply RLS policies)
Protected Data (if user owns record)
```

### 3.2 CORS-Relevant Auth Details

**Token Format:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token Validation Points (for CORS):**
1. **Preflight Request (OPTIONS):**
   - Browser sends `Access-Control-Request-Headers: authorization`
   - Server must respond with matching headers
   - **Action:** Include `Authorization` in `Access-Control-Allow-Headers`

2. **Actual Request:**
   - Token sent in `Authorization` header
   - Supabase validates token signature
   - RLS policies applied based on `auth.uid()`
   - **Action:** Ensure CORS allows Authorization header

**Potential CORS Issues:**
- ❌ `Authorization` header not allowed → Token rejected
- ❌ Origin not whitelisted → Request blocked at preflight
- ❌ Credentials not allowed → Session cookies lost (if using cookies)

---

## 4. API Routes Assessment

### 4.1 Current API Surface

**Supabase PostgREST (Managed):**
- Endpoint: `https://pybmawlwpmxshtccpqui.supabase.co/rest/v1/`
- CORS: Configured by Supabase (allows all origins by default for ANON_KEY)
- Auth: JWT validation via Supabase

**Next.js API Routes (To Create):**
- Location: `src/app/api/[route]/route.ts` (App Router)
- Status: NOT YET CREATED (only Server Actions exist)
- Purpose: Custom business logic, external API integrations, middleware

**Server Actions (Current):**
- Files: `src/app/actions/*.ts` (agent-types.ts, projects.ts, etc.)
- CORS: N/A (Server-side only, no cross-origin calls)

---

## 5. CORS Policy Architecture

### 5.1 Recommended CORS Configuration

**Middleware Location:** `middleware.ts` (at `src/middleware.ts`)

**Allowed Origins (Environment-Dependent):**
```typescript
const allowedOrigins = {
  development: ['http://localhost:3000', 'http://localhost:3001'],
  staging: ['https://staging-arauz.vercel.app'],
  production: ['https://tech-arauz.vercel.app'],
};
```

**Configuration:**
```
Allowed Origins:  [Dynamic from env]
Allowed Methods:  GET, POST, PUT, DELETE, PATCH, OPTIONS
Allowed Headers:  Content-Type, Authorization, X-Request-ID
Expose Headers:   X-Total-Count (for pagination), Content-Type
Max Age:          86400 (24 hours)
Allow Credentials: true (for future cookie-based auth)
```

### 5.2 Implementation Strategy

**Option A: Middleware (Recommended)**
- File: `src/middleware.ts`
- Handles: Dynamic origin validation, dynamic headers
- Scope: All routes (including API, RPC, etc.)
- Flexibility: ⭐⭐⭐⭐⭐ (can change based on request context)

**Option B: next.config.js Headers**
- File: `next.config.mjs`
- Handles: Static headers only
- Scope: Specific route patterns
- Flexibility: ⭐⭐ (limited to static patterns)

**Recommended: Hybrid Approach**
1. **Middleware** for CORS (dynamic)
2. **next.config.mjs** for security headers (static)

---

## 6. Security Headers Strategy

### 6.1 Headers to Add

| Header | Purpose | Value | Env |
|--------|---------|-------|-----|
| **HSTS** | Force HTTPS | `max-age=31536000; includeSubDomains; preload` | Prod only |
| **CSP** | Script injection protection | `default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.vercel...` | All |
| **X-Permitted-Cross-Domain-Policies** | Adobe Flash | `none` | All |
| **Permissions-Policy** | Feature delegation | `geolocation=(), microphone=(), camera=()` | All |

### 6.2 CSP Strategy for Tech Arauz

**Baseline CSP:**
```
default-src 'self'
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.vercel.app
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com
font-src 'self' https://fonts.gstatic.com
img-src 'self' data: https: https://pybmawlwpmxshtccpqui.supabase.co
connect-src 'self' https://pybmawlwpmxshtccpqui.supabase.co wss://
frame-ancestors 'none'
```

**Note:** CSP should be tested and refined based on actual resources loaded.

---

## 7. Deployment Considerations

### 7.1 Environment Variables

**To Add:**

```bash
# .env.example
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
HSTS_ENABLED=false  # true in production
CSP_ENABLED=true    # Can be toggled per environment
```

**To Populate Per Environment:**

```
Development:  CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
Staging:      CORS_ALLOWED_ORIGINS=https://staging-arauz.vercel.app
Production:   CORS_ALLOWED_ORIGINS=https://tech-arauz.vercel.app,HSTS_ENABLED=true
```

### 7.2 Vercel Deployment

**No Special Configuration Needed:**
- Vercel routes all requests through Next.js automatically
- Middleware executes at edge (Vercel Edge Network)
- Performance: < 1ms overhead for CORS checks

---

## 8. Risk Assessment

### 8.1 Current Risks

| Risk | Severity | Mitigation |
|------|----------|-----------|
| **No CORS middleware** | HIGH | Implement middleware.ts |
| **Missing HSTS** | HIGH | Add to next.config.mjs for production |
| **Hardcoded origins** | MEDIUM | Use env vars with dynamic loading |
| **CSP not configured** | MEDIUM | Add baseline CSP, refine after testing |
| **No preflight handling** | HIGH | Middleware handles automatically |

### 8.2 Security Testing Plan

```bash
# Test preflight request
curl -i -X OPTIONS http://localhost:3000 \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Authorization"

# Test actual request with token
curl -i -X POST http://localhost:3000/api/data \
  -H "Origin: http://localhost:3000" \
  -H "Authorization: Bearer [TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

---

## 9. Implementation Roadmap

### Phase 1: Discovery (✅ COMPLETE)
- [x] Analyze current API routes
- [x] Identify frontend origins
- [x] Review Supabase auth flow
- [x] Create CORS policy document

### Phase 2: Implementation (→ Next Task)
- [ ] Create `src/middleware.ts` with CORS logic
- [ ] Create `lib/cors-config.ts` for configuration
- [ ] Update `next.config.mjs` with security headers
- [ ] Add environment variables
- [ ] Test locally (curl, Postman, browser)

### Phase 3: Validation & Documentation
- [ ] Integration testing with real Supabase calls
- [ ] Browser console validation (no CORS errors)
- [ ] CodeRabbit security review
- [ ] Production deployment checklist update

---

## 10. Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/middleware.ts` | Create | CORS middleware + dynamic origin validation |
| `lib/cors-config.ts` | Create | CORS policy constants |
| `docs/architecture/cors-security.md` | Create | Security documentation |
| `next.config.mjs` | Modify | Add HSTS, CSP headers |
| `.env.example` | Modify | Add CORS_ALLOWED_ORIGINS var |

---

## 11. Success Criteria

✅ **Phase 1 Complete When:**
- All origins identified and documented
- CORS policy defined with concrete values
- Security headers strategy documented
- Risk assessment completed
- Implementation roadmap ready

**Ready for:** Phase 2 Implementation by @dev

---

## Next Action

**Phase 2:** Implement middleware, security headers, and test locally.
**Estimated:** 2-3 hours (@dev)

---

*Discovery Analysis Complete — Ready for Implementation Planning*
*Aria, arquitetando o futuro 🏗️*
