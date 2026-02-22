# System Architecture — Tech Arauz

**Document**: Phase 1 of Brownfield Discovery
**Date**: 2026-02-21
**Project**: Tech Arauz - Portal de Gestão 360° de TI/Inovação/Projetos
**Status**: Completed

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [Code Structure](#code-structure)
5. [Integration Architecture](#integration-architecture)
6. [Data Architecture Overview](#data-architecture-overview)
7. [Deployment & Infrastructure](#deployment--infrastructure)
8. [Development Practices](#development-practices)

---

## Executive Summary

**Tech Arauz** is a Next.js-based SaaS portal for centralized IT project management (360° view). It integrates hierarchical data from the **Espaider ERP** via WCF API and provides interactive dashboards for real-time project visibility.

### Key Characteristics
- **Stage**: In production (Branch main stable, clean)
- **Users**: Gabriel (CTO) + IT managers + technical teams
- **Multi-tenant**: Prepared architecture (single-tenant: tenant `arauz` active)
- **Core Problem Solved**: Centralized visibility of projects, deliverables, schedules, and integration metrics
- **Primary Integration**: Espaider WCF API (read-only, hierarchical sync)

---

## Technology Stack

### Frontend
| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Next.js (App Router) | 14.2.x | SSR, API routes, file-based routing |
| **Language** | TypeScript | 5.5.x | Type safety |
| **Runtime** | Node.js | 20+ | Server runtime |
| **UI Library** | React | 18.3.x | Component framework |
| **UI Components** | Shadcn/ui | latest | Headless component system (Radix UI + Tailwind) |
| **Styling** | Tailwind CSS | 3.4.x | Utility-first CSS |
| **State Management** | TanStack Query | 5.50.x | Server state (caching, sync) |
| **Client State** | Zustand | 4.5.x | Lightweight client state |
| **Charts** | Recharts | 2.12.x | Interactive data visualization |
| **Icons** | Lucide React | 0.400.x | Icon library |
| **Rich Text Editor** | TipTap | 3.19.x | Editor extensions + customization |
| **Date Handling** | date-fns | 3.6.x | Date parsing, formatting, math |
| **Form Validation** | Zod | 3.23.x | Schema validation |
| **Drag & Drop** | dnd-kit | 6.3.x | Sortable/draggable lists |
| **Theme** | next-themes | 0.3.x | Light/dark mode |
| **Notifications** | Sonner | 1.5.x | Toast notifications |

### Backend
| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Database** | Supabase (PostgreSQL) | 15+ | Relational data, RLS, real-time |
| **Authentication** | Supabase Auth + SSR | 0.5.x | JWT, session management |
| **API** | Next.js Server Actions + Route Handlers | 14.2.x | API endpoints, server-side logic |
| **ORM** | Supabase Client (typed) | 2.45.x | Database queries |
| **Integration** | Espaider WCF API | v4 | Hierarchical data sync |

### DevOps & Quality
| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Deployment** | Vercel | latest | Serverless, auto-scaling, 99.9% SLA |
| **Testing** | Vitest | 1.6.x | Unit/integration tests |
| **Linting** | ESLint | 8.57.x | Code quality |
| **Code Formatting** | Prettier | 3.8.x | Code style consistency |
| **Type Checking** | TypeScript tsc | 5.5.x | Static type analysis |
| **Package Manager** | npm | latest | Dependency management |

---

## System Architecture

### 3-Tier Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│              (React Components + Shadcn/ui)                 │
│  ├─ Pages: /dashboard, /projetos, /cronogramas, etc.        │
│  ├─ Components: ProjectCockpit, KPICard, Charts, etc.      │
│  └─ State: TanStack Query (server) + Zustand (client)      │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                  APPLICATION LAYER                          │
│              (Next.js Server Actions + Routes)              │
│  ├─ /api/integracoes/... (integration endpoints)            │
│  ├─ /api/projetos/... (project endpoints)                   │
│  ├─ Server Actions (form submission, data mutations)        │
│  └─ Sync Orchestration (Espaider → Supabase)               │
└──────────────────┬──────────────────────────────────────────┘
                   │
         ┌─────────┴──────────┐
         ▼                    ▼
    ┌─────────────┐    ┌──────────────────┐
    │  Supabase   │    │  Espaider WCF    │
    │ PostgreSQL  │    │  API (read-only) │
    │   + RLS     │    │                  │
    └─────────────┘    └──────────────────┘
```

### Component Layers

#### 1. **Presentation Layer** (Frontend)
- **Framework**: React 18 with Next.js 14 App Router
- **State Management**:
  - **Server State**: TanStack Query (caching, background sync)
  - **Client State**: Zustand (UI state, filters, view toggles)
- **Components**:
  - Page components: `/projetos`, `/dashboard`, `/cronogramas`, `/integracoes`, `/cadastros`
  - Feature components: `ProjectCockpit` (360° view), `KPICard`, `ProjectFilters`, `LogViewer`
  - UI primitives: Shadcn/ui (based on Radix UI + Tailwind)
- **Data Visualization**:
  - Recharts for graphs (KPI pipeline, distribution, trend)
  - Custom timeline for project history
  - Gantt charts for schedules (using gantt-task-react)

#### 2. **Application Layer** (Server)
- **Server Actions**: Form handling, data mutations
- **Route Handlers** (`/api/*`):
  - `/api/integracoes/logs` — Integration log querying with RLS
  - `/api/integracoes/logs/summary` — Aggregated sync metrics
  - `/api/projetos/*` — Project CRUD operations
  - Authentication: Supabase middleware enforces tenant isolation
- **Sync Orchestration** (`src/lib/sync/espaider-sync.ts`):
  - Scheduled/manual sync trigger
  - Multi-dataset sync: Projetos → Entregas → Cronogramas → Requisitos → Históricos → Aprovadores → Orçamentos
  - Error handling & retry logic
  - Structured logging to `integration_log_entries` table

#### 3. **Data Layer** (Backend)
- **Database**: Supabase (PostgreSQL 15+)
  - **RLS Policies**: All tables enforce tenant isolation
  - **Audit Trail**: `espaider_raw JSONB` field on all synced tables
  - **Sync Metadata**: `integration_log_entries` for audit & troubleshooting
- **External Integration**: Espaider WCF API (unidirecional, read-only)
  - Single API endpoint: `BI_SOLICITACOES_SUPORTEESPAIDER`
  - Hierarchical response: Projects + child URLs (Deliverables, Schedules, Requirements, Histories, Budgets, Approvers)

---

## Code Structure

### Directory Tree

```
src/
├── app/                          # Next.js App Router pages
│   ├── dashboard/                # Dashboard page + layout
│   ├── projetos/                 # Project list & detail pages
│   ├── cronogramas/              # Schedule calendar & views
│   ├── integracoes/              # Integration logs & API manager
│   ├── cadastros/                # User management (future)
│   ├── agentes/                  # AI agents visualization (future)
│   ├── api/
│   │   ├── integracoes/          # Integration API endpoints
│   │   └── projetos/             # Project API endpoints
│   ├── login/                    # Auth entry point
│   ├── logout/                   # Auth exit
│   ├── layout.tsx                # Root layout + sidebar
│   └── page.tsx                  # Home redirect
├── components/
│   ├── dashboard/                # Dashboard widgets
│   │   └── KPICard.tsx           # KPI metric cards (clickable)
│   ├── project/                  # Project-specific components
│   │   ├── ProjectCockpit.tsx    # 360° project view (6 tabs)
│   │   ├── ProjectFinancials.tsx # Budget & financials
│   │   ├── ProjectTeam.tsx       # Team members
│   │   ├── ProjectTimeline.tsx   # History timeline
│   │   └── ...
│   ├── layout/                   # Layout components
│   │   ├── AppSidebar.tsx        # Modular sidebar with collapsible groups
│   │   ├── DashboardHeader.tsx   # Header with breadcrumbs
│   │   └── SidebarCollapsibleMenu.tsx # Menu group management
│   ├── charts/                   # Data visualizations
│   │   ├── ProjectPipelineChart.tsx # Bar chart (pipeline by status)
│   │   ├── StatusDistributionChart.tsx # Donut chart
│   │   └── ProjectTrendChart.tsx # Line chart (trends)
│   ├── views/                    # Alternate view modes
│   │   ├── ProjectListView.tsx   # Desktop table + mobile cards
│   │   ├── KanbanBoard.tsx       # Kanban view by phase
│   │   ├── SplitView.tsx         # Master-detail split view
│   │   └── ViewToggle.tsx        # Switch between views
│   ├── filters/
│   │   └── ProjectFilters.tsx    # Quick filters + advanced Sheet
│   ├── integracoes/              # Integration-specific components
│   │   ├── LogViewer.tsx         # Sync log viewer (with pagination)
│   │   └── APIManager.tsx        # API configuration UI
│   ├── cronogramas/
│   │   └── CronogramaGantt.tsx   # Gantt chart for schedules
│   ├── ui/                       # Shadcn/ui primitives (generated)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   └── ... (30+ primitives)
│   └── providers.tsx             # TanStack Query + theme providers
├── hooks/
│   └── use-mobile.tsx            # Mobile breakpoint detection
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Supabase client (user + service)
│   │   └── types.ts              # Generated Supabase types
│   ├── sync/
│   │   └── espaider-sync.ts      # Main sync orchestrator
│   │       ├── loadApiConfigs()  # Load credentials
│   │       ├── syncProjects()    # Project sync logic
│   │       ├── syncDeliveries()  # Deliverable sync
│   │       ├── syncSchedules()   # Schedule sync
│   │       ├── syncRequirements()# Requirement sync
│   │       ├── syncHistories()   # History sync (NEW)
│   │       ├── syncBudgets()     # Budget sync (NEW)
│   │       ├── syncApprovers()   # Approver sync (NEW)
│   │       └── persistLogEntries()# Log persistence
│   ├── transformers/
│   │   └── project.ts            # DB rows → UI models
│   ├── utils/
│   │   └── cn.ts                 # Tailwind merge helper
│   ├── constants/
│   │   └── *.ts                  # App constants (statuses, categories)
│   └── mocks/
│       └── *.ts                  # Mock data for testing
├── integrations/
│   └── espaider/
│       ├── client.ts             # Espaider API client
│       ├── config.ts             # Config loader + auth helpers
│       ├── mapper.ts             # Espaider fields → App types (135+ aliases)
│       ├── types.ts              # TypeScript types for API
│       ├── index.ts              # Public exports
│       ├── README.md             # API documentation
│       ├── references/           # Sample responses, docs, test notebooks
│       └── __tests__/            # Contract tests
└── types/
    └── *.ts                      # Global TypeScript types
```

### Key Modules

#### **Integration Layer** (`src/integrations/espaider/`)
- **client.ts**: Exports `exportarDados()` (POST) and `buscarFilhos()` (GET) for API calls
- **mapper.ts**: 135+ field aliases mapping Espaider fields to internal types
- **types.ts**: Type definitions for all Espaider entities (Projeto, Entrega, Cronograma, etc.)
- **config.ts**: Configuration loader + request ID generation
- **Contract Tests**: Validate API response structure

#### **Sync Engine** (`src/lib/sync/espaider-sync.ts`)
- **Multi-dataset orchestration**: Handles 7 datasets synchronously with dependency tracking
- **Idempotent UPSERT**: Uses `UNIQUE(tenant_id, espaider_id)` composite key
- **Error Recovery**: Retry logic with exponential backoff
- **Structured Logging**: `SyncLogEntry[]` persisted to `integration_log_entries`
- **Checkpoint System**: Tracks new/updated records per dataset

#### **API Routes** (`src/app/api/`)
- **Logs Endpoint** (`/api/integracoes/logs`):
  - GET with filters (dataset, level, date range)
  - Pagination support (limit, offset)
  - RLS protection (users see only their tenant's logs)
- **Summary Endpoint** (`/api/integracoes/logs/summary`):
  - Aggregated stats (total, by dataset)
  - Non-critical (fails gracefully)

---

## Integration Architecture

### Espaider Integration Flow

#### 1. **API Configuration**
- **Table**: `espaider_apis` (tenant_id, identificador, base_url, token, is_active)
- **Fallback**: Environment variables (`ESPAIDER_BASE_URL`, `ESPAIDER_TOKEN`)
- **Token Handling**: Supports placeholder `PREENCHER_TOKEN` replaced by env vars at runtime

#### 2. **Hierarchical Data Fetch**
```
Step 1: POST /exportarDados
├─ Input: BI_SOLICITACOES_SUPORTEESPAIDER
├─ Output: ListaRegistros[] (projects)
└─ Also returns: ListaURLFilhos[] (child URLs)

Step 2: For each URL in ListaURLFilhos → GET
├─ URLs map to: Entregas, Cronogramas, Requisitos, Históricos, Orçamentos, Aprovadores
└─ Output: ListaRegistros[] for each child type
```

#### 3. **Mapping & Transformation**
- **135+ field aliases**: Each Espaider field → internal database column
- **Type coercion**:
  - Dates: Parse ISO strings to JavaScript Dates
  - Booleans: "Sim" / "Não" → true/false
  - Numbers: Parse strings to integers/floats
  - Nulls: Treat empty strings as null
- **Raw JSON Storage**: All records stored in `espaider_raw JSONB` for audit trail

#### 4. **Synchronization Strategy**
```
UPSERT Pattern:
├─ Match on: (tenant_id, espaider_id)
├─ Insert if no match
└─ Update if match found (preserving local timestamps)

Dataset Order (dependency-aware):
1. Projetos (parent)
   ├─ Entregas (Projeto) → IDREGISTROPAI
   ├─ Cronogramas (Projeto) → IDREGISTROPAI
   ├─ Requisitos (Projeto) → IDREGISTROPAI
   ├─ Históricos (Projeto) → IDREGISTROPAI
   ├─ Orçamentos (Projeto) → IDREGISTROPAI
   └─ Aprovadores (Projeto) → IDREGISTROPAI
2. Others (independent)
```

#### 5. **Error Handling & Recovery**
- **Retryable Errors**: Network, timeouts, rate limits (retry 3x with backoff)
- **Non-retryable**: Auth errors, invalid response format (fail immediately)
- **Circuit Breaker**: After 5 consecutive failures, halt syncs for 60 seconds
- **Logging**: All errors logged to console + `integration_log_entries` with context

#### 6. **Logging & Visibility**
- **Structured Logs**: `SyncLogEntry` objects with timestamp, level, dataset, message
- **Persistence**: `persistLogEntries()` writes to `integration_log_entries` table
- **UI Display**: `LogViewer` component fetches and displays logs with filtering, pagination

---

## Data Architecture Overview

### Database Schema (25 Migrations Applied)

#### Core Tables
| Table | Purpose | Key Fields | RLS |
|-------|---------|-----------|-----|
| `tenants` | Tenant metadata | id (UUID), name, is_active | ✅ Service only |
| `profiles` | User profiles | id (UUID), tenant_id, role (admin/user) | ✅ Own tenant |
| `projects` | Project root entity | id (UUID), tenant_id, espaider_id, titulo, status, updated_at | ✅ Own tenant |
| `deliveries` | Project deliverables | id (UUID), tenant_id, project_id, espaider_id, titulo, status | ✅ Own tenant |
| `schedules` | Project timelines/activities | id (UUID), tenant_id, project_id, espaider_id, atividade, data_inicio, data_fim | ✅ Own tenant |
| `requirements` | Project requirements | id (UUID), tenant_id, project_id, espaider_id, codigo, descricao, tipo | ✅ Own tenant |
| `histories` | Project activity history | id (UUID), tenant_id, project_id, espaider_id, tipo, data | ✅ Own tenant |
| `approvers` | Project approvers/reviewers | id (UUID), tenant_id, project_id, espaider_id, tipo, responsavel | ✅ Own tenant |
| `budgets` | Project budget records | id (UUID), tenant_id, project_id, espaider_id, valor, fornecedor | ✅ Own tenant |
| `integration_log_entries` | Sync audit trail | id (UUID), tenant_id, dataset, level, message, created_at | ✅ Own tenant |
| `espaider_apis` | API credentials | id (UUID), tenant_id, identificador, base_url, token, is_active | ✅ Service only |

#### Schema Patterns
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()` (all tables)
- **Tenant Isolation**: `tenant_id UUID NOT NULL` (all tables)
- **Espaider Reference**: `espaider_id BIGINT` (synced tables only)
- **Unique Constraint**: `UNIQUE(tenant_id, espaider_id)` (for idempotent syncs)
- **Audit Field**: `espaider_raw JSONB` (stores raw API response)
- **Timestamps**: `created_at`, `updated_at` (most tables)

#### RLS Policies
- **Service Role Bypass**: Sync operations (no RLS checks)
- **Authenticated Users**: Query own tenant data only
- **Tenant Isolation**: `WHERE tenant_id = auth.uid()` after function mapping
- **Admin Check**: Some operations require `get_user_role() = 'admin'`

---

## Deployment & Infrastructure

### Hosting & CI/CD
- **Platform**: Vercel (serverless Next.js)
- **SLA**: 99.9% uptime
- **Branch Strategy**:
  - `main` — Production (stable, clean git history)
  - Feature branches — Development (squashed before merge)
- **Build**: `npm run build` → Vercel deploys automatically
- **Database**: Supabase PostgreSQL (hosted, managed)

### Environment Configuration
- **Production**: `.env.local` (Vercel secrets dashboard)
- **Development**: `.env.local` (local machine)
- **Required Env Vars**:
  - `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Public anon key
  - `SUPABASE_SERVICE_KEY` — Private service role key
  - `ESPAIDER_BASE_URL` — Espaider API base URL
  - `ESPAIDER_TOKEN` — Espaider WCF API token

### Monitoring & Observability
- **Frontend**: Error boundaries, Sonner notifications
- **Backend**: Server logs + `integration_log_entries` table
- **API Health**: `/api/integracoes/logs/summary` for sync metrics
- **Vercel Analytics**: Built-in deployment & performance monitoring

---

## Development Practices

### Code Standards
- **Imports**: Absolute paths with `@/` prefix (never relative)
- **Exports**: Named exports only (no `export default`)
- **Styling**: Tailwind utility-first + `cn()` helper for class merging
- **Type Safety**: TypeScript strict mode enabled
- **Component Structure**:
  ```typescript
  export interface ComponentProps { /* ... */ }
  export const Component: React.FC<ComponentProps> = ({ ...props }) => { /* ... */ }
  ```

### Testing
- **Framework**: Vitest (fast unit tests)
- **Coverage**: All new features require unit tests
- **Contract Tests**: Espaider API integration validated
- **Commands**:
  - `npm test` — Run tests
  - `npm run test:ui` — Interactive test UI
  - `npm run test:coverage` — Coverage report

### Quality Checks
- **Linting**: `npm run lint` (ESLint + Next.js config)
- **Type Checking**: `npm run typecheck`
- **Formatting**: `npm run format` (Prettier)
- **Pre-commit**: Should validate all above before git commit

### Git Workflow
- **Commit Format**: `<type>([STORY-XXX]): <message>`
  - Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`
  - Example: `feat(projetos): implement project filters [STORY-001]`
- **PR Reviews**: Manual before merge to main
- **Main Branch**: Always stable, deployable

---

## Known Limitations & Tech Debt

### Limitations
1. **TypeScript Strict Mode**: Disabled in some areas (consider enabling)
2. **KPI Satisfaction Score**: Hardcoded 4.5 (no feedback mechanism)
3. **Notifications**: Visual only (no email/Slack alerts)
4. **Mobile**: Responsive design present, but no dedicated mobile app (React Native future)

### Future Enhancements
1. **Real-time Sync**: Supabase Realtime for live updates
2. **Advanced Analytics**: Trend prediction, anomaly detection
3. **Workflow Automation**: Custom triggers for project state changes
4. **Mobile App**: React Native app for on-the-go access
5. **AI Integration**: AIOS agents for intelligent insights

---

## Summary

Tech Arauz is a well-structured, modern Next.js application with:
- ✅ Clear separation of concerns (presentation, application, data layers)
- ✅ Type-safe end-to-end development (TypeScript everywhere)
- ✅ Secure multi-tenant data isolation (RLS + tenant ID checks)
- ✅ Robust Espaider integration (hierarchical sync, error recovery)
- ✅ Production-ready infrastructure (Vercel + Supabase)

The codebase is mature, production-active, and well-positioned for scalability and feature expansion.

---

**Next Phase**: Phase 2 — Database Audit (@data-engineer) will deep-dive into schema design, migrations, RLS policies, and data consistency patterns.
