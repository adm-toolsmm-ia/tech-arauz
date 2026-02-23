# Módulo de Integrações — Componentes

## Arquitetura

```
page.tsx (server) → IntegracoesContent (client)
                     ├─ APIManager   → GET /api/integracoes
                     │                 POST /api/integracoes/sync
                     └─ LogViewer    → GET /api/integracoes/logs
                                      GET /api/integracoes/logs/summary
```

## Componentes

### `APIManager`

Exibe cards das APIs Espaider cadastradas.

| Prop             | Tipo                         | Descrição                     |
| ---------------- | ---------------------------- | ----------------------------- |
| `onViewLogs`     | `(dataset?: string) => void` | Callback ao clicar "Ver Logs" |
| `onSyncComplete` | `() => void`                 | Callback após sync concluída  |

**Features:** Last sync timestamp relativo, status com ícone, feedback inline (sem alert), botão sincronizar tudo.

### `LogViewer`

Exibe logs de sincronização com filtros, busca e paginação.

| Prop            | Tipo      | Descrição                          |
| --------------- | --------- | ---------------------------------- |
| `datasetFilter` | `string?` | Filtro pré-selecionado por dataset |

**Features:**

- Filtros: Nível, Dataset, Data Início/Fim, Busca textual (debounce 400ms)
- Paginação numérica (1 2 ... N)
- Erros contextuais (401 → login, 403 → permissão, 500 → servidor)
- Badges com contadores de erros/avisos
- Tabs: Logs Detalhados | Resumo por Execução
- Linhas expansíveis para detalhes JSON

## API Routes

| Rota                            | Método          | Auth       | Descrição                    |
| ------------------------------- | --------------- | ---------- | ---------------------------- |
| `/api/integracoes`              | GET             | admin/user | Lista APIs do tenant         |
| `/api/integracoes`              | POST/PUT/DELETE | admin      | CRUD de APIs                 |
| `/api/integracoes/logs`         | GET             | admin/user | Logs com filtros e paginação |
| `/api/integracoes/logs/summary` | GET             | admin/user | Resumo de execuções          |
| `/api/integracoes/sync`         | POST            | admin      | Trigger sync completa        |

## RLS (Row Level Security)

Migration `025_consolidate_integration_rls.sql`:

- `integration_logs_tenant_select` → SELECT com tenant isolation
- `integration_logs_service_all` → ALL para service role (sync)
- `sync_logs_tenant_select` → SELECT com tenant isolation
- `sync_logs_service_all` → ALL para service role

> **Importante:** RLS NÃO verifica role. Verificação de role é feita nas API routes.
