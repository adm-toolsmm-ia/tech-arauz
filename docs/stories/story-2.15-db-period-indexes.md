# Story 2.15 — Índices de Período + Status Mapping

Story ID: 2.15
Epic: PRD-UX-2026
Sprint: 1 — Fundação
Agente: @dev + @data-engineer
Esforço: 8h (4h índices + 4h mapping)
Prioridade: Alta (bloqueante para Sprint 2)
Gaps resolvidos: DB-06, DB-07

## Como desenvolvedor

Preciso que o banco tenha índices adequados para queries de período e que o mapeamento de status esteja documentado, para que as views de Kanban e Tabela de Cronogramas no Sprint 2 tenham performance e dados corretos.

## Critérios de aceite

### Migration de índices

- [ ] Migration criada com os seguintes índices:
  ```sql
  CREATE INDEX idx_schedules_data_inicio ON project_schedules (data_inicio);
  CREATE INDEX idx_schedules_data_fim ON project_schedules (data_fim);
  CREATE INDEX idx_schedules_status ON project_schedules (status);
  CREATE INDEX idx_schedules_tenant_dates ON project_schedules (tenant_id, data_inicio, data_fim);
  ```
- [ ] Migration roda sem erros em ambiente de dev
- [ ] `audit_all_rls_policies()` confirmada OK após migration
- [ ] Sem regressão de RLS

### Status mapping

- [ ] Query executada no banco: `SELECT DISTINCT status, COUNT(*) FROM project_schedules GROUP BY status ORDER BY 2 DESC`
- [ ] Resultado documentado em `docs/architecture/status-mapping.md`
- [ ] Mapeamento definido em `src/lib/domain/schedule-status.ts`:

| Coluna Kanban | Critério                                                                     |
| ------------- | ---------------------------------------------------------------------------- |
| Pendente      | `status NOT IN ('em_execucao','concluído','cancelado') AND atrasado = false` |
| Em Execução   | `status = 'em_execucao'` (ou valor real do ERP)                              |
| Atrasada      | `atrasado = true`                                                            |
| Concluída     | `status = 'concluído'` (oculta por padrão)                                   |

- [ ] `COMMENT ON COLUMN project_schedules.status` adicionado na migration documentando valores
- [ ] Fallback visual para valores de status não mapeados (badge cinza "Outro")

## Implementação

### Novo arquivo: `supabase/migrations/039_add_schedule_indexes_and_comments.sql`

### Arquivo modificado: `src/lib/domain/schedule-status.ts`

- Adicionar constante `SCHEDULE_STATUS_MAP` com mapeamento
- Adicionar função `getKanbanColumn(status: string, atrasado: boolean): string`
- Exportar tipos `ScheduleKanbanColumn`

### Novo arquivo: `docs/architecture/status-mapping.md`

### Testes

- [ ] Unit: `getKanbanColumn()` retorna coluna correta para cada status
- [ ] Unit: fallback para status desconhecido
- [ ] SQL: migration executa sem erros
- [ ] SQL: RLS audit pass após migration

## Dependências

- Nenhuma (pode começar imediatamente, paralelo com Stories 2.13 e 2.14)
- **BLOQUEIA:** Stories 2.17 (Kanban), 2.18 (Tabela), 2.19 (filtros)

## Definition of Done

- [ ] AC validados
- [ ] Índices criados
- [ ] Status mapping documentado e implementado
- [ ] RLS audit pass
- [ ] Code review aprovado
