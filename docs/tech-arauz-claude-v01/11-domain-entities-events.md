---
doc-id: CLAUDE-V01-11
title: Entidades Conceituais e Eventos de Domínio
scope: Ciclo de vida das entidades e eventos que o sistema emite/consome
version: 0.1.0
status: draft
last-updated: 2026-02-05
confidence: Média
depends-on: [04-database-schema, 09-routines-catalog, 05-espaider-integration]
---

# Entidades Conceituais e Eventos de Domínio

Relacionado: [[04-database-schema]] (modelo físico), [[09-routines-catalog]] (rotinas que geram eventos), [[05-espaider-integration]] (origem dos dados)

---

## Entidades Conceituais

> Descritas em nível de domínio, sem dependência do modelo físico. Ver [[04-database-schema]] para detalhes de tabelas.

### Projeto
- **Definição**: Iniciativa de TI/inovação com escopo, responsável e prazos
- **Origem**: Espaider (importado) ou manual
- **Identificação**: id_espaider (externo) + UUID (interno)
- **Ciclo de vida**:
  ```
  Projeto futuro → Em aprovação → Em desenvolvimento → Em homologação → Concluído
                                                                      ↘ Cancelado
                                                   ↗ Suspenso (qualquer etapa)
  ```
- **Filhos**: Entregas, Cronogramas, Requisitos
- **Gestão**: Kanban board com etapas configuráveis — ver [[06-feature-map]]

### Solicitação (Ticket)
- **Definição**: Demanda de TI (bug, dúvida, suporte, melhoria)
- **Origem**: Espaider ou manual
- **Ciclo de vida**:
  ```
  Novo → Em Andamento → Em Revisão → Concluído
                                    ↘ Cancelado
  ```
- **Filhos**: Entregas, Cronogramas, Requisitos, Anexos, Interações
- **SLA**: data_previsao define prazo; data_conclusao marca fim
- **Gestão**: Kanban + Lista — ver [[06-feature-map]]

### Entrega (Deliverable)
- **Definição**: Artefato ou resultado entregável
- **Vínculo**: Projeto OU Solicitação (nunca ambos)
- **Estados**: Pendente, Em Andamento, Concluída, Cancelada
- **Datas-chave**: data_prevista, data_conclusao

### Cronograma (Milestone)
- **Definição**: Marco temporal com progresso mensurável
- **Atributos**: data_inicio, data_fim, progresso (0-100%), responsavel
- **Estados**: Planejado, Em Andamento, Concluído, Atrasado

### Requisito
- **Definição**: Especificação técnica ou funcional
- **Atributos**: tipo (funcional, técnico, etc.), prioridade, status
- **Estados**: Pendente, Aprovado, Implementado, Rejeitado

### API (Integração)
- **Definição**: Configuração de conexão com sistema externo
- **Tipos**: espaider, rest, webhook, custom
- **Estados**: Ativo / Inativo
- **Ciclo**: Criação → Teste → Ativação → Sync periódica

### Tarefa de Sincronização
- **Definição**: Job agendável para importação de dados
- **Atributos**: cron_schedule, frequência, timezone, api vinculada
- **Estados**: Ativo / Inativo

### Log de Execução
- **Definição**: Registro imutável de uma execução de sync
- **Atributos**: status (sucesso/erro/em_andamento), métricas, detalhes
- **Imutabilidade**: Após criação, apenas status e métricas são atualizados

### Perfil de Usuário
- **Definição**: Representação do usuário no sistema
- **Atributos**: nome, email, avatar, role
- **Vínculo**: auth.users.id → profiles.user_id

---

## Eventos de Domínio

> Eventos que o sistema gera ou deveria gerar. Alguns são implícitos (efeitos colaterais de operações) e não são formalmente emitidos via pub/sub.

### EV-001: ProjetoSincronizado
- **Descrição**: Um ou mais projetos foram importados/atualizados do Espaider
- **Origem**: Edge function sync-espaider (R-001)
- **Dados**: { api_id, registros_processados, novos, atualizados, filhos_processados }
- **Consumidores**:
  - Frontend: invalidateQueries(['projetos', 'apis'])
  - Log: registro em logs_execucao
- **Confiança**: Alta [ref: sync-espaider/index.ts]

### EV-002: StatusProjetoAlterado
- **Descrição**: Status ou etapa kanban de um projeto foi alterado
- **Origem**: useUpdateProjetoEtapa / useUpdateProjetoStatus (frontend)
- **Dados**: { projeto_id, campo_alterado, valor_anterior, valor_novo }
- **Consumidores**: invalidateQueries(['projetos'])
- **Confiança**: Alta

### EV-003: SyncFalhou
- **Descrição**: Uma sincronização terminou com erro
- **Origem**: Edge function sync-espaider
- **Dados**: { api_id, stage, error_message, tentativas }
- **Consumidores**:
  - Log: registro em logs_execucao (status: 'erro')
  - Frontend: toast de erro
- **Canais futuros**: Email, Slack (não implementado — ver [[08-alerts-policies]])
- **Confiança**: Alta

### EV-004: SolicitacaoConcluida
- **Descrição**: Uma solicitação recebeu data_conclusao (resolvida)
- **Origem**: Sync Espaider ou atualização manual
- **Dados**: { solicitacao_id, data_conclusao, dentro_do_prazo }
- **Consumidores**: Dashboard KPIs (resolvidosHoje, resolvidosPeriodo, SLA) — ver [[07-dashboard-kpis]]
- **Confiança**: Média (evento implícito, não formalmente emitido)

### EV-005: APIConfigurada
- **Descrição**: Uma nova API foi criada ou configurada
- **Origem**: useCreateApi / useUpdateApi (admin)
- **Dados**: { api_id, nome, tipo, status }
- **Consumidores**: invalidateQueries(['apis'])
- **Confiança**: Alta

### EV-006: CronExecutado
- **Descrição**: pg_cron disparou um job agendado
- **Origem**: pg_cron → edge function
- **Dados**: { tarefa_id, cron_schedule, timestamp }
- **Consumidores**: Execução da sync (R-001)
- **Confiança**: Média (depende de pg_cron estar ativo)

### EV-007: FilhoOrfaoDetectado
- **Descrição**: Um registro filho do Espaider não encontrou projeto pai no portal
- **Origem**: R-007 (parent-child linking)
- **Dados**: { id_espaider_filho, idregistropai, tipo_filho }
- **Consumidores**: Log estruturado (mas não salvo em tabela dedicada)
- **Confiança**: Alta

---

## Regras de Transição de Estado

> Regras de negócio sobre como entidades mudam de estado. Atualmente não há validação formal (máquina de estados) — transições são livres.

### Projeto — Transições Observadas

```
Projeto futuro ──→ Em aprovação ──→ Em desenvolvimento ──→ Em homologação ──→ Concluído
                                          │
                                          ├──→ Suspenso (de qualquer etapa)
                                          └──→ Cancelado (de qualquer etapa)
```

| Regra | Descrição |
| --- | --- |
| **RN-EST-01** | Qualquer transição é permitida atualmente (sem validação). O Espaider controla o estado real. |
| **RN-EST-02** | Status vindos do Espaider são aceitos como estão (fonte de verdade). |
| **RN-EST-03** | Novos status não previstos são auto-criados na tabela `projetos_status`. |

### Solicitação — Transições Observadas

```
Novo ──→ Em Andamento ──→ Em Revisão ──→ Concluído
                                        ↘ Cancelado
```

| Regra | Descrição |
| --- | --- |
| **RN-EST-04** | A conclusão de uma solicitação é marcada por `data_conclusao IS NOT NULL`. |
| **RN-EST-05** | SLA é calculado com base em `data_conclusao <= data_previsao`. |

---

## Decisões Pendentes

> [!question] Q-ENT-001: Event bus formal
> Eventos hoje são implícitos (efeitos colaterais). Avaliar implementar um event bus (Supabase Realtime, database triggers com NOTIFY, ou edge functions com pub/sub) para:
> - Notificações em tempo real entre usuários
> - Webhook para sistemas externos
> - Histórico de eventos para auditoria

> [!question] Q-ENT-002: Auditoria de mudanças
> Não há audit trail formal. Mudanças em projetos/solicitações não são historificadas. Considerar tabela de audit_log ou triggers de histórico. Ver [[12-security-rbac]].

> [!question] Q-ENT-003: Entidades duplicadas
> Entregas, Cronogramas e Requisitos existem em duas variantes: `{entidade}` (filha de solicitações) e `{entidade}_projeto` (filha de projetos). Unificar com campo discriminador ou manter separadas?

> [!question] Q-ENT-004: Transições de estado devem ser validadas?
> Atualmente transições são livres (qualquer estado para qualquer estado). Implementar máquina de estados com validação? Considerar que o Espaider é fonte de verdade e pode enviar qualquer transição.
