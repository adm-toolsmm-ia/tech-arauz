---
doc-id: CLAUDE-V01-03
title: Arquitetura e Stack Técnico
scope: Stack com versões, camadas, padrões, deploy, decisões técnicas
version: 0.1.0
status: draft
last-updated: 2026-02-05
confidence: Alta
depends-on: [04-database-schema, 14-frontend-patterns]
---

# Arquitetura e Stack Técnico

> Fontes: `[ref: package.json]`, `[ref: vite.config.ts]`, `[ref: tsconfig.json]`, `[ref: vercel.json]`, `[ref: tailwind.config.ts]`

Relacionado: [[04-database-schema]] (modelo de dados), [[14-frontend-patterns]] (padrões de código), [[12-security-rbac]] (segurança)

---

## Stack Completo

### Frontend
| Tecnologia | Versão | Propósito |
|---|---|---|
| React | 18.3.1 | UI framework |
| TypeScript | 5.8.3 | Type safety |
| Vite | 5.4.19 | Build tool + dev server (port 8080) |
| React Router | 6.30.1 | Roteamento SPA |
| TanStack Query | 5.83.0 | Server state management (cache, stale, refetch) |
| React Hook Form | 7.61.1 | Formulários |
| Zod | 3.25.76 | Validação de schemas |

### UI
| Tecnologia | Versão | Propósito |
|---|---|---|
| Tailwind CSS | 3.4.17 | Utility-first CSS |
| Shadcn/ui | — | 40+ componentes Radix |
| Radix UI | 40+ primitives | Componentes acessíveis |
| Lucide React | — | Ícones |
| Recharts | 2.15.4 | Gráficos (line, pie, bar) |
| DND Kit | 6.3.1 | Drag-and-drop (Kanban) |
| Sonner | 1.7.4 | Toast notifications |
| next-themes | — | Dark mode (class-based) |
| Embla Carousel | 8.6.0 | Carousel |
| React Resizable Panels | 2.1.9 | Painéis redimensionáveis |

### Backend
| Tecnologia | Versão | Propósito |
|---|---|---|
| Supabase | 2.90.1 (JS client) | PostgreSQL + Auth + Edge Functions + RLS |
| PostgreSQL | 14+ (via Supabase) | Database |
| Deno | (runtime) | Edge Functions |
| pg_cron | (extensão) | Agendamento de jobs |

### Dev/Build
| Tecnologia | Versão | Propósito |
|---|---|---|
| Vitest | 3.2.4 | Test framework |
| ESLint | 9.32.0 | Linting |
| @vitest/coverage-v8 | — | Cobertura de testes |
| ts-node | 10.9.2 | Scripts TypeScript |

---

## Diagrama de Camadas

```
┌──────────────────────────────────────────┐
│            FRONTEND (Vercel)             │
│  React 18 + Vite + Tailwind + Shadcn    │
│  ┌────────────────────────────────────┐  │
│  │ features/{module}/                 │  │
│  │   pages → components → hooks       │  │
│  │   TanStack Query ←→ Supabase JS   │  │
│  └────────────────────────────────────┘  │
└──────────────┬───────────────────────────┘
               │ HTTPS (REST)
               ▼
┌──────────────────────────────────────────┐
│           SUPABASE (Cloud)               │
│  ┌────────────┐  ┌────────────────────┐  │
│  │ Auth (JWT) │  │ Edge Functions     │  │
│  │ - signIn   │  │ - sync-espaider   │  │
│  │ - signOut  │  │ - test-api        │  │
│  │ - session  │  │ - sync-solicitacoes│  │
│  └────────────┘  │ - create-user     │  │
│                  └────────┬───────────┘  │
│  ┌────────────────────────▼───────────┐  │
│  │ PostgreSQL + RLS                   │  │
│  │ - 25+ tabelas                      │  │
│  │ - 2 views (apis_safe, logs_safe)   │  │
│  │ - has_role(), is_circuit_open()    │  │
│  │ - pg_cron (agendamento)            │  │
│  └────────────────────────────────────┘  │
└──────────────┬───────────────────────────┘
               │ HTTPS (WCF/REST)
               ▼
┌──────────────────────────────────────────┐
│          ERP ESPAIDER (Externo)          │
│  - API WCF com ListaCampos              │
│  - Autenticação: QueryParam / Bearer     │
│  - Paginação: URLPaginacao               │
│  - Filhos: ListaURLFilhos                │
└──────────────────────────────────────────┘
```

---

## Configurações Importantes

### Vite (`vite.config.ts`)
- Compiler: SWC (React)
- Port: 8080
- Alias: `@/` → `./src/`
- HMR overlay: desabilitado

### TypeScript (`tsconfig.json`)
- Target: ES2020
- Path alias: `@/*` → `./src/*`
- Strict: desabilitado (noImplicitAny: false)
- skipLibCheck: true

### Tailwind (`tailwind.config.ts`)
- Dark mode: class-based
- Cores customizadas: variáveis HSL do design system
- Status colors: novo, em-atendimento, aguardando, resolvido, cancelado
- Priority colors: alta, normal, baixa
- Type colors: erro, duvida, suporte, ajuste, melhoria
- Fonts: Inter (UI), JetBrains Mono (código)

### Deploy (`vercel.json`)
- Framework: Vite
- Build: `npm run build`
- Output: `dist/`
- SPA rewrite: `/(.*) → /index.html`
- Security headers: X-Content-Type-Options nosniff, X-Frame-Options DENY, XSS Protection
- Cache: `/assets/*` → 1 year immutable

---

## Variáveis de Ambiente

| Variável | Propósito |
|---|---|
| `VITE_SUPABASE_PROJECT_ID` | ID do projeto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chave pública (anon key) |
| `VITE_SUPABASE_URL` | URL da API Supabase |

> [!warning] Nota
> Apenas variáveis com prefixo `VITE_` são expostas ao frontend. Service role key e tokens sensíveis ficam apenas nas Edge Functions.

---

## Decisões Pendentes

> [!question] Q-ARCH-001: TypeScript strict mode
> `noImplicitAny: false` e strict desabilitado reduz type safety. Habilitar gradualmente?

> [!question] Q-ARCH-002: Supabase free tier
> O projeto está no free tier do Supabase. Limites de storage, bandwidth e edge function invocations podem ser atingidos com o crescimento. Plano de upgrade?
