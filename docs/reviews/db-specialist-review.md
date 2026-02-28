# Database Specialist Review — PRD UX/UI 2026

Data: 2026-02-28
Agente: @data-engineer
Base analisada: `docs/prd/technical-debt-DRAFT.md`, `supabase/docs/SCHEMA.md`, `supabase/docs/DB-AUDIT.md`, migrations 001-038
PRD: Padronização UX/UI + Cronogramas Read-Only + Tecnologia & IA

---

## Gate da revisão DB

**Status: APPROVED WITH CHANGES**

---

## 1. Débitos validados (seção 6 do DRAFT)

| ID    | Débito                                                         | Severidade            | Horas | Prioridade         | Notas                                                                                    |
| ----- | -------------------------------------------------------------- | --------------------- | ----: | ------------------ | ---------------------------------------------------------------------------------------- |
| DB-01 | Histórico de regressão RLS em child tables (ciclo 016→027)     | Crítica               |    20 | Crítica            | Já remediado, mas frágil. Precisa de teste de regressão automatizado no CI               |
| DB-02 | Token sensível em `espaider_apis.token`                        | Alta                  |    12 | Alta               | Migrar para secret manager (Supabase Vault ou env var) + mascarar em logs                |
| DB-03 | Tenant hardcoded em seeds/código                               | Alta                  |    10 | Alta               | Substituir por lookup dinâmico; isolar seeds por ambiente                                |
| DB-04 | Auth dividida entre DB e app sem matriz                        | Alta                  |     8 | Alta               | Documentar matriz de autorização (DB RLS x API route); testar por role                   |
| DB-05 | Campos PRD ausentes (`prioridade`, `progresso`, `etiquetas[]`) | Bloqueante            |     0 | Decisão de produto | **Confirmado: NÃO existem na API Espaider.** Ver resposta 1                              |
| DB-06 | Sem índice em `project_schedules(data_inicio, data_fim)`       | Alta                  |     4 | Alta               | **Confirmado: CRÍTICO para paginação.** Ver resposta 3                                   |
| DB-07 | Status mapping (API → UI) não documentado                      | Alta                  |     4 | Alta               | `status` é TEXT livre sem enum. Ver resposta 2                                           |
| DB-08 | `updated_at` pode não ser atualizado pelo sync                 | Média → **Resolvido** |     0 | —                  | **Confirmado: É atualizado.** Trigger `handle_updated_at()` aplicado em todas as tabelas |

### Ajuste de severidade

- **DB-08**: Rebaixar de "Médio" para **RESOLVIDO**. O trigger existe e funciona. `updated_at` é confiável para "Atualizado às".

---

## 2. Débitos adicionados

| ID    | Débito                                                                        | Severidade | Horas | Prioridade | Justificativa                                                                             |
| ----- | ----------------------------------------------------------------------------- | ---------- | ----: | ---------- | ----------------------------------------------------------------------------------------- |
| DB-09 | Sem política de retenção para `integration_log_entries` e `sync_logs`         | Média      |    12 | Média      | Tabelas crescem indefinidamente. Definir TTL e estratégia de arquivamento                 |
| DB-10 | Sem baseline de restore/recovery drill                                        | Alta       |    14 | Alta       | Fundamental para continuidade de negócio antes de escalar                                 |
| DB-11 | Migrations com sobreposição de objetivos (sem snapshot consolidado)           | Média      |     8 | Média      | 38 migrations com ciclos de fix/rollback tornam onboarding custoso                        |
| DB-12 | Campos de domínio sem constraints (`status`, `fase_atividade`, campos livres) | Média      |    16 | Média      | Introduzir `COMMENT ON COLUMN` documentando valores conhecidos; CHECK constraints gradual |

---

## 3. Respostas ao @architect

### Resposta 1 — Campos ausentes (DP-01)

**Confirmação definitiva após análise do mapper.ts:**

| Campo PRD              | Existe no Espaider?                                             | Existe no schema? | Veredicto                                    |
| ---------------------- | --------------------------------------------------------------- | ----------------- | -------------------------------------------- |
| `prioridade`           | ❌ NÃO para cronogramas (só para Projetos, Entregas, Requisitos) | ❌                 | **Impossível sem dados**                     |
| `progresso_percentual` | ❌ NÃO existe em nenhum dataset                                  | ❌                 | **Impossível sem dados**                     |
| `etiquetas[]`          | ❌ NÃO existe                                                    | ❌                 | Seria feature local (conflita com read-only) |

**Recomendação:** Opção A (Omitir) com ajustes:
- Remover colunas "Prioridade", "Progresso" e "Etiquetas" do PRD para Cronogramas
- Usar `atrasado` (boolean) como indicador de urgência no card
- Usar `fase_atividade` como substituto visual de prioridade (exibir como badge)
- Tabela de Cronogramas: ajustar de 9 para **7 colunas**: Nome | Projeto | Status | Início | Fim | Responsável | Fase

### Resposta 2 — Status mapping para Kanban (DP-03)

`project_schedules.status` é **TEXT livre**. Não há enum nem CHECK constraint.

**Valores conhecidos** (inferidos do domínio em `schedule-status.ts`):
- `"cancelado"` e `"concluído"` → tratados como inativos
- Todos os outros → tratados como ativos

**Para colunas do Kanban, recomendo:**

| Coluna Kanban | Critério                                                                     | Fonte                      |
| ------------- | ---------------------------------------------------------------------------- | -------------------------- |
| Pendente      | `status NOT IN ('em_execucao','concluído','cancelado') AND atrasado = false` | status + atrasado          |
| Em Execução   | `status = 'em_execucao'` (ou equivalente do ERP)                             | status                     |
| Atrasada      | `atrasado = true`                                                            | boolean direto             |
| Concluída     | `status = 'concluído'`                                                       | status (oculta por padrão) |

**Ação necessária:**
1. Executar query no banco real: `SELECT DISTINCT status, COUNT(*) FROM project_schedules GROUP BY status ORDER BY 2 DESC`
2. Documentar valores em `COMMENT ON COLUMN`
3. Criar mapping definitivo em `schedule-status.ts`

### Resposta 3 — Índices para paginação

**Confirmado: NÃO existem índices em `data_inicio` nem `data_fim`.**

Migration recomendada:
```sql
-- Índices para queries de período (interseção)
CREATE INDEX idx_schedules_data_inicio ON project_schedules (data_inicio);
CREATE INDEX idx_schedules_data_fim ON project_schedules (data_fim);
CREATE INDEX idx_schedules_status ON project_schedules (status);

-- Composite para queries com filtro de tenant + período
CREATE INDEX idx_schedules_tenant_dates ON project_schedules (tenant_id, data_inicio, data_fim);
```

**Prioridade:** Antes de implementar paginação server-side. Sem estes índices, queries de interseção farão full table scan.

### Resposta 4 — Timestamp "Atualizado às"

**Confirmado: `updated_at` é confiável.**

Trigger `handle_updated_at()` (migration 001) dispara em toda operação UPDATE, incluindo sync do Espaider. Semântica: "última vez que este registro foi atualizado no banco local" (= última sync).

**Para o banner, usar duas fontes:**
- **Banner global**: `sync_logs.completed_at` → "Última sincronização: {timestamp}"
- **Por registro**: `{tabela}.updated_at` → "Atualizado às {timestamp}"

### Resposta 5 — RLS: tabelas que precisam de auditoria

Tabelas que devem ser validadas continuamente antes de mexer no schema:
- `project_histories` (histórico de ciclos de fix nas migrations 018/019/027)
- `project_approvers`
- `project_budgets`
- `integration_log_entries` (redesign de RLS nas migrations 023-025)
- `sync_logs`
- `agents` (criação recente, migration 028+)

**Recomendação:** Incluir `audit_all_rls_policies()` no CI como teste obrigatório pré-merge.

### Resposta 6 — Token `espaider_apis.token`

**Recomendação escalonada:**

1. **Curto prazo (Sprint 1):** Mover token para variável de ambiente (`ESPAIDER_API_TOKEN`). Manter coluna no banco mas mascarar valor em queries (RETURNING apenas `'***'`).
2. **Médio prazo:** Usar Supabase Vault (se disponível) ou secret manager da Vercel.
3. **Em qualquer caso:** Adicionar mascaramento em logs (`integration_log_entries` não deve registrar token).

### Resposta 7 — Schema placeholder para telemetria de agentes

A tabela `agent_runs` **já existe** (migration 028+) com campos:
- `input_data JSONB`
- `output_data JSONB`
- `tokens_used INTEGER`
- `cost_usd NUMERIC`
- `duration_ms INTEGER`
- `status TEXT`

**Veredicto:** Schema de telemetria já tem placeholder funcional. Para o PRD, apenas garantir que a UI de Agentes AI exiba esses dados no card (Nome, Tipo, Modelo, Fornecedor, Status, **Último run**, Owner).

---

## 4. Recomendações (ordem de execução DB)

1. **Sprint 1 — Segurança:** DB-01 (RLS CI) + DB-02 (token) + DB-03 (tenant hardcode)
2. **Sprint 1 — PRD:** DB-06 (índices de período) + DB-07 (status mapping) + DP-01 (decisão de campos)
3. **Sprint 2 — Qualidade:** DB-04 (matriz auth) + DB-10 (restore drill)
4. **Sprint 3 — Governança:** DB-09 (retenção logs) + DB-11 (migrations) + DB-12 (constraints)

---

*Documento gerado em 2026-02-28 por @data-engineer — Brownfield Discovery Phase 5*
*Status: APPROVED WITH CHANGES — Pronto para Phase 6 (@ux-design-expert)*
