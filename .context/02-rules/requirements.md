# Requisitos Funcionais

> **Camada**: 1 - Regras  
> **Última atualização**: 2026-02-07

---

## Propósito

Este documento lista **os requisitos funcionais do MVP**, organizados por módulo e prioridade MoSCoW. Cada requisito tem um ID único (`RF-XXX`) para rastreabilidade.

---

# MÓDULO 1: GESTÃO DE PROJETOS (Prioridade 1)

## 🔴 Must Have (Obrigatório para MVP)

### RF-001: Autenticação de Usuários
- Sistema deve permitir login com email e senha
- Sessão deve expirar após período de inatividade
- Usuário deve poder fazer logout

### RF-002: Importação de Projetos via API Espaider
- Importar projetos do endpoint de Projetos
- Mapear campos: IDEspaider, NOME, STATUSPROJETO, RESPONSAVELPROJETO, etc.
- Registrar log de sincronização

### RF-003: Importação de Cadastros Filhos
- Importar Cronogramas de Projetos
- Importar Entregas de Projetos
- Importar Requisitos de Projetos
- Vincular filhos ao projeto pai

### RF-004: Visualização de Projetos
- Listar projetos em formato lista/tabela
- Visualizar dados de capa do projeto
- Filtrar por status, prioridade, responsável
- Buscar por código ou título

### RF-005: Detalhes de Projeto
- Visualizar informações completas do projeto
- Ver cronogramas vinculados
- Ver entregas vinculadas
- Ver requisitos vinculados

### RF-006: Controle de Tabelas Auxiliares
- CRUD de status de projetos
- CRUD de prioridades
- CRUD de tipos de chamado
- CRUD de áreas/assuntos

### RF-007: Controle de Usuários
- CRUD de usuários
- Atribuição de perfis (admin, user, viewer)
- Ativação/desativação de usuários

### RF-008: Logs e Monitoramento
- Registrar todas as sincronizações
- Exibir métricas: processados, novos, atualizados, erros
- Admin pode ver logs detalhados

---

## 🟡 Should Have (Importante, não bloqueante)

### RF-009: Dashboards com KPIs
- Dashboard com visão consolidada de projetos
- Métricas: total, por status, por responsável
- Gráficos de evolução

### RF-010: Sincronização Agendada
- Configurar frequência de sincronização (diária, 2x ao dia)
- Executar sincronização em background

### RF-011: Filtro de Período
- Opções: Hoje, 7 dias, 30 dias, Mês atual
- Dashboards respondem ao filtro

---

## 🟢 Could Have (Desejável)

### RF-012: Kanban de Projetos
- Visualização Kanban por etapa
- Visualização em cards

### RF-013: Drill-down de KPIs
- Clicar em card de KPI filtra lista relacionada

---

# MÓDULO 2: GESTÃO DE AGENTES AI (Prioridade 2)

## 🔴 Must Have (Obrigatório para Módulo 2)

### RF-101: Integração com LangSmith
- Conectar à API LangSmith
- Listar runs/traces de agentes
- Visualizar métricas de execução

### RF-102: Listagem de Agentes
- Listar agentes existentes no repositório
- Exibir status (ativo, inativo)
- Categorizar por tipo/função

### RF-103: Visualização de Workflows
- Exibir workflow de cada agente
- Mostrar cadeia de execução (chain)
- Exibir inputs/outputs de cada step

### RF-104: Documentação de Agentes
- CRUD de documentação por agente
- Vincular documentação a runs
- Histórico de versões

---

## 🟡 Should Have

### RF-105: Visualização de Grafos (LangGraph)
- Renderizar grafos de agentes multi-ator
- Mostrar nós e arestas
- Exibir estado atual de execução

### RF-106: Métricas de Agentes
- Tempo médio de execução
- Taxa de sucesso/erro
- Custo estimado (tokens)

---

## 🟢 Could Have

### RF-107: Editor Visual de Workflows
- Interface para criar/editar workflows
- Drag-and-drop de componentes
- Validação visual

### RF-108: Templates de Agentes
- Biblioteca de templates
- Criar agente a partir de template

---

# INFRAESTRUTURA

## 🔴 Must Have

### RF-201: Multi-tenancy Ready
- Estrutura de dados preparada para multi-tenant
- Tenant padrão: `arauz`
- Isolamento de dados por tenant

### RF-202: Controle de Acesso (RBAC)
- Três perfis: admin, user, viewer
- Permissões conforme BR-002

---

## 🔵 Won't Have (Fora do MVP)

- ❌ App mobile nativo
- ❌ Módulo financeiro
- ❌ Multi-tenancy ativo (apenas preparado)
- ❌ Write-back para Espaider
- ❌ Alertas por email ou Slack
- ❌ Exportação de relatórios (PDF, Excel)
