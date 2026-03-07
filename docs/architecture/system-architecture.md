# Tech Arauz — Brownfield System Architecture

**Document Status:** FASE 1 — System Documentation
**Data:** 2026-03-06
**Version:** 1.0
**Author:** Aria (Architect Agent)

---

## Executive Summary

Tech Arauz is an **AI-native governance platform** for project portfolio management, built on Next.js 14, TypeScript, and Supabase. Multi-tenant design with Espaider ERP integration.

**Current State:** Advanced prototype, clean architecture, event-driven ready

---

## Quick Reference

### Critical Files

- `src/middleware.ts` — Auth & route protection
- `src/app/` — Next.js App Router
- `src/services/` — Business logic
- `supabase/migrations/` — Database

### Protected Routes

- `/dashboard` — Portfolio overview
- `/projetos` — Project management
- `/cronogramas` — Scheduling
- `/integracoes` — API management
- `/agentes` — AI conversations

---

## Technology Stack

| Layer | Tech | Version |
|-------|------|---------|
| Runtime | Node.js | 18+ |
| Framework | Next.js | 14.2.0 |
| Language | TypeScript | 5.5.0 |
| UI | Radix UI + Tailwind | ^1.x |
| State | Zustand + React Query | 4.5 / 5.50 |
| Database | Supabase PostgreSQL | + RLS |

---

## Repository Structure

```
src/
├── app/          # App Router
├── components/   # UI
├── services/     # Business logic
├── integrations/ # External APIs
├── lib/          # Utilities
├── types/        # TypeScript
└── middleware.ts # Auth

supabase/
├── migrations/   # DB versioning
docs/
├── architecture/ # Architecture
├── stories/      # AIOX stories
```

---

## Core Services

### Authentication

- Supabase SSR + JWT
- Protected routes (middleware)
- Multi-tenant RLS

### Project Management

- CRUD operations
- Health calculation
- Espaider sync

### Espaider Integration

**Datasets:** Projetos, Entregas, Cronogramas, Requisitos, Históricos, Aprovadores, Orçamentos
**Pattern:** Idempotent UPSERT on (tenant_id, espaider_id)

### Log Viewer

- Integration log tracking
- RLS with service role bypass

### AI Agents

- Session management
- Conversation persistence

---

## Data Models

| Table | Purpose |
|-------|---------|
| auth.users | Auth |
| tenants | Multi-tenant context |
| projects | Portfolio |
| deliverables | Outputs |
| schedules | Timeline |
| integration_logs | Logs |
| agent_sessions | Conversations |

**RLS:** tenant_id isolation enforced on all tables

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /api/projects | List |
| POST | /api/projects | Create |
| POST | /api/integrations/:id/sync | Sync |
| GET | /api/logs | Logs |
| POST | /api/agents/sessions | Agent session |

---

## Technical Debt

### Resolved ✅

| Issue | Solution |
|-------|----------|
| RLS restrictive | Fallback USING (true) |
| Non-idempotent sync | UPSERT pattern |

### Gaps

- KPI satisfaction_media hardcoded (Medium)
- No email/Slack alerts (Medium)
- TypeScript strict disabled (Low)

---

## External Integrations

### Espaider ERP

- REST API
- 7 datasets
- Exponential backoff

### Supabase

- Auth + Database
- RLS policies
- Real-time

### Vercel

- Hosting
- CI/CD
- Analytics

---

## Development

### Local

```bash
npm install
cp .env.example .env.local
npm run dev  # http://localhost:3000
```

### Deploy

```bash
npm run build
git push origin main  # Auto-deploy
```

### Scripts

- `npm run dev` — Dev
- `npm run lint` — Lint
- `npm run typecheck` — Types
- `npm test` — Tests
- `npm run db:apply` — Migrations

---

## Testing

| Type | Framework | Status |
|------|-----------|--------|
| Unit | Vitest | <30% |
| Integration | jsdom | Minimal |
| E2E | Cypress | None |

---

**Status:** ✅ FASE 1 COMPLETE

**Next:** FASE 2 (Database Audit) → @data-engineer

---

*AIOX Brownfield Discovery Workflow*
