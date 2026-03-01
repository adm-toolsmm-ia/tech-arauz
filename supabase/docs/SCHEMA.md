# SCHEMA - Tech Arauz (Supabase/PostgreSQL)

Data da auditoria: 2026-03-01
Fonte: `supabase/migrations/001` ate `supabase/migrations/043`

**Export em formato Prisma (extraído via MCP Supabase):** `docs/architecture/data/schema.prisma` — pasta canônica para arquitetura de dados e contexto AI/AIOS.

## 1. Visao geral

Banco multi-tenant com isolamento por `tenant_id`, RLS e foco em:

- Governanca de projetos sincronizados do Espaider
- Logging/auditoria de sincronizacao
- Configuracao de agentes AI e catalogo de modelos LLM

## 2. Dominios de dados

### 2.1 Core tenant + usuarios

- `tenants`
- `profiles` (relacao com `auth.users`)

### 2.2 Projetos + sincronizacao ERP

- `projects`
- `project_schedules`
- `project_deliveries`
- `project_requirements`
- `project_histories`
- `project_approvers`
- `project_budgets`
- `espaider_apis`
- `sync_logs`
- `integration_log_entries`

### 2.3 AI Agents + catalogo de modelos

- `agents`
- `agent_versions`
- `agent_variables`
- `agent_runs`
- `agent_types`
- `agent_templates`
- `lm_providers`
- `lm_models`
- `lm_provider_accounts`

### 2.4 AI Features — Chat, observabilidade e budget

- `agent_sessions` (chat sessions)
- `agent_messages` (conversation turns)
- `agent_run_steps` (detailed execution steps)
- `agent_budgets` (monthly spend limits)
- `agent_usage_daily` (aggregated metrics)
- `agent_deployments` (deployment history)
- `tools` (tool definitions)
- `agent_tool_bindings` (agent-tool relationships)
- `context_providers` (context sources)
- `agent_context_bindings` (agent-context relationships)
- `agent_feedback` (user feedback on chat quality)

## 3. Relacionamentos principais

```text
tenants (1) ---- (N) profiles
tenants (1) ---- (N) projects
projects (1) --- (N) schedules/deliveries/requirements/histories/approvers/budgets
tenants (1) ---- (N) espaider_apis
tenants (1) ---- (N) sync_logs ---- (N) integration_log_entries

tenants (1) ---- (N) agents ---- (N) agent_versions
agents (1) ----- (N) agent_variables
agents (1) ----- (N) agent_runs
agents (1) ----- (N) agent_sessions ---- (N) agent_messages
agent_runs (1) - (N) agent_run_steps
agents (1) ----- (N) agent_budgets
agents (1) ----- (N) agent_usage_daily
agents (1) ----- (N) agent_deployments
tenants (1) ---- (N) agent_types ---- (N) agent_templates
tenants (1) ---- (N) lm_providers ---- (N) lm_models ---- (N) lm_provider_accounts

tenants (1) ---- (N) tools
agents (1) ----- (N) agent_tool_bindings --- (N) tools
tenants (1) ---- (N) context_providers
agents (1) ----- (N) agent_context_bindings --- (N) context_providers
agent_sessions (1) - (N) agent_feedback
```

## 4. Tabelas (resumo)

## `tenants`
- PK: `id (uuid)`
- Campos-chave: `slug` (unique), `name`, `settings`, `created_at`, `updated_at`

## `profiles`
- PK/FK: `id -> auth.users(id)`
- FK: `tenant_id -> tenants(id)`
- Campos-chave: `email`, `full_name`, `role` (`admin|user|viewer`), `is_active`

## `projects`
- PK: `id (uuid)`
- FK: `tenant_id -> tenants(id)`
- Unique: `(tenant_id, espaider_id)`
- Campos-chave:
  - identidade: `espaider_id`, `codigo`, `titulo`
  - status: `situacao_original`, `status_original`
  - planejamento: `fase_atual`, `prazo_fase`, `cronograma_atual`, `prazo_cronograma`
  - visao 360: `importancia_especial`, `impacto_operacional`, `impacto_estrategico`, `escopo`
  - notas: `notes_html`
  - auditoria sync: `espaider_raw`, `sync_status`, `last_sync_at`

## `project_schedules`
- PK: `id (uuid)`
- FK: `tenant_id -> tenants(id)`, `project_id -> projects(id)`
- Unique: `(tenant_id, espaider_id)`
- Campos-chave: `atividade`, `status`, `fase_atividade`, `atrasado`, datas e setor

## `project_deliveries`
- PK: `id (uuid)`
- FK: `tenant_id -> tenants(id)`, `project_id -> projects(id)`
- Unique: `(tenant_id, espaider_id)`
- Campos-chave: `titulo`, `status`, `prioridade`, `ordem`, `detalhamento`

## `project_requirements`
- PK: `id (uuid)`
- FK: `tenant_id -> tenants(id)`, `project_id -> projects(id)`
- Unique: `(tenant_id, espaider_id)`
- Campos-chave: `codigo`, `descricao`, `tipo`, `prioridade`, `impacto`, `entrega_id_espaider`

## `project_histories`
- PK: `id (uuid)` (apos correcao das migrations 018/019/027)
- FK: `project_id -> projects(id)`, `tenant_id -> tenants(id)`
- Unique: `(tenant_id, espaider_id)`

## `project_approvers`
- PK: `id (uuid)`
- FK: `project_id -> projects(id)`, `tenant_id -> tenants(id)`
- Unique: `(tenant_id, espaider_id)`

## `project_budgets`
- PK: `id (uuid)`
- FK: `project_id -> projects(id)`, `tenant_id -> tenants(id)`
- Unique: `(tenant_id, espaider_id)`
- Campos-chave: `value`, `provider`, `quotation_date`, `moeda`

## `espaider_apis`
- PK: `id (uuid)`
- FK: `tenant_id -> tenants(id)`
- Unique: `(tenant_id, identificador)`
- Campos-chave: `nome`, `base_url`, `token`, `identificador`, `tipo`, `settings`

## `sync_logs`
- PK: `id (uuid)`
- FK: `tenant_id -> tenants(id)`
- Campos-chave: `request_id`, `dataset`, `status`, metricas de processamento

## `integration_log_entries`
- PK: `id (uuid)`
- FK: `tenant_id -> tenants(id)`, `sync_log_id -> sync_logs(id)`
- Campos-chave: `request_id`, `level`, `dataset`, `message`, `details`, `logged_at`

## `agents`
- PK: `id (uuid)`
- FK: `tenant_id -> tenants(id)`
- Unique: `(tenant_id, slug)`
- Campos-chave: governanca (`owners`, `tags`, `status`), prompt/model config, runtime metadata

## `agent_versions`
- PK: `id (uuid)`
- FK: `agent_id -> agents(id)`
- Unique: `(agent_id, version)`
- Campos-chave: `agent_config` (snapshot imutavel), `breaking_change`, `commit_message`

## `agent_variables`
- PK: `id (uuid)`
- FK: `agent_id -> agents(id)`
- Unique: `(agent_id, key)`

## `agent_runs`
- PK: `id (uuid)`
- FK: `agent_id -> agents(id)`, `tenant_id -> tenants(id)`
- Campos-chave: `input_data`, `output_data`, `status`, `tokens_used`, `cost_usd`, `duration_ms`

## `agent_types`
- PK: `id (uuid)`
- FK: `tenant_id -> tenants(id)`
- Unique: `(tenant_id, slug)`
- Campos-chave: templates default, campos obrigatorios/recomendados, visual metadata

## `agent_templates`
- PK: `id (uuid)`
- FK: `tenant_id -> tenants(id)`, `agent_type_id -> agent_types(id)`
- Unique: `(tenant_id, agent_type_id, slug)`

## `lm_providers`
- PK: `id (uuid)`
- FK: `tenant_id -> tenants(id)`
- Unique final: `(tenant_id, slug)`
- Campos-chave: endpoint, docs_url, `is_system`, `is_active`

## `lm_models`
- PK: `id (uuid)`
- FK: `tenant_id -> tenants(id)`, `provider_id -> lm_providers(id)`
- Unique: `(provider_id, model_id)`
- Campos-chave: custos, `context_window`, `tier`, `display_order`, `docs_url`
- ALTERs (Migration 042): `input_token_cost_usd`, `output_token_cost_usd`, `provider_account_id` (FK → lm_provider_accounts)

## `lm_provider_accounts`
- PK: `id (uuid)`
- FK: `tenant_id -> tenants(id)`
- Campos-chave: `provider` (openai/anthropic/google/azure), `api_key_encrypted`, `account_identifier`, `monthly_spend_usd`, `quota_limit_usd`
- Nota: chaves criptografadas via Supabase pgcrypto

## `agent_sessions`
- PK: `id (uuid)`
- FK: `tenant_id -> tenants(id)`, `user_id -> auth.users(id)`, `agent_id -> agents(id)`
- Campos-chave: `status` (active/paused/closed), `started_at`, `ended_at`, `token_usage`
- Indice composto: `(tenant_id, agent_id, created_at DESC)`

## `agent_messages`
- PK: `id (uuid)`
- FK: `session_id -> agent_sessions(id)`, `tenant_id -> tenants(id)`
- Campos-chave: `role` (user/assistant), `content`, `metadata` (jsonb), `tokens_used`
- Indice composto: `(session_id, created_at ASC)`, `(tenant_id, created_at DESC)`

## `agent_run_steps`
- PK: `id (uuid)`
- FK: `run_id -> agent_runs(id)`, `tenant_id -> tenants(id)`
- Campos-chave: `step_type` (input/tool_call/observation/output), `input/output` (jsonb), `execution_time_ms`
- Indice composto: `(agent_id, run_id)`, `(tenant_id, created_at DESC)`

## `agent_budgets`
- PK: `id (uuid)`
- FK: `agent_id -> agents(id)`, `tenant_id -> tenants(id)`
- Campos-chave: `monthly_limit_usd`, `current_month_spent_usd`, `reset_date`
- Indice composto: `(tenant_id, agent_id)`, `(reset_date)`

## `agent_usage_daily`
- PK: `id (uuid)`
- FK: `agent_id -> agents(id)`, `tenant_id -> tenants(id)`
- Unique: `(tenant_id, agent_id, date)`
- Campos-chave: `date`, `sessions_count`, `messages_count`, `cost_total_usd`, `avg_latency_ms`, `success_rate_pct`
- Indice composto: `(tenant_id, agent_id, date DESC)`, `(date DESC)`

## `agent_deployments`
- PK: `id (uuid)`
- FK: `agent_id -> agents(id)`, `deployed_by -> auth.users(id)`, `tenant_id -> tenants(id)`
- Campos-chave: `version`, `environment` (dev/staging/prod), `deployed_at`, `config_hash`, `status` (success/failed/rolled_back)
- Indice composto: `(agent_id, deployed_at DESC)`, `(tenant_id, environment, status)`

## `tools`
- PK: `id (uuid)`
- FK: `tenant_id -> tenants(id)`
- Campos-chave: `tool_name`, `description`, `config_schema` (jsonb), `enabled`
- Indice composto: `(tenant_id, tool_name)`, `(enabled)`

## `agent_tool_bindings`
- PK: `id (uuid)`
- FK: `agent_id -> agents(id)`, `tool_id -> tools(id)`, `tenant_id -> tenants(id)`
- Campos-chave: `enabled`, `config_overrides` (jsonb)
- Indice composto: `(agent_id, enabled)`, `(tenant_id, agent_id)`

## `context_providers`
- PK: `id (uuid)`
- FK: `tenant_id -> tenants(id)`
- Campos-chave: `provider_type` (sql/api/knowledge_base), `description`, `config` (jsonb), `enabled`
- Indice composto: `(tenant_id, provider_type)`, `(enabled)`

## `agent_context_bindings`
- PK: `id (uuid)`
- FK: `agent_id -> agents(id)`, `context_id -> context_providers(id)`, `tenant_id -> tenants(id)`
- Campos-chave: `priority`
- Indice composto: `(agent_id, priority)`, `(tenant_id, agent_id)`

## `agent_feedback`
- PK: `id (uuid)`
- FK: `session_id -> agent_sessions(id)`, `tenant_id -> tenants(id)`
- Campos-chave: `rating` (1-5), `feedback_text`, `feedback_type` (quality/accuracy/relevance/performance)
- Indice composto: `(session_id)`, `(tenant_id, created_at DESC)`, `(feedback_type)`

## ALTERs em `agent_runs` (Migration 042)
- ADD: `budget_limit_usd` (numeric)
- ADD: `session_id` (UUID FK → agent_sessions, ON DELETE SET NULL)

## 5. Indices relevantes

- Projeto/listagem: `idx_projects_tenant_id`, `idx_projects_fase_atual`, `idx_projects_data_movimentacao`
- Filhos de projeto: indices por `project_id` e combinacoes `tenant_id/espaider_id`
- Logs: `idx_sync_logs_*`, `idx_log_entries_tenant_level_date`
- AI catalog: `idx_agents_*`, `idx_lm_models_tier_order_active`

## 6. RLS (estado esperado apos migrations finais)

- RLS habilitado nas tabelas de dados principais.
- Padrao predominante:
  - `tenant_id = get_user_tenant_id()` para usuarios autenticados
  - policy separada para `service_role` em operacoes internas de sync
- Funcoes utilitarias:
  - `get_user_tenant_id()`
  - `get_user_role()`
  - `audit_rls_policy()` / `audit_all_rls_policies()`

## 7. Historico de evolucao (macro)

- 001-007: base relacional + RLS + integracao Espaider
- 008-015: expansao campos de projetos (fases e visao 360)
- 016-027: ajustes de constraints e remediacao RLS em child tables/logs
- 028-030: schema de agentes AI + tipos/templates
- 031-038: provedores/modelos LLM e curadoria 360 (tier, custo, ordem, contexto)
- 039-041: expansao de agentes (configs, tipos melhorados) e preparacao para chat
- 042: AI Features Chat & 360° Dashboard (11 tabelas: sessions, messages, run_steps, budgets, usage_daily, deployments, tools, tool_bindings, context_providers, context_bindings, feedback + ALTERs)

---

## 8. PRD UX/UI 2026 — Respostas para @architect (Phase 2 Addendum)

Data: 2026-02-28
Contexto: Brownfield Discovery para PRD "Padronizacao UX/UI com Projetos/Cronogramas somente leitura + Gestao de Tecnologia & IA"

### Pergunta 1: Quais valores reais de status existem em project_schedules?

**Coluna `status`**: TEXT livre, sem CHECK constraint nem enum.
Valores vem do Espaider via `mapearCronograma()` que mapeia o campo `STATUS`.

Valores conhecidos no dominio (via `schedule-status.ts`):
- `"cancelado"` e `"concluído"` sao tratados como inativos por `isConsideredActive()`
- Todos os outros valores sao tratados como "ativos"
- **Nao ha dicionario fechado no banco** — depende dos valores do ERP

**Recomendacao**: Criar migration com `COMMENT ON COLUMN project_schedules.status` documentando valores conhecidos. NAO adicionar CHECK constraint (dados vem do ERP e podem variar).

### Pergunta 2: Campos prioridade/progresso_percentual na API Espaider?

**Analise do mapper.ts** (`CAMPOS_CRONOGRAMA`):
- `PRIORIDADE` **NAO existe** em cronogramas — so existe em `CAMPOS_PROJETOS`, `CAMPOS_ENTREGAS`, `CAMPOS_REQUISITOS`
- `PROGRESSO` / `PROGRESSOPERCENTUAL` **NAO existe em nenhum dataset** do Espaider

**Consequencia para o PRD**:
- Coluna "Prioridade" no Kanban/Lista de cronogramas: **impossivel sem dados** (campo nao existe na API)
- Barra de progresso: **impossivel** (campo nao existe)
- Alternativa viavel: usar `atrasado` (boolean) como indicador de progresso/urgencia

### Pergunta 3: Indices em data_inicio/data_fim de project_schedules?

**Estado atual**: **NAO existem indices dedicados** em `data_inicio` nem `data_fim`.

Indices existentes em project_schedules (migration 010):
- `idx_schedules_fase_atividade` (fase_atividade)
- `idx_schedules_atrasado` (partial: WHERE atrasado = true)
- `idx_schedules_setor` (setor_responsavel)

**Impacto critico**: Queries de intersecao de periodo (`start <= P.data_fim AND end >= P.data_inicio`) para Agenda/Kanban farao full table scan.

**Recomendacao**: Criar migration com:
```sql
CREATE INDEX idx_schedules_data_inicio ON project_schedules (data_inicio);
CREATE INDEX idx_schedules_data_fim ON project_schedules (data_fim);
CREATE INDEX idx_schedules_status ON project_schedules (status);
-- Composite para queries de periodo com filtro de tenant:
CREATE INDEX idx_schedules_tenant_dates ON project_schedules (tenant_id, data_inicio, data_fim);
```

### Pergunta 4: updated_at confiavel para "Atualizado as"?

**SIM** — Confiavel para exibicao.

Evidencia (migration 001):
```sql
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$ BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;
```
Trigger aplicado em TODAS as tabelas: `projects`, `project_schedules`, `project_deliveries`, etc.

**Semantica**: `updated_at` reflete o ultimo UPDATE no banco local (sync do Espaider), NAO a data de alteracao no ERP. Para o PRD, isso e adequado pois o banner diz "Fonte: ERP — somente leitura" e o timestamp mostra quando o dado foi sincronizado.

### Pergunta 5: Timestamp de ultima sync em integration_log_entries?

**Duas opcoes viaveis**:

1. **`sync_logs.completed_at`** (melhor para "ultima sync global"):
   - `SELECT completed_at FROM sync_logs WHERE status = 'completed' ORDER BY completed_at DESC LIMIT 1`
   - Retorna o timestamp de conclusao do ultimo sync bem-sucedido

2. **`integration_log_entries.logged_at`** (melhor para "ultima atividade"):
   - `SELECT MAX(logged_at) FROM integration_log_entries WHERE dataset = 'Cronogramas'`
   - Permite granularidade por dataset

**Recomendacao para o PRD**: Usar `sync_logs.completed_at` para o banner global e `integration_log_entries.logged_at` para timestamps por modulo.

### Gaps vs PRD (campos ausentes em project_schedules)

| Campo PRD | Status DB | Origem |
|-----------|-----------|--------|
| prioridade | NAO EXISTE | Espaider nao envia para cronogramas |
| progresso_percentual | NAO EXISTE | Espaider nao tem esse campo |
| etiquetas[] | NAO EXISTE | Seria feature local (requer CRUD, conflita com read-only) |
| responsavel | EXISTE | `responsavel` TEXT |
| fase_atividade | EXISTE | `fase_atividade` TEXT |
| atrasado | EXISTE | `atrasado` BOOLEAN |
| data_inicio | EXISTE | `data_inicio` TIMESTAMP |
| data_fim | EXISTE | `data_fim` TIMESTAMP |
| data_prazo | EXISTE | `data_prazo` TIMESTAMP |
| setor_responsavel | EXISTE | `setor_responsavel` TEXT |

### Bug identificado: getWeekStart() inicia no Domingo

`src/lib/domain/schedule-status.ts` linha 106-111:
```typescript
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day); // BUG: Sunday=0, subtrai 0 no domingo
  d.setHours(0, 0, 0, 0);
  return d;
}
```
PRD exige ISO-8601 (segunda-feira). Fix: `d.setDate(d.getDate() - ((day + 6) % 7))`

