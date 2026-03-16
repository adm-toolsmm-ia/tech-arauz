# Module Engineering Standards — Padrão de Referência

**Data:** 2026-03-16 (v0.2.4 EPIC 11 Final Update)
**Status:** Normativo (v0.2.4+)
**Baseline:** Módulo `projetos` (`src/app/projetos/`) | EPIC 11: `src/app/organizacao/atividades/`
**New Patterns (Sections 15-19):**
- §15: Server Actions (42 actions, updateActivityResponsibleRolesAction pattern)
- §16: Cockpit360 (5-tab structure with ActivityCockpit360 real example)
- §17: Responsible Roles (9 roles, ResponsibleRolesInput component, JSONB storage)
- §18: EPIC 11 Module Pattern (hierarchical organization structure)
- §19: AI Agent Policy (comprehensive checklist + instructions)

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

**Padrão de card para gestão 360º (referência: ProjectCockpit):**

- **Fundo claro:** SplitView usa `dialog-light-theme` + `bg-card` na área de conteúdo
- **Abas:** TabsList com `rounded-none border-b bg-transparent`; TabsTrigger com `border-b-2` e ícone
- **Campos agrupados:** Seções com `<section>`, cabeçalho `mb-4 flex items-center gap-2 border-b pb-2` + ícone + `<h3>`, conteúdo em grid `grid-cols-1 gap-6 md:grid-cols-2`
- **Sem bloco redundante:** Título vem do SplitView; Cockpit não repete ícone + nome do registro no topo
- **Ações:** Botões Editar/Excluir em linha compacta no topo do conteúdo (quando aplicável)

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

### 13.4 Indexação em union types

Ao iterar chaves dinâmicas em objeto com tipo union (ex.: `OrgDocumentation | Record<string, unknown>`), usar cast para `Record<string, unknown>` antes de indexar. Caso contrário, TypeScript reclama que a chave não existe em todos os membros da union. Ver build-deploy-gates.md seção 3.7.

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
- [ ] A11y: labels associados a controles (htmlFor+id ou fieldset/legend)

---

## 15. Server Actions Pattern (v0.2.4+)

**Status:** Normativo (EPIC 11 Phase 2)

All data mutations MUST use Server Actions (Next.js 13.4+) for:
- Type safety (request + response validated)
- Automatic auth context (no manual JWT parsing)
- Optimistic updates (React 19+)
- Audit trail support

### 15.1 Server Action Template (Real EPIC 11 Example)

**Location:** `src/app/actions/organization.ts` (42 total actions)

**Pattern: Auth Context + Tenant Isolation + Revalidation**

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';
import type { OrgActivity } from '@/types/organization';

export interface OrgActionResult<T = unknown> {
  success: boolean;
  message: string;  // User-facing message (PT-BR)
  data?: T;
}

type AuthContextError = { error: string };
type AuthContextSuccess = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: User;
  tenantId: string;
};
type AuthContext = AuthContextError | AuthContextSuccess;

// --- Reusable Auth Helper ---
async function getAuthContext(): Promise<AuthContext> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Usuário não autenticado. Faça login novamente.' };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (profileError || !profile?.tenant_id) {
    return { error: 'Perfil não encontrado. Contate o administrador.' };
  }

  return { supabase, user, tenantId: profile.tenant_id as string };
}

// --- Update Responsible Roles (EPIC 11 Story 11.7) ---
export async function updateActivityResponsibleRolesAction(
  activityId: string,
  roles: string[],
): Promise<OrgActionResult<OrgActivity>> {
  // 1. Auth context (automatic from Supabase server client)
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  // 2. Mutation with tenant isolation
  const { data, error } = await ctx.supabase
    .from('org_activities')
    .update({
      responsible_roles: roles,
      updated_at: new Date().toISOString(),
    })
    .eq('id', activityId)
    .eq('tenant_id', ctx.tenantId)  // Critical for RLS
    .select()
    .single();

  if (error)
    return { success: false, message: `Erro ao atualizar funções responsáveis: ${error.message}` };

  // 3. Revalidation (Next.js cache invalidation)
  revalidatePath('/organizacao');

  return { success: true, message: 'Funções responsáveis atualizadas!', data: data as OrgActivity };
}

// --- Add Single Role (EPIC 11 Story 11.7) ---
export async function addActivityResponsibleRoleAction(
  activityId: string,
  role: string,
): Promise<OrgActionResult<OrgActivity>> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  // Fetch current roles first (prevent duplicates)
  const { data: activity, error: fetchError } = await ctx.supabase
    .from('org_activities')
    .select('responsible_roles')
    .eq('id', activityId)
    .eq('tenant_id', ctx.tenantId)
    .single();

  if (fetchError) return { success: false, message: 'Atividade não encontrada' };

  const currentRoles = activity?.responsible_roles || [];
  if (currentRoles.includes(role)) {
    return { success: false, message: 'Função já adicionada' };
  }

  const newRoles = [...currentRoles, role];
  return updateActivityResponsibleRolesAction(activityId, newRoles);
}
```

### 15.2 Client-Side Usage (ResponsibleRolesInput Integration)

**Pattern: Async Server Action Call + Toast Feedback**

```typescript
'use client';

import { updateActivityResponsibleRolesAction } from '@/app/actions/organization';
import { ResponsibleRolesInput } from '@/components/organization/ResponsibleRolesInput';
import { toast } from 'sonner';

export function ActivityCockpit360({ activity, onUpdate }: Props) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRolesChange = async (newRoles: string[]) => {
    setIsUpdating(true);
    try {
      const result = await updateActivityResponsibleRolesAction(activity.id, newRoles);

      if (result.success && result.data) {
        toast.success(result.message);
        onUpdate(result.data);  // Update local state
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Erro ao atualizar funções');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      <ResponsibleRolesInput
        value={activity.responsible_roles || []}
        onChange={handleRolesChange}
        disabled={isUpdating}
      />
    </div>
  );
}
```

### 15.3 Key Rules (EPIC 11 Compliance)

1. **Location:** `src/app/actions/` (42+ actions in organization.ts, partitioned by entity)
2. **Naming:** `{verb}{Entity}Action` (e.g., `updateActivityResponsibleRolesAction`, `createAreaAction`)
3. **Auth Context:** Always use `getAuthContext()` helper — returns `AuthContext` union (error | {supabase, user, tenantId})
4. **Result Interface:** Always return `OrgActionResult<T>` with `{ success, message, data? }` (message is PT-BR user-facing)
5. **Tenant Isolation:** Always `.eq('tenant_id', ctx.tenantId)` in all queries (RLS enforcement)
6. **Error Handling:** Check auth context first, return `{ success: false, message: ... }`
7. **Revalidation:** Call `revalidatePath('/organizacao')` or affected routes (Next.js ISR)
8. **JSONB Handling:** Server actions pass JSONB fields as-is (arrays, objects) — Supabase handles serialization
9. **Tests:** Unit tests at `src/app/actions/__tests__/` (see organization-responsible-roles.test.ts)
10. **Idempotency:** Add/remove operations check for duplicates before mutating

---

## 16. Cockpit360 Pattern (Organizational Detail Views)

**Status:** Normativo (EPIC 10+)

Cockpit360 is a side panel component for displaying and editing entity details. Standard in all organizational modules (Areas, Nuclei, Processes, Activities, etc.).

### 16.1 Cockpit360 Structure (EPIC 11 Real Implementation)

**Location:** `src/components/organization/ActivityCockpit360.tsx` (168 lines)

**Pattern: Tabs + Info/BPM/Docs/Documentation/Systems sections**

```typescript
'use client';

import React, { useState } from 'react';
import { FileText, AlertCircle, Users, BarChart3, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  InfoField,
  RolesDisplay,
  DocumentationAccordion,
} from '@/components/organization/shared';
import { ActivitySystemsModal } from './ActivitySystemsModal';
import { OrgEntityFormSheet } from './OrgEntityFormSheet';
import type { OrgActivity, OrgRoutine } from '@/types/organization';

interface ActivityCockpit360Props {
  activity: OrgActivity;
  routine?: OrgRoutine;
  onEdit?: () => void;
  onDelete?: () => void;
}

const complexityColors: Record<string, string> = {
  low: 'bg-green-600 text-white',
  medium: 'bg-yellow-600 text-black',
  high: 'bg-red-600 text-white',
};

const priorityColors: Record<string, string> = {
  low: 'bg-slate-500 text-white',
  normal: 'bg-blue-600 text-white',
  high: 'bg-orange-600 text-white',
};

export function ActivityCockpit360({
  activity,
  routine,
  onEdit,
  onDelete,
}: ActivityCockpit360Props) {
  const [showSystemsModal, setShowSystemsModal] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formTab, setFormTab] = useState('info');

  return (
    <div className="space-y-6">
      <Tabs defaultValue="info" className="w-full">
        {/* Tab List with Icons */}
        <TabsList className="h-auto w-full justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="info"
            className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <FileText className="mr-2 size-4" />
            Informações
          </TabsTrigger>
          <TabsTrigger
            value="bpm"
            className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <BarChart3 className="mr-2 size-4" />
            BPM
          </TabsTrigger>
          <TabsTrigger
            value="docs"
            className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <AlertCircle className="mr-2 size-4" />
            Documentos
          </TabsTrigger>
          <TabsTrigger
            value="sistemas"
            className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <Monitor className="mr-2 size-4" />
            Sistemas
          </TabsTrigger>
        </TabsList>

        {/* Tab: Info */}
        <TabsContent value="info" className="mt-6 space-y-8">
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              setFormTab('info');
              setIsFormOpen(true);
            }}>
              Editar
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <InfoField label="Nome" value={activity.name} />
            <InfoField label="Objetivo" value={activity.objective} />
            <Badge className={complexityColors[activity.complexity || 'medium']}>
              {activity.complexity}
            </Badge>
            <Badge className={priorityColors[activity.priority || 'normal']}>
              {activity.priority}
            </Badge>
          </div>
        </TabsContent>

        {/* Tab: BPM (Responsible Roles + Metrics) */}
        <TabsContent value="bpm" className="mt-6 space-y-6">
          <RolesDisplay
            title="Funções Responsáveis"
            roles={activity.responsible_roles || []}
            onEdit={() => {
              setFormTab('bpm');
              setIsFormOpen(true);
            }}
          />
        </TabsContent>

        {/* Tab: Systems */}
        <TabsContent value="sistemas" className="mt-6 space-y-4">
          <Button onClick={() => setShowSystemsModal(true)}>
            Gerenciar Sistemas
          </Button>
          {/* System list */}
        </TabsContent>
      </Tabs>

      {/* Form Sheet for editing */}
      <OrgEntityFormSheet
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        entity={activity}
        entityType="activity"
        tab={formTab}
      />

      {/* Systems Modal */}
      {showSystemsModal && (
        <ActivitySystemsModal
          activityId={activity.id}
          onClose={() => setShowSystemsModal(false)}
        />
      )}
    </div>
  );
}
```

### 16.2 Tab Structure (EPIC 11 Real Tabs)

Real implementation in ActivityCockpit360 (src/components/organization/ActivityCockpit360.tsx):

| Tab | Icon | Content | Editable | Story |
|-----|------|---------|----------|-------|
| **Informações** | FileText | Name, objective, complexity, priority, description | Yes | 11.10-11.11 |
| **BPM** | BarChart3 | Responsible roles, execution time, SLA (EPIC 11.6-11.8) | Yes | 11.8 |
| **Documentos** | AlertCircle | Input/output documentation, validations | Yes | 11.13 |
| **Documentação** | FileText | Related documents, guides, procedures | No | 11.13 |
| **Sistemas** | Monitor | Associated systems (ActivitySystemsModal), junction table | Yes | 11.2 |

**Key Pattern:**
- Icon + label in TabsTrigger
- `rounded-none border-b-2 border-transparent` styling
- `data-[state=active]:border-primary data-[state=active]:bg-transparent`
- Content wrapped in `TabsContent` with `mt-6 space-y-{4-8}`

### 16.3 ResponsibleRolesInput Integration (EPIC 11 Component)

**Location:** `src/components/organization/ResponsibleRolesInput.tsx` (200 lines)

**Features:**
- Tag-based role display with remove button (X icon)
- Autocomplete dropdown (Command + CommandList)
- Full keyboard navigation (ArrowUp/Down, Enter, Escape, Backspace)
- WCAG AA accessibility (ARIA labels, roles, focus management)
- Responsive design (mobile-friendly)

**Usage in Forms:**

```typescript
import { ResponsibleRolesInput } from '@/components/organization/ResponsibleRolesInput';

<FormField
  control={form.control}
  name="responsible_roles"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Funções Responsáveis</FormLabel>
      <FormControl>
        <ResponsibleRolesInput
          value={field.value || []}
          onChange={field.onChange}
          disabled={isLoading}
        />
      </FormControl>
      <FormDescription>
        Selecione as funções responsáveis pela execução (Ctrl+A para adicionar all)
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

**Real Example from ActivityCockpit360:**

```typescript
<RolesDisplay
  title="Funções Responsáveis"
  roles={activity.responsible_roles || []}
  onEdit={() => {
    setFormTab('bpm');
    setIsFormOpen(true);  // Opens OrgEntityFormSheet with ResponsibleRolesInput
  }}
/>
```

**Keyboard Shortcuts:**
- `ArrowDown` → open dropdown, move down
- `ArrowUp` → move up in dropdown
- `Enter` → select highlighted role
- `Escape` → close dropdown
- `Backspace` (with empty input) → remove last selected role

---

## 17. Responsible Roles Pattern (EPIC 11)

**Status:** Normativo (EPIC 11 Phase 1-3)

Responsible roles are string arrays (JSONB in DB) stored on organizational entities to track who is responsible for executing, approving, or overseeing each entity.

### 17.1 Role Definition (EPIC 11 Story 11.6)

**Location:** `src/lib/organization/role-definitions.ts` (100 lines)

**Interface & Real Data:**

```typescript
export interface RoleDefinition {
  value: string;              // Internal ID (e.g., 'diretor')
  label: string;              // Display name (e.g., 'Diretor')
  description?: string;       // Tooltip (e.g., 'Direção/Diretoria')
  category: 'management' | 'specialist' | 'operational' | 'external';
}

/**
 * ORGANIZATION_ROLES — 9 default roles
 * Aligned with Migration 069 org_role_definitions seed
 * Used in ResponsibleRolesInput autocomplete + RLS policies (ADR-005)
 */
export const ORGANIZATION_ROLES: RoleDefinition[] = [
  // Management (Gestão) — 3 roles
  { value: 'diretor', label: 'Diretor', description: 'Direção/Diretoria', category: 'management' },
  { value: 'gerente', label: 'Gerente', description: 'Gerência de área', category: 'management' },
  { value: 'coordenador', label: 'Coordenador', description: 'Coordenação de núcleo/processo', category: 'management' },

  // Specialist (Especialistas) — 3 roles
  { value: 'especialista', label: 'Especialista', description: 'Especialista técnico', category: 'specialist' },
  { value: 'analista_senior', label: 'Analista Sênior', description: 'Analista com senioridade', category: 'specialist' },
  { value: 'analista_junior', label: 'Analista Júnior', description: 'Analista em treinamento', category: 'specialist' },

  // Operational (Operacional) — 3 roles
  { value: 'operacional', label: 'Operacional', description: 'Executor operacional', category: 'operational' },
  { value: 'administrativo', label: 'Administrativo', description: 'Apoio administrativo', category: 'operational' },
  { value: 'supervisor', label: 'Supervisor', description: 'Supervisão operacional', category: 'operational' },
];

// Helper functions
export function getRolesByCategory(category: RoleDefinition['category']): RoleDefinition[] {
  return ORGANIZATION_ROLES.filter((r) => r.category === category);
}

export function getAllRoles(): RoleDefinition[] {
  return ORGANIZATION_ROLES;
}

export function getRoleLabel(value: string): string | undefined {
  return ORGANIZATION_ROLES.find((r) => r.value === value)?.label;
}

export function getRoleDefinition(value: string): RoleDefinition | undefined {
  return ORGANIZATION_ROLES.find((r) => r.value === value);
}
```

### 17.2 Database Schema (Migrations 065-070)

**Pattern: JSONB array column + GIN index (EPIC 11 Phase 1)**

```sql
-- Migration 065: Add responsible_roles to all org entities
ALTER TABLE org_areas ADD COLUMN responsible_roles JSONB DEFAULT '[]' NOT NULL;
ALTER TABLE org_nuclei ADD COLUMN responsible_roles JSONB DEFAULT '[]' NOT NULL;
ALTER TABLE org_processes ADD COLUMN responsible_roles JSONB DEFAULT '[]' NOT NULL;
ALTER TABLE org_routines ADD COLUMN responsible_roles JSONB DEFAULT '[]' NOT NULL;
ALTER TABLE org_activities ADD COLUMN responsible_roles JSONB DEFAULT '[]' NOT NULL;
ALTER TABLE org_suppliers ADD COLUMN responsible_roles JSONB DEFAULT '[]' NOT NULL;
ALTER TABLE org_services ADD COLUMN responsible_roles JSONB DEFAULT '[]' NOT NULL;
ALTER TABLE org_documents ADD COLUMN responsible_roles JSONB DEFAULT '[]' NOT NULL;

-- GIN indexes for efficient querying
CREATE INDEX idx_org_areas_responsible_roles_gin ON org_areas USING GIN(responsible_roles);
CREATE INDEX idx_org_activities_responsible_roles_gin ON org_activities USING GIN(responsible_roles);
CREATE INDEX idx_org_processes_responsible_roles_gin ON org_processes USING GIN(responsible_roles);

-- Example query: Find all activities assigned to a role
SELECT * FROM org_activities
WHERE tenant_id = $1
  AND responsible_roles @> '"analista_senior"'::jsonb;

-- Example query: Find activities with multiple roles
SELECT * FROM org_activities
WHERE tenant_id = $1
  AND responsible_roles @> '["gerente", "diretor"]'::jsonb;
```

**Storage Format:**
```json
{
  "id": "uuid",
  "name": "Legal Review",
  "responsible_roles": ["advogado", "gerente", "diretor"]
}
```

### 17.3 Usage Examples (Real EPIC 11 Patterns)

**Single Role Assignment:**

```typescript
// Activity with single responsible role
const activity: OrgActivity = {
  id: '...',
  name: 'Parecer Jurídico',
  objective: 'Emitir parecer legal',
  responsible_roles: ['advogado'],  // Single role
  tenant_id: '...',
  // ... other fields
};

// Via server action
await updateActivityResponsibleRolesAction(activityId, ['advogado']);
```

**Multiple Roles (Shared Responsibility):**

```typescript
// Process with multiple responsible roles
const process: OrgProcess = {
  id: '...',
  name: 'Aprovação de Contratos',
  responsible_roles: ['advogado', 'gerente', 'diretor'],  // Multiple roles
  tenant_id: '...',
};

// Via ResponsibleRolesInput component
<ResponsibleRolesInput
  value={['advogado', 'gerente']}
  onChange={(roles) => {
    // roles = ['advogado', 'gerente', 'diretor']
    updateActivityResponsibleRolesAction(activityId, roles);
  }}
/>
```

**Hierarchical Pattern (Organizational Levels):**

```typescript
// AREA: Strategic/management level
const area: OrgArea = {
  name: 'Jurídico',
  responsible_roles: ['diretor'],  // Strategic oversight
};

// NUCLEUS: Operational management
const nucleus: OrgNucleus = {
  name: 'Núcleo de Contratos',
  responsible_roles: ['gerente'],  // Operational management
  area_id: area.id,
};

// PROCESS: Process-level responsibility
const process: OrgProcess = {
  name: 'Processamento de Contratos',
  responsible_roles: ['analista_senior', 'analista_junior'],  // Execution + support
  nucleus_id: nucleus.id,
};

// ACTIVITY: Specific task assignment
const activity: OrgActivity = {
  name: 'Revisar Contrato',
  responsible_roles: ['analista_senior'],  // Primary executor
  routine_id: '...',
};
```

### 17.4 RBAC Integration (ADR-005: Organization Architecture)

**Pattern: RLS policies enforce tenant isolation + optional role-based filtering**

```sql
-- RLS Policy 1: Tenant Isolation (mandatory on all 16 tables)
-- User can only see data from their tenant
CREATE POLICY "tenant_isolation_org_activities" ON org_activities
  FOR SELECT USING (
    tenant_id = (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );

-- RLS Policy 2: Optional Role-Based Access (future enhancement)
-- User can view activities assigned to one of their organizational roles
CREATE POLICY "role_based_activity_view" ON org_activities
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND (
      responsible_roles @> (
        SELECT jsonb_agg(DISTINCT role_value)
        FROM user_role_assignments
        WHERE user_id = auth.uid()
      )
    )
  );
```

**Current Implementation (v0.2.4):**
- ADR-001: `tenant_id = get_user_tenant_id()` on all 16 tables (enforced)
- Responsible roles stored in JSONB but primarily for UI/business logic
- RLS policies currently tenant-only (role-based access can be added in future epics)

**Future Enhancement (v0.3+):**
- Implement `user_role_assignments` table (link users to organizational roles)
- Enable role-based RLS policies for fine-grained access control

---

## 18. EPIC 11 Module Pattern (Organizational Hierarchies)

**Status:** Normativo (EPIC 11 Phase 3-4)

The organizational module (`src/app/organizacao/`) implements a hierarchical pattern with multiple sub-modules. Each follows the standard architecture but adds EPIC 11-specific features.

### 18.1 Hierarchical Structure

```
src/app/organizacao/
├── page.tsx                          # Main dashboard with navigation
├── empresa/                          # Organization overview
│   ├── page.tsx                      # Server: auth + fetch org context
│   ├── empresa-content.tsx           # Client: orchestrator
│   └── components/
│       ├── EmpresaKPIBar.tsx         # KPIs: areas, nuclei, processes count
│       ├── EmpresaKanbanView.tsx     # Kanban: hierarchical view
│       └── EmpresaListView.tsx       # List: organizational structure
│
├── areas/                            # Top-level organizational units
│   ├── page.tsx
│   ├── areas-content.tsx
│   └── components/
│       ├── AreasKPIBar.tsx
│       ├── AreasKanbanView.tsx
│       └── AreasFilters.tsx
│
├── nucleos/                          # Sub-units within areas
│   ├── page.tsx
│   ├── nucleos-content.tsx
│   └── components/
│
├── processos/                        # Processes within nuclei
│   ├── page.tsx
│   ├── processos-content.tsx
│   └── components/
│
├── atividades/                       # Activities (leaf level)
│   ├── page.tsx
│   ├── atividades-content.tsx
│   └── components/
│
└── recursos/                         # Cross-cutting resources
    ├── sistemas/                     # Systems (IT infrastructure)
    ├── servicos/                     # Services
    ├── documentos/                   # Documentation
    └── fornecedores/                 # Suppliers
```

### 18.2 Data Flow Pattern

```
page.tsx (Server)
  → Fetch org_areas + hierarchical data
  → Apply tenant_id filter (RLS)
  → Transform DB → UI schema
  → <*Content data={uiData} />

*Content.tsx (Client)
  → use*Filters(data)
  → State: filters, viewMode, selectedItem
  → Render: KPIs → Filters → View (Kanban/List) → SplitView → Cockpit360

Cockpit360 Component
  → Tabs: Informações → BPM → Documentos → Sistemas
  → ResponsibleRolesInput for role management
  → Server actions: updateActivityResponsibleRolesAction, etc.
```

### 18.3 EPIC 11 Features per Module

| Module | Cockpit360 | Responsible Roles | Systems | SLAs | Templates |
|--------|-----------|------------------|---------|------|-----------|
| **Areas** | AreaCockpit360 | Yes (diretor, gerente) | Yes | Optional | No |
| **Nuclei** | NucleusCockpit360 | Yes (gerente, coordenador) | Yes | Optional | No |
| **Processes** | ProcessCockpit360 | Yes (coordenador, especialista) | Yes | Yes (SLAs) | Yes (versioning) |
| **Routines** | RoutineCockpit360 | Yes (analista) | Yes | Optional | Yes |
| **Activities** | ActivityCockpit360 | Yes (analista_senior) | Yes | Yes (metrics) | Yes |

### 18.4 Real Example: Activities Module

```typescript
// src/app/organizacao/atividades/page.tsx
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) redirect('/login');

const { data: activities } = await supabase
  .from('org_activities')
  .select(`
    *,
    routine:org_routines(id, name),
    activity_systems:activity_system_relationships(
      id,
      system:org_systems(id, name, description)
    )
  `)
  .eq('tenant_id', tenantId)
  .order('created_at', { ascending: false });

const uiActivities = (activities || []).map(dbActivityToUI);

return <ErrorBoundary><ActivitiesContent activities={uiActivities} /></ErrorBoundary>;
```

---

## 19. Política para Agentes AI

Este documento é **normativo** para:

- Nova tabela
- Novo módulo/página
- Refactor de módulo existente
- Contribuições ao módulo organizações (EPIC 11+)

**Instruções para Agentes @dev, @architect, @ux-design-expert:**

### Antes de Implementar

1. **Referência Canônica:**
   - Para módulos simples (projetos, etc): Use `src/app/projetos/` como baseline
   - Para módulos EPIC 11 (organizações): Use `src/app/organizacao/atividades/` como baseline

2. **Estrutura de Arquivos:** Siga a seção 3 (obrigatória)

3. **Contrato do Hook:** Respeite seção 8 (obrigatória); não invente novos contratos

### Durante Implementação

4. **Server Actions (Seção 15):**
   - Sempre use `getAuthContext()` helper pattern
   - Sempre faça `tenant_id` isolation (`.eq('tenant_id', ctx.tenantId)`)
   - Sempre revalidate paths (`revalidatePath('/organizacao')`)
   - Retorne `OrgActionResult<T>` com mensagens em PT-BR
   - Coloque em `src/app/actions/organization.ts` (particionado por entidade)

5. **Cockpit360 (Seção 16):**
   - Inclua **todos** os tabs reais da tabela 16.2
   - Use `TabsList` com `rounded-none border-b` styling
   - Use `ResponsibleRolesInput` se houver `responsible_roles` JSONB
   - Use `OrgEntityFormSheet` para edição

6. **Responsible Roles (Seção 17):**
   - Sempre use `ResponsibleRolesInput` component (não invente alternativas)
   - Sempre salve via server action (updateActivityResponsibleRolesAction pattern)
   - Sempre use `getAllRoles()` para pobular dropdown
   - Sempre inclua `getRoleLabel()` para display

7. **EPIC 11 Módulos (Seção 18):**
   - Para novo módulo de organização: replique `atividades/` estrutura
   - Inclua hierarchical data (parent relationships)
   - Implemente Cockpit360 com responsible_roles tab

8. **Filtros & Selects (Seção 12):**
   - Garantir associação label-controle (`htmlFor` + `id`)
   - Consultar [build-deploy-gates.md](./build-deploy-gates.md) seção 3.4 para label-has-associated-control
   - Usar filter registry pattern (seção 9)

9. **Quality Gates (Seção 13):**
   - Rodar **antes de push**: `npm run lint ; npm run typecheck ; npm run test ; npm run format:check`
   - Se falhar localmente, falhará no Vercel
   - Nunca fazer push com erros

10. **Exceções:**
   - Toda exceção deve ser documentada na story com justificativa técnica
   - Exceções aprovadas por @po + @architect
   - Documentar em "Implementation Notes" da story

### Checklist de Review

- [ ] Estrutura de arquivos segue seção 3
- [ ] Hook retorna contrato completo da seção 8
- [ ] Server actions usam `getAuthContext()` + tenant isolation
- [ ] Cockpit360 inclui todos os tabs relevantes
- [ ] ResponsibleRolesInput usado (não alternativas inventadas)
- [ ] Filtros com label-controle associados
- [ ] Quality gates passando localmente
- [ ] Código traceable (ZERO invenção)
- [ ] Documentação atualizada
- [ ] Tests com coverage ≥85%
