# Story 7-B-1 — CORS Configuration & Security Headers

**Story ID:** 7-B-1
**Epic:** EPIC 7-B | **Type:** Backend Security/Infrastructure
**Assignee:** @architect (Aria) — Planning | TBD @dev (Implementation)
**Effort:** 3-4h (Planning 1h + Implementation 2-3h)
**Sprint:** Week 3 (2026-03-22 to 2026-03-29)
**Status:** Awaiting Architecture Planning

---

## User Story

As a backend security architect,
I want to implement proper CORS configuration with security headers,
So we allow safe cross-origin requests while protecting against common attacks.

---

## Acceptance Criteria

- [ ] CORS policy configured for allowed origins (frontend domain + localhost)
- [ ] Preflight requests handled correctly (OPTIONS method)
- [ ] Security headers implemented (HSTS, X-Frame-Options, X-Content-Type-Options, CSP)
- [ ] Token validation in CORS context
- [ ] Documentation for CORS setup and security implications
- [ ] Local testing validated

---

## Context

**Current State:**
- CORS not yet configured in Next.js API routes
- Security headers not yet implemented
- Frontend may have CORS errors when calling backend

**Target:**
1. Configure CORS middleware/headers for Next.js
2. Whitelist safe origins (frontend domain + localhost)
3. Implement security headers for production
4. Test with token-based authentication
5. Document security assumptions

**Acceptance Criteria:**
- Preflight requests succeed without errors
- Cross-origin POST/PUT/DELETE requests work with proper auth
- All security headers present in production

---

## Subtasks

### 1. Architecture Discovery & Analysis (1h)
- [ ] Analyze current API routes for CORS needs
- [ ] Identify all frontend origins (dev, staging, production)
- [ ] Review Supabase auth token flow in CORS context
- [ ] Create CORS policy document

### 2. CORS Implementation (1.5h)
- [ ] Configure Next.js middleware (or API route handler)
- [ ] Set allowed origins dynamically from env vars
- [ ] Handle preflight OPTIONS requests
- [ ] Add Vary headers for caching
- [ ] Test with browser console

### 3. Security Headers Implementation (1h)
- [ ] HSTS (Strict-Transport-Security)
- [ ] X-Frame-Options (clickjacking protection)
- [ ] X-Content-Type-Options (MIME sniffing protection)
- [ ] Content-Security-Policy (CSP) baseline
- [ ] Referrer-Policy
- [ ] Permissions-Policy

### 4. Testing & Documentation (0.5h)
- [ ] Test preflight requests with curl/Postman
- [ ] Test authenticated requests from frontend
- [ ] Document CORS policy and security headers
- [ ] Add to deployment checklist

---

## Files to Create/Modify

**To Create:**
- `middleware.ts` — CORS middleware or headers config
- `lib/cors-config.ts` — CORS policy configuration
- `docs/architecture/cors-security.md` — CORS & security headers documentation

**To Modify:**
- `next.config.js` — Headers configuration (if using Next.js headers)
- `.env.example` — Add CORS_ALLOWED_ORIGINS variable
- `api/` routes — May need CORS handling in specific routes

---

## Definition of Done

- [ ] CORS middleware/config implemented
- [ ] All 5 security headers present
- [ ] Preflight requests working
- [ ] Token authentication works across origins
- [ ] Documentation complete
- [ ] Local testing passed
- [ ] No browser console CORS errors
- [ ] Status: Ready for Review

---

## Dependencies

**Prerequisite Stories:** None (can start immediately)
**Blocked By:** None
**Unblocks:** Story 7-B-2 (Rate Limiting), deployment to production
**Can Run Parallel With:** Story 7-A-4, 7-B-2, 7-B-3

---

## CodeRabbit Integration

**Focus Areas:**
- CORS header configuration correctness
- Security header best practices
- Origin validation logic
- Env var handling for flexibility

**Severity Rules:**
- CRITICAL: Missing HSTS, open CORS (no origin check)
- HIGH: Missing CSP/X-Frame-Options, hardcoded origins
- MEDIUM: Missing Vary header, suboptimal caching
- LOW: Documentation gaps, code style

---

## Architecture Notes

**CORS Policy:**
```
Allowed Origins:
  - http://localhost:3000 (development)
  - http://localhost:3001 (test)
  - https://tech-arauz.vercel.app (production)

Allowed Methods: GET, POST, PUT, DELETE, OPTIONS
Allowed Headers: Content-Type, Authorization
Max Age: 86400 (24 hours)
Allow Credentials: true (for cookie-based auth if needed)
```

**Security Headers Strategy:**
- Use Next.js `headers()` API in `next.config.js` for static headers
- Use middleware for dynamic headers (e.g., based on origin)
- CSP: Start with `default-src 'self'`, add APIs as needed
- HSTS: Enable for production only (via env var)

---

**Status:** Awaiting @architect planning
**Created:** 2026-03-08
**Last Updated:** 2026-03-08

*EPIC 7-B Infrastructure Security — Story 7-B-1*
