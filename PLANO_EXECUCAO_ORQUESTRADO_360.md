# 👑 PLANO DE EXECUÇÃO ORQUESTRADO — Gestão 360º com Aprovações AIOS

**Escopo:** TODAS as opções (A + B + C) + Ciclos de Evolução  
**Metodologia:** Orquestração AIOS com gates de aprovação formal  
**Objetivo:** Resultado **10/10** com qualidade máxima  
**Data:** 2026-02-25  
**Status:** KICKOFF  

---

## 🎯 ESTRUTURA DE APROVAÇÕES

### **Agentes Envolvidos**

| Agente | Responsabilidade | Aprovação |
|--------|------------------|-----------|
| **@aios-master (Orion)** | Orquestração, coordenação, gates | ✅ Go/No-go entre fases |
| **@architect (Aria)** | Contratos, padrões, design system | ✅ Contract review, tech debt |
| **@dev (Dev)** | Implementação, code quality | ✅ Código pronto para stage |
| **@ux-design-expert (Uma)** | UX, acessibilidade, padrões visuais | ✅ 360° completeness, design ok |
| **@qa (QA)** | Testes, quality gates, E2E | ✅ Build clean, tests pass |
| **@data-engineer (Dara)** | Schema, queries, performance | ✅ Queries optimizadas (evo 1) |
| **@devops (Gage)** | Git ops, deployment, CI/CD | ✅ Merge + deploy autorizado |

---

## 📋 FASE 0: KICKOFF + APROVAÇÃO ARQUITETURA

**Duração:** 1h  
**Agentes:** @aios-master, @architect  
**Saída:** Architecture review document assinado

### Checklist

- [ ] **@architect (Aria):**
  - [ ] Revisar contratos de Kanban + Lista View
  - [ ] Aprovar reutilização de código (ProjectsContent.tsx pattern)
  - [ ] Validar que não quebra padrões ADR-003
  - [ ] Aprovar timeline + dependencies
  - **GO/NO-GO:** ✅ Arquitetura aprovada

- [ ] **@aios-master (Orion):**
  - [ ] Coordenar equipes
  - [ ] Confirmar squad alocado
  - [ ] Liberar começar FASE 1

---

## 🚀 FASE 1A: KANBAN MODELOS IA

**Duração:** 2-3h  
**DRI:** @dev  
**Support:** @architect (contract), @ux-design-expert (UX review)

### Tasklist

- [ ] **@dev:**
  - [ ] Criar `src/components/lm-models/ModelsKanbanCard.tsx`
    - Componente compacto (reutiliza ModelCard essentials)
    - Suporta drag-drop feedback visual
    - Renderiza: nome, tier badge, contexto, custo
  - [ ] Atualizar `src/app/auxiliares/modelos-ia/modelos-ia-content.tsx`
    - Adicionar `ViewToggle` (Kanban | Lista)
    - Integrar `KanbanBoard` existente
    - Passar `onStatusChange` para atualizar `display_order`
  - [ ] Testar drag-drop (reordenação)
  - [ ] Lint + TypeCheck local
  - **ENTREGÁVEL:** Feature branch com Kanban funcional

- [ ] **@architect (Aria):**
  - [ ] Code review
    - Validar contract (KanbanItem[] shape)
    - Verificar que reutiliza `KanbanBoard` corretamente
    - Confirmar sem breaking changes
  - [ ] Performance check
    - Colunas genéricas (não hardcoded)
    - Não rerenda desnecessariamente
  - **APROVAÇÃO:** ✅ Contract OK, implementação alinhada

- [ ] **@ux-design-expert (Uma):**
  - [ ] UX review
    - Tier badges visíveis e distinguíveis
    - Espaçamento e alinhamento corretos
    - Drag-drop feedback claro
    - Hover states apropriados
  - [ ] Acessibilidade
    - ARIA labels em cards
    - Keyboard navigation (Tab + arrows)
    - Screen reader friendly
  - **APROVAÇÃO:** ✅ UX 360°, acessibilidade OK

- [ ] **@aios-master (Orion):**
  - [ ] Gate: Ambos agentes aprovaram?
  - [ ] **GO/NO-GO:** ✅ Prosseguir FASE 1B

---

## 🚀 FASE 1B: LISTA VIEW MODELOS IA

**Duração:** 2-3h  
**DRI:** @dev  
**Support:** @architect (contract), @ux-design-expert (UX)

### Tasklist

- [ ] **@dev:**
  - [ ] Criar `src/components/lm-models/ModelsListView.tsx`
    - Reutiliza `ProjectListView.tsx` pattern
    - Colunas: Nome | Model ID | Fornecedor | Tier | Contexto | In/Out Cost | Status | Ações
    - Ordenação clicável em headers
    - Filtros: Fornecedor, Tier, Status
    - Multi-select com ações em massa
  - [ ] Integrar em `modelos-ia-content.tsx`
  - [ ] Testar filtros + ordenação
  - [ ] Testar multi-select actions
  - [ ] Lint + TypeCheck local
  - **ENTREGÁVEL:** Feature branch com Lista funcional

- [ ] **@architect (Aria):**
  - [ ] Code review
    - Contract (colunas, filter shape)
    - Reutilização pattern ProjectListView
    - Performance (virtualization se necessário)
  - [ ] Validar que Kanban + Lista convivem (ViewToggle)
  - **APROVAÇÃO:** ✅ Contract OK, integração limpa

- [ ] **@ux-design-expert (Uma):**
  - [ ] UX review
    - Tabela legível (columns não muito apertadas)
    - Multi-select UX clara
    - Ações em massa visíveis
    - Sort indicators (↑↓) nas colunas
  - [ ] Acessibilidade
    - Table ARIA attributes
    - Sortable columns accessible
    - Checkbox accessible
  - **APROVAÇÃO:** ✅ UX 360°, accessibility OK

- [ ] **@aios-master (Orion):**
  - [ ] Gate: Ambos agentes aprovaram?
  - [ ] **GO/NO-GO:** ✅ Prosseguir FASE 2

---

## 🎨 FASE 2: VALIDAR/COMPLETAR CARDS 360°

**Duração:** 3-5h  
**DRI:** @dev  
**Support:** @ux-design-expert (UX lead), @architect (review)

### Tasklist (A + B + C)

#### **2A: ModelCard Tooltips**

- [ ] **@dev:**
  - [ ] Adicionar `<Tooltip>` para "Contexto"
    - "Máximo de tokens que o modelo pode processar de uma vez"
  - [ ] Adicionar `<Tooltip>` para "Tier"
    - "entry: Gratuito/low-cost | balanced: Recomendado (padrão) | pro: Profissional | flagship: Cutting-edge"
  - [ ] Testar tooltips (hover)
  - **ENTREGÁVEL:** ModelCard com tooltips

#### **2B: ProviderCard Expansão**

- [ ] **@dev:**
  - [ ] Adicionar seção "Modelos (5 ativos)"
    - Count de `lm_models` com `is_active=true`
  - [ ] Adicionar seção "Recentes"
    - Top 3 modelos por `display_order`
  - [ ] Validar que `description` existe em tabela
  - [ ] Testar count queries
  - **ENTREGÁVEL:** ProviderCard expandido

#### **2C: AgentCard Expansão**

- [ ] **@dev:**
  - [ ] Adicionar "Tipo de Agente" seção
    - Join com `agent_types.name`
  - [ ] Adicionar count "Ferramentas (X)"
    - Count de `runtime_tool_ids` array length
  - [ ] Adicionar "Versões publicadas (X)"
    - Count de `agent_versions` com status='published'
  - [ ] Adicionar "Atualizado há X dias"
    - Timestamp relativo (`formatRelativeDate`)
  - [ ] Validar que `description` existe
  - [ ] Testar queries/joins
  - **ENTREGÁVEL:** AgentCard expandido 360°

### Aprovações

- [ ] **@ux-design-expert (Uma):**
  - [ ] Validar tooltips (conteúdo útil, não redundante)
  - [ ] Validar cards expandidos
    - Informações importantes visíveis
    - Não overloaded (máx 5-6 seções)
    - Hierarquia visual clara (headers, dividers)
  - [ ] Validar cores, spacing, alignment
  - [ ] Acessibilidade completa
    - Todos os inputs acessíveis
    - Labels associados
    - Cores não são única forma de comunicação
  - **APROVAÇÃO:** ✅ 360° Completo, UX 10/10

- [ ] **@architect (Aria):**
  - [ ] Code review
    - Queries otimizadas (índices usados)
    - Joins corretos
    - Sem N+1 problems
  - [ ] Validar que tipos TypeScript cobrem tudo
  - [ ] Confirmar RLS não quebrado
  - **APROVAÇÃO:** ✅ Arquitetura OK, performance OK

- [ ] **@aios-master (Orion):**
  - [ ] Gate: Ambos agentes aprovaram?
  - [ ] **GO/NO-GO:** ✅ Prosseguir FASE 3

---

## ✅ FASE 3: QUALITY GATES

**Duração:** 1-2h  
**DRI:** @qa  
**Support:** @dev (fixes se necessário)

### Tasklist

- [ ] **@qa:**
  - [ ] Lint: `npm run lint`
    - Esperado: 0 errors, 0 warnings
    - **APPROVAL:** ✅ Lint clean
  
  - [ ] TypeCheck: `npm run typecheck`
    - Esperado: 0 errors
    - **APPROVAL:** ✅ TypeCheck 100%
  
  - [ ] Tests: `npm test`
    - Esperado: Todos passing (104+ tests)
    - **APPROVAL:** ✅ Tests pass
  
  - [ ] Build: `npm run build`
    - Esperado: Clean build, Vercel ready
    - **APPROVAL:** ✅ Build green
  
  - [ ] E2E Scenarios:
    - [ ] Kanban: Drag-drop reordenar modelo
    - [ ] Kanban: Toggle Kanban ↔ Lista
    - [ ] Lista: Click header para sort
    - [ ] Lista: Multi-select + ações em massa
    - [ ] Cards: Hover tooltips (ModelCard)
    - [ ] Cards: Expandidos mostram dados (ProviderCard, AgentCard)
    - [ ] No regressions: Fornecedores, Tipos de Agentes, Agentes ainda funcionam
    - **APPROVAL:** ✅ E2E 100%

- [ ] **@dev (se necessário):**
  - [ ] Fix qualquer issue encontrada
  - [ ] Re-run quality gates
  
- [ ] **@aios-master (Orion):**
  - [ ] Gate: QA aprovou 100%?
  - [ ] **GO/NO-GO:** ✅ Prosseguir FASE 4

---

## 🚀 FASE 4: MERGE + DEPLOY

**Duração:** 30 min  
**DRI:** @devops  
**Support:** @aios-master (coordination)

### Tasklist

- [ ] **@aios-master (Orion):**
  - [ ] Confirmar todas as fases aprovadas
  - [ ] Coordenar @devops para merge

- [ ] **@devops (Gage):**
  - [ ] `git push` para main (sem force)
  - [ ] Criar PR (se necessário)
  - [ ] Deploy staging
  - [ ] Validar staging é green
  - [ ] **APPROVAL:** ✅ Staging live

- [ ] **@aios-master (Orion):**
  - [ ] Teste staging (ou delegue @qa)
  - [ ] **GO/NO-GO:** ✅ Prosseguir produção OU aguardar feedback

---

## 🔄 EVOLUÇÃO: CICLOS POSTERIORES

### **EVOLUÇÃO 1: Telemetria & FinOps (Sprint +2)**

**Agentes:** @data-engineer (lead), @architect (contract), @dev (implement), @qa (E2E)

- [ ] **@data-engineer (Dara):**
  - [ ] Desenhar migration 039 (llm_usage table)
  - [ ] Validar schema com @architect
  - [ ] **GO:** Schema aprovado

- [ ] **@architect (Aria):**
  - [ ] Revisar schema (performance, indexação)
  - [ ] Desenhar ingest contract (backend → llm_usage)
  - [ ] Desenhar dashboard contract
  - [ ] **GO:** Contratos aprovados

- [ ] **@dev:**
  - [ ] Implementar backend ingest
  - [ ] Implementar dashboard FinOps
  - [ ] Testes
  - [ ] **GO:** Implementação pronta

- [ ] **@qa:**
  - [ ] E2E tests (track chamadas, verificar dados)
  - [ ] Performance baseline
  - [ ] **GO:** Testes aprovados

---

### **EVOLUÇÃO 2: Feature Flags (Sprint +3)**

**Agentes:** @architect (lead), @dev (implement), @qa (E2E)

- [ ] **@architect (Aria):**
  - [ ] Desenhar feature flags table
  - [ ] Definir flags (enableCuratedTop5, enableFinOpsAlerts, etc)
  - [ ] UI contract para admin panel
  - [ ] **GO:** Design aprovado

- [ ] **@dev:**
  - [ ] Implementar migration + admin UI
  - [ ] Implementar flag logic em código
  - [ ] **GO:** Implementação pronta

- [ ] **@qa:**
  - [ ] E2E: Toggle flags, verificar comportamento
  - [ ] **GO:** Testes aprovados

---

### **EVOLUÇÃO 3: Dashboards & Alerts (Sprint +4)**

**Agentes:** @architect (lead), @dev (implement), @qa (E2E)

- [ ] **@architect (Aria):**
  - [ ] Dashboard wireframe + metrics spec
  - [ ] Alerts rules + notification strategy
  - [ ] **GO:** Design aprovado

- [ ] **@dev:**
  - [ ] Implementar dashboard page
  - [ ] Implementar alerts logic
  - [ ] **GO:** Implementação pronta

- [ ] **@qa:**
  - [ ] E2E: Dashboard renders, metrics correct
  - [ ] E2E: Alerts trigger correctly
  - [ ] **GO:** Testes aprovados

---

## 📊 TIMELINE CONSOLIDADO

```
HOJE (Sprint Atual) — 9-12h com aprovações
├─ FASE 0: Kickoff (1h) → Architect GO
├─ FASE 1A: Kanban (2-3h) → Architect + UX GO
├─ FASE 1B: Lista (2-3h) → Architect + UX GO
├─ FASE 2: Cards (3-5h) → UX + Architect GO
├─ FASE 3: QA (1-2h) → QA GO
└─ FASE 4: Merge (30m) → DevOps GO

Sprint +2 (40h)
├─ Telemetria/FinOps schema
├─ Backend ingest
├─ Dashboard FinOps
└─ E2E tests

Sprint +3 (20h)
├─ Feature flags infrastructure
├─ Curadoria dinâmica
└─ E2E tests

Sprint +4 (30h)
├─ Dashboard executivo
├─ Alertas automáticos
└─ E2E tests

RESULTADO: Gestão 360° COMPLETA com visibilidade executiva + FinOps + rollouts seguros
```

---

## ✨ CHECKPOINTS DE APROVAÇÃO

| Fase | Gate | Agentes | Status |
|------|------|---------|--------|
| **0** | Arquitetura | @architect | ⏳ Awaiting |
| **1A** | Kanban OK | @architect, @ux | ⏳ Awaiting |
| **1B** | Lista OK | @architect, @ux | ⏳ Awaiting |
| **2** | Cards 360° | @ux, @architect | ⏳ Awaiting |
| **3** | Quality gates | @qa | ⏳ Awaiting |
| **4** | Merge/Deploy | @devops | ⏳ Awaiting |
| **Evo-1** | Telemetria | @data-engineer, @architect | ⏳ Awaiting |
| **Evo-2** | Feature Flags | @architect, @qa | ⏳ Awaiting |
| **Evo-3** | Dashboards | @architect, @qa | ⏳ Awaiting |

---

## 🎯 RESULTADO ESPERADO: **10/10**

✅ **Hoje (Sprint):**
- Kanban + Lista View totalmente funcionais
- Cards com tooltips + expansões (360° completo)
- Padrão ADR-003 mantido
- Acessibilidade WCAG AA
- Build clean, tests pass
- Merge staging green

✅ **Sprint +2:**
- FinOps operacional (dados estruturados)
- Dashboard custo/latência
- Baseline para otimização

✅ **Sprint +3:**
- Rollouts seguros com feature flags
- Experimentação controlada
- A/B testing capability

✅ **Sprint +4:**
- Visibilidade executiva completa
- Alertas automáticos
- Relatórios agendados

---

## 🚀 PRÓXIMO PASSO

**Orion aguardando autorização para:**

1. ✅ Ativar @architect para FASE 0 (Kickoff)
2. ✅ Liberar @dev para FASE 1A (Kanban)
3. ✅ Ativar squad completo com handoffs formais
4. ✅ Executar com aprovações em cada checkpoint

**Autoriza?** 👑

---

**Documento:** PLANO_EXECUCAO_ORQUESTRADO_360.md  
**Status:** Pronto para KICKOFF  
**DRI:** @aios-master  
**Tempo Total:** ~100h (hoje + 3 sprints) = Gestão 360° COMPLETA com qualidade 10/10
