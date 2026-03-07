# EPIC 6 — System Hardening: Type Safety & Security

**Document Status:** FASE 10 — Implementation Planning ⏳ READY FOR STORY CREATION
**Data:** 2026-03-07
**Version:** 1.0 (AIOX Brownfield Discovery FASE 10)
**Created By:** Morgan (PM)
**Approved By:** Aria (@architect), Quinn (@qa)
**Framework:** AIOX Story Development Cycle (SDC)

---

## Epic Summary

**Objetivo:** Endureccer a plataforma contra erros em runtime, aumentar type safety para facilitar refactoring seguro, e validar cobertura de autenticação em middleware — preparando para escala de produção com confiança.

**Estratégia:** 3 frentes independentes (TypeScript strict mode, Error boundaries, Auth audit) executadas sequencialmente para evitar conflito de mudanças.

**Valor de Negócio:**
- Redução de bugs relacionados a tipos (20-30% fewer runtime errors)
- Tratamento consistente de erros de app (melhora UX, reduz suporte)
- Validação de autenticação em todas as rotas (aumenta segurança)
- Refactoring seguro habilitado (arquitetura da Fase 3)

**Timeline:** 4-6 semanas (April 1 — Mid-May, 2026)
**Team:** Aria (@architect) + Dex (@dev) + Quinn (@qa) + Gage (@devops para CI/CD)
**Total Effort:** 40-58 horas

---

## Epic Objectives (MoSCoW)

### MUST (Critical for Production)
- [ ] TypeScript strict mode enabled (20-30h, phased)
- [ ] Error boundary components implemented (8-12h)
- [ ] Auth middleware audit completed (12-16h)

### SHOULD (Security & Quality)
- [ ] Zero TypeScript errors in strict mode
- [ ] All critical routes protected
- [ ] Error boundaries cover all user-facing pages

### COULD (Nice-to-Have)
- [ ] Error monitoring integration (Sentry)
- [ ] Auth logging for compliance

---

## Stories Breakdown

### STORY 6.1: TypeScript Strict Mode Enablement (Phase 1)

**Owner:** Aria (@architect) + Dex (@dev)
**Timeline:** Week 1-3 (20-30 hours, phased)
**Effort:** 20-30h
**Priority:** CRITICAL (foundational for refactoring)
**Dependency:** EPIC 5 (design system stable)
**Parallel With:** None (impacts all code)

#### Acceptance Criteria

- [ ] AC-001: `tsconfig.json` strict mode enabled
  - [ ] Setting: `"strict": true`
  - [ ] Sub-settings all enabled:
    - [ ] `noImplicitAny: true`
    - [ ] `strictNullChecks: true`
    - [ ] `strictFunctionTypes: true`
    - [ ] `strictBindCallApply: true`
    - [ ] `strictPropertyInitialization: true`
    - [ ] `noImplicitThis: true`
    - [ ] `alwaysStrict: true`

- [ ] AC-002: All TypeScript errors resolved
  - [ ] Run `npm run typecheck` — 0 errors
  - [ ] No `// @ts-ignore` comments (or documented exceptions)
  - [ ] All implicit `any` removed
  - [ ] All null/undefined checks added

- [ ] AC-003: Type coverage >95%
  - [ ] No more than 5% of code with implicit types
  - [ ] All API responses typed
  - [ ] All function parameters typed
  - [ ] All return types explicit

- [ ] AC-004: CI/CD integration
  - [ ] GitHub Actions: `typecheck` runs on every PR
  - [ ] Build fails on type errors
  - [ ] All PRs block merge if typecheck fails

- [ ] AC-005: Zero breaking changes
  - [ ] All existing functionality works
  - [ ] No changes to public API signatures
  - [ ] Tests pass before/after (must be pre-fixed)

#### Subtasks

- [ ] Subtask 6.1.1: Audit existing code (2-3h)
  - Identify files with implicit `any` types
  - Count errors: `npm run typecheck 2>&1 | grep error | wc -l`
  - Categorize errors (implicit any vs null checks vs other)
  - Create priority list

- [ ] Subtask 6.1.2: Fix high-impact areas (10-15h)
  - API routes (`src/app/api/*`) — ensure types
  - Server actions (`src/app/actions/*`) — add return types
  - Components (`src/components/*`) — prop types, state types
  - Utils/lib (`src/lib/*`) — function signatures
  - **Strategy:** Fix module-by-module to avoid merge conflicts

- [ ] Subtask 6.1.3: Fix low-impact areas (5-8h)
  - Config files (`tailwind.config.ts`, `next.config.ts`, etc.)
  - Scripts and build tools
  - Types for third-party libraries (if missing)

- [ ] Subtask 6.1.4: Validation & testing (3-4h)
  - Run `npm run typecheck` → 0 errors
  - Run full test suite: `npm test`
  - Build check: `npm run build`
  - Integration test: dev server starts clean

#### File List

- `tsconfig.json` (UPDATED with strict mode)
- `tsconfig.strict.json` (NEW, for reference)
- Multiple source files (UPDATED with type annotations)
- `.github/workflows/typecheck.yml` (NEW or UPDATED)

#### Validation Checklist

- [ ] `npm run typecheck` returns 0 errors
- [ ] Type coverage >95%
- [ ] All tests pass
- [ ] Build completes successfully
- [ ] No `// @ts-ignore` comments (or all documented)
- [ ] CodeRabbit review passed
- [ ] @qa sign-off on functionality

---

### STORY 6.2: Error Boundary Components & Global Error Handling (Weeks 1-3)

**Owner:** Dex (@dev) + Aria (@architect)
**Timeline:** Weeks 1-3 (8-12 hours)
**Effort:** 8-12h
**Priority:** HIGH (production stability)
**Dependency:** None (can run in parallel with 6.1)
**Parallel With:** Story 6.1 (separate concerns)

#### Acceptance Criteria

- [ ] AC-001: Error Boundary components implemented
  - [ ] Component: `src/components/error/ErrorBoundary.tsx`
    - [ ] Catches React render errors
    - [ ] Displays user-friendly error message
    - [ ] Logs to console + error tracking service
    - [ ] Reset button to retry
  - [ ] Applied to all major page sections
  - [ ] Fallback UI is accessible and professional

- [ ] AC-002: Layout-level error handling
  - [ ] Root layout (`src/app/layout.tsx`) wrapped in ErrorBoundary
  - [ ] Dashboard layouts wrapped
  - [ ] Modal/dialog error states handled
  - [ ] API error states trigger graceful UI updates (not crashes)

- [ ] AC-003: Not-found & error pages
  - [ ] Pages: `src/app/not-found.tsx`, `src/app/error.tsx`
  - [ ] Both styled consistently
  - [ ] Users can navigate back
  - [ ] Error details logged (but not shown in UI)

- [ ] AC-004: API error responses standardized
  - [ ] All API routes return structured error:
    ```json
    { "error": "message", "code": "ERROR_CODE", "status": 400 }
    ```
  - [ ] Client catches and displays gracefully
  - [ ] No raw error objects exposed to browser

- [ ] AC-005: Zero unhandled promise rejections
  - [ ] Global handler: `window.onunhandledrejection`
  - [ ] Logs to error tracking service
  - [ ] User notification (toast or banner)

#### Subtasks

- [ ] Subtask 6.2.1: ErrorBoundary implementation (2-3h)
  - Create component with render error catching
  - Add fallback UI
  - Integrate error tracking (Sentry stub)
  - Test with intentional errors

- [ ] Subtask 6.2.2: Layout integration (2-3h)
  - Wrap root and major sections in ErrorBoundary
  - Test that errors caught, not propagated
  - Verify fallback UI displays correctly

- [ ] Subtask 6.2.3: Not-found & error pages (1-2h)
  - Create `not-found.tsx`
  - Create `error.tsx`
  - Style consistently
  - Add back navigation

- [ ] Subtask 6.2.4: API error standardization (2-3h)
  - Audit all API routes for error handling
  - Standardize error response format
  - Update client error handling
  - Test with broken endpoints

- [ ] Subtask 6.2.5: Testing (1-2h)
  - Manual error triggering (throw errors in components)
  - Test error boundary catches them
  - Test unhandled rejection handling
  - Verify error logging

#### File List

- `src/components/error/ErrorBoundary.tsx` (NEW)
- `src/app/error.tsx` (NEW/UPDATED)
- `src/app/not-found.tsx` (NEW/UPDATED)
- `src/components/error/ErrorFallback.tsx` (NEW)
- `src/lib/error-handling.ts` (NEW, utilities)
- Multiple API routes (UPDATED with error handling)

#### Validation Checklist

- [ ] ErrorBoundary catches render errors
- [ ] Error pages look professional
- [ ] API errors return structured responses
- [ ] No unhandled promise rejections in console
- [ ] Error logging works (check logs)
- [ ] CodeRabbit review passed
- [ ] @qa manual testing of error states

---

### STORY 6.3: Auth Middleware Audit & Coverage (Weeks 2-4)

**Owner:** Aria (@architect) + Dex (@dev)
**Timeline:** Weeks 2-4 (12-16 hours)
**Effort:** 12-16h
**Priority:** CRITICAL (security)
**Dependency:** None (can run in parallel)
**Parallel With:** Stories 6.1, 6.2

#### Acceptance Criteria

- [ ] AC-001: Auth middleware audit completed
  - [ ] Document: `docs/security/auth-middleware-audit.md`
  - [ ] All routes classified:
    - [ ] Public routes (no auth required)
    - [ ] Protected routes (auth required)
    - [ ] Admin routes (role-based access)
    - [ ] API routes (token-based)
  - [ ] No unprotected routes that should be protected
  - [ ] RLS validates at database level (defense in depth)

- [ ] AC-002: Middleware implementation
  - [ ] File: `src/middleware.ts` (or `middleware.ts`)
  - [ ] Checks for valid session on protected routes
  - [ ] Redirects unauthenticated users to login
  - [ ] Validates JWT token expiry
  - [ ] No sensitive data exposed in middleware logs

- [ ] AC-003: Protected routes enforcement
  - [ ] All `/dashboard/*` routes protected
  - [ ] All `/admin/*` routes protected
  - [ ] API routes with JWT validation
  - [ ] Webhook routes (if any) validated by signature

- [ ] AC-004: Test coverage for auth
  - [ ] Unit tests: middleware logic
  - [ ] Integration tests: protected routes
  - [ ] Test: unauthorized access denied
  - [ ] Test: expired token rejected
  - [ ] Test: valid token accepted

- [ ] AC-005: Documentation & runbook
  - [ ] How auth middleware works (runbook)
  - [ ] How to add new protected routes
  - [ ] Role-based access patterns
  - [ ] Token refresh flow

#### Subtasks

- [ ] Subtask 6.3.1: Audit all routes (3-4h)
  - List all routes in app
  - Classify each (public/protected/admin)
  - Document in spreadsheet
  - Identify gaps (unprotected routes that should be protected)

- [ ] Subtask 6.3.2: Middleware implementation (4-5h)
  - Create/update `src/middleware.ts`
  - Implement session validation
  - Add JWT expiry check
  - Implement redirect logic

- [ ] Subtask 6.3.3: Route protection (2-3h)
  - Protect all dashboard routes
  - Protect all admin routes
  - Add token validation to API routes
  - Test each route manually

- [ ] Subtask 6.3.4: Testing & validation (2-3h)
  - Write unit tests for middleware
  - Integration tests for protected routes
  - Test expired tokens
  - Test unauthorized access

- [ ] Subtask 6.3.5: Documentation (1-2h)
  - Write audit report
  - Create implementation runbook
  - Document patterns

#### File List

- `src/middleware.ts` (NEW/UPDATED)
- `docs/security/auth-middleware-audit.md` (NEW)
- `src/app/api/auth/*` (UPDATED if needed)
- Test files: `__tests__/middleware.test.ts`, etc. (NEW)

#### Validation Checklist

- [ ] Audit report complete with all routes classified
- [ ] Middleware code written and tested
- [ ] All protected routes enforce auth
- [ ] Tests pass (unit + integration)
- [ ] No console warnings about unprotected routes
- [ ] CodeRabbit review passed (security focus)
- [ ] @qa sign-off on auth coverage

---

## Dependencies & Timeline

```
Week 1 (Start April 1)
├─ Story 6.1 (TypeScript Strict) — STARTS (audit + high-impact fixes)
├─ Story 6.2 (Error Boundaries) — STARTS (parallel track)
└─ Story 6.3 (Auth Audit) — STARTS (audit phase)

Week 2
├─ Story 6.1 — CONTINUES (low-impact fixes)
├─ Story 6.2 — CONTINUES (integration + testing)
└─ Story 6.3 — CONTINUES (middleware implementation)

Week 3
├─ Story 6.1 — FINALIZES (validation + CI integration)
├─ Story 6.2 — FINALIZES (testing + documentation)
└─ Story 6.3 — CONTINUES (route protection + testing)

Week 4
├─ Story 6.1 — DONE
├─ Story 6.2 — DONE
└─ Story 6.3 — FINALIZES (documentation + sign-off)

CRITICAL PATH: All 3 stories end by Week 4 (end of April)
```

---

## Resource Allocation

| Role | Stories | Total Hours | Weeks | Availability |
|------|---------|-------------|-------|--------------|
| Aria (@architect) | 6.1, 6.3 | 20-25h | 4 | 5-6h/week |
| Dex (@dev) | 6.1, 6.2, 6.3 | 20-25h | 4 | 5-6h/week |
| Quinn (@qa) | All stories | 6-8h | 4 | 1.5-2h/week |
| **TOTAL** | **3 Stories** | **40-58h** | **4 weeks** | **~12 person-hours/week** |

---

## Success Metrics

### TypeScript Strict Mode (Story 6.1)
- [ ] `npm run typecheck` → 0 errors
- [ ] Type coverage >95%
- [ ] All tests pass
- [ ] CI pipeline blocks on type errors
- [ ] Team reports 30% faster refactoring

### Error Handling (Story 6.2)
- [ ] Zero unhandled errors in console
- [ ] Error boundaries catch all render errors
- [ ] API errors structured and handled
- [ ] User experience improved (no white screens)

### Auth Security (Story 6.3)
- [ ] All protected routes enforced
- [ ] Auth middleware in place
- [ ] 100% of sensitive routes validated
- [ ] Zero unauthorized access possible

---

## Risk Assessment

| Risk | Severity | Probability | Mitigation | Status |
|------|----------|-------------|-----------|--------|
| TypeScript strict mode breaks too much | HIGH | 10% | Phased rollout, test-first approach | ✅ MITIGATED |
| Error boundaries hide important errors | MEDIUM | 5% | Comprehensive logging to service | ✅ MITIGATED |
| Auth middleware blocks legitimate users | MEDIUM | 5% | Thorough testing + staging validation | ✅ MITIGATED |
| Merge conflicts during large refactor | MEDIUM | 15% | Coordinate across team, frequent syncs | ✅ MITIGATED |

**Overall Risk Level: MEDIUM** — Mitigated with phased approach

---

## Handoff to Phase 3

### Deliverables for EPIC 7 (Polish & Optimization)
- ✅ Type-safe codebase (foundation for refactoring)
- ✅ Consistent error handling (UX foundation)
- ✅ Secure auth architecture (foundation for compliance)

### Phase 3 Preparation
- Codebase is refactorable with confidence
- Error handling patterns established
- Security baseline validated

---

## Approval & Signatures

**Created By:** Morgan (PM)
**Reviewed By:** Aria (@architect)
**Validated By:** Quinn (@qa)

**Status:** ✅ READY FOR STORY CREATION (@sm)

**Next Phase:** Scrum Master (@sm) breaks down stories into detailed tasks, coordinates with @dev and @architect

---

*AIOX Brownfield Discovery — FASE 10 Implementation Planning*
*EPIC 6: System Hardening — Type Safety & Security*
*Document created: 2026-03-07 | Version: 1.0*
