---
doc-id: CLAUDE-V01-04
title: Schema do Banco de Dados
scope: Todas as tabelas, views, funções e relacionamentos do Supabase
version: 0.1.0
status: draft
last-updated: 2026-02-05
confidence: Alta
depends-on: [05-espaider-integration, 12-security-rbac]
---

# Schema do Banco de Dados

> Fonte de verdade: `[ref: src/integrations/supabase/types.ts]` (gerado automaticamente pelo Supabase CLI)
> Migrações: `[ref: supabase/migrations/]` (11 arquivos SQL)

Relacionado: [[05-espaider-integration]] (mapeamento de campos), [[12-security-rbac]] (políticas RLS), [[11-domain-entities-events]] (entidades conceituais)

---

## Visão Geral

| Categoria | Tabelas | Propósito |
|---|---|---|
| **Core — Projetos** | projetos, entregas_projeto, cronogramas_projeto, requisitos_projeto | Dados importados do Espaider |
| **Core — Solicitações** | solicitacoes, entregas, cronogramas, requisitos, anexos, interacoes | Tickets e itens relacionados |
| **Lookup** | status, prioridades, tipos, categorias, areas, etapas_kanban, projetos_status, projetos_etapas_kanban | Tabelas de referência configuráveis |
| **Integração** | apis, espaider_field_mapping, tarefas_sincronizacao, sync_jobs_config | Config de APIs e sync |
| **Logs** | logs_execucao, logs | Auditoria e execução |
| **Auth** | profiles, user_roles | Usuários e papéis |
| **Outros** | documentacoes, automacoes, clientes | Funcionalidades auxiliares |
| **Views** | apis_safe, logs_execucao_safe | Views com mascaramento |

---

## Tabelas Core — Projetos

### projetos
> Projetos importados do Espaider via [[05-espaider-integration]]

| Coluna | Tipo | Nullable | Default | Descrição |
|---|---|---|---|---|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| id_espaider | integer | NULL | — | ID original no Espaider (UNIQUE WHERE NOT NULL) |
| codigo_espaider | text | NULL | — | Código visível (ex: "PRJ-2026-001") |
| titulo | text | NOT NULL | — | Nome do projeto |
| descricao | text | NULL | — | Descrição detalhada |
| status_projeto | text | NULL | — | Status textual (legado) |
| situacao_atual | text | NULL | — | Situação vinda do Espaider |
| prioridade | text | NULL | — | Urgente/Alta/Normal/Baixa |
| tipo_chamado | text | NULL | — | Tipo de chamado no Espaider |
| tipo_assunto | text | NULL | — | Assunto/categoria do projeto |
| responsavel_nome | text | NULL | — | Nome do responsável |
| pasta_consultivo | text | NULL | — | Pasta do consultivo |
| trm_espaider | text | NULL | — | TRM no Espaider |
| prazo_final | timestamptz | NULL | — | Prazo final |
| prazo_aprovador | timestamptz | NULL | — | Prazo do aprovador |
| prazo_cronograma_atual | timestamptz | NULL | — | Prazo do cronograma vigente |
| data_inicio_aprovacao | timestamptz | NULL | — | Início da aprovação |
| data_movimentacao | timestamptz | NULL | — | Última movimentação |
| encerrado_em | timestamptz | NULL | — | Data de encerramento |
| sincronizado_em | timestamptz | NULL | — | Última sincronização |
| solucao_aplicada_em | timestamptz | NULL | — | Data da solução |
| origem | text | NULL | 'espaider' | manual / espaider / api |
| created_at | timestamptz | NOT NULL | now() | Criação no portal |
| updated_at | timestamptz | NOT NULL | now() | Última atualização (trigger) |

**Índices**: UNIQUE on id_espaider WHERE id_espaider IS NOT NULL
**RLS**: Authenticated SELECT; Admin/Service ALL. Ver [[12-security-rbac]]
**Trigger**: `update_updated_at` no UPDATE

### entregas_projeto
> Entregas/deliverables vinculadas a um projeto. Ver [[05-espaider-integration]] R-002

| Coluna | Tipo | Nullable | Default | Descrição |
|---|---|---|---|---|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| projeto_id | uuid | NOT NULL | — | FK → projetos.id (CASCADE) |
| id_espaider | integer | NULL | — | ID no Espaider (UNIQUE WHERE NOT NULL) |
| titulo | text | NOT NULL | — | Nome da entrega |
| descricao | text | NULL | — | Detalhes |
| status | text | NULL | — | Status da entrega |
| data_prevista | timestamptz | NULL | — | Data prevista |
| data_conclusao | timestamptz | NULL | — | Data de conclusão real |
| created_at | timestamptz | NOT NULL | now() | — |
| updated_at | timestamptz | NOT NULL | now() | — |

### cronogramas_projeto
> Marcos/milestones do cronograma de um projeto

| Coluna | Tipo | Nullable | Default | Descrição |
|---|---|---|---|---|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| projeto_id | uuid | NOT NULL | — | FK → projetos.id (CASCADE) |
| id_espaider | integer | NULL | — | UNIQUE WHERE NOT NULL |
| titulo | text | NOT NULL | — | Nome do marco |
| descricao | text | NULL | — | — |
| data_inicio | timestamptz | NULL | — | Início |
| data_fim | timestamptz | NULL | — | Fim |
| status | text | NULL | — | Status do marco |
| progresso | integer | NULL | — | % de conclusão (0-100) |
| responsavel | text | NULL | — | Responsável pelo marco |
| created_at | timestamptz | NOT NULL | now() | — |
| updated_at | timestamptz | NOT NULL | now() | — |

### requisitos_projeto
> Requisitos vinculados a um projeto

| Coluna | Tipo | Nullable | Default | Descrição |
|---|---|---|---|---|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| projeto_id | uuid | NOT NULL | — | FK → projetos.id (CASCADE) |
| id_espaider | integer | NULL | — | UNIQUE WHERE NOT NULL |
| titulo | text | NOT NULL | — | — |
| descricao | text | NULL | — | — |
| tipo | text | NULL | — | Tipo do requisito |
| prioridade | text | NULL | — | — |
| status | text | NULL | — | — |
| created_at | timestamptz | NOT NULL | now() | — |
| updated_at | timestamptz | NOT NULL | now() | — |

[ref: supabase/migrations/20260124180000_projeto_entregas_cronogramas_requisitos.sql]

---

## Tabelas Core — Solicitações

### solicitacoes
> Tickets/demandas de TI. Central do módulo de solicitações. Ver [[06-feature-map]]

| Coluna | Tipo | Nullable | Default | Descrição |
|---|---|---|---|---|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| titulo | text | NOT NULL | — | Título da solicitação |
| descricao | text | NULL | — | Descrição detalhada |
| data_abertura | timestamptz | NOT NULL | now() | Data de abertura |
| data_conclusao | timestamptz | NULL | — | Data de conclusão (NULL = aberta) |
| data_previsao | timestamptz | NULL | — | Prazo estimado para SLA |
| status_id | uuid | NULL | — | FK → status.id |
| prioridade_id | uuid | NULL | — | FK → prioridades.id |
| tipo_id | uuid | NULL | — | FK → tipos.id |
| categoria_id | uuid | NULL | — | FK → categorias.id |
| area_id | uuid | NULL | — | FK → areas.id |
| etapa_kanban_id | uuid | NULL | — | FK → etapas_kanban.id |
| cliente_id | uuid | NULL | — | FK → clientes.id |
| responsavel_id | uuid | NULL | — | FK → profiles (user) |
| responsavel_nome | text | NULL | — | Nome do responsável (denormalizado) |
| id_espaider | integer | NULL | — | ID no Espaider |
| codigo_espaider | text | NULL | — | Código Espaider |
| origem | text | NULL | — | manual / espaider / api |
| pasta_consultivo | text | NULL | — | — |
| status_projeto | text | NULL | — | Status textual (legado) |
| dados_externos | jsonb | NULL | — | Dados extras da API |
| sincronizado_em | timestamptz | NULL | — | — |
| created_at | timestamptz | NOT NULL | now() | — |
| updated_at | timestamptz | NOT NULL | now() | — |

**FKs**: status, prioridades, tipos, categorias, areas, etapas_kanban, clientes

### Tabelas filhas de solicitações

| Tabela | FK | Campos principais |
|---|---|---|
| entregas | solicitacao_id → solicitacoes.id | titulo, status, data_prevista, data_conclusao |
| cronogramas | solicitacao_id → solicitacoes.id | titulo, data_inicio, data_fim, status, progresso, responsavel |
| requisitos | solicitacao_id → solicitacoes.id | titulo, tipo, prioridade, status |
| anexos | solicitacao_id → solicitacoes.id | nome, url, tipo, tamanho |
| interacoes | solicitacao_id → solicitacoes.id | mensagem, tipo, autor_id |

---

## Tabelas de Lookup

> Tabelas configuráveis via [[06-feature-map]] módulo Admin > Tabelas Auxiliares.
> Possuem `codigo_externo` para mapeamento com APIs externas. Ver [[05-espaider-integration]]

| Tabela | Campos | Seed values |
|---|---|---|
| **status** | id, nome, cor, ordem, ativo, codigo_externo | Novo, Em Andamento, Em Revisão, Concluído, Cancelado |
| **prioridades** | id, nome, cor, nivel, ativo, codigo_externo | Alta, Normal, Baixa, Crítica |
| **tipos** | id, nome, cor, descricao, ativo, codigo_externo | Configurável |
| **categorias** | id, nome, cor, descricao, ativo, codigo_externo | Configurável |
| **areas** | id, nome, descricao, ativo, codigo_externo | Configurável |
| **etapas_kanban** | id, nome, cor, ordem, ativo | Colunas do Kanban de solicitações |
| **projetos_status** | id, nome, cor, ordem, ativo | Projeto futuro, Em aprovação, Em desenvolvimento, Em homologação, Concluído, Cancelado, Suspenso |
| **projetos_etapas_kanban** | id, nome, cor, ordem, ativo | Backlog, Em Análise, Em Desenvolvimento, Homologação, Concluído |

[ref: supabase/migrations/20260124000000_projetos_lookup_tables.sql]
[ref: supabase/migrations/20260121180000_fix_espaider_integration.sql]

---

## Tabelas de Integração

### apis
> Configuração de integrações externas. Ver [[06-feature-map]] módulo Admin > APIs

| Coluna | Tipo | Nullable | Default | Descrição |
|---|---|---|---|---|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| nome | text | NOT NULL | — | Nome da API |
| descricao | text | NULL | — | — |
| url_base | text | NOT NULL | — | URL base da API |
| tipo | text | NULL | — | espaider / rest / webhook / custom |
| recurso | text | NULL | — | projetos / entregas / cronogramas / requisitos / solicitacoes |
| identificador | text | NULL | — | Parâmetro Identificador do Espaider |
| tipo_autenticacao | text | NULL | — | Bearer / QueryParam / ApiKey / Basic / None |
| token | text | NULL | — | Token/chave de autenticação (sensível!) |
| ativo | boolean | NULL | true | — |
| config | jsonb | NULL | — | Configurações extras |
| ultima_sincronizacao | timestamptz | NULL | — | — |
| created_at / updated_at | timestamptz | NOT NULL | now() | — |

> [!warning] Segurança
> O campo `token` é armazenado em texto plano. O acesso ao frontend usa a view `apis_safe` que mascara o valor. Ver [[12-security-rbac]]

### espaider_field_mapping
> Mapeamento dinâmico de campos Espaider → sistema. Ver [[05-espaider-integration]]

| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid | PK |
| campo_espaider | text | Nome do campo no Espaider (ex: "NOME") |
| campo_sistema | text | Nome da coluna no portal (ex: "titulo") |
| tabela_lookup | text | Se o campo é FK, qual tabela de lookup usar |
| transformacao | text | Tipo de transformação (date, uppercase, etc.) |
| descricao | text | Descrição do mapeamento |
| ativo | boolean | — |

### tarefas_sincronizacao
> Jobs de sincronização agendáveis. Ver [[13-jobs-scheduling]]

| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid | PK |
| nome | text | Nome da tarefa |
| descricao | text | — |
| tipo | text | Tipo do job |
| frequencia | text | diario / semanal / mensal / manual |
| horario | text | Horário de execução |
| dias_semana | integer[] | Dias da semana (0-6) |
| dia_mes | integer | Dia do mês |
| cron_schedule | text | Expressão cron (ex: "0 6 * * *") |
| timezone | text | Default: "America/Sao_Paulo" |
| prioridade | integer | 1-10 |
| api_id | uuid | FK → apis.id |
| endpoint | text | Endpoint específico |
| config | jsonb | Configurações adicionais |
| ativo | boolean | Default: false |
| ultima_execucao | timestamptz | — |
| proxima_execucao | timestamptz | — |

### sync_jobs_config
> Configuração de jobs pg_cron

| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid | PK |
| nome | text | Nome |
| schedule | text | Expressão cron |
| edge_function | text | Nome da edge function |
| ativo | boolean | — |
| ultima_execucao | timestamptz | — |
| proxima_execucao | timestamptz | — |

---

## Tabelas de Logs

### logs_execucao
> Logs detalhados de cada execução de sync. Ver [[09-routines-catalog]], [[07-dashboard-kpis]]

| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid | PK |
| tarefa_id | uuid | FK → tarefas_sincronizacao.id |
| status | text | sucesso / erro / em_andamento |
| registros_processados | integer | Total processados |
| registros_novos | integer | Inseridos |
| registros_atualizados | integer | Atualizados |
| registros_erros | integer | Com erro |
| mensagem_erro | text | Mensagem de erro (sensível para não-admin) |
| detalhes | jsonb | Detalhes técnicos completos |
| duracao_ms | integer | Duração em milissegundos |
| iniciado_em | timestamptz | Início da execução |
| finalizado_em | timestamptz | Fim da execução |

### logs
> Log geral de auditoria

| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid | PK |
| tipo | text | Tipo do log |
| mensagem | text | Mensagem |
| detalhes | jsonb | Dados adicionais |
| usuario_id | uuid | Quem gerou |

---

## Tabelas de Auth

### profiles

| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → auth.users.id |
| nome | text | Nome do usuário |
| email | text | Email |
| avatar_url | text | URL do avatar |

### user_roles

| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → auth.users.id |
| role | app_role | admin / user / viewer |

**Enum app_role**: `"admin" | "user" | "viewer"` — Ver [[12-security-rbac]]

---

## Outras Tabelas

### documentacoes
| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid | PK |
| titulo | text | Título |
| conteudo | text | Conteúdo Markdown |
| categoria | text | Categoria |
| autor_id | uuid | Quem criou |

### automacoes
| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid | PK |
| nome | text | Nome |
| descricao | text | — |
| ativo | boolean | — |
| total_execucoes | integer | Counter |
| ultima_execucao | timestamptz | — |

### clientes
| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid | PK |
| nome | text | Nome |
| email | text | — |
| cnpj | text | — |
| telefone | text | — |
| ativo | boolean | — |

---

## Views

### apis_safe
> View de `apis` com token mascarado: `substring(token, 1, 4) || '****'`
> Usada pelo frontend para listar APIs sem expor o token completo.

Colunas: mesmas de `apis` exceto `token` → `token_masked` (read-only)

### logs_execucao_safe
> View de `logs_execucao` sem `detalhes` e `mensagem_erro` (sensíveis).
> Usada para usuários não-admin verem logs sem dados técnicos.

Colunas: mesmas exceto `detalhes` → NULL, `mensagem_erro` → NULL

[ref: src/integrations/supabase/types.ts:1046-1153]

---

## Funções

| Função | Args | Retorno | Propósito |
|---|---|---|---|
| `has_role(_user_id, _role)` | uuid, app_role | boolean | Verifica se usuário tem o papel. Usada nas políticas RLS. |
| `is_circuit_open(p_tarefa_id, p_threshold?)` | uuid, integer? | boolean | Verifica se o circuit breaker está aberto para uma tarefa (threshold de falhas consecutivas) |
| `update_updated_at()` | — | trigger | Auto-atualiza coluna updated_at em UPDATE |

---

## Decisões Pendentes

> [!question] Q-DB-001: Tabelas projetos_status vs status
> Existem duas tabelas de status separadas: `status` (para solicitações) e `projetos_status` (para projetos). Isso é intencional (domínios diferentes) ou deveria ser unificado? Ver [[16-risks-gaps]] Q-004.

> [!question] Q-DB-002: Retenção de logs
> Não há política de purge/retenção para `logs_execucao`. Com syncs frequentes, esta tabela pode crescer indefinidamente. Ver [[16-risks-gaps]] Q-003.

> [!question] Q-DB-003: Campo token em plaintext
> O campo `apis.token` armazena credenciais em texto plano. Considerar criptografia at-rest via Vault ou pgcrypto. Ver [[12-security-rbac]] POL-003.
