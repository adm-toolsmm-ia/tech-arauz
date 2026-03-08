# Module Engineering Standards — Padrão de Referência

**Data:** 2026-03-07  
**Status:** Normativo  
**Baseline único:** Módulo `projetos` (`src/app/projetos/`)

---

## 1. Objetivo e Escopo

Este documento define o padrão obrigatório para criação de novas tabelas, módulos e páginas no Tech Arauz. É a **fonte de verdade** para:

- Engenharia de software (estrutura, camadas, responsabilidades)
- Arquitetura de frontend (SSR, client components, data fetching)
- UX/UI (layout, filtros, views, acessibilidade)
- Uso por agentes AI (contexto, checklist, anti-padrões)

**Regra:** O módulo `projetos` é a referência canônica. Todo novo módulo deve replicar sua estrutura e padrões, adaptando ao contexto do domínio.

---

## 2. Arquitetura de Software

### 2.1 Camadas

| Camada | Responsabilidade | Localização |
|--------|------------------|-------------|
| **Server Page** | Auth, fetch, transformação DB→UI | `page.tsx` |
| **Client Content** | Orquestração, estado, renderização | `*-content.tsx` |
| **Components** | KPIs, filtros, views, cockpit | `components/` |
| **Filters** | Definições, registry, search fields | `src/lib/filters/filters-*.ts` |
| **Hook** | Estado de filtros, ordenação, dados filtrados | `src/hooks/use*Filters.ts` |

### 2.2 Fluxo de Dados

```
page.tsx (SSR)
  → createClient() + auth
  → query Supabase
  → transform (DB → UI)
  → <*Content data={...} />

*-content.tsx (Client)
  → use*Filters(data)
  → filteredData, filters, viewMode, sortConfig
  → <*Filters /> + <*KanbanView | *ListView />
  → <SplitView><*Cockpit /></SplitView>
```

### 2.3 Referências de Código (Projetos)

| Camada | Arquivo |
|--------|---------|
| Server Page | `src/app/projetos/page.tsx` |
| Client Content | `src/app/projetos/projects-content.tsx` |
| Filters Wrapper | `src/app/projetos/components/ProjectsFilters.tsx` |
| KPIs | `src/app/projetos/components/ProjectsKPIBar.tsx` |
| Kanban | `src/app/projetos/components/ProjectsKanbanView.tsx` |
| Lista | `src/app/projetos/components/ProjectsListView.tsx` (wrapper) |
| Hook | `src/hooks/useProjetosFilters.ts` |
| Registry | `src/lib/filters/filters-projetos.ts` |
| Card Kanban | `src/components/project/ProjectKanbanCard.tsx` |
| Lista compartilhada | `src/components/views/ProjectListView.tsx` |

---

## 3. Estrutura de Arquivos Obrigatória

```
src/app/<modulo>/
├── page.tsx                    # Server: auth + fetch + transform
├── <modulo>-content.tsx        # Client: orquestrador
└── components/
    ├── <Modulo>KPIBar.tsx      # KPIs (ou inline se módulo muito simples)
    ├── <Modulo>Filters.tsx     # FilterBar + ViewModeBar + ordenação + ações
    ├── <Modulo>KanbanView.tsx  # KanbanBoard + card customizado
    └── <Modulo>ListView.tsx    # wrapper de lista (ou equivalente)

src/lib/filters/
└── filters-<modulo>.ts         # filterDefinitions + filterRegistry + searchFields

src/hooks/
└── use<Modulo>Filters.ts        # useFilterState + applyFilters + sort
```

---

## 4. Camada de Dados (Tabela)

### 4.1 Padrão Multi-Tenant Obrigatório

- `id uuid` como PK
- `tenant_id uuid` com FK para `tenants(id)`
- `created_at` e `updated_at`
- Índices por `tenant_id` e campos de listagem/filtro
- RLS habilitado com policy `tenant_id = get_user_tenant_id()`
- Unique composto por tenant quando necessário (ex.: `(tenant_id, slug)`)

---

## 5. Camada Server (page.tsx)

### 5.1 Padrão Obrigatório

1. `createClient()` (Supabase server)
2. `supabase.auth.getUser()`
3. `redirect('/login')` se não houver usuário
4. Query principal com dados relacionais necessários
5. Transformação DB → UI quando houver diferença de schema
6. Render de `*-content.tsx` passando dados

### 5.2 Exemplo (Projetos)

```tsx
// src/app/projetos/page.tsx
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) redirect('/login');

const { data, error } = await supabase.from('projects').select('*, ...').order('created_at', { ascending: false });
const uiData = (data || []).map(dbToUI);

return <ErrorBoundary><ProjectsContent projects={uiData} /></ErrorBoundary>;
```

---

## 6. Camada Client (*-content.tsx)

### 6.1 Ordem Obrigatória dos Elementos

```
1. DashboardHeader (título + subtítulo)
2. [Opcional] Banners específicos do módulo
3. <div className="flex-1 space-y-6 p-6">
   a. <p className="sr-only" role="status" aria-live="polite">{listAnnouncement}</p>
   b. Bloco KPIs (<Modulo>KPIBar)
   c. Bloco Filtros (<Modulo>Filters)
   d. Bloco View (Kanban | Lista | Agenda | Cards)
   e. SplitView (detalhe lateral com *Cockpit)
```

### 6.2 Estado Mínimo

- `selectedItem` para SplitView
- `viewMode` (ou via hook)
- Dados filtrados via `use*Filters`

---

## 7. Componentes Padrão

### 7.1 KPIs

- Usar `KPICard` de `@/components/dashboard/KPICard`
- Props: `icon`, `title`, `value`, `subtitle`, `active`, `onClick`
- KPIs clicáveis devem filtrar a lista quando aplicável
- Grid responsivo: `grid-cols-2 md:grid-cols-3 xl:grid-cols-6`

### 7.2 Filtros

- Componente `<Modulo>Filters` que encapsula:
  - **Ordenação** (Select) à esquerda (quando view ≠ agenda)
  - **ViewModeBar** à direita
  - **FilterBar** com `registry`, `filters`, `search`, `onUpdateFilter`, `onResetFilters`
  - **Ações secundárias** (ex.: Sync) ao lado
- FilterBar implementa atalho **Ctrl+K** para foco na busca

### 7.3 Kanban

- Usar `KanbanBoard` de `@/components/views/KanbanBoard`
- Colunas orientadas ao contexto do módulo (não genéricas)
- `renderItemContent` com card customizado (título, identificador, badges, metadados)
- `onItemClick` → abre SplitView com Cockpit
- `selectedId` para highlight

### 7.4 Lista

- Componente com tabela desktop + cards mobile
- Ordenação por colunas ou Select integrado ao hook
- Clique na linha/card → abre SplitView
- Estados: loading, vazio, sem resultado, erro

### 7.5 SplitView e Cockpit

- `SplitView` com `isOpen`, `onClose`, `title`, `subtitle`, `width`
- Conteúdo: componente `*Cockpit` com dados completos do registro
- Clique em card/linha em qualquer view → `setSelectedItem(item)`

### 7.6 CRUD

- **Criar/Editar:** `Dialog` com validação e feedback (`toast`)
- **Visualizar:** `SplitView` + `*Cockpit`
- **Excluir:** `Dialog` de confirmação (nunca `confirm()` nativo)

---

## 8. Hook de Filtros — Contrato Obrigatório

O hook `use<Modulo>Filters` deve retornar:

```ts
{
  filters: FilterState;
  search: string;
  viewMode: string;
  sortConfig: SortConfig | null;     // obrigatório se lista ordenável
  filteredData: T[];
  updateFilter: (key: string, value: any) => void;
  setSearch: (value: string) => void;
  setViewMode: (mode: string) => void;
  setSortConfig: (config: SortConfig | null) => void;
  resetAllFilters: () => void;
  registry: FilterRegistry;          // { filters, viewModes, searchable, agendaPeriods? }
}
```

Opcional (view agenda): `agendaPeriod`, `agendaRefDate`, `navigateAgenda`, `setAgendaPeriod`.

---

## 9. Filter Registry

```ts
// src/lib/filters/filters-<modulo>.ts
export const filterDefinitions<Modulo>: FilterDefinition[] = [
  { id, label, type, options, quickFilter, icon, group?, ... }
];

export const filterRegistry<Modulo>: FilterRegistry = {
  moduleId: '<modulo>',
  filters: filterDefinitions<Modulo>,
  searchable: true,
  viewModes: [ { id, label, icon }, ... ],
  agendaPeriods: [ ... ],  // se view agenda
};

export const searchFields<Modulo> = ['campo1', 'campo2'];
```

---

## 10. Acessibilidade

- `role="status"` e `aria-live="polite"` no anúncio da lista (`listAnnouncement`)
- Cards/linhas clicáveis: `role="button"`, `tabIndex={0}`, `onKeyDown` para Enter/Space
- Ctrl+K → foco na busca (FilterBar)

---

## 11. Data Fetching

Todo módulo DEVE seguir [data-fetching-patterns.md](./data-fetching-patterns.md):

| Operação | Padrão |
|----------|--------|
| Leitura inicial (SSR) | Server Component + query Supabase |
| Mutação / CRUD | Server Action |
| Serviço externo (AI, APIs) | API Route |
| Estado real-time | Client Service (Zustand) — requer aprovação |

---

## 12. Padrões que NÃO Devem Ser Utilizados

| Anti-padrão | Padrão correto |
|-------------|----------------|
| `confirm()` nativo para exclusão | `Dialog` de confirmação |
| ViewModeBar e FilterBar separados no content | Componente `<Modulo>Filters` que encapsula ambos |
| Lista/Kanban inline no content | Componentes `*KanbanView` e `*ListView` |
| Hook sem `sortConfig` para lista ordenável | Hook com `sortConfig` e `setSortConfig` |
| KPIs estáticos sem interação | KPIs clicáveis com `onClick` que filtra (quando aplicável) |
| Filtros locais fora do registry | Single source of truth em `filters-*.ts` + hook |
| Colunas Kanban genéricas hardcoded | Colunas dinâmicas baseadas no domínio |
| Card Kanban minimalista sem metadados | Card com título, identificador, badges, metadados contextuais |

---

## 13. Type Safety — Evitar Falhas no Deploy

O build de produção (`next build`) executa `tsc` e falha se houver erros de tipo. Padrões para evitar quebra no deploy:

### 13.1 `null` vs `undefined` em props de componentes

Muitos componentes (shadcn/ui, Radix) esperam `string | undefined`, não `string | null`. APIs como `URLSearchParams.get()` retornam `string | null`.

**NÃO fazer:**
```tsx
const tab = searchParams.get('tab');
<Tabs defaultValue={tab} />  // Type error: null não assignable to string | undefined
```

**Fazer:**
```tsx
const tab = searchParams.get('tab');
const defaultTab: string = tab && VALID_TABS.includes(tab) ? tab : 'sistemas';
<Tabs defaultValue={defaultTab} />
```

Ou usar fallback explícito: `defaultValue={value ?? undefined}` ou `defaultValue={value ?? 'fallback'}`.

### 13.2 Gate local antes do push

Rodar localmente antes de push/deploy (ordem em `configs/project.yaml` → `quality_gates`):

```bash
npm run lint ; npm run typecheck ; npm run test ; npm run format:check ; npm run build
```

Se falhar localmente, falhará no Vercel. Resolver erros antes de commitar.

**Documentação completa:** [build-deploy-gates.md](./build-deploy-gates.md) — erros comuns, soluções e checklist.

### 13.3 Valores de query/params

- `searchParams.get('x')` → `string | null`
- `searchParams.get('x') ?? undefined` → `string | undefined`
- Para props que exigem `string`, usar fallback: `(value ?? 'default')` ou `value || 'default'`

---

## 14. Checklist de Entrega (Gate de Workflow)

Antes de concluir story de novo módulo/tabela:

- [ ] Tabela com `tenant_id`, RLS, índices
- [ ] `page.tsx` server com auth guard e query principal
- [ ] `*-content.tsx` com DashboardHeader → KPIs → Filters → View → SplitView
- [ ] `<Modulo>Filters` encapsulando FilterBar + ViewModeBar + ordenação
- [ ] Hook com `sortConfig`, `registry` completo
- [ ] Kanban e Lista em componentes dedicados
- [ ] SplitView + *Cockpit para detalhes
- [ ] Dialog para criar/editar; Dialog para confirmar exclusão
- [ ] Estados loading, vazio, sem resultado, erro
- [ ] A11y: sr-only, teclado em cards/linhas

---

## 15. Política para Agentes AI

Este documento é **normativo** para:

- Nova tabela
- Novo módulo/página
- Refactor de módulo existente

**Instruções para agentes:**

1. Consulte `src/app/projetos/` como referência canônica antes de implementar
2. Siga a estrutura de arquivos da seção 3
3. Respeite o contrato do hook (seção 8) e o filter registry (seção 9)
4. Evite todos os anti-padrões da seção 12
5. Rode os quality gates antes de push (seção 13); consulte [build-deploy-gates.md](./build-deploy-gates.md)
6. Exceções devem ser documentadas na story com justificativa técnica
