# Tech Arauz — Brownfield Architecture Document
## Foco: PRD Padronização UX/UI + Cronogramas Read-Only + Tecnologia & IA

**Data:** 2026-02-28
**Autor:** @architect (Aria) — Brownfield Discovery Fase 1
**Referência:** PRD "Padronização UX/UI com Projetos/Cronogramas somente leitura + Gestão de Tecnologia & IA"
**Escopo:** Estado atual do codebase nos módulos relevantes + gaps vs PRD

---

## 1. Executive Summary (Estado Real)

O portal Tech Arauz é uma aplicação Next.js 14 com Supabase como backend. O codebase possui **padrões de engenharia bem estabelecidos** (design system, filtros modulares, error boundaries, transformers) porém apresenta **inconsistências significativas entre módulos** que este PRD visa corrigir.

**Situação atual por módulo:**

| Módulo | Kanban | Lista | Agenda | CRUD | Read-Only | Fonte ERP Indicator |
|--------|--------|-------|--------|------|-----------|---------------------|
| Projetos | ✅ | ✅ | ❌ n/a | ❌ (sem UI) | ⚠️ Parcial | ❌ Ausente |
| Cronogramas | ❌ **FALTANDO** | ⚠️ Card grid (não tabela) | ✅ | ❌ | ⚠️ Parcial | ❌ Ausente |
| Agentes AI | ⚠️ Por status (errado) | ✅ | ❌ n/a | ✅ | N/A | N/A |
| Tipos de Agentes | ✅ | ✅ | ❌ n/a | ✅ | N/A | N/A |
| Fornecedores IA | ✅ | ✅ | ❌ n/a | ✅ | N/A | N/A |
| Modelos IA | ⚠️ | ✅ | ❌ n/a | ✅ | N/A | N/A |

---

## 2. Stack Tecnológico Real

| Categoria | Tecnologia | Versão | Notas |
|-----------|-----------|--------|-------|
| Framework | Next.js | 14.2.x | App Router, Server Components |
| Linguagem | TypeScript | 5.5.x | strict mode desabilitado |
| Estilização | Tailwind CSS | 3.4.x | + tailwindcss-animate |
| Componentes UI | Radix UI + Shadcn/ui | múltiplas | via components.json |
| State Server | TanStack Query | 5.50.x | cache e invalidação |
| State Local | Zustand | 4.5.x | notificações |
| Banco de Dados | Supabase (PostgreSQL) | 2.45.x | RLS habilitado |
| Auth | Supabase Auth | — | SSR via @supabase/ssr |
| Charts | Recharts | 2.12.x | dashboard KPIs |
| DnD | @dnd-kit | 6.x/10.x | PRESENTE mas deve ser desabilitado para Cronogramas |
| Forms | react-hook-form + zod | 7.x/3.x | validação |
| Testes Unit | Vitest | 1.6.x | + @testing-library/react |
| Testes E2E | Cypress | 15.x | em /cypress |
| Deploy | Vercel | — | next.config.mjs configurado |
| i18n | pt-BR | — | hardcoded, chaves não abstraídas |

---

## 3. Estrutura de Diretórios (Real)

```
src/
├── app/                          # Next.js App Router
│   ├── agentes/                  # Módulo Agentes AI (CRUD)
│   │   ├── page.tsx              # Server Component — fetch agents + providers
│   │   ├── agentes-content.tsx   # 'use client' — orquestrador
│   │   └── [id]/                 # Edição de agente individual
│   ├── auxiliares/               # Tabelas auxiliares (serão "Tecnologia & IA" + "Tabelas auxiliares")
│   │   ├── agent-types/          # Tipos de Agentes — CRUD completo ✅
│   │   ├── lm-providers/         # Fornecedores IA — CRUD completo ✅
│   │   └── modelos-ia/           # Modelos IA — CRUD (verificar completude)
│   ├── cadastros/                # Cadastros admin
│   │   └── usuarios/             # Usuários — READ + gestão básica
│   ├── cronogramas/              # Módulo Cronogramas (read-only ERP)
│   │   ├── page.tsx              # Server Component — fetch project_schedules + project info
│   │   ├── cronogramas-content.tsx # 'use client' — orquestrador (viewMode: agenda | lista)
│   │   └── components/
│   │       ├── CronogramaCalendar.tsx  # ✅ Agenda (Dia/Semana/Mês)
│   │       ├── CronogramaList.tsx      # ⚠️ CARD GRID (não tabela real)
│   │       ├── CronogramaFilters.tsx   # Filtros básicos
│   │       ├── CronogramasKPIBar.tsx   # KPI Bar
│   │       └── CronogramaCockpit.tsx   # Detalhe (SplitView)
│   ├── projetos/                 # Módulo Projetos (read-only ERP)
│   │   ├── page.tsx              # Server Component — fetch projects com todas relações
│   │   ├── projects-content.tsx  # 'use client' — orquestrador (viewMode: kanban | lista)
│   │   └── components/
│   │       ├── ProjectsKanbanView.tsx  # ✅ Kanban por status
│   │       ├── ProjectsListView.tsx    # ✅ Lista (tabela?)
│   │       ├── ProjectsKPIBar.tsx      # KPIs clicáveis
│   │       ├── ProjectsFilters.tsx     # Filtros + botão Sync
│   │       └── ProjectsCharts.tsx      # Gráficos (Pipeline, Distribuição, Tendência)
│   ├── dashboard/                # Dashboard principal
│   ├── integracoes/              # Painel de integrações Espaider
│   └── api/                      # API Routes
│       ├── agents/               # CRUD Agentes
│       ├── integracoes/          # Sync + Logs
│       └── [outros]/
├── components/
│   ├── agent-types/              # AgentTypeCockpit
│   ├── agents/                   # AgentKPIs
│   ├── common/                   # ImageLazy
│   ├── dashboard/                # KPICard
│   ├── error/                    # ErrorBoundary
│   ├── filters/                  # FilterBar, FilterControl, GlobalSearch
│   ├── layout/
│   │   ├── AppSidebar.tsx        # Sidebar principal
│   │   ├── DashboardHeader.tsx   # Header padrão de módulo
│   │   ├── sidebar-config.ts     # ⚠️ Config atual (não tem grupo "Tecnologia & IA")
│   │   └── sidebar-types.ts      # NavGroup, NavItem types
│   ├── lm-providers/             # LmProviderCockpit
│   ├── notifications/            # Bell, Panel, Tester, Sync
│   ├── project/                  # ProjectCockpit, KanbanCard, etc.
│   ├── ui/                       # Shadcn components + EmptyState, Skeletons
│   └── views/
│       ├── KanbanBoard.tsx       # ✅ Componente Kanban genérico (reusável)
│       ├── SplitView.tsx         # ✅ Painel lateral de detalhes
│       └── ViewToggle.tsx        # ✅ Seletor Kanban/Lista
├── hooks/
│   ├── useCronogramasFilters.ts  # Filtros de cronogramas
│   ├── useProjetosFilters.ts     # Filtros de projetos
│   ├── useAgentFilters.ts        # Filtros de agentes
│   ├── useAgentTypesFilters.ts   # Filtros de tipos
│   ├── useLmProvidersFilters.ts  # Filtros de fornecedores
│   ├── usePagination.ts          # Paginação (hook existente)
│   └── useFilterUrlSync.ts       # Sync filtros na URL
├── integrations/espaider/        # Cliente ERP (READ-ONLY)
│   ├── client.ts                 # exportarDados + buscarFilhos (GET only)
│   ├── mapper.ts                 # 135+ field aliases
│   ├── types.ts                  # URLFilho, RegistroEspaider
│   └── config.ts
├── lib/
│   ├── domain/
│   │   ├── schedule-status.ts    # isWithinRange, formatDateBR, PROJECT_COLORS
│   │   ├── schedule-kpi.ts       # KPI filter logic
│   │   ├── project-kpi.ts        # KPI filter logic projetos
│   │   └── lm-provider-rules.ts  # computeProviderKpis
│   ├── filters/
│   │   ├── filter-utils.ts       # Utilitários genéricos
│   │   └── filters-projetos.ts   # Filtros específicos de projetos
│   ├── transformers/
│   │   ├── project.ts            # DB → UI conversion (projetos)
│   │   └── agent.ts              # DB → UI conversion (agentes)
│   ├── supabase/                 # client, server, middleware
│   └── utils/
│       └── date-helpers.ts       # Helpers de data
├── services/agents/
│   └── lmModelsService.ts        # API calls para modelos
├── types/
│   └── agents.ts                 # Todos os types de Tecnologia & IA
└── integrations/espaider/        # ERP integration (read-only)
```

---

## 4. Database Schema — Tabelas Relevantes

### 4.1 ERP (Read-Only — origem Espaider)

**projects** (sync via Espaider)
```sql
id UUID PK, tenant_id UUID, espaider_id BIGINT,
titulo, codigo, status_original (raw ERP), status (mapped UI),
fase_atual, area, responsible, start_date, end_date,
priority, category, notes_html, espaider_raw JSONB,
[+30 campos específicos ERP], updated_at
```

**project_schedules** (sync via Espaider)
```sql
id UUID PK, tenant_id UUID, espaider_id INTEGER,
project_id UUID → projects,
atividade, responsavel, setor_responsavel,
data_inicio, data_fim, data_prazo, data_novo_prazo,
status, fase_atividade, atrasado BOOLEAN, item,
espaider_raw JSONB, updated_at
-- NOTA: sem campo prioridade nem progresso_percentual
-- NOTA: sem campo etiquetas[]
-- Esses campos DO PRD precisam ser verificados contra API real
```

**project_histories, project_approvers, project_budgets, project_deliveries**
```sql
id UUID PK (gen_random_uuid()), tenant_id UUID, espaider_id INTEGER,
project_id UUID → projects,
UNIQUE(tenant_id, espaider_id),
espabase_raw JSONB
```

### 4.2 CRUD Local (Tecnologia & IA)

**agents** (CRUD completo)
```sql
id UUID PK, tenant_id UUID,
name, slug, status (draft|published|deprecated),
agent_type, agent_type_id UUID → agent_types,
persona, prompt_objective, prompt_instructions[],
prompt_template, output_schema JSONB,
model_provider, model_id, model_temperature, model_max_tokens,
requirements[], configuration_meta JSONB,
execution_count, last_execution_at,
created_by, updated_by, created_at, updated_at
```

**agent_types** (CRUD — tabela auxiliar)
```sql
id UUID PK, tenant_id UUID,
name, slug, description, icon_emoji, color_hex,
is_active, is_system, -- is_system: não pode deletar
default_model_provider, default_model_id, default_temperature,
created_by, updated_by, created_at, updated_at
```

**lm_providers** (CRUD — tabela auxiliar)
```sql
id UUID PK, tenant_id UUID,
name, slug, description, api_endpoint, docs_url,
api_key_field_name, icon_emoji, color_hex,
is_active, is_system,
created_by, updated_by, created_at, updated_at
```

**lm_models** (CRUD — tabela auxiliar)
```sql
id UUID PK, tenant_id UUID, provider_id UUID → lm_providers,
name, model_id, description, max_tokens, default_temperature,
input_cost_per_1k_tokens, output_cost_per_1k_tokens,
context_window, display_order, tier (entry|balanced|pro|flagship),
docs_url, is_active, is_system,
created_at, updated_at, created_by, updated_by
```

### 4.3 Gaps Críticos no Schema de Cronogramas vs PRD

O PRD especifica campos que **não existem** na tabela `project_schedules`:

| Campo PRD | Status Real | Decisão Sugerida |
|-----------|-------------|------------------|
| `prioridade` | ❌ Não existe na tabela | Verificar se ERP envia; mapear de `fase_atividade` ou omitir |
| `progresso_percentual` | ❌ Não existe | Derivar de `atrasado`/status ou omitir |
| `etiquetas[]` | ❌ Não existe | Omitir na fase 1; placeholder de schema |
| `responsavel` | ✅ Existe | Mapeado |
| `status` | ✅ Existe (raw ERP) | Precisa de mapeamento UI documentado |

**Status mapping a documentar** (verificar valores reais na API Espaider):
```
ERP value → UI Label (a confirmar com DBA)
```

---

## 5. Gaps vs PRD — Por Módulo

### 5.1 Cronogramas

| Item PRD | Estado Atual | Trabalho Necessário |
|----------|-------------|---------------------|
| Kanban com colunas por status | ❌ AUSENTE | Criar novo componente |
| Lista como tabela (9 colunas) | ⚠️ É card grid | Substituir por tabela real |
| Paginação server-side | ❌ Ausente | Implementar com query params |
| Filtros de período (interseção) | ⚠️ Parcial | Corrigir lógica de interseção |
| Ordenação multi-coluna | ❌ Ausente | Implementar |
| "Fonte: ERP — somente leitura" banner | ❌ Ausente | Adicionar a todas as views |
| "Atualizado às {timestamp}" | ❌ Ausente | Usar updated_at da última sync |
| Exclusão padrão de concluídos | ❌ Ausente | Implementar filtro padrão |
| Atalho "incluir concluídos" | ❌ Ausente | Quick filter toggle |
| DnD desabilitado | ⚠️ @dnd-kit instalado | Não incluir DnD no Kanban |
| Card de detalhes read-only | ✅ CronogramaCockpit | Adicionar banner + remover ações |
| Semântica de período Agenda | ✅ isWithinRange | Validar borda inclusiva |
| Semana ISO-8601 (segunda) | ⚠️ Verificar getWeekStart | Confirmar comportamento |

### 5.2 Projetos

| Item PRD | Estado Atual | Trabalho Necessário |
|----------|-------------|---------------------|
| Ações de edição removidas | ✅ Não há edição | Confirmar (onSync é read-only) |
| "Fonte: ERP — somente leitura" | ❌ Ausente | Adicionar ao ProjectCockpit |
| "Atualizado às {timestamp}" | ❌ Ausente | Implementar |
| Indicador "somente leitura" em cards | ❌ Ausente | Tooltip ou badge |
| Manter como baseline visual | ✅ Bom estado | Documentar como padrão |

### 5.3 Sidebar / Navegação

| Item PRD | Estado Atual | Trabalho Necessário |
|----------|-------------|---------------------|
| Grupo "Tecnologia & IA" | ❌ Não existe | Criar grupo em sidebar-config.ts |
| "Agentes AI" em "Tecnologia & IA" | ⚠️ Está em "Sistema" | Mover |
| "Tipos de Agentes" em "Tecnologia & IA" | ⚠️ Está em "Auxiliares" | Mover (decisão: duplicar ou mover) |
| "Fornecedores IA" em "Tecnologia & IA" | ⚠️ Está em "Auxiliares" | Mover |
| "Modelos IA" em "Tecnologia & IA" | ⚠️ Está em "Auxiliares" | Mover |
| "Tabelas auxiliares" (último grupo) | ⚠️ Chama-se "Auxiliares" | Renomear |
| "Usuários" em "Tabelas auxiliares" | ⚠️ Está em "Sistema" | Mover |
| Remover duplicidade de "Tipos de Agentes" | Decisão: manter só em "Tabelas auxiliares" | Aplicar default PRD |

### 5.4 Agentes AI (Tecnologia & IA)

| Item PRD | Estado Atual | Trabalho Necessário |
|----------|-------------|---------------------|
| Kanban agrupado por Tipo de Agente | ❌ Agrupado por status (draft/published/deprecated) | Mudar colunas do KanbanBoard |
| Card: Nome, Tipo, Modelo, Fornecedor, Status, Último run, Owner | ⚠️ Incompleto | Enriquecer renderItemContent |
| Filtros: Tipo, Fornecedor, Modelo, Status | ⚠️ Incompleto | Adicionar filtros |
| CRUD operacional | ✅ Existe | Manter |

---

## 6. Componentes Reutilizáveis Disponíveis (Assets)

### Aproveitar Diretamente
- `KanbanBoard.tsx` — genérico, aceita `columns`, `items`, `renderItemContent`, `onStatusChange`
- `SplitView.tsx` — slide-over de detalhes
- `ViewToggle.tsx` — seletor de visualização
- `FilterBar.tsx` — barra de filtros padronizada
- `EmptyState.tsx` — empty state padronizado
- `KPICard.tsx` — cards de KPI clicáveis
- `DashboardHeader.tsx` — header padrão
- `ErrorBoundary.tsx` — tratamento de erros
- `skeletons.tsx` — loading states
- `isWithinRange()` — lógica de interseção de período (reusar)
- `usePagination.ts` — hook de paginação (adaptar para server-side)

### Adaptar/Estender
- `CronogramaList.tsx` — substituir card grid por tabela real
- `CronogramaFilters.tsx` — adicionar filtros de período e status avançados
- `useAgentFilters.ts` — adicionar filtros por Tipo, Fornecedor, Modelo

---

## 7. Padrões Arquiteturais Existentes

### 7.1 Padrão Server/Client Component
```
page.tsx (Server Component)
  → fetch data from Supabase server-side
  → pass as props to *-content.tsx (Client Component)
  → *-content.tsx usa hooks para filtros locais
```

### 7.2 Padrão de Filtros
Todos os módulos têm hook `use{Module}Filters(data)` que retorna:
```typescript
{ filters, search, viewMode, filteredData, updateFilter, setSearch, setViewMode, resetAllFilters, registry }
```

### 7.3 Padrão de Transformers
Dados do DB são transformados antes de chegar à UI:
```
DB Row → transformer (src/lib/transformers/*.ts) → UI type
```

### 7.4 Padrão de Actions
Operações de CRUD usam Next.js Server Actions:
```
src/app/actions/*.ts → chamados de Client Components via async functions
```

### 7.5 Padrão de Detalhes
Todos os módulos com detalhes usam:
```
SplitView (slide-over) + *Cockpit (conteúdo do detalhe)
```

---

## 8. Guardrails Read-Only — Estado Atual

### O que JÁ é read-only (Projetos/Cronogramas)
- Nenhum botão de Create/Edit/Delete existe na UI de Projetos ou Cronogramas
- O cliente Espaider (`src/integrations/espaider/client.ts`) usa apenas GET/POST para leitura
- As Server Actions de projetos (`src/app/actions/projects.ts`) — verificar se há writes

### O que FALTA implementar
- Banner visual "Fonte: ERP — somente leitura" com timestamp
- Guardrail de auditoria em logs para bloquear tentativas de escrita
- Tooltip "somente leitura" em ações desabilitadas
- Indicador de quando foi a última sincronização

### Risco Identificado
O `ProjectsContent` passa `onSync` para o `ProjectCockpit`. O sync chama `syncEspaiderAction()` que é uma **operação de leitura do ERP → escrita no banco local**. Isso é CORRETO (não modifica o ERP), mas o banner "somente leitura" deve deixar claro que refere-se ao ERP, não ao banco local.

---

## 9. Performance — Estado Atual

| Aspecto | Estado | Issue |
|---------|--------|-------|
| Fetch de projetos | Server-side com todas as relações | Pesado mas funcional |
| Fetch de cronogramas | Server-side sem paginação | Carrega TODOS os registros |
| Filtros | Client-side (JS em memória) | OK para volumes atuais |
| Paginação | Hook existe (`usePagination`) mas não server-side | Issue para listas grandes |
| Índices DB | Migrations 020+ adicionaram alguns | Verificar data_inicio/data_fim |

---

## 10. Dependências Externas Relevantes

| Dependência | Propósito | Impacto no PRD |
|-------------|-----------|----------------|
| `@dnd-kit/core` | Drag-and-drop | DEVE ser excluído do Kanban de Cronogramas |
| `gantt-task-react` | Gráfico Gantt | Não usado atualmente nos módulos-alvo |
| `date-fns` | Manipulação de datas | Base para lógica de período/timezone |
| `react-day-picker` | Calendar picker | Usado no Agenda |
| `sonner` | Toast notifications | Padrão de feedback |

---

## 11. Decisões Arquiteturais Propostas (para validação)

### ADR-1: Kanban de Cronogramas sem DnD
**Decisão:** Implementar `CronogramaKanban` usando `KanbanBoard.tsx` existente, mas sem `onStatusChange` (ou com handler que ignora silenciosamente). Não instalar DnD neste componente.

### ADR-2: Lista de Cronogramas como Tabela Real
**Decisão:** Substituir card grid de `CronogramaList` por tabela HTML com `<table>` + `thead` + colunas ordenáveis. Reutilizar padrão de `ProjectsListView` se for tabela.

### ADR-3: Sidebar Reorganização
**Decisão:** Modificar `sidebar-config.ts`:
- Grupo "Tecnologia & IA": Agentes AI, Tipos de Agentes, Fornecedores IA, Modelos IA
- Grupo "Tabelas auxiliares" (último): Usuários
- Remover duplicidade de Tipos de Agentes

### ADR-4: Agentes AI Kanban — Agrupar por Tipo
**Decisão:** Mudar colunas do `KanbanBoard` em `agentes-content.tsx` de `[draft, published, deprecated]` para colunas dinâmicas baseadas nos `agent_types` disponíveis.

### ADR-5: Banner ERP Read-Only
**Decisão:** Criar componente `ErpSourceBanner` reutilizável com:
- Texto: "Fonte: ERP — somente leitura. Atualizado às {timestamp}"
- Variant `inline` (dentro de cards) e `page` (topo de módulos)

### ADR-6: Server-Side Pagination para Cronogramas
**Decisão:** Migrar fetch de cronogramas de "carregar tudo" para query com LIMIT/OFFSET via URL params. Adaptar `usePagination.ts` existente para server-side.

---

## 12. Perguntas para @data-engineer (Fase 2)

1. Quais são os valores reais de `status` em `project_schedules`? Precisamos do mapeamento completo API → UI.
2. Os campos `prioridade` e `progresso_percentual` existem na API Espaider para cronogramas? Se sim, quando foram mapeados?
3. Existe índice em `project_schedules(data_inicio, data_fim)`? (Crítico para performance da lista paginada)
4. O campo `updated_at` de `projects` e `project_schedules` é atualizado pelo sync? Pode ser usado como "Atualizado às"?
5. A tabela `integration_log_entries` tem timestamp da última sync bem-sucedida? Como expor isso na UI?

## 13. Perguntas para @ux-design-expert (Fase 3)

1. O `DashboardHeader` atual serve como baseline para todos os módulos? Há variações necessárias?
2. O `KanbanBoard` genérico existente atende visualmente ao Kanban de Cronogramas read-only? Ou precisa de variante?
3. Como o banner "Fonte: ERP — somente leitura" deve se posicionar: topo da página, dentro de cards, ou ambos?
4. O padrão de "Atualizado às {timestamp}" deve ser inline no header ou em um badge no filtro?
5. Para a Lista de Cronogramas (tabela), o padrão de `ProjectsListView` é o baseline correto?

---

## 14. Mapa de Arquivos de Impacto por Epic

### Epic A — UX/UI Universal
- `src/components/layout/DashboardHeader.tsx` (verificar consistência)
- `src/components/filters/FilterBar.tsx` (padronizar)
- `src/components/views/ViewToggle.tsx` (garantir consistência)
- Criar: `src/components/erp/ErpSourceBanner.tsx`

### Epic B — Cronogramas Read-Only
**Novos:**
- `src/app/cronogramas/components/CronogramaKanban.tsx`
- `src/app/cronogramas/components/CronogramaTable.tsx` (substituir CronogramaList)

**Modificar:**
- `src/app/cronogramas/cronogramas-content.tsx` (adicionar viewMode kanban)
- `src/app/cronogramas/components/CronogramaFilters.tsx` (filtros completos + quick toggles)
- `src/app/cronogramas/components/CronogramaCockpit.tsx` (banner ERP)
- `src/app/cronogramas/page.tsx` (server-side pagination)
- `src/hooks/useCronogramasFilters.ts` (filtro de excluídos por padrão)
- `src/lib/domain/schedule-status.ts` (validar lógica de interseção)

### Epic C — Tecnologia & IA
**Modificar:**
- `src/app/agentes/agentes-content.tsx` (Kanban por tipo, filtros enriquecidos)
- `src/app/auxiliares/modelos-ia/modelos-ia-content.tsx` (verificar gaps)

### Epic D — Sidebar
**Modificar:**
- `src/components/layout/sidebar-config.ts` (reorganizar grupos)

---

## 15. Artefatos de Saída — Fase 1 Completa

**Este documento:** `docs/architecture/system-architecture-prd-ux-2026.md`

**Próximos documentos (fases seguintes):**
- `supabase/docs/SCHEMA.md` — @data-engineer (Fase 2)
- `supabase/docs/DB-AUDIT.md` — @data-engineer (Fase 2)
- `docs/frontend/frontend-spec.md` — @ux-design-expert (Fase 3)
- `docs/prd/technical-debt-DRAFT.md` — @architect consolidação (Fase 4)

---

*Documento gerado em 2026-02-28 por @architect (Aria) — Brownfield Discovery Fase 1*
*Status: COMPLETO — Pronto para validação nas Fases 2-3*
