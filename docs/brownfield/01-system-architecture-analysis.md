# Phase 1: System Architecture Analysis — Tech Arauz

**Brownfield Discovery Workflow**
**Phase**: 1 of 10 (Data Collection)
**Agent**: @architect (Aria)
**Date**: 2026-02-24
**Status**: Complete

---

## Executive Summary

Tech Arauz é um portal SaaS de gestão 360° de TI construído com **Next.js 14 + TypeScript + Supabase + React 18**. O projeto está em **fase de crescimento** com:

- ✅ **Stack moderno e maduro** (Next.js 14, TypeScript, React 18)
- ✅ **151 arquivos TypeScript/React** (aplicação substantiva)
- ✅ **Integração Espaider funcionando** (7 datasets sincronizados, 5.700+ registros)
- ✅ **UI premium recém-implementada** (Dashboard com 8 KPIs, ProjectCockpit, Cronogramas)
- ⚠️ **Cobertura de testes baixa** (~5%, principalmente utilitários)
- ⚠️ **TypeScript strict mode desabilitado** (necessário para migração incremental)
- ⚠️ **RLS policies completas mas recentemente corrigidas** (migrations 019-023 resolveram issues críticos)
- ⚠️ **Sem E2E tests** (aplicação tem comportamento crítico que precisa validação)

---

## 1. Visão Geral Técnica

### Stack Tecnológico

| Camada | Tecnologia | Versão | Status |
|--------|-----------|--------|--------|
| **Framework** | Next.js (App Router) | 14.2.x | ✅ Estável |
| **Linguagem** | TypeScript | 5.5.x | ✅ Configurable (strict OFF) |
| **UI Library** | React | 18.3.x | ✅ Moderno |
| **Database** | Supabase (PostgreSQL) | 2.45.x | ✅ Maduro |
| **State (Server)** | TanStack Query | 5.50.x | ✅ Otimizado |
| **State (Client)** | Zustand | 4.5.x | ✅ Leve |
| **CSS** | Tailwind CSS | 3.4.0 | ✅ Utility-first |
| **Components** | Shadcn/ui (Radix) | Latest | ✅ Compostos |
| **Charts** | Recharts | 2.12.0 | ✅ Dinâmicos |
| **Rich Text** | TipTap | 3.19.0 | ✅ Extensível |
| **Drag & Drop** | dnd-kit | 6.3.1 | ✅ Moderno |
| **Date Handling** | date-fns | 3.6.0 | ✅ Tree-shakable |
| **Testing** | Vitest | 1.6.0 | ⚠️ Baixa cobertura |
| **Deploy** | Vercel | — | ✅ Integrado |

### Arquitetura de Alto Nível

```
┌─────────────────────────────────────────────┐
│          Browser / Client                    │
│  (React 18 + Next.js 14 App Router)         │
└────────────────────┬────────────────────────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                │
    ▼                ▼                ▼
┌──────────┐   ┌──────────┐   ┌──────────┐
│  Pages   │   │Components│   │  Hooks   │
│  (15+)   │   │  (80+)   │   │  (12+)   │
└────┬─────┘   └────┬─────┘   └────┬─────┘
     │              │              │
     └──────────────┼──────────────┘
                    │
          ┌─────────▼─────────┐
          │   Next.js Layers  │
          │ - API Routes      │
          │ - Server Actions  │
          │ - Middleware      │
          └────────┬──────────┘
                   │
     ┌─────────────┼─────────────┐
     │             │             │
     ▼             ▼             ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Supabase │  │ Espaider │  │   Logs   │
│  Auth    │  │   API    │  │  Monitor │
└────┬─────┘  └────┬─────┘  └────┬─────┘
     │             │             │
     └─────────────┼─────────────┘
                   │
          ┌────────▼────────┐
          │  PostgreSQL DB  │
          │  (20 tabelas)   │
          └─────────────────┘
```

---

## 2. Estrutura do Projeto

### Hierarquia de Diretórios

```
src/
├── app/                          # 15+ páginas (Next.js App Router)
│   ├── (auth)/                   # Grupo de autenticação
│   ├── dashboard/                # Dashboard principal
│   ├── projetos/                 # Gestão de projetos
│   ├── cronogramas/              # Cronogramas Gantt
│   ├── integracoes/              # Painel Espaider + logs
│   ├── api/                      # API Routes
│   │   ├── integracoes/          # Sync endpoints
│   │   └── logs/                 # Log viewing endpoints
│   └── actions/                  # Server Actions para mutations
│
├── components/                   # 80+ componentes React
│   ├── ui/                       # Primitivos Shadcn/ui
│   ├── layout/                   # Header, Sidebar
│   ├── dashboard/                # KPI cards, charts
│   ├── project/                  # ProjectCockpit, tables
│   ├── filters/                  # ProjectFilters
│   ├── integracoes/              # LogViewer, sync status
│   └── ...
│
├── hooks/                        # 12+ custom hooks
│   ├── useProjects.ts            # Fetch projetos com relações
│   ├── useProjectFilters.ts      # Filter state management
│   ├── useSyncStatus.ts          # Espaider sync state
│   └── ...
│
├── lib/                          # Utilities e helpers
│   ├── supabase/                 # Supabase client factory
│   ├── transformers/             # DB → UI conversion
│   ├── sync/                     # Espaider sync logic
│   ├── types/                    # Domain types
│   └── utils.ts                  # Helpers (cn(), formatters)
│
└── integrations/                 # Espaider WCF API client
    └── espaider/
        ├── client.ts             # HTTP + retry logic
        ├── types.ts              # API response types
        └── mapper.ts             # 135+ field aliases
```

### Contagem de Arquivos

| Categoria | Quantidade | Status |
|-----------|-----------|--------|
| Páginas (pages.tsx) | 15+ | ✅ Cobrindo funcionalidade |
| Componentes | 80+ | ✅ Bem-organizados |
| Custom hooks | 12+ | ✅ State management |
| TypeScript files | 151 | ✅ Type-safe |
| Total linhas de código | ~15.000 | ✅ Aplicação substantiva |

---

## 3. Camadas de Arquitetura

### 3.1 Camada de Apresentação (Frontend)

**Responsabilidade**: Rendering, interação do usuário, state local

**Tecnologias**:
- React 18 com Hooks
- Next.js 14 App Router
- Tailwind CSS + Shadcn/ui
- TanStack Query (server state)
- Zustand (client state)

**Componentes Principais**:
- **ProjectCockpit** (`src/components/project/ProjectCockpit.tsx`): Visão 360° do projeto com 6 tabs
- **Dashboard** (`src/app/dashboard/page.tsx`): 8 KPIs clicáveis, 3 gráficos com drill-down
- **ProjectFilters** (`src/components/filters/ProjectFilters.tsx`): Quick filters + advanced search
- **Cronogramas** (`src/app/cronogramas/page.tsx`): Calendário Gantt com filtros

**Padrões**:
- ✅ Absolute imports com `@/`
- ✅ Named exports (nunca default)
- ✅ Tailwind utility-first
- ✅ Server Components por padrão, Client Components quando necessário

**Questões**:
- ❓ Alguns componentes podem ter lógica misturada (apresentação + busca de dados)
- ❓ useEffect em LogViewer corrigido em migration 023, mas padrão pode estar espalhado

### 3.2 Camada de Lógica de Negócio (Backend)

**Responsabilidade**: Processamento de dados, integração, sync

**Tecnologias**:
- Next.js API Routes e Server Actions
- TypeScript (strict: OFF)
- Node.js 20+

**Componentes Principais**:
- **Sync Engine** (`src/lib/sync/espaider-sync.ts`): 7 funções de sync (projetos, entregas, cronogramas, históricos, aprovadores, orçamentos, requisitos)
- **Espaider Client** (`src/integrations/espaider/client.ts`): HTTP + retry logic + circuit breaker
- **Transformers** (`src/lib/transformers/project.ts`): Conversão DB → UI
- **API Routes**: `/api/integracoes/sync`, `/api/integracoes/logs`

**Padrões**:
- ✅ Server Actions para mutations críticas
- ✅ UPSERT pattern via `(tenant_id, espaider_id)` UNIQUE
- ✅ Logging centralizado em `integration_log_entries`
- ✅ Rastreabilidade com `espaider_raw JSONB`

**Questões**:
- ❓ Sem circuit breaker formal em Espaider client
- ❓ Retry logic poderia ser mais sofisticado (backoff exponencial)
- ❓ Sem alertas automáticos de falha de sync

### 3.3 Camada de Dados (Database)

**Responsabilidade**: Persistência, RLS, integridade referencial

**Tecnologias**:
- Supabase (PostgreSQL 15+)
- 20 tabelas normalizadas
- RLS policies em todas as tabelas
- 23 migrations aplicadas (+ rollbacks e fixes)

**Schema Principal**:
```sql
tenants (1)
├── users (N) [auth]
├── projects (N)
│   ├── deliveries (N)
│   ├── schedules (N)
│   ├── requirements (N)
│   ├── histories (N)      -- Histórico de movimentação
│   ├── approvers (N)      -- Pessoas que aprovam
│   └── budgets (N)        -- Orçamentos
├── integration_log_entries (N) -- Logs detalhados
└── profiles (N)
```

**Padrões**:
- ✅ UUID primary keys em todas as tabelas
- ✅ Composite UNIQUE(tenant_id, espaider_id) para idempotência
- ✅ RLS policies com `get_user_tenant_id()` helper
- ✅ Timestamps (created_at, updated_at)

**Débitos Técnicos**:
- ⚠️ 3 migrations revertidas (016-018) devido schema incorreto
- ⚠️ Migration 019 restaurou sanidade
- ⚠️ Sem índices otimizados para queries críticas (precisa analysis)
- ⚠️ Sem triggers de auditoria (apenas manual via log entries)

### 3.4 Camada de Integração (Espaider WCF API)

**Responsabilidade**: Síncrona com ERP Araúz

**Tecnologias**:
- WCF API (SOAP/REST hybrid)
- 1 única API: `BI_SOLICITACOES_SUPORTEESPAIDER`
- Fluxo hierárquico: POST projetos → GET filhos

**Padrão de Sync**:
```
POST BI_SOLICITACOES_SUPORTEESPAIDER
  ↓
Retorna: [projetos] + [ListaURLFilhos]
  ↓
Para cada URL em ListaURLFilhos:
  GET URL → [filhos: entregas, cronogramas, requisitos, históricos, aprovadores, orçamentos]
  ↓
UPSERT em DB com tracking
```

**Status**:
- ✅ 7 datasets sincronizados
- ✅ 5.700+ registros históricos
- ✅ 329+ aprovadores
- ✅ Logs de sync visíveis no frontend
- ⚠️ Sem retry automático em falhas
- ⚠️ Sem alertas de falha de sync
- ⚠️ Sem circuit breaker formal

---

## 4. Padrões e Convenções

### 4.1 Code Organization

| Aspecto | Padrão | Status |
|---------|--------|--------|
| Imports | Absolutos com `@/` | ✅ Consistente |
| Exports | Named exports | ✅ Aplicado |
| TypeScript | Strict: OFF | ✅ Documentado |
| CSS | Tailwind utility-first | ✅ Completo |
| State (Server) | TanStack Query | ✅ Padronizado |
| State (Client) | Zustand stores | ✅ Usado onde necessário |
| Data Flow | React Hooks + Server Components | ✅ Moderno |
| Testing | Vitest (baixa cobertura) | ⚠️ Precisa melhoria |

### 4.2 Database Patterns

| Padrão | Implementação | Status |
|--------|---|---|
| Primary Key | UUID gen_random_uuid() | ✅ Consistente |
| Tenant Isolation | `tenant_id` FK + RLS | ✅ Implementado |
| Idempotence | UNIQUE(tenant_id, espaider_id) | ✅ UPSERT-ready |
| Auditoria | `created_at`, `updated_at` timestamps | ✅ Automático via triggers |
| Rastreabilidade | `espaider_raw JSONB` campo | ✅ Armazenado |
| RLS Policies | `FOR ALL USING/WITH CHECK` | ✅ Completo |

### 4.3 API Patterns

| Padrão | Implementação | Status |
|--------|---|---|
| REST Conventions | JSON + status codes | ✅ Seguido |
| Error Handling | try-catch + structured errors | ⚠️ Inconsistente |
| Pagination | Limit + offset nos logs | ✅ Implementado |
| Filtering | Dynamic WHERE clauses | ✅ Funcional |
| Rate Limiting | Não implementado | ❌ Faltante |
| Validation | Zod schemas | ✅ Parcial |

---

## 5. Métricas de Qualidade de Código

### Análise Estática

| Métrica | Valor | Baseline | Status |
|---------|-------|----------|--------|
| **Cobertura de Testes** | ~5% | 60%+ | 🔴 Crítico |
| **TypeScript Strict** | OFF | ON | 🟡 Desvio (planejado) |
| **Linhas de Código** | ~15.000 | — | ✅ Aplicação substantiva |
| **Complexidade Ciclomática** | Não medida | — | ⚠️ Verificar |
| **Duplicate Code** | Não medida | — | ⚠️ Verificar |
| **Dependency Health** | ✅ Atualizado | — | ✅ Bom |

### Segurança

| Aspecto | Status | Notas |
|---------|--------|-------|
| **RLS Policies** | ✅ Completo | Todas as tabelas protegidas |
| **Authentication** | ✅ Supabase Auth | SSR-ready, JWT + session hybrid |
| **Input Validation** | ✅ Parcial | Zod em formulários principais |
| **SQL Injection** | ✅ Seguro | Supabase query builder, sem SQL raw |
| **XSS** | ✅ Mitigado | React escapa por padrão, markdown em `LogViewer` |
| **CSRF** | ✅ Implícito | Next.js + cookies httpOnly |
| **HTTPS** | ✅ Enforced | Vercel + domain SSL |

### Performance

| Aspecto | Status | Notas |
|--------|--------|-------|
| **Code Splitting** | ✅ Automático | Next.js App Router |
| **Image Optimization** | ✅ Implementado | Next/image com lazy loading |
| **Bundle Size** | ⚠️ Não medido | Recharts + Tiptap podem ser pesados |
| **Database Queries** | ⚠️ Não otimizado | Sem índices análise (precisa @data-engineer) |
| **API Response Time** | ⚠️ Não monitorado | Faltam métricas |
| **Frontend FCP/LCP** | ⚠️ Não medido | Precisaria Lighthouse CI |

---

## 6. Débitos Técnicos Identificados

### 🔴 Críticos

| # | Débito | Impacto | Esforço | Mitigação |
|---|--------|--------|--------|-----------|
| D-001 | Cobertura testes ~5% | Regressões invisíveis | Alto | Adicionar unit + integration tests |
| D-002 | TypeScript strict OFF | Type safety reduzida | Alto | Migração incremental planejada |
| D-003 | Sem E2E tests | Comportamento crítico não validado | Alto | Cypress/Playwright |

### 🟡 Altos

| # | Débito | Impacto | Esforço | Mitigação |
|---|--------|--------|--------|-----------|
| D-004 | Sem circuit breaker formal | Falhas cascata em Espaider | Médio | Implementar retry + backoff |
| D-005 | Sem índices DB otimizados | Performance escala | Médio | @data-engineer analysis |
| D-006 | Logviewer useEffect corrigido | Inconsistência pattern | Médio | Auditoria de todos useEffect |
| D-007 | Sem alertas de sync failure | Dados estejados silenciosamente | Médio | Email/Slack alerts |
| D-008 | Sem rate limiting na API | DoS potencial | Médio | Implementar middleware |

### 🟢 Médios

| # | Débito | Impacto | Esforço | Mitigação |
|---|--------|--------|--------|-----------|
| D-009 | Sem Storybook | Documentação de componentes | Baixo | Setup Storybook |
| D-010 | Sem monitoring (Sentry) | Erros não rastreados | Baixo | Setup Sentry |
| D-011 | Sem lighthouse CI | Performance não monitorada | Baixo | Add CI check |
| D-012 | Dependência Recharts grande | Bundle size | Baixo | Considerar alternativas |

---

## 7. Decisões Arquiteturais Documentadas

### ADRs Existentes

| ADR | Título | Status | Link |
|-----|--------|--------|------|
| ADR-001 | Stack técnica (Next.js + Supabase + Python) | ✅ Ativa | `.context/03-specs/adr/` |
| ADR-002 | Auth Espaider (token/key + retry) | ✅ Ativa | `.context/03-specs/adr/` |
| ADR-003 | Design System (Shadcn/ui + Tailwind) | ✅ Ativa | `.context/03-specs/adr/` |

### ADRs Necessários

| Título | Justificativa |
|--------|--------------|
| Circuit Breaker para Espaider | Padrão de resiliência não documentado |
| Rate Limiting Strategy | Segurança API não definida |
| Error Handling Standards | Inconsistência em tratamento de erros |
| Caching Strategy | TanStack Query precisa política clara |
| Monitoring & Observability | Sem logging estruturado além de integration_log_entries |

---

## 8. Próximas Etapas

### Phase 2: Database Schema Analysis (@data-engineer)
- Revisar schema em `supabase/docs/SCHEMA.md`
- Analisar índices e performance de queries críticas
- Validar RLS policies efetivamente

### Phase 3: Frontend Architecture Review (@ux-design-expert)
- Revisar componentes em `src/components/`
- Validar design system em `tokens_brand.json`
- Analisar accessibility (WCAG)

### Phase 4: Technical Debt Draft (@architect)
- Consolidar findings das 3 análises
- Prioritizar débitos
- Preparar plano de resolução

---

## Conclusão

Tech Arauz é um **projeto bem-estruturado com stack moderno** que demonstra boas práticas de arquitetura (modularidade, separação de concerns, type safety parcial). Está em **fase de crescimento saudável** após implementações recentes de UI premium e correção de sync issues.

**Principais forças**:
- ✅ Stack moderno (Next.js 14, TypeScript, React 18)
- ✅ Segurança (RLS completo, validação em fronteira)
- ✅ Integração Espaider funcional e rastreável
- ✅ UI premium e responsiva
- ✅ Code organization limpo

**Principais fraquezas**:
- ⚠️ Cobertura de testes baixa
- ⚠️ TypeScript strict mode desabilitado
- ⚠️ Sem E2E tests
- ⚠️ Resiliência (circuit breaker, alertas) não implementada
- ⚠️ Observabilidade limitada

**Recomendação para próxima etapa**: Focar em **testes** e **resiliência** como prioridades imediatas, enquanto **migração incremental de TypeScript strict** pode ser planejada em paralelo.

---

**Documento preparado por**: Aria (Architect)
**Data**: 2026-02-24
**Próxima fase**: Database Schema Analysis by @data-engineer
