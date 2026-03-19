# AIOX Report — Refatoração dos Módulos da Organização

**Data:** 2026-03-18  
**Agente:** Orion (aiox-master) — orquestração; @frontend para execução  
**Branch:** main  
**Status:** ✅ Concluído — Typecheck + Lint passando com 0 erros

---

## 1. Contexto

### Problema Reportado

O usuário identificou dois problemas na página `/organizacao/empresa` (e reflexos em módulos filhos):

1. **Card "Cadastros vinculados"** — Um card centralizado com botões de criação (Nova Área, Novo Núcleo, Novo Sistema, Novo Fornecedor, Novo Serviço, Novo Documento) que ocupava espaço desnecessário na hierarquia visual da página, sem seguir o padrão do projeto.

2. **Ausência de filtros e atalhos rápidos padronizados** — O módulo `empresa` possuía um `FilterBar` mas estava condicionado a `totalVinculos > 0` (invisível quando sem dados) e sem filtros reais configurados. O módulo `processos` não tinha `FilterBar` algum. A referência de padrão a ser seguida era o módulo `projetos`.

### Decisão de Design

- Os botões de criação são ações contextuais da página → devem estar no **header** (padrão AIOX: `DashboardHeader` + actions à direita).
- O `FilterBar` deve estar **sempre visível** (mesmo sem dados), seguindo o padrão do módulo `projetos` com `useProjetosFilters`.
- Cada módulo deve ter seu próprio hook de filtros e definições registradas em `filters-organizacao.ts`.

---

## 2. Arquitetura Utilizada

### Padrão de Filtros (Filter Architecture)

O projeto usa uma arquitetura de filtros em camadas:

```
FilterDefinition[]          → Metadados de cada filtro (tipo, opções, quickFilter)
FilterRegistry              → Configuração do módulo (moduleId, filters, viewModes)
useFilterState(hook)        → Gerencia estado (filters, search, viewMode, persistence)
applyFilters(util)          → Aplica filtros e busca no array de dados
useXxxFilters(hook custom)  → Hook por módulo que une tudo acima
FilterBar (component)       → UI que consome registry + callbacks
```

**Referência:** `src/lib/filters/`, `src/hooks/useFilterState.ts`, `src/components/filters/FilterBar.tsx`

### Padrão de Layout (Module Standard)

Todos os módulos seguem:
```
DashboardHeader(title, subtitle)
+ Header Actions (buttons à direita)
+ OrgBreadcrumb
+ div.flex-1.space-y-6.p-6
  + KPIBar (se aplicável)
  + FilterBar
  + div.flex.gap-6
    + div.min-w-0.flex-1 (lista/kanban/cards)
    + SplitView (detalhe 360°)
    + ContextPanel (nível 2+)
+ Dialogs (criar/editar/excluir)
```

---

## 3. O Que Foi Alterado

### 3.1 `src/app/organizacao/empresa/empresa-content.tsx`

**Removido:**
- Card "Cadastros vinculados" com botões agrupados em "Hierarquia Operacional" e "Recursos" (~90 linhas de JSX)

**Adicionado:**
- 7 botões Quick Action no header: `Nova Área`, `Novo Núcleo`, `Novo Sistema`, `Novo Fornecedor`, `Novo Serviço`, `Novo Documento`, `Editar`
- `FilterBar` e `EmpresaKPIBar` sem condicional — sempre visíveis

**Imports removidos:** `Link` (next/link), `ArrowRight` (lucide)

---

### 3.2 `src/lib/filters/filters-organizacao.ts`

**Adicionado (ao final do arquivo):**
```ts
filterDefinitionsProcessos: FilterDefinition[]
// Filtros: area_id (select dinâmico), com_rotinas (select)

filterRegistryProcessos: FilterRegistry
// moduleId: 'organizacao-processos', viewModes: [list]

searchFieldsProcessos: string[]
// ['name', 'description', 'objective', 'area_name', 'nucleus_name']
```

---

### 3.3 `src/hooks/useOrganizacaoFilters.ts`

**Adicionado:**
```ts
export function useProcessosFilters(
  processes: OrgProcess[],
  areaMap: Record<string, string>,
  nucleusMap: Record<string, string>,
  routinesByProcessId: Record<string, unknown[]>,
)
```

- Constrói `areaOptions` dinamicamente a partir do `areaMap`
- Computa campos virtuais: `area_name`, `nucleus_name`, `com_rotinas`
- Retorna `{ filters, search, filteredData, updateFilter, setSearch, resetAllFilters, registry }`

---

### 3.4 `src/app/organizacao/processos/processos-content.tsx`

**Adicionado:**
- Import de `FilterBar` e `useProcessosFilters`
- Integração do hook `useProcessosFilters(processes, areaMap, nucleusMap, routinesByProcessId)`
- `FilterBar` renderizado antes da listagem
- Listagem passou de `processes.map()` para `filteredData.map()` (com busca e filtros aplicados)
- `EmptyState` com dois estados: "nenhum cadastrado" vs "nenhum resultado nos filtros"
- Estrutura de layout atualizada: `div.flex-1.space-y-6.p-6` + `div.flex.gap-6` com fechamentos corretos

---

## 4. Módulos Não Alterados (Já Conformes)

| Módulo | Status |
|---|---|
| `areas-content.tsx` | ✅ Já tinha `FilterBar` + `useAreasFilters` + botão no header |
| `nucleos-content.tsx` | ✅ Já tinha `FilterBar` implementado |

---

## 5. Quality Gates

| Check | Resultado |
|---|---|
| `npm run typecheck` (tsc --noEmit) | ✅ Exit code 0 |
| `npm run lint` (next lint) | ✅ No ESLint warnings or errors |

---

## 6. Referências de Código

- **Padrão de referência:** `src/app/projetos/projects-content.tsx` + `src/app/projetos/components/ProjectsFilters.tsx`
- **Module Standard:** `docs/architecture/module-standards.md`
- **Filter Types:** `src/lib/filters/filter-types.ts`
