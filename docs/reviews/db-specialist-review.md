## Database Specialist Review

Data: 2026-02-26  
Base analisada: `docs/prd/technical-debt-DRAFT.md`, migrations Supabase, rotas de integracao.

### Gate da revisao DB

Status: **APPROVED WITH CHANGES**

### Debitos validados

| ID | Debito | Severidade | Horas | Prioridade | Notas |
|---|---|---|---:|---|---|
| DB-01 | Historico de regressao RLS em child tables/logs | Critica | 20 | Critica | Ja remediado, precisa virar teste obrigatorio de regressao |
| DB-02 | Token sensivel persistido em tabela | Alta | 12 | Alta | Migrar para secret manager + mascaramento |
| DB-03 | Hardcode de tenant em scripts/migrations | Alta | 10 | Alta | Remover fallback estatico em runtime |
| DB-04 | Campos de dominio livres sem padrao forte | Media | 24 | Media | Introduzir checks por ondas para nao quebrar sync |
| DB-05 | Retencao de logs nao formalizada | Media | 12 | Media | Definir TTL e estrategia de arquivamento |

### Debitos adicionados

| ID | Debito | Severidade | Horas | Prioridade | Notas |
|---|---|---|---:|---|---|
| DB-06 | Falta de monitoramento de crescimento/bloat de tabelas de log | Media | 8 | Media | Adicionar painel operacional e alarmes |
| DB-07 | Nao ha baseline documentada de restore/recovery drill | Alta | 14 | Alta | Fundamental para continuidade de negocio |

### Respostas ao architect

1. **RLS adicional prioritario**: validar continuamente `project_histories`, `project_approvers`, `project_budgets`, `integration_log_entries`, `sync_logs`, `agents`.
2. **Token em `espaider_apis`**: melhor remover armazenamento do token; caso nao seja possivel, criptografar em repouso e limitar leitura por role.
3. **Teste CI de RLS**: incluir rotina SQL que execute `audit_all_rls_policies()` + asserts obrigatorios.
4. **Enums/checks prioritarios**: `projects.status_original/situacao_original`, `prioridade`, `fase_atual`, `sync_status`.

### Recomendacoes (ordem sugerida)

1. Segurança/isolamento: DB-01 + DB-02 + DB-03
2. Confiabilidade operacional: DB-07 + DB-05
3. Qualidade de dados: DB-04 + DB-06

