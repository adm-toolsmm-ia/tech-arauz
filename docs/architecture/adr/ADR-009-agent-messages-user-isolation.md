# ADR-009: Isolamento por Usuário em agent_messages

**Status:** Aceito  
**Data:** 2026-03-01  
**Contexto:** Correção de Gaps Críticos — Governança Corporativa 10/10

## Decisão

A tabela `agent_messages` utiliza política RLS restritiva por usuário, em exceção ao ADR-001.

**Policy:** `agent_messages_user_session_isolation`

- **USING:** `EXISTS (SELECT 1 FROM agent_sessions s WHERE s.id = agent_messages.session_id AND s.user_id = auth.uid())`
- **WITH CHECK:** mesma condição

## Contexto

O ADR-001 define RLS permissivo (`USING (true) WITH CHECK (true)`) com isolamento por tenant na camada de aplicação. Para `agent_messages`, mensagens de chat são dados sensíveis — um usuário não deve acessar mensagens de outro usuário dentro do mesmo tenant.

## Consequências

- Usuário só lê/escreve mensagens de sessões onde `agent_sessions.user_id = auth.uid()`
- `service_role` continua com bypass RLS (inserts do chat via Python funcionam)
- Sessões com `user_id` NULL ficam inacessíveis para usuários autenticados (validar fluxos antes de aplicar)

## Referências

- Migration 048: `supabase/migrations/048_correction_governance_gaps.sql`
- ADR-001: RLS padrão multi-tenant
