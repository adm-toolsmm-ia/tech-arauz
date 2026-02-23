# PRÓXIMAS AÇÕES: Integração FilterBar em Pages (Ordem Executável)

> **Responsável**: Claude | **Tempo estimado**: ~30-45 min | **Prioridade**: HIGH

---

## 📋 Checklist de Integração

### ✅ Parte 1: Preparação (JÁ FEITO)
- [x] Criar `filters-projetos.ts` com FilterRegistry
- [x] Criar `filters-cronogramas.ts` com FilterRegistry
- [x] Modernizar `useProjetosFilters` hook
- [x] Modernizar `useCronogramasFilters` hook
- [x] Rodar quality gates (lint, typecheck) → ✅ PASSOU

### ⏳ Parte 2: Integração em Pages
- [ ] **2.1** Integrar FilterBar em `projects-content.tsx`
- [ ] **2.2** Integrar FilterBar em `cronogramas-content.tsx`
- [ ] **2.3** Testar funcionamento (manual)
- [ ] **2.4** Quality gates finais

---

## 🎯 Passo-a-Passo: Integração em `projects-content.tsx`

### Arquivo: `src/app/projetos/projects-content.tsx`

#### Passo 1: Imports
Adicionar ao topo (após imports existentes):

```typescript
import { FilterBar } from '@/components/filters/FilterBar';
import { useProjetosFilters } from '@/hooks/useProjetosFilters';
```

#### Passo 2: Hook no Componente
Dentro de `ProjectsContent`, após `const [projects, setProjects]`:

```typescript
const {
  filters,
  search,
  viewMode,
  filteredData,
  updateFilter,
  setSearch,
  setViewMode,
  registry,
} = useProjetosFilters(projects);
```

#### Passo 3: Remover Código Antigo
Encontrar e remover/comentar:
```typescript
// REMOVE ISTO:
const filteredProjects = projects;  // ← Remover (linha ~146)
```

#### Passo 4: Renderizar FilterBar
Encontrar a seção de rendering (após `<DashboardHeader>`), adicionar:

```typescript
{/* Barra de Filtros */}
<FilterBar
  moduleId="projetos"
  filters={registry}
  currentFilters={filters}
  currentSearch={search}
  currentViewMode={viewMode}
  onUpdateFilter={updateFilter}
  onSearchChange={setSearch}
  onViewModeChange={setViewMode}
/>

{/* Rest of content */}
```

#### Passo 5: Usar `filteredData`
Encontrar onde os dados são passados para KanbanBoard/ListView:
- Trocar `projects` → `filteredData`
- Trocar `initialProjects` → `filteredData`

Exemplo:
```typescript
// ANTES:
<KanbanBoard data={projects} />

// DEPOIS:
<KanbanBoard data={filteredData} />
```

---

## 🎯 Passo-a-Passo: Integração em `cronogramas-content.tsx`

### Arquivo: `src/app/cronogramas/cronogramas-content.tsx`

**Mesma estrutura que Projetos**, mas com:

```typescript
import { FilterBar } from '@/components/filters/FilterBar';
import { useCronogramasFilters } from '@/hooks/useCronogramasFilters';

export function CronogramasContent({ schedules }) {
  const {
    filters,
    search,
    viewMode,
    filteredData,
    updateFilter,
    setSearch,
    setViewMode,
    registry,
  } = useCronogramasFilters(schedules);

  return (
    <>
      <DashboardHeader title="Cronogramas" />

      <FilterBar
        moduleId="cronogramas"
        filters={registry}
        currentFilters={filters}
        currentSearch={search}
        currentViewMode={viewMode}
        onUpdateFilter={updateFilter}
        onSearchChange={setSearch}
        onViewModeChange={setViewMode}
      />

      {/* Render filteredData instead of schedules */}
      <ListView data={filteredData} />
    </>
  );
}
```

---

## 🔍 Validação Checklist

Após cada integração, validar:

- [ ] Componente renderiza sem erros de console
- [ ] FilterBar aparece na página
- [ ] Quick filters aparecem na barra
- [ ] Clicar em quick filter → abre Popover (se inactive) ou limpa (se active)
- [ ] Advanced sheet abre ao clicar "Filters"
- [ ] Dados filtram quando seleciona opção
- [ ] Pesquisa funciona
- [ ] View mode toggle funciona (Kanban ↔ Lista)
- [ ] Ao refresh página: filtros restauram do localStorage

---

## ⚠️ Possíveis Erros & Soluções

| Erro | Solução |
|------|---------|
| "Cannot read property 'map' of undefined" | Verificar se `registry` foi passado ao FilterBar |
| Filtros não aparecem | Verificar se `filterDefinitionsProjetos` está exportado em `filters-projetos.ts` |
| TypeScript error em `filteredData` | Garantir que `useProjetosFilters` retorna `filteredData` (verify in hook) |
| Componentes não existem | Verificar se `FilterBar`, `FilterControl` estão em `src/components/filters/` |

---

## 📊 Estrutura Visual Esperada

```
┌────────────────────────────────────────────┐
│         DashboardHeader (Título)           │
├────────────────────────────────────────────┤
│                                            │
│  [Search] [Status ▼] [Prioridade ▼] [Filters] [Reset]
│                                            │ ← FilterBar
│     [Icon: Days]  [Icon: List]             │
│                                            │
├────────────────────────────────────────────┤
│                                            │
│        [Kanban/Lista com dados]            │
│        (usando filteredData)               │
│                                            │
└────────────────────────────────────────────┘
```

---

## 🚀 Ordem Recomendada de Execução

1. ✅ **Criar filters-projetos.ts** (JÁ FEITO)
2. ✅ **Criar filters-cronogramas.ts** (JÁ FEITO)
3. ✅ **Modernizar hooks** (JÁ FEITO)
4. ⏳ **Integrar em projects-content.tsx** (PRÓXIMO)
5. ⏳ **Integrar em cronogramas-content.tsx** (DEPOIS)
6. ⏳ **Rodar testes + quality gates** (FINAL)
7. ⏳ **Validação manual** (CONFIRMAÇÃO)

---

## 📌 Links de Referência Rápida

- **Exemplo de integração**: `.context/07-filter-data-context.md` (seção "Passo 3: Integrar em Página")
- **Arquivos modificados**: `.context/08-refactor-status-phase2-2026-02-23.md`
- **Schema de dados**: `.context/05-data-schema-projects-schedules.md`
- **Mapa de filtros**: `.context/06-filter-mapping-projetos-cronogramas.md`

---

**Status**: 🎯 **PRONTO PARA EXECUTAR INTEGRAÇÃO** | Quer que eu comece? ✨
