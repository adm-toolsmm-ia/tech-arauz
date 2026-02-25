# 📐 PADRÃO DE COMPONENTES — Módulos Agentes & Auxiliares

## ✅ OBJETIVOS DESTA PADRONIZAÇÃO

1. **Alinhamento 100%** com módulo de `projetos` (padrão validado)
2. **Reutilização de componentes** já existentes (FilterBar, ViewToggle, etc)
3. **UX/UI consistente** entre todos os módulos
4. **Facilidade de manutenção** futura

---

## 🎯 ESTRUTURA PADRÃO — Módulo Completo

### Hierarquia de Componentes (OBRIGATÓRIA)

```
page.tsx (Server)
  └─ -content.tsx (Client)
    ├─ DashboardHeader (info geral)
    ├─ KPICard x4 (métricas)
    ├─ FilterBar (filtros + search + view toggle)
    ├─ ViewToggle (Kanban / Lista / Grid)
    ├─ KanbanBoard OU ListViewComponent (dados)
    ├─ XxxCard (card individual - grid/kanban)
    └─ SplitView (detalhe ao lado - OPCIONAL)
```

### Componentes REUTILIZÁVEIS (PROIBIDO duplicar)

```
✅ FilterBar — Filtros + Search + View Toggle + Refresh
   Localização: src/components/filters/FilterBar.tsx
   Uso: Projetos, Agentes, Tipos de Agentes, LM Providers

✅ ViewToggle — Toggle Kanban/Lista/Grid
   Localização: src/components/views/ViewToggle.tsx
   
✅ KanbanBoard — Board com swimlanes
   Localização: src/components/views/KanbanBoard.tsx
   
✅ KPICard — Cards de métrica
   Localização: src/components/dashboard/KPICard.tsx
   
✅ SplitView — Visão 360° lado a lado
   Localização: src/components/views/SplitView.tsx
   
✅ DashboardHeader — Título + Subtitle
   Localização: src/components/layout/DashboardHeader.tsx
```

---

## 📊 EXEMPLO PADRÃO — /projetos (REFERÊNCIA)

### 1. **FilterBar Integration**
```typescript
<FilterBar
  items={projects}
  onFilterChange={(filtered) => setFilteredProjects(filtered)}
  searchPlaceholder="Buscar por nome, código..."
  viewMode={viewMode}
  onViewModeChange={setViewMode}
  onRefresh={handleRefresh}
  additionalFilters={[
    { label: 'Status', key: 'status', options: STATUS_OPTIONS },
    { label: 'Fase', key: 'phase', options: PHASE_OPTIONS }
  ]}
/>
```

### 2. **ViewToggle (Inside FilterBar)**
```typescript
// FilterBar já inclui ViewToggle internamente
// Suporta: 'kanban' | 'list' | 'grid'
```

### 3. **Kanban View**
```typescript
<KanbanBoard
  items={filteredProjects}
  onStatusChange={handleStatusChange}
  renderCard={(project) => <ProjectKanbanCard project={project} />}
  groupBy="phase"
/>
```

### 4. **List View**
```typescript
<ProjectListView
  projects={filteredProjects}
  onSelect={(project) => setSelectedProject(project)}
/>
```

### 5. **SplitView (360°)**
```typescript
<SplitView
  item={selectedProject}
  renderDetail={(project) => <ProjectCockpit project={project} />}
/>
```

---

## 🔄 MAPEAMENTO — Agentes vs Padrão Projetos

| Elemento | Projetos | Agentes | Tipos de Agentes | LM Providers |
|----------|----------|---------|------------------|--------------|
| **Header** | DashboardHeader ✅ | DashboardHeader ✅ | DashboardHeader ✅ | DashboardHeader ✅ |
| **KPIs** | KPICard x4 ✅ | AgentKPIs ❌ (custom) | Simples ⚠️ | Simples ⚠️ |
| **FilterBar** | FilterBar ✅ | Manual Select ❌ | Manual Input ❌ | Manual Input ❌ |
| **ViewToggle** | ViewToggle ✅ | Tabs (manual) ❌ | N/A | N/A |
| **Kanban** | KanbanBoard ✅ | N/A | N/A | N/A |
| **List** | ProjectListView ✅ | Grid (custom) ❌ | Table (custom) ❌ | Table (custom) ❌ |
| **Card** | ProjectCard ✅ | AgentCard (partial) ⚠️ | Table row ❌ | Table row ❌ |
| **Detail/360°** | ProjectCockpit ✅ | agent-edit-content ⚠️ | N/A | N/A |

---

## ❌ PROBLEMAS IDENTIFICADOS

### 1. **FilterBar NÃO está em Agentes**
```typescript
// ATUAL (ERRADO)
<Select value={filters.status}>
  <SelectItem value="draft">Rascunho</SelectItem>
  ...
</Select>

// CORRETO
<FilterBar
  items={agents}
  additionalFilters={[
    { label: 'Status', options: STATUS_OPTIONS },
    { label: 'Tipo', options: TYPE_OPTIONS }
  ]}
/>
```

### 2. **ViewToggle Manual em Agentes**
```typescript
// ATUAL (ERRADO)
<Tabs value={viewMode} onValueChange={setViewMode}>
  <TabsTrigger value="grid">Grid</TabsTrigger>
  <TabsTrigger value="list">Lista</TabsTrigger>
</Tabs>

// CORRETO
<ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
```

### 3. **Kanban NÃO implementado em Agentes**
```typescript
// FALTA: KanbanBoard para visão por STATUS/TIPO
<KanbanBoard items={agents} groupBy="status" />
```

### 4. **AgentCard não segue ProjectCard**
```typescript
// ProjectCard tem: nome, código, status badge, data, ações dropdown
// AgentCard falta: dropdown consistente, spacing

// Veja ProjectKanbanCard para padrão correto
```

### 5. **Agent Type Management sem padrão**
```typescript
// ERRADO: Simples lista sem FilterBar/ViewToggle
// CORRETO: Usar mesma estrutura de Projetos
```

### 6. **Refresh não funciona em lista**
```typescript
// PROBLEMA: router.refresh() não atualiza estado local
// SOLUÇÃO: Usar React Query com invalidateQueries()
```

---

## ✅ SOLUÇÃO — PADRONIZAÇÃO COMPLETA

### A. Remover componentes customizados
- ❌ Delete: `src/components/agents/AgentKPIs.tsx` (usar KPICard)
- ❌ Simplify: `CreateAgentDialog.tsx` (já está OK)
- ❌ Delete: `src/components/agents/AgentCard.tsx` (usar padrão)

### B. Usar componentes compartilhados
- ✅ Import: `FilterBar` from `@/components/filters/FilterBar`
- ✅ Import: `ViewToggle` from `@/components/views/ViewToggle`
- ✅ Import: `KanbanBoard` from `@/components/views/KanbanBoard`
- ✅ Import: `KPICard` from `@/components/dashboard/KPICard`

### C. Criar componentes específicas (mínimas)
- ✅ Create: `AgentKanbanCard` (simples — nome, tipo, status)
- ✅ Create: `AgentListView` (usa table padrão)
- ✅ Reuse: `SplitView` para detalhe 360°

### D. Estrutura Final

```
src/components/agents/
├── CreateAgentDialog.tsx      ✅ (MANTER — já padrão)
├── AgentKanbanCard.tsx        ✅ NEW (simples card)
├── AgentListView.tsx          ✅ NEW (table)
└── (DELETE: AgentCard, AgentKPIs, BudgetGauge, TraceList, TraceTimeline)

src/app/agentes/
├── layout.tsx                 ✅ (com SidebarProvider)
├── page.tsx                   ✅ (Server component)
└── agentes-content.tsx        ✅ REFACTOR (usar FilterBar + ViewToggle)

src/app/auxiliares/agent-types/
├── page.tsx                   ✅ (Server)
└── agent-types-content.tsx    ✅ REFACTOR (usar FilterBar)

src/app/auxiliares/lm-providers/  ✅ NEW MODULE
├── page.tsx                   ✅ (Server)
└── lm-providers-content.tsx   ✅ (usa FilterBar)
```

---

## 🏗️ IMPLEMENTAÇÃO — Passo a Passo

### Fase 1: Refatorar agentes-content.tsx
1. Remover Select/Tabs manual
2. Integrar FilterBar
3. Integrar ViewToggle
4. Usar KPICard em loop
5. Criar AgentKanbanCard simples

### Fase 2: Refatorar agent-types-content.tsx
1. Integrar FilterBar
2. Usar KPICard para contadores
3. Criar tabela simples (Table component)

### Fase 3: Criar lm-providers module
1. Nova tabela auxiliar: `lm_providers`
2. Usar mesma estrutura de agent-types

---

## 📋 CHECKLIST POR MÓDULO

### ✅ /agentes
- [ ] Remove AgentKPIs.tsx
- [ ] Create AgentKanbanCard.tsx
- [ ] Create AgentListView.tsx
- [ ] Refactor agentes-content.tsx com FilterBar
- [ ] Integrar KanbanBoard por status/tipo
- [ ] Integrar ViewToggle (Kanban/List/Grid)
- [ ] Use KPICard x4 para métricas
- [ ] Card detail abre SplitView (tipo ProjectCockpit)

### ✅ /auxiliares/agent-types
- [ ] Integrar FilterBar
- [ ] Use KPICard x3 (Total, Ativo, Sistema)
- [ ] Create table view simples
- [ ] Botão "Novo Tipo" → Dialog
- [ ] Actions: Editar, Deletar (só não-sistema)

### ✅ /auxiliares/lm-providers (NOVO)
- [ ] Create page.tsx (server)
- [ ] Create lm-providers-content.tsx
- [ ] Integrar FilterBar
- [ ] Create table com Providers + Modelos
- [ ] Botão "Novo Provedor"

---

## 🎨 UX/UI PADRÃO

### Card (Grid View)
```
┌─────────────────────────────┐
│ 🤖 Nome do Agente           │
│ ────────────────────────────│
│ Descrição curta             │
│ ────────────────────────────│
│ Model: gpt-4  │  Tipo: 📊  │
│ ────────────────────────────│
│ Execuções: 5  │ Atualizado │
│ ────────────────────────────│
│ [Badge Status] [⋮ Actions] │
└─────────────────────────────┘
```

### List View (Table)
```
│ Nome     │ Tipo     │ Model   │ Status  │ Ações │
├──────────┼──────────┼─────────┼─────────┼───────┤
│ Agent 1  │ 📊 Status│ gpt-4   │ Draft   │ ⋮     │
```

### Kanban View
```
DRAFT          PUBLISHED       DEPRECATED
┌────────┐    ┌────────┐      ┌────────┐
│ Agent 1│    │ Agent 2│      │ Agent 3│
│ 📊     │    │ 📋     │      │ 🔍     │
└────────┘    └────────┘      └────────┘
```

---

## 📝 NOTA IMPORTANTE

**Todos os módulos DEVEM usar:**
1. ✅ DashboardHeader
2. ✅ FilterBar (centralizado)
3. ✅ KPICard (para métricas)
4. ✅ ViewToggle (se múltiplas views)
5. ✅ KanbanBoard (se grouping por status/fase)
6. ✅ SplitView (para detalhe 360°)

**NUNCA implementar:**
- ❌ Select/Input manual para filtros
- ❌ Custom cards sem seguir padrão
- ❌ Tabs para view toggle
- ❌ Duplicar lógica de FilterBar

---

**Data:** 2026-02-24
**Responsável:** Uma (UX Expert) + Aria (Architect)
**Status:** 🟡 AGUARDANDO IMPLEMENTAÇÃO
