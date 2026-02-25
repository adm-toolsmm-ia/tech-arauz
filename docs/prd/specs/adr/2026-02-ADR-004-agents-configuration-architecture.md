# ADR-004: Arquitetura de Configuração de Agentes AI

> **Status**: Aceito  
> **Data**: 2026-02-24  
> **Decisores**: Gabriel Cristofolini (CTO/PO), Aria (Architect), Dara (Data Engineer)  
> **Tags**: agentes-ai, arquitetura, frontend, banco-de-dados, workflows

---

## Contexto

O Tech Arauz necessita de um módulo para **configurar agentes AI** que serão executados em workflows operacionais usando **LangChain/LangGraph** (Fase 2).

### Requisitos

1. **Configuração real**: Agentes são persistidos em **Supabase**, não localStorage
2. **Identidade & Governança**: Nome, slug, descrição, owners, tags, status (draft/published/deprecated)
3. **Persona & Prompt**: Persona curta, objetivo, instruções, template com {{variáveis}}, exemplos
4. **Modelo/LLM**: Provider (OpenAI, Anthropic, Azure, outro), model_id, parâmetros (temperatura, max_tokens, etc.)
5. **Output Validation**: JSON Schema para validar output do LLM
6. **Versionamento Imutável**: Draft (editável) → Publish (1.0.0, 1.0.1, etc.) → Rollback seguro
7. **Portabilidade**: Export/Import JSON canônico para integração com workflows

### Escopo MVP

- ✅ Front-end: CRUD de agentes com editor de 6 abas (Básico, Modelo, Prompt, I/O, Teste, Versionamento)
- ✅ Back-end: Schema Supabase + API routes Next.js + RLS por tenant
- ✅ Sem mock runner (validação local do prompt + preview apenas)
- ⏭️ Fase 2: Real LLM calls, integração LangChain/LangGraph

---

## Decisão

### 1. Persistência: Supabase (PostgreSQL)

| Componente | Escolha | Justificativa |
|-----------|---------|---------------|
| **Banco** | Supabase (PostgreSQL) | RLS nativa, tenant isolation, já integrado |
| **Tabelas** | agents, agent_versions, agent_variables, agent_runs | Separação clara: draft (mutable) vs. published (immutable) |
| **RLS** | Por tenant_id | Isolamento automático via `get_user_tenant_id()` |

**Tabelas:**

```sql
agents
  ├─ id, tenant_id (PK + FK)
  ├─ name, slug, description, owners[], tags[]
  ├─ status: 'draft' | 'published' | 'deprecated'
  ├─ persona, prompt_objective, prompt_instructions, prompt_template
  ├─ output_schema (JSON Schema)
  ├─ model_provider, model_id, model_temperature, ... (LLM config)
  ├─ runtime_tool_ids[], runtime_context_provider_ids[] (placeholders Phase 2)
  └─ created_at, updated_at, created_by, updated_by

agent_versions
  ├─ id, agent_id, version (semver: "1.0.0")
  ├─ status: 'published' (sempre)
  ├─ agent_config (JSONB: snapshot imutável de agents row)
  ├─ commit_message, change_reason
  ├─ breaking_change (auto-set se I/O mudou incompatível)
  └─ created_at, created_by

agent_variables
  ├─ id, agent_id, key
  ├─ type: 'string' | 'number' | 'boolean' | 'enum' | 'array' | 'object'
  ├─ required, default_value, enum_values[], regex_pattern, description
  └─ created_at, updated_at

agent_runs (opcional MVP, útil Phase 2)
  ├─ id, agent_id, agent_version, tenant_id
  ├─ input_data, output_data, status, error_message
  ├─ tokens_used, cost_usd, duration_ms
  └─ created_at, completed_at, created_by
```

### 2. Front-end: Next.js + React Query + Zod

| Componente | Escolha | Justificativa |
|-----------|---------|---------------|
| **HTTP Client** | React Query (@tanstack/react-query) | Cache automático, sync multi-tab, menos waterfalls |
| **State** | Zustand (se necessário local UI state) | Complementa React Query para UI state efêmero |
| **Forms** | React Hook Form + Zod | Validação tipada, integrado com React Query |
| **Validação** | Ajv (JSON Schema) + Zod (tipos) | Ajv para input_schema/output_schema; Zod para AgentConfig |
| **UI** | shadcn/ui + Tailwind | Já padrão no projeto |

**Service Layer:**

```typescript
// src/services/agents/agentsApiService.ts
export const agentsApiService = {
  listAgents(): Promise<AgentHead[]>
  getAgent(id): Promise<AgentConfig>
  saveDraft(id, config): Promise<AgentConfig>
  publish(id, commitMessage, changeReason): Promise<AgentVersion>
  rollback(id, targetVersion): Promise<void>
  exportVersion(id): Promise<string> // JSON canônico
  importVersion(json): Promise<AgentConfig>
}

// src/services/agents/agentsStore.ts (React Query hooks)
export function useAgentsList() { ... }
export function useAgent(id) { ... }
export function useSaveDraftMutation() { ... }
export function usePublishMutation() { ... }
```

### 3. API Routes: Next.js App Router

| Rota | Método | Função |
|------|--------|--------|
| `/api/agents` | GET | Listar agentes do tenant |
| `/api/agents` | POST | Criar agent novo (draft) |
| `/api/agents/[id]` | GET | Detalhes do agente |
| `/api/agents/[id]` | PATCH | Atualizar draft |
| `/api/agents/[id]` | DELETE | Deletar draft (não publicado) |
| `/api/agents/[id]/publish` | POST | Publicar versão (1.0.0, 1.0.1, ...) |
| `/api/agents/[id]/rollback` | POST | Restaurar agente para versão anterior |
| `/api/agents/[id]/export` | GET | Export JSON canônico (versão publicada) |
| `/api/agents/[id]/versions` | GET | Listar versões publicadas |
| `/api/agents/import` | POST | Import JSON → cria draft |

**Auth & RLS:**

- Verificação de user via Supabase Auth
- RLS automática via `get_user_tenant_id()`
- Sem passagem de tenant_id via query/body (já isolado via RLS)

### 4. Versionamento: Semver Automático

| Ação | Regra | Exemplo |
|------|-------|---------|
| **Publish 1º vez** | v1.0.0 | agent criado → publicar → v1.0.0 |
| **Publish sem breaking** | Bump patch | v1.0.0 → editar prompt → publicar → v1.0.1 |
| **Publish com breaking** | Manual ou auto-flag | Remover required field de input_schema → breaking_change=true (pode auto-bump minor) |

**Breaking Change:**

- Auto-detectado: se `input_schema` ou `output_schema` removeu required field, tipo mudou, ou estrutura incompatível
- UI alerta ao publisher

### 5. Front-end Editor: 6 Abas

1. **Básico**: nome, slug, descrição, owners, tags, status (read-only)
2. **Modelo**: provider, model_id, temperature, top_p, max_tokens, penalties, stop_sequences, response_format
3. **Prompt**: objetivo, instruções (array), template com {{variáveis}}, persona (opt), exemplos (0-3)
4. **I/O**: input_schema (auto-gerado ou raw JSON) e output_schema (JSON Schema)
5. **Teste**: Gera form a partir do input_schema, valida prompt + output contra schemas (sem LLM call)
6. **Versionamento**: Timeline de versões, diff visual (draft vs. publicada), publish/rollback botões

---

## Consequências

### ✅ Positivas

1. **Segurança**: RLS nativa, tenant isolation, sem secrets no front-end
2. **Auditoria**: created_by, updated_by, timestamps automáticos
3. **Versionamento Seguro**: Snapshots imutáveis, rollback garantido
4. **Multi-user**: Sync via React Query + Supabase realtime (opcional)
5. **Escalável**: Schema normalizado, índices adequados
6. **Integração Futura**: JSON exportado é contrato direto para LangChain/LangGraph

### ⚠️ Tradeoffs

1. **Latência**: Round-trip ao BD vs. localStorage → mitigado por React Query cache
2. **Dependência Supabase**: Se BD cair, editor offline → fallback localStorage opcional Phase 2
3. **Sincronização Multi-tab**: React Query invalida cache, mas pode haver delay → acceptable para MVP

---

## Alternativas Consideradas

### ❌ LocalStorage apenas

**Rejeitada porque:**
- Sem persistência real entre usuários/devices
- Sem auditoria
- Sem versionamento seguro

### ❌ FastAPI service separado

**Rejeitada porque:**
- Supabase já integrado e testado no projeto
- Menos overhead operacional
- RLS nativa (FastAPI exigiria implementação manual)

### ❌ Versionamento inline (sem agent_versions)

**Rejeitada porque:**
- Difícil rollback (sobrescreve dados)
- Sem auditoria clara
- Sem snapshot imutável para workflows consumirem

---

## Implementação (Timeline)

| Fase | Foco | Timeline |
|------|------|----------|
| **1** | Schema Supabase + Migrations (025) | 1 dia |
| **2** | API routes Next.js + Auth/RLS | 2-3 dias |
| **3** | Service + React Query hooks | 2 dias |
| **4** | UI Editor (6 abas) | 5-6 dias |
| **5** | Validações + Testes + Docs | 3-4 dias |

**Total**: 15-19 dias (~3 semanas)

---

## Status de Implementação

- ✅ Migration SQL criada: `supabase/migrations/025_create_agents_schema.sql`
- ✅ Tipos TypeScript: `src/types/agents.ts`
- ⏳ API routes: `src/app/api/agents/*` (Fase 2)
- ⏳ Service layer: `src/services/agents/*` (Fase 3)
- ⏳ UI Components: `src/components/agents/*` (Fase 4)

---

## Referências

- **ADR-001**: Stack Tecnológica (Supabase, Next.js)
- **ADR-002**: Autenticação e Espaider
- **ADR-003**: Design System
- **Código**: `.ai/ADR-001` (RLS Patterns), `.ai/ADR-003` (UPSERT Pattern)

---

## Próximas Decisões (Phase 2)

1. **Real LLM Calls**: Como chamar OpenAI/Anthropic do TestTab → API Python ou direto?
2. **LangChain Integration**: Como carregar agent_config em workflows?
3. **Observabilidade**: LangSmith logging automático?
4. **Rollback Policy**: Quantas versões manter por agente? (ex.: últimas 10)
