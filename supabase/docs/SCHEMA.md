# Database Schema - Tech Arauz

## Tabelas Core (12)

### Principais
- **tenants** - Araúz único
- **profiles** - Users (admin/user/viewer)
- **projects** - 30+ fields
- **project_schedules** - 18 fields
- **project_deliveries** - 6 fields
- **project_requirements** - 8 fields

### Operacionais
- **project_histories** - 5,745 registros
- **project_approvers** - 329 registros
- **project_budgets** - 200+ registros

### Integração
- **espaider_apis** - 1 por tenant
- **sync_logs** - Histórico
- **integration_log_entries** - 664+ registros

## Padrão

```sql
id UUID PRIMARY KEY
tenant_id UUID NOT NULL FK
espaider_id INTEGER (upsert key)
UNIQUE(tenant_id, espaider_id)
RLS ENABLED
```

## Índices: 29

- 10 tenant isolation
- 12 performance
- 7 relacionamento

## RLS Audit: 12/12 PASS ✅

## Migrations: 27

- Todas aplicadas
- 3 rollbacks bem-sucedidos

## Débitos Críticos

| Severidade | Débito | Impacto |
|-----------|--------|---------|
| CRITICAL | Token plaintext | Data leakage |
| MEDIUM | Sem audit trail | Rastreabilidade |
| MEDIUM | Sem rate limiting | Abuse |

## Dados (2026-02-23)

- projects: 15-50
- histories: 5,745
- approvers: 329
- log_entries: 664+

## Segurança: 8.5/10 🟢

- RLS: 100%
- Tenant isolation: 100%
- Constraints: 95%
- Secrets: 30% ⚠️
- Encryption: 0% ⚠️
