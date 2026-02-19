# ADR-004: UUID PK + espaider_id INTEGER

**Status**: Accepted
**Date**: 2026-02-13
**Decision Makers**: Gabriel Cristofolini (CTO)

## Context

As migrations 016-018 criaram tabelas `histories`, `approvers` e `budgets` com `id BIGSERIAL` como PK, inconsistente com as outras 6 tabelas do projeto que usam `UUID`.

## Decision

Todas as tabelas DEVEM seguir o padrão:
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id UUID NOT NULL REFERENCES tenants(id),
espaider_id INTEGER NOT NULL,
-- ... campos específicos
UNIQUE(tenant_id, espaider_id)
```

## Consequences

- Schema consistente (UUID PK em todas as tabelas)
- Migrations 016-018 foram revertidas e substituídas por 019 (rollback + schema correto)
- O padrão de sync functions segue EXATAMENTE o de `syncDeliveriesFromRegistros()` (que funciona)
