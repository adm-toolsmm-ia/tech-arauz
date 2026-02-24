# Filter Data Context - Projetos & Cronogramas (Fase 2)

> **Status**: Ready for Implementation | **Versão**: 1.0-final | **Data**: 2026-02-23
>
> **Objetivo**: Consolidar análise de dados + mapeamento de filtros para refatoração completa dos módulos Projetos e Cronogramas

---

## 📋 Sumário Executivo

**O que foi documentado**:

1. ✅ **Arquitetura de Filtros** (Fase 1) - `04-filter-architecture.md`
   - Stack tecnológico
   - Componentes principais
   - Padrões de persistência
   - Guia de implementação

2. ✅ **Schema de Dados** - `05-data-schema-projects-schedules.md`
   - Campos filtráveis em projects
   - Campos filtráveis em project_schedules
   - Valores enumeados
   - Query patterns otimizados

3. ✅ **Mapa de Filtros** - `06-filter-mapping-projetos-cronogramas.md`
   - Quick filters recomendados
   - Advanced filters
   - Colunas de visualização
   - Mapeamento UI ↔ DB

**Próximo Passo**: Executar refatoração usando este contexto consolidado

---

## 🎯 Escopo de Refatoração

### Módulo: Projetos (`src/app/projetos/`)

#### Eliminar (Remover Código Antigo)
- ❌ Filtros inline em `projects-content.tsx`
- ❌ Estado local não persistido
- ❌ Componentes SearchAndFilterBar (já removido)
- ❌ AdvancedFilters (já removido)

#### Criar (Novos Componentes/Hooks)
- ✅ `src/lib/filters/filters-projetos.ts` - FilterRegistry completo
- ✅ `src/hooks/useProjetosFilters.ts` - Hook de domínio
- ✅ Integração `<FilterBar>` em `projects-content.tsx`

#### Modificar (Adaptar Existente)
- 🔄 `projects-content.tsx` - Usar FilterBar + useProjetosFilters
- 🔄 Kanban/Lista componentes - Receber data já filtrada

---

### Módulo: Cronogramas (`src/app/cronogramas/`)

#### Eliminar
- ❌ Filtros antigos/desalinhados

#### Criar
- ✅ `src/lib/filters/filters-cronogramas.ts` - FilterRegistry
- ✅ `src/hooks/useCronogramasFilters.ts` - Hook de domínio
- ✅ Integração `<FilterBar>` em `cronogramas-content.tsx`

#### Modificar
- 🔄 `cronogramas-content.tsx` - Usar FilterBar + useCronogramasFilters

---

## 📊 Arquitetura de Dados Proposta

```
┌─────────────────────────────────────────────────────────┐
│                   Página: ProjetosContent               │
│                   (Server Component)                    │
└──────────────────┬──────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
   ┌────▼────────┐  ┌────────▼───────┐
   │ Client Cmp: │  │ Client Cmp:    │
   │ ProjetosUI  │  │ FilterBar      │
   └────┬────────┘  └────────┬───────┘
        │                    │
        │         ┌──────────┴──────────┐
        │         │                     │
        │    ┌────▼─────────┐   ┌──────▼─────────┐
        │    │ useFilter    │   │ useModuleFilters│
        │    │ State (state)│   │(state + logic) │
        │    └────┬─────────┘   └────┬──────────┘
        │         │                  │
        │    ┌────▼─────────────────┴────┐
        │    │   filterDefinitionsProjetos│
        │    │   (FilterRegistry)        │
        │    └──────────────────────────┘
        │
        │   (passa: filteredData)
        │
   ┌────▼────────────────────┐
   │ KanbanBoard / ListView   │
   │ (renderiza dados)        │
   └─────────────────────────┘
```

---

## 🔧 Implementação Passo a Passo

### Passo 1: Criar Filter Definitions

**Arquivo**: `src/lib/filters/filters-projetos.ts`

```typescript
import { FilterDefinition, FilterRegistry } from './filter-types';
import { CheckCircle2, AlertCircle, Users, Calendar } from 'lucide-react';

export const filterDefinitionsProjetos: FilterDefinition[] = [
  {
    id: 'status',
    label: 'Status',
    type: 'multi-select',
    options: [
      { label: 'Novo', value: 'Novo' },
      { label: 'Em Análise', value: 'Em Análise' },
      { label: 'Em Desenvolvimento', value: 'Em Desenvolvimento' },
      { label: 'Em Homologação', value: 'Em Homologação' },
      { label: 'Concluído', value: 'Concluído' },
      { label: 'Cancelado', value: 'Cancelado' },
      { label: 'Suspenso', value: 'Suspenso' },
    ],
    quickFilter: true,
    icon: CheckCircle2,
    description: 'Filtrar por status do projeto',
    multi: true,
  },
  {
    id: 'prioridade',
    label: 'Prioridade',
    type: 'multi-select',
    options: [
      { label: 'Baixa', value: 'Baixa' },
      { label: 'Normal', value: 'Normal' },
      { label: 'Alta', value: 'Alta' },
    ],
    quickFilter: true,
    icon: AlertCircle,
    multi: true,
  },
  {
    id: 'responsavel',
    label: 'Responsável',
    type: 'multi-select',
    options: [], // Dinâmico (ver hook)
    quickFilter: true,
    icon: Users,
    multi: true,
  },
  {
    id: 'prazo_final',
    label: 'Prazo Final',
    type: 'date-range',
    quickFilter: true,
    icon: Calendar,
  },
  {
    id: 'categoria',
    label: 'Categoria',
    type: 'multi-select',
    options: [], // Dinâmico
    multi: true,
  },
  {
    id: 'created_at',
    label: 'Data de Criação',
    type: 'date-range',
  },
];

export const filterRegistryProjetos: FilterRegistry = {
  moduleId: 'projetos',
  filters: filterDefinitionsProjetos,
  viewModes: [
    { id: 'kanban', label: 'Kanban', icon: LayoutGrid },
    { id: 'list', label: 'Lista', icon: ListIcon },
  ],
};
```

**Arquivo**: `src/lib/filters/filters-cronogramas.ts`

```typescript
// Similar ao de projetos
export const filterDefinitionsCronogramas: FilterDefinition[] = [
  {
    id: 'project_id',
    label: 'Projeto',
    type: 'select',
    options: [], // Dinâmico
    quickFilter: true,
    icon: Building2,
  },
  // ... resto dos filtros
];

export const filterRegistryCronogramas: FilterRegistry = {
  moduleId: 'cronogramas',
  filters: filterDefinitionsCronogramas,
  viewModes: [
    { id: 'list', label: 'Lista', icon: ListIcon },
  ],
};
```

---

### Passo 2: Criar Hooks de Domínio

**Arquivo**: `src/hooks/useProjetosFilters.ts`

```typescript
import { useModuleFilters } from './useModuleFilters';
import { filterDefinitionsProjetos } from '@/lib/filters/filters-projetos';
import { buildFilterOptions } from '@/lib/filters/filter-utils';
import type { Project } from '@/types/project';

export function useProjetosFilters(projects: Project[]) {
  const definitions = useCallback(() => {
    // Atualizar opções dinâmicas
    return filterDefinitionsProjetos.map((def) => {
      if (def.id === 'responsavel' && !def.options?.length) {
        return {
          ...def,
          options: buildFilterOptions(projects, 'responsavel', (v) => v),
        };
      }
      if (def.id === 'categoria' && !def.options?.length) {
        return {
          ...def,
          options: buildFilterOptions(projects, 'categoria', (v) => v),
        };
      }
      return def;
    });
  }, [projects]);

  return useModuleFilters({
    moduleId: 'projetos',
    data: projects,
    definitions: definitions(),
    searchFields: ['titulo', 'codigo', 'categoria'],
    persistence: {
      enabled: true,
      storageKey: 'filters-projetos',
    },
  });
}
```

---

### Passo 3: Integrar em Página

**Arquivo**: `src/app/projetos/projetos-content.tsx`

```typescript
'use client';

import { useState } from 'react';
import { FilterBar } from '@/components/filters/FilterBar';
import { KanbanBoard } from '@/components/views/KanbanBoard';
import { ListView } from '@/components/views/ListView';
import { useProjetosFilters } from '@/hooks/useProjetosFilters';
import { filterRegistryProjetos } from '@/lib/filters/filters-projetos';

interface ProjetosContentProps {
  projects: Project[];
}

export function ProjetosContent({ projects }: ProjetosContentProps) {
  const {
    filters,
    search,
    viewMode,
    filteredData,
    updateFilter,
    setSearch,
    setViewMode,
  } = useProjetosFilters(projects);

  return (
    <div className="flex flex-col h-full gap-4">
      <FilterBar
        moduleId="projetos"
        filters={filterRegistryProjetos}
        currentFilters={filters}
        currentSearch={search}
        currentViewMode={viewMode}
        onUpdateFilter={updateFilter}
        onSearchChange={setSearch}
        onViewModeChange={setViewMode}
      />

      {viewMode === 'kanban' ? (
        <KanbanBoard data={filteredData} />
      ) : (
        <ListView data={filteredData} />
      )}
    </div>
  );
}
```

---

## 📚 Documentação de Referência

| Documento | Caminho | Propósito |
|-----------|---------|----------|
| **Arquitetura de Filtros** | `.context/04-filter-architecture.md` | Fundação: componentes, tipos, padrões |
| **Schema de Dados** | `.context/05-data-schema-projects-schedules.md` | Campos disponíveis, índices, valores |
| **Mapa de Filtros** | `.context/06-filter-mapping-projetos-cronogramas.md` | Quick/Advanced filters, colunas UI |
| **Este Documento** | `.context/07-filter-data-context.md` | Consolidação + guia passo a passo |

---

## ✅ Critérios de Aceitação (Fase 2 Completa)

- [x] Arquitetura de filtros 10/10 (Fase 1 completa)
- [x] Schema documentado (`05-data-schema-*.md`)
- [x] Mapa filtros × colunas (`06-filter-mapping-*.md`)
- [x] Este contexto consolidado (`07-filter-data-context.md`)
- [ ] Implementação em Projetos (Fase 3 - próxima)
- [ ] Implementação em Cronogramas (Fase 3 - próxima)
- [ ] Quality gates + story finalizada (Fase 3 - próxima)

---

## 🚀 Próximos Passos

**Fase 3 (Implementação - não neste plano)**:
1. Implementar FilterRegistry conforme documentado
2. Implementar useProjetosFilters + useCronogramasFilters
3. Integrar FilterBar em ambos módulos
4. Testes E2E
5. Validação UX com usuários

---

## 📞 Referências Rápidas

**Principais arquivos já criados**:
- `src/lib/filters/filter-types.ts` - Tipos (TypeScript)
- `src/lib/filters/filter-utils.ts` - Utilitários (TS)
- `src/components/filters/FilterBar.tsx` - Componente UI (React)
- `src/hooks/useFilterState.ts` - State (React Hooks)
- `src/hooks/useModuleFilters.ts` - Abstração (React Hooks)

**Para começar implementação**:
1. Duplicar structure de `filters-projetos.ts`
2. Adaptar para `filters-cronogramas.ts`
3. Criar `useProjetosFilters` e `useCronogramasFilters`
4. Integrar em páginas

---

## 🎓 Notas de Design

### Persistência (localStorage)

- **Chave**: `filters-{moduleId}` (ex: `filters-projetos`)
- **Tempo de vida**: Session atual + próximas (não expiração automática)
- **Comportamento**: Restaurado no mount, atualizado em tempo real

### Filtros Dinâmicos

Para `responsavel`, `categoria`, `project_id`:
- Usar `buildFilterOptions()` ou `extractUniqueValues()`
- Atualizar em useCallback para reagir a mudanças de dados

### UX Padrão

1. **Barra Rápida** (4 filtros máx) + Search → aplicação imediata
2. **Advanced** (Sheet lateral) → aplicação em click "Apply"
3. **View Mode** → persistido + toggle rápido
4. **Reset** → limpa todos filtros + search

---

**Mantido por**: @dev + @data-engineer | **Status**: Ready | **Última atualização**: 2026-02-23
