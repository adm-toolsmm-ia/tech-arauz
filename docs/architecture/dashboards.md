# Dashboards — Architecture & Implementation Guide

**Updated:** 2026-03-16
**Version:** 2.0 (Cockpit360 Integration + Real-Time Metrics)
**Standard:** EPIC 11 Organizational Enrichment
**Maintainer:** @ux-design-expert (Uma)

---

## 1. Overview

The Tech Arauz dashboard system provides hierarchical, real-time visualization of organizational operations through the **Cockpit360 component family**. Dashboards present multi-level enterprise data (Areas → Nuclei → Processes → Routines → Activities) with role-based access control, performance metrics, and interactive drill-down capabilities.

### 1.1 Dashboard Routes

| Route | Name | Purpose | Data Source |
|-------|------|---------|-------------|
| `/dashboard/projetos` | Projects Dashboard | Executive view: portfolio, KPIs, trends | `projects` + Espaider (read-only) |
| `/dashboard/operacoes` | Operations Dashboard | Flow view: gargalos, SLAs, movement history | `project_histories` + metrics |
| `/organizacao` | Organization Hub | Organizational structure navigation | `org_areas`, `org_nuclei`, `org_processes`, `org_routines`, `org_activities` |

---

## 2. Cockpit360 Component Architecture

**Cockpit360** is a hierarchical 4-level UI component family for browsing and managing organizational entities. Each level provides drill-down navigation and inline editing.

### 2.1 Hierarchy: AreaCockpit360 → NucleusCockpit360 → ProcessCockpit360 → ActivityCockpit360

```
┌─ AreaCockpit360
│  ├─ Principal (description, objective, responsible_roles)
│  ├─ Núcleos (list of OrgNucleus + count)
│  └─ Processos (related processes from linked nuclei)
│
├─ NucleusCockpit360
│  ├─ Principal (description, objective, responsible_roles)
│  └─ Vínculos (processes linked to this nucleus)
│
├─ ProcessCockpit360
│  ├─ Principal (description, objective, responsible_roles)
│  ├─ Detalhes (inputs, outputs, risks, impacts, documentation)
│  ├─ Rotinas (list of OrgRoutine + count)
│  ├─ Sistemas (linked systems via activity_system_relationships)
│  ├─ Métricas (real-time compliance, cycle time, SLA status)
│  └─ SLAs (target thresholds, compliance tracking)
│
└─ ActivityCockpit360
   ├─ Informações (name, complexity, priority, avg_execution_time, required_role)
   ├─ BPM (inputs, outputs, risks, impacts)
   ├─ Documentos (integrated document references)
   ├─ Documentação (knowledge base entries)
   └─ Sistemas (activity-system mappings via junction table)
```

### 2.2 AreaCockpit360 Component

**File:** `src/components/organization/AreaCockpit360.tsx`
**Props:**
```typescript
interface AreaCockpit360Props {
  area: OrgArea;                          // Area entity with name, description, objective, responsible_roles
  nuclei: OrgNucleus[];                   // Child nuclei for this area
  processes: OrgProcess[];                // Processes (direct or via nuclei)
  onEdit?: () => void;                    // Edit button callback
  onSelectNucleus?: (nucleus: OrgNucleus) => void;  // Drill-down to nucleus
  onNucleiUpdated?: (nuclei: OrgNucleus[]) => void; // Update callback after create
}
```

**Tabs & Displays:**

1. **Principal Tab**
   - `FileText` icon + "Informações" section
   - `InfoField` components for description + objective
   - `Users` icon + "Roles responsáveis" section
   - Badge showing responsible_roles (comma-separated)
   - "Novo Núcleo" button → `OrgEntityFormSheet` for creation

2. **Núcleos Tab**
   - Count badge: `({nuclei.length})`
   - Grid of `OrgEntityCard` with:
     - Title: `nucleus.name`
     - Subtitle: `nucleus.objective`
     - Badge: `${nucleus.processes_count} processos`
     - Meta: number of roles
     - Click → `onSelectNucleus(nucleus)`
   - Empty state: "Nenhum núcleo nesta área"

3. **Processos Tab**
   - List of direct processes (via `processes` prop)
   - Each process as a link to `/organizacao/processos/${id}/rotinas`
   - Display: name + description line-clamp-1
   - Empty state: "Nenhum processo vinculado a esta área"

**Key Features:**
- Responsive tabs with bottom border indicator
- `aria-label` on buttons for keyboard nav
- Form sheet state management: `showFormSheet`, `localNuclei`
- Callback-driven updates (no server calls in component)

---

### 2.3 NucleusCockpit360 Component

**File:** `src/components/organization/NucleusCockpit360.tsx`

**Props:**
```typescript
interface NucleusCockpit360Props {
  nucleus: OrgNucleus & { processes_count?: number; area_name?: string };
  areaId?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onSelectProcess?: (process: any) => void;
  onProcessesUpdated?: (processes: OrgProcess[]) => void;
}
```

**Tabs & Displays:**

1. **Principal Tab**
   - Edit + Delete buttons (conditional)
   - "Informações" section: description + objective
   - "Roles responsáveis" section: badge with role display
   - "Novo Processo" button → form sheet

2. **Vínculos Tab**
   - Button to link processes: `/organizacao/processos?nucleus_id=${nucleus.id}`
   - Shows process count badge
   - Empty state: "Nenhum processo vinculado"

**Key Features:**
- Delete button style: `text-destructive hover:text-destructive`
- ExternalLink icon on Edit button
- Responsive edit/delete button layout
- Form sheet context includes `nucleusId` + `areaId`

---

### 2.4 ProcessCockpit360 Component

**File:** `src/components/organization/ProcessCockpit360.tsx`

**Props:**
```typescript
interface ProcessCockpit360Props {
  process: OrgProcess;
  areaName?: string;
  nucleusName?: string;
  routines?: OrgRoutine[];
  systems?: OrgSystem[];
  allSystems?: OrgSystem[];
  onEdit?: () => void;
  onDelete?: () => void;
  onSelectRoutine?: (routine: OrgRoutine) => void;
  onRoutinesUpdated?: (routines: OrgRoutine[]) => void;
  onLinkSystem?: (systemId: string) => void;
  onUnlinkSystem?: (systemId: string, systemName: string) => void;
}
```

**Tabs & Displays:**

1. **Principal Tab**
   - Edit + Delete buttons
   - "Informações" section
   - "Roles responsáveis" section
   - `BpmDocumentationPanel` (inputs, outputs, risks, impacts, documentation)

2. **Detalhes Tab**
   - `InputsList` component (process.inputs)
   - `OutputsList` component (process.outputs)
   - `RisksList` component (process.risks)
   - `ImpactsList` component (process.impacts)

3. **Rotinas Tab**
   - "Nova Rotina" button → form sheet
   - Grid of `OrgEntityCard` with routine details
   - Badge: `${routine.activities_count} atividades`
   - Click → `onSelectRoutine(routine)`
   - Skeleton loading state
   - Empty state: "Nenhuma rotina cadastrada"

4. **Sistemas Tab** (EPIC 11.7)
   - System linking dropdown
   - List of linked systems with unlink button
   - Conditional empty states:
     - No systems + no link capability → "Nenhum sistema vinculado"
     - No systems + link available → Dropdown to select from `availableSystems`
     - No available systems → `EmptyState` with action to `/organizacao/recursos?tab=sistemas`
   - Linked systems display: name + description
   - Unlink action with confirmation

5. **Métricas Tab** (EPIC 11.9)
   - `ProcessMetricsCard` (current compliance, SLA status, icons)
   - `ProcessMetricsHistory` (time series: duration trend, compliance %)
   - Timeframe selector: week/month/quarter buttons with `aria-pressed`
   - Responsive layout for mobile

6. **SLAs Tab** (EPIC 11.11)
   - "Novo SLA" button → modal
   - `ProcessSlaList` component (read-only or editable)
   - Edit/delete actions per SLA
   - Skeleton loading state
   - Empty state: "Nenhum SLA configurado"

**Key Features:**
- Dynamic routine loading via `getRoutinesByProcess()` action
- Dynamic SLA loading via `getProcessSLAsAction()` action
- Metrics timeframe state managed locally
- Responsive tab layout (horizontal scroll on mobile)
- Form sheet state: `showFormSheet`, `showEditProcess`, `showSlaModal`

---

### 2.5 ActivityCockpit360 Component

**File:** `src/components/organization/ActivityCockpit360.tsx`

**Props:**
```typescript
interface ActivityCockpit360Props {
  activity: OrgActivity;
  routine?: OrgRoutine;
  onEdit?: () => void;
  onDelete?: () => void;
}
```

**Tabs & Displays:**

1. **Informações Tab**
   - Activity name (bold)
   - Badge grid: Complexity (low/medium/high), Priority (low/normal/high), Avg Execution Time
   - `InfoField` for description
   - "Responsável" section: badge with `activity.required_role`
   - Edit + Detalhes BPM + Delete buttons (conditional)

2. **BPM Tab**
   - `InputOutputList` for inputs (direction="input")
   - `InputOutputList` for outputs (direction="output")
   - `InputOutputList` for risks (direction="risk", variant="risk")
   - `InputOutputList` for impacts (direction="impact", variant="impact")
   - Empty state: "Nenhum dado BPM cadastrado"

3. **Documentos Tab**
   - "Vincular Documento" button (disabled, Story 9.6)
   - Placeholder: "Integração de documentos disponível em Story 9.6"

4. **Documentação Tab**
   - `DocumentationAccordion` if `activity.documentation` exists
   - Empty state: "Sem documentação"

5. **Sistemas Tab** (EPIC 11.8)
   - "Gerenciar Sistemas" button → `ActivitySystemsModal`
   - Empty state: "Sistemas associados serão exibidos aqui"

**Key Features:**
- Color-coded complexity + priority badges (green/yellow/red, blue/orange)
- Time formatting: "45min", "2h 30m"
- Tab state management: `formTab` for which edit form to show
- Form sheet modes: `edit` only (no create in activity context)
- Dynamic modal state: `showSystemsModal`, `isFormOpen`

---

## 3. Real-Time Metrics Display

### 3.1 ProcessMetricsCard Component

**File:** `src/components/organization/ProcessMetricsCard.tsx`

**Purpose:** Display current process performance against SLA targets

**Data Source:**
- Table: `org_process_metrics` (updated daily via scheduled job)
- Fields: `avg_duration_days`, `compliance_pct`, `instances_count`, `period_start`, `period_end`
- Freshness: Daily snapshots (TTL: 5 min in React Query)

**Display Elements:**

1. **Compliance Status Badge** (top-right)
   - Color: green (on-track) | yellow (warning) | red (critical)
   - Icon: CheckCircle | AlertTriangle | AlertCircle
   - Label: "No Track" | "Aviso" | "Crítico"
   - Thresholds:
     - `< 80%`: On-track (green)
     - `80-95%`: Warning (yellow)
     - `≥ 95%`: Critical (red)

2. **Status Badges & Text** (main area)
   - Status badge with label
   - Percentage text: `${compliancePct.toFixed(1)}% de conformidade`
   - Status message (colored box):
     - On-track: "O processo está dentro do SLA com margem de segurança"
     - Warning: "O processo está se aproximando do limite de SLA"
     - Critical: "O processo está excedendo o SLA. Ação corretiva recomendada"

3. **Metrics Grid** (responsive: 1 col mobile → 3 col desktop)
   - **SLA Alvo:** target_duration_days (dias)
   - **Duração Média:** avg_duration_days (fixed 1 decimal)
   - **Instâncias:** instances_count (executadas)
   - Each metric in bordered container with `role="group"`

4. **SLA Thresholds Footer**
   - Text: "Limites: Aviso {warning_threshold_pct}% | Crítico {critical_threshold_pct}%"

**Empty State:**
- Card with title "Métricas do Processo"
- Description: "Nenhuma métrica disponível para este processo"
- Message: "Métricas serão exibidas após os primeiros registros de conclusão"

**Accessibility:**
- `role="group" aria-label="SLA Alvo"` on each metric container
- Semantic color mapping (green=success, yellow=warning, red=critical)
- No color-alone conveyance (always paired with icon + text)

---

### 3.2 ProcessMetricsHistory Component

**File:** `src/components/organization/ProcessMetricsHistory.tsx`

**Purpose:** Time-series visualization of metrics trends over time

**Data Source:**
- Table: `org_process_metrics` (historical records)
- Query: Filtered by timeframe (week/month/quarter)
- Chart Library: Recharts (LineChart + BarChart)

**Display Elements:**

1. **Header with Timeframe Selector**
   - Title: "Histórico de Métricas"
   - Description: "Tendências de duração e conformidade ao SLA"
   - Buttons (responsive flex-wrap):
     - "Semana" | "Mês" | "Trimestre"
     - Selected button: `variant="default"`, `aria-pressed="true"`
     - Unselected: `variant="outline"`, `aria-pressed="false"`

2. **Duration Trend Chart** (LineChart)
   - Y-axis: Days (Dias)
   - X-axis: Period (rotated -45°)
   - Line: avg_duration (stroke: primary color)
   - Tooltips: Formatted as `.toFixed(2)`
   - Legend included
   - Height: 250px (responsive container)

3. **Compliance Trend Chart** (BarChart)
   - Y-axis: Compliance % (0-100 domain)
   - X-axis: Period (rotated -45°)
   - Bar: compliance_pct (fill: primary color, rounded top)
   - Tooltips: Formatted as `${value.toFixed(1)}%`
   - Legend included
   - Height: 250px

4. **Statistics Grid** (responsive: 1 col mobile → 3 col desktop)
   - **Total de Instâncias:** Sum of all instances
   - **Duração Média Geral:** Average across all periods (fixed 1 decimal, in days)
   - **Conformidade Média:** Average compliance % (fixed 1 decimal)
   - Each in centered `role="region"` with `aria-label`

**Empty State:**
- Card with title "Histórico de Métricas"
- Description: "Nenhum histórico disponível para este período"
- Message: "Histórico será exibido conforme dados forem coletados ao longo do tempo"

**Accessibility:**
- `role="group" aria-label="Selecionador de período"` on timeframe buttons
- `role="region" aria-label="..."` on each stats container
- Color conventions: primary blue for lines/bars (must meet 4.5:1 ratio)
- Tooltip background: `var(--background)` + `var(--border)` CSS vars

---

## 4. Responsible Roles Visualization

### 4.1 Responsible Roles Display Pattern

**Components:**
- **Read-only display:** Simple badge grid (comma-separated text or pill badges)
- **Editable input:** `ResponsibleRolesInput` component (Story 10.2)

**Read-Only Display (in Cockpit360 components):**
```typescript
const rolesDisplay =
  area.responsible_roles?.length > 0 ? area.responsible_roles.join(', ') : 'Não definido';
// Display: <p className="text-sm">{rolesDisplay}</p>
```

**Inline Display Rules:**
- If no roles: Gray text "Não definido"
- If roles exist: Display as comma-separated list or pills
- Max width: line-clamp-1 on long lists
- Color: primary color for role text (WCAG AA compliant)

### 4.2 ResponsibleRolesInput Component

**File:** `src/components/organization/ResponsibleRolesInput.tsx`

**Features:**
- **Tag Display:** Selected roles as badges with remove button (X icon)
- **Autocomplete:** Dropdown with role filtering
- **Keyboard Navigation:**
  - Arrow Up/Down: Navigate dropdown
  - Enter: Select highlighted role
  - Escape: Close dropdown
  - Backspace (empty input): Remove last role
- **WCAG AA Accessibility:**
  - `role="combobox"` on input
  - `aria-label="Pesquisar e adicionar função responsável"`
  - `aria-autocomplete="list"`, `aria-expanded={open}`
  - `aria-controls="roles-listbox"` → listbox id
  - `role="listbox"` on dropdown container
  - `role="option" aria-selected="true"` on each badge
  - `role="option" aria-selected={highlighted}` on dropdown items

**Data Source:**
- Function: `getAllRoles()` from `lib/organization/role-definitions.ts`
- Returns array of `{ value: string; label: string; description: string }`
- Examples: "Process Owner", "Activity Executor", "Data Validator", etc.

**Display Logic:**
- Filter: Remove already-selected roles from dropdown
- Filter: Match input text against role.label (case-insensitive)
- Highlight index updated on arrow navigation
- Selected count shown below: "{n} role{s} selected"

**Interaction Model:**
1. User types in input
2. Dropdown opens, filtered suggestions appear
3. User selects via arrow keys + Enter
4. Role added to tag list, input clears
5. User clicks X on badge to remove role

**Styling:**
- Tags: `Badge variant="secondary"` with X button
- Dropdown: Absolute positioned, z-50, max-h-60 overflow-y-auto
- Highlighted item: `bg-accent`
- Focus ring: `focus:ring-2 focus:ring-ring focus:ring-offset-2`

---

## 5. Accessibility Requirements (WCAG AA 2.1)

### 5.1 Color Contrast Standards

**Minimum Ratios:**
- Normal text: 4.5:1 (all labels, body text, tooltips)
- Large text (18pt+): 3:1 (headings, KPI values)
- UI components (borders, focus indicators): 3:1

**Semantic Colors (palette: see `accessible-colors.md`):**

| State | Color | Hex | Contrast | WCAG AA |
|-------|-------|-----|----------|---------|
| Success | Light Green | #D1FAE5 (bg) + #10B981 (text) | 5.2:1 | ✅ |
| Warning | Light Amber | #FEF3C7 (bg) + #D97706 (text) | 7.1:1 | ✅ |
| Critical | Light Red | #FEE2E2 (bg) + #DC2626 (text) | 7.2:1 | ✅ |
| Info | Light Blue | #DBEAFE (bg) + #0284C7 (text) | 6.8:1 | ✅ |
| Primary | Blue | #0061E0 | 8.5:1 | ✅ |

**Validation Tool:** WebAIM Contrast Checker (https://webaim.org/resources/contrastchecker/)

### 5.2 Keyboard Navigation

**Focus Management:**
- Tab order follows visual flow (left-to-right, top-to-bottom)
- Skip links for main navigation (optional)
- Focus visible on all interactive elements: `outline-2 outline-primary`
- Button focus ring: `focus:ring-2 focus:ring-ring focus:ring-offset-2`

**Interactive Patterns:**
- **Buttons:** Enter/Space to activate
- **Tabs:** Arrow keys to switch, Enter to select
- **Combobox (ResponsibleRolesInput):** Arrow keys for dropdown nav, Enter to select
- **Table rows:** Enter to drill-down/open (if clickable)
- **Modals:** Escape to close, focus trap enabled

**Keyboard Shortcuts (tab navigation):**
```
1. Cmd+K (global search) → jump to search input
2. Tab → next interactive element
3. Shift+Tab → previous interactive element
4. Escape → close modal/dropdown
```

### 5.3 Screen Reader Support

**ARIA Attributes:**

| Element | ARIA Role | ARIA Label/Describedby | Status |
|---------|-----------|----------------------|--------|
| Tab triggers | `role="tab"` | `aria-selected="true/false"` | ✅ |
| Combobox input | `role="combobox"` | `aria-label="..."`, `aria-expanded="true/false"` | ✅ |
| Listbox | `role="listbox"` | Auto from context | ✅ |
| Listbox options | `role="option"` | `aria-selected="true/false"` | ✅ |
| Metric groups | `role="group"` | `aria-label="SLA Alvo"`, etc | ✅ |
| Status regions | `role="region"` | `aria-label="Compliance status"` | ✅ |
| Live regions | `aria-live="polite"` | Filter updates, metric changes | ✅ |
| Icon buttons | — | `aria-label="Delete role"`, etc | ✅ |

**Announcements:**
- Filter applied: "Filtered results: 5 items shown"
- Metric update: "SLA compliance is now 92%"
- Dropdown open/close: Announced via `aria-expanded`

### 5.4 Color Blindness Support

**Rule:** Never use color alone to convey meaning. Always pair with:
- Icons (checkmark, warning triangle, alert circle)
- Text labels ("On Track", "Aviso", "Crítico")
- Patterns (solid, striped, dotted for charts)

**Examples:**
- ✅ Green circle + "No Track" text
- ✅ Yellow triangle + "Aviso" text
- ✅ Red circle + "Crítico" text + status message

---

## 6. Query Optimization & Performance

### 6.1 Data Loading Strategy

**Dashboard Load Pattern:**
```typescript
// Server-side: Use React Server Components for initial data
async function AreaPage({ params }: { params: { areaId: string } }) {
  const area = await getAreaWithMetrics(params.areaId);
  const nuclei = await getNucleiByArea(params.areaId);
  return <AreaCockpit360 area={area} nuclei={nuclei} ... />;
}

// Client-side: Use React Query for updates + drill-down
const { data: routines } = useQuery(
  ['routines', processId],
  () => getRoutinesByProcess(processId),
  { staleTime: 5 * 60 * 1000 } // 5 min TTL
);
```

**Response Target:** p95 < 500ms
- Initial page load: <2s (server component + streaming)
- Drill-down transitions: <500ms (cached queries)
- Metrics updates: <200ms (real-time polling)

### 6.2 Database Indexing

**Indexes Required (on `org_*` tables):**

```sql
-- Area queries
CREATE INDEX idx_org_areas_tenant_id ON org_areas(tenant_id);
CREATE INDEX idx_org_areas_created_at ON org_areas(created_at DESC);

-- Nucleus queries
CREATE INDEX idx_org_nuclei_area_id ON org_nuclei(area_id);
CREATE INDEX idx_org_nuclei_tenant_id ON org_nuclei(tenant_id);

-- Process queries
CREATE INDEX idx_org_processes_nucleus_id ON org_processes(nucleus_id);
CREATE INDEX idx_org_processes_tenant_id ON org_processes(tenant_id);

-- Process Metrics queries (EPIC 11)
CREATE INDEX idx_org_process_metrics_process_id ON org_process_metrics(process_id);
CREATE INDEX idx_org_process_metrics_period ON org_process_metrics(period_start, period_end);
CREATE INDEX idx_org_process_metrics_tenant_id ON org_process_metrics(tenant_id);

-- Activity System relationships (EPIC 11)
CREATE INDEX idx_org_activity_systems_activity_id ON org_activity_systems(activity_id);
CREATE INDEX idx_org_activity_systems_system_id ON org_activity_systems(system_id);
```

### 6.3 React Query Caching Strategy

**Cache Configuration:**
```typescript
// Stale time: Data considered fresh for this duration
staleTime: 5 * 60 * 1000, // 5 minutes for metrics

// Cache time: Data kept in cache for this duration (after unmount)
gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)

// Refetch strategy
refetchOnWindowFocus: false, // Don't refetch on window focus
refetchOnMount: 'stale', // Refetch if data is stale on mount
```

**Query Keys:**
```typescript
// Area queries
['areas', tenantId, areaId]
['areas', tenantId, { page, limit }]

// Process metrics queries
['metrics', processId]
['metrics', processId, { timeframe: 'month' }]

// Nucleus queries
['nuclei', { areaId }]

// Process queries
['processes', { nucleusId }]

// Routines queries
['routines', processId]

// SLAs queries
['slas', processId]
```

### 6.4 Batch Query Optimization

**Problem:** Drill-down in Cockpit360 triggers multiple sequential queries.

**Solution:** Use batch queries to fetch related data in single RPC call.

```typescript
// Optimized: Single query for process + routines + systems
async function getProcessWithRelations(processId: string) {
  const [process, routines, systems] = await Promise.all([
    getProcess(processId),
    getRoutinesByProcess(processId),
    getSystemsByProcess(processId),
  ]);
  return { process, routines, systems };
}

// React Query
const { data } = useQuery(
  ['processWithRelations', processId],
  () => getProcessWithRelations(processId),
  { staleTime: 5 * 60 * 1000 }
);
```

---

## 7. Code Examples

### 7.1 AreaCockpit360 Integration Example

**Parent Component (Server):**
```typescript
// src/app/organizacao/areas/[id]/page.tsx
async function AreaDetailPage({ params }: { params: { id: string } }) {
  const { userId, tenantId } = await getCurrentUser();

  // Server-side data fetching
  const area = await db.query.orgAreas.findFirst({
    where: and(eq(orgAreas.id, params.id), eq(orgAreas.tenantId, tenantId)),
  });

  const nuclei = await db.query.orgNuclei.findMany({
    where: and(eq(orgNuclei.areaId, params.id), eq(orgNuclei.tenantId, tenantId)),
  });

  const processes = await db.query.orgProcesses.findMany({
    where: and(
      inArray(
        orgProcesses.nucleusId,
        nuclei.map(n => n.id)
      ),
      eq(orgProcesses.tenantId, tenantId)
    ),
  });

  return (
    <ClientAreaDetail
      area={area}
      nuclei={nuclei}
      processes={processes}
    />
  );
}

// Client Component
'use client';
function ClientAreaDetail({ area, nuclei, processes }: Props) {
  const [selectedNucleus, setSelectedNucleus] = useState<OrgNucleus | null>(null);

  return (
    <div className="grid grid-cols-2 gap-6">
      <AreaCockpit360
        area={area}
        nuclei={nuclei}
        processes={processes}
        onSelectNucleus={setSelectedNucleus}
        onNucleiUpdated={(updated) => {
          // Handle nuclei update (e.g., invalidate query)
        }}
      />

      {selectedNucleus && (
        <NucleusCockpit360
          nucleus={selectedNucleus}
          areaId={area.id}
          onSelectProcess={(process) => {
            // Navigate to process detail
          }}
        />
      )}
    </div>
  );
}
```

### 7.2 ProcessMetricsCard Real-Time Example

**Component Usage:**
```typescript
function ProcessMetricsTab({ processId }: { processId: string }) {
  // Fetch SLA + recent metrics
  const { data: sla } = useQuery(
    ['processSla', processId],
    () => getProcessSLA(processId),
    { staleTime: 10 * 60 * 1000 } // 10 min (update less frequently)
  );

  const { data: metrics } = useQuery(
    ['processMetrics', processId],
    () => getProcessMetrics(processId),
    { staleTime: 5 * 60 * 1000 } // 5 min (update more frequently)
  );

  return (
    <ProcessMetricsCard
      processId={processId}
      sla={sla}
      recentMetrics={metrics}
    />
  );
}
```

**Server Action Example:**
```typescript
// src/app/actions/organization.ts
'use server';

export async function getProcessMetrics(processId: string) {
  const { tenantId } = await getCurrentUser();

  const metrics = await db
    .select()
    .from(orgProcessMetrics)
    .where(
      and(
        eq(orgProcessMetrics.processId, processId),
        eq(orgProcessMetrics.tenantId, tenantId),
        gte(orgProcessMetrics.periodStart, new Date(Date.now() - 90 * 24 * 60 * 60 * 1000))
      )
    )
    .orderBy(desc(orgProcessMetrics.periodStart));

  return metrics;
}
```

### 7.3 ResponsibleRolesInput Integration

**In ActivityForm:**
```typescript
function ActivityForm({ activity }: { activity?: OrgActivity }) {
  const [roles, setRoles] = useState<string[]>(activity?.responsible_roles || []);

  async function handleSave() {
    await updateActivityAction(activity.id, {
      responsible_roles: roles,
    });
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
      <label htmlFor="roles">Funções Responsáveis</label>
      <ResponsibleRolesInput
        value={roles}
        onChange={setRoles}
        disabled={isLoading}
      />

      <Button type="submit">Salvar</Button>
    </form>
  );
}
```

---

## 8. Performance Metrics & Monitoring

### 8.1 Target Metrics

| Metric | Target | Tool |
|--------|--------|------|
| First Contentful Paint (FCP) | < 1.5s | Lighthouse |
| Largest Contentful Paint (LCP) | < 2.5s | Lighthouse |
| Cumulative Layout Shift (CLS) | < 0.1 | Lighthouse |
| Time to Interactive (TTI) | < 3s | Lighthouse |
| Database query p95 | < 200ms | DataDog / Query logs |
| React Query stale time | 5 min | Config |
| Metrics update frequency | 1-5 min | Scheduled job |

### 8.2 Monitoring & Debugging

**Enable React Query DevTools:**
```bash
npm install @tanstack/react-query-devtools
```

**In layout:**
```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

---

## 9. File References

| File Path | Purpose |
|-----------|---------|
| `src/components/organization/AreaCockpit360.tsx` | Area-level dashboard |
| `src/components/organization/NucleusCockpit360.tsx` | Nucleus-level dashboard |
| `src/components/organization/ProcessCockpit360.tsx` | Process-level dashboard + metrics + SLAs |
| `src/components/organization/ActivityCockpit360.tsx` | Activity-level dashboard |
| `src/components/organization/ProcessMetricsCard.tsx` | Current metrics display |
| `src/components/organization/ProcessMetricsHistory.tsx` | Historical trend charts |
| `src/components/organization/ResponsibleRolesInput.tsx` | Role tag input with autocomplete |
| `src/app/actions/organization.ts` | Server actions for all queries |
| `src/lib/organization/role-definitions.ts` | Role enum + label mappings |
| `docs/accessibility/accessible-colors.md` | WCAG AA color palette |
| `docs/accessibility/component-a11y-guide.md` | Detailed accessibility patterns |

---

## 10. Related Documentation

- **[EPIC 11 Organizational Enrichment](../stories/EPIC-11-Organizational-Enrichment-BPM-Mastery.md)** — Complete feature scope
- **[ORGANIZATION-SCHEMA.md](./ORGANIZATION-SCHEMA.md)** — Database architecture (16 tables)
- **[AI-CONTEXT-ENGINEERING.md](../guides/AI-CONTEXT-ENGINEERING.md)** — Role context injection patterns
- **[ACCESSIBLE-COLORS.md](../accessibility/accessible-colors.md)** — WCAG AA color standards
- **[ADR-005: Organization Architecture](./adr/ADR-005-organization-architecture.md)** — Design rationale

---

*Last updated: 2026-03-16 | Maintained by @ux-design-expert (Uma) | EPIC 11 Deployment Ready*
