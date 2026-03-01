# Epic 4: AI Features — SQL QA Chat + Gestão 360° de Agentes

**Epic ID:** EPIC-4
**Data Criação:** 2026-03-01
**Orquestração:** @pm (Morgan)
**Status:** Ready for Development

---

## Objetivo

Entrega de infraestrutura de chat interativo com LLM (SQL QA) e dashboard de gestão 360° de agentes AI em produção, completando o ciclo de IA do Portal Tech Arauz com observabilidade, controle de custos e operacionalização.

---

## Contexto e Visão

O Portal Tech Arauz possui infraestrutura AI em produção (Migration 041, 8 tabelas, FastAPI + LangSmith) mas carece de:

1. **Interação com usuários**: Não há chatbot ou interface conversacional
2. **Observabilidade operacional**: Sem métricas granulares de sessões, mensagens, custos por agente
3. **Controle de recursos**: Sem budget enforcement, rate limiting ou rastreamento de deployments
4. **Gestão unificada**: Agentes espalhados por módulos sem visão consolidada

Este épico resolve os 3 pilares:
- **Chat**: Interface conversacional "Projects SQL QA" com validação SQL + execução segura
- **Dashboard 360°**: 4 KPIs + 2 gráficos + gauge de budget por agente
- **Segurança**: Whitelist de tabelas, SQL injection blocker, cross-tenant isolation

---

## Escopo

### Incluído

- Migration 042: 11 tabelas + ALTERs + RLS + índices
- Backend: Multi-provider LLM factory (OpenAI, Anthropic, Google, Azure)
- Backend: Session service + 3 endpoints REST (POST /chat, GET /sessions, GET /sessions/{id}/messages)
- Backend: LCEL chain com 5 spans LangSmith + budget enforcement
- Frontend: Chat UI com API routes proxy
- Frontend: Dashboard 360° com métricas, tabelas Ferramentas/Deployments
- QA Gate: Security review (injection, cross-tenant, DML blocker)

### Não Incluído

- Mobile chat interface
- Webhooks/callbacks assíncronos
- Multi-language chat (apenas pt-BR)
- Fine-tuning de LLM
- Histórico de chats > 12 meses
- Admin panel para moderar conversas

---

## Critérios de Sucesso

1. Chat funcional de ponta a ponta (E2E)
2. Sessions + histórico persistido no banco
3. SQL validado com whitelist + blocker de DML
4. LangSmith: 5 child spans por turn de conversa
5. Dashboard 360° renderizando corretamente
6. Segurança: Sem SQL injection, sem cross-tenant leaks, DML bloqueado
7. Zero regressão em módulos existentes
8. npm run lint + npm run typecheck + npm run audit:rls passam

---

## Arquitetura de Alto Nível

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                   │
├─────────────────────────────────────────────────────────┤
│  ChatContent + ChatBubble (optimistic updates)         │
│  AgentMetrics360 (4 KPIs + 2 charts)                  │
│  API routes: POST /api/chat, GET /api/sessions        │
└────────────────────────┬────────────────────────────────┘
                         │
                    (Proxy routes)
                         │
        ┌────────────────┴──────────────────┐
        │                                   │
┌───────▼──────────────────────┐  ┌────────▼──────────────────┐
│   FastAPI Backend (Python)   │  │  Supabase (PostgreSQL)   │
├──────────────────────────────┤  ├──────────────────────────┤
│ Session Service              │  │ Migration 042:           │
│  - get_or_create(session)    │  │ ├─ agent_sessions        │
│  - load_history()            │  │ ├─ agent_messages        │
│  - persist_turn()            │  │ ├─ agent_metrics_daily   │
│  - update_usage()            │  │ ├─ agent_deployments     │
│                              │  │ ├─ agent_tools           │
│ LCEL Chain:                  │  │ ├─ budget_limits         │
│  1. Intent Classifier        │  │ ├─ whitelisted_tables    │
│  2. SQL Generator            │  │ ├─ sql_audit_log         │
│  3. SQL Validator            │  │ ├─ llm_costs             │
│  4. SQL Executor             │  │ └─ ...                   │
│  5. Response Formatter       │  │                          │
│                              │  │ RLS Policies: 4 (multi)  │
│ LLM Factory:                 │  │ Índices: Period + tenant │
│  - OpenAI                    │  │ + service_filter         │
│  - Anthropic                 │  │                          │
│  - Google                    │  │ LangSmith: Tracing       │
│  - Azure                     │  │ (5 child spans/turn)     │
│                              │  │                          │
│ SQL Validator (sqlglot)      │  │                          │
│  - Whitelist check           │  │                          │
│  - DML blocker               │  │                          │
│  - Injection detector        │  │                          │
└──────────────────────────────┘  └──────────────────────────┘
        │
        └─► LangSmith (Observability)
```

---

## Tabelas da Migration 042

| Tabela | Propósito | Campos-chave |
|--------|-----------|--------------|
| `agent_sessions` | Contexto de chat por sessão | id, tenant_id, user_id, agent_id, started_at, ended_at, status, token_usage |
| `agent_messages` | Turnos de conversa (user + assistant) | id, session_id, role, content, metadata, created_at, tokens_used |
| `agent_metrics_daily` | KPI aggregado por agente/dia | id, tenant_id, agent_id, date, sessions_count, messages_count, cost_total, avg_latency_ms, success_rate |
| `agent_deployments` | Rastreamento de deploys (versão, env, config) | id, agent_id, version, environment, deployed_at, deployed_by, config_hash, status |
| `agent_tools` | Ferramentas disponíveis por agente | id, agent_id, tool_name, enabled, config_json |
| `budget_limits` | Limite de spend por tenant/agent | id, tenant_id, agent_id, monthly_limit_usd, current_month_spent_usd, reset_date |
| `whitelisted_tables` | Tabelas permitidas para SQL QA | id, tenant_id, schema, table_name, columns_readable, columns_writable |
| `sql_audit_log` | Auditoria de SQL executadas | id, tenant_id, session_id, sql_text, executed_by, executed_at, result_count, error_msg, cost_usd |
| `llm_costs` | Rastreamento de custo por modelo | id, tenant_id, model, input_tokens, output_tokens, cost_usd, created_at |
| + 2 tabelas de suporte | Config, metadata, e versioning | (conforme Design 042) |

---

## Stories

### Story 4.1 — Database Foundation: Migration 042
**Status:** Ready for Development
**Executor:** @data-engineer (Dara)
**Quality Gate:** @dev (Dex)
**Bloqueante:** Sim (todas as outras stories dependem)

**Objetivo**
Criar migration 042 com 11 tabelas, ALTERs nas existentes, RLS policies multi-tenant e índices estratégicos.

**Aceitação**
- [ ] Migration criada em `supabase/migrations/20260301_042_ai_features_chat_and_360.sql`
- [ ] 11 tabelas com UUIDs, timestamps, tenant_id obrigatório
- [ ] RLS policies: USING (true) WITH CHECK (true) em todas (ADR-001)
- [ ] Índices em (tenant_id, agent_id), (tenant_id, service), (created_at DESC)
- [ ] ALTERs em agent_sessions, agent_messages para FK + constraints
- [ ] `npm run audit:rls` passa 100%
- [ ] Zero hardcoded values (usar $1, $2 para parameterização)

**Checklist de Qualidade**
- [ ] Schema validado contra padrão AIOS
- [ ] RLS testado com 3 tenants (cross-tenant bloqueado)
- [ ] Índices explicados (query planner)
- [ ] Foreign keys e constraints documentados
- [ ] Rollback procedure testada

---

### Story 4.2 — Backend Core: Multi-provider Factory + SQL Validator
**Status:** Blocked by Story 4.1
**Executor:** @dev (Dex)
**Quality Gate:** @architect (Aria)

**Objetivo**
Criar factory.py (multi-provider LLM) e sql_validator.py (sqlglot + whitelist + DML blocker).

**Aceitação**
- [ ] `packages/api/src/llm_factory.py` com 4 providers (OpenAI, Anthropic, Google, Azure)
- [ ] Provider interface: `get_client(model: str) -> Any`, `get_cost(tokens_in, tokens_out) -> float`
- [ ] `packages/api/src/sql_validator.py` com:
  - Whitelist check (vs `whitelisted_tables`)
  - DML blocker (DELETE, UPDATE, INSERT forbidden)
  - SQL injection detector (sqlglot parsing)
- [ ] Pytest suite com 15+ casos (happy path + injection attacks + DML attempts)
- [ ] 80%+ cobertura

**Checklist de Qualidade**
- [ ] Injection attacks testadas ('; DROP TABLE --, xp_cmdshell, etc.)
- [ ] DML blocker testado (UPDATE/DELETE/INSERT rejeitadas)
- [ ] Whitelist logic validada (tables permitidas retornam OK, other devolvem erro)
- [ ] Multi-provider fallback testado (OpenAI down → Anthropic)
- [ ] Cost calculation validada vs pricing oficial

---

### Story 4.3 — Backend Chat: Session Service + Endpoints
**Status:** Blocked by Story 4.1
**Executor:** @dev (Dex)
**Quality Gate:** @architect (Aria)

**Objetivo**
Implementar session service e 3 endpoints REST.

**Aceitação**
- [ ] `packages/api/src/session_service.py` com métodos:
  - `get_or_create(user_id, tenant_id, agent_id) -> session_id`
  - `load_history(session_id) -> List[Message]`
  - `persist_turn(session_id, user_msg, assistant_msg, tokens_used) -> message_id`
  - `update_usage(session_id, tokens_in, tokens_out, cost_usd)`
- [ ] POST `/chat` (user message in, assistant message out) — 200ms timeout
- [ ] GET `/sessions` (list sessions by tenant/user) — pagination, filters
- [ ] GET `/sessions/{id}/messages` (history) — pagination, filter by role
- [ ] Error handling: 400 (bad req), 401 (unauth), 404 (not found), 429 (rate limit), 500 (error)
- [ ] Pytest suite com integração contra FastAPI local

**Checklist de Qualidade**
- [ ] Endpoints testados contra database local
- [ ] Session isolation testado (cross-tenant bloqueado)
- [ ] Rate limiting testado (429 após N requests)
- [ ] Error messages são informativos mas não expõem secrets
- [ ] Response times < 200ms (99th percentile)

---

### Story 4.4 — Backend SQL QA Chain (LCEL)
**Status:** Blocked by Stories 4.2, 4.3
**Executor:** @dev (Dex)
**Quality Gate:** @architect (Aria)

**Objetivo**
Implementar LCEL chain com 5 etapas + LangSmith tracing + budget enforcement.

**Aceitação**
- [ ] LCEL chain: `intent_classifier → sql_generator → sql_validator → sql_executor → response_formatter`
- [ ] Intent classifier: "query", "analysis", "summary", "other"
- [ ] SQL generator: prompt → SQL text
- [ ] SQL validator: usar sql_validator.py (Story 4.2)
- [ ] SQL executor: executar contra banco, capturar resultado
- [ ] Response formatter: resultado SQL → texto legível
- [ ] LangSmith tracing: 5 child spans (um por etapa) + parent span
- [ ] Budget guard: se `cost > monthly_limit`, retorna erro
- [ ] Integration test: input natural language → SQL → resultado formatado

**Checklist de Qualidade**
- [ ] Cada etapa retorna estrutura consistent (input, output, metadata)
- [ ] Erros em uma etapa não quebram cadeia (graceful fallback)
- [ ] LangSmith spans aparecem com timing correto
- [ ] Budget enforcement testado (overspend bloqueado)
- [ ] E2E test: "Mostre top 5 projetos por custo" → SQL correto executado

---

### Story 4.5 — Frontend: Chat UI
**Status:** Blocked by Story 4.3
**Executor:** @dev (Dex)
**Quality Gate:** @ux-design-expert (Uma)

**Objetivo**
Implementar interface de chat conversacional com componentes + API proxy.

**Aceitação**
- [ ] API routes em `src/app/api/chat.ts` e `src/app/api/sessions.ts` (proxy para FastAPI)
- [ ] Componente `ChatContent`: renderiza list de messages (user/assistant bubbles)
- [ ] Componente `ChatBubble`: single message com metadata (timestamp, tokens)
- [ ] Componente `ChatInput`: textarea com "Send" button, desabilitado enquanto loading
- [ ] Auto-scroll: page scroll para última message quando nova chega
- [ ] Optimistic updates: user message aparece imediatamente, assistant message aparece on confirmation
- [ ] Error handling: toast com mensagem + retry button
- [ ] Loading state: spinner enquanto waiting para resposta
- [ ] Empty state: "Comece uma nova conversa" quando nenhuma sessão
- [ ] Pagination: carregar histórico anterior quando scroll para cima

**Checklist de Qualidade**
- [ ] Chat E2E funcional: user digita, message aparece, assistant responde
- [ ] Optimistic updates não causam flicker
- [ ] Erros tratados sem quebrar componente
- [ ] Accessibility: ARIA labels, keyboard navigation
- [ ] Responsivo: desktop + mobile
- [ ] Performance: <500ms para render de novo message

---

### Story 4.6 — Frontend: Dashboard 360° + Tabs Ferramentas/Deployments
**Status:** Blocked by Story 4.1
**Executor:** @dev (Dex)
**Quality Gate:** @ux-design-expert (Uma)

**Objetivo**
Criar dashboard unificado de gestão de agentes com 4 KPIs, 2 gráficos, gauge de budget, e 2 tabs adicionais.

**Aceitação**
- [ ] Componente `AgentMetrics360`:
  - 4 KPIs: Sessions count (24h), Avg latency (ms), Success rate (%), Cost YTD (USD)
  - 2 gráficos: Sessions trend (7d), Cost breakdown by model (pie chart)
  - BudgetGauge: visual bar mostrando % de budget usado (verde, amarelo, vermelho)
- [ ] Tabs: "Overview", "Ferramentas", "Deployments"
  - "Overview": KPIs + gráficos
  - "Ferramentas": lista de `agent_tools` com toggle enable/disable
  - "Deployments": lista de `agent_deployments` com status + version + data deploy
- [ ] API routes para fetch: `GET /api/agent-metrics`, `GET /api/agent-tools`, `GET /api/agent-deployments`
- [ ] Filters: agent selector, date range (24h, 7d, 30d, YTD)
- [ ] Refresh: auto-refresh a cada 60s, manual refresh button

**Checklist de Qualidade**
- [ ] Gráficos renderizam corretamente (não vazios, labels visíveis)
- [ ] KPIs atualizam quando filtros mudam
- [ ] Tabs funcionam sem quebrar estado
- [ ] Responsividade: desktop + tablet (mobile opcional)
- [ ] Performance: <1s para carregar dados

---

### Story 4.7 — Hardening: Security Review + QA Gate Final
**Status:** Blocked por Stories 4.1-4.6
**Executor:** @qa (Quinn)
**Quality Gate:** @devops (Gage) → Push

**Objetivo**
Security review completo + testes finais + push para main.

**Aceitação**
- [ ] `npm run lint` passa (0 errors, 0 warnings)
- [ ] `npm run typecheck` passa (0 TS errors)
- [ ] `npm run audit:rls` passa (100%, todas policies testadas)
- [ ] `npm test` passa (80%+ cobertura)
- [ ] Security review:
  - [ ] SQL injection: nenhuma falha (sqlglot parser validou 50+ payloads)
  - [ ] Cross-tenant: tenant_id obrigatório em todas queries (audit log verificado)
  - [ ] DML blocker: DELETE/UPDATE/INSERT rejeitadas (3 test cases)
  - [ ] Budget enforcement: overspend bloqueado (test case)
  - [ ] Token exposure: nenhum token em logs/error messages (grep `-[sS]ecret\|[tT]oken\|[pP]ass`)
- [ ] Regressão: testes E2E para módulos existentes (Projetos, Cronogramas, Agentes) passam
- [ ] Performance: chat response < 500ms (99th percentile), dashboard load < 1s
- [ ] `git push` (delegado @devops) e `gh pr create` (delegado @devops)
- [ ] PR checklist: descrição, AC verificadas, screenshots de chat/dashboard

**Checklist de Qualidade**
- [ ] CodeRabbit: auto-review passou
- [ ] Lint: sem erros estilísticos
- [ ] Type safety: 100% cobertura TypeScript
- [ ] RLS: não há brechas de tenant isolation
- [ ] Segurança: SQL validator + DML blocker + budget enforcement funcionam
- [ ] E2E: chat de ponta a ponta + dashboard renderiza

---

## Dependências Entre Stories

```
Story 4.1 (Migration 042)
├─ Story 4.2 (LLM Factory + SQL Validator)
│  └─ Story 4.4 (LCEL Chain)
│     └─ Story 4.3 (Session Service + Endpoints)
│        └─ Story 4.5 (Chat UI)
│           └─ Story 4.7 (Security Review + Push)
│
├─ Story 4.6 (Dashboard 360°)
│  └─ Story 4.7 (Security Review + Push)
│
Story 4.3 (Sessions) → Story 4.5 (Chat UI)
```

**Sequência recomendada:**
1. Story 4.1 (bloqueante)
2. Stories 4.2 + 4.6 (paralelo)
3. Story 4.3 (depende 4.1)
4. Story 4.4 (depende 4.2 + 4.3)
5. Story 4.5 (depende 4.3)
6. Story 4.7 (depende todas)

---

## Estimativa de Esforço

| Story | Executor | Dias | Complexidade |
|-------|----------|------|--------------|
| 4.1 | @data-engineer | 2 | Alto (11 tabelas + RLS) |
| 4.2 | @dev | 3 | Alto (multi-provider + validator) |
| 4.3 | @dev | 2 | Médio (service + 3 endpoints) |
| 4.4 | @dev | 2 | Alto (LCEL + LangSmith) |
| 4.5 | @dev | 3 | Médio (UI + API proxy) |
| 4.6 | @dev | 2 | Médio (dashboard + tabs) |
| 4.7 | @qa | 1 | Médio (review + push) |
| **Total** | — | **15** | — |

**Duração esperada:** 3 semanas (com overlapping)
**Time:** @data-engineer (1 dev), @dev (1 dev), @qa (1 qa), @devops (1 push)

---

## Priorização de Risco

| Risk | Severidade | Mitigação |
|------|-----------|-----------|
| SQL injection | CRÍTICA | sql_validator.py + sqlglot parsing + whitelist |
| Cross-tenant leak | CRÍTICA | RLS + tenant_id em todas queries + audit log |
| Cost overrun | ALTA | budget_limits table + enforcement + alert |
| LLM API outage | MÉDIA | multi-provider fallback (OpenAI → Anthropic) |
| Schema conflict | MÉDIA | migration 042 testada isolada + rollback procedure |
| Performance degradation | MÉDIA | response time SLA < 500ms + indexed queries |

---

## Próximos Passos

1. **@sm (River)** → `*draft` Story 4.1 (bloqueante)
2. **@po (Pax)** → `*validate-story-draft` Story 4.1
3. **@data-engineer (Dara)** → SDC para Story 4.1
4. **@dev (Dex)** → SDC paralelo para Stories 4.2, 4.6
5. **@qa (Quinn)** → QA Loop para Story 4.7
6. **@devops (Gage)** → Push final + PR creation

---

**Épico criado:** 2026-03-01
**Versão:** 1.0.0
**Orquestrador:** Morgan (@pm)
