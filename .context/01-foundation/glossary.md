# Glossário do Domínio

> **Camada**: 0 - Fundação  
> **Última atualização**: 2026-02-07

---

## Termos do Negócio

| Termo | Definição |
|-------|-----------|
| **Solicitação** | Demanda registrada por usuário (erro, dúvida, melhoria, ajuste) |
| **Projeto** | Iniciativa maior composta por entregas, cronogramas e requisitos |
| **Entrega** | Marco dentro de um projeto com data prevista e status |
| **Cronograma** | Timeline de atividades de um projeto com datas e responsáveis |
| **Requisito** | Especificação funcional ou técnica de um projeto |
| **SLA** | Service Level Agreement — tempo máximo para resolução |
| **KPI** | Key Performance Indicator — métrica de desempenho |

---

## Termos do Sistema Espaider

| Termo | Definição |
|-------|-----------|
| **Espaider** | ERP jurídico usado pelo escritório como sistema central |
| **IDEspaider** | Identificador único de registro no Espaider |
| **ListaCampos** | Array de campos retornado pela API do Espaider |
| **ListaRegistros** | Array de registros retornado pela API do Espaider |
| **ListaURLFilhos** | Array de URLs para registros filhos (entregas, cronogramas, requisitos) |
| **IDREGISTROPAI** | Campo de vínculo entre registro filho e seu pai |
| **TRM** | Código interno do escritório para rastreabilidade |
| **espaider_raw** | Campo JSONB que armazena resposta completa da API para auditoria |

---

## Termos de Agentes AI

| Termo | Definição |
|-------|-----------|
| **LangChain** | Framework Python para construção de aplicações LLM |
| **LangGraph** | Biblioteca para criação de grafos de agentes multi-ator |
| **LangSmith** | Plataforma de observabilidade para aplicações LLM |
| **Agent** | Programa autônomo que usa LLM para tomar decisões |
| **Workflow** | Sequência de passos executados por um agente |
| **Run** | Execução individual de um agente/workflow |
| **Trace** | Registro detalhado de uma execução (inputs, outputs, latência) |
| **Chain** | Sequência de chamadas encadeadas em LangChain |
| **Node** | Ponto de processamento dentro de um grafo LangGraph |
| **Edge** | Conexão entre nós em um grafo LangGraph |

---

## Termos Técnicos

| Termo | Definição |
|-------|-----------|
| **RLS** | Row-Level Security — controle de acesso por linha no banco |
| **RBAC** | Role-Based Access Control — controle de acesso por papel |
| **Kanban** | Método visual de gestão com colunas por status |
| **UPSERT** | Operação que insere ou atualiza registro existente |
| **UPSERT idempotente** | UPSERT via `UNIQUE(tenant_id, espaider_id)` que permite sync repetido sem duplicação |
| **Tenant** | Inquilino/organização em sistema multi-tenant |
| **Single-tenant** | Sistema dedicado a uma única organização |
| **Multi-tenant** | Sistema compartilhado por múltiplas organizações |
| **UUID PK** | Primary Key usando UUID (gen_random_uuid()) em vez de BIGSERIAL |
| **SplitView** | Painel lateral deslizante para visualizar detalhes sem sair da lista |
| **Visão 360°** | Visualização completa de uma entidade com todas as relações em abas |
| **notes_html** | Campo que armazena notas em formato HTML (usando TipTap editor) |

---

## Componentes da UI

| Termo | Definição |
| --- | --- |
| **ProjectCockpit** | Componente principal que exibe visão 360° de um projeto com 6 abas |
| **LogViewer** | Componente que exibe histórico de sincronizações Espaider com filtros |
| **ProjectFilters** | Componente de filtros avançados para projetos (período, status, prioridade, etc) |
| **ProjectTable** | Grid de projetos com 9 colunas ordenáveis e integração com SplitView |

---

## Status de Solicitações

| Código | Label | Cor |
|--------|-------|-----|
| `novo` | Novo | Azul |
| `em-atendimento` | Em Atendimento | Amarelo |
| `aguardando` | Aguardando | Laranja |
| `resolvido` | Resolvido | Verde |
| `cancelado` | Cancelado | Cinza |

---

## Prioridades

| Código | Label | Cor |
|--------|-------|-----|
| `urgente` | Urgente | Vermelho |
| `alta` | Alta | Laranja |
| `normal` | Normal | Azul |
| `baixa` | Baixa | Cinza |

---

## Status de Projetos (Espaider)

| Status Espaider | Descrição |
|-----------------|-----------|
| Projeto futuro | Aguardando aprovação ou na fila |
| Em execução | Projeto ativo em desenvolvimento |
| Iniciado | Projeto recém-iniciado |
| Aprovado e concluído | Projeto finalizado com sucesso |
| Cancelado | Projeto cancelado |
