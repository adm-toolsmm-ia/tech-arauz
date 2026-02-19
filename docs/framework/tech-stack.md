# Tech Stack — Tech Arauz

> Pilha tecnológica do Portal Tech Arauz.

## Core

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | Next.js (App Router) | 14.2.x |
| Linguagem | TypeScript | 5.5.x |
| Runtime | Node.js | 20+ |
| UI Library | React | 18.3.x |

## Frontend

| Categoria | Tecnologia |
|-----------|-----------|
| Components | Shadcn/ui (Radix UI + Tailwind) |
| Styling | Tailwind CSS 3.4 + tailwindcss-animate |
| State (server) | TanStack Query 5 |
| State (client) | Zustand 4.5 |
| Charts | Recharts 2.12 |
| Icons | Lucide React |
| Rich Text | TipTap 3 |
| Date | date-fns 3 |
| Forms/Validation | Zod 3.23 |
| Drag & Drop | dnd-kit |
| Theme | next-themes |
| Notifications | Sonner |

## Backend

| Categoria | Tecnologia |
|-----------|-----------|
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth + SSR |
| API | Next.js Server Actions + Route Handlers |
| ERP Integration | Espaider via WCF API (read-only, unidirecional) |

## DevOps

| Categoria | Tecnologia |
|-----------|-----------|
| Deploy | Vercel |
| Tests | Vitest |
| Linting | ESLint (next config) |
| CSS | PostCSS + Autoprefixer |

## Integração Espaider

- **API única**: `BI_SOLICITACOES_SUPORTEESPAIDER`
- **Fluxo**: POST → projetos + `ListaURLFilhos` → GET filhos (entregas, cronogramas, requisitos, históricos, aprovadores, orçamentos)
- **Padrão**: UPSERT via `(tenant_id, espaider_id)` UNIQUE
- **Rastreabilidade**: campo `espaider_raw JSONB` em todas as tabelas sincronizadas
