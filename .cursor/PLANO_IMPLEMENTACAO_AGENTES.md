# 🚀 PLANO DE EXECUÇÃO — Padronização Agentes AI

## 📍 STATUS ATUAL vs DESEJADO

### Módulo: `/agentes`

**ATUAL:**
- ❌ FilterBar NÃO usado (Select manual)
- ❌ ViewToggle NÃO usado (Tabs manual)
- ❌ KanbanBoard NÃO usado (sem visão kanban)
- ❌ KPICard customizado (AgentKPIs.tsx)
- ❌ AgentCard não segue padrão ProjectCard
- ❌ Refresh não atualiza lista (falta React Query)
- ⚠️ Card detail em page separada (deveria usar SplitView)

**DESEJADO:**
- ✅ FilterBar integrado (com status, tipo, search)
- ✅ ViewToggle (Kanban, List, Grid)
- ✅ KanbanBoard com swimlanes por status
- ✅ KPICard x4 (Total, Draft, Published, Deprecated)
- ✅ AgentKanbanCard + AgentListView simples
- ✅ React Query para refresh automático
- ✅ SplitView para detalhe 360°

---

### Módulo: `/auxiliares/agent-types`

**ATUAL:**
- ❌ FilterBar NÃO usado (Input manual)
- ❌ KPICard NÃO usado (nenhuma métrica)
- ❌ "Novo Tipo" botão não funciona
- ⚠️ Table view básica sem padrão

**DESEJADO:**
- ✅ FilterBar (search + filters)
- ✅ KPICard x3 (Total, Ativo, Sistema)
- ✅ "Novo Tipo" Dialog funcional
- ✅ Table com padrão Projetos

---

### Módulo: `/auxiliares/lm-providers` (NOVO)

**CRIAR:**
- ✅ Tabela `lm_providers` no Supabase
- ✅ Service: LmProvidersService
- ✅ Page: /auxiliares/lm-providers
- ✅ FilterBar + KPICard + Table

---

## 🎯 FASES DE IMPLEMENTAÇÃO

### FASE 1: Preparação (1h)
- [ ] Revisar FilterBar, ViewToggle, KanbanBoard código
- [ ] Entender props e exemplos
- [ ] Preparar tipos TypeScript

### FASE 2: Refatorar /agentes (2h)
1. Atualizar `agentes-content.tsx`:
   - Remover Select/Tabs manual
   - Integrar FilterBar
   - Integrar ViewToggle
   - Remover AgentKPIs, usar KPICard
   - Integrar KanbanBoard

2. Criar `AgentKanbanCard.tsx`:
   - Simples card para kanban
   - Nome, ícone tipo, status badge

3. Criar `AgentListView.tsx`:
   - Table ou lista
   - Seguir ProjectListView pattern

4. Atualizar React Query:
   - Usar invalidateQueries em create
   - Auto-refresh ao criar novo

### FASE 3: Refatorar /auxiliares/agent-types (1h)
1. Integrar FilterBar
2. KPICard x3
3. Table simples
4. Dialog "Novo Tipo"

### FASE 4: Criar /auxiliares/lm-providers (2h)
1. Criar tabela Supabase
2. Service CRUD
3. Page + content
4. FilterBar + KPICard + Table

### FASE 5: Validação (1h)
- TypeScript check
- ESLint
- Teste manual cada view
- Verificar responsividade

---

## 📋 CHECKLIST DETALHADO

### A. Preparação

- [ ] Ler `.cursor/PADRAO_COMPONENTES_AGENTES.md`
- [ ] Ler `src/components/filters/FilterBar.tsx`
- [ ] Ler `src/components/views/ViewToggle.tsx`
- [ ] Ler `src/components/views/KanbanBoard.tsx`
- [ ] Ler `src/app/projetos/projects-content.tsx` (referência)
- [ ] Entender `useProjetosFilters` hook
- [ ] Entender `ProjectKanbanCard` pattern

### B. Refatorar agentes-content.tsx

**Imports:**
- [ ] Add: `FilterBar` from `@/components/filters/FilterBar`
- [ ] Add: `ViewToggle` from `@/components/views/ViewToggle`
- [ ] Add: `KanbanBoard` from `@/components/views/KanbanBoard`
- [ ] Add: `KPICard` from `@/components/dashboard/KPICard`
- [ ] Remove: `import { AgentKPIs }`
- [ ] Remove: `import { AgentCard }`

**State:**
- [ ] Keep: `viewMode` state
- [ ] Keep: `filtered` from useAgentFilters
- [ ] Add: `selectedAgent` for SplitView
- [ ] Remove: manual status/type selects

**Render:**
- [ ] Replace KPIs section com: `<KPICard>` x4
- [ ] Replace manual filters com: `<FilterBar>`
- [ ] Replace manual Tabs com: `<ViewToggle>`
- [ ] Add: `<KanbanBoard>` para kanban view
- [ ] Replace grid com: `<AgentKanbanCard>` (novo)
- [ ] Add: `<SplitView>` para detalhe

### C. Criar AgentKanbanCard.tsx

```typescript
// Template mínimo
export function AgentKanbanCard({ agent, onSelect }: Props) {
  return (
    <Card className="cursor-pointer hover:shadow-md" onClick={() => onSelect(agent)}>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">{agent.name}</p>
            <p className="text-xs text-muted-foreground">{agent.modelId}</p>
          </div>
          <Badge>{agent.agentType}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
```

### D. Criar AgentListView.tsx

```typescript
// Usa Table ou simple list
// Segue ProjectListView pattern
```

### E. Refatorar agent-types-content.tsx

- [ ] Integrar `FilterBar`
- [ ] Replace Input search com FilterBar
- [ ] Add `KPICard` x3 (Total, Ativo, Sistema)
- [ ] Criar "Novo Tipo" Dialog
- [ ] Implementar Edit/Delete actions

### F. Criar LM Providers Module

- [ ] Create table: `lm_providers`
- [ ] Create service: `LmProvidersService`
- [ ] Create page: `/auxiliares/lm-providers/page.tsx`
- [ ] Create content: `/auxiliares/lm-providers/lm-providers-content.tsx`
- [ ] Integrar FilterBar + KPICard + Table

### G. React Query Integration

- [ ] Create: `src/services/agents/agentsApiService.ts` (queries)
- [ ] Update: `CreateAgentDialog` com mutation
- [ ] On success: `invalidateQueries(['agents'])`
- [ ] Auto-refresh lista

### H. Testes & Validação

- [ ] [ npm run typecheck → 0 errors
- [ ] npm run lint → 0 warnings
- [ ] Manual test: /agentes
  - [ ] FilterBar works (search, filters)
  - [ ] ViewToggle works (Kanban, List, Grid)
  - [ ] Create agent → lista atualiza
  - [ ] Card click → SplitView abre
- [ ] Manual test: /auxiliares/agent-types
  - [ ] FilterBar works
  - [ ] KPIs atualizam
  - [ ] "Novo Tipo" abre Dialog
- [ ] Manual test: /auxiliares/lm-providers
  - [ ] Tabela carrega
  - [ ] Filtros funcionam

---

## 📊 COMPONENTES A DELETAR

```
❌ src/components/agents/AgentKPIs.tsx
❌ src/components/agents/AgentCard.tsx (será AgentKanbanCard)
❌ src/components/agents/BudgetGauge.tsx
❌ src/components/agents/TraceList.tsx
❌ src/components/agents/TraceTimeline.tsx
```

---

## 📦 COMPONENTES A CRIAR

```
✅ src/components/agents/AgentKanbanCard.tsx
✅ src/components/agents/AgentListView.tsx
✅ src/app/auxiliares/lm-providers/ (module)
```

---

## ⏱️ ESTIMATIVA DE TEMPO

| Fase | Duração | Tarefas |
|------|---------|---------|
| 1. Preparação | 1h | Leituras + entender padrão |
| 2. Refatorar /agentes | 2h | Content + cards + query |
| 3. Refatorar agent-types | 1h | FilterBar + KPIs + Dialog |
| 4. Criar lm-providers | 2h | Table + Supabase + service |
| 5. Validação | 1h | Tests + typecheck + lint |
| **TOTAL** | **7h** | **Padronização Completa** |

---

## 🎯 PRÓXIMAS AÇÕES

1. **Começar por Fase 2** — é a mais crítica
2. **Testar FilterBar primeiro** — se funcionar, o resto é simples
3. **Não deletar AgentCard yet** — manter backup até novo estar 100%
4. **Commit após cada fase** — keeps history limpo

---

**Data:** 2026-02-24  
**Responsável:** @dev (implementação)  
**Aprovado por:** Uma (UX) + Aria (Architect)  
**Status:** 🟡 PRONTO PARA COMEÇAR
