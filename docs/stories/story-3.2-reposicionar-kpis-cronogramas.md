# Story 3.2 — Reposicionar KPIs acima dos filtros em Cronogramas

Story ID: 3.2
Epic: Épico 3 — Cronogramas Ajustes Gerais
Sprint: 5 — Padronização de UI
Agente: @dev
Esforço: 1h
Prioridade: Alta (Quick Win)
Status: Draft

## Como usuário

Como gestor acessando o módulo de Cronogramas,
quero ver os KPIs imediatamente abaixo do cabeçalho e acima dos filtros,
para seguir o padrão visual consistente com o módulo Projetos e ter uma visão rápida dos números antes de filtrar.

## Contexto

O módulo Projetos define o layout padrão segundo `docs/architecture/module-standards.md` seção 4.6:
```
linha 1: KPIs
linha 2: filtros + ações secundárias
linha 3: Kanban/Lista/Grid
```

No estado atual do módulo Cronogramas, os KPIs estão **dentro da div scrollável** abaixo dos filtros, o que inverte a ordem esperada:

**Estado atual (incorreto):**
```
Header → ErpReadOnlyBanner → Filtros → [div scroll] → KPIs → Calendário/Kanban/Lista
```

**Estado desejado (correto — padrão Projetos):**
```
Header → ErpReadOnlyBanner → KPIs → Filtros → Calendário/Kanban/Lista
```

**Referência de implementação:** `src/app/projetos/projects-content.tsx` (linhas 179-203) onde `ProjectsKPIBar` precede `ProjectsFilters` na hierarquia do JSX, ambos dentro de `<div className="flex-1 space-y-6 p-6">`.

**Arquivo afetado:** `src/app/cronogramas/cronogramas-content.tsx`

## Critérios de aceite

- [ ] `CronogramasKPIBar` é renderizado ANTES de `CronogramaFilters` na hierarquia do JSX
- [ ] Os KPIs ficam visíveis acima da barra de filtros na interface
- [ ] O layout do `CronogramasKPIBar` ocupa a largura completa da área de conteúdo
- [ ] A barra de filtros (`CronogramaFilters`) mantém sua posição relativa ao conteúdo principal
- [ ] Não há regressão nos KPIs clicáveis (filtro por KPI continua funcionando)
- [ ] O calendário, Kanban e Lista continuam renderizando corretamente após a reorganização
- [ ] `npm run lint` sem erros
- [ ] `npm run typecheck` sem erros de tipo

## Implementação necessária

### Refatorar `cronogramas-content.tsx`

**Estrutura JSX atual:**
```tsx
<div className="flex w-full min-w-0 max-w-full flex-col overflow-hidden">
  <DashboardHeader ... />
  <div className="px-6 pt-4">
    <ErpReadOnlyBanner variant="page" />
  </div>
  <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
    {/* Filters */}
    <CronogramaFilters ... />
    {/* Scrollable Content */}
    <div className="flex-1 space-y-6 overflow-y-auto p-6">
      {/* KPIs */}
      <CronogramasKPIBar ... />
    </div>
    {/* Calendar/Kanban/Lista */}
    ...
  </div>
</div>
```

**Estrutura JSX desejada (seguindo padrão Projetos):**
```tsx
<div className="flex flex-col">
  <DashboardHeader ... />
  <div className="px-6 pt-4">
    <ErpReadOnlyBanner variant="page" />
  </div>
  <div className="flex-1 space-y-6 p-6">
    {/* KPIs — agora ANTES dos filtros */}
    <ErrorBoundary label="KPIs Cronogramas">
      <CronogramasKPIBar ... />
    </ErrorBoundary>
    {/* Filters — agora DEPOIS dos KPIs */}
    <CronogramaFilters ... />
    {/* Content: Agenda/Kanban/Lista */}
    ...
  </div>
</div>
```

> Ajustar os wrappers de padding/spacing conforme necessário para manter consistência visual. Usar o layout de `projects-content.tsx` como referência direta.

## Dependências

- Story 3.1 (pode ser implementada em paralelo — arquivos não conflitam)

## Definition of Done

- [ ] KPIs renderizados acima dos filtros
- [ ] Ordem de layout: Header → Banner → KPIs → Filtros → Conteúdo
- [ ] KPIs clicáveis funcionando corretamente
- [ ] Sem regressão visual em nenhuma view (agenda, kanban, lista)
- [ ] `npm run lint` ✅
- [ ] `npm run typecheck` ✅

## File List

- `src/app/cronogramas/cronogramas-content.tsx` (MODIFICAR — reorganizar hierarquia JSX)
