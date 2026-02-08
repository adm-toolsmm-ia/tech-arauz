---
doc-id: CLAUDE-V01-09
title: Catálogo de Rotinas
scope: Todas as rotinas/jobs do sistema com trigger, entradas, saídas e regras
version: 0.1.0
status: draft
last-updated: 2026-02-05
confidence: Alta
depends-on: [05-espaider-integration, 04-database-schema, 13-jobs-scheduling]
---

# Catálogo de Rotinas

> Cada rotina possui um ID estável (R-###) para referência cruzada.

Relacionado: [[05-espaider-integration]] (pipeline Espaider), [[13-jobs-scheduling]] (agendamento), [[10-flows]] (fluxos que usam estas rotinas), [[07-dashboard-kpis]] (KPIs calculados)

---

## R-001: Sincronização de Projetos Espaider

- **Módulo**: Integração Espaider
- **Objetivo**: Importar/atualizar projetos do ERP Espaider para o portal
- **Trigger**: Manual (botão "Sincronizar" na UI) ou agendado (cron via [[13-jobs-scheduling]])
- **Atores**: Usuário admin (manual) ou pg_cron (automático)
- **Entradas**:
  - Config da API: url_base, token, tipo_autenticacao, identificador (tabela `apis`)
  - Body de filtros (opcional)
- **Saídas**:
  - UPSERT em `projetos` (onConflict: id_espaider)
  - Log em `logs_execucao` com métricas
  - Atualização de `apis.ultima_sincronizacao`
- **Regras de negócio**:
  - **RN-SYNC-01**: O Espaider é a **fonte de verdade** para projetos e solicitações. Alterações manuais feitas no portal podem ser sobrescritas na próxima sincronização.
  - **RN-SYNC-02**: Deduplicação por `id_espaider` (Map em memória). O mesmo registro importado duas vezes produz apenas um UPSERT.
  - **RN-SYNC-03**: Paginação automática via URLPaginacao — todos os registros são importados, sem limite.
  - **RN-SYNC-04**: Novos status vindos do Espaider são auto-criados na tabela `projetos_status` com cor/ordem default.
- **Erros/Retry**: 3 tentativas com backoff exponencial (500ms, 1000ms, 1500ms)
- **Frequência**: Manual ou conforme cron (padrão: inativo, ver [[13-jobs-scheduling]])
- **Referências**: [ref: supabase/functions/sync-espaider/index.ts:600-900]
- **Confiança**: Alta

---

## R-002: Sincronização de Entregas (Filhos)

- **Módulo**: Integração Espaider
- **Objetivo**: Importar entregas/deliverables vinculadas a projetos
- **Trigger**: Automático durante R-001 (ao processar ListaURLFilhos)
- **Entradas**: URLs de `ListaURLFilhos` contendo "entrega" ou campos com DATAPREVISTA
- **Saídas**: UPSERT em `entregas_projeto` com link ao projeto pai
- **Regras de negócio**:
  - Detecção de tipo por URL pattern e análise de campos
  - Link ao pai via IDREGISTROPAI → mapa id_espaider → projeto_id
  - **RN-SYNC-05**: Filhos órfãos (sem projeto pai no portal) são logados mas **NÃO importados**. Ação manual necessária para resolver.
- **Referências**: [ref: supabase/functions/sync-espaider/index.ts:400-500]
- **Confiança**: Alta

---

## R-003: Sincronização de Cronogramas (Filhos)

- **Módulo**: Integração Espaider
- **Objetivo**: Importar marcos/milestones do cronograma de projetos
- **Trigger**: Automático durante R-001
- **Entradas**: URLs contendo "cronograma" ou campos com DATAINICIO
- **Saídas**: UPSERT em `cronogramas_projeto`
- **Regras**: Mesmas de R-002 (detecção, linking, órfãos)
- **Referências**: [ref: supabase/functions/sync-espaider/index.ts:500-550]
- **Confiança**: Alta

---

## R-004: Sincronização de Requisitos (Filhos)

- **Módulo**: Integração Espaider
- **Objetivo**: Importar requisitos de projetos
- **Trigger**: Automático durante R-001
- **Entradas**: URLs contendo "requisito" ou campos com TIPOREQUISITO
- **Saídas**: UPSERT em `requisitos_projeto`
- **Regras**: Mesmas de R-002
- **Referências**: [ref: supabase/functions/sync-espaider/index.ts:550-600]
- **Confiança**: Alta

---

## R-005: Teste de Conexão API

- **Módulo**: Admin > APIs
- **Objetivo**: Validar que uma API configurada está acessível e respondendo
- **Trigger**: Manual (botão "Testar" na UI)
- **Atores**: Usuário admin
- **Entradas**: Config da API (id)
- **Saídas**: Resultado de conexão (sucesso/erro com mensagem)
- **Regras**:
  - Edge function `test-api` faz request mínimo e verifica resposta
  - Não importa dados, apenas valida conectividade
- **Referências**: [ref: supabase/functions/test-api/]
- **Confiança**: Alta

---

## R-006: Normalização de Status de Projetos

- **Módulo**: Integração Espaider (sub-rotina de R-001)
- **Objetivo**: Garantir que todos os status vindos do Espaider existam na tabela `projetos_status`
- **Trigger**: Automático durante R-001, antes do UPSERT de projetos
- **Entradas**: Array de status únicos extraídos dos registros Espaider
- **Saídas**: UPSERT em `projetos_status` (novos status com cor/ordem default)
- **Regras**:
  - Cache em memória: nome → id para lookup rápido
  - Novos status recebem cor default e ordem sequencial
  - Status existentes não são sobrescritos
- **Referências**: [ref: supabase/functions/sync-espaider/index.ts:700-780]
- **Confiança**: Alta

---

## R-007: Vinculação Parent-Child (Linking)

- **Módulo**: Integração Espaider (sub-rotina de R-001)
- **Objetivo**: Vincular registros filhos aos projetos pai via id_espaider
- **Trigger**: Automático durante R-001, após UPSERT de projetos
- **Entradas**: Registros filhos com IDREGISTROPAI, tabela `projetos` atualizada
- **Saídas**: Filhos com `projeto_id` resolvido → UPSERT nas tabelas filhas
- **Regras**:
  - Busca em batches de 200 registros
  - Mapa bidirecional: id_espaider → UUID do projeto
  - Filhos sem pai válido: logados como "sem_pai" ou "sem_projeto_pai", ignorados no UPSERT
- **Referências**: [ref: supabase/functions/sync-espaider/index.ts:800-900]
- **Confiança**: Alta

---

## R-008: Cálculo de Stats do Dashboard Geral

- **Módulo**: Dashboard
- **Objetivo**: Calcular KPIs de solicitações para o Dashboard Geral
- **Trigger**: Automático no frontend (TanStack Query, staleTime: 2 min)
- **Atores**: Qualquer usuário autenticado
- **Entradas**: Tabela `solicitacoes`, tabela `status` (lookup nome → id)
- **Saídas**: DashboardStats { totalAbertas, emAtendimento, resolvidosHoje, resolvidosPeriodo, aguardando, tempoMedioResolucao, totalNoPeriodo }
- **Regras**: Ver [[07-dashboard-kpis]] KPI-001 a KPI-007
- **Referências**: [ref: src/features/dashboard/hooks/useDashboardStats.ts:48-137]
- **Confiança**: Alta

---

## R-009: Cálculo de Métricas SLA

- **Módulo**: Dashboard Gestão
- **Objetivo**: Calcular métricas de SLA para o Dashboard de Gestão
- **Trigger**: Automático no frontend (staleTime: 1 min)
- **Entradas**: Tabela `solicitacoes` (concluídas)
- **Saídas**: SLAMetrics { tempo_medio_resolucao_horas, taxa_resolucao_no_prazo, tickets_no_prazo, tickets_atrasados, satisfacao_media }
- **Regras**: Ver [[07-dashboard-kpis]] KPI-008 a KPI-010
- **Lacuna**: satisfacao_media é hardcoded 4.5
- **Referências**: [ref: src/features/dashboard/hooks/useSLAMetrics.ts:5-78]
- **Confiança**: Alta

---

## R-010: Health Check de Integrações

- **Módulo**: Dashboard Tecnologia
- **Objetivo**: Calcular uptime e status de cada API integrada
- **Trigger**: Automático no frontend (staleTime: 30 seg)
- **Entradas**: Tabela `apis`, tabela `logs_execucao` (últimos 20 por API)
- **Saídas**: IntegrationStatus[] com uptime_percent por API
- **Regras**: Ver [[07-dashboard-kpis]] KPI-014
- **Referências**: [ref: src/features/dashboard/hooks/useIntegrationStatus.ts:5-47]
- **Confiança**: Alta

---

## R-011: Execução de Cron Job

- **Módulo**: Agendamento
- **Objetivo**: Disparar sincronização automática conforme schedule configurado
- **Trigger**: pg_cron no PostgreSQL
- **Entradas**: `tarefas_sincronizacao` com `ativo=true` e `cron_schedule` definido
- **Saídas**: Invocação da edge function correspondente
- **Regras**: Ver [[13-jobs-scheduling]]
- **Lacuna**: Jobs estão com `ativo=false` por padrão — necessita ativação manual
- **Referências**: [ref: supabase/migrations/20260119210400_sync_cron.sql]
- **Confiança**: Média

---

## R-012: Sanitização de Logs por Role

- **Módulo**: Logs / Segurança
- **Objetivo**: Filtrar dados sensíveis de logs para usuários não-admin
- **Trigger**: Automático via views no PostgreSQL
- **Entradas**: `logs_execucao` (tabela completa)
- **Saídas**: `logs_execucao_safe` (view sem detalhes e mensagem_erro)
- **Regras**: Ver [[12-security-rbac]]
- **Referências**: [ref: src/integrations/supabase/types.ts:1098-1153]
- **Confiança**: Alta

---

## Decisões Pendentes

> [!question] Q-ROT-001: Purge de logs antigos
> Não existe rotina de limpeza de logs. A tabela `logs_execucao` crescerá indefinidamente. Definir política de retenção e implementar rotina R-013. Ver [[16-risks-gaps]] Q-003.

> [!question] Q-ROT-002: Circuit breaker
> A função `is_circuit_open()` existe no banco mas seu uso na sync não está claro. Está sendo chamada antes de cada sync? Qual o threshold padrão?

> [!question] Q-ROT-003: Reconciliação de dados deletados
> Se um projeto for deletado no Espaider, o sync não remove do portal (UPSERT apenas insere/atualiza). Definir se é necessário um mecanismo de soft-delete ou reconciliação.

> [!question] Q-ROT-004: Projetos deletados no Espaider
> Projetos que deixam de existir no Espaider devem ser soft-deleted no portal (campo `ativo=false` ou `deletado_em`)? Ou mantidos como histórico? Impacta KPIs e dashboards.
