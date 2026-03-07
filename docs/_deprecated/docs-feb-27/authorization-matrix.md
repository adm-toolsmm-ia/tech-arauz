# Authorization Matrix (DB x API)

**Data:** 2026-02-26
**Status:** Archived — Integrated into system-architecture.md (AIOX Phase 1)
**Última atualização:** 2026-03-07
**Escopo:** Story 1.1 - Hardening RLS and Secrets

## 1. Princípios

- Autenticacao obrigatoria para APIs internas.
- Autorizacao por role na camada de API (`admin`, `user`, `viewer`).
- Isolamento de tenant no banco via `tenant_id` + RLS.
- Operacoes de sincronizacao usam service role controlada no backend.

## 2. Matriz de API (camada Next.js/FastAPI)

| Endpoint | Metodo | Auth | Role | Isolamento | Observacoes |
| --- | --- | --- | --- | --- | --- |
| `/api/integracoes` | GET | Obrigatoria | `admin`, `user` | `tenant_id` via `profiles` | Lista APIs sem expor `token`. |
| `/api/integracoes` | POST/PUT/DELETE | Obrigatoria | `admin` | `tenant_id` via `profiles` | Token de integracao salvo criptografado. |
| `/api/integracoes/sync` | POST | Obrigatoria | `admin` | `tenant_id` do perfil | Dispara sync via service client. |
| `/api/integracoes/logs` | GET | Obrigatoria | `admin`, `user` | `tenant_id` | Leitura de logs operacionais do tenant. |
| `/api/agents` | GET/POST | Obrigatoria | `admin`, `user` (`viewer` bloqueado) | JWT do usuario repassado | Proxy para FastAPI `/api/agents/v2`. |
| `AI /api/traces` | GET | Obrigatoria | JWT valido | `tenant_id` no JWT | Guard de JWT aplicado. |
| `AI /api/traces/{id}` | GET | Obrigatoria | JWT valido | `tenant_id` no JWT | Guard de JWT aplicado. |
| `AI /api/budget` | GET | Obrigatoria | JWT valido | `user_id` do JWT | Nao permite consultar budget de outro usuario. |
| `AI /api/agents/v2/*` | GET/POST/PATCH/DELETE | Obrigatoria | JWT valido | `tenant_id` no JWT | CRUD de agentes por tenant. |

## 3. Matriz de Banco (RLS)

| Tabela | RLS | Isolamento principal |
| --- | --- | --- |
| `projects` e filhas (`project_*`) | Habilitado | `tenant_id = get_user_tenant_id()` |
| `espaider_apis` | Habilitado | `tenant_id = get_user_tenant_id()` |
| `sync_logs` | Habilitado | `tenant_id = get_user_tenant_id()` |
| `integration_log_entries` | Habilitado | `tenant_id = get_user_tenant_id()` |
| `agents`, `agent_*`, `agent_types`, `agent_templates` | Habilitado | `tenant_id = get_user_tenant_id()` |
| `lm_providers`, `lm_models` | Habilitado | `tenant_id = get_user_tenant_id()` |

## 4. Gates de compliance

- CI executa `audit:rls` e falha em status `CRITICAL` na view `public.rls_audit_summary`.
- Segredos obrigatorios:
  - `SUPABASE_JWT_SECRET` (AI service startup)
  - `INTEGRATION_TOKEN_SECRET` (criptografia de tokens de integracao)

