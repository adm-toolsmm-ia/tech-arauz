# Frontend Spec — PRD UX/UI 2026 (Brownfield Phase 3)

**Documento:** Phase 3 — UX Discovery
**Agente:** @ux-design-expert (Uma)
**Data:** 2026-02-28
**PRD de referência:** Padronização UX/UI com Projetos/Cronogramas somente leitura + Gestão de Tecnologia & IA
**Insumos das fases anteriores:** Phase 1 (@architect) + Phase 2 (@data-engineer)

---

## 1. Padrão UX Alvo

O PRD define um padrão de layout consistente para todos os módulos do portal. Denominado aqui de **Padrão Canônico**, ele possui 6 camadas ordenadas:

```
DashboardHeader         ← Título + subtítulo da seção
KPIs (clickáveis)       ← Métricas de resumo, clicáveis para filtrar
Banner ERP (condicional) ← "Fonte: ERP Espaider — somente leitura" (módulos read-only)
FilterBar               ← Busca + filtros rápidos + filtros avançados (Sheet) + ViewToggle
Content                 ← Kanban / Lista / Agenda / Calendário
SplitView / Cockpit     ← Painel lateral de detalhes ao clicar em um item
```

**Regras de diferenciação:**

| Tipo de módulo | Banner ERP | Botão "Criar" | KPIs clicáveis |
|----------------|------------|---------------|----------------|
| Read-only (ERP) | SIM — obrigatório | NÃO | SIM |
| CRUD (próprio) | NÃO | SIM | Opcional |

---

## 2. Sidebar — Estado Atual vs PRD

### 2.1 Estado Atual

Arquivo: `src/components/layout/sidebar-config.ts`

```
Grupos atuais:
  Inteligência
    - Dashboard (/dashboard)
  Operação
    - Projetos (/projetos)
    - Cronogramas (/cronogramas)
  Sistema
    - Agentes AI (/agentes) [badge: MVP]
    - Integrações (/integracoes)
    - Usuários (/cadastros/usuarios)
  Auxiliares
    - Tipos de Agentes (/auxiliares/agent-types)
    - Modelos IA (/auxiliares/modelos-ia)
    - Fornecedores IA (/auxiliares/lm-providers)
```

### 2.2 Estado PRD Requerido

```
Grupos requeridos:
  Inteligência
    - Dashboard (/dashboard)
  Operação
    - Projetos (/projetos)
    - Cronogramas (/cronogramas)
  Tecnologia & IA           ← NOVO grupo (renomear "Sistema", excluir itens não-IA)
    - Agentes AI (/agentes)
    - Integrações (/integracoes) [manter]
    - Usuários (/cadastros/usuarios) [manter]
  Tabelas Auxiliares        ← RENOMEAR de "Auxiliares"
    - Tipos de Agentes (/auxiliares/agent-types)
    - Modelos IA (/auxiliares/modelos-ia)
    - Fornecedores IA (/auxiliares/lm-providers)
```

### 2.3 Gaps da Sidebar

| Gap | Arquivo | Mudança necessária |
|-----|---------|-------------------|
| Grupo "Sistema" deve virar "Tecnologia & IA" | `sidebar-config.ts` | Renomear `group: 'Sistema'` → `group: 'Tecnologia & IA'` |
| Grupo "Auxiliares" deve virar "Tabelas Auxiliares" | `sidebar-config.ts` | Renomear `group: 'Auxiliares'` → `group: 'Tabelas Auxiliares'` |

---

## 3. Módulo: Cronogramas (Read-Only)

### 3.1 Estado Atual

Arquivo principal: `src/app/cronogramas/cronogramas-content.tsx`

O módulo Cronogramas é o mais complexo do sistema. Ele consume dados do Espaider via `project_schedules` e exibe atividades de cronograma de projetos. É intrinsecamente read-only pois os dados vêm do ERP.

**Layout atual implementado:**
```
DashboardHeader ("Cronogramas")
  subtitle: "Visualize todos os cronogramas de projetos"
CronogramaFilters (FilterBar customizado)
  └── inclui ViewToggle (agenda | lista) + CalendarPeriod (dia | semana | mês)
KPIs (CronogramasKPIBar) ← dentro de scrollable container
CronogramaCalendar (condicional: viewMode === 'agenda')
SelectedDayPanel (condicional: dia selecionado no calendário)
CronogramaList (sempre visível)
CronogramaCockpit (SplitView com ScheduleCockpit)
```

**Problema de layout identificado:** O container com `flex-1 space-y-6 overflow-y-auto p-6` envolve apenas os KPIs, enquanto Calendar, SelectedDayPanel, List e Cockpit ficam fora desse container. Isso causa inconsistência visual — os KPIs ficam numa scroll area separada do restante do conteúdo.

### 3.2 Component Tree

```
CronogramasContent (src/app/cronogramas/cronogramas-content.tsx)
├── TooltipProvider
├── DashboardHeader
│   └── title="Cronogramas"
│   └── subtitle="Visualize todos os cronogramas de projetos"
├── CronogramaFilters (src/app/cronogramas/components/CronogramaFilters.tsx)
│   └── [não lido — arquivo referenciado mas não explicitado na task]
├── div.flex-1.overflow-y-auto.p-6 [CONTÉM APENAS:]
│   └── CronogramasKPIBar (src/app/cronogramas/components/CronogramasKPIBar.tsx)
│       ├── KPICard "Atividades Pendentes" [clicável → filtra 'pendentes']
│       ├── KPICard "Em Execução" [clicável → filtra 'em_execucao']
│       ├── KPICard "Atrasadas" [clicável → filtra 'atrasados']
│       ├── KPICard "Próximas do Prazo" [clicável → filtra 'proximos_vencer']
│       └── KPICard "Data Ausente" [clicável → filtra 'sem_prazo']
├── CronogramaCalendar [condicional: viewMode === 'agenda']
│   (src/app/cronogramas/components/CronogramaCalendar.tsx)
│   ├── MonthView (grid 7 colunas, dot indicators, Popover por dia)
│   ├── WeekView (7 colunas, chip de atividade, scroll)
│   └── DayView (lista de ActivityCards para o dia)
├── SelectedDayPanel [condicional: selectedDay e (mês ou semana)]
│   (src/app/cronogramas/components/CronogramaCockpit.tsx — exportado junto)
├── CronogramaList (src/app/cronogramas/components/CronogramaList.tsx)
│   └── grid de ActivityCards (card grid 2-4 colunas)
│       └── ActivityCard (card com color bar lateral, badges, datas)
└── CronogramaCockpit (src/app/cronogramas/components/CronogramaCockpit.tsx)
    └── SplitView (width="wide")
        └── ScheduleCockpit (src/components/cronogramas/ScheduleCockpit.tsx)
```

### 3.3 View Modes Disponíveis

| View Mode | Implementado | Descrição |
|-----------|-------------|-----------|
| `agenda` | SIM | Calendário (mês/semana/dia) + lista filtrada para período |
| `lista` | SIM | Grid de ActivityCards em 2-4 colunas responsivas, sem calendário |
| `kanban` | NÃO | Não implementado |

**CalendarPeriod (dentro de agenda e lista):**
| Período | Implementado | Comportamento |
|---------|-------------|---------------|
| `day` | SIM | DayView: lista de cards do dia; padrão do hook |
| `week` | SIM | WeekView: grid 7 colunas com chips |
| `month` | SIM | MonthView: calendário 7x6 com dot indicators |

### 3.4 FilterBar — Campos Atuais vs Necessários

Baseado em `useCronogramasFilters.ts`, os filtros disponíveis são:

**Campos filtráveis confirmados no hook:**
- `project_id` — multi-select dinâmico (opções dos dados)
- `status` — select dinâmico dos valores únicos
- `responsavel` — select dinâmico
- `setor_responsavel` — select dinâmico
- `fase_atividade` — select dinâmico
- `atrasado` — boolean filter (true/false)
- `proximo_vencer` — boolean filter (true/false, computed)
- `sem_prazo` — boolean filter (true/false, computed)
- Busca por texto (campos: `atividade`, `responsavel`, `setor_responsavel`, `fase_atividade`, etc.)

**ViewModes no registro:** `agenda` e `lista`
**AgendaPeriods no registro:** `dia`, `semana`, `mês`

**Campos ausentes identificados por Phase 2:**
- `prioridade` — NÃO existe no schema de `project_schedules` (confirmado por @data-engineer)
- `progresso_percentual` — NÃO existe no schema (confirmado por @data-engineer)

### 3.5 Gaps Identificados vs PRD

| # | Gap | Severidade | Detalhes |
|---|-----|-----------|----------|
| C-01 | **Banner ERP ausente** | ALTA | Nenhum banner "Fonte: ERP — somente leitura" exibido. O módulo é 100% read-only mas não sinaliza isso ao usuário. |
| C-02 | **View Kanban não implementada** | ALTA | O Phase 1 identificou que falta view Kanban. Confirmado: só há `agenda` e `lista`. PRD requer Kanban por status de atividade. |
| C-03 | **CronogramaList renderiza cards (não tabela)** | MÉDIA | O "modo lista" atual é um grid de cards (2-4 colunas), não uma tabela com linhas. Para volumes grandes isso prejudica a leitura comparativa. |
| C-04 | **Bug getWeekStart() — semana inicia domingo** | MÉDIA | Phase 2 identificou: `getWeekStart()` em `schedule-status.ts` usa `getDay()` com Sunday=0, iniciando semana no domingo em vez de segunda-feira (padrão BR/ISO-8601). |
| C-05 | **Layout de container inconsistente** | BAIXA | KPIs estão dentro de um div com `overflow-y-auto` separado do Calendar/List. Resulta em scrollbars aninhadas inconsistentes. |
| C-06 | **DashboardHeader sem subtítulo informativo do ERP** | BAIXA | Subtitle atual: "Visualize todos os cronogramas de projetos". PRD sugere mencionar fonte ERP. |
| C-07 | **Botão "Criar" ausente (correto — read-only)** | OK | Não existe botão de criação. Correto para módulo read-only. |
| C-08 | **Filtros booleanos sem labels em PT** | BAIXA | Tooltip do FilterBar exibe "Click to clear" (inglês) em vez de "Limpar filtro". |

### 3.6 Especificação das Mudanças

**C-01 — Banner ERP (ALTA prioridade)**
```tsx
// Inserir após DashboardHeader, antes de CronogramaFilters
<ErpReadOnlyBanner source="Espaider" lastSyncAt={lastSyncAt} />
```
Componente a criar: `src/components/layout/ErpReadOnlyBanner.tsx`
Props: `source: string`, `lastSyncAt?: string` (de `sync_logs.completed_at`)

**C-02 — View Kanban para Cronogramas (ALTA prioridade)**
Colunas sugeridas baseadas no campo `status` existente nos dados:
- "Pendente" → `pendente`
- "Em Execução" → `em_execucao`
- "Concluída" → `concluida`
- "Atrasada" → computado via `atrasado === true`

Implementação: usar `KanbanBoard` existente com `ActivityCard` como `renderItemContent`.
**Importante:** Kanban em módulo read-only — sem drag-and-drop (não passar `onStatusChange`).

**C-03 — Lista como tabela (MÉDIA prioridade)**
Quando `viewMode === 'lista'`, renderizar tabela com colunas:
`Atividade | Projeto | Responsável | Início | Fim | Prazo | Status | Fase`
Manter card grid como alternativa ou como fallback em mobile.

**C-04 — Bug getWeekStart() (MÉDIA prioridade)**
Arquivo: `src/lib/domain/schedule-status.ts`
Fix: alterar cálculo para iniciar semana na segunda-feira:
```typescript
// Atual (domingo como 0):
const day = date.getDay(); // 0 = domingo
// Fix (segunda-feira como dia 1):
const day = (date.getDay() + 6) % 7; // 0 = segunda
```

---

## 4. Módulo: Projetos (Read-Only)

### 4.1 Estado Atual

Arquivo principal: `src/app/projetos/projects-content.tsx`

O módulo Projetos é o mais completo do sistema, com KPIs clicáveis, Kanban e ListView, e SplitView com ProjectCockpit de 6 tabs. Dados vêm do Espaider (read-only, exceto atualização de `fase_atual` via Kanban drag-and-drop).

**Layout atual implementado:**
```
DashboardHeader ("Gestão de Projetos")
  subtitle: "Visualize e gerencie todos os projetos do Espaider"
KPIs (ProjectsKPIBar) — clicáveis, filtram a lista
ProjectsFilters (FilterBar + botão Sync Espaider)
Content (Kanban ou Lista) — controlado por viewMode
SplitView → ProjectCockpit (6 tabs)
```

### 4.2 Component Tree

```
ProjectsContent (src/app/projetos/projects-content.tsx)
├── DashboardHeader title="Gestão de Projetos"
├── ProjectsKPIBar (src/app/projetos/components/ProjectsKPIBar.tsx)
│   └── [múltiplos KPICards — não lido diretamente, inferido do padrão]
├── ProjectsFilters (src/app/projetos/components/ProjectsFilters.tsx)
│   ├── FilterBar (busca + filtros rápidos + Sheet avançado)
│   └── Botão "Sincronizar Espaider" (handleSync → syncEspaiderAction)
├── Content [condicional por viewMode]
│   ├── ProjectsKanbanView [viewMode === 'kanban']
│   │   (src/app/projetos/components/ProjectsKanbanView.tsx)
│   │   └── KanbanBoard (src/components/views/KanbanBoard.tsx)
│   │       ├── colunas dinâmicas por fase_atual/status
│   │       ├── DraggableCard (drag-and-drop habilitado)
│   │       └── ProjectKanbanCard como renderItemContent
│   └── ProjectsListViewWrapper [viewMode === 'list']
│       (src/app/projetos/components/ProjectsListView.tsx)
└── SplitView (width="wide")
    └── ProjectCockpit (src/components/project/index.tsx)
        └── [6 tabs: Detalhes, Entregas, Cronograma, Histórico, Aprovadores, Ações]
```

### 4.3 Capacidades de Filtro

Baseado em `useProjetosFilters` (não lido diretamente, inferido do uso em `ProjectsFilters`):
- Filtros por status, área, responsável, fase
- Busca por texto no nome/código do projeto
- KPI filter overlay via `activeKpiFilter` (filterByProjectKpi)

### 4.4 Gaps Identificados vs PRD

| # | Gap | Severidade | Detalhes |
|---|-----|-----------|----------|
| P-01 | **Banner ERP ausente** | ALTA | Sem banner "Fonte: ERP Espaider — somente leitura". O subtítulo atual menciona "Espaider" mas não deixa claro que é read-only. |
| P-02 | **Drag-and-drop no Kanban altera dados do ERP** | ALTA | `ProjectsKanbanView` permite drag-and-drop para mudar `fase_atual` via `updateProjectStatusAction`. PRD define Projetos como read-only. Esta é uma inconsistência de produto que precisa de decisão arquitetural: manter write limitado (apenas fase) ou bloquear totalmente. |
| P-03 | **Botão "Sincronizar" está em ProjectsFilters** | MÉDIA | A ação de sincronização está embutida na FilterBar. PRD pode querer que isso fique no DashboardHeader (action button) ou em área de admin separada. |
| P-04 | **DashboardHeader subtitle pouco informativo** | BAIXA | "Visualize e gerencie todos os projetos do Espaider" — "gerencie" implica write, mas é read-only. Ajustar para "Visualize todos os projetos importados do Espaider". |

### 4.5 Especificação das Mudanças

**P-01 — Banner ERP (ALTA prioridade)**
Usar o mesmo componente `ErpReadOnlyBanner` especificado em C-01.
Inserir após `DashboardHeader`, antes de `ProjectsKPIBar`.

**P-02 — Drag-and-drop (decisão de produto necessária)**
Opções:
- **Opção A (manter write limitado):** Manter drag-and-drop apenas para `fase_atual`, adicionar tooltip "Apenas a fase pode ser alterada manualmente" e não mostrar botão de criação.
- **Opção B (full read-only):** Remover `onStatusChange` do `KanbanBoard` em `ProjectsKanbanView`, tornando o Kanban somente visual.

**P-03 — Botão Sync (MÉDIA prioridade)**
Mover botão "Sincronizar Espaider" para `DashboardHeader` como `actionButton` prop ou para um menu de admin em `/integracoes`.

---

## 5. Módulo: Agentes AI (CRUD)

### 5.1 Estado Atual

Arquivo principal: `src/app/agentes/agentes-content.tsx`

Módulo CRUD completo para gestão de agentes de IA. Dados são próprios do sistema (não ERP).

**Layout atual implementado:**
```
DashboardHeader ("Gestão 360° de Agentes AI")
KPIs (4 cards): Total, Rascunho, Publicado, Deprecado
Filtros customizados (Input busca + Select status + Select tipo)
ViewToggle customizado (Grid | List | Kanban — botões inline, não FilterBar)
Content (Grid | List | Kanban)
SplitView → AgentCockpit (com botão Editar que navega para /agentes/[id])
```

### 5.2 Component Tree

```
AgentsContent (src/app/agentes/agentes-content.tsx)
├── DashboardHeader title="Gestão 360° de Agentes AI"
├── CreateAgentDialog (src/components/agents/CreateAgentDialog.tsx)
│   └── [Dialog de criação — não lido]
├── KPIs (grid 2x2 lg)
│   ├── KPICard "Total"
│   ├── KPICard "Rascunho"
│   ├── KPICard "Publicado"
│   └── KPICard "Deprecado"
├── Filtros inline (NÃO usa FilterBar padrão)
│   ├── Input busca ("Pesquisar agentes...")
│   ├── Select status (all | draft | published | deprecated)
│   ├── Select tipo (all | tipos dinâmicos)
│   └── ViewToggle inline (Grid3X3 | List | LayoutGrid)
│   └── Button Refresh (router.refresh())
├── Content [condicional por viewMode]
│   ├── Grid (grid 1-3 colunas — cards com nome, slug, desc, modelo, tipo, status)
│   ├── List (lista de Cards row com badge status)
│   └── Kanban (grid manual, NÃO usa KanbanBoard)
│       └── colunas: draft | published | deprecated
│       └── Cards simples com nome, desc, agentType, modelId
└── SplitView (width="lg")
    └── AgentCockpit (src/components/agents/AgentCockpit.tsx)
```

### 5.3 Capacidades de Filtro

- Busca por texto: filtra `name`, `description`, `slug`, `agentType` (via `filterAgents` domain fn)
- Status filter: `all | draft | published | deprecated`
- Tipo filter: dinâmico, todos os `agentType` únicos

### 5.4 Gaps Identificados vs PRD

| # | Gap | Severidade | Detalhes |
|---|-----|-----------|----------|
| A-01 | **Não usa FilterBar padrão** | MÉDIA | Filtros são implementados manualmente com Input + 2 Selects. Não usa o componente `FilterBar` centralizado, rompendo consistência visual entre módulos. |
| A-02 | **Kanban customizado (não usa KanbanBoard)** | MÉDIA | O Kanban de Agentes é implementado com divs manuais em vez de `KanbanBoard`. Não tem drag-and-drop real (só clique). Perde features de acessibilidade e animações. |
| A-03 | **KPIs sem clique para filtrar** | BAIXA | KPIs exibem Total/Rascunho/Publicado/Deprecado mas não são clicáveis (sem `onClick` prop). Diferente do padrão dos outros módulos. |
| A-04 | **Refresh via router.refresh()** | BAIXA | Atualização usa `router.refresh()` (recarrega SSR) em vez de invalidação de cache via TanStack Query. Inconsistente com Story 2.11 (data fetching patterns). |
| A-05 | **Botão Editar navega para /agentes/[id]** | INFO | Edição usa rota dedicada (`/agentes/[id]`), não Dialog inline. Adequado para formulários complexos. Manter. |

### 5.5 Especificação das Mudanças

**A-01 — Migrar para FilterBar padrão (MÉDIA prioridade)**
Criar `useAgentesFilters` hook similar ao `useAgentTypesFilters` e usar `FilterBar` com os campos: busca, status (quickFilter), tipo (quickFilter).

**A-02 — Migrar Kanban para KanbanBoard (MÉDIA prioridade)**
Usar `KanbanBoard` com colunas `draft | published | deprecated`.
`onStatusChange` pode chamar `handleStatusChange` já existente.
`renderItemContent` renderiza card simplificado de agente.

**A-03 — KPIs clicáveis (BAIXA prioridade)**
Adicionar `onClick` e `active` prop nos KPICards para filtrar por status.

---

## 6. Módulo: Tipos de Agentes (CRUD)

### 6.1 Estado Atual

Arquivo principal: `src/app/auxiliares/agent-types/agent-types-content.tsx`

Módulo CRUD para categorias de agentes. É o módulo mais alinhado com o padrão canônico.

**Layout atual implementado:**
```
DashboardHeader ("Tipos de Agentes")
Botão "Novo Tipo" (no-header, lado direito)
KPIs (3 cards): Total, Ativos, Sistema
Card informativo azul (AlertCircle sobre tipos de sistema)
FilterBar (centralizado, usa FilterBar padrão)
Content (Kanban | Lista)
SplitView → AgentTypeCockpit
AgentTypeFormDialog (criação/edição)
Dialog confirmação exclusão
```

### 6.2 Component Tree

```
AgentTypesContent (src/app/auxiliares/agent-types/agent-types-content.tsx)
├── DashboardHeader title="Tipos de Agentes"
├── Button "Novo Tipo" [+ Plus icon]
├── KPIs (grid 1-3)
│   ├── KPICard "Total"
│   ├── KPICard "Ativos"
│   └── KPICard "Sistema"
├── Card informativo (border-blue-200 bg-blue-50)
├── FilterBar (moduleId="agent-types", usa FilterBar padrão)
├── Content [condicional]
│   ├── EmptyState (se filteredData vazio)
│   ├── KanbanBoard [viewMode === 'kanban']
│   │   colunas: active | inactive
│   │   items: {id, title=name, subtitle=slug, status=is_active?'active':'inactive'}
│   │   onStatusChange → updateAgentTypeAction
│   └── Lista [viewMode outro]
│       └── AgentTypeListItem (src/app/auxiliares/agent-types/components/AgentTypeListItem.tsx)
└── SplitView (width="lg") → AgentTypeCockpit
```

### 6.3 Gaps Identificados vs PRD

| # | Gap | Severidade | Detalhes |
|---|-----|-----------|----------|
| AT-01 | **KPIs sem clique para filtrar** | BAIXA | KPIs exibem totais mas não são clicáveis (`onClick` ausente). |
| AT-02 | **Header e botão "Novo Tipo" não alinhados ao padrão** | BAIXA | `DashboardHeader` e botão estão em `flex items-center justify-between`, mas o header não recebe `actions` prop — o botão é solto ao lado. Verificar se `DashboardHeader` suporta `actions` prop para padronizar. |
| AT-03 | **Card informativo fixo (conteúdo hardcoded)** | INFO | O card azul de informação é sempre visível. Poderia ser colapsável ou removível. |
| AT-04 | **Trend nos KPICards hardcoded como '0'** | BAIXA | `trend={{ value: '0', positive: false }}` — trend sempre zero. Remover prop ou calcular delta real. |

### 6.4 Estado Geral

Módulo bem estruturado. Usa FilterBar padrão, KanbanBoard, SplitView. Poucos ajustes necessários.

---

## 7. Módulo: Modelos IA (CRUD)

### 7.1 Estado Atual

Arquivo principal: `src/app/auxiliares/modelos-ia/modelos-ia-content.tsx`

Módulo CRUD para modelos de linguagem. Complexidade média, suporta múltiplas views.

**Layout atual implementado:**
```
DashboardHeader ("Gestao 360 de Modelos IA")
Botão "Novo Modelo"
KPIs (3 cards): Total, Fornecedores/Modelos do Fornecedor, Filtrados
Card informativo azul
FilterBar (centralizado, usa FilterBar padrão)
Content (Kanban | Lista | Grid)
SplitView → inline detail panel (não usa Cockpit dedicado)
Dialog criação + Dialog confirmação exclusão
```

### 7.2 Component Tree

```
ModelsIaContent (src/app/auxiliares/modelos-ia/modelos-ia-content.tsx)
├── DashboardHeader title="Gestao 360 de Modelos IA"
├── Button "Novo Modelo"
├── KPIs (grid 1-3)
│   ├── KPICard "Total de Modelos"
│   ├── KPICard "Fornecedores" | "Modelos do Fornecedor" (dinâmico)
│   └── KPICard "Filtrados"
├── Card informativo
├── FilterBar (moduleId="modelos-ia", usa FilterBar padrão)
├── Content [condicional]
│   ├── EmptyState (se filteredModels vazio)
│   ├── KanbanBoard [viewMode === 'kanban']
│   │   colunas: dinâmicas por provider_id
│   │   onStatusChange → updateLmModelDisplayOrderAction (muda display_order)
│   ├── ModelsListView [viewMode === 'list']
│   │   (src/components/lm-models/ModelsListView.tsx)
│   │   └── suporta bulk toggle active
│   └── Grid [viewMode default]
│       └── ModelCard (src/components/lm-models/ModelCard.tsx)
└── SplitView (width="lg") [inline, não usa Cockpit dedicado]
    └── dl com campos: Nome, Model ID, Max Tokens
    └── Link "Ver documentação"
    └── Button Excluir
```

### 7.3 Gaps Identificados vs PRD

| # | Gap | Severidade | Detalhes |
|---|-----|-----------|----------|
| M-01 | **Títulos com caracteres sem acentos** | BAIXA | "Gestao 360 de Modelos IA", "Informacoes Gerais", "Documentacao" — faltam acentos. Indicativo de codificação ou digitação manual. |
| M-02 | **SplitView sem Cockpit dedicado** | MÉDIA | O detalhe do modelo é um `div` inline sem componente `Cockpit` dedicado (diferente de AgentTypes, LmProviders, Projetos). Inconsistente. |
| M-03 | **Kanban muda provider_id via drag** | INFO | Arrastar entre colunas do Kanban tenta mudar o `provider_id` do modelo, mas a action (`updateLmModelDisplayOrderAction`) só atualiza `display_order`. É um bug de comportamento — drag não persiste o provider corretamente. |
| M-04 | **KPIs sem clique para filtrar** | BAIXA | Mesma lacuna dos outros módulos CRUD. |

---

## 8. Módulo: Fornecedores IA (CRUD)

### 8.1 Estado Atual

Arquivo principal: `src/app/auxiliares/lm-providers/lm-providers-content.tsx`

Módulo CRUD para fornecedores de LM (OpenAI, Anthropic, etc.). Bem estruturado.

**Layout atual implementado:**
```
DashboardHeader ("Provedores de LM")
Botão "Novo Provedor"
KPIs (3 cards): Total, Ativos, Sistema
Card informativo azul
FilterBar (centralizado, usa FilterBar padrão)
Content (Kanban | Lista)
SplitView → LmProviderCockpit (com lista de modelos)
Dialog criação + Dialog confirmação exclusão
```

### 8.2 Component Tree

```
LmProvidersContent (src/app/auxiliares/lm-providers/lm-providers-content.tsx)
├── DashboardHeader title="Provedores de LM"
├── Button "Novo Provedor"
├── KPIs (grid 1-3)
│   ├── KPICard "Total"
│   ├── KPICard "Ativos"
│   └── KPICard "Sistema"
├── Card informativo (bg-blue-50)
├── FilterBar (moduleId="lm-providers", usa FilterBar padrão)
├── Content [condicional]
│   ├── EmptyState
│   ├── KanbanBoard [viewMode === 'kanban']
│   │   colunas: active | inactive
│   │   onStatusChange → updateLmProviderAction (is_active)
│   └── Lista [viewMode outro]
│       └── LmProviderListItem
└── SplitView (width="lg") → LmProviderCockpit
    └── inclui lista de models do provider (lazy-loaded)
```

### 8.3 Capacidades de Filtro

Baseado em `useLmProvidersFilters` (inferido pelo uso):
- Busca por texto (name, slug)
- ViewToggle (kanban | list)

### 8.4 Gaps Identificados vs PRD

| # | Gap | Severidade | Detalhes |
|---|-----|-----------|----------|
| F-01 | **Título "Provedores de LM" vs "Fornecedores IA"** | BAIXA | Sidebar mostra "Fornecedores IA" mas o DashboardHeader diz "Provedores de LM". Inconsistência terminológica. PRD usa "Fornecedores IA". |
| F-02 | **KPIs sem clique** | BAIXA | Mesma lacuna dos outros módulos CRUD. |
| F-03 | **Trend nos KPICards hardcoded como '0'** | BAIXA | Mesmo padrão de AgentTypes — trends sempre zero. |
| F-04 | **Dialog de criação inline muito longo** | BAIXA | O Dialog de criação tem 7+ campos em scroll. Poderia ser um formulário multi-step ou Sheet lateral mais largo. |

---

## 9. Componentes Compartilhados — Análise

### 9.1 KPICard (`src/components/dashboard/KPICard.tsx`)

**Interface:**
```typescript
interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  subtitle?: string;
  className?: string;
  onClick?: () => void;
  active?: boolean;   // ring visual quando filtro ativo
}
```

**Status:** Bem implementado e extensível. Suporta `onClick` e estado `active` (ring-2 ring-primary).

**Gap:** Trend não é calculado em nenhum módulo (todos passam `'0'`). Remover ou implementar.

### 9.2 KanbanBoard (`src/components/views/KanbanBoard.tsx`)

**Capacidades:**
- Drag-and-drop via `@dnd-kit/core`
- Colunas dinâmicas com `KanbanColumn[]`
- `renderItemContent` customizável
- `onStatusChange` callback (omitir para read-only)
- `selectedId` para highlight
- WIP limit por coluna (`wipLimit`)
- Acessibilidade: `aria-live`, keyboard navigation

**Gap para Cronogramas:** Precisa de adaptação para usar sem `onStatusChange` (read-only Kanban).

### 9.3 SplitView (`src/components/views/SplitView.tsx`)

**Interface:**
```typescript
interface SplitViewProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: 'sm'|'md'|'lg'|'xl'|'2xl'|'3xl'|'4xl'|'wide';
  healthStatus?: 'verde'|'amarelo'|'vermelho';
}
```

**Status:** Completo. Tem escape key, backdrop blur, body scroll lock, animações.

**Uso atual:** `width="wide"` em Projetos e Cronogramas, `width="lg"` em CRUD modules.

### 9.4 FilterBar (`src/components/filters/FilterBar.tsx`)

**Capacidades:**
- Busca com debounce (300ms) + Ctrl+K focus
- Quick filters (Popover para inativo, Badge para ativo)
- Advanced filters em Sheet lateral
- ViewMode toggle (ícones)
- AgendaPeriod selector (Dia/Semana/Mês)
- Reset all filters

**Gap:** Textos internos em inglês ("Click to clear", "Filters", "Reset all filters"). Internacionalizar.

**Uso:** Cronogramas, AgentTypes, LmProviders, ModelsIa usam. Agentes NÃO usa.

### 9.5 DashboardHeader (`src/components/layout/DashboardHeader.tsx`)

Não lido diretamente, mas inferido pelo uso: recebe `title` e `subtitle`.

**Gap identificado:** Não há prop `actions` para botões na direita do header. Módulos CRUD colocam o botão "Criar" fora do componente em um flex wrapper. Adicionar prop `actions?: React.ReactNode` padronizaria o layout.

---

## 10. Plano de Implementação por Prioridade

### Priority 1 — Impacto Alto / Esforço Baixo-Médio

| ID | Mudança | Arquivo(s) | Esforço |
|----|---------|------------|---------|
| C-01 / P-01 | Criar `ErpReadOnlyBanner` e inserir em Cronogramas e Projetos | `src/components/layout/ErpReadOnlyBanner.tsx`, `cronogramas-content.tsx`, `projects-content.tsx` | P |
| C-04 | Fix bug `getWeekStart()` — semana inicia segunda | `src/lib/domain/schedule-status.ts` | XS |
| SB-01 / SB-02 | Renomear grupos Sidebar "Sistema" → "Tecnologia & IA" e "Auxiliares" → "Tabelas Auxiliares" | `src/components/layout/sidebar-config.ts` | XS |
| F-01 | Uniformizar título "Provedores de LM" → "Fornecedores IA" no DashboardHeader | `lm-providers-content.tsx` | XS |
| M-01 | Corrigir acentuação em textos de Modelos IA | `modelos-ia-content.tsx` | XS |

### Priority 2 — Impacto Alto / Esforço Médio

| ID | Mudança | Arquivo(s) | Esforço |
|----|---------|------------|---------|
| C-02 | Implementar Kanban view em Cronogramas (read-only, sem drag) | `cronogramas-content.tsx`, novo `CronogramaKanbanView.tsx`, update `useCronogramasFilters.ts` | M |
| C-03 | Implementar ListView tabular em Cronogramas (substituir card grid) | Novo `CronogramaTableView.tsx`, atualizar `CronogramaList.tsx` | M |
| A-01 | Migrar Agentes para FilterBar padrão + criar `useAgentesFilters` | `agentes-content.tsx`, novo `useAgentesFilters.ts`, novo `src/lib/filters/filters-agentes.ts` | M |
| A-02 | Migrar Kanban de Agentes para `KanbanBoard` component | `agentes-content.tsx` | S |

### Priority 3 — Impacto Médio / Esforço Baixo

| ID | Mudança | Arquivo(s) | Esforço |
|----|---------|------------|---------|
| A-03 / AT-01 / F-02 / M-04 | KPIs clicáveis em Agentes, AgentTypes, LmProviders, ModelsIa | `agentes-content.tsx`, `agent-types-content.tsx`, `lm-providers-content.tsx`, `modelos-ia-content.tsx` | S |
| M-02 | Criar `ModelCockpit` dedicado para detalhe de modelo | Novo `src/components/lm-models/ModelCockpit.tsx`, atualizar `modelos-ia-content.tsx` | S |
| P-03 | Mover botão Sync para fora de FilterBar | `projects-content.tsx`, `ProjectsFilters.tsx` | XS |
| C-08 / FB-01 | Internacionalizar textos internos do FilterBar | `src/components/filters/FilterBar.tsx` | XS |
| DH-01 | Adicionar prop `actions` ao DashboardHeader | `src/components/layout/DashboardHeader.tsx` | S |

### Priority 4 — Decisão de Produto Necessária

| ID | Mudança | Decisão Necessária |
|----|---------|-------------------|
| P-02 | Drag-and-drop em Projetos Kanban | Manter write limitado (fase) ou tornar full read-only? |
| AT-03 | Card informativo colapsável | Manter sempre visível ou permitir dismiss? |

---

## 11. Resumo de Arquivos por Módulo

### Cronogramas
| Arquivo | Tipo | Role |
|---------|------|------|
| `src/app/cronogramas/cronogramas-content.tsx` | Orquestrador | Layout principal e estado |
| `src/app/cronogramas/components/CronogramaCalendar.tsx` | View | MonthView, WeekView, DayView |
| `src/app/cronogramas/components/CronogramaList.tsx` | View | Grid de ActivityCards |
| `src/app/cronogramas/components/CronogramasKPIBar.tsx` | KPIs | 5 KPIs clicáveis |
| `src/app/cronogramas/components/CronogramaCockpit.tsx` | SplitView | ScheduleCockpit + SelectedDayPanel |
| `src/hooks/useCronogramasFilters.ts` | Hook | Estado de filtros, computed fields |
| `src/lib/domain/schedule-status.ts` | Domain | Funções de data, cores (getWeekStart bug) |

### Projetos
| Arquivo | Tipo | Role |
|---------|------|------|
| `src/app/projetos/projects-content.tsx` | Orquestrador | Layout principal, sync handler |
| `src/app/projetos/components/ProjectsKanbanView.tsx` | View | Kanban com drag-and-drop |

### Agentes AI
| Arquivo | Tipo | Role |
|---------|------|------|
| `src/app/agentes/agentes-content.tsx` | Orquestrador | Grid/List/Kanban customizados |

### Auxiliares
| Arquivo | Tipo | Role |
|---------|------|------|
| `src/app/auxiliares/agent-types/agent-types-content.tsx` | Orquestrador | CRUD tipos |
| `src/app/auxiliares/modelos-ia/modelos-ia-content.tsx` | Orquestrador | CRUD modelos |
| `src/app/auxiliares/lm-providers/lm-providers-content.tsx` | Orquestrador | CRUD fornecedores |

### Compartilhados
| Arquivo | Tipo | Role |
|---------|------|------|
| `src/components/dashboard/KPICard.tsx` | Componente | KPI card clicável |
| `src/components/views/KanbanBoard.tsx` | Componente | Board DnD completo |
| `src/components/views/SplitView.tsx` | Componente | Painel lateral modal |
| `src/components/filters/FilterBar.tsx` | Componente | Filtros + Search + ViewToggle |
| `src/components/layout/sidebar-config.ts` | Config | Estrutura de navegação |

---

*Documento gerado por @ux-design-expert (Uma) — Phase 3 Brownfield Discovery*
*Próxima fase: Phase 4 (@architect) — technical-debt-DRAFT.md com plano de refatoração*
