# CÓDIGO-PRONTO: Snippets para Integração

> **Como usar**: Copy-paste direto em `projects-content.tsx` e `cronogramas-content.tsx`

---

## 🎯 projects-content.tsx

### ✏️ Passo 1: Adicionar Imports (no topo)

```typescript
// Adicione após os imports existentes:
import { FilterBar } from '@/components/filters/FilterBar';
import { useProjetosFilters } from '@/hooks/useProjetosFilters';
```

### ✏️ Passo 2: Adicionar Hook (dentro do componente)

Encontre a função `ProjectsContent` e logo após `const [projects, setProjects]`, adicione:

```typescript
export function ProjectsContent({
  projects: initialProjects,
  isLoading = false,
}: ProjectsContentProps) {
  const [projects, setProjects] = React.useState<Project[]>(initialProjects);
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<ViewMode>('kanban');

  // ✨ ADICIONE ISTO: ✨
  const {
    filters,
    search,
    viewMode: filterViewMode,
    filteredData,
    updateFilter,
    setSearch,
    setViewMode: setFilterViewMode,
    registry,
  } = useProjetosFilters(projects);

  // Use filter view mode if available, fallback to old viewMode
  const activeViewMode = filterViewMode || viewMode;
  const handleViewModeChange = (mode: string) => {
    setFilterViewMode(mode);
    setViewMode(mode as ViewMode);
  };

  React.useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  // REMOVA OU COMENTE:
  // const filteredProjects = projects;

  // ...resto do componente
}
```

### ✏️ Passo 3: Renderizar FilterBar

Encontre onde está `<DashboardHeader>` e logo após adicione:

```typescript
<DashboardHeader title="Projetos" subtitle="Gestão de Projetos TI" />

{/* ✨ ADICIONE FilterBar AQUI: ✨ */}
<FilterBar
  moduleId="projetos"
  filters={registry}
  currentFilters={filters}
  currentSearch={search}
  currentViewMode={activeViewMode}
  onUpdateFilter={updateFilter}
  onSearchChange={setSearch}
  onViewModeChange={handleViewModeChange}
/>

{/* Rest of content continues */}
```

### ✏️ Passo 4: Usar `filteredData`

Encontre onde `projects` é passado para KanbanBoard ou ListView, e troque:

```typescript
// ANTES:
<KanbanBoard 
  data={projects}  // ❌ Remova isto
  // ...
/>

// DEPOIS:
<KanbanBoard 
  data={filteredData}  // ✅ Use isto
  // ...
/>
```

---

## 🎯 cronogramas-content.tsx

### ✏️ Passo 1: Adicionar Imports

```typescript
import { FilterBar } from '@/components/filters/FilterBar';
import { useCronogramasFilters } from '@/hooks/useCronogramasFilters';
```

### ✏️ Passo 2: Adicionar Hook

```typescript
export function CronogramasContent({ schedules: initialSchedules }: CronogramasContentProps) {
  const [schedules, setSchedules] = React.useState<Schedule[]>(initialSchedules);

  // ✨ ADICIONE ISTO: ✨
  const {
    filters,
    search,
    filteredData,
    updateFilter,
    setSearch,
    registry,
  } = useCronogramasFilters(schedules);

  React.useEffect(() => {
    setSchedules(initialSchedules);
  }, [initialSchedules]);

  // ...resto do componente
}
```

### ✏️ Passo 3: Renderizar FilterBar

```typescript
<DashboardHeader title="Cronogramas" />

{/* ✨ ADICIONE FilterBar: ✨ */}
<FilterBar
  moduleId="cronogramas"
  filters={registry}
  currentFilters={filters}
  currentSearch={search}
  onUpdateFilter={updateFilter}
  onSearchChange={setSearch}
/>

{/* Content continues */}
```

### ✏️ Passo 4: Usar `filteredData`

```typescript
// ANTES:
<ListView data={schedules} />

// DEPOIS:
<ListView data={filteredData} />
```

---

## ✅ Validação Rápida

Após alterações, abrir browser DevTools e verificar:

```javascript
// Console: F12 → Console tab
localStorage.getItem('filters-projetos')   // Deve retornar JSON
localStorage.getItem('filters-cronogramas')  // Deve retornar JSON
```

Esperado:
```json
{
  "status": ["Em Desenvolvimento", "Em Homologação"],
  "prioridade": ["Alta"],
  "responsavel": ["João Silva"]
}
```

---

## 🔍 Troubleshooting

| Problema | Solução |
|----------|---------|
| "Cannot read property 'map' of undefined" | Verificar se `registry` está sendo retornado do hook |
| Filtros não aparecem na barra | Verificar se `FilterBar` component existe em `src/components/filters/` |
| Dados não filtram | Verificar console se há erros; validar `filteredData` no DevTools |
| TypeScript error | Confirmar que tipos estão importados em hooks |

---

## 📊 Arquitetura Visual Final

```
apps/projetos/projects-content.tsx
│
├─ useProjetosFilters(projects) ← Hook novo
│  │
│  ├─ filterDefinitionsProjetos (6 filtros)
│  ├─ useFilterState (state management)
│  ├─ applyFilters (logic)
│  └─ returns: {filteredData, registry, ...}
│
├─ <FilterBar filters={registry} /> ← Componente UI
│  │
│  └─ Quick Filters + Advanced + Search
│
└─ <KanbanBoard data={filteredData} /> ← Dados filtrados

                                    ↓ localStorage
                              filters-projetos
```

---

## 🎯 Ordem Sugerida

1. ✅ Copy imports
2. ✅ Copy hook call
3. ✅ Copy FilterBar JSX
4. ✅ Trocar `projects` → `filteredData`
5. ✅ Testar no browser
6. ✅ Repeat para cronogramas

---

**Status**: 🚀 **PRONTO PARA INTEGRAÇÃO IMEDIATA**

Quer que eu execute isto agora? 👇
