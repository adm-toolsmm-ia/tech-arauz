# Arquitetura de Filtros - Guia Completo

> **Versão**: 1.0 | **Data**: 2026-02-23 | **Status**: Stable

## Objetivo

Documentar a arquitetura unificada de filtros para o Tech Arauz, estabelecendo padrões reutilizáveis para todos os módulos que implementarem filtros avançados.

---

## Stack Tecnológico

| Camada | Tecnologia | Descrição |
|--------|-----------|-----------|
| **UI Components** | shadcn/ui | Componentes estilizados com Tailwind |
| **State Management** | React Hooks | `useFilterState`, `useFilterUrlSync` |
| **Persistence** | localStorage | Chave: `filters-{moduleId}` |
| **Data Filtering** | Utilities (TS) | `applyFilters`, `clearFilters`, etc. |
| **Type Safety** | TypeScript | `FilterDefinition`, `FilterState`, `FilterRegistry` |

---

## Componentes Principais

### 1. FilterBar (Presentation Component)

**Arquivo**: `src/components/filters/FilterBar.tsx`

**Responsabilidades**:
- Renderizar UI integrada: search + quick filters + advanced sheet + view mode
- Aceitar callbacks para estado (controlled component)
- Não gerencia estado próprio (delegação)

**Props Principais**:
```typescript
interface FilterBarProps {
  moduleId: string;
  filters: FilterRegistry;
  onFiltersChange?: (filters: FilterState) => void;
  onSearchChange?: (search: string) => void;
  onViewModeChange?: (mode: string) => void;
  initialFilters?: FilterState;
  initialSearch?: string;
  initialViewMode?: string;
  className?: string;
}
```

**Seções da UI**:
1. **Search Bar** - Input de texto para busca global
2. **Quick Filters** - Botões com Popover para seleção rápida (ativados com Popover, desativados com clear)
3. **Advanced Filters** - Sheet deslizante com FilterControl para cada filtro
4. **View Mode Selector** - Toggle entre Kanban/Lista/etc
5. **Reset Button** - Limpa todos os filtros
6. **Active Count Badge** - Exibe número de filtros ativos

---

### 2. FilterControl (Compound Component)

**Arquivo**: `src/components/filters/FilterControl.tsx`

**Responsabilidades**:
- Renderizar controles específicos por tipo de filtro
- Suportar múltiplos tipos: select, multi-select, checkbox (switch), date-range, slider, tags

**Tipos Suportados**:

| Tipo | Componente | Valor |
|------|-----------|--------|
| `select` | Select (shadcn) | string \| number |
| `multi-select` | Select + Badge | string[] \| number[] |
| `checkbox` | Switch (shadcn) | boolean |
| `date-range` | 2x Input[type=date] | { start: string, end: string } |
| `slider` | Input[type=range] | number |
| `tags` | Input + Badge | string[] |

---

### 3. useFilterState (State Hook)

**Arquivo**: `src/hooks/useFilterState.ts`

**Responsabilidades**:
- Gerenciar estado de filtros (filters, search, viewMode)
- Persistência em localStorage (configurável)
- Callbacks para sincronização com parent
- Derivações (activeFilterCount, hasActiveFilters, isFiltersEmpty)

**Interface**:
```typescript
interface UseFilterStateOptions {
  moduleId: string;
  definitions: FilterDefinition[];
  persistence?: FilterPersistenceConfig;
  onFiltersChange?: (filters: FilterState) => void;
  onSearchChange?: (search: string) => void;
  onViewModeChange?: (mode: string) => void;
}

interface UseFilterStateReturn {
  filters: FilterState;
  search: string;
  viewMode: string;
  definitions: FilterDefinition[];
  setFilters: (filters: FilterState) => void;
  updateFilter: (filterId: string, value: any) => void;
  setSearch: (search: string) => void;
  setViewMode: (mode: string) => void;
  resetAllFilters: () => void;
  clearFilters: (filterIds?: string[]) => void;
  activeFilterCount: number;
  hasActiveFilters: boolean;
  isFiltersEmpty: boolean;
}
```

---

### 4. useModuleFilters (Domain Hook)

**Arquivo**: `src/hooks/useModuleFilters.ts`

**Responsabilidades**:
- Combina `useFilterState` + `applyFilters` + data filtering
- Abstração de alto nível para módulos

**Exemplo**:
```typescript
const { filters, filteredData, ...rest } = useModuleFilters({
  moduleId: 'projetos',
  data: projects,
  definitions: filterDefinitionsProjetos,
});
```

---

## Tipos de Dados

### FilterDefinition

Define a estrutura de um filtro individual.

```typescript
interface FilterDefinition {
  id: string;                           // Identificador único (ex: 'status')
  label: string;                        // Rótulo exibido
  type: FilterControlType;              // 'select' | 'multi-select' | 'checkbox' | etc
  options?: FilterOption[] | (() => FilterOption[]);  // Opções estáticas ou dinâmicas
  defaultValue?: any;                   // Valor inicial (padrão: null ou [])
  multi?: boolean;                      // Suporta múltiplas seleções?
  quickFilter?: boolean;                // Exibe na barra rápida?
  quickFilterLimit?: number;            // Máx opções no popover da barra rápida (ex: 5)
  group?: string;                       // Agrupamento para organização (ex: 'advanced' ou 'viewMode')
  description?: string;                 // Tooltip quando inativo
  icon?: React.ComponentType<{ className?: string }>;  // Ícone Lucide
}
```

### FilterRegistry

Agrupa todas as definições de um módulo.

```typescript
interface FilterRegistry {
  moduleId: string;
  filters: FilterDefinition[];
  viewModes?: { id: string; label: string; icon?: any }[];
}
```

### FilterState

Estado atual dos filtros aplicados.

```typescript
type FilterState = Record<string, any>;
// Exemplo: { status: 'active', priority: ['high', 'medium'], dateRange: { start: '2026-01-01', end: '2026-12-31' } }
```

---

## Fluxo de Dados

```
┌─────────────────────────────────────────────┐
│         Module Page Component               │
│   (ex: projects-content.tsx)                │
└────────────┬────────────────────────────────┘
             │
             ├─ useFilterState(moduleId, definitions)
             │  └─ returns: filters, search, viewMode, etc
             │
             ├─ useModuleFilters(data, definitions)
             │  └─ returns: filteredData, ...
             │
             └─ <FilterBar 
                  filters={filterRegistry}
                  onFiltersChange={handleFilterChange}
                  onSearchChange={handleSearchChange}
                />
                  │
                  ├─ <SearchBar />
                  ├─ <QuickFilterButton /> (x N)
                  │  └─ <Popover>
                  │     └─ <Button onClick={applyFilter} />
                  ├─ <Sheet (Advanced)>
                  │  └─ <FilterControl /> (x M)
                  ├─ <ViewModeSelector />
                  └─ <ResetButton />
```

---

## Estratégia de Persistência

### v1.0: localStorage

**Chave**: `filters-{moduleId}`

**Implementação**:
```typescript
const { filters } = useFilterState({
  moduleId: 'projetos',
  definitions: filterDefinitionsProjetos,
  persistence: {
    enabled: true,
    storageKey: 'filters-projetos',  // Opcional, default gerado
  },
});
```

**Comportamento**:
1. No mount, restaura filters do localStorage
2. Ao alterar filtro, persiste imediatamente
3. Persiste entre sessões (mesma aba, novo refresh)

### v1.1+: URL Query Parameters (Futuro)

**Chave**: Query params na URL

**Exemplo**: `?status=active&priority=high`

**Implementação Futura**:
```typescript
const { filters } = useFilterUrlSync({
  moduleId: 'projetos',
  definitions: filterDefinitionsProjetos,
  debounceMs: 500,  // Aguarda pausa antes de atualizar URL
});
```

**Vantagens**:
- Compartilhável entre usuários/abas
- Bookmark-able
- Histórico integrado

**Trade-off**: URL fica poluída

---

## Utilitários (filter-utils.ts)

| Função | Assinatura | Descrição |
|--------|-----------|-----------|
| `applyFilters` | `(data, filters, options?) => T[]` | Filtra array baseado em FilterState |
| `resetFilters` | `(definitions) => FilterState` | Retorna estado "zerado" com defaults |
| `clearFilters` | `(filters, definitions, ids?) => FilterState` | Limpa filtros específicos |
| `persistFilters` | `(key, filters) => void` | Salva em localStorage |
| `restoreFilters` | `(key, definitions) => FilterState` | Restaura de localStorage |
| `countActiveFilters` | `(filters, definitions) => number` | Conta quantos filtros estão ativos |
| `getActiveFilterInfo` | `(filters, definitions) => ActiveFilterInfo` | Retorna resumo dos filtros ativos |
| `areFiltersEqual` | `(filters1, filters2) => boolean` | Compara dois FilterStates |

---

## Checklist de Implementação para Novos Módulos

Ao adicionar filtros em um novo módulo:

- [ ] 1. Criar `filters-{modulo}.ts` com `FilterRegistry` e `FilterDefinition[]`
- [ ] 2. Criar hook `use{Modulo}Filters` que chama `useModuleFilters`
- [ ] 3. Integrar `<FilterBar>` na página do módulo
- [ ] 4. Conectar callbacks: `onFiltersChange`, `onSearchChange`, `onViewModeChange`
- [ ] 5. Passar `filteredData` ao componente de visualização
- [ ] 6. Testar persistência (localStorage)
- [ ] 7. Testar pesquisa e filtros rápidos
- [ ] 8. Testar reset e clear de filtros
- [ ] 9. Testes unitários para applyFilters com dados do módulo

---

## Exemplos

### Exemplo 1: Filtros de Projetos

**Arquivo**: `src/lib/filters/filters-projetos.ts`
```typescript
export const filterDefinitionsProjetos: FilterDefinition[] = [
  {
    id: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Em Desenvolvimento', value: 'em_desenvolvimento' },
      { label: 'Em Homologação', value: 'em_homologacao' },
    ],
    quickFilter: true,
    icon: CircleCheck,
  },
  {
    id: 'priority',
    label: 'Prioridade',
    type: 'multi-select',
    options: [
      { label: 'Alta', value: 'alta' },
      { label: 'Média', value: 'media' },
    ],
    quickFilter: true,
  },
];
```

**Hook**: `src/hooks/useProjetosFilters.ts`
```typescript
export function useProjetosFilters(projects: Project[]) {
  return useModuleFilters({
    moduleId: 'projetos',
    data: projects,
    definitions: filterDefinitionsProjetos,
    searchFields: ['titulo', 'descricao'],
  });
}
```

**Página**: `src/app/projetos/projetos-content.tsx`
```typescript
function ProjetosContent() {
  const { filters, filteredData, updateFilter } = useProjetosFilters(projects);
  
  return (
    <>
      <FilterBar
        moduleId="projetos"
        filters={{ filters: filterDefinitionsProjetos }}
        onFiltersChange={updateFilter}
      />
      <KanbanBoard data={filteredData} />
    </>
  );
}
```

---

## Referências de Código

| Arquivo | Responsabilidade |
|---------|------------------|
| `src/lib/filters/filter-types.ts` | Tipos centralizados |
| `src/lib/filters/filter-utils.ts` | Utilitários reutilizáveis |
| `src/components/filters/FilterBar.tsx` | Componente UI principal |
| `src/components/filters/FilterControl.tsx` | Controles por tipo |
| `src/hooks/useFilterState.ts` | State management |
| `src/hooks/useModuleFilters.ts` | Abstração por módulo |
| `src/lib/filters/filters-projetos.ts` | Definições: Projetos |
| `src/lib/filters/filters-cronogramas.ts` | Definições: Cronogramas |

---

## FAQ

**P: Devo usar localStorage ou URL?**

R: v1.0 usa localStorage (mais simples). URL será suportado em v1.1 para casos de compartilhamento.

**P: Como adiciono um novo tipo de filtro?**

R: Estenda `FilterControlType` em `filter-types.ts`, crie controle em `FilterControl.tsx`, e documente em `component-patterns.md`.

**P: Posso ter filtros que dependem de outros?**

R: Atualmente não. Considere criar definições dinâmicas com funções `options: () => [...]`.

---

**Última Atualização**: 2026-02-23 | **Mantedor**: @dev
