# Documentação de Dashboards e Cards do Front-end

Este documento detalha todos os dashboards, cards e gráficos disponíveis atualmente no front-end, explicando seu funcionamento e as fontes de dados utilizadas.

## 1. Visão Geral dos Dashboards

O sistema possui 5 áreas principais de visualização de dados:

1.  **Dashboard Principal** (`/dashboard`): Visão executiva e gerencial de todos os projetos.
2.  **Gestão de Projetos** (`/projetos`): Visão operacional com Kanban e lista detalhada.
3.  **Cronogramas** (`/cronogramas`): Visão de calendário e atividades.
4.  **Agentes AI** (`/agentes`): Monitoramento de performance e custos dos agentes.
5.  **Integrações** (`/integracoes`): Status e configuração das conexões com Espaider.

---

## 2. Detalhamento por Área

### 2.1. Dashboard Principal (`/dashboard`)

**Objetivo:** Fornecer uma visão rápida da saúde do portfólio de projetos.

**Fonte de Dados:**
*   Tabela `projects` do Supabase.
*   Relacionamentos: `project_schedules`, `project_deliveries`, `project_histories`, `project_approvers`, `project_budgets`.

**Componentes:**

#### A. Cabeçalho (`DashboardHeader`)
*   **Exibe:** Saudação ao usuário e subtítulo.
*   **Funcionalidades:** Toggle de tema (Claro/Escuro), Notificações (placeholder).

#### B. KPIs (Indicadores Chave de Desempenho)
Cartões métricos (`KPICard`) divididos em duas linhas:

*   **Linha 1 - Métricas Core:**
    *   **Total de Projetos:** Contagem total de registros na tabela `projects`.
    *   **Em Andamento:** Projetos com status diferente de `concluido`, `cancelado` ou `suspenso`.
    *   **Concluídos:** Projetos com status `concluido`. Inclui tendência mensal (comparação com mês anterior).
    *   **Atrasados:** Projetos onde `prazo_final` (ou `end_date`) é menor que a data atual e status não é concluído.
*   **Linha 2 - Métricas Estratégicas:**
    *   **Alta Prioridade:** Projetos com prioridade `urgente` ou `alta`.
    *   **Importância Especial:** Projetos marcados com flag `importancia_especial = true`.
    *   **Taxa de Conclusão:** Porcentagem de projetos concluídos sobre o total.
    *   **Projetos por Área:** Contagem de áreas únicas distintas.

#### C. Gráficos
*   **Pipeline de Projetos (`ProjectPipelineChart`):** Gráfico de barras verticais.
    *   *Dados:* Contagem agrupada por `status` (ex: Futuro, Em Aprovação, Em Desenvolvimento).
    *   *Interação:* Clique na barra filtra a lista de projetos abaixo.
*   **Distribuição por Status (`StatusDistributionChart`):** Gráfico de Rosca (Donut).
    *   *Dados:* Porcentagem de projetos em cada status.
    *   *Interação:* Clique no segmento filtra a lista.
*   **Tendência Mensal (`ProjectTrendChart`):** Gráfico de Linha.
    *   *Dados:* Comparativo de projetos "Criados" vs "Concluídos" nos últimos 6 meses.
    *   *Eixo X:* Mês/Ano. *Eixo Y:* Quantidade.

#### D. Listas Dinâmicas
*   **Lista Filtrada:** Aparece ao clicar em um KPI ou Gráfico. Mostra detalhes (Nome, Código, Área, Prazo, Status) dos projetos filtrados.
*   **Projetos Recentes:** Lista os 8 projetos mais recentes (ordenados por `created_at`).

---

### 2.2. Gestão de Projetos (`/projetos`)

**Objetivo:** Gerenciamento operacional e acompanhamento do fluxo de trabalho.

**Fonte de Dados:** Mesma do Dashboard Principal (`projects` e relacionamentos).

**Visualizações:**

#### A. Kanban (`KanbanBoard`)
*   **Colunas:** Dinâmicas baseadas na `fase_atual` do projeto (ou `status` como fallback).
    *   *Fluxo:* Levantamentos -> Análise -> Aprovação -> Execução -> Validação -> Monitoramento -> Concluído.
*   **Cards (`DraggableCard`):**
    *   *Exibe:* Título, Código Espaider, Valor Total, Prioridade (Badge colorida), Última Mensagem de movimentação.
    *   *Interação:* Drag-and-drop para mudar de fase (atualiza `fase_atual` e `status`). Clique abre o Cockpit 360°.

#### B. Lista (`ProjectList`)
*   **Formato:** Tabela detalhada.
*   **Colunas:** Projeto, Área, Responsável, Fase, Prioridade, Prazo (com alerta de atraso), Impacto (Operacional/Estratégico), Última Mensagem, Status.
*   **Ordenação:** Clique no cabeçalho para ordenar por qualquer coluna.

#### C. Cockpit 360° (`ProjectCockpit` em `SplitView`)
Painel lateral deslizante com detalhes profundos do projeto.
*   **Abas:**
    *   *Resumo:* Dados cadastrais, valores, responsáveis.
    *   *Cronogramas:* Lista de marcos do projeto (`project_schedules`).
    *   *Entregas:* Lista de deliverables (`project_deliveries`).
    *   *Ações:* Histórico de movimentações e aprovações.

---

### 2.3. Cronogramas (`/cronogramas`)

**Objetivo:** Visualização temporal de todas as atividades de todos os projetos.

**Fonte de Dados:** Tabela `project_schedules` com join em `projects`.

**Visualizações:**

#### A. Calendário (`MonthView` / `WeekView`)
*   **Mês:** Grade de dias. Mostra indicadores (bolinhas coloridas) para atividades. Vermelho indica atraso.
*   **Semana:** Colunas por dia. Mostra cards compactos das atividades.
*   **Interação:** Clique no dia abre painel de detalhes.

#### B. KPIs de Atividades
*   **Total:** Contagem total de atividades.
*   **Atrasadas:** Data de fim/prazo anterior a hoje e não concluída.
*   **Concluídas:** Status contém "conclu".
*   **Próximas do Prazo:** Vencimento nos próximos 7 dias.

#### C. Cards de Atividade (`ActivityCard`)
*   **Exibe:** Nome da atividade, Projeto (com cor identificadora), Responsável, Datas (Início, Fim, Prazo, Novo Prazo), Status.
*   **Alertas:** Ícone de alerta se atrasado. Badge de "Prazo" se próximo do vencimento.

---

### 2.4. Agentes AI (`/agentes`)

**Objetivo:** Monitoramento técnico e financeiro dos agentes de IA.

**Fonte de Dados:** API Python (`/api/agents` e `/api/budget`).

**Componentes:**

#### A. KPIs (`AgentKPIs`)
*   **Agentes:** Total e Ativos.
*   **Execuções:** Total de runs.
*   **Taxa de Sucesso:** % média de sucesso.
*   **Custo Total:** Gasto acumulado.

#### B. Cards de Agente (`AgentCard`)
*   **Exibe:** Nome, Versão, Descrição, Status (Ativo/Inativo), Tipo (Automação/Análise), Métricas (Execuções, Sucesso, Latência, Custo).
*   **Cores:** Badges coloridas conforme status e tipo.

#### C. Medidor de Budget (`BudgetGauge`)
*   **Visual:** Barra de progresso com cor dinâmica (Verde < 50%, Amarelo < 75%, Vermelho > 75%).
*   **Dados:** Gasto atual vs Limite mensal.

---

### 2.5. Integrações (`/integracoes`)

**Objetivo:** Configuração da conexão com o Espaider.

**Fonte de Dados:** Tabela `espaider_apis`.

**Componentes:**

#### A. Cards de API
*   **Exibe:** Nome, Tipo (Projetos/Entregas/etc), Identificador, Token (mascarado), Status da última sincronização.
*   **Ações:** Editar, Excluir, Testar Conexão (ping na API).

#### B. Log Viewer
*   **Visual:** Lista colapsável de logs de sincronização.
*   **Níveis:** Sucesso (Verde), Aviso (Amarelo), Erro (Vermelho).

---

## 3. Resumo dos Componentes Reutilizáveis

| Componente            | Caminho                                             | Descrição                                        |
| :-------------------- | :-------------------------------------------------- | :----------------------------------------------- |
| **KPICard**           | `src/components/dashboard/KPICard.tsx`              | Card padrão para métricas com ícone e tendência. |
| **PipelineChart**     | `src/components/charts/ProjectPipelineChart.tsx`    | Gráfico de barras para status.                   |
| **TrendChart**        | `src/components/charts/ProjectTrendChart.tsx`       | Gráfico de linha para histórico.                 |
| **DistributionChart** | `src/components/charts/StatusDistributionChart.tsx` | Gráfico de pizza/rosca.                          |
| **DashboardHeader**   | `src/components/layout/DashboardHeader.tsx`         | Cabeçalho padrão das páginas internas.           |
| **KanbanBoard**       | `src/components/views/KanbanBoard.tsx`              | Quadro interativo com drag-and-drop.             |
| **SplitView**         | `src/components/views/SplitView.tsx`                | Painel lateral deslizante (Drawer).              |
| **ProjectCockpit**    | `src/components/project/ProjectCockpit.tsx`         | Detalhamento 360° do projeto.                    |
