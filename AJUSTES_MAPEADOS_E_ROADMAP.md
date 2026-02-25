# 📋 AJUSTES MAPEADOS + ROADMAP DE EVOLUÇÃO

**Data:** 2026-02-25  
**Responsável:** @aios-master + Squad (dev, architect, ux-design-expert)  
**Status:** Mapeamento completo + Roadmap de 3 ciclos  

---

## 🎯 PARTE 1: AJUSTES MAPEADOS (Imediatos — Sprint Atual)

### **1.1 KANBAN DE MODELOS IA (Agrupado por Fornecedor)**

#### Visão Atual
- ❌ Sem Kanban view para modelos
- ✅ Listagem simples com filtro por fornecedor
- ✅ Cards individuais com tier/contexto/custo
- ❌ Sem alternância Kanban/Lista

#### O Que Implementar
```
KANBAN MODELOS IA
├─ Colunas = Fornecedores (OpenAI, Anthropic, Google, etc)
├─ Cada coluna agrupa 5 modelos curados desse fornecedor
├─ Cards no Kanban = ModelCard compact (nome, tier, contexto, custo)
├─ Drag-drop = reordenar modelos (atualizar display_order)
└─ Toggle View = Alternar Kanban ↔ List (como ProjectsContent)
```

#### Padrão de Referência
- **Template:** `src/app/projetos/projects-content.tsx` (linhas 175-650)
  - `ViewToggle` component para alternar Kanban/Lista
  - `KanbanBoard` com colunas dinâmicas
  - `ProjectListView` para visualização tabular
  - `SplitView` para cockpit lateral

#### Implementação Estimada
- **Arquivo novo:** `src/components/lm-models/ModelsKanbanCard.tsx` (card compacto)
- **Arquivo novo:** `src/components/lm-models/ModelsListView.tsx` (tabela)
- **Atualizar:** `src/app/auxiliares/modelos-ia/modelos-ia-content.tsx` (adicionar ViewToggle + Kanban)
- **Impacto:** +150 LOC, novo estado `viewMode`, reutilizar `KanbanBoard` existente
- **ETA:** 2-3h (1 dev)

#### Mockup Visual
```
┌─────────────────────────────────────────────────────────────┐
│ Modelos IA                              [🔄 Kanban | List] │
├─────────────────────────────────────────────────────────────┤
│
│  OpenAI          │ Anthropic         │ Google Gemini
│  ────────────────────────────────────────
│  ┌──────────────┐│ ┌──────────────┐│ ┌──────────────┐
│  │ 🟢 entry     ││ │ 🟢 entry     ││ │ 🔵 balanced  │
│  │ GPT-4o mini  ││ │ Haiku 3.5    ││ │ Gemini Flash │
│  │ 128K tokens  ││ │ 200K tokens  ││ │ 1M tokens    │
│  │ $0,00015/1k  ││ │ $0,0008/1k   ││ │ free         │
│  └──────────────┘│ └──────────────┘│ └──────────────┘
│  
│  ┌──────────────┐│ ┌──────────────┐│ ┌──────────────┐
│  │ ⚡ balanced   ││ │ ⚡ balanced   ││ │ ⚡ balanced  │
│  │ GPT-4o       ││ │ Sonnet 3.5   ││ │ Gemini Pro   │
│  │ 128K tokens  ││ │ 200K tokens  ││ │ 1M tokens    │
│  │ $0,005/1k    ││ │ $0,003/1k    ││ │ $0,005/1k    │
│  └──────────────┘│ └──────────────┘│ └──────────────┘
│  
│  ... (3 mais por fornecedor)
│
└─────────────────────────────────────────────────────────────┘
```

---

### **1.2 LISTA VIEW PARA MODELOS IA**

#### O Que Implementar
```
TABELA MODELOS IA (Similar a ProjectListView)
├─ Colunas: Nome | Model ID | Fornecedor | Tier | Contexto | Custo In/Out | Status | Ações
├─ Ordenação: Clicável em headers (display_order, tier, nome)
├─ Filtros: Fornecedor, Tier, Status (ativo/inativo)
├─ Seleção: Checkbox multi-select → Ações em massa (ativar, desativar)
├─ Paginação: 20 registros/página (ou scroll infinito)
└─ Responsivo: Scroll horizontal em mobile
```

#### Padrão de Referência
- **Template:** `src/components/views/ProjectListView.tsx` (tabela de projetos)
  - Colunas configuráveis
  - Ordenação e filtros
  - Seleção multi-select
  - Ações em linha (editar, deletar)

#### Implementação Estimada
- **Arquivo novo:** `src/components/lm-models/ModelsListView.tsx` (+200 LOC)
- **Reutilizar:** Componentes UI (Button, Badge, Checkbox, etc)
- **ETA:** 2-3h (1 dev)

---

### **2. VALIDAÇÃO/COMPLETAMENTO DE CARDS 360°**

#### **2.1 ModelCard — Campos Disponíveis**

**Campos Obrigatórios (Já Presentes):**
- ✅ Nome do modelo (name)
- ✅ ID técnico (model_id)
- ✅ Fornecedor (provider via join)
- ✅ Contexto (context_window)
- ✅ Máx. tokens (max_tokens)
- ✅ Custos (input_cost_per_1k_tokens, output_cost_per_1k_tokens)
- ✅ Tier (tier badge com cores)
- ✅ Documentação (docs_url link)
- ✅ Status (is_active badge)

**Campos Opcionais a Validar/Adicionar:**
- ⚠️ Temperatura padrão (default_temperature) — exibir?
- ⚠️ Descrição do modelo (description) — exibir no cockpit?
- ⚠️ Data de última atualização (updated_at) — "Atualizado em X dias"?
- ⚠️ Benchmarks/Performance (não em DB) — futuro
- ⚠️ Tags/Use cases (não em DB) — futuro

**Checklist:**
- ✅ Estrutura do card está completa (5 seções: header, provider, contexto, custo, footer)
- ⚠️ Adicionar tooltip em "Contexto" (explicar o que é e para que serve)
- ⚠️ Adicionar tooltip em "Tier" (explicar diferenças: entry vs balanced vs pro vs flagship)
- ✅ Cores de tier estão configuradas (emoji + background)
- ✅ Documentação é clicável e abre em nova aba

**Recomendação:** Card está **90% completo**. Adicionar apenas tooltips para clareza.

---

#### **2.2 ProviderCard — Campos Disponíveis**

**Campos Obrigatórios (Verificar):**
- ✅ Nome do fornecedor (name)
- ✅ Slug (para identificação técnica)
- ⚠️ Descrição (description) — presente?
- ✅ Emoji/Ícone (icon_emoji)
- ✅ Cor (color_hex)
- ✅ Endpoint API (api_endpoint) — mostrar em card?
- ✅ Status (is_active)
- ⚠️ Status sistema (is_system) — badge "Bloqueado" se true?
- ⚠️ Documentação (docs_url) — presente em table?
- ⚠️ Modelos ativos (count de lm_models) — mostrar em card?

**Estrutura Proposta:**
```
┌─────────────────────────────────┐
│ 🤖 OpenAI              [Ativo]  │
├─────────────────────────────────┤
│ API: https://api.openai.com/v1  │
│ Modelos: 5 ativos               │ ← NEW (count)
├─────────────────────────────────┤
│ Documentação →                  │
│ Últimos modelos:                │ ← NEW (recent 3)
│  • GPT-4o (balanced)            │
│  • GPT-4o mini (entry)          │
│  • o1 (flagship)                │
├─────────────────────────────────┤
│ [Editar] [Deletar]              │
└─────────────────────────────────┘
```

**Implementação:**
- ⚠️ Adicionar seção "Modelos ativos" (contar lm_models ativo deste provider)
- ⚠️ Adicionar seção "Últimos modelos" (listar top 3 por display_order)
- ⚠️ Validar que description está presente
- ✅ Mostrar docs_url em card (link)

**ETA:** 1h (validar structure, adicionar 2 seções)

---

#### **2.3 AgentCard — Campos Disponíveis**

**Campos Obrigatórios (Verificar):**
- ✅ Nome do agente (name)
- ⚠️ Slug (slug) — usar para URL?
- ⚠️ Descrição (description)
- ⚠️ Status (status: draft | published | deprecated)
- ⚠️ Persona (persona) — mostrar?
- ⚠️ Objetivo (prompt_objective)
- ✅ Modelo padrão (model_provider + model_id)
- ✅ Tipo de agente (agent_type_id reference)
- ⚠️ Ferramentas (runtime_tool_ids) — count?
- ⚠️ Temperatura (model_temperature)
- ⚠️ Métricas de sucesso (não em DB) — futuro

**Estrutura Proposta:**
```
┌─────────────────────────────────┐
│ 🧠 Architect (Aria)   [Draft]   │
├─────────────────────────────────┤
│ Tipo: Visionary                 │
│ Objetivo: Design systems...     │
├─────────────────────────────────┤
│ Modelo: Claude 3.5 Sonnet       │
│ Temperatura: 0.7                │
│ Ferramentas: 8                  │ ← NEW (count)
├─────────────────────────────────┤
│ Versões publicadas: 3           │ ← NEW (count from agent_versions)
│ Última atualização: há 2 dias   │
├─────────────────────────────────┤
│ [Editar] [Publicar] [Deletar]   │
└─────────────────────────────────┘
```

**Implementação:**
- ⚠️ Validar que description está presente em agents table
- ⚠️ Adicionar count de tools (runtime_tool_ids.length)
- ⚠️ Adicionar count de versões (JOIN com agent_versions)
- ✅ Mostrar status com badge
- ✅ Mostrar modelo padrão e temperatura
- ⚠️ Adicionar timestamp relativo (updated_at)

**ETA:** 2h (validar schema, adicionar 3 seções, joins)

---

## 🚀 PARTE 2: ROADMAP DE EVOLUÇÃO (Ciclos Posteriores)

### **Ciclo 1: Telemetria & FinOps (Sprint +2)**

#### **Objetivo:** Instrumentar chamadas LLM com dados estruturados

**O Que Implementar:**

1. **Tabela `llm_usage` (nova migration):**
   ```sql
   CREATE TABLE llm_usage (
     id UUID PRIMARY KEY,
     tenant_id UUID (RLS),
     agent_id UUID REFERENCES agents,
     provider_id UUID REFERENCES lm_providers,
     model_id UUID REFERENCES lm_models,
     
     -- Telemetria
     tokens_in INTEGER,
     tokens_out INTEGER,
     total_tokens INTEGER,
     latency_ms INTEGER,
     
     -- Financeiro
     cost_usd NUMERIC(10,8),
     cost_input_usd NUMERIC(10,8),
     cost_output_usd NUMERIC(10,8),
     
     -- Contexto
     request_type VARCHAR (e.g., "chat", "completion", "embedding"),
     status VARCHAR (e.g., "success", "error", "timeout"),
     error_message TEXT,
     
     -- Audit
     user_id UUID REFERENCES auth.users,
     session_id VARCHAR,
     created_at TIMESTAMP DEFAULT now()
   );
   
   -- Índices
   CREATE INDEX idx_llm_usage_agent ON llm_usage(agent_id);
   CREATE INDEX idx_llm_usage_model ON llm_usage(model_id);
   CREATE INDEX idx_llm_usage_provider ON llm_usage(provider_id);
   CREATE INDEX idx_llm_usage_created ON llm_usage(created_at DESC);
   CREATE INDEX idx_llm_usage_cost ON llm_usage(cost_usd);
   ```

2. **Backend: Ingest de logs (services/ai):**
   - Capturar token counts após cada chamada LLM
   - Calcular custo baseado em lm_models (input/output costs)
   - Inserir em llm_usage com latência

3. **Frontend: Dashboard FinOps (nova página):**
   - Custo total/dia, semana, mês
   - Custo por agent, por provider, por tier
   - Latência p50, p95, p99
   - Taxa de sucesso/erro
   - Comparativo período-anterior

**Impacto:**
- Habilitado FinOps completo
- Baseline para otimização de custos
- Alertas por orçamento

**DRI:** @data-engineer (schema), @dev (ingest), @architect (dashboard contract)

---

### **Ciclo 2: Feature Flags & Curadoria Dinâmica (Sprint +3)**

#### **Objetivo:** Permitir curadoria per-tenant e experimentação

**O Que Implementar:**

1. **Feature Flags (nova tabela):**
   ```sql
   CREATE TABLE feature_flags (
     id UUID PRIMARY KEY,
     tenant_id UUID REFERENCES tenants,
     flag_name VARCHAR (e.g., "enableCuratedTop5", "enableFinOps"),
     enabled BOOLEAN DEFAULT false,
     config JSONB (para armazenar valores adicionais),
     created_at TIMESTAMP,
     updated_at TIMESTAMP
   );
   ```

2. **Curadoria Dinâmica:**
   - Flag `enableCuratedTop5`: Ativa/desativa filtro de 5 modelos por provider
   - Flag `enableFinOpsAlerts`: Ativa/desativa alertas de custo
   - Flag `enableNewAgentUI`: Testa novo design de agent cockpit
   - Etc.

3. **UI:** Admin panel para gerenciar flags (por tenant)

**Impacto:**
- Rollouts seguros (gradual, per-tenant, rollback imediato)
- A/B testing
- Experimentação controlada

**DRI:** @architect (design), @dev (implementation)

---

### **Ciclo 3: Dashboards & Observabilidade (Sprint +4)**

#### **Objetivo:** Visibilidade 360° de saúde, custo, performance

**O Que Implementar:**

1. **Dashboard Executivo (nova página `/dashboards/ai-operations`):**
   - KPI cards: Custo total, agents ativos, chamadas/dia, latência média
   - Chart: Custo/dia (7 últimos dias)
   - Chart: Latência p50/p95/p99 por agent
   - Chart: Taxa sucesso/erro por provider
   - Tabela: Top 10 agents por custo
   - Tabela: Top 10 agents por latência

2. **Alerts:**
   - Orçamento mensal 80%+ gasto → notificação
   - Latência p95 > X ms → warning
   - Taxa erro > 5% → critical
   - Modelo deprecated → deprecation notice

3. **Exportação:**
   - Download relatório (PDF/CSV)
   - Agendamento de relatórios (email)

**Impacto:**
- Visibilidade para executivos
- Proativo monitoramento de saúde
- Data-driven decision making

**DRI:** @architect (design), @dev (implementation), @qa (E2E tests)

---

## 📊 TIMELINE CONSOLIDADO

```
HOJE (Sprint Atual):
├─ ✅ Migrations 037 + 038 deployed
├─ ✅ Frontend 360° (tipos, cards, ordenação)
├─ ⏳ AJUSTE 1.1: Kanban Modelos IA (2-3h)
├─ ⏳ AJUSTE 1.2: Lista View Modelos IA (2-3h)
├─ ⏳ AJUSTE 2: Validar/completar cards (1-2h)
└─ ✅ Quality gates (lint, typecheck, tests)

Sprint +2 (Telemetria):
├─ Migration llm_usage
├─ Backend ingest
├─ Dashboard FinOps
└─ Observabilidade baseada em dados

Sprint +3 (Feature Flags):
├─ Tabela feature_flags
├─ Admin panel
├─ Rollouts seguros
└─ A/B testing capabilidade

Sprint +4 (Dashboards):
├─ Dashboard executivo
├─ Alertas automáticos
├─ Relatórios agendados
└─ Visibilidade 360° completa
```

---

## 🎯 RECOMENDAÇÃO EXECUTIVA

### **Imediato (Hoje):**
1. Implementar Kanban + Lista para modelos (reutilizar código de Projetos)
2. Validar/completar campos nos cards (adicionar tooltips, counts, timestamps)
3. **Merge para main + deploy staging**

### **Próximo (Sprint +2):**
4. Telemetria completa (tabela llm_usage + ingest + dashboard)

### **Futuro (Sprint +3+):**
5. Feature flags + Curadoria dinâmica
6. Dashboards executivos + Alertas

### **Impacto Esperado:**
- ✅ **Gestão 360° completa** de agentes, modelos, fornecedores (TODAY)
- ✅ **FinOps habilitado** com dados estruturados (Sprint +2)
- ✅ **Rollouts controlados** com feature flags (Sprint +3)
- ✅ **Visibilidade executiva** com dashboards (Sprint +4)

---

## 📝 PRÓXIMOS PASSOS

**User (você):**
1. Revisar este plano
2. Confirmar prioridades (Kanban primeiro? Cards? Ambos?)
3. Autorizar execução dos ajustes imediatos

**Squad:**
1. @dev: Preparar Kanban + Lista view (reutilizar ProjectsContent)
2. @ux-design-expert: Validar tooltips, layout de cards expandidos
3. @architect: Desenhar contrato telemetria (Sprint +2)
4. @qa: Preparar E2E tests para Kanban reordenação, filters, multi-select

---

**Documento gerado por:** @aios-master  
**Data:** 2026-02-25 18:45 UTC  
**Status:** Pronto para aprovação + execução
