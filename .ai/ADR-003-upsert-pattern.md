# ADR-003: UPSERT via Composite UNIQUE

**Status**: Accepted
**Date**: 2026-02-10
**Decision Makers**: Gabriel Cristofolini (CTO)

## Context

A sincronização Espaider → Supabase precisa ser idempotente (executar múltiplas vezes sem duplicar dados).

## Decision

Todas as tabelas sincronizadas do Espaider DEVEM ter:
- `UNIQUE(tenant_id, espaider_id)` como constraint
- UPSERT via `onConflict('tenant_id, espaider_id')` no Supabase client
- Campo `espaider_raw JSONB` para rastreabilidade do dado original

## Consequences

- Sync é idempotente: pode rodar quantas vezes quiser sem duplicatas
- Cada registro mantém vínculo com a fonte original via `espaider_id`
- O campo `espaider_raw` permite debug e auditoria
