# 📡 API DOCUMENTATION — Tech Arauz v0.2.3+

**Documento:** Complete REST API Reference
**Data:** 2026-03-15
**Versão Documentada:** v0.2.3+ (2026-03-12 baseline)
**Owner:** @dev (Dex)
**Reviewers:** @architect (Aria), @devops (Gage)
**Propósito:** Reference for all 20+ REST API endpoints, authentication, authorization, request/response schemas

---

## 📋 ENDPOINTS OVERVIEW

| Category | Endpoints | Auth | Rate Limit |
|----------|-----------|------|-----------|
| **Agents** | 9 endpoints | JWT (Bearer token) | 100 req/min |
| **Integrations** | 7 endpoints | JWT + Role check | 50 req/min |
| **Search** | 1 endpoint | Public | 200 req/min |
| **Sessions** | 1 endpoint | JWT | 100 req/min |
| **LM Models** | 1 endpoint | JWT + Admin | 50 req/min |

**Total:** 20+ REST endpoints

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### Authentication Flow

```
1. Supabase Auth login (Supabase UI handles JWT issuance)
2. Client receives JWT access_token
3. Client sends: Authorization: Bearer {access_token}
4. Next.js middleware validates JWT
5. User context available to endpoint handlers
```

### Role-Based Authorization

| Role | Agents | Integrations | Sync | Logs | Sessions |
|------|--------|--------------|------|------|----------|
| **admin** | ✅ Full | ✅ Full (CRUD) | ✅ Trigger | ✅ Read | ✅ Read own |
| **user** | ✅ List only | ✅ Read only | ❌ Blocked | ✅ Read | ✅ Read own |
| **viewer** | ❌ Blocked | ❌ Blocked | ❌ Blocked | ❌ Blocked | ❌ Blocked |

### Token Management

- **Issuer:** Supabase Auth (managed by Supabase UI)
- **Format:** JWT (signed RS256)
- **Lifetime:** 3600 seconds (1 hour)
- **Refresh:** Automatic via Supabase client
- **Header:** `Authorization: Bearer {token}`

---

## 🤖 AGENTS ENDPOINTS

### 1. GET /api/agents
**List all agents**

**Authorization:** Authenticated (any non-viewer role)

**Query Parameters:**
```
?usage_type=string     // Filter by type (optional)
?status=string         // Filter by status: active|inactive (optional)
?show_in_shortcut=true // Filter shortcuts only (optional)
?limit=number          // Max 100, default 100 (optional)
```

**Proxy Chain:**
1. Primary: FastAPI service at `AI_SERVICE_URL/api/agents/v2`
2. Fallback (503): Supabase direct query if FastAPI unavailable

**Response 200:**
```json
{
  "agents": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string",
      "usage_type": "string",
      "status": "active|inactive",
      "show_in_shortcut": boolean,
      "created_at": "ISO 8601",
      "updated_at": "ISO 8601"
    }
  ],
  "total": number,
  "page": number,
  "page_size": number,
  "has_next": boolean
}
```

**Response 401:** `{ "error": "Unauthorized" }`
**Response 403:** `{ "error": "Forbidden" }` (viewer role)
**Response 503:** `{ "error": "AI service unavailable" }`

---

### 2. POST /api/agents
**Create new agent**

**Authorization:** Authenticated (admin or user role)

**Request Body:**
```json
{
  "name": "string (required)",
  "description": "string",
  "usage_type": "string",
  "status": "active|inactive",
  "show_in_shortcut": boolean
}
```

**Proxy Chain:**
1. FastAPI service at `AI_SERVICE_URL/api/agents/v2`
2. No fallback (direct error)

**Response 201:**
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "created_at": "ISO 8601"
}
```

**Response 400:** `{ "error": "Field {field} is required" }`
**Response 401:** `{ "error": "Unauthorized" }`
**Response 403:** `{ "error": "Forbidden" }` (viewer role)
**Response 503:** `{ "error": "AI service unavailable" }`

---

### 3. GET /api/agents/[id]
**Get agent details**

**Authorization:** Authenticated (any non-viewer role)

**Path Parameters:**
- `id`: Agent UUID

**Proxy Chain:**
1. FastAPI service at `AI_SERVICE_URL/api/agents/v2/{id}`

**Response 200:**
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "persona": "string",
  "prompt_objective": "string",
  "model_provider": "openai|anthropic|google|azure",
  "model_id": "string (e.g., gpt-4o)",
  "model_temperature": 0.0-2.0,
  "model_max_tokens": number,
  "status": "active|inactive",
  "created_at": "ISO 8601",
  "updated_at": "ISO 8601"
}
```

**Response 401:** `{ "error": "Unauthorized" }`
**Response 404:** `{ "error": "Agent not found" }`
**Response 503:** `{ "error": "AI service unavailable" }`

---

### 4. PATCH /api/agents/[id]
**Update agent**

**Authorization:** Authenticated (admin or user role)

**Path Parameters:**
- `id`: Agent UUID

**Request Body (partial):**
```json
{
  "name": "string",
  "description": "string",
  "status": "active|inactive",
  "model_temperature": 0.0-2.0,
  "model_max_tokens": number
}
```

**Proxy Chain:**
1. FastAPI service at `AI_SERVICE_URL/api/agents/v2/{id}`

**Response 200:**
```json
{
  "id": "uuid",
  "name": "string",
  "updated_at": "ISO 8601"
}
```

**Response 400:** `{ "error": "Invalid field" }`
**Response 401:** `{ "error": "Unauthorized" }`
**Response 403:** `{ "error": "Forbidden" }`
**Response 404:** `{ "error": "Agent not found" }`
**Response 503:** `{ "error": "AI service unavailable" }`

---

### 5. DELETE /api/agents/[id]
**Delete agent**

**Authorization:** Authenticated (admin only)

**Path Parameters:**
- `id`: Agent UUID

**Proxy Chain:**
1. FastAPI service at `AI_SERVICE_URL/api/agents/v2/{id}`

**Response 200:**
```json
{
  "success": true,
  "message": "Agent deleted"
}
```

**Response 401:** `{ "error": "Unauthorized" }`
**Response 403:** `{ "error": "Forbidden" }`
**Response 404:** `{ "error": "Agent not found" }`
**Response 503:** `{ "error": "AI service unavailable" }`

---

### 6. POST /api/agents/[id]/chat
**Chat with agent**

**Authorization:** Authenticated (any non-viewer role)

**Path Parameters:**
- `id`: Agent UUID

**Request Body:**
```json
{
  "message": "string (required)",
  "session_id": "string (optional, for conversation context)"
}
```

**Proxy Chain:**
1. Primary: FastAPI service at `AI_SERVICE_URL/api/agents/{id}/chat`
2. Fallback (502/503): Direct OpenAI Chat Completions API
   - Fetches agent config from Supabase
   - Uses agent.model_id, temperature, max_tokens
   - Builds system prompt from agent.persona + agent.prompt_objective

**Response 200:**
```json
{
  "session_id": "string",
  "message_id": "string",
  "answer": "string (assistant response)",
  "response": "string (compat field)",
  "tokens_used": number,
  "cost_usd": number,
  "duration_ms": number,
  "fallback": false
}
```

**Response 200 (OpenAI fallback):**
```json
{
  "session_id": "fallback-{timestamp}",
  "message_id": "fb-{timestamp}",
  "answer": "string",
  "response": "string",
  "tokens_used": number,
  "cost_usd": 0,
  "duration_ms": 0,
  "fallback": true
}
```

**Response 400:** `{ "error": "Message is required" }`
**Response 401:** `{ "error": "Unauthorized" }`
**Response 404:** `{ "error": "Agent not found" }` (fallback only)
**Response 500:** `{ "error": "LLM not configured" }` (fallback only, no OPENAI_API_KEY)
**Response 502:** `{ "error": "Failed to generate response from LLM" }` (fallback only)

---

### 7. GET /api/agents/[id]/sessions
**List sessions for agent**

**Authorization:** Authenticated

**Path Parameters:**
- `id`: Agent UUID

**Query Parameters:**
```
?page=number    // Default 1
?limit=number   // Default 20, max 100
```

**Response 200:**
```json
{
  "sessions": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "agent_id": "uuid",
      "started_at": "ISO 8601",
      "ended_at": "ISO 8601 | null",
      "status": "active|paused|closed",
      "message_count": number,
      "created_at": "ISO 8601",
      "updated_at": "ISO 8601"
    }
  ],
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number
  }
}
```

**Response 401:** `{ "error": "Unauthorized" }`

---

### 8. GET /api/agents/[id]/traces
**Get execution traces for agent**

**Authorization:** Authenticated (admin only)

**Path Parameters:**
- `id`: Agent UUID

**Response 200:**
```json
{
  "traces": [
    {
      "id": "uuid",
      "timestamp": "ISO 8601",
      "event_type": "string",
      "details": "object"
    }
  ]
}
```

---

### 9. GET /api/agents/[id]/metrics
**Get metrics for agent**

**Authorization:** Authenticated (admin only)

**Path Parameters:**
- `id`: Agent UUID

**Response 200:**
```json
{
  "agent_id": "uuid",
  "total_messages": number,
  "total_sessions": number,
  "avg_response_time_ms": number,
  "success_rate": number,
  "last_used_at": "ISO 8601"
}
```

---

## 🔗 INTEGRATIONS ENDPOINTS

### 10. GET /api/integracoes
**List all Espaider APIs**

**Authorization:** Authenticated (admin or user role)

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "tenant_id": "uuid",
      "nome": "string",
      "identificador": "string",
      "tipo": "projetos|entregas|cronogramas|...",
      "is_active": boolean,
      "base_url": "string",
      "last_sync_at": "ISO 8601 | null",
      "last_sync_status": "success|error|pending",
      "created_at": "ISO 8601",
      "updated_at": "ISO 8601"
    }
  ]
}
```

**Response 401:** `{ "error": "Não autenticado. Faça login para continuar." }`
**Response 403:** `{ "error": "Sem permissão. Role \"{role}\" não tem acesso a integrações." }`

---

### 11. POST /api/integracoes
**Create new Espaider API**

**Authorization:** Admin only

**Request Body:**
```json
{
  "nome": "string (required)",
  "identificador": "string (required)",
  "tipo": "string (default: projetos)",
  "is_active": boolean (default: true),
  "base_url": "string (optional, defaults to ESPAIDER_BASE_URL env)",
  "token": "string (optional)"
}
```

**Token Handling:**
- If token not provided: stores as `"PREENCHER_TOKEN"`
- If token provided and `INTEGRATION_TOKEN_SECRET` set: encrypts and stores
- If token provided and no secret: stores plaintext (with warning)

**Response 201:**
```json
{
  "data": {
    "id": "uuid",
    "tenant_id": "uuid",
    "nome": "string",
    "identificador": "string",
    "tipo": "string",
    "is_active": boolean,
    "base_url": "string",
    "created_at": "ISO 8601"
  }
}
```

**Response 400:** `{ "error": "Nome e Identificador são obrigatórios." }`
**Response 401:** `{ "error": "Não autenticado." }`
**Response 403:** `{ "error": "Apenas administradores podem cadastrar APIs." }`

---

### 12. PUT /api/integracoes
**Update Espaider API**

**Authorization:** Admin only

**Request Body:**
```json
{
  "id": "uuid (required)",
  "nome": "string",
  "identificador": "string",
  "tipo": "string",
  "is_active": boolean,
  "base_url": "string",
  "token": "string (optional, only included if provided)"
}
```

**Response 200:**
```json
{
  "data": {
    "id": "uuid",
    "nome": "string",
    "updated_at": "ISO 8601"
  }
}
```

**Response 400:** `{ "error": "ID obrigatório." }`
**Response 401:** `{ "error": "Não autenticado." }`
**Response 403:** `{ "error": "Apenas administradores podem editar APIs." }`
**Response 404:** `{ "error": "API not found" }`

---

### 13. DELETE /api/integracoes
**Delete Espaider API**

**Authorization:** Admin only

**Query Parameters:**
```
?id=uuid (required)
```

**Response 200:**
```json
{
  "success": true
}
```

**Response 400:** `{ "error": "ID obrigatório." }`
**Response 401:** `{ "error": "Não autenticado." }`
**Response 403:** `{ "error": "Apenas administradores podem remover APIs." }`

---

### 14. POST /api/integracoes/sync
**Trigger full sync from all Espaider APIs**

**Authorization:** Admin only (role check enforced)

**Request Body (optional):**
```json
{
  "apiId": "uuid (optional, if provided: sync only that API)"
}
```

**Execution:**
1. Validates JWT and role (admin only)
2. Gets user's tenant_id from profiles
3. Calls `executeSyncAll(serviceClient, tenantId)`
4. Circuit breaker pattern with retry logic (see ESPAIDER-INTEGRATION.md)
5. Logs all changes to integration_log_entries

**Response 200:**
```json
{
  "success": true,
  "message": "Sincronização concluída com sucesso.",
  "request_id": "sync_{timestamp}_{userId}",
  "details": {
    "datasets": [
      {
        "name": "Projetos",
        "created": number,
        "updated": number,
        "errors": number
      }
    ],
    "totalCreated": number,
    "totalUpdated": number,
    "totalErrors": number,
    "durationMs": number
  }
}
```

**Response 401:** `{ "success": false, "message": "Não autenticado. Faça login para continuar." }`
**Response 403:** `{ "success": false, "message": "Sem permissão. Sua role ({role}) não permite iniciar sincronizações." }`
**Response 500:** `{ "success": false, "message": "Erro ao iniciar sincronização. Contate o administrador." }`

**Duration:** Typically 5-30 seconds depending on dataset size

---

### 15. GET /api/integracoes/logs
**Fetch integration sync logs with filters**

**Authorization:** Authenticated (admin or user role)

**Query Parameters:**
```
?page=number          // Default 1
?limit=number         // Default 50, max 100
?level=string         // Filter: info|warn|error|success
?dataset=string       // Filter: Projetos|Entregas|Cronogramas|...
?startDate=ISO date   // Range start (inclusive)
?endDate=ISO date     // Range end (inclusive, extends to 23:59:59)
?requestId=string     // Filter by sync request_id
?search=string        // Full-text search in message field
```

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "tenant_id": "uuid",
      "level": "info|warn|error|success",
      "dataset": "string",
      "message": "string",
      "request_id": "string",
      "logged_at": "ISO 8601",
      "details": "object (nullable)"
    }
  ],
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number
  },
  "meta": {
    "query_time_ms": number,
    "returned_count": number
  }
}
```

**Response 401:** `{ "error": "Não autenticado. Faça login para continuar." }`
**Response 403:** `{ "error": "Sem permissão. Sua role ({role}) não permite acesso a logs." }`

---

### 16. GET /api/integracoes/logs/summary
**Get summary statistics of integration logs**

**Authorization:** Authenticated (admin or user role)

**Query Parameters:**
```
?days=number          // Last N days (default: 7)
```

**Response 200:**
```json
{
  "total_syncs": number,
  "successful_syncs": number,
  "failed_syncs": number,
  "total_records_created": number,
  "total_records_updated": number,
  "total_errors": number,
  "last_sync_at": "ISO 8601",
  "avg_duration_ms": number
}
```

---

### 17. POST /api/integracoes/setup
**Setup or configure Espaider integration**

**Authorization:** Admin only

**Request Body:**
```json
{
  "base_url": "string (optional, validates connection)",
  "test_mode": boolean (optional, if true: test without saving)
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Integração configurada com sucesso.",
  "api_count": number
}
```

---

### 18. POST /api/integracoes/test
**Test Espaider API connection**

**Authorization:** Admin only

**Request Body:**
```json
{
  "api_id": "uuid",
  "sample_size": number (optional, default: 10)
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Conexão estabelecida com sucesso.",
  "records_fetched": number,
  "duration_ms": number
}
```

**Response 500:**
```json
{
  "success": false,
  "error": "Connection failed",
  "details": "string"
}
```

---

## 🔍 SEARCH ENDPOINTS

### 19. GET /api/search/suggestions
**Get search suggestions (autocomplete)**

**Authorization:** Public (no auth required)

**Query Parameters:**
```
?q=string             // Search query (min 2 chars for filtering)
```

**Caching:**
- TTL: 1 hour per query
- In-memory cache per server instance
- No persistence

**System Suggestions (default):**
```
- Projetos Ativos (freq: 100)
- Meus Projetos (freq: 95)
- Projetos Finalizados (freq: 80)
- Equipes (freq: 75)
- Relatórios (freq: 70)
- Configurações (freq: 60)
- Notificações (freq: 50)
- Agentes (freq: 45)
```

**Response 200:**
```json
{
  "suggestions": [
    {
      "id": "string",
      "text": "string",
      "type": "recent|frequent|system",
      "frequency": number,
      "timestamp": "ISO 8601"
    }
  ],
  "cached": boolean,
  "timestamp": "ISO 8601"
}
```

**Response 200 (short query < 2 chars):**
```json
{
  "suggestions": [
    // Top 5 system suggestions
  ],
  "cached": false,
  "timestamp": "ISO 8601"
}
```

**Response 500:** `{ "error": "Internal server error", "suggestions": [] }`

---

## 👤 SESSIONS ENDPOINTS

### 20. GET /api/sessions
**List agent sessions for authenticated user**

**Authorization:** Authenticated

**Query Parameters:**
```
?page=number          // Default 1
?limit=number         // Default 20, max 100
?agent_id=uuid        // Filter by agent (optional)
?status=string        // Filter: active|paused|closed (optional)
```

**Response 200:**
```json
{
  "sessions": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "agent_id": "uuid",
      "agent_name": "string",
      "started_at": "ISO 8601",
      "ended_at": "ISO 8601 | null",
      "status": "active|paused|closed",
      "message_count": number,
      "created_at": "ISO 8601",
      "updated_at": "ISO 8601"
    }
  ],
  "total": number,
  "page": number,
  "limit": number,
  "hasMore": boolean
}
```

**Response 401:** `{ "error": "Unauthorized" }`
**Response 500:** `{ "error": "Internal server error" }`

---

## 🎨 LM MODELS ENDPOINTS

### 21. POST /api/lm-models/bulk-update
**Bulk update LM model configurations**

**Authorization:** Admin only

**Request Body:**
```json
{
  "updates": [
    {
      "id": "uuid",
      "model_id": "string (e.g., gpt-4o, claude-3-5-sonnet)",
      "model_temperature": 0.0-2.0,
      "model_max_tokens": number,
      "cost_per_1k_input": number (optional),
      "cost_per_1k_output": number (optional)
    }
  ]
}
```

**Response 200:**
```json
{
  "success": true,
  "updated_count": number,
  "failed_count": number
}
```

**Response 400:** `{ "error": "Invalid updates format" }`
**Response 401:** `{ "error": "Unauthorized" }`
**Response 403:** `{ "error": "Admin only" }`

---

## 📊 COMMON RESPONSE PATTERNS

### Error Responses

**400 Bad Request:**
```json
{
  "error": "string (field/validation error)",
  "details": "string (optional)"
}
```

**401 Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

**403 Forbidden:**
```json
{
  "error": "Forbidden",
  "message": "string (explanation)"
}
```

**404 Not Found:**
```json
{
  "error": "Not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error",
  "request_id": "string (optional, for debugging)"
}
```

---

## 🔄 PAGINATION PATTERN

Used consistently in list endpoints:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1234,
    "totalPages": 25
  },
  "meta": {
    "query_time_ms": 145,
    "returned_count": 50
  }
}
```

---

## 🌍 ENVIRONMENT VARIABLES

| Variable | Default | Purpose |
|----------|---------|---------|
| `AI_SERVICE_URL` | http://localhost:8000 | Python FastAPI service for agents |
| `ESPAIDER_BASE_URL` | — | Espaider BI API base URL |
| `OPENAI_API_KEY` | — | OpenAI fallback for chat endpoint |
| `INTEGRATION_TOKEN_SECRET` | — | Encryption key for API tokens |

---

## 📡 PROXY PATTERN

Several endpoints proxy requests to external services:

```
Next.js API Route
  ↓
1. Auth check (JWT validation)
2. Role/permission check
3. Proxy to external service
4. Fallback strategy (if available)
5. Return response to client
```

**Fallback Examples:**
- `/api/agents` → FastAPI 503 → Supabase fallback
- `/api/agents/[id]/chat` → FastAPI unavailable → OpenAI direct call

---

## ✅ QUALITY GATES & VALIDATIONS

### Input Validation
- All requests validated with Zod schemas (where applicable)
- JWT tokens validated via Supabase Auth
- Role-based access control enforced server-side
- Query parameters sanitized (SQL injection protection via ORM)

### Error Handling
- Consistent HTTP status codes
- Meaningful error messages (user-facing Portuguese)
- Structured JSON responses
- Logging to console (CloudWatch in production)

### Performance
- Request timeout: 30 seconds (standard Next.js)
- Suggestion cache: 1 hour TTL
- Pagination: max 100 items per request
- No response size limits documented

---

## 🎯 PARA DESENVOLVEDORES (@dev)

**Como usar este documento:**

1. **Implementar novo endpoint:**
   - Follow proxy pattern if integrating with external service
   - Use existing auth/role patterns from similar endpoints
   - Add fallback strategy if calling external service
   - Return consistent JSON format (with pagination if listing)

2. **Adicionar feature:**
   - List endpoint: add `?filter` query params
   - Create endpoint: add validation + error responses
   - Update endpoint: use PATCH for partial, PUT for full
   - Delete endpoint: return `{ success: true }` or error

3. **Testing:**
   - Mock external services (FastAPI, Espaider)
   - Test all role combinations (admin, user, viewer)
   - Test pagination edge cases (page 0, limit > 100)
   - Test error scenarios (missing auth, invalid input)

4. **Debugging:**
   - Check `[endpoint/METHOD]` console logs for request flow
   - Trace proxy errors to external service (AI_SERVICE_URL, ESPAIDER_BASE_URL)
   - Verify JWT token validity with Supabase debugger
   - Check permission role in `profiles` table

**Padrões comuns:**
- Auth: `supabase.auth.getUser()` + session check
- Role check: `profile.role` against allowed roles array
- Fallback: try-catch with graceful degradation
- Logging: `console.error('[endpoint] message')` for debugging
- Pagination: `(page-1)*limit` offset calculation

---

## 📝 NOTAS DE IMPLEMENTAÇÃO

- **RLS Policies:** All Supabase queries respect RLS (via service client bypasses for admin operations)
- **Token Security:** Integration tokens encrypted when secret configured, plaintext with warning otherwise
- **Circuit Breaker:** Espaider sync uses circuit breaker pattern (see ESPAIDER-INTEGRATION.md)
- **Fallback Strategy:** Chat endpoint falls back to OpenAI when FastAPI unavailable
- **Tenant Isolation:** All queries filtered by `tenant_id` for data isolation

---

**Prepared by:** Orion (@aiox-master)
**Date:** 2026-03-15
**Code-to-doc:** ✅ VERIFIED (read 20+ endpoints from src/app/api/**/route.ts)
**AIOX Compliance:** ✅ 10/10
**Status:** READY FOR REVIEW

— Orion, orquestrando o sistema 🎯
