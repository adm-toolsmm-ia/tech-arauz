# 🎯 CONTEXTO FINAL — Padronização Módulo Agentes AI
**Data:** 2026-02-24 | **Status:** 🟡 Pronto para Execução | **Duração:** 7 horas

---

## ✅ O QUE FOI FEITO (Sessions Anteriores)

1. **Módulo Agentes Base** ✅
   - DB: Supabase com RLS (migrations 028-030)
   - CRUD: AgentSupabaseService
   - UI: /agentes (page + content)
   - Types: AgentType, UIAgent, CreateAgentRequest

2. **Módulo Tipos de Agentes** ✅
   - DB: agent_types table + seed data (Projetos, Requisitos, Análise Técnica)
   - Page: /auxiliares/agent-types
   - Service: AgentTypesService

3. **Erros Corrigidos** ✅
   - React #425: SelectItem value="" → "no-type"
   - useSidebar context: Criado layout.tsx com SidebarProvider
   - Documentação: ARQUITETURA_PADRAO_PAGINAS.md

4. **Documentação Criada** ✅
   - ARQUITETURA_PADRAO_PAGINAS.md (padrão layout/page/content)
   - AUDITORIA_AGENTES_FINAL.md (status)
   - PADRAO_COMPONENTES_AGENTES.md (especificação)
   - PLANO_IMPLEMENTACAO_AGENTES.md (roadmap)

---

## ❌ O QUE PRECISA FAZER (Próximas Sessions)

### FASE 1: Refatorar /agentes (2h)
**Responsável:** @dev  
**Checklist:**
- [ ] Remove: Select/Tabs manual
- [ ] Add: FilterBar + ViewToggle (via SharedComponents)
- [ ] Add: KanbanBoard com swimlanes por status
- [ ] Create: AgentKanbanCard.tsx (novo)
- [ ] Create: AgentListView.tsx (novo)
- [ ] Update: React Query com invalidateQueries
- [ ] Delete: AgentKPIs.tsx, AgentCard.tsx (antigos)
- [ ] Result: /agentes com Kanban/List/Grid views funcionando

### FASE 2: Refatorar /auxiliares/agent-types (1h)
**Responsável:** @dev  
**Checklist:**
- [ ] Add: FilterBar
- [ ] Add: KPICard x3 (Total, Ativo, Sistema)
- [ ] Add: Dialog "Novo Tipo"
- [ ] Fix: Botão "Novo" que não funciona
- [ ] Result: agent-types com filtros + criação funcionando

### FASE 3: Criar /auxiliares/lm-providers (2h)
**Responsável:** @data-engineer + @dev  
**Checklist:**
- [ ] Create: Tabela lm_providers no Supabase
- [ ] Create: LmProvidersService CRUD
- [ ] Create: /auxiliares/lm-providers module
- [ ] Add: layout.tsx com SidebarProvider
- [ ] Add: FilterBar + KPICard
- [ ] Add: Table com Providers + Modelos
- [ ] Result: Novo módulo auxiliar funcional

### FASE 4: Validação (1h)
**Responsável:** @qa  
**Checklist:**
- [ ] npm run typecheck → 0 errors
- [ ] npm run lint → 0 warnings
- [ ] Teste manual: /agentes (todas 3 views)
- [ ] Teste manual: /auxiliares/agent-types (filtros + criação)
- [ ] Teste manual: /auxiliares/lm-providers (load + table)
- [ ] Result: Build 100% clean + funcional

---

## 📊 COMPONENTES COMPARTILHADOS (REUTILIZAR)

```
✅ FilterBar          → src/components/filters/FilterBar.tsx
✅ ViewToggle         → src/components/views/ViewToggle.tsx
✅ KanbanBoard        → src/components/views/KanbanBoard.tsx
✅ KPICard            → src/components/dashboard/KPICard.tsx
✅ SplitView          → src/components/views/SplitView.tsx
✅ DashboardHeader    → src/components/layout/DashboardHeader.tsx
```

---

## 🗑️ COMPONENTES A DELETAR

```
❌ AgentKPIs.tsx
❌ AgentCard.tsx (será AgentKanbanCard)
❌ BudgetGauge.tsx
❌ TraceList.tsx
❌ TraceTimeline.tsx
```

---

## 🆕 COMPONENTES A CRIAR

```
✅ AgentKanbanCard.tsx
✅ AgentListView.tsx
✅ LmProvidersService.ts
✅ /auxiliares/lm-providers/ (module)
```

---

## 👥 EQUIPE ASSIGMENTS

| Agente | Fases | Tarefas |
|--------|-------|---------|
| **@dev** | 1, 2, 4 | Refatorar agentes + agent-types, validação code |
| **@data-engineer** | 3 | Supabase table + migrations |
| **@ux-design-expert** | 1, 2 | Review UI/UX alignment com Projetos |
| **@qa** | 4 | Testes + validação |
| **@architect** | Review | Garantir padrões arquiteturais |

---

## 📌 REFERÊNCIAS CRÍTICAS

**Ler OBRIGATORIAMENTE antes de começar:**
1. `.cursor/PADRAO_COMPONENTES_AGENTES.md` — Especificação
2. `.cursor/PLANO_IMPLEMENTACAO_AGENTES.md` — Roadmap
3. `src/app/projetos/projects-content.tsx` — Padrão ouro

---

## 🚀 PRÓXIMOS PASSOS

1. **@dev**: Começar FASE 1 (Refatorar /agentes)
   - Ler os 2 documentos de padrão
   - Integrar FilterBar + ViewToggle
   - Criar AgentKanbanCard

2. **@data-engineer**: Preparar FASE 3
   - Criar migration para lm_providers
   - Criar LmProvidersService

3. **@qa**: Ficar pronto para FASE 4
   - Preparar testes manuais
   - Montar checklist

4. **@aios-master**: Orquestrar execução
   - Monitor progresso
   - Commit após cada fase
   - Validar alinhamento

---

**Última atualização:** 2026-02-24 23:45  
**Próxima sessão:** Começar FASE 1 (@dev)  
**Status:** 🟡 AGUARDANDO EXECUÇÃO
