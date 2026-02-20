# Arquitetura do Tech Arauz

> **Documento Principal de Arquitetura**
> **Última atualização**: 2026-02-20
> **Versão**: 2.0 (AIOS-integrated)

---

## Visão Geral

O **Tech Arauz** é um SaaS de gestão de TI que combina:

1. **Gestão 360° de Projetos** — Centraliza dados do ERP Espaider em interface moderna
2. **Gestão de Agentes AI** — Documenta e visualiza workflows de agentes (LangSmith/LangChain/LangGraph)

**Stack**: Next.js 14 + TypeScript + Supabase + TanStack Query + Shadcn/ui
**Deploy**: Vercel
**Tenant**: `arauz` (single-tenant, preparado para multi-tenant)

---

## Componentes Arquiteturais

### Frontend (Next.js 14 + App Router)

```
src/
├── app/                          # Pages (App Router)
│   ├── (authenticated)/          # Layout autenticado
│   │   ├── dashboard/            # Dashboard com KPIs
│   │   ├── projetos/             # Listagem de projetos
│   │   ├── cronogramas/          # View de cronogramas
│   │   ├── integracoes/          # Admin: configuração Espaider/LangSmith
│   │   └── admin/                # Controle de usuários, tabelas auxiliares
│   ├── auth/                     # Pages de auth (login, signup)
│   └── api/                      # API routes (RPC -> Supabase)
│
├── components/                   # React components
│   ├── layout/                   # AppSidebar, DashboardHeader, MainLayout
│   ├── project/                  # ProjectCockpit, ProjectTable
│   ├── filters/                  # ProjectFilters, FilterBar
│   ├── charts/                   # KPICard, BarChart, PieChart, LineChart
│   ├── integracoes/              # LogViewer, ApiConfig
│   └── ui/                       # Shadcn/ui components
│
├── lib/                          # Utilities & logic
│   ├── sync/                     # espaider-sync.ts (sync logic)
│   ├── transformers/             # Data transformers (DB -> UI)
│   ├── supabase.ts               # Client + middleware
│   └── utils.ts                  # Helpers (cn, masks, etc)
│
└── integrations/                 # External APIs
    └── espaider/
        ├── client.ts             # WCF API client
        ├── mapper.ts             # 135+ field aliases
        ├── types.ts              # TS types for Espaider
        └── references/           # Response examples
```

### Backend (Supabase)

```
PostgreSQL Database
├── Tables (8 principais)
│   ├── tenants                   # Multi-tenant base
│   ├── users                     # Auth + roles (admin, user, viewer)
│   ├── projects                  # Sync do Espaider (35+ campos)
│   ├── schedules                 # Cronogramas (filhos de projetos)
│   ├── deliveries                # Entregas (filhos de projetos)
│   ├── requirements              # Requisitos (filhos de projetos)
│   ├── histories                 # Históricos (filhos de projetos)
│   ├── approvers                 # Aprovadores (filhos de projetos)
│   ├── budgets                   # Orçamentos (filhos de projetos)
│   │
│   └── Tabelas auxiliares
│       ├── project_status        # Status possíveis
│       ├── priorities            # Níveis de prioridade
│       ├── issue_types           # Tipos de chamado
│       └── areas                 # Áreas/assuntos
│
├── Functions (Supabase)
│   ├── get_user_tenant_id()      # RLS helper
│   ├── get_user_role()           # RLS helper
│   └── (mais per tabela)
│
├── RLS Policies
│   └── Todas as tabelas com policies FOR ALL (USING true WITH CHECK true)
│       (Suporte para multi-tenant futura)
│
└── Migrations (20 aplicadas)
    ├── 001: Initial schema
    ├── 006: integration_log_entries
    ├── 019: Fix child tables (UUID PK pattern)
    └── 020: Expand dataset constraints
```

### Sincronização Espaider

```
espaider-sync.ts
├── loadConfig()                  # Carrega credenciais (DB fallback → env vars)
├── fetchAndSync()                # Orquestração principal
│   ├── Etapa 1: POST API principal → Projetos
│   ├── Etapa 2: GET cada URL em ListaURLFilhos
│   │   ├── syncSchedules()       # Cronogramas
│   │   ├── syncDeliveries()      # Entregas
│   │   ├── syncRequirements()    # Requisitos
│   │   ├── syncHistories()       # Históricos
│   │   ├── syncApprovers()       # Aprovadores
│   │   └── syncBudgets()         # Orçamentos
│   ├── Etapa 3: persistLogEntries() → integration_log_entries
│   └── Etapa 4: Email/Slack (TODO)
│
└── Padrões
    ├── UPSERT idempotente via UNIQUE(tenant_id, espaider_id)
    ├── espaider_raw JSONB para auditoria
    ├── Token fallback: DB → env vars
    └── Circuit breaker com auto-reset em 30s
```

---

## Fluxo de Dados

### Ciclo de Sync

```
Espaider (Source of Truth)
    ↓ [BI_SOLICITACOES_SUPORTEESPAIDER API]
    ├─ POST → Lista Projetos + ListaURLFilhos
    └─ GET cada URL → Cronogramas, Entregas, Requisitos, Históricos, Aprovadores, Orçamentos
    ↓
Supabase (Normalized Storage)
    ├─ Projects table
    ├─ Child tables (schedules, deliveries, requirements, histories, approvers, budgets)
    └─ integration_log_entries (audit trail)
    ↓
Frontend (Query + Transform)
    ├─ TanStack Query (caching, refetch)
    └─ Transformers (DB → UI models)
    ↓
React Components (Display)
    ├─ ProjectCockpit (360° view)
    ├─ Dashboard (KPIs + charts)
    ├─ ProjectTable (grid filtrado)
    └─ LogViewer (sync history)
```

### API Routes

```
/api/
├── integracoes/
│   ├── logs           # GET: listar logs com filtros/paginação
│   ├── logs/summary   # GET: resumo de syncs recentes
│   └── espaider       # POST: triggar sync manual (admin only)
└── auth/
    ├── login          # POST: JWT via Supabase
    └── logout         # POST: revoke session
```

---

## Decisões Arquiteturais

Documentadas em:

- **Foundation ADRs** (planejamento): [`.context/03-specs/adr/`](./../.context/03-specs/adr/README.md)
- **Runtime ADRs** (implementação): [`.ai/decision-logs-index.md`](./../.ai/decision-logs-index.md)

### Principais:

| Decisão | Rationale | Alternativas |
|---------|-----------|-------------|
| **Supabase** | PostgreSQL + RLS nativo + Auth + serverless | Firebase, AWS RDS, PlanetScale |
| **Next.js 14** | App Router + RSC + Vercel deploy | Remix, SvelteKit, Astro |
| **Shadcn/ui** | Componentes headless + Tailwind | Material-UI, Chakra, Ant |
| **TanStack Query** | Cache automático + refetch | SWR, Redux, Zustand |
| **RLS em todos os dados** | Segurança garantida no DB | Middleware de autorização |
| **UPSERT idempotente** | Sync segura (repetível) | Timestamps, versioning |
| **UUID PK** | Multi-tenant ready | BIGSERIAL |

---

## Padrões de Código

### Imports Absolutos

```typescript
// ✅ Preferido
import { getUser } from '@/lib/supabase'
import { ProjectCockpit } from '@/components/project/ProjectCockpit'

// ❌ Evitar
import { getUser } from '../../../lib/supabase'
```

### Named Exports

```typescript
// ✅ Preferido
export function mapearProjeto(registro: RegistroEspaider): ProjetoMapeado {
  // ...
}

// ❌ Evitar
export default function mapearProjeto(...) {}
```

### Tailwind + cn() Helper

```typescript
import { cn } from '@/lib/utils'

export function Button({ className, ...props }) {
  return (
    <button
      className={cn('px-4 py-2 bg-blue-600 text-white rounded', className)}
      {...props}
    />
  )
}
```

### RLS Policies

```sql
-- ✅ Template correto
CREATE POLICY "users_can_view_own_data" ON public.users
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

### Sync Functions

```typescript
// ✅ Padrão de deliveries (CORRETO - usado para schedules/deliveries/requirements)
const existing = await supabase
  .from('deliveries')
  .select('espaider_id')
  .eq('tenant_id', tenantId)
  .single()
  .throwOnError()
  .catch(() => null)

if (existing?.espaider_id === mapeado.id_espaider) {
  // UPDATE
} else {
  // INSERT
}
```

---

## Segurança

### Autenticação
- Supabase Auth (JWT)
- Sessões via HTTP-only cookies (middleware)
- Roles: `admin`, `user`, `viewer`

### Autorização
- RLS em todas as tabelas
- RBAC via `roles` table
- Função helper `get_user_role()` para policies

### Credenciais
- Token Espaider: mascarado em frontend (view `apis_safe`)
- Fallback: DB → env vars → erro
- Nunca exibir em texto plano

### Dados Sensíveis
- SQL injection: Supabase prepared statements
- XSS: React escaping automático
- CORS: configurado em Vercel

---

## Performance

### Cache
- TanStack Query: stale-while-revalidate
- Refetch ao focar janela / reconectar
- Invalidate manual após mutations

### Database
- Índices em `tenant_id, espaider_id` (UNIQUE composite)
- RLS policies: minimal overhead
- Migrations testadas (test-sync.mjs, trigger-sync.mjs)

### Frontend
- Dynamic imports para code splitting
- Image optimization via `next/image`
- Tailwind purge (production)

---

## Monitoramento

### Logs
- `integration_log_entries` table → LogViewer UI
- Métricas: processados, novos, atualizados, erros
- Timestamps para rastreabilidade

### Observabilidade (TODO)
- LangSmith para agentes AI (Fase 2)
- Sentry para error tracking
- Datadog para APM

---

## Infraestrutura

### Development
```bash
npm run dev                 # Next.js dev server (localhost:3000)
supabase start              # Local Supabase
npm run test-sync           # Verificar sincronização
```

### Staging
- Branch: `develop`
- Deploy: Vercel preview
- Database: Supabase staging

### Production
- Branch: `main`
- Deploy: Vercel
- Database: Supabase production
- Backups: Automated (Supabase)

---

## Roadmap

### Fase 1: Gestão de Projetos ✅ (85% completo)
- ✅ Auth, Import Espaider, Visualização, Dashboards, Logs
- 📋 Sincronização agendada (RF-010)

### Fase 2: Gestão de Agentes AI (Planejado)
- 📋 LangSmith integration
- 📋 Workflow visualization
- 📋 LangGraph support

### Fase 3+: Melhorias (Futuro)
- Write-back para Espaider
- Email/Slack alerts
- Relatórios (PDF/Excel)
- Multi-tenancy ativo

---

## Referências

- [Vision & Escopo](./../.context/01-foundation/vision.md)
- [Requirements Funcionais](./../.context/02-rules/requirements.md)
- [Business Rules](./../.context/02-rules/business-rules.md)
- [ADRs & Decisões](./../.context/03-specs/adr/README.md)
- [Glossário](./../.context/01-foundation/glossary.md)
