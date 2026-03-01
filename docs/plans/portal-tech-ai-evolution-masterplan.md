# Portal Tech — Masterplan de Evolução AI Governance

**Versão:** 1.1
**Data Criação:** 2026-03-01
**Data Última Atualização:** 2026-03-01 15:30 (execução iniciada)
**Autor:** Orion (aios-master)
**Épico raiz:** Épico 7 — AI Governance, Chatbot Global e Governança de Modelos
**Status:** In Execution — Fase 1 Completa ✅

---

## 🔄 Execução & Change Log

### 2026-03-01 15:30 — Épico 1 (Fase 1: Database) ✅ COMPLETO
- **Agente:** @data-engineer (Dara)
- **Stories:** 7.1, 7.2, 7.3, 7.4
- **Migrations:** 045, 046, 047
- **Commits:** cdf17f8 + 7515d39
- **Verificações:** typecheck ✅ | RLS ✅ | Constraints ✅

### 2026-03-01 17:45 — Épico 2 (Fase 2: Backend) ✅ COMPLETO
- **Agente:** @dev (Dex)
- **Stories:** 7.5, 7.6, 7.7 (Backend LLM Real + Streaming + Fallback)
- **Commits:** 8d44fe7 + bc89ff2 + 6ebe4e0 + 89519b1

### 2026-03-01 18:30 — Épico 3 Story 7.8 (Frontend: Formulário) ✅ COMPLETO
- **Agente:** @dev (Dex)
- **Story:** 7.8 — Formulário de Edição de Agente (usage_type, show_in_shortcut, is_global_chatbot)
- **Features:**
  - ✅ Select para usage_type: Chatbot | Workflow
  - ✅ Conditional Switches: show_in_shortcut + is_global_chatbot (apenas chatbots)
  - ✅ UI: Seção azul para campos condicionais, reset automático ao trocar para workflow
  - ✅ Validação: Botão "Testar Chat" apenas para chatbots publicados
  - ✅ Types: UIAgent + DBAgent + dbAgentToUI transformer atualizado
  - ✅ TypeScript: typecheck passa sem erros
- **Commits:** 751ddf3 + 121758b
- **Próximo:** Story 7.9 (Separação Visual Chatbot/Workflow) — **READY FOR EXECUTION**

### 2026-03-01 19:15 — Épico 3 Story 7.9 (Frontend: Separação Visual) ✅ COMPLETO
- **Agente:** @dev (Dex)
- **Story:** 7.9 — Frontend: Separação Visual Chatbot vs Workflow
- **Features:**
  - ✅ Badges 🗨️ Chatbot (azul) e ⚙️ Workflow (cinza) em list view
  - ✅ Badges condicionais em Kanban view (CA para Chatbot, WF para Workflow)
  - ✅ Filtro usageType na FilterBar (Classificação: Chatbot | Workflow)
  - ✅ AgentCockpit tab "general" exibe: usageType, showInShortcut, isGlobalChatbot
  - ✅ Campos condicionais aparecem apenas para chatbots
  - ✅ Query inclui todos os campos via select('*')
- **Commits:** 5b0ee17
- **Próximo:** Story 7.10 (Módulo Governança de Modelos) — **READY FOR EXECUTION**

---

---

## 1. Propósito deste Documento

Este documento é a **fonte primária de planejamento** para a evolução estratégica do Portal Tech em direção a uma plataforma SaaS multi-tenant com governança avançada de IA. Ele é **auto-suficiente** — qualquer agente (Claude, GPT, Gemini, ou outro) pode executar o plano lendo apenas este arquivo, sem necessidade de contexto anterior.

### Para agentes que estão iniciando a execução:
1. Leia a Seção 2 (Estado Atual) — entenda o que já existe
2. Leia a Seção 3 (Arquitetura) — entenda as decisões técnicas fixas
3. Leia a Seção 4 (Épicos) — encontre o próximo épico pendente
4. Siga os padrões AIOS na Seção 5 (Protocolo de Execução)
5. Crie as stories conforme o Seção 6 (Formato de Story)
6. Documente conforme Seção 7 (Protocolo de Documentação)

---

## 2. Estado Atual do Codebase (Baseline 2026-03-01)

### Stack Técnica
- **Frontend:** Next.js 14 (App Router) — TypeScript — `src/app/`
- **Backend AI:** FastAPI + LangGraph + LangChain — Python — `services/ai/`
- **Banco de dados:** Supabase PostgreSQL com RLS obrigatório — 44 migrations aplicadas
- **UI:** Shadcn/ui + Tailwind — design system com DM Sans
- **Deploy:** Vercel (Next.js) + serviço separado para FastAPI
- **Observabilidade:** LangSmith

### Tabelas Relevantes (já existem no banco)
| Tabela | Status |
|---|---|
| `agents` | ✅ Existe — faltam: `usage_type`, `show_in_shortcut`, `is_global_chatbot` |
| `lm_models` | ✅ Existe — faltam: `stability_level`, `release_channel`, `supports_*` |
| `lm_providers` | ✅ Existe — completa |
| `agent_sessions` | ✅ Existe — funcional |
| `agent_messages` | ✅ Existe — funcional |
| `agent_budgets`, `agent_usage_daily` | ✅ Existem |
| `model_governance_reviews` | ❌ Não existe |
| `model_cost_monitoring` | ❌ Não existe |
| `model_incidents` | ❌ Não existe |
| `model_fallback_policies` | ❌ Não existe |
| `model_change_log` | ❌ Não existe |

### Estado dos Endpoints
| Endpoint | Status |
|---|---|
| `POST /api/agents/[id]/chat` (Next.js proxy) | ✅ Existe — redireciona para FastAPI |
| `POST /agents/{id}/chat` (FastAPI) | ✅ Existe — **resposta ainda é MOCK** (TODO Story 4.4) |
| `GET /api/agents/[id]/sessions` | ✅ Existe |
| `POST /api/agents/[id]/sessions` | ✅ Existe |
| `GET /api/sessions` (sessões globais do usuário) | ❌ Não existe |

### Páginas Existentes
| Rota | Status |
|---|---|
| `/agentes` | ✅ Lista + CRUD + filtros + kanban |
| `/agentes/[id]/chat` | ✅ Chat por agente específico — sem streaming |
| `/auxiliares/modelos-ia` | ✅ Existe — falta campos de governança |
| `/auxiliares/lm-providers` | ✅ Existe — completo |
| `/auxiliares/agent-types` | ✅ Existe — completo |
| Chatbot global (floating) | ❌ Não existe |
| `/conversas` (histórico) | ❌ Não existe |
| `/auxiliares/modelos-ia/governanca` | ❌ Não existe |

### Arquivos-Chave para Referência
```
src/app/layout.tsx                                    ← ponto de inserção GlobalChatbot
src/app/agentes/[id]/chat/chat-content.tsx            ← chat existente para reutilizar padrão
src/components/agents/ChatBubble.tsx                  ← componente de mensagem reutilizável
src/components/views/SplitView.tsx                    ← padrão de painel lateral
src/components/layout/sidebar-config.ts               ← configuração da sidebar
src/types/agents.ts                                   ← types TypeScript — atualizar
src/app/api/agents/[id]/chat/route.ts                 ← proxy Next.js → FastAPI
services/ai/app/api/routes.py                         ← endpoints FastAPI (chat mock aqui)
services/ai/app/llm/factory.py                        ← LLM multi-provider (já implementado)
services/ai/app/services/session_service.py           ← serviço de sessões (já implementado)
supabase/migrations/                                  ← próxima migration: 045_*.sql
```

---

## 3. Decisões Arquiteturais Fixas (ADRs)

Estas decisões são **imutáveis** durante a execução do plano. Não questionar, seguir obrigatoriamente.

| ADR | Decisão | Motivo |
|---|---|---|
| ADR-001 | RLS em todas as tabelas: `USING (true) WITH CHECK (true)` | Padrão multi-tenant do projeto |
| ADR-002 | Token fallback: env vars quando `PREENCHER_TOKEN` | Segurança de credenciais |
| ADR-003 | Manter FastAPI — não migrar para Vercel AI SDK | LangGraph, multi-provider, LangSmith justificam |
| ADR-004 | Feature-based folder structure | Organização do projeto |
| ADR-005 | Padrão UPSERT: `(tenant_id, espaider_id)` composite UNIQUE | Sync idempotente |
| ADR-006 | **NÃO** adicionar `ai`, `openai`, `@anthropic-ai/sdk` ao package.json | Toda IA é Python-side |
| ADR-007 | Streaming SSE via `StreamingResponse` FastAPI → `ReadableStream` Next.js | Sem buffering |
| ADR-008 | Apenas `usage_type = 'chatbot'` pode abrir interface conversacional | Separação de tipos de agente |

---

## 4. Épicos e Stories

### ÉPICO 7 — AI Governance, Chatbot Global e Governança de Modelos

**Sprint:** 7
**Prioridade:** Alta
**Objetivo:** Implementar classificação de agentes por tipo, governança avançada de modelos, chat LLM real com streaming, chatbot global e histórico de conversas.

---

### ÉPICO 7 — Fase 1: Database Foundation (BLOQUEANTE)

**Agente executor:** `@data-engineer` (Dara)
**QA Gate:** `@qa` (Quinn)
**Dependências:** Nenhuma
**Desbloqueia:** Todas as stories seguintes

---

#### Story 7.1 — DB: Classificação de Agentes por Tipo de Uso

**Story ID:** 7.1
**Épico:** 7 — AI Governance
**Sprint:** 7
**Agente:** `@data-engineer` (Dara)
**QA Gate:** `@qa` (Quinn)
**Esforço:** 0.5 dia
**Prioridade:** CRÍTICA (bloqueante)
**Status:** Ready

##### Objetivo
Adicionar campos `usage_type`, `show_in_shortcut` e `is_global_chatbot` na tabela `agents` via migration SQL, permitindo classificação de agentes como Chatbot (interface conversacional) ou Workflow (execução por evento).

##### Como Usuário
Como administrador do Portal Tech, quero classificar cada agente como Chatbot ou Workflow, para controlar quais agentes aparecem na interface de chat global e quais são executados por evento interno.

##### Tarefas de Implementação

- [ ] Criar arquivo `supabase/migrations/045_agent_usage_type.sql`
- [ ] Adicionar coluna `usage_type TEXT NOT NULL DEFAULT 'chatbot' CHECK (usage_type IN ('chatbot', 'workflow'))` em `agents`
- [ ] Adicionar coluna `show_in_shortcut BOOLEAN NOT NULL DEFAULT FALSE` em `agents`
- [ ] Adicionar coluna `is_global_chatbot BOOLEAN NOT NULL DEFAULT FALSE` em `agents`
- [ ] Adicionar constraint: `CHECK (NOT (is_global_chatbot = TRUE AND usage_type != 'chatbot'))`
- [ ] Manter RLS policies existentes (não recriar, apenas confirmar que continuam válidas)
- [ ] Aplicar migration via `supabase db push`
- [ ] Atualizar `docs/schema/SCHEMA.md` com os novos campos

##### Critérios de Aceite
- [ ] Migration aplicada sem erro
- [ ] `SELECT usage_type, show_in_shortcut, is_global_chatbot FROM agents LIMIT 1` retorna os campos
- [ ] Inserir agent com `is_global_chatbot = TRUE` e `usage_type = 'workflow'` deve falhar com constraint error
- [ ] RLS policies continuam válidas para tenant isolation
- [ ] `npm run typecheck` não quebra (types ainda não atualizados — OK, serão atualizados na Story 7.4)

##### Arquivos Modificados
- `supabase/migrations/045_agent_usage_type.sql` (CREATE)

---

#### Story 7.2 — DB: Expansão de lm_models com Campos de Governança

**Story ID:** 7.2
**Épico:** 7 — AI Governance
**Sprint:** 7
**Agente:** `@data-engineer` (Dara)
**QA Gate:** `@qa` (Quinn)
**Esforço:** 0.5 dia
**Prioridade:** CRÍTICA (bloqueante)
**Status:** Ready

##### Objetivo
Adicionar campos de ciclo de vida, canal de release e capacidades técnicas na tabela `lm_models` para suporte à governança avançada de modelos.

##### Como Usuário
Como gestor de IA, quero saber quais modelos são GA, Preview ou Experimental, e quais capacidades cada modelo suporta (tool calling, streaming, vision), para tomar decisões de governança baseadas em dados.

##### Tarefas de Implementação

- [ ] Criar arquivo `supabase/migrations/046_lm_models_governance.sql`
- [ ] Adicionar `stability_level TEXT DEFAULT 'ga' CHECK (stability_level IN ('ga', 'preview', 'experimental', 'deprecated'))`
- [ ] Adicionar `release_channel TEXT DEFAULT 'stable' CHECK (release_channel IN ('stable', 'beta', 'alpha'))`
- [ ] Adicionar `supports_tool_calling BOOLEAN DEFAULT FALSE`
- [ ] Adicionar `supports_json_mode BOOLEAN DEFAULT FALSE`
- [ ] Adicionar `supports_streaming BOOLEAN DEFAULT TRUE`
- [ ] Adicionar `supports_vision BOOLEAN DEFAULT FALSE`
- [ ] Adicionar `supports_audio BOOLEAN DEFAULT FALSE`
- [ ] Adicionar `deprecated_at TIMESTAMP WITH TIME ZONE`
- [ ] Adicionar `sunset_at TIMESTAMP WITH TIME ZONE`
- [ ] Aplicar migration via `supabase db push`
- [ ] Atualizar `docs/schema/SCHEMA.md`

##### Critérios de Aceite
- [ ] Migration aplicada sem erro
- [ ] `SELECT stability_level, release_channel, supports_streaming FROM lm_models LIMIT 1` retorna campos
- [ ] Todos os modelos existentes recebem defaults corretos (`stability_level = 'ga'`, `supports_streaming = true`)
- [ ] Campos nullable opcionais (`deprecated_at`, `sunset_at`) aceitam NULL

##### Arquivos Modificados
- `supabase/migrations/046_lm_models_governance.sql` (CREATE)

---

#### Story 7.3 — DB: Tabelas de Governança Avançada de Modelos

**Story ID:** 7.3
**Épico:** 7 — AI Governance
**Sprint:** 7
**Agente:** `@data-engineer` (Dara)
**QA Gate:** `@qa` (Quinn)
**Esforço:** 1 dia
**Prioridade:** CRÍTICA (bloqueante)
**Status:** Ready

##### Objetivo
Criar 5 novas tabelas para suporte à governança avançada de modelos: revisões, monitoramento de custo, incidentes, políticas de fallback e changelog de mudanças.

##### Como Usuário
Como responsável pela governança de IA, quero um sistema completo de revisão, monitoramento e auditoria de modelos para cumprir requisitos de compliance e rastrear o ciclo de vida de cada modelo.

##### Tarefas de Implementação

- [ ] Criar arquivo `supabase/migrations/047_model_governance_tables.sql`

**Tabela `model_governance_reviews`:**
- [ ] `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- [ ] `tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE`
- [ ] `model_id UUID NOT NULL REFERENCES lm_models(id) ON DELETE CASCADE`
- [ ] `reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL`
- [ ] `status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'requires_changes'))`
- [ ] `notes TEXT`
- [ ] `reviewed_at TIMESTAMP WITH TIME ZONE`
- [ ] `created_at TIMESTAMP WITH TIME ZONE DEFAULT now()`
- [ ] RLS: `USING (true) WITH CHECK (true)`

**Tabela `model_cost_monitoring`:**
- [ ] `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- [ ] `tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE`
- [ ] `model_id UUID NOT NULL REFERENCES lm_models(id) ON DELETE CASCADE`
- [ ] `period_start DATE NOT NULL`
- [ ] `period_end DATE NOT NULL`
- [ ] `total_requests INTEGER DEFAULT 0`
- [ ] `total_input_tokens BIGINT DEFAULT 0`
- [ ] `total_output_tokens BIGINT DEFAULT 0`
- [ ] `total_cost_usd NUMERIC(12,6) DEFAULT 0`
- [ ] `p95_latency_ms INTEGER`
- [ ] `created_at TIMESTAMP WITH TIME ZONE DEFAULT now()`
- [ ] RLS: `USING (true) WITH CHECK (true)`

**Tabela `model_incidents`:**
- [ ] `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- [ ] `tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE`
- [ ] `model_id UUID NOT NULL REFERENCES lm_models(id) ON DELETE CASCADE`
- [ ] `severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical'))`
- [ ] `description TEXT NOT NULL`
- [ ] `started_at TIMESTAMP WITH TIME ZONE DEFAULT now()`
- [ ] `resolved_at TIMESTAMP WITH TIME ZONE`
- [ ] `impact_summary TEXT`
- [ ] `created_at TIMESTAMP WITH TIME ZONE DEFAULT now()`
- [ ] `created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL`
- [ ] RLS: `USING (true) WITH CHECK (true)`

**Tabela `model_fallback_policies`:**
- [ ] `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- [ ] `tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE`
- [ ] `primary_model_id UUID NOT NULL REFERENCES lm_models(id) ON DELETE CASCADE`
- [ ] `fallback_model_id UUID NOT NULL REFERENCES lm_models(id) ON DELETE CASCADE`
- [ ] `trigger_on TEXT[] DEFAULT ARRAY['rate_limit', 'timeout', 'error_500']::TEXT[]`
- [ ] `priority INTEGER DEFAULT 1`
- [ ] `is_active BOOLEAN DEFAULT TRUE`
- [ ] `created_at TIMESTAMP WITH TIME ZONE DEFAULT now()`
- [ ] `created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL`
- [ ] `CONSTRAINT no_self_fallback CHECK (primary_model_id != fallback_model_id)`
- [ ] RLS: `USING (true) WITH CHECK (true)`

**Tabela `model_change_log`:**
- [ ] `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- [ ] `tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE`
- [ ] `model_id UUID NOT NULL REFERENCES lm_models(id) ON DELETE CASCADE`
- [ ] `changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL`
- [ ] `change_type TEXT NOT NULL CHECK (change_type IN ('created', 'updated', 'activated', 'deactivated', 'deprecated', 'deleted'))`
- [ ] `old_value JSONB`
- [ ] `new_value JSONB`
- [ ] `change_reason TEXT`
- [ ] `changed_at TIMESTAMP WITH TIME ZONE DEFAULT now()`
- [ ] RLS: `USING (true) WITH CHECK (true)`

- [ ] Aplicar migration via `supabase db push`
- [ ] Verificar que todas as 5 tabelas foram criadas
- [ ] Atualizar `docs/schema/SCHEMA.md`

##### Critérios de Aceite
- [ ] Migration aplicada sem erro
- [ ] 5 tabelas criadas: `model_governance_reviews`, `model_cost_monitoring`, `model_incidents`, `model_fallback_policies`, `model_change_log`
- [ ] Todas com `tenant_id` e RLS ativa
- [ ] Constraint `no_self_fallback` válida em `model_fallback_policies`
- [ ] Índices em `model_id` e `tenant_id` para performance

##### Arquivos Modificados
- `supabase/migrations/047_model_governance_tables.sql` (CREATE)

---

#### Story 7.4 — TypeScript: Atualizar Types para Novos Campos

**Story ID:** 7.4
**Épico:** 7 — AI Governance
**Sprint:** 7
**Agente:** `@dev` (Dex)
**QA Gate:** `@qa` (Quinn)
**Esforço:** 0.5 dia
**Prioridade:** CRÍTICA (bloqueante)
**Status:** Ready — depende 7.1, 7.2, 7.3

##### Objetivo
Atualizar o arquivo `src/types/agents.ts` adicionando os novos campos das migrations 045, 046 e 047, garantindo que o TypeScript compile sem erros.

##### Como Usuário
Como desenvolvedor, quero que os types TypeScript reflitam o schema atual do banco de dados, para que o compilador detecte erros de tipagem antes do runtime.

##### Tarefas de Implementação

- [ ] Abrir `src/types/agents.ts` e ler o arquivo completo
- [ ] Adicionar campos em interface `Agent` (ou equivalente): `usage_type: 'chatbot' | 'workflow'`, `show_in_shortcut: boolean`, `is_global_chatbot: boolean`
- [ ] Adicionar mesmos campos em `AgentHead`, `AgentListItem` (se existirem separadamente)
- [ ] Adicionar campos em interface `LmModel` (ou equivalente): `stability_level`, `release_channel`, `supports_tool_calling`, `supports_json_mode`, `supports_streaming`, `supports_vision`, `supports_audio`, `deprecated_at`, `sunset_at`
- [ ] Criar type `ModelGovernanceReview` com todos os campos da tabela
- [ ] Criar type `ModelCostMonitoring` com todos os campos da tabela
- [ ] Criar type `ModelIncident` com todos os campos da tabela
- [ ] Criar type `ModelFallbackPolicy` com todos os campos da tabela
- [ ] Criar type `ModelChangeLog` com todos os campos da tabela
- [ ] Executar `npm run typecheck` e resolver todos os erros de compilação
- [ ] Executar `npm run lint` e resolver todos os warnings

##### Critérios de Aceite
- [ ] `npm run typecheck` passa sem nenhum erro
- [ ] `npm run lint` passa sem erros (warnings permitidos se pré-existentes)
- [ ] Nenhum `any` introduzido — usar tipos específicos
- [ ] Novos types exportados corretamente do arquivo

##### Arquivos Modificados
- `src/types/agents.ts` (EDIT)

---

### ÉPICO 7 — Fase 2: Backend (Paralelo com Fase 3)

**Agente executor:** `@dev` (Dex)
**QA Gate:** `@qa` (Quinn)
**Depende de:** Stories 7.1, 7.2, 7.3, 7.4 completas
**Paralelo com:** Fase 3 (Frontend Refatoração)

---

#### Story 7.5 — Backend: Implementar LLM Real no FastAPI (Substitui Mock)

**Story ID:** 7.5
**Épico:** 7 — AI Governance
**Sprint:** 7
**Agente:** `@dev` (Dex)
**QA Gate:** `@qa` (Quinn)
**Esforço:** 2 dias
**Prioridade:** CRÍTICA (bloqueante para chatbot global)
**Status:** Ready — depende 7.1-7.4

##### Objetivo
Substituir a resposta mock em `POST /agents/{id}/chat` do FastAPI por uma chamada real ao LLM usando o `LLMFactory` já implementado, integrando com o fluxo de versionamento do agente.

##### Como Usuário
Como usuário do chat, quero receber respostas reais do modelo de IA configurado no agente, não uma resposta hardcoded, para que o chatbot seja genuinamente útil.

##### Contexto Técnico
- Arquivo principal: `services/ai/app/api/routes.py` — linha ~1001 contém: `answer = f"Mock response to: {request_body.message}"`
- LLMFactory: `services/ai/app/llm/factory.py` — já suporta OpenAI, Anthropic, Gemini, Azure
- Session service: `services/ai/app/services/session_service.py` — já funcional
- AgentService: `services/ai/app/agents/service.py` — CRUD Supabase funcional

##### Tarefas de Implementação

- [ ] Ler `services/ai/app/api/routes.py` completo
- [ ] Ler `services/ai/app/llm/factory.py` completo
- [ ] Ler `services/ai/app/agents/service.py` completo
- [ ] Identificar o endpoint `POST /agents/{id}/chat` e localizar o mock
- [ ] Buscar `agent_version` publicada do agente no Supabase via `AgentService`
- [ ] Se não houver version publicada, usar configuração draft do agente (para desenvolvimento)
- [ ] Instanciar LLM com `LLMFactory.create(provider, model_id, temperature, top_p, max_tokens)`
- [ ] Montar lista de mensagens LangChain: `SystemMessage(system_prompt)` + `HumanMessage/AIMessage` do histórico + `HumanMessage(nova_mensagem)`
- [ ] Invocar `await llm.ainvoke(messages)` e extrair `response.content`
- [ ] Extrair `response.usage_metadata` (se disponível) para tokens/custo
- [ ] Persistir run em `agent_runs` com: `model_provider`, `model_id`, `temperature`, `agent_version`, `prompt_final`, `output_bruto`, `tokens`, `custo_real`
- [ ] Atualizar `agent_usage_daily` com tokens e custo do run
- [ ] Retornar `ChatResponse` com `answer`, `tokens_used`, `cost_usd`, `session_id`
- [ ] Tratar erro `AuthenticationError` (API key inválida) → HTTP 401 com mensagem clara
- [ ] Tratar erro `RateLimitError` → HTTP 429 com mensagem clara
- [ ] Testar endpoint com `curl` ou cliente HTTP

##### Critérios de Aceite
- [ ] `POST /agents/{id}/chat` retorna resposta real do LLM (não mock)
- [ ] Response contém `answer`, `tokens_used`, `cost_usd`, `session_id`
- [ ] Run registrado em `agent_runs` no Supabase
- [ ] `agent_usage_daily` atualizado com tokens do dia
- [ ] Erros de provider retornam HTTP codes corretos (401, 429, 503)
- [ ] Testes Python em `services/ai/tests/` passam sem erros

##### Arquivos Modificados
- `services/ai/app/api/routes.py` (EDIT)

---

#### Story 7.6 — Backend: Streaming SSE para Chat

**Story ID:** 7.6
**Épico:** 7 — AI Governance
**Sprint:** 7
**Agente:** `@dev` (Dex)
**QA Gate:** `@qa` (Quinn)
**Esforço:** 2 dias
**Prioridade:** ALTA
**Status:** Ready — depende 7.5

##### Objetivo
Implementar resposta em streaming SSE no FastAPI e configurar o proxy Next.js para repassar o stream ao browser sem buffering, permitindo exibição incremental da resposta do LLM.

##### Contexto Técnico
- FastAPI suporta `StreamingResponse` com generator async
- LangChain suporta `llm.astream(messages)` retornando chunks
- Next.js Route Handler suporta `ReadableStream` como `Response`
- Frontend usa `fetch()` + `TextDecoder` + loop de `read()`

##### Tarefas de Implementação

**Backend FastAPI (`services/ai/app/api/routes.py`):**
- [ ] Criar endpoint `POST /agents/{id}/chat/stream` com `StreamingResponse`
- [ ] Implementar generator async: `async def generate(): async for chunk in llm.astream(messages): yield f"data: {json.dumps({'delta': chunk.content})}\n\n"`
- [ ] Ao final do stream, emitir: `yield f"data: {json.dumps({'done': True, 'tokens': X, 'cost': Y})}\n\n"`
- [ ] Persistir sessão e mensagem completa ao final do stream (após todos os chunks)
- [ ] Headers necessários: `Content-Type: text/event-stream`, `Cache-Control: no-cache`, `X-Accel-Buffering: no`

**Next.js Proxy (`src/app/api/agents/[id]/chat/route.ts`):**
- [ ] Adicionar suporte a streaming: detectar se request tem header `Accept: text/event-stream`
- [ ] Se streaming: fazer `fetch()` para `/agents/{id}/chat/stream` do FastAPI e retornar `Response` com `body: upstreamResponse.body`
- [ ] Garantir que `Content-Type: text/event-stream` é repassado
- [ ] Tratar erros de conexão com FastAPI

**Frontend (`src/app/agentes/[id]/chat/chat-content.tsx`):**
- [ ] Substituir `await response.json()` por leitura de stream SSE
- [ ] Implementar: `const reader = response.body.getReader(); const decoder = new TextDecoder()`
- [ ] Loop de leitura de chunks: parsear eventos SSE, atualizar estado de mensagem incrementalmente
- [ ] Mostrar indicador de processing (dots animados) enquanto stream está ativo
- [ ] Ao receber evento `done: true`, finalizar mensagem e atualizar tokens/custo

##### Critérios de Aceite
- [ ] Chat `/agentes/[id]/chat` exibe texto sendo gerado incrementalmente (streaming visual)
- [ ] Indicador de processing aparece enquanto LLM processa
- [ ] Ao finalizar, metadados de tokens e custo disponíveis
- [ ] Sem erro de CORS no console do browser
- [ ] Stream funciona corretamente no Chrome e Firefox

##### Arquivos Modificados
- `services/ai/app/api/routes.py` (EDIT)
- `src/app/api/agents/[id]/chat/route.ts` (EDIT)
- `src/app/agentes/[id]/chat/chat-content.tsx` (EDIT)

---

#### Story 7.7 — Backend: Fallback Automático Multi-Provider

**Story ID:** 7.7
**Épico:** 7 — AI Governance
**Sprint:** 7
**Agente:** `@dev` (Dex)
**QA Gate:** `@qa` (Quinn)
**Esforço:** 1 dia
**Prioridade:** ALTA
**Status:** Ready — depende 7.5, 7.3

##### Objetivo
Implementar lógica de fallback automático no LLMFactory: ao detectar erro de provider (rate limit, timeout, 500), consultar `model_fallback_policies` e tentar automaticamente o modelo fallback configurado.

##### Tarefas de Implementação

- [ ] Ler `services/ai/app/llm/factory.py` completo
- [ ] Criar método `LLMFactory.create_with_fallback(agent_id, tenant_id, supabase_client)`
  - [ ] Busca primary model config do agente
  - [ ] Consulta `model_fallback_policies` onde `primary_model_id = model_id AND is_active = true ORDER BY priority`
  - [ ] Tenta LLM primário
  - [ ] Em caso de `RateLimitError`, `APITimeoutError` ou `APIStatusError(500)`: tenta fallback em ordem de `priority`
  - [ ] Registra tentativa em `model_incidents` com severity='medium' e timestamp
  - [ ] Se todos falharem: levanta exceção com lista de providers tentados
- [ ] Integrar no endpoint de chat (Story 7.5)

##### Critérios de Aceite
- [ ] Ao configurar policy de fallback (primary → fallback), chat usa fallback quando primary falha
- [ ] Incidente registrado em `model_incidents` com severity e timestamp
- [ ] Se nenhum provider funcionar, retorna HTTP 503 com mensagem clara

##### Arquivos Modificados
- `services/ai/app/llm/factory.py` (EDIT)
- `services/ai/app/api/routes.py` (EDIT)

---

### ÉPICO 7 — Fase 3: Frontend Refatoração (Paralelo com Fase 2)

**Agente executor:** `@dev` (Dex)
**QA Gate:** `@qa` (Quinn)
**Depende de:** Stories 7.1-7.4 completas
**Paralelo com:** Fase 2 (Backend)

---

#### Story 7.8 — Frontend: Refatorar Formulário de Agente com usage_type

**Story ID:** 7.8
**Épico:** 7 — AI Governance
**Sprint:** 7
**Agente:** `@dev` (Dex)
**QA Gate:** `@qa` (Quinn)
**Esforço:** 1 dia
**Prioridade:** ALTA
**Status:** Ready — depende 7.4

##### Objetivo
Atualizar o formulário de edição de agentes para incluir seleção de `usage_type`, e controles condicionais `show_in_shortcut` e `is_global_chatbot`.

##### Tarefas de Implementação

- [ ] Ler `src/app/agentes/[id]/agent-edit-content.tsx` completo
- [ ] Adicionar campo Select para `usage_type` com opções "Chatbot" e "Workflow"
- [ ] Adicionar Switch `show_in_shortcut` (label: "Exibir no atalho global") — visível apenas quando `usage_type = 'chatbot'`
- [ ] Adicionar Switch `is_global_chatbot` (label: "Chatbot Global") — visível apenas quando `usage_type = 'chatbot'`
- [ ] Atualizar action/server action de salvar agente para incluir novos campos
- [ ] Atualizar CRUD do agente no FastAPI (`services/ai/app/agents/service.py`): aceitar e persistir `usage_type`, `show_in_shortcut`, `is_global_chatbot`
- [ ] Adicionar validação: agente com `usage_type = 'workflow'` não pode ser publicado com botão de chat
- [ ] Atualizar botão "Acessar Chat" na página de detalhe: só exibir se `usage_type = 'chatbot'`

##### Critérios de Aceite
- [ ] Formulário exibe os 3 novos campos
- [ ] Campos condicionais (`show_in_shortcut`, `is_global_chatbot`) somem quando `usage_type = workflow`
- [ ] Salvar persiste `usage_type` no banco
- [ ] Agente workflow não exibe botão de chat na UI

##### Arquivos Modificados
- `src/app/agentes/[id]/agent-edit-content.tsx` (EDIT)
- `services/ai/app/agents/service.py` (EDIT)

---

#### Story 7.9 — Frontend: Separação Visual Chatbot vs Workflow

**Story ID:** 7.9
**Épico:** 7 — AI Governance
**Sprint:** 7
**Agente:** `@dev` (Dex)
**QA Gate:** `@qa` (Quinn)
**Esforço:** 0.5 dia
**Prioridade:** ALTA
**Status:** Ready — depende 7.8

##### Objetivo
Adicionar badges visuais e filtros na listagem de agentes para separar visualmente agentes do tipo Chatbot e Workflow.

##### Tarefas de Implementação

- [ ] Ler `src/app/agentes/agentes-content.tsx` completo
- [ ] Identificar onde os cards/linhas de agentes são renderizados
- [ ] Adicionar Badge `🗨️ Chatbot` (variant azul/primary) para `usage_type = 'chatbot'`
- [ ] Adicionar Badge `⚙️ Workflow` (variant secundário/cinza) para `usage_type = 'workflow'`
- [ ] Adicionar opção de filtro por `usage_type` na FilterBar existente
- [ ] No AgentCockpit (painel lateral): exibir `usage_type`, `show_in_shortcut`, `is_global_chatbot`
- [ ] Garantir que query de listagem inclui os novos campos no SELECT

##### Critérios de Aceite
- [ ] Badge aparece em cada card de agente
- [ ] Filtro "Tipo: Chatbot | Workflow | Todos" funciona corretamente
- [ ] AgentCockpit exibe os 3 novos campos

##### Arquivos Modificados
- `src/app/agentes/agentes-content.tsx` (EDIT)

---

#### Story 7.10 — Frontend: Módulo de Governança de Modelos

**Story ID:** 7.10
**Épico:** 7 — AI Governance
**Sprint:** 7
**Agente:** `@dev` (Dex)
**QA Gate:** `@qa` (Quinn)
**Esforço:** 1.5 dias
**Prioridade:** ALTA
**Status:** Ready — depende 7.4

##### Objetivo
Expandir o módulo `/auxiliares/modelos-ia` para exibir e editar os novos campos de governança (`stability_level`, `release_channel`, capacidades técnicas).

##### Tarefas de Implementação

- [ ] Ler `src/app/auxiliares/modelos-ia/modelos-ia-content.tsx` completo
- [ ] Adicionar badges `stability_level`: `GA` (verde), `Preview` (amarelo), `Experimental` (laranja), `Deprecated` (cinza)
- [ ] Adicionar tag `release_channel`: `Stable` / `Beta` / `Alpha`
- [ ] Adicionar chips de capacidades: `🔧 Tool Calling`, `📄 JSON`, `🌊 Streaming`, `👁️ Vision`, `🎵 Audio`
- [ ] Alerta visual em vermelho quando `deprecated_at` está preenchido
- [ ] Alerta amarelo quando `sunset_at` é nos próximos 30 dias
- [ ] Expandir formulário de edição de modelo com todos os novos campos
- [ ] Atualizar server action de atualização de modelo para incluir novos campos
- [ ] Garantir que query de listagem inclui novos campos no SELECT

##### Critérios de Aceite
- [ ] Badges de `stability_level` aparecem na listagem e no cockpit
- [ ] Chips de capacidades exibidos corretamente
- [ ] Alertas de deprecation funcionam
- [ ] Formulário de edição salva novos campos corretamente

##### Arquivos Modificados
- `src/app/auxiliares/modelos-ia/modelos-ia-content.tsx` (EDIT)
- `src/app/actions/lm-models.ts` (EDIT)

---

#### Story 7.11 — Frontend: Página de Governança Avançada

**Story ID:** 7.11
**Épico:** 7 — AI Governance
**Sprint:** 7
**Agente:** `@dev` (Dex)
**QA Gate:** `@qa` (Quinn)
**Esforço:** 2 dias
**Prioridade:** MÉDIA
**Status:** Ready — depende 7.10, 7.3

##### Objetivo
Criar página `/auxiliares/modelos-ia/governanca` com 5 tabs de governança: revisões, monitoramento de custo, incidentes, fallback e changelog.

##### Tarefas de Implementação

- [ ] Criar `src/app/auxiliares/modelos-ia/governanca/page.tsx`
- [ ] Criar `src/app/auxiliares/modelos-ia/governanca/governanca-content.tsx`
- [ ] Implementar Tabs (shadcn/ui) com 5 abas: Revisões, Custo, Incidentes, Fallback, Changelog
- [ ] **Aba Revisões:** tabela de `model_governance_reviews`, botão "Nova Revisão", status badge
- [ ] **Aba Custo:** gráfico de `model_cost_monitoring` por período, usar componentes Chart existentes de `src/components/charts/`
- [ ] **Aba Incidentes:** tabela de `model_incidents` com severity badges coloridos, botão "Registrar Incidente"
- [ ] **Aba Fallback:** formulário de criação de `model_fallback_policies` (select primary + select fallback + trigger_on), lista de policies ativas
- [ ] **Aba Changelog:** tabela read-only de `model_change_log`, ordenada por `changed_at DESC`
- [ ] Criar API routes para CRUD de cada tabela em `src/app/api/`
- [ ] Adicionar link para esta página no ModelCockpit

##### Critérios de Aceite
- [ ] Página carrega sem erros
- [ ] Cada aba exibe os dados corretos do Supabase
- [ ] Criar revisão funciona
- [ ] Criar policy de fallback funciona
- [ ] Registrar incidente funciona
- [ ] Changelog exibe histórico

##### Arquivos Modificados
- `src/app/auxiliares/modelos-ia/governanca/page.tsx` (CREATE)
- `src/app/auxiliares/modelos-ia/governanca/governanca-content.tsx` (CREATE)
- `src/app/api/model-governance/[table]/route.ts` (CREATE)

---

### ÉPICO 7 — Fase 4: Chatbot Global + Histórico (Após Fase 2 completa)

**Agente executor:** `@dev` (Dex)
**QA Gate:** `@qa` (Quinn)
**Depende de:** Stories 7.5, 7.6 completas (LLM real + streaming)

---

#### Story 7.12 — Frontend: API Route para Sessões Globais

**Story ID:** 7.12
**Épico:** 7 — AI Governance
**Sprint:** 7
**Agente:** `@dev` (Dex)
**QA Gate:** `@qa` (Quinn)
**Esforço:** 0.5 dia
**Prioridade:** ALTA
**Status:** Ready — depende 7.4

##### Objetivo
Criar endpoint `GET /api/sessions` para listar todas as `agent_sessions` do usuário autenticado (todos os agentes), necessário para o histórico de conversas e o chatbot global.

##### Tarefas de Implementação

- [ ] Criar `src/app/api/sessions/route.ts`
- [ ] Implementar `GET /api/sessions?page=1&limit=20&agent_id=optional&status=optional`
- [ ] Autenticar usuário via Supabase (cookie de sessão)
- [ ] Query: `SELECT agent_sessions.*, agents.name as agent_name FROM agent_sessions JOIN agents ON agent_sessions.agent_id = agents.id WHERE agent_sessions.user_id = $1 ORDER BY started_at DESC`
- [ ] Suporte a paginação (`range()` do Supabase)
- [ ] Filtro opcional por `agent_id`
- [ ] Retornar `{ sessions: AgentSessionWithAgent[], total: number, page: number }`

##### Critérios de Aceite
- [ ] `GET /api/sessions` retorna lista de sessões do usuário autenticado
- [ ] Paginação funciona corretamente
- [ ] Filtro por `agent_id` funciona
- [ ] Usuário não autorizado recebe HTTP 401

##### Arquivos Modificados
- `src/app/api/sessions/route.ts` (CREATE)

---

#### Story 7.13 — Frontend: Componente GlobalChatbot

**Story ID:** 7.13
**Épico:** 7 — AI Governance
**Sprint:** 7
**Agente:** `@dev` (Dex)
**QA Gate:** `@qa` (Quinn)
**Esforço:** 2 dias
**Prioridade:** ALTA
**Status:** Ready — depende 7.6, 7.12, 7.8

##### Objetivo
Criar o componente de chatbot flutuante global acessível em qualquer rota do portal, com seleção de agente chatbot e interface de chat com streaming.

##### Contexto Técnico
- Ponto de inserção: `src/app/layout.tsx` — dentro de `<Providers>`, após `<ErrorBoundary>`
- Componente base de mensagem: `src/components/agents/ChatBubble.tsx` — reutilizar
- Componente de painel: `Sheet` do shadcn/ui (já instalado)
- API chat disponível: `POST /api/agents/[id]/chat` (com streaming após Story 7.6)
- API sessões: `POST /api/agents/[id]/sessions`

##### Tarefas de Implementação

**Arquivo: `src/components/chat/GlobalChatbotButton.tsx`**
- [ ] Botão circular com ícone de chat (usar `MessageSquare` do lucide-react)
- [ ] `position: fixed; bottom: 24px; right: 24px; z-index: 50`
- [ ] Badge de notificação opcional (futuro)
- [ ] `onClick`: disparar estado global de abertura

**Arquivo: `src/components/chat/GlobalChatbot.tsx`**
- [ ] Wrapper com `Sheet` (shadcn/ui) — `side="right"`, largura 420px
- [ ] **Estado: Seleção de Agente** (quando nenhum agente selecionado)
  - [ ] Header: "Assistentes AI"
  - [ ] Buscar agentes com `usage_type='chatbot'`, `status='published'`, `show_in_shortcut=true` do Supabase
  - [ ] Listar como cards clicáveis com nome e descrição
  - [ ] Ao clicar: selecionar agente e mudar para estado de chat
- [ ] **Estado: Chat** (após selecionar agente)
  - [ ] Header: nome do agente ativo + botão "Trocar agente" (volta para lista) + botão fechar (X)
  - [ ] Área de mensagens com scroll — reutilizar `ChatBubble` para cada mensagem
  - [ ] Input de texto na parte inferior + botão "Enviar"
  - [ ] Indicador de streaming (dots animados) quando aguardando resposta
  - [ ] Auto-scroll para última mensagem
  - [ ] Botão "Copiar" em cada mensagem do assistente
  - [ ] Botão "Limpar conversa" no header
- [ ] **Lógica de sessão:**
  - [ ] Ao selecionar agente: verificar sessão ativa (`GET /api/agents/[id]/sessions?status=active`)
  - [ ] Carregar mensagens existentes se sessão ativa
  - [ ] Criar nova sessão via `POST /api/agents/[id]/sessions` se nenhuma ativa
  - [ ] "Limpar conversa": `PATCH /api/agents/[id]/sessions/[sid]` com `status=closed`, criar nova
- [ ] **Streaming:**
  - [ ] Enviar `POST /api/agents/[id]/chat` com `Accept: text/event-stream`
  - [ ] Ler chunks SSE via `ReadableStream` + `TextDecoder`
  - [ ] Atualizar mensagem incrementalmente no estado

**Modificação: `src/app/layout.tsx`**
- [ ] Importar `GlobalChatbot`
- [ ] Adicionar `<GlobalChatbot />` após `</ErrorBoundary>`

##### Critérios de Aceite
- [ ] Botão flutuante aparece em todas as rotas do portal
- [ ] Ao clicar, Sheet abre com lista de agentes chatbot publicados
- [ ] Ao selecionar agente, chat abre com streaming funcional
- [ ] Histórico da sessão é preservado entre aberturas do Sheet
- [ ] "Limpar conversa" fecha sessão e abre nova
- [ ] Botão "Copiar" copia o texto da mensagem
- [ ] Funciona em mobile (responsivo)
- [ ] Sem erros no console do browser

##### Arquivos Modificados
- `src/components/chat/GlobalChatbot.tsx` (CREATE)
- `src/components/chat/GlobalChatbotButton.tsx` (CREATE)
- `src/app/layout.tsx` (EDIT)

---

#### Story 7.14 — Frontend: Página de Histórico de Conversas

**Story ID:** 7.14
**Épico:** 7 — AI Governance
**Sprint:** 7
**Agente:** `@dev` (Dex)
**QA Gate:** `@qa` (Quinn)
**Esforço:** 1 dia
**Prioridade:** MÉDIA
**Status:** Ready — depende 7.12

##### Objetivo
Criar página `/conversas` com listagem paginada das conversas (agent_sessions) do usuário autenticado, com filtros e ação de reabertura.

##### Tarefas de Implementação

- [ ] Criar `src/app/conversas/page.tsx` (Server Component — busca inicial de dados)
- [ ] Criar `src/app/conversas/conversas-content.tsx` (Client Component)
- [ ] Adicionar rota `/conversas` em `src/components/layout/sidebar-config.ts` no grupo "Tecnologia & IA"
- [ ] Colunas da tabela: nome do agente, data de início, status (badge colorido), estimativa de mensagens
- [ ] Filtro por agente (Select com lista de agentes chatbot do tenant)
- [ ] Ordenação por data (desc por padrão, toggle asc/desc)
- [ ] Paginação (usar `usePagination` hook existente)
- [ ] Botão "Reabrir" → navegar para `/agentes/[id]/chat?session=[sid]`
- [ ] Badge de status: `active` (verde), `paused` (amarelo), `closed` (cinza)
- [ ] Página vazia com `EmptyState` quando sem conversas

##### Critérios de Aceite
- [ ] Rota `/conversas` aparece na sidebar
- [ ] Listagem exibe sessões do usuário autenticado
- [ ] Filtro por agente funciona
- [ ] Paginação funciona
- [ ] Botão "Reabrir" navega para o chat correto
- [ ] Sem erro quando lista está vazia (EmptyState)

##### Arquivos Modificados
- `src/app/conversas/page.tsx` (CREATE)
- `src/app/conversas/conversas-content.tsx` (CREATE)
- `src/components/layout/sidebar-config.ts` (EDIT)

---

## 5. Protocolo de Execução AIOS

### Como Iniciar uma Story

1. **Identificar story** — encontrar a próxima story com `Status: Ready` e sem dependências pendentes
2. **Criar o arquivo de story** no formato padrão AIOS em `docs/stories/{ID}-{slug}.md`
3. **Mudar status** do arquivo de story para `InProgress`
4. **Ativar agente correto:** use `@data-engineer`, `@dev`, `@qa`, `@architect` conforme a story
5. **Executar tasks** marcando checkboxes `[ ]` → `[x]` conforme completa
6. **Chamar QA Gate:** ao completar, ativar `@qa` para validação
7. **Após aprovação QA:** mudar status para `Done`
8. **Push:** delegar para `@devops` (exclusivo para git push)

### Fluxo de Agentes por Tipo de Task

| Tipo de Task | Agente Principal | Revisão |
|---|---|---|
| Migrations SQL | `@data-engineer` (Dara) | `@qa` (Quinn) |
| Types TypeScript | `@dev` (Dex) | `@qa` (Quinn) |
| Backend Python (FastAPI) | `@dev` (Dex) | `@architect` (Aria) + `@qa` |
| Frontend Next.js | `@dev` (Dex) | `@qa` (Quinn) |
| UX de novos componentes | `@ux-design-expert` (Uma) + `@dev` | `@qa` |
| Push / PR | `@devops` (Gage) | — |

### Checklist Pré-Commit (obrigatório para cada story)

```bash
npm run typecheck    # TypeScript sem erros
npm run lint         # Lint sem erros
```

Para backend Python:
```bash
cd services/ai
python -m pytest tests/ -v    # Testes passando
```

Para migrations:
```bash
supabase db push    # Migration aplicada sem erro
```

### Git Convention

Formato de commit por story:
```
feat(7.X): descrição curta da story [Story 7.X]

- Detalhe 1
- Detalhe 2

Co-Authored-By: {Agente} <noreply@anthropic.com>
```

Exemplos:
```
feat(db): add usage_type classification to agents table [Story 7.1]
feat(db): add governance fields to lm_models [Story 7.2]
feat(backend): implement real LLM call replacing mock [Story 7.5]
feat(frontend): add GlobalChatbot floating component [Story 7.13]
```

---

## 6. Formato Padrão de Story AIOS

Ao criar um arquivo de story em `docs/stories/`, usar exatamente este formato:

```markdown
# Story {ID} — {Título}

Story ID: {ID}
Epic: Épico {N} — {Nome do Épico}
Sprint: {N}
Agente: @{agente} ({Nome})
QA Gate: @qa (Quinn)
Esforço: {N} dias
Prioridade: {CRÍTICA|ALTA|MÉDIA|BAIXA} [{se bloqueante: (bloqueante)}]
Status: {Draft|Ready|InProgress|InReview|Done}

## Change Log

- **{data} {hora}**: {Status} — @{agente} {descrição da ação}

---

## Objetivo

{1-2 frases descrevendo o objetivo técnico}

---

## Como Usuário

Como {persona},
quero {ação/capacidade},
para que {benefício/resultado}.

---

## Contexto

**Situação atual:**
- {bullet com o que existe hoje}

**Mudança necessária:**
- {bullet com o que precisa ser feito}

**Padrão de referência:**
- {arquivos ou migrations para usar como base}

---

## Critérios de Aceite

- [ ] {Critério verificável 1}
- [ ] {Critério verificável 2}

---

## Tarefas de Implementação

- [ ] {Task específica 1}
- [ ] {Task específica 2}

---

## File List

Arquivos criados ou modificados nesta story:

| Arquivo | Operação | Agente |
|---|---|---|
| `{path/arquivo}` | CREATE\|EDIT | @{agente} |
```

---

## 7. Protocolo de Documentação

### Após cada Story concluída, atualizar:

1. **O próprio arquivo de story** (`docs/stories/{ID}-{slug}.md`):
   - Marcar todos os checkboxes como `[x]`
   - Atualizar `Status: Done`
   - Adicionar entrada no `Change Log` com data, hora e resultado do QA Gate
   - Preencher `File List` com todos os arquivos criados/modificados

2. **SCHEMA.md** (`docs/schema/SCHEMA.md` ou equivalente):
   - Para stories de migration: adicionar as novas tabelas/colunas na documentação de schema
   - Formato: nome da tabela, campos, constraints, FKs, índices

3. **Este Masterplan** (`docs/plans/portal-tech-ai-evolution-masterplan.md`):
   - Atualizar `Status` da story para `Done` na tabela de sumário (Seção 8)
   - Não alterar o detalhamento das stories — apenas a coluna de status

4. **MEMORY.md** (se agente Claude): atualizar memória com estado atual do projeto

### Atualizar Status de Story no Masterplan

Na Seção 8 (Sumário de Progresso), ao completar uma story, mudar:
```
| 7.1 | Ready    → | 7.1 | Done
```

---

## 8. Sumário de Progresso

| Story | Título Curto | Agente | Status | Última Atualização |
|---|---|---|---|---|
| **FASE 1 — DATABASE (BLOQUEANTE)** | | | | |
| 7.1 | DB: usage_type em agents | @data-engineer | ✅ Done | 2026-03-01 |
| 7.2 | DB: governança em lm_models | @data-engineer | ✅ Done | 2026-03-01 |
| 7.3 | DB: tabelas governança avançada | @data-engineer | ✅ Done | 2026-03-01 |
| 7.4 | Types TypeScript atualizados | @dev | ✅ Done | 2026-03-01 |
| **FASE 2 — BACKEND (paralelo com Fase 3)** | | | | |
| 7.5 | Backend: LLM real (substitui mock) | @dev | ✅ Done | 2026-03-01 |
| 7.6 | Backend: Streaming SSE | @dev | ✅ Done | 2026-03-01 |
| 7.7 | Backend: Fallback multi-provider | @dev | ✅ Done | 2026-03-01 |
| **FASE 3 — FRONTEND REFATORAÇÃO (paralelo com Fase 2)** | | | | |
| 7.8 | Frontend: Formulário agente (usage_type) | @dev | ✅ Done | 2026-03-01 |
| 7.9 | Frontend: Badges visual Chatbot/Workflow | @dev | 🔵 Ready | — |
| 7.10 | Frontend: Módulo governança modelos | @dev | 🔵 Ready | — |
| 7.11 | Frontend: Página governança avançada | @dev | 🔵 Ready | — |
| **FASE 4 — CHATBOT GLOBAL (após Fase 2 completa)** | | | | |
| 7.12 | API: Sessões globais do usuário | @dev | 🔵 Ready | — |
| 7.13 | Frontend: GlobalChatbot component | @dev | 🔵 Ready | — |
| 7.14 | Frontend: Página histórico conversas | @dev | 🔵 Ready | — |

---

## 9. Critérios de Sucesso do Épico 7

O Épico 7 é considerado **concluído** quando todos os critérios abaixo são atendidos:

| Critério | Verificação |
|---|---|
| ✅ Migrations 045, 046, 047 aplicadas | `supabase migration list` mostra as 3 como applied |
| ✅ TypeScript compila sem erros | `npm run typecheck` retorna exit code 0 |
| ✅ Chat retorna resposta real de LLM | Testar manualmente em `/agentes/[id]/chat` |
| ✅ Streaming visual funciona | Ver texto sendo gerado incrementalmente no browser |
| ✅ Fallback ativa em timeout | Configurar policy e simular erro do provider primário |
| ✅ Badges chatbot/workflow visíveis | Ver na listagem de agentes |
| ✅ Formulário salva usage_type | Editar agente e verificar no Supabase |
| ✅ Módulo governança modelos completo | Acessar `/auxiliares/modelos-ia` e ver novos campos |
| ✅ Chatbot global funciona | Botão flutuante aparece em qualquer rota; chat com streaming |
| ✅ Histórico de conversas | Acessar `/conversas` e ver sessões anteriores |
| ✅ Nenhum dado compartilhado entre tenants | Verificar RLS em todas as novas tabelas |
| ✅ Lint e typecheck passam | `npm run lint && npm run typecheck` sem erros |

---

*Masterplan gerado por Orion (aios-master) — Portal Tech AI Governance — 2026-03-01*
*Baseado em exploração completa do codebase: 44 migrations, arquitetura FastAPI+LangGraph, Next.js 14*
