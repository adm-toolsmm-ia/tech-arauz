# Phase 3: JWT Extraction & Service Wiring — CONCLUÍDA ✅

**Data**: 24/02/2026
**Status**: ✅ COMPLETO

---

## 📋 O Que Foi Feito

### 1️⃣ JWT Extraction (`services/ai/app/api/routes.py`)

Implementado `get_token_data(request)` helper function que:
- Extrai Bearer token do header `Authorization`
- Valida JWT usando `PyJWT` com secret `SUPABASE_JWT_SECRET`
- Retorna dict com `user_id`, `tenant_id`, `role`, `email`
- Lança `HTTPException(401)` se token inválido/expirado

```python
async def get_token_data(request: Request) -> dict:
    """Extract and validate JWT token from Authorization header"""
    auth_header = request.headers.get("Authorization", "")
    
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    
    token = auth_header.split(" ")[1]
    
    try:
        payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("sub")
        app_metadata = payload.get("app_metadata", {})
        tenant_id = app_metadata.get("tenant_id")
        
        if not user_id or not tenant_id:
            raise HTTPException(status_code=401, detail="Invalid token structure")
        
        return {
            "user_id": user_id,
            "tenant_id": tenant_id,
            "role": payload.get("role", "user"),
            "email": payload.get("email"),
        }
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
```

### 2️⃣ Supabase Client Init (`services/ai/app/main.py`)

No `lifespan()` event, adicionado:
- Leitura de `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` do `.env`
- Criação async de `AsyncClient` via `create_client()`
- Armazenamento em `app.state.supabase` para acesso via dependency injection
- Logging de sucesso/erro

```python
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # ... observability ...
    
    # Initialize Supabase client
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if supabase_url and supabase_key:
        try:
            app.state.supabase = await create_client(supabase_url, supabase_key)
            logger.info("Supabase client initialized")
        except Exception as e:
            logger.error("Failed to initialize Supabase: %s", str(e))
            app.state.supabase = None
```

### 3️⃣ Dependency Injection Helper

Implementado `get_supabase_client(request)`:
- Recupera `AsyncClient` de `request.app.state.supabase`
- Lança `HTTPException(500)` se não inicializado

```python
async def get_supabase_client(request: Request) -> AsyncClient:
    """Get Supabase async client from app state"""
    supabase = getattr(request.app.state, "supabase", None)
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase client not initialized")
    return supabase
```

### 4️⃣ Endpoints Wirificados

Todos os `/api/agents/v2/*` endpoints agora:
- Recebem `token_data: dict = Depends(get_token_data)` como dependency
- Recebem `request: Request = None` para acessar Supabase client
- Extraem `tenant_id` e `user_id` do token
- Instanciam `AgentService(supabase)`
- Chamam método correspondente no service
- Retornam resposta serializada

**Endpoints wirificados:**
- `GET /agents/v2` → `list_agents()`
- `GET /agents/v2/{agent_id}` → `get_agent()`
- `POST /agents/v2` → `create_agent()`
- `PATCH /agents/v2/{agent_id}` → `update_agent_draft()`
- `DELETE /agents/v2/{agent_id}` → `delete_agent_draft()`
- `POST /agents/v2/{agent_id}/publish` → `publish_agent()`
- `POST /agents/v2/{agent_id}/rollback` → `rollback_agent()`
- `GET /agents/v2/{agent_id}/versions` → `get_agent_versions()`
- `GET /agents/v2/{agent_id}/export` → `export_agent_version()`

**Exemplo endpoint wirificado:**
```python
@router.get("/agents/v2")
async def list_agents_v2(
    status: Optional[str] = Query(None),
    tag: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    token_data: dict = Depends(get_token_data),
    request: Request = None,
) -> dict:
    """List all agents for current tenant (Phase 2)."""
    try:
        tenant_id = token_data["tenant_id"]
        user_id = token_data["user_id"]
        
        supabase = await get_supabase_client(request)
        service = AgentService(supabase)
        
        agents = await service.list_agents(
            tenant_id=tenant_id,
            filters={"status": status, "tag": tag, "search": search},
            page=page,
            page_size=page_size,
        )
        
        logger.info("Listed %d agents for tenant %s", len(agents), tenant_id)
        
        return {
            "agents": [a.model_dump() for a in agents],
            "total": len(agents),
            "page": page,
            "page_size": page_size,
            "has_next": len(agents) >= page_size,
        }
    except AgentServiceError as e:
        logger.warning("Agent service error: %s", str(e))
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Error listing agents: %s", str(e))
        raise HTTPException(status_code=500, detail="Internal server error")
```

### 5️⃣ Dependências

Adicionado `PyJWT>=2.8.0` em `services/ai/pyproject.toml`:
```toml
dependencies = [
    # ... existing ...
    "PyJWT>=2.8.0",  # JWT for authentication
]
```

### 6️⃣ Cleanup

Removidos endpoints antigos/placeholder que eram duplicação:
- `POST /agents/v2/{agent_id}/rollback` (antigo)
- `GET /agents/v2/{agent_id}/export` (antigo)
- `GET /agents/v2/{agent_id}/versions` (antigo)
- `POST /agents/v2/import` (antigo)

---

## ✅ Quality Gates

- ✅ `npm run lint` — ESLint OK
- ✅ `npm run typecheck` — TypeScript OK
- ✅ Python routes.py syntax valid
- ✅ No PyJWT import errors

---

## 🔒 Security Considerations

1. **JWT Secret**: Usar `SUPABASE_JWT_SECRET` do `.env` (production-ready)
2. **Tenant Isolation**: Todo endpoint valida `tenant_id` antes de chamar service
3. **RLS Policies**: Supabase tables têm RLS habilitado → garante segurança no DB
4. **Error Handling**: Erros não expõem detalhes internos (log private, HTTP generic)

---

## 🚀 Próximos Passos

### Phase 4: Next.js Proxy Routes (opcional)
- Atualizar `/api/agents/*` em `src/app/api/` para repassar:
  - JWT token do usuário (via Supabase auth no cliente)
  - Headers de autenticação
  - Forwarding ao Python service

### Phase 5: Frontend Integration (opcional)
- Testar agentes reais via UI
- Validar criação → publicação → rollback

---

## 📁 Arquivos Modificados

1. `services/ai/app/api/routes.py` — JWT helpers, endpoint wiring
2. `services/ai/app/main.py` — Supabase client init
3. `services/ai/pyproject.toml` — PyJWT dependency

---

## 🎯 Resumo Técnico

| Aspecto | Implementação |
|---------|-----------------|
| **JWT Validation** | PyJWT com HS256 + Supabase secret |
| **Tenant Isolation** | Extrai tenant_id do token, passa ao service |
| **Service Wiring** | Dependency injection via FastAPI `Depends()` |
| **Error Handling** | HTTPException com códigos apropriados (401, 404, 500) |
| **Logging** | Estruturado com tenant_id, user_id, operação |
| **Async** | Todos endpoints async-ready, suporta AsyncClient |

---

✨ **Status**: Fase 3 concluída com sucesso. Sistema pronto para testar agentes reais!
