# ADR-001: RLS em Todas as Tabelas

**Status**: Accepted
**Date**: 2026-02-08
**Decision Makers**: Gabriel Cristofolini (CTO)

## Context

O Portal Tech Arauz é preparado para multi-tenant (tenant `arauz` como single-tenant inicial). Todas as tabelas precisam de isolamento por tenant.

## Decision

SEMPRE definir RLS policies em todas as tabelas com:
- `USING (true)` para leitura
- `WITH CHECK (true)` para escrita
- Funções helper `get_user_tenant_id()` e `get_user_role()`
- Policies `FOR ALL` com ambas as cláusulas

## Consequences

- Segurança: isolamento de dados por tenant garantido no nível do banco
- Todas as migrations DEVEM incluir RLS policies
- Falha em incluir `WITH CHECK` causa erro silencioso em INSERT/UPDATE (aprendido em migration 007)
