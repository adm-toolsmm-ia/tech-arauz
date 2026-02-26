# SCHEMA - Tech Arauz (Supabase/PostgreSQL)

Data da auditoria: 2026-02-26  
Fonte: `supabase/migrations/001` ate `supabase/migrations/038`

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
tenants (1) ---- (N) agent_types ---- (N) agent_templates
tenants (1) ---- (N) lm_providers ---- (N) lm_models
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

