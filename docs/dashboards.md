# Dashboard & Cockpit360 UI/UX Patterns

**Status:** Complete (EPIC 11 Phase 3 — UX Design Documentation)

**Purpose:** Comprehensive reference for Cockpit360 component patterns, hierarchy visualization, and dashboard layouts used throughout Tech Arauz.

---

## Table of Contents

1. [Cockpit360 Architecture](#cockpit360-architecture)
2. [Component Structure](#component-structure)
3. [Hierarchy Visualization Patterns](#hierarchy-visualization-patterns)
4. [Dashboard Layouts](#dashboard-layouts)
5. [Shared Components](#shared-components)
6. [Implementation Examples](#implementation-examples)
7. [Accessibility & Patterns](#accessibility--patterns)

---

## Cockpit360 Architecture

### Definition

A **Cockpit360** is a comprehensive single-entity dashboard component that displays:
- Entity metadata (name, description, objective)
- Operational details (responsible roles, relationships, documentation)
- Nested hierarchical relationships (child entities, systems, metrics)
- Multiple data views organized by tabs

### Core Principle: Full-360 Visibility

Cockpit360 components follow a standardized pattern to ensure complete contextual visibility:

```
Entity Overview → Metadata → Relationships → Metrics → Documentation
```

### Naming Convention

- `EntityCockpit360.tsx` — Full-featured dashboard (EPIC 11)
- `EntityCockpit.tsx` — Basic summary view (Legacy)
- Both components accept the same base entity props, but 360 versions include tabs and nested views

---

## Component Structure

### 1. Tab-Based Organization

All Cockpit360 components use **Shadcn Tabs** with a consistent structure:

```tsx
<Tabs defaultValue="principal" className="w-full">
  <TabsList className="h-auto w-full justify-start rounded-none border-b bg-transparent p-0">
    <TabsTrigger value="principal" className="...">
      <FileText className="mr-2 size-4" />
      Principal
    </TabsTrigger>
    {/* Additional tabs based on entity type */}
  </TabsList>

  <TabsContent value="principal" className="mt-6 space-y-8">
    {/* Principal tab content */}
  </TabsContent>
</Tabs>
```

### 2. Tab Trigger Styling

Custom tab trigger styling for visual consistency:

```tsx
className="rounded-none border-b-2 border-transparent px-4 py-2.5
  data-[state=active]:border-primary
  data-[state=active]:bg-transparent"
```

**Key Features:**
- No rounded corners (flat design)
- Bottom border indicator (active state)
- Icon + label pattern
- Entity count badges in parentheses

### 3. Standard Tab Sections

#### **Principal Tab**
- Entity metadata (name, description, objective)
- Responsible roles
- Summary actions (Edit button)
- Quick navigation buttons

#### **Detalhes Tab** (for Process/Activity)
- Inputs/Outputs lists
- Risks and Impacts
- BPM-specific fields
- Technical specifications

#### **Child Entity Tabs** (Núcleos, Processos, Rotinas, Atividades, Sistemas)
- Card-based grid layout
- `OrgEntityCard` components for each child
- "New Entity" action button
- Empty state messaging

#### **Métricas Tab** (Process-specific)
- KPI cards (grid layout)
- Time-range selector (7d, 30d, 90d)
- Historical charts (Recharts BarChart, AreaChart)
- Period-based filtering

#### **Documentação/BPM Tab**
- `DocumentationAccordion` for JSONB fields
- Collapsible sections (regra, prazo, steps, procedures)
- Special styling for business rules

---

## Hierarchy Visualization Patterns

### 1. Organizational Hierarchy

```
Area (AreaCockpit360)
├── Núcleos (OrgEntityCard list)
│   └── Click → NucleusCockpit360
│       ├── Processos (OrgEntityCard list)
│       │   └── Click → ProcessCockpit360
│       │       ├── Rotinas (OrgEntityCard list)
│       │       │   └── Click → RoutineCockpit360
│       │       │       └── Atividades (OrgEntityCard list)
│       │       │           └── Click → ActivityCockpit360
│       │       └── Sistemas (linked entities)
│       └── Documentação (BpmDocumentationPanel)
└── Processos (direct linkage)
```

### 2. Entity Relationship Display

#### **OrgEntityCard** Component

Each card in a hierarchical list displays:

```tsx
<Card className="hover:shadow-md transition-shadow cursor-pointer">
  <CardContent className="p-3 flex justify-between items-start">
    <div className="flex-1">
      {/* Title + Badge + Subtitle + Meta */}
      <h4 className="font-semibold text-sm">{title}</h4>
      <Badge variant="secondary">{count} children</Badge>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
      <div className="flex gap-3 text-xs text-muted-foreground">
        <span>roles: <strong>{roleCount}</strong></span>
      </div>
    </div>
    <ChevronRight className="w-4 h-4 text-muted-foreground" />
  </CardContent>
</Card>
```

**Props:**
```typescript
interface OrgEntityCardProps {
  title: string;                    // Entity name
  subtitle?: string;                // Entity objective
  badge?: string;                   // Count label (e.g., "5 processos")
  meta?: Record<string, string | number>;  // Key-value pairs (roles, systems, etc.)
  onClick?: () => void;             // Navigation callback
  className?: string;
}
```

**Locations:**
- `src/components/organization/shared/OrgEntityCard.tsx`
- Used in: AreaCockpit360, NucleusCockpit360, ProcessCockpit360, RoutineCockpit360

### 3. Information Display

#### **InfoField** Component

Consistent label-value display across all cockpits:

```tsx
<InfoField label="Objetivo" value={entity.objective} />
// Renders as:
// Objetivo    [value text here]
//   ↑ 80px    ↑ flex
```

**Props:**
```typescript
interface InfoFieldProps {
  label: string;              // Field label (80px fixed width)
  value: React.ReactNode;     // Field content (flex-1)
  className?: string;         // Additional classes
}
```

**Pattern:**
```tsx
<section>
  <div className="mb-4 flex items-center gap-2 border-b pb-2">
    <FileText className="size-5 text-primary" />
    <h3 className="text-base font-semibold">Informações</h3>
  </div>
  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
    <InfoField label="Descrição" value={entity.description} />
    <InfoField label="Objetivo" value={entity.objective} />
  </div>
</section>
```

---

## Dashboard Layouts

### 1. KPI Card Grid Layout

Used for metrics dashboards (AgentMetrics360, ProcessMetricsCard):

```tsx
<div className="grid grid-cols-4 gap-4">
  <KPICard title="Sessions" value={runs_total} icon={Activity} subtitle="chat sessions" />
  <KPICard title="Success Rate" value={`${success_rate}%`} icon={CheckCircle} subtitle="sucesso" />
  <KPICard title="Avg Latency" value={avg_latency_ms} icon={Zap} subtitle="ms" />
  <KPICard title="Total Cost" value={`$${total_cost}`} icon={DollarSign} subtitle="usd" />
</div>
```

**Component Structure:**

```tsx
export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon: Icon,
  trend,           // Optional: { value: "12%", positive: true }
  subtitle,
  className,
  onClick,
  active,
}) => {
  return (
    <Card className={cn(
      'shadow-soft transition-all duration-300 hover:shadow-card-hover',
      'animate-scale-in hover:-translate-y-0.5',
      onClick && 'cursor-pointer',
      active && 'ring-2 ring-primary ring-offset-2',
      className,
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{value}</span>
              {trend && <span className={trend.positive ? 'text-success' : 'text-destructive'}>
                {trend.positive ? '+' : ''}{trend.value}
              </span>}
            </div>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className={cn('rounded-lg p-3',
            active ? 'bg-primary/20' : 'bg-primary/10')}>
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
```

**File Location:**
`src/components/dashboard/KPICard.tsx`

### 2. Chart Layouts (Metrics History)

Used in process and agent metrics:

```tsx
<div className="mt-6 space-y-6">
  {/* Bar Chart: Daily Runs */}
  <Card>
    <CardHeader>
      <CardTitle>Runs por Dia</CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="runs" fill="#3b82f6" />
          <Bar dataKey="successful" fill="#10b981" />
          <Bar dataKey="failed" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>

  {/* Area Chart: Cost Trends */}
  <Card>
    <CardHeader>
      <CardTitle>Custo Acumulado</CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="cost_usd" fill="#fbbf24" stroke="#f59e0b" />
        </AreaChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
</div>
```

**Chart Library:** Recharts
**Common Charts:**
- `BarChart` — For categorical comparisons (runs, success rate)
- `AreaChart` — For trends over time (cost, performance)
- `LineChart` — For continuous metrics

---

## Shared Components

### 1. InputOutputList

Displays process inputs, outputs, risks, and impacts with directional icons:

```tsx
interface InputOutputListProps {
  items: InputOutputItem[];
  direction: 'input' | 'output' | 'risk' | 'impact';
  variant?: 'default' | 'risk' | 'impact';  // Controls background color
  className?: string;
}

// Each item displays:
<div className="p-3 rounded border flex gap-3">
  <ArrowDown className="w-4 h-4 text-blue-600" />  {/* Directional icon */}
  <div className="flex-1">
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">{item.name}</span>
      {item.required && <Badge variant="outline">Required</Badge>}
      {item.severity && <Badge variant="destructive">{item.severity}</Badge>}
    </div>
    {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
  </div>
</div>
```

**File Location:**
`src/components/organization/shared/InputOutputList.tsx`

**Icon Mapping:**
- `input` → ArrowDown (blue)
- `output` → ArrowUp (green)
- `risk` → AlertCircle (destructive)
- `impact` → BarChart3 (yellow)

### 2. DocumentationAccordion

Renders JSONB documentation fields as collapsible sections:

```tsx
interface OrgDocumentation {
  procedures?: string | null;
  instructions?: string | null;
  regra?: string | null;              // Business rule (special styling)
  prazo?: string | null;              // Deadline
  horario_limite?: string | null;     // Time limit
  steps?: string[] | null;            // Numbered list
}

// Special Cases:
// - regra: Alert styling + destructive color + AlertCircle icon
// - prazo: Clock icon + horario_limite displayed side-by-side
// - steps: Rendered as <ol> with numbers
```

**File Location:**
`src/components/organization/shared/DocumentationAccordion.tsx`

**Accordion Pattern:**
```tsx
<Collapsible open={isOpen} onOpenChange={() => toggleOpen(key)}>
  <CollapsibleTrigger className="w-full px-3 py-2 flex items-center justify-between hover:bg-muted/50">
    <div className="flex items-center gap-2">
      {/* Icon based on field type */}
      <span className="font-semibold">{label}</span>
    </div>
    <ChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
  </CollapsibleTrigger>
  <CollapsibleContent className="px-3 py-2 border-t">
    {content}
  </CollapsibleContent>
</Collapsible>
```

### 3. RolesDisplay

Shows responsible roles with formatted display:

```tsx
const rolesDisplay =
  area.responsible_roles?.length > 0
    ? area.responsible_roles.join(', ')
    : 'Não definido';

// Rendered as:
<section>
  <div className="mb-4 flex items-center gap-2 border-b pb-2">
    <Users className="size-5 text-primary" />
    <h3 className="text-base font-semibold">Roles responsáveis</h3>
  </div>
  <p className="text-sm">{rolesDisplay}</p>
</section>
```

**File Location:**
`src/components/organization/shared/RolesDisplay.tsx`

---

## Implementation Examples

### Example 1: AreaCockpit360 (Complete Pattern)

**File:** `src/components/organization/AreaCockpit360.tsx`

**Structure:**
```tsx
export const AreaCockpit360: React.FC<AreaCockpit360Props> = ({
  area,
  nuclei,
  processes,
  onEdit,
  onSelectNucleus,
  onNucleiUpdated,
}) => {
  const [showFormSheet, setShowFormSheet] = useState(false);
  const [localNuclei, setLocalNuclei] = useState(nuclei);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="principal" className="w-full">
        <TabsList className="h-auto w-full justify-start rounded-none border-b bg-transparent p-0">

          {/* Tab 1: Principal */}
          <TabsTrigger value="principal" className="...">
            <FileText className="mr-2 size-4" />
            Principal
          </TabsTrigger>

          {/* Tab 2: Núcleos */}
          <TabsTrigger value="nucleos" className="...">
            <Building2 className="mr-2 size-4" />
            Núcleos
            {nuclei.length > 0 && <span className="ml-2 text-xs text-muted-foreground">({nuclei.length})</span>}
          </TabsTrigger>

          {/* Tab 3: Processos */}
          <TabsTrigger value="processos" className="...">
            <GitBranch className="mr-2 size-4" />
            Processos
            {processes.length > 0 && <span className="ml-2 text-xs text-muted-foreground">({processes.length})</span>}
          </TabsTrigger>
        </TabsList>

        {/* CONTENT: Principal */}
        <TabsContent value="principal" className="mt-6 space-y-8">
          <section>
            <div className="mb-4 flex items-center gap-2 border-b pb-2">
              <FileText className="size-5 text-primary" />
              <h3 className="text-base font-semibold">Informações</h3>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <InfoField label="Descrição" value={area.description} />
              <InfoField label="Objetivo" value={area.objective} />
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center gap-2 border-b pb-2">
              <Users className="size-5 text-primary" />
              <h3 className="text-base font-semibold">Roles responsáveis</h3>
            </div>
            <p className="text-sm">{rolesDisplay}</p>
          </section>

          <Button variant="default" className="w-full gap-2" onClick={() => setShowFormSheet(true)}>
            <Plus className="size-4" />
            Novo Núcleo
          </Button>
        </TabsContent>

        {/* CONTENT: Núcleos (Child entity list) */}
        <TabsContent value="nucleos" className="mt-6 space-y-3">
          <div className="mb-4">
            <Button variant="default" size="sm" className="gap-2" onClick={() => setShowFormSheet(true)}>
              <Plus className="size-4" />
              Novo Núcleo
            </Button>
          </div>
          {localNuclei.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Nenhum núcleo nesta área
            </div>
          ) : (
            <div className="space-y-3">
              {localNuclei.map((n) => (
                <OrgEntityCard
                  key={n.id}
                  title={n.name}
                  subtitle={n.objective ?? undefined}
                  badge={`${n.processes_count || 0} processos`}
                  meta={{ roles: n.responsible_roles?.length || 0 }}
                  onClick={() => onSelectNucleus?.(n)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* CONTENT: Processos */}
        <TabsContent value="processos" className="mt-6">
          {processes.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Nenhum processo vinculado a esta área
            </div>
          ) : (
            <div className="space-y-3">
              {processes.map((p) => (
                <Link key={p.id} href={`/organizacao/processos/${p.id}/rotinas`}>
                  <div className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50">
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      {p.description && (
                        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                          {p.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <OrgEntityFormSheet
        entity="nucleus"
        mode="create"
        isOpen={showFormSheet}
        context={{ areaId: area.id }}
        onClose={() => setShowFormSheet(false)}
        onSaved={(newNucleus) => {
          const updated = [...localNuclei, newNucleus as OrgNucleus];
          setLocalNuclei(updated);
          onNucleiUpdated?.(updated);
          setShowFormSheet(false);
        }}
      />
    </div>
  );
};
```

**Key Patterns:**
1. **Tabs Structure** — 3 main tabs (principal, child entities, related entities)
2. **Section Layout** — Icon + heading + content pattern
3. **Entity Cards** — Grid of OrgEntityCard for child entities
4. **Empty States** — Centered message for empty lists
5. **Action Buttons** — Create entity buttons with Plus icon
6. **Form Sheets** — Separate component for entity creation/editing

### Example 2: ProcessCockpit360 (Advanced Pattern with Metrics)

**File:** `src/components/organization/ProcessCockpit360.tsx`

**Key Differences:**
- **5 Tabs** — Principal + Detalhes + Rotinas + Sistemas + Métricas
- **Metrics Tab** — Time-range selector (week/month/quarter)
- **Linked Entities** — Sistemas with link/unlink actions
- **Advanced Content** — InputsList, OutputsList, RisksList, ImpactsList
- **Documentation Panel** — BpmDocumentationPanel component

**Tab Structure:**
```tsx
<TabsList className="h-auto w-full justify-start rounded-none border-b bg-transparent p-0">
  <TabsTrigger value="principal">
    <FileText className="mr-2 size-4" />
    Principal
  </TabsTrigger>
  <TabsTrigger value="detalhes">
    <ClipboardList className="mr-2 size-4" />
    Detalhes
  </TabsTrigger>
  <TabsTrigger value="rotinas">
    <ClipboardList className="mr-2 size-4" />
    Rotinas
    {routines.length > 0 && <span className="ml-2 text-xs text-muted-foreground">({routines.length})</span>}
  </TabsTrigger>
  <TabsTrigger value="sistemas">
    <Monitor className="mr-2 size-4" />
    Sistemas
    {systems.length > 0 && <span className="ml-2 text-xs text-muted-foreground">({systems.length})</span>}
  </TabsTrigger>
  <TabsTrigger value="metricas">
    <BarChart3 className="mr-2 size-4" />
    Métricas
  </TabsTrigger>
</TabsList>
```

### Example 3: ActivityCockpit360 (Minimal Pattern)

**File:** `src/components/organization/ActivityCockpit360.tsx`

**Structure:**
- **5 Tabs** — Info + BPM + Docs + Documentação + Sistemas
- **Complexity/Priority Badges** — Color-coded (low/medium/high)
- **Execution Time** — Formatted display with hours/minutes
- **Systems Modal** — Separate modal for system linkage

**Badge Styling:**
```tsx
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

<Badge className={complexityColors[activity.complexity || 'low']}>
  {(activity.complexity || 'low').toUpperCase()}
</Badge>
```

---

## Accessibility & Patterns

### 1. Color Accessibility

All colored badges and indicators follow WCAG AA standards:

- **Complexity:** Green (low) ✓, Yellow (medium) ✓, Red (high) ✓
- **Priority:** Slate (low) ✓, Blue (normal) ✓, Orange (high) ✓
- **Status:** Green (active) ✓, Red (inactive) ✓, Yellow (pending) ✓
- **Direction Icons:** Blue (input), Green (output), Red (risk), Yellow (impact)

### 2. Keyboard Navigation

All Cockpit360 components support:
- Tab between sections
- Enter/Space to toggle collapsibles
- Arrow keys for tab navigation (Shadcn Tabs provides this)
- Links and buttons fully keyboard-accessible

### 3. Screen Reader Support

- **Semantic HTML:** `<section>`, `<h3>` headers, `<p>` paragraphs
- **ARIA Labels:** Buttons have descriptive text + optional aria-label
- **Icon Descriptions:** All icons accompanied by text labels
- **Form Accessibility:** Proper labels and error messaging

### 4. Mobile Responsiveness

Layout breakpoints:

```tsx
// 2-column on desktop, 1-column on mobile
<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
  <InfoField ... />
  <InfoField ... />
</div>

// Responsive KPI grid
<div className="grid grid-cols-4 gap-4">  {/* 4 columns on desktop */}
  {/* On mobile, grid-cols-1 via responsive prefixes */}
</div>

// Tab overflow handling
<TabsList className="h-auto w-full justify-start overflow-x-auto">
  {/* Tabs scroll horizontally on small screens */}
</TabsList>
```

### 5. Interactive Patterns

**Hover States:**
```tsx
className="hover:shadow-md transition-shadow cursor-pointer"  // OrgEntityCard
className="hover:bg-muted/50"  // Tab content items
className="hover:-translate-y-0.5 shadow-soft"  // KPICard
```

**Focus States:**
- All interactive elements have visible focus rings
- Tabs use bottom-border indicator
- Buttons use standard button focus styles

**Loading States:**
```tsx
{loading ? (
  <>
    <Skeleton className="h-24" />
    <Skeleton className="h-24" />
  </>
) : (
  // Actual content
)}
```

---

## Real-World Cockpit Component Inventory

### EPIC 11 Organization Hierarchy

| Component | File Path | Tabs | Child Entities | Metrics | Status |
|-----------|-----------|------|---|---|---|
| AreaCockpit360 | `src/components/organization/AreaCockpit360.tsx` | 3 (Principal, Núcleos, Processos) | OrgNucleus[], OrgProcess[] | No | EPIC 11 |
| NucleusCockpit360 | `src/components/organization/NucleusCockpit360.tsx` | 3 (Principal, Processos, Sistemas) | OrgProcess[], OrgSystem[] | No | EPIC 11 |
| ProcessCockpit360 | `src/components/organization/ProcessCockpit360.tsx` | 5 (Principal, Detalhes, Rotinas, Sistemas, Métricas) | OrgRoutine[], OrgSystem[] | Yes (ProcessMetricsCard) | EPIC 11 |
| RoutineCockpit360 | `src/components/organization/RoutineCockpit360.tsx` | 3 (Principal, Atividades, Documentação) | OrgActivity[] | No | EPIC 11 |
| ActivityCockpit360 | `src/components/organization/ActivityCockpit360.tsx` | 5 (Info, BPM, Docs, Documentação, Sistemas) | OrgSystem[] | No | EPIC 11 |

### Supporting Infrastructure Cockpits

| Component | File Path | Tabs | Purpose | Status |
|-----------|-----------|------|---|---|
| ProjectCockpit | `src/components/project/ProjectCockpit.tsx` | 6 (Projeto, Atividade, Entregas, Histórico, Aprovadores, Orçamento) | Project management dashboard | Production |
| AgentCockpit | `src/components/agents/AgentCockpit.tsx` | 4 (Geral, Modelo, Persona, Métricas) | Agent configuration & metrics | Production |
| ModelCockpit | `src/components/lm-models/ModelCockpit.tsx` | 4 (Geral, Config, Governança, Documentação) | LLM model specification | Production |

### Metrics & Analytics Components

| Component | File Path | Chart Types | Status |
|-----------|-----------|---|---|
| AgentMetrics360 | `src/components/agents/AgentMetrics360.tsx` | Bar, Area | Production |
| ProcessMetricsCard | `src/components/organization/ProcessMetricsCard.tsx` | Bar, Line | EPIC 11 |
| ProcessMetricsHistory | `src/components/organization/ProcessMetricsHistory.tsx` | Area, Bar | EPIC 11 |
| KPICard | `src/components/dashboard/KPICard.tsx` | Card (no chart) | Production |

---

## Usage Guidelines

### When to Use Cockpit360

Use a Cockpit360 component when you need:
- Full 360° view of a single entity
- Multiple related data perspectives (principal, details, metrics, documentation)
- Hierarchical navigation (drilling down from parent to child entities)
- Tab-based organization with consistent styling

### When to Use Simpler Alternatives

Use simpler components when you need:
- Quick summary view (use legacy `EntityCockpit` without 360)
- Card-only grid (use `OrgEntityCard` directly)
- Metrics-only view (use `KPICard` or dedicated chart components)
- Form/dialog (use `OrgEntityFormSheet`)

### Best Practices

1. **Consistent Section Structure**
   - Always start with metadata (name, description, objective)
   - Follow with relationships (roles, child entities)
   - End with advanced details (metrics, documentation)

2. **Tab Organization**
   - Principal tab for entity metadata + quick actions
   - Detalhes/Details for advanced properties
   - Child entity tabs for hierarchical navigation
   - Métricas for performance metrics
   - Documentação for JSONB documentation fields

3. **Empty States**
   - Always include messaging for empty lists
   - Center text for visual balance
   - Use muted-foreground color for secondary text

4. **Action Buttons**
   - Place Edit/Delete buttons at top of principal tab
   - Use Plus icon + text for Create actions
   - Group related actions (Edit, Delete) together

5. **Icon Usage**
   - Pair icons with text labels (no icon-only buttons)
   - Use consistent icon library (Lucide React)
   - Match icon size to context (size-4 for inline, size-5 for section headers)

---

## Code References

**Key Files:**
- `src/components/dashboard/KPICard.tsx` — KPI card pattern
- `src/components/organization/AreaCockpit360.tsx` — Complete 360 example
- `src/components/organization/ProcessCockpit360.tsx` — Advanced 360 with metrics
- `src/components/organization/shared/` — Shared components library
- `src/components/ui/tabs.tsx` — Tab component (Shadcn)
- `src/components/ui/card.tsx` — Card component (Shadcn)

**Related Documentation:**
- `docs/architecture/ORGANIZATION-SCHEMA.md` — Data model for cockpits
- `docs/guides/AI-CONTEXT-ENGINEERING.md` — Context injection patterns
- `docs/v0.2.4-COMPONENT-API-REFERENCE.md` — Full component API

---

**Updated:** 2026-03-16
**Version:** 1.0 (EPIC 11 Phase 3)
**Author:** UX Design Expert (Uma)
