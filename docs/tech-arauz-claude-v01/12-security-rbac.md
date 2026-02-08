---
doc-id: CLAUDE-V01-12
title: Segurança, RBAC e Auditoria
scope: Auth flow, roles, RLS, gestão de segredos, auditoria
version: 0.1.0
status: draft
last-updated: 2026-02-05
confidence: Alta
depends-on: [04-database-schema, 03-architecture]
---

# Segurança, RBAC e Auditoria

> Fontes: `[ref: src/contexts/AuthContext.tsx]`, `[ref: supabase/migrations/*.sql]` (políticas RLS)

Relacionado: [[04-database-schema]] (tabelas e views), [[03-architecture]] (stack), [[06-feature-map]] (módulos com acesso restrito)

---

## Fluxo de Autenticação

### Login
```
1. Usuário acessa /auth
2. Digita email ou username
   ├── Se contém '@': usa como email
   └── Se não contém '@': appenda '@arauz.com.br'
3. AuthContext.signIn → supabase.auth.signInWithPassword(email, password)
4. Sucesso: session + user armazenados no React Context
5. onAuthStateChange listener monitora mudanças (logout, expiração)
6. ProtectedRoute verifica session antes de renderizar
```

[ref: src/contexts/AuthContext.tsx]

### Sessão
- **Gerenciada por**: Supabase Auth (JWT)
- **Persistência**: Local storage (auto-refresh)
- **Expiração**: Conforme configuração do Supabase (default: 1h com refresh)

---

## Regras de Negócio de Permissões

> O QUE cada perfil pode fazer (regra de negócio). A implementação técnica (RLS, policies) está na seção seguinte.

| Perfil | Permissões |
| --- | --- |
| **Admin** | Configurar APIs e integrações; ativar/desativar syncs; executar sync manual; ver logs completos (com detalhes de erro); gerenciar usuários e roles; CRUD em tabelas auxiliares (status, tipos, prioridades); acesso a todas as views e dashboards |
| **User** | Visualizar dashboards (Geral, Gestão, Tecnologia); filtrar e navegar solicitações e projetos; visualizar detalhes (entregas, cronogramas, requisitos); criar e editar documentações; ver logs sanitizados (sem detalhes sensíveis) |
| **Viewer** | Apenas visualizar dashboards e dados não-sensíveis (somente leitura); sem acesso a configurações, logs ou edição |

---

## Modelo RBAC (Implementação)

### Roles

| Role | Descrição | Nível |
| --- | --- | --- |
| **admin** | Acesso total: CRUD em todas as tabelas, views sensíveis, configuração | Máximo |
| **user** | Leitura + operações básicas (visualizar, filtrar, navegar) | Médio |
| **viewer** | Somente leitura de dashboards e dados não-sensíveis | Mínimo |

**Enum**: `app_role = "admin" | "user" | "viewer"` [ref: src/integrations/supabase/types.ts:1169]

### Função has_role()

```sql
CREATE FUNCTION has_role(_user_id UUID, _role app_role) RETURNS BOOLEAN
-- Verifica se o usuário possui o papel especificado na tabela user_roles
```

Usada em todas as políticas RLS para verificar permissões.

---

## Políticas RLS por Tabela

### POL-001: Acesso Geral (Padrão)

| Tabela | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| projetos | Authenticated | Admin/Service | Admin/Service | Admin/Service |
| solicitacoes | Authenticated | Admin/Service | Admin/Service | Admin/Service |
| entregas_projeto | Authenticated | Admin/Service | Admin/Service | Admin/Service |
| cronogramas_projeto | Authenticated | Admin/Service | Admin/Service | Admin/Service |
| requisitos_projeto | Authenticated | Admin/Service | Admin/Service | Admin/Service |
| entregas | Authenticated | Admin/Service | Admin/Service | Admin/Service |
| cronogramas | Authenticated | Admin/Service | Admin/Service | Admin/Service |
| requisitos | Authenticated | Admin/Service | Admin/Service | Admin/Service |
| anexos | Authenticated | Admin/Service | Admin/Service | Admin/Service |
| interacoes | Authenticated | Admin/Service | Admin/Service | Admin/Service |

### POL-002: Tabelas de Lookup

| Tabela | SELECT | Modificação |
|---|---|---|
| status | Authenticated | Admin/Service |
| prioridades | Authenticated | Admin/Service |
| tipos | Authenticated | Admin/Service |
| categorias | Authenticated | Admin/Service |
| areas | Authenticated | Admin/Service |
| etapas_kanban | Authenticated | Admin/Service |
| projetos_status | Authenticated | Admin/Service |
| projetos_etapas_kanban | Authenticated | Admin/Service |

### POL-003: Tabelas Sensíveis

| Tabela | SELECT | Modificação | Nota |
|---|---|---|---|
| apis | Admin/Service | Admin/Service | Contém tokens em plaintext |
| apis_safe (view) | Authenticated | — | Token mascarado |
| espaider_field_mapping | Authenticated | Admin/Service | — |
| tarefas_sincronizacao | Authenticated | Admin/Service | — |
| logs_execucao | Admin/Service | Admin/Service | Contém detalhes sensíveis |
| logs_execucao_safe (view) | Authenticated | — | Sem detalhes/mensagem_erro |
| user_roles | Admin/Service | Admin/Service | — |
| profiles | Authenticated (próprio) | Authenticated (próprio) | — |

---

## Views de Segurança

### apis_safe
- **Propósito**: Mascarar token de autenticação
- **Transformação**: `token` → `token_masked` = `substring(token, 1, 4) || '****'`
- **Uso**: Frontend lista APIs via esta view
- **Acesso**: Qualquer usuário autenticado

### logs_execucao_safe
- **Propósito**: Esconder dados técnicos sensíveis
- **Transformação**: `detalhes` → NULL, `mensagem_erro` → NULL
- **Uso**: Usuários não-admin veem esta view
- **Acesso**: Qualquer usuário autenticado

---

## Gestão de Segredos

| Segredo | Localização | Acesso | Proteção |
|---|---|---|---|
| Tokens de API (Espaider) | `apis.token` (PostgreSQL) | Edge Functions (service role) | Mascarado via apis_safe para frontend |
| Supabase anon key | `.env` / `VITE_SUPABASE_PUBLISHABLE_KEY` | Frontend (público) | Chave pública, segurança via RLS |
| Supabase service role key | Edge Functions (env runtime) | Apenas server-side | Nunca exposto ao frontend |

> [!warning] Segredo em plaintext
> POL-003 identifica que `apis.token` é armazenado em texto plano no PostgreSQL. Mitigação atual: RLS restringe acesso à tabela `apis` para admin/service role. Melhoria: considerar pgcrypto ou Vault.

---

## Sanitização de URLs em Logs

A Edge Function `sync-espaider` sanitiza URLs nos logs para não expor tokens:

```
URL original: https://api.espaider.com/endpoint?Token=abc123xyz
URL logada:   https://api.espaider.com/endpoint?Token=***
```

[ref: supabase/functions/sync-espaider/index.ts]

---

## Circuit Breaker

```sql
CREATE FUNCTION is_circuit_open(p_tarefa_id UUID, p_threshold INTEGER DEFAULT 5) RETURNS BOOLEAN
```

- **Propósito**: Prevenir chamadas repetidas a APIs que estão falhando
- **Lógica**: Verifica se as últimas N execuções (threshold) da tarefa foram todas erro
- **Uso**: Verificação antes de iniciar nova sync
- **Threshold padrão**: 5 falhas consecutivas

---

## Auditoria

### Implementado
- `logs_execucao`: Registra cada execução de sync com métricas completas
- `logs`: Log geral com tipo, mensagem, detalhes JSON, usuario_id
- `created_at` / `updated_at` em todas as tabelas (trigger automático)

### Não implementado
- Histórico de mudanças em projetos/solicitações (audit trail)
- Log de login/logout
- Log de alterações em configurações (APIs, tabelas aux.)

---

## Decisões Pendentes

> [!question] Q-SEC-001: Audit trail formal
> Não há registro de quem alterou o quê e quando (além de created_at/updated_at). Implementar tabela de audit_log com trigger genérico? Ver [[11-domain-entities-events]] Q-ENT-002.

> [!question] Q-SEC-002: Criptografia de tokens
> `apis.token` em plaintext é um risco. Opções:
> 1. pgcrypto: encrypt/decrypt no PostgreSQL
> 2. Supabase Vault: secret management nativo
> 3. Edge Function como proxy: token nunca sai do edge

> [!question] Q-SEC-003: RLS coverage audit
> Verificar que TODAS as tabelas têm políticas RLS ativas. O script `scripts/audit-rls.ts` existe mas precisa ser executado. [ref: scripts/audit-rls.ts]

> [!question] Q-SEC-004: Política de senhas
> Não há política definida para senhas (comprimento mínimo, complexidade). Supabase Auth tem configurações para isso — ativar?
