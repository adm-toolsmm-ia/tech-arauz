# 🎯 SUMÁRIO EXECUTIVO — AJUSTES + ROADMAP

**Análise:** Gestão 360º Agentes/Modelos/Fornecedores — Fases de Evolução  
**Data:** 2026-02-25  
**Preparado por:** @aios-master + Squad  

---

## 📊 SITUAÇÃO ATUAL

### ✅ JÁ IMPLEMENTADO (HOJE)
```
GESTÃO 360º — ESTRUTURA BASE
├─ Migrations 037 + 038: Deployed ✅
│  ├─ context_window + display_order + tier em lm_models ✅
│  ├─ 30 modelos curados (5/provedor) ✅
│  └─ RLS intacta, dados estruturados ✅
│
├─ Frontend 360°: Implementado ✅
│  ├─ Tipos TypeScript (+3 campos) ✅
│  ├─ ModelCard com tier/contexto/custo ✅
│  ├─ Ordenação por display_order ✅
│  ├─ ListaView simples (tabela base) ⚠️
│  └─ SplitView cockpit ✅
│
├─ UX/Design System: Validado ✅
│  ├─ Cards seguem padrão ADR-003 ✅
│  ├─ Recomendações UX identificadas ⚠️
│  └─ Acessibilidade (aria-label) pending
│
└─ Quality Gates: Em progresso ⏳
   ├─ Lint: rodando ⏳
   ├─ TypeCheck: rodando ⏳
   ├─ Tests: rodando ⏳
   └─ Build: rodando ⏳
```

### ❌ O QUE FALTA

1. **Kanban View** para Modelos IA (agrupado por fornecedor)
2. **Lista View completa** (tabela + filtros + ordenação + multi-select)
3. **Cards expandidos** com todos os campos 360°
4. **Tooltips** explicativos (contexto, tier, documentação)
5. **Telemetria** (tabela llm_usage, tokens, custo, latência)
6. **Feature flags** (curadoria dinâmica, A/B testing)
7. **Dashboards** (FinOps, alertas, observabilidade)

---

## 🚀 AJUSTES MAPEADOS (SPRINT ATUAL)

### **AJUSTE 1: VISUALIZAÇÕES (Kanban + Lista)**

#### 1.1 Kanban de Modelos IA

**O que é:**
- Colunas = Fornecedores AI (OpenAI, Anthropic, Google, Mistral, Cohere, Groq)
- Cada coluna = 5 modelos curados daquele fornecedor
- Cards = ModelCard compacto (nome, tier badge, contexto, custo)
- Interação = Drag-drop para reordenar (atualiza display_order)
- Toggle = Alternar Kanban ↔ Lista view

**Padrão:**
```
┏━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━┓
┃ OpenAI (5)  ┃ Anthropic(5) ┃ Google (5)    ┃
┣━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━┫
┃┌──────────┐ ┃┌──────────┐  ┃┌──────────┐  ┃
┃│🟢 Entry  │ ┃│🟢 Entry  │  ┃│🔵 Balanced│ ┃
┃│GPT-4o    │ ┃│Haiku     │  ┃│Gemini    │ ┃
┃│128K      │ ┃│200K      │  ┃│1M        │ ┃
┃│$0.00015  │ ┃│$0.0008   │  ┃│free      │ ┃
┃└──────────┘ ┃└──────────┘  ┃└──────────┘  ┃
┃
┃┌──────────┐ ┃┌──────────┐  ┃┌──────────┐  ┃
┃│⚡Balanced│ ┃│⚡Balanced│  ┃│⚡Balanced│ ┃
┃│GPT-4o    │ ┃│Sonnet    │  ┃│Pro       │ ┃
┃│128K      │ ┃│200K      │  ┃│2M        │ ┃
┃│$0.005    │ ┃│$0.003    │  ┃│$0.005    │ ┃
┃└──────────┘ ┃└──────────┘  ┃└──────────┘  ┃
┃ ... 3 mais  ┃ ... 3 mais   ┃ ... 3 mais   ┃
┗━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━┛
```

**Reutilização de Código:**
- ✅ `KanbanBoard.tsx` (já existe, genérico)
- ✅ `ViewToggle.tsx` (já existe)
- ✅ `ModelCard.tsx` (já existe, usar versão compacta)
- 📝 **Novo:** `ModelsKanbanCard.tsx` (wrapper compacto)

**Estimativa:** 2-3h (1 dev)

---

#### 1.2 Lista View para Modelos IA

**O que é:**
- Tabela com colunas: Nome | Model ID | Fornecedor | Tier | Contexto | In/Out Cost | Status | Ações
- Ordenação clicável em headers
- Filtros: Fornecedor, Tier, Status
- Multi-select com ações em massa (ativar/desativar)
- Paginação ou scroll infinito

**Padrão:**
```
┏━━━━┳━━━━━━━━━━┳━━━━━━━━━┳━━━━━━━┳━━━━━┳━━━━━━┳━━━━┓
┃  □ ┃ Nome      ┃ Provider ┃ Tier  ┃ Ctx ┃ Custo┃ Ações┃
┣━━━━╋━━━━━━━━━━╋━━━━━━━━━╋━━━━━━━╋━━━━━╋━━━━━━╋━━━━┫
┃☑️ │ GPT-4o    │ OpenAI   │ 🟢Entry│128K │ $0.x │ ✏️ 🗑️ ┃
┣━━━━╋━━━━━━━━━━╋━━━━━━━━━╋━━━━━━━╋━━━━━╋━━━━━━╋━━━━┫
┃☐ │ Claude... │ Anthropic│ ⚡Bal  │200K │ $0.x │ ✏️ 🗑️ ┃
┣━━━━╋━━━━━━━━━━╋━━━━━━━━━╋━━━━━━━╋━━━━━╋━━━━━━╋━━━━┫
┃☐ │ Gemini... │ Google   │💎Pro  │1M   │ free │ ✏️ 🗑️ ┃
┗━━━━┻━━━━━━━━━━┻━━━━━━━━━┻━━━━━━━┻━━━━━┻━━━━━━┻━━━━┛

Filtros: [Fornecedor ▼] [Tier ▼] [Status ▼]
Ações: [Ativar selecionados] [Desativar selecionados]
```

**Reutilização:**
- ✅ `ProjectListView.tsx` (template de tabela)
- ✅ Componentes UI (Button, Badge, Checkbox, etc)
- 📝 **Novo:** `ModelsListView.tsx` (+200 LOC)

**Estimativa:** 2-3h (1 dev)

---

### **AJUSTE 2: VALIDAÇÃO & COMPLETAMENTO DE CARDS**

#### 2.1 ModelCard (90% completo)

**Campos OK:**
- ✅ Nome, model_id, fornecedor, contexto, max_tokens, custos, tier, docs_url, status

**Faltando:**
- ⚠️ Tooltips explicativos
  - "Contexto: Máximo de tokens que o modelo pode processar por vez"
  - "Tier: Classificação operacional (entry=gratuito, balanced=recomendado, pro=profissional, flagship=cutting-edge)"

**Mudanças Pequenas:**
- Adicionar `<Tooltip>` shadcn/ui em 2 campos
- ETA: 30 min

---

#### 2.2 ProviderCard (70% completo)

**Campos OK:**
- ✅ Nome, emoji, cor, status

**Faltando:**
- ⚠️ Descrição (verificar se está em DB)
- ⚠️ Count de modelos ativos
- ⚠️ Últimos 3 modelos (preview)
- ⚠️ Docs_url link

**Mudanças:**
- Adicionar seção "Modelos (5 ativos)"
- Adicionar seção "Últimos modelos" com 3 links
- ETA: 1h

---

#### 2.3 AgentCard (60% completo)

**Campos OK:**
- ✅ Nome, status, modelo padrão, temperatura

**Faltando:**
- ⚠️ Tipo de agente (agent_type_id → nome)
- ⚠️ Descrição (description field)
- ⚠️ Count de ferramentas
- ⚠️ Count de versões publicadas
- ⚠️ Timestamp relativo (updated_at)

**Mudanças:**
- Adicionar seção "Tipo de Agente" com badge
- Adicionar seção "Ferramentas (8)" com count
- Adicionar seção "Versões (3 publicadas)"
- Adicionar "Atualizado há 2 dias"
- ETA: 2h

---

### 📋 SUMMARY: AJUSTES MAPEADOS

| Item | Tipo | ETA | Impacto | DRI |
|------|------|-----|--------|-----|
| **1.1 Kanban Modelos** | Feature | 2-3h | Novo view, reutiliza KanbanBoard | @dev |
| **1.2 Lista View** | Feature | 2-3h | Novo view, reutiliza ProjectListView | @dev |
| **2.1 ModelCard Tooltips** | UX | 30m | Clareza 360° | @dev |
| **2.2 ProviderCard Expand** | UX | 1h | Mostra models count + preview | @dev |
| **2.3 AgentCard Expand** | UX | 2h | Mostra type, tools, versions | @dev |
| **TOTAL** | **Sprint** | **8-9h** | **Visualizações 360° completas** | **@dev** |

---

## 🚀 EVOLUÇÃO: PRÓXIMOS PASSOS (Ciclos Futuros)

### **Ciclo 1: Telemetria & FinOps (Sprint +2) — 40h**

```
✅ O que: Instrumentar todas as chamadas LLM com dados estruturados
├─ Tabela llm_usage (new migration 039)
│  ├─ tokens_in, tokens_out, latency_ms
│  ├─ cost_usd (calculado: tokens * model_cost)
│  ├─ status (success/error/timeout)
│  └─ agent_id, model_id, provider_id (context)
│
├─ Backend Ingest (services/ai)
│  ├─ Capturar após LLM call
│  ├─ Calcular custo baseado em lm_models
│  └─ Inserir em llm_usage
│
└─ Dashboard FinOps (nova página)
   ├─ KPIs: Custo total, chamadas/dia, latência média
   ├─ Charts: Custo/dia, latência por agent, erro/sucesso
   └─ Tabelas: Top agents por custo, por latência

🎯 Resultado: FinOps habilitado, baseline para otimização

DRI: @data-engineer (schema), @dev (ingest), @architect (UI contract)
```

---

### **Ciclo 2: Feature Flags & Curadoria Dinâmica (Sprint +3) — 20h**

```
✅ O que: Permitir rollouts seguros, A/B testing, experimentação
├─ Feature Flags Table (new)
│  ├─ flag_name (enableCuratedTop5, enableFinOpsAlerts, etc)
│  ├─ enabled (boolean)
│  └─ config (JSON para parametrização)
│
├─ Curadoria Dinâmica
│  ├─ Flag enableCuratedTop5: Mostra/oculta modelos além dos 5 curados
│  ├─ Flag enableFinOpsAlerts: Ativa/desativa alertas de orçamento
│  └─ Flag enableNewAgentUI: Testa novo design de agent cockpit
│
└─ Admin Panel
   └─ Per-tenant feature flag management

🎯 Resultado: Rollouts controlados, zero downtime, fácil rollback

DRI: @architect (design), @dev (implementation)
```

---

### **Ciclo 3: Dashboards & Alertas (Sprint +4) — 30h**

```
✅ O que: Visibilidade executiva, monitoramento proativo, alertas
├─ Dashboard /dashboards/ai-operations
│  ├─ KPI Cards: Custo/mês, agents ativos, chamadas/dia, latência p50/p95
│  ├─ Charts: Custo/dia (7d), latência p50/p95/p99 por agent
│  ├─ Charts: Taxa sucesso/erro por provider
│  ├─ Tables: Top 10 agents por custo, por latência, por erro-rate
│  └─ Filtros: Período, agent, provider, model
│
├─ Alertas Automáticos
│  ├─ Orçamento mensal 80%+ → notificação
│  ├─ Latência p95 > X ms → warning
│  ├─ Taxa erro > 5% → critical
│  └─ Modelo deprecated → deprecation notice
│
└─ Exportação
   ├─ Download relatório (PDF/CSV)
   └─ Agendamento de relatórios (email)

🎯 Resultado: Gestão 360° com visibilidade executiva

DRI: @architect (design), @dev (implementation), @qa (E2E tests)
```

---

## 📈 ROADMAP VISUAL

```
HOJE                    Sprint +2           Sprint +3           Sprint +4
(Sprint Atual)          (2 semanas)         (3-4 semanas)       (5-6 semanas)
└─ Ajustes Visuais      └─ Telemetria       └─ Feature Flags    └─ Dashboards
   (8-9h)                 (40h)              (20h)               (30h)
   │                      │                  │                   │
   ├─ Kanban Modelos      ├─ llm_usage       ├─ Feature table    ├─ Dashboard
   ├─ Lista View         ├─ Backend ingest   ├─ Admin panel      ├─ Alertas
   ├─ Card tooltips      ├─ Dashboard FinOps├─ Curadoria dynamic├─ Exportação
   └─ Card expansions    └─ Observabilidade  └─ A/B testing      └─ Reports

   ✅ GO-LIVE BASE      ✅ FinOps Ready    ✅ Safe Rollouts    ✅ Exec Visibility
```

---

## ✅ CHECKLIST FINAL

### **ANTES DE INICIAR AJUSTES:**

- [ ] User revisa este documento
- [ ] User confirma prioridades (Kanban? Cards? Ambos?)
- [ ] Squad alinha dependências (dev, ux, architect)

### **DURANTE AJUSTES (Sprint Atual):**

- [ ] @dev implementa Kanban + Lista View
- [ ] @ux-design-expert valida UX, tooltips, layouts
- [ ] @qa prepara E2E tests (reordenação, filtros, multi-select)
- [ ] Lint, TypeCheck, Tests rodando
- [ ] Build Vercel clean

### **APÓS AJUSTES:**

- [ ] Merge para main
- [ ] Deploy staging
- [ ] User review + QA
- [ ] Deploy produção

### **PRÓXIMO (Sprint +2):**

- [ ] @data-engineer desenhavmigration 039 (llm_usage)
- [ ] @dev ingest backend
- [ ] @architect UI contract

---

## 🎯 RECOMENDAÇÃO EXECUTIVA

**Questão para User:**

> Qual sequência prefere?

**Opção A (Recomendada):** 
- HOJE: Kanban + Lista View (2-3h cada) → Ajustes cards em paralelo (1-2h) → Merge
- ETA: 8-9h = Metade de um dia de dev

**Opção B:**
- HOJE: Apenas cards (tooltips + expansões) → Kanban + Lista ficam para amanhã
- ETA: 1-2h = Mais rápido, deixa view simples por agora

**Opção C:**
- HOJE: Cards + Kanban + Lista (tudo junto) → Mais esforço, mais completo
- ETA: 8-9h = Mesmo tempo, mas tudo de uma vez

**Minha recomendação:** **Opção A** (Kanban + Lista primeiro = maior impacto visual, depois refinamos cards)

---

**Documento:** AJUSTES_MAPEADOS_E_ROADMAP.md  
**Salvo em:** `c:\Users\Gabriel Cristofolini\Documents\SOLUCOESSISTEMAS\tech-arauz/`  
**Status:** ✅ Pronto para aprovação + execução

**Próximo passo:** Confirme sua preferência (A/B/C) e libero a Squad! 🚀
