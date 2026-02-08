---
doc-id: CLAUDE-V01-02
title: Glossário e Atores
scope: Termos do domínio, atores, sistemas, mapeamento Espaider
version: 0.1.0
status: draft
last-updated: 2026-02-05
confidence: Alta
depends-on: [01-vision-scope, 05-espaider-integration]
---

# Glossário e Atores

Relacionado: [[01-vision-scope]] (contexto), [[05-espaider-integration]] (mapeamento de campos Espaider), [[04-database-schema]] (tabelas)

---

## Termos do Domínio

| Termo | Definição | Tabela/Ref |
|---|---|---|
| **Projeto** | Iniciativa de TI/inovação com escopo, prazo e responsável. Importado do Espaider. | `projetos` |
| **Solicitação** | Ticket/demanda de TI (bug, melhoria, suporte, dúvida). | `solicitacoes` |
| **Entrega** | Deliverable vinculado a um projeto ou solicitação. Tem data prevista e status. | `entregas_projeto`, `entregas` |
| **Cronograma** | Marco/milestone com data início, fim e progresso percentual. | `cronogramas_projeto`, `cronogramas` |
| **Requisito** | Especificação técnica ou funcional vinculada a projeto/solicitação. | `requisitos_projeto`, `requisitos` |
| **API** | Configuração de integração com sistema externo (Espaider, REST, webhook). | `apis` |
| **Tarefa de Sync** | Job configurável para sincronização periódica com uma API. | `tarefas_sincronizacao` |
| **Log de Execução** | Registro de uma execução de sync com métricas (processados, erros, duração). | `logs_execucao` |
| **Etapa Kanban** | Coluna no board Kanban representando um estágio do fluxo. | `etapas_kanban`, `projetos_etapas_kanban` |
| **Status** | Estado atual de uma solicitação ou projeto. | `status`, `projetos_status` |
| **Prioridade** | Nível de urgência (Urgente, Alta, Normal, Baixa). | `prioridades` |
| **Tipo** | Classificação da solicitação (Erro, Dúvida, Suporte, Ajuste, Melhoria). | `tipos` |
| **Categoria** | Agrupamento temático de solicitações. | `categorias` |
| **Área** | Departamento ou setor de origem. | `areas` |
| **Automação** | Job/rotina automatizada com execuções contabilizadas. | `automacoes` |
| **Documentação** | Documento técnico interno em Markdown. | `documentacoes` |
| **Dashboard** | Painel visual com KPIs, gráficos e métricas. | [[07-dashboard-kpis]] |
| **KPI** | Indicador-chave de desempenho calculado a partir de dados do sistema. | [[07-dashboard-kpis]] |
| **Alerta** | Notificação visual quando um KPI ultrapassa um threshold. | [[08-alerts-policies]] |
| **UPSERT** | Operação que insere ou atualiza registro (INSERT ON CONFLICT UPDATE). | [[05-espaider-integration]] |
| **id_espaider** | ID numérico original do registro no ERP Espaider. Chave de deduplicação. | `projetos.id_espaider` |
| **codigo_espaider** | Código legível do registro no Espaider (ex: "PRJ-2026-001"). | `projetos.codigo_espaider` |
| **origem** | Fonte do dado: `manual` (criado no portal), `espaider` (importado), `api` (outra). | `projetos.origem` |
| **RLS** | Row-Level Security — políticas de acesso por linha no PostgreSQL. | [[12-security-rbac]] |
| **Edge Function** | Função serverless executada no Supabase (Deno runtime). | [[05-espaider-integration]] |
| **Circuit Breaker** | Padrão que previne chamadas a serviços falhando repetidamente. | `is_circuit_open()` |
| **Stale Time** | Tempo que dados em cache são considerados frescos (TanStack Query). | [[07-dashboard-kpis]] |

---

## Atores Humanos

| Ator | Papel | Acesso |
|---|---|---|
| **CTO (Gabriel)** | Product Owner, decisões técnicas, acesso total | admin |
| **Equipe TI** | Operadores de solicitações, visualização de dashboards | user |
| **Gestores de Área** | Consumidores de relatórios e dashboards | viewer |

---

## Sistemas

| Sistema | Tipo | Papel | Ref |
|---|---|---|---|
| **Portal Tech Arauz** | Aplicação web | Sistema principal, frontend + backend | — |
| **ERP Espaider** | Sistema externo | Fonte de verdade para projetos/solicitações | [[05-espaider-integration]] |
| **Supabase** | Backend-as-a-Service | Database (PostgreSQL), Auth, Edge Functions, RLS | [[03-architecture]] |
| **Vercel** | Plataforma de deploy | Hospedagem do frontend React | [[03-architecture]] |
| **pg_cron** | Extensão PostgreSQL | Agendamento de jobs de sync | [[13-jobs-scheduling]] |

---

## Mapeamento de Campos Espaider → Sistema

> Lista completa de aliases em [[05-espaider-integration]]. Aqui os principais:

| Campo Espaider | Aliases comuns | Campo no Portal | Tabela |
|---|---|---|---|
| NOME | NOMEPROJETO, NOMEREGISTRO | titulo | projetos |
| CODIGO | CODIGOPROJETO | codigo_espaider | projetos |
| SITUACAOATUAL | SITUACAO, STATUSPROJETO | status_projeto, situacao_atual | projetos |
| PRIORIDADE | PRIORIDADEPROJETO | prioridade | projetos |
| RESPONSAVELPROJETO | RESPONSAVEL, NOMERESPONSAVEL | responsavel_nome | projetos |
| PRAZOFINAL | PRAZO | prazo_final | projetos |
| IDREGISTROPAI | IDPAI, IDPROJETO, PROJETO_ID | (link ao projeto pai) | entregas/cronogramas/requisitos |
| DATAPREVISTA | — | data_prevista | entregas_projeto |
| DATAINICIO | — | data_inicio | cronogramas_projeto |
| DATAFIM | — | data_fim | cronogramas_projeto |
| PROGRESSO | PERCENTUAL | progresso | cronogramas_projeto |
| TIPOREQUISITO | TIPO | tipo | requisitos_projeto |

---

## Termos Técnicos

| Termo | Definição |
|---|---|
| **TanStack Query** | Library de gerenciamento de estado de servidor (cache, refetch, staleTime) |
| **Shadcn/ui** | Coleção de componentes React baseados em Radix UI + Tailwind |
| **Zod** | Library de validação de schemas TypeScript |
| **WCF** | Windows Communication Foundation — protocolo da API do Espaider |
| **ListaCampos** | Array de {Identificador, Valor} retornado pela API Espaider |
| **ListaURLFilhos** | Array de URLs para buscar registros filhos no Espaider |
| **URLPaginacao** | URL para próxima página de resultados no Espaider |
| **QueryParam auth** | Autenticação via parâmetro na URL (?Token=xxx) |
| **Bearer auth** | Autenticação via header Authorization: Bearer xxx |

---

## Decisões Pendentes

> [!question] Q-GLOSS-001: Unificação de termos
> "Solicitação" e "Projeto" são entidades distintas no sistema, mas no Espaider podem ser a mesma coisa (tipo_chamado). Clarificar a distinção no contexto do portal.
