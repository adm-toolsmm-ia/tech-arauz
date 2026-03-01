# Contexto do projeto — Portal Tech Arauz (dados, agentes, IA)

Documentação do que existe no repositório. Apenas fatos; uso como contexto para engenharia de AI e definição de prompts.

**Data:** 2026-03-01

---

## 1. Metadados do projeto

- **Fonte:** `configs/project.yaml`
- **project.name:** Tech Arauz
- **project.description:** SaaS de gestão de TI - Projetos Espaider + Agentes AI
- **project.multi_tenant_ready:** true
- **project.tenant:** arauz

---

## 2. Stack (configs/project.yaml)

| Camada | Chave | Valores no projeto |
|--------|--------|--------------------|
| Frontend | stack.frontend | framework: next.js, version: 14.x, router: app, language: typescript, ui: tailwind + shadcn/ui, api_layer: trpc |
| Backend | stack.backend | platform: supabase, database: postgresql, auth: supabase-auth, storage: supabase-storage |
| AI Service | stack.ai_service | runtime: python, framework: fastapi, orchestration: langgraph, agents: langchain, observability: langsmith |
| Hosting | stack.hosting | web: vercel, database: supabase |
| Observability | stack.observability | analytics: vercel-analytics, errors: sentry, ai_tracing: langsmith |

---

## 3. Integrações (configs/project.yaml)

- **integrations.espaider:** base_url_env (ESPAIDER_BASE_URL), token_env (ESPAIDER_TOKEN), key_env (ESPAIDER_KEY), timeout_seconds: 10, retry (max_attempts, base_delay_seconds, max_delay_seconds, strategy: exponential_backoff), circuit_breaker, rate_limit, datasets: Projetos, Entregas, Cronogramas, Requisitos
- **integrations.langsmith:** api_key_env: LANGSMITH_API_KEY, project: tech-arauz, tracing_enabled: true, evaluators_enabled: true

---

## 4. Design system e coding standards (configs/project.yaml)

- **design_system.layout:** AppSidebar, DashboardHeader
- **design_system.dashboard:** KPICard
- **design_system.views:** KanbanBoard, ViewToggle, SplitView
- **coding_standards.nextjs:** router: app; components em src/components/ui/, layout/, dashboard/, views/; page_pattern: Server Component + Client Component (page.tsx + *-content.tsx)
- **coding_standards.python:** base_path: services/ai/, stack: LangGraph, LangChain, LangSmith
- **coding_standards.supabase:** rls_required: true, tenant_column: tenant_id, roles: admin, user, viewer, migrations_path: supabase/migrations/

---

## 5. Schema do banco — localização e domínios

**Estrutura atual (uso recomendado para contexto):**

- **Documentação SQL da estrutura atual:** `supabase/docs/SCHEMA.md` — tabelas, colunas, relações, RLS (auditoria até as migrations aplicadas).
- **Schema em formato Prisma (estado atual):** `docs/architecture/data/schema.prisma` — export do MCP Supabase a partir do banco; o projeto usa Supabase em runtime, não Prisma.

**Migrations (histórico / DDL):** `supabase/migrations/` — arquivos 001_*.sql a 047_*.sql. O estado atual do banco é o resultado cumulativo de todas aplicadas em ordem. Para entender a **estrutura atual**, priorize `SCHEMA.md` e `schema.prisma`. Consulte as migrations quando a tarefa for **alterar o schema** (nova migration) ou **analisar a evolução** do banco. Migration 044 removeu seed data de lm_providers, lm_models, agent_types e agent_templates; tabelas auxiliares ficam vazias até recriação manual. Migrations 045–047: classificação de agentes (usage_type, show_in_shortcut, is_global_chatbot), governança de lm_models (stability_level, release_channel, capabilities), e tabelas de governança avançada (model_governance_reviews, model_cost_monitoring, model_incidents, model_fallback_policies, model_change_log).

**Tabelas por domínio (nomes no banco):**

| Domínio | Tabelas |
|---------|---------|
| Core | tenants, profiles |
| Projetos + ERP | projects, project_schedules, project_deliveries, project_requirements, project_histories, project_approvers, project_budgets |
| Integração | espaider_apis, sync_logs, integration_log_entries |
| Agentes AI | agents, agent_versions, agent_variables, agent_runs, agent_types, agent_templates, lm_providers, lm_models |
| Chat e sessões | agent_sessions, agent_messages |
| Observabilidade agentes | agent_run_steps, agent_budgets, agent_usage_daily, agent_deployments |
| Ferramentas e contexto | tools, agent_tool_bindings, context_providers, agent_context_bindings |
| Feedback e LLM | agent_feedback, lm_provider_accounts |
| Governança de modelos | model_governance_reviews, model_cost_monitoring, model_incidents, model_fallback_policies, model_change_log |

Todas as tabelas de dados têm RLS e isolamento por `tenant_id`. Após migration 043, o campo `agent_id` em agent_sessions, agent_budgets, agent_usage_daily, agent_deployments, agent_tool_bindings, agent_context_bindings referencia `agents(id)`. A tabela agent_run_steps tem `run_id` (FK agent_runs) e `agent_id` (coluna sem FK, tipicamente agents.id para denormalização). Após migration 044, lm_providers, lm_models, agent_types e agent_templates estão vazios (seed removido); agents.agent_type_id foi setado para NULL. Migration 045: agents.usage_type (chatbot|workflow), show_in_shortcut, is_global_chatbot. Migration 046: lm_models com stability_level, release_channel, supports_tool_calling, supports_json_mode, supports_streaming, supports_vision, supports_audio, deprecated_at, sunset_at.

---

## 6. Schema Prisma — modelos, campos e relações

O arquivo completo está em `docs/architecture/data/schema.prisma`. Resumo abaixo: nome do model Prisma, nome da tabela (`@@map`), campos principais e relações.

### 6.1 Core

- **Tenant** → `tenants`  
  Campos: id, slug, name, settings, createdAt, updatedAt.  
  Relações: 1:N com Profile, Project, EspaiderApi, SyncLog, IntegrationLogEntry, ProjectHistory, ProjectApprover, ProjectBudget, Agent, AgentType, AgentTemplate, LmProvider, LmModel.

- **Profile** → `profiles`  
  Campos: id, tenantId, email, fullName, role (admin|user|viewer), avatarUrl, settings, isActive, createdAt, updatedAt.  
  Relações: N:1 Tenant; id referencia auth.users.

### 6.2 Projetos e ERP

- **Project** → `projects`  
  Campos: id, tenantId, espaiderId, codigo, titulo, situacaoOriginal, statusOriginal, responsavel, prioridade, categoria, prazoFinal, faseAtual, prazoFase, cronogramaAtual, prazoCronograma, area, pastaConsultivo, solucaoAplicada, dataMovimentacao, dataEncerramento, dataInicioAprovacao, trmEspaider, tipoChamado, tipoAssunto, solicitante, objetivo, motivoImportanciaEspecial, mensagemMovimentacao, justificativa, importanciaEspecial, impactoOperacional, impactoEstrategico, escopo, complexidadeTecnica, notesHtml, espaiderRaw, syncStatus, lastSyncAt, createdAt, updatedAt.  
  Unique: (tenantId, espaiderId). Relações: N:1 Tenant; 1:N ProjectSchedule, ProjectDelivery, ProjectRequirement, ProjectHistory, ProjectApprover, ProjectBudget.

- **ProjectSchedule** → `project_schedules`  
  Campos: id, tenantId, projectId, espaiderId, atividade, responsavel, dataInicio, dataFim, status, faseAtividade, atrasado, setorResponsavel, item, detalhamento, dataPrazo, dataNovoPrazo, dataAlertaPrazo, prazoConfirmado, espaiderRaw, createdAt, updatedAt.  
  Unique: (tenantId, espaiderId). Relações: N:1 Tenant, Project.

- **ProjectDelivery** → `project_deliveries`  
  Campos: id, tenantId, projectId, espaiderId, titulo, status, prioridade, ordem, detalhamento, dataPrevista, dataRealizada, espaiderRaw, createdAt, updatedAt.  
  Unique: (tenantId, espaiderId). Relações: N:1 Tenant, Project.

- **ProjectRequirement** → `project_requirements`  
  Campos: id, tenantId, projectId, espaiderId, codigo, descricao, tipo, prioridade, status, impacto, detalhamento, entregaIdEspaider, entregaNome, dataConclusao, espaiderRaw, createdAt, updatedAt.  
  Unique: (tenantId, espaiderId). Relações: N:1 Tenant, Project.

- **ProjectHistory** → `project_histories`  
  Campos: id, projectId, tenantId, espaiderId, type, responsibleTo, responsibleFrom, stepTo, stepFrom, procedureNumber, message, date, espaiderRaw, createdAt, updatedAt.  
  Unique: (tenantId, espaiderId). Relações: N:1 Project, Tenant.

- **ProjectApprover** → `project_approvers`  
  Campos: id, projectId, tenantId, espaiderId, type, responsible, attentionPoints, espaiderRaw, createdAt, updatedAt.  
  Unique: (tenantId, espaiderId). Relações: N:1 Project, Tenant.

- **ProjectBudget** → `project_budgets`  
  Campos: id, projectId, tenantId, espaiderId, value, provider, quotationDate, moeda, espaiderRaw, createdAt, updatedAt.  
  Unique: (tenantId, espaiderId). Relações: N:1 Project, Tenant.

- **EspaiderApi** → `espaider_apis`  
  Campos: id, tenantId, nome, baseUrl, token, identificador, tipo, isActive, lastSyncAt, lastSyncStatus, settings, createdAt, updatedAt.  
  Unique: (tenantId, identificador). Relações: N:1 Tenant.

- **SyncLog** → `sync_logs`  
  Campos: id, tenantId, requestId, dataset, startedAt, completedAt, durationMs, totalRecords, newRecords, updatedRecords, errors, retries, status, errorMessage, createdAt.  
  Relações: N:1 Tenant; 1:N IntegrationLogEntry.

- **IntegrationLogEntry** → `integration_log_entries`  
  Campos: id, tenantId, syncLogId, requestId, level, dataset, message, details, loggedAt, createdAt.  
  Relações: N:1 Tenant, SyncLog.

### 6.3 Agentes AI e catálogo LLM

- **AgentType** → `agent_types`  
  Campos: id, tenantId, name, slug, description, defaultTemplate, requiredFields, recommendedFields, metadata, iconEmoji, colorHex, isSystem, isActive, defaultModelProvider, defaultModelId, defaultTemperature, createdBy, updatedBy, createdAt, updatedAt.  
  Unique: (tenantId, slug). Relações: N:1 Tenant; 1:N Agent, AgentTemplate.

- **Agent** → `agents`  
  Campos: id, tenantId, name, slug, description, owners, tags, status (draft|published|deprecated), persona, promptObjective, promptInstructions, promptTemplate, outputSchema, modelProvider, modelId, modelTemperature, modelTopP, modelMaxTokens, modelPresencePenalty, modelFrequencyPenalty, modelStopSequences, modelResponseFormat, modelEndpointOverrides, runtimeToolIds, runtimeContextProviderIds, runtimeMemory, agentType, agentTypeId, requirements, configurationMeta, templateId, isTemplate, requiresValidation, validationRules, executionCount, lastExecutionAt, usageType (chatbot|workflow), showInShortcut, isGlobalChatbot, createdBy, updatedBy, createdAt, updatedAt.  
  Unique: (tenantId, slug). Relações: N:1 Tenant, AgentType (opcional); 1:N AgentVersion, AgentVariable, AgentRun, AgentSession, AgentBudget, AgentUsageDaily, AgentDeployment, AgentToolBinding, AgentContextBinding.

- **AgentVersion** → `agent_versions`  
  Campos: id, agentId, version, status, agentConfig, commitMessage, changeReason, breakingChange, createdBy, createdAt.  
  Unique: (agentId, version). Relações: N:1 Agent.

- **AgentVariable** → `agent_variables`  
  Campos: id, agentId, key, type, required, defaultValue, enumValues, regexPattern, description, createdAt, updatedAt.  
  Unique: (agentId, key). Relações: N:1 Agent.

- **AgentRun** → `agent_runs`  
  Campos: id, agentId, agentVersion, tenantId, inputData, outputData, status, errorMessage, tokensUsed, costUsd, durationMs, budgetLimitUsd, sessionId, createdBy, createdAt, completedAt.  
  Relações: N:1 Agent; N:1 AgentSession (session via sessionId); 1:N AgentRunStep.

- **AgentSession** → `agent_sessions`  
  Campos: id, tenantId, userId, agentId (FK agents), startedAt, endedAt, status (active|paused|closed), tokenUsage, createdAt, updatedAt.  
  Relações: N:1 Tenant; N:1 Agent (via agentId); 1:N AgentRun (runs via sessionId); 1:N AgentMessage, AgentFeedback.

- **AgentMessage** → `agent_messages`  
  Campos: id, sessionId, tenantId, role (user|assistant), content, metadata, tokensUsed, createdAt.  
  Relações: N:1 AgentSession, Tenant.

- **AgentRunStep** → `agent_run_steps`  
  Campos: id, agentId, tenantId, runId, stepType (input|tool_call|observation|output), input, output, metadata, executionTimeMs, createdAt.  
  Relações: N:1 AgentRun (via runId), Tenant. Nota: agent_id é coluna sem FK (denormalização).

- **AgentBudget** → `agent_budgets`  
  Campos: id, tenantId, agentId (FK agents), monthlyLimitUsd, currentMonthSpentUsd, resetDate, createdAt, updatedAt.  
  Relações: N:1 Agent, Tenant.

- **AgentUsageDaily** → `agent_usage_daily`  
  Campos: id, tenantId, agentId (FK agents), date, sessionsCount, messagesCount, costTotalUsd, avgLatencyMs, successRatePct, createdAt.  
  Unique: (tenantId, agentId, date). Relações: N:1 Agent, Tenant.

- **AgentDeployment** → `agent_deployments`  
  Campos: id, agentId (FK agents), tenantId, version, environment (dev|staging|prod), deployedAt, deployedBy, configHash, status (success|failed|rolled_back), createdAt.  
  Relações: N:1 Agent, Tenant.

- **Tool** → `tools`  
  Campos: id, tenantId, toolName, description, configSchema, enabled, createdAt, updatedAt.  
  Relações: N:1 Tenant; 1:N AgentToolBinding.

- **AgentToolBinding** → `agent_tool_bindings`  
  Campos: id, agentId (FK agents), toolId, tenantId, enabled, configOverrides, createdAt, updatedAt.  
  Relações: N:1 Agent, Tool, Tenant.

- **ContextProvider** → `context_providers`  
  Campos: id, tenantId, providerType (sql|api|knowledge_base), description, config, enabled, createdAt, updatedAt.  
  Relações: N:1 Tenant; 1:N AgentContextBinding.

- **AgentContextBinding** → `agent_context_bindings`  
  Campos: id, agentId (FK agents), contextId, tenantId, priority, createdAt.  
  Relações: N:1 Agent, ContextProvider, Tenant.

- **AgentFeedback** → `agent_feedback`  
  Campos: id, sessionId, tenantId, rating (1-5), feedbackText, feedbackType (quality|accuracy|relevance|performance), createdAt.  
  Relações: N:1 AgentSession, Tenant.

- **LmProviderAccount** → `lm_provider_accounts`  
  Campos: id, tenantId, provider (openai|anthropic|google|azure), apiKeyEncrypted, accountIdentifier, monthlySpendUsd, quotaLimitUsd, createdAt, updatedAt.  
  Relações: N:1 Tenant; 1:N LmModel.

- **AgentTemplate** → `agent_templates`  
  Campos: id, tenantId, agentTypeId, name, slug, description, personaTemplate, promptObjectiveTemplate, promptInstructionsTemplate, promptExamples, outputSchemaTemplate, modelProviderDefault, modelIdDefault, modelTemperatureDefault, modelMaxTokensDefault, usageCount, createdBy, createdAt, updatedAt.  
  Unique: (tenantId, agentTypeId, slug). Relações: N:1 Tenant, AgentType.

- **LmProvider** → `lm_providers`  
  Campos: id, tenantId, name, slug, description, apiEndpoint, apiKeyFieldName, iconEmoji, colorHex, docsUrl, isActive, isSystem, createdBy, updatedBy, createdAt, updatedAt.  
  Unique: (tenantId, slug). Relações: N:1 Tenant; 1:N LmModel.

- **LmModel** → `lm_models`  
  Campos: id, tenantId, providerId, name, modelId, description, maxTokens, defaultTemperature, inputCostPer1kTokens, outputCostPer1kTokens, inputTokenCostUsd, outputTokenCostUsd, providerAccountId, docsUrl, contextWindow, displayOrder, tier (entry|balanced|pro|flagship), isActive, isSystem, stabilityLevel (ga|preview|experimental|deprecated), releaseChannel (stable|beta|alpha), supportsToolCalling, supportsJsonMode, supportsStreaming, supportsVision, supportsAudio, deprecatedAt, sunsetAt, createdBy, updatedBy, createdAt, updatedAt.  
  Unique: (providerId, modelId). Relações: N:1 Tenant, LmProvider, LmProviderAccount (opcional); 1:N ModelGovernanceReview, ModelCostMonitoring, ModelIncident, ModelFallbackPolicy (primary/fallback), ModelChangeLog.

- **ModelGovernanceReview** → `model_governance_reviews`  
  Campos: id, tenantId, modelId, reviewerId, status (pending|approved|rejected|needs_revision), notes, createdAt, updatedAt, reviewedAt.  
  Unique: (tenantId, modelId). Relações: N:1 Tenant, LmModel.

- **ModelCostMonitoring** → `model_cost_monitoring`  
  Campos: id, tenantId, modelId, periodStart, periodEnd, totalRequests, totalTokens, totalInputTokens, totalOutputTokens, totalCostUsd, inputCostUsd, outputCostUsd, p50LatencyMs, p95LatencyMs, p99LatencyMs, minLatencyMs, maxLatencyMs, errorCount, errorRate, createdAt, updatedAt.  
  Unique: (tenantId, modelId, periodStart, periodEnd). Relações: N:1 Tenant, LmModel.

- **ModelIncident** → `model_incidents`  
  Campos: id, tenantId, modelId, severity (low|medium|high|critical), title, description, startedAt, resolvedAt, impactSummary, mitigationSteps, rootCause, createdBy, updatedBy, createdAt, updatedAt.  
  Relações: N:1 Tenant, LmModel.

- **ModelFallbackPolicy** → `model_fallback_policies`  
  Campos: id, tenantId, primaryModelId, fallbackModelId, triggerOn (array), priority, isActive, createdBy, updatedBy, createdAt, updatedAt.  
  Unique: (tenantId, primaryModelId, fallbackModelId). Relações: N:1 Tenant, LmModel (primary), LmModel (fallback).

- **ModelChangeLog** → `model_change_log`  
  Campos: id, tenantId, modelId, changedBy, changeType (created|updated|deprecated|sunset|other), fieldName, oldValue, newValue, changeReason, changedAt.  
  Relações: N:1 Tenant, LmModel.

---

## 7. Tipos TypeScript de agentes

- **Arquivo:** `src/types/agents.ts`
- **Comentário no arquivo:** "These types are shared between: Frontend (UI editor, validation), Backend API (request/response), Workflow runtime (LangChain/LangGraph, Phase 2)"
- **Interfaces exportadas:** LmProvider, LmModel, AgentType, AgentTemplate, AgentVariable, ModelConfig, PromptConfig, RuntimePlaceholders, AgentConfig, AgentVersion, AgentHead, AgentListItem, AgentRun, AgentDiff, CreateAgentRequest, UpdateAgentDraftRequest, PublishAgentRequest, RollbackAgentRequest, ImportAgentRequest, ExportedAgentSpec

---

## 8. Serviço AI (Python)

**Diretório:** `services/ai/`

### 8.1 Estrutura de arquivos

- `app/main.py` — FastAPI app; router em prefix `/api`
- `app/config.py` — Settings (langsmith_api_key, langchain_tracing_v2, langchain_project, obs_backend, is_langsmith_enabled)
- `app/graphs/orchestrator.py` — Grafo LangGraph
- `app/agents/base.py` — Classe base para agentes LangGraph
- `app/api/routes.py` — Endpoints
- `app/instrumentation/tracing.py` — RunContext, LangSmith
- `app/instrumentation/` — wrappers.py, costs.py, budget.py, redaction.py, logging.py
- `pyproject.toml` — Dependências: langchain, langchain-core, langchain-community, langgraph, langsmith, langchain-openai
- `.env.example` — LANGSMITH_API_KEY, LANGCHAIN_TRACING_V2, LANGCHAIN_PROJECT=tech-arauz, OBS_BACKEND=langsmith

### 8.2 Orquestrador (app/graphs/orchestrator.py)

- **State (OrchestratorState):** messages (lista com add_messages), next_agent, final_output
- **Nós:** router_node (retorna next_agent "general"), general_agent_node (resposta mock; no código há TODO para chamada real ao LLM)
- **Fluxo:** entry → router → conditional_edges → general ou END; general → END
- **Export:** `orchestrator` = grafo compilado

### 8.3 Endpoints do serviço AI (app/api/routes.py, prefix /api)

| Método | Path | Descrição no código |
|--------|------|----------------------|
| GET | /agents | Listar agentes (legado) |
| GET | /agents/{agent_id} | Detalhe agente (legado) |
| POST | /agents/{agent_id}/run | Executar agente (legado) |
| GET | /traces | Listar traces |
| GET | /traces/{trace_id} | Detalhe trace |
| GET | /budget | Budget |
| GET | /agents/v2 | Listar agentes v2 |
| GET | /agents/v2/{agent_id} | Detalhe agente v2 |
| POST | /agents/v2 | Criar agente v2 |
| PATCH | /agents/v2/{agent_id} | Atualizar agente v2 |
| DELETE | /agents/v2/{agent_id} | Remover agente v2 |
| POST | /agents/v2/{agent_id}/publish | Publicar agente |
| POST | /agents/v2/{agent_id}/rollback | Rollback agente |
| GET | /agents/v2/{agent_id}/versions | Versões do agente |
| GET | /agents/v2/{agent_id}/export | Export do agente |
| GET | /agents/v2/types | Tipos de agente |
| GET | /agents/v2/templates | Templates |
| POST | /agents/{agent_id}/chat | Chat conversacional (session_id, message) |
| GET | /agents/{agent_id}/sessions | Listar sessões de chat (limit, offset) |
| POST | /agents/{agent_id}/sessions | Criar nova sessão |
| GET | /agents/{agent_id}/sessions/{session_id}/messages | Mensagens da sessão |

Autenticação: JWT no header Authorization; tenant_id e user_id extraídos do token (app_metadata).

### 8.4 Tracing (app/instrumentation/tracing.py)

- **RunContext:** run_id, trace_id, session_id, user_id, agent_id, started_at, metadata (contextvars)
- **LangSmith:** cliente lazy (langsmith.Client); export de spans; projeto LANGCHAIN_PROJECT (tech-arauz); env: LANGCHAIN_TRACING_V2, LANGCHAIN_API_KEY (mapeado de LANGSMITH_API_KEY no config)
- **Funções:** with_run_context(...), get_trace_url(run_id)

---

## 9. Front-end — rotas e API

### 9.1 Páginas (src/app)

- **Agentes:** `src/app/agentes/page.tsx`, `src/app/agentes/agentes-content.tsx`, `src/app/agentes/layout.tsx`, `src/app/agentes/[id]/page.tsx`, `src/app/agentes/[id]/agent-edit-content.tsx`, `src/app/agentes/[id]/chat/page.tsx`, `src/app/agentes/[id]/chat/chat-content.tsx`, `src/app/agentes/components/AgentsKanbanView.tsx`
- **Histórico de Conversas:** `src/app/conversas/page.tsx`, `src/app/conversas/conversas-content.tsx` — lista sessões de chat do usuário, filtro por agente (usage_type=chatbot)
- **Auxiliares:** `src/app/auxiliares/agent-types/page.tsx`, `src/app/auxiliares/agent-types/agent-types-content.tsx`, `src/app/auxiliares/agent-types/components/AgentTypeFormDialog.tsx`, `src/app/auxiliares/agent-types/components/AgentTypeListItem.tsx`, `src/app/auxiliares/lm-providers/page.tsx`, `src/app/auxiliares/lm-providers/lm-providers-content.tsx`, `src/app/auxiliares/lm-providers/components/LmProviderListItem.tsx`, `src/app/auxiliares/modelos-ia/page.tsx`, `src/app/auxiliares/modelos-ia/modelos-ia-content.tsx`, `src/app/auxiliares/modelos-ia/governanca/page.tsx`, `src/app/auxiliares/modelos-ia/governanca/governanca-content.tsx`, `src/app/auxiliares/layout.tsx`, `src/components/lm-models/ModelCockpit.tsx`, `src/components/lm-providers/LmProviderKanbanCard.tsx`

### 9.2 API Routes Next.js (proxy para o serviço AI)

Variável de ambiente: `AI_SERVICE_URL` (fallback localhost:8000). Token de sessão Supabase repassado em Authorization. Role `viewer` recebe 403 em POST.

| Arquivo | Métodos | Proxy para |
|---------|---------|------------|
| `src/app/api/agents/route.ts` | GET, POST | GET/POST `${AI_SERVICE_URL}/api/agents/v2` |
| `src/app/api/agents/[id]/route.ts` | GET, PATCH, DELETE | GET/PATCH/DELETE `${AI_SERVICE_URL}/api/agents/v2/${id}` |
| `src/app/api/agents/[id]/traces/route.ts` | GET | `${AI_SERVICE_URL}/api/traces?agent_id=${id}&page&page_size` |
| `src/app/api/agents/[id]/chat/route.ts` | POST | POST `${AI_SERVICE_URL}/api/agents/${id}/chat` (body: session_id, message) |
| `src/app/api/agents/[id]/sessions/route.ts` | GET, POST | GET/POST `${AI_SERVICE_URL}/api/agents/${id}/sessions` (GET: limit, offset) |
| `src/app/api/agents/[id]/metrics/route.ts` | GET | Consulta Supabase: agent_usage_daily (sessions_count, messages_count, cost_total_usd, avg_latency_ms, success_rate_pct), agent_deployments. Query: dateRange (7d|30d|90d). Contrato: runs_total, success_rate, avg_latency_ms, total_cost_usd, daily_data, deployments. |
| `src/app/api/sessions/route.ts` | GET | Lista agent_sessions do usuário autenticado. Query: page, limit, agent_id, status. Retorna sessions com agent_name (join agents). Nota: message_count é derivado (count de agent_messages por session) ou retornado pelo serviço AI; agent_sessions não tem coluna message_count no banco. |
| `src/app/api/agents/budget/route.ts` | GET | `${AI_SERVICE_URL}/api/budget` |
| `src/app/api/agents/types/route.ts` | GET | `${AI_SERVICE_URL}/api/agents/v2/types` |
| `src/app/api/agents/templates/route.ts` | GET | `${AI_SERVICE_URL}/api/agents/v2/templates` + query |

### 9.3 Server Actions

- `src/app/actions/lm-models.ts`
- `src/app/actions/lm-providers.ts`
- `src/app/actions/agent-types.ts`

---

## 10. Sync e integração Espaider

- **Arquivo de orquestração:** `src/lib/sync/espaider-sync.ts`
- **API Route de sync:** `src/app/api/integracoes/sync/route.ts`
- **Actions:** `src/app/actions/sync.ts`
- Dados persistidos nas tabelas projects e filhas; logs em `sync_logs` e `integration_log_entries`.

---

## 11. Índice de artefatos por tema

| Tema | Caminhos no repositório |
|------|-------------------------|
| Configuração do projeto | `configs/project.yaml` |
| Schema SQL atual / RLS | `supabase/docs/SCHEMA.md` |
| Schema Prisma (estado atual) | `docs/architecture/data/schema.prisma` |
| Migrations (histórico DDL; usar para alterar schema ou evolução) | `supabase/migrations/` (001–047; destaque: 042, 043, 044, 045_agent_usage_type.sql, 046_lm_models_governance.sql, 047_model_governance_tables.sql) |
| Tipos de agentes (TS) | `src/types/agents.ts` |
| Serviço AI | `services/ai/app/` |
| Orquestrador LangGraph | `services/ai/app/graphs/orchestrator.py` |
| Tracing / LangSmith | `services/ai/app/instrumentation/tracing.py` |
| Páginas agentes | `src/app/agentes/` |
| Página chat agente | `src/app/agentes/[id]/chat/` |
| Histórico de conversas | `src/app/conversas/` |
| Governança de modelos | `src/app/auxiliares/modelos-ia/governanca/` |
| Proxy API agentes | `src/app/api/agents/` |
| API chat/sessions/metrics | `src/app/api/agents/[id]/chat/`, `src/app/api/sessions/`, `src/app/api/agents/[id]/metrics/` |
| Actions (lm-models, lm-providers, agent-types) | `src/app/actions/` |
| Sync Espaider | `src/lib/sync/espaider-sync.ts`, `src/app/api/integracoes/sync/` |
