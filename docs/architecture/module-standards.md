# Module Engineering Standards — Padrão de Referência

**Data:** 2026-03-16 (v0.2.4 EPIC 11 Update)
**Status:** Normativo (v0.2.4+)
**Baseline único:** Módulo `projetos` (`src/app/projetos/`)
**New Patterns:** Server Actions (§15), Cockpit360 (§16), Responsible Roles (§17)

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

### 15.1 Server Action Template

```typescript
'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const updateActivitySchema = z.object({
  id: z.string().uuid(),
  responsible_roles: z.array(z.string()),
});

export async function updateActivityResponsibleRolesAction(
  input: z.infer<typeof updateActivitySchema>
): Promise<ActionResult<OrgActivity>> {
  try {
    // 1. Auth context (automatic from Supabase server client)
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new UnauthorizedError('Not authenticated');
    }

    // 2. Validate input
    const validated = updateActivitySchema.parse(input);

    // 3. Tenant isolation (critical for RLS)
    const tenantId = user.user_metadata.tenant_id;

    // 4. Mutation
    const { data, error } = await supabase
      .from('org_activities')
      .update({ responsible_roles: validated.responsible_roles })
      .eq('id', validated.id)
      .eq('tenant_id', tenantId)  // Tenant isolation
      .select()
      .single();

    if (error) throw error;

    // 5. Audit logging (optional but recommended)
    await logAuditEvent({
      action: 'update_responsible_roles',
      entity_id: validated.id,
      changes: { responsible_roles: validated.responsible_roles },
    });

    // 6. Revalidation (Next.js cache)
    revalidatePath('/organizacao');

    return { success: true, data };
  } catch (error) {
    console.error('updateActivityResponsibleRolesAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
```

### 15.2 Client-Side Usage

```typescript
'use client';

import { updateActivityResponsibleRolesAction } from '@/app/actions/organization';
import { useAction } from 'next-safe-action/hooks';

export function ActivityForm() {
  const { execute, isPending } = useAction(updateActivityResponsibleRolesAction);

  const onSubmit = async (values: FormValues) => {
    const result = await execute({
      id: activity.id,
      responsible_roles: values.responsible_roles,
    });

    if (result.success) {
      toast.success('Atividade atualizada');
    } else {
      toast.error(result.error);
    }
  };

  return <form onSubmit={onSubmit}>...</form>;
}
```

### 15.3 Key Rules

1. **Location:** `src/app/actions/` (one file per domain)
2. **Naming:** `{action}{Entity}Action` (e.g., `updateActivityAction`)
3. **Auth:** Always use `getSupabaseAuth()` for context
4. **Validation:** Always use Zod schema
5. **Tenant Isolation:** Always `.eq('tenant_id', tenantId)` in queries
6. **Error Handling:** Wrap in try/catch, return ActionResult
7. **Revalidation:** Call `revalidatePath()` for affected routes
8. **Tests:** Unit test with mocked Supabase client

---

## 16. Cockpit360 Pattern (Organizational Detail Views)

**Status:** Normativo (EPIC 10+)

Cockpit360 is a side panel component for displaying and editing entity details. Standard in all organizational modules (Areas, Nuclei, Processes, Activities, etc.).

### 16.1 Cockpit360 Structure

```typescript
// src/components/organization/ActivityCockpit360.tsx
interface ActivityCockpit360Props {
  activity: OrgActivity;
  onUpdate: (updated: OrgActivity) => void;
  isLoading?: boolean;
}

export function ActivityCockpit360({ activity, onUpdate, isLoading }: ActivityCockpit360Props) {
  const [editingField, setEditingField] = useState<string | null>(null);

  return (
    <div className="space-y-6 p-6 border-l bg-card">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">{activity.name}</h2>
        <p className="text-sm text-muted-foreground">{activity.objective}</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          <TabsTrigger value="roles">Funções</TabsTrigger>
          <TabsTrigger value="systems">Sistemas</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        {/* Tab: Details */}
        <TabsContent value="details" className="space-y-4">
          <CockpitField label="Complexidade" value={activity.complexity} />
          <CockpitField label="Prioridade" value={activity.priority} />
          <CockpitField label="Tempo Médio" value={`${activity.average_execution_time} min`} />
        </TabsContent>

        {/* Tab: Responsible Roles */}
        <TabsContent value="roles" className="space-y-4">
          {editingField === 'responsible_roles' ? (
            <ResponsibleRolesInput
              value={activity.responsible_roles || []}
              onChange={(roles) => {
                onUpdate({ ...activity, responsible_roles: roles });
                setEditingField(null);
              }}
            />
          ) : (
            <CockpitField
              label="Funções Responsáveis"
              value={activity.responsible_roles?.join(', ') || 'Nenhuma'}
              onEdit={() => setEditingField('responsible_roles')}
            />
          )}
        </TabsContent>

        {/* Tab: Systems */}
        <TabsContent value="systems" className="space-y-4">
          {activity.systems?.map(system => (
            <div key={system.id} className="p-3 border rounded-md">
              <p className="font-medium">{system.name}</p>
              <p className="text-sm text-muted-foreground">{system.description}</p>
            </div>
          ))}
          {(!activity.systems || activity.systems.length === 0) && (
            <p className="text-sm text-muted-foreground">Nenhum sistema associado</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### 16.2 Tab Structure

Every Cockpit360 MUST include these tabs:

| Tab | Content | Editable | Source |
|-----|---------|----------|--------|
| **Detalhes** | Name, description, objective, status | Yes | Entity fields |
| **Funções** | Responsible roles (EPIC 11.6) | Yes | `responsible_roles` JSONB |
| **Relacionamentos** | Parent/child, linked entities | Yes | Foreign keys |
| **Sistemas** | Integrated systems (EPIC 11.2) | Yes | Junction table |
| **Métricas** | SLAs, process metrics (EPIC 11.3) | No | Read-only |
| **Histórico** | Audit trail, changes | No | Read-only |

### 16.3 ResponsibleRolesInput Integration

```typescript
// Pattern: Any cockpit360 with responsible_roles MUST use this component

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
        Selecione as funções responsáveis pela execução desta atividade
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

---

## 17. Responsible Roles Pattern (EPIC 11)

**Status:** Normativo (EPIC 11 Phase 1-3)

Responsible roles are string arrays (JSONB in DB) stored on organizational entities to track who is responsible for executing, approving, or overseeing each entity.

### 17.1 Role Definition

```typescript
// src/lib/organization/role-definitions.ts

export interface RoleDefinition {
  value: string;              // Internal ID (e.g., 'advogado')
  label: string;              // Display name (e.g., 'Advogado')
  description?: string;       // Tooltip text
  category: 'management' | 'specialist' | 'operational' | 'external';
}

export const ORGANIZATION_ROLES: RoleDefinition[] = [
  // Management (Gestão)
  { value: 'diretor', label: 'Diretor', category: 'management' },
  { value: 'gerente', label: 'Gerente', category: 'management' },
  { value: 'coordenador', label: 'Coordenador', category: 'management' },

  // Specialist (Especialistas)
  { value: 'especialista', label: 'Especialista', category: 'specialist' },
  { value: 'analista_senior', label: 'Analista Sênior', category: 'specialist' },
  { value: 'analista_junior', label: 'Analista Júnior', category: 'specialist' },

  // Operational (Operacional)
  { value: 'operacional', label: 'Operacional', category: 'operational' },
  { value: 'administrativo', label: 'Administrativo', category: 'operational' },
  { value: 'supervisor', label: 'Supervisor', category: 'operational' },
];
```

### 17.2 Database Schema

```sql
-- All organizational entities follow this pattern
ALTER TABLE org_activities ADD COLUMN responsible_roles JSONB DEFAULT '[]' NOT NULL;
ALTER TABLE org_routines ADD COLUMN responsible_roles JSONB DEFAULT '[]' NOT NULL;
ALTER TABLE org_processes ADD COLUMN responsible_roles JSONB DEFAULT '[]' NOT NULL;
ALTER TABLE org_nuclei ADD COLUMN responsible_roles JSONB DEFAULT '[]' NOT NULL;
ALTER TABLE org_areas ADD COLUMN responsible_roles JSONB DEFAULT '[]' NOT NULL;

-- GIN index for array queries
CREATE INDEX idx_org_activities_responsible_roles_gin ON org_activities USING GIN(responsible_roles);
```

### 17.3 Usage Examples

**Single Role:**

```typescript
const activity = {
  name: 'Legal Review',
  responsible_roles: ['advogado'],  // Single role
};
```

**Multiple Roles (Shared Responsibility):**

```typescript
const process = {
  name: 'Contract Approval',
  responsible_roles: ['advogado', 'gerente_comercial', 'cfo'],  // Multiple roles
};
```

**Hierarchical Assignment:**

```typescript
// Area: Strategic oversight
const area = {
  name: 'Legal Department',
  responsible_roles: ['diretor_juridico'],  // Strategic role
};

// Nucleus: Operational management
const nucleus = {
  name: 'Contracts Nucleus',
  responsible_roles: ['gerente_nucleo'],  // Operational role
};

// Process: Execution
const process = {
  name: 'Contract Processing',
  responsible_roles: ['analista_senior'],  // Execution role
};
```

### 17.4 RBAC Integration

Responsible roles can be used for Row-Level Security:

```sql
-- RLS Policy: User can view activities assigned to their roles
CREATE POLICY "role_based_activity_view" ON org_activities
  FOR SELECT USING (
    responsible_roles @> auth.jwt()->'user_metadata'->>'roles'::jsonb
  );
```

---

## 18. Política para Agentes AI

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
6. Para server actions (seção 15): sempre valide com Zod, sempre faça tenant isolation, sempre revalidate paths
7. Para cockpit360 (seção 16): inclua abas Details, Roles, Relationships, Systems, Metrics, History
8. Para responsible_roles (seção 17): use ResponsibleRolesInput component, sempre salve via server action
9. Ao criar filtros ou selects customizados, garantir associação label-controle; consultar build-deploy-gates.md seção 3.4 em caso de erro label-has-associated-control
10. Exceções devem ser documentadas na story com justificativa técnica
