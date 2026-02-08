---
doc-id: CLAUDE-V01-06
title: Mapa de Features e Capacidades
scope: Módulos, rotas, capacidades por feature, componentes-chave
version: 0.1.0
status: draft
last-updated: 2026-02-05
confidence: Alta
depends-on: [03-architecture, 04-database-schema, 14-frontend-patterns]
---

# Mapa de Features e Capacidades

> Fonte: `[ref: src/app/routes.tsx]`, `[ref: src/features/]`

Relacionado: [[03-architecture]] (stack), [[04-database-schema]] (tabelas), [[14-frontend-patterns]] (padrões de componente), [[07-dashboard-kpis]] (KPIs dos dashboards)

---

## Visão Geral dos Módulos

```
┌─────────────────────────────────────────────────────────────┐
│                    Portal Tech Arauz                         │
├──────────┬──────────┬──────────┬──────────┬────────────────┤
│ Dashboard│ Projetos │Solicitaç.│  Admin   │    Outros      │
│ (3 views)│ (Kanban) │(Kanban+) │(APIs,etc)│(Docs,Logs,etc) │
└──────────┴──────────┴──────────┴──────────┴────────────────┘
```

---

## Rotas e Páginas

| Rota | Página | Módulo | Acesso | Lazy |
|---|---|---|---|---|
| `/auth` | Auth | auth | Público | Sim |
| `/` | Dashboard | dashboard | Authenticated | Sim |
| `/dashboard` | Dashboard | dashboard | Authenticated | Sim |
| `/dashboard/tecnologia` | DashboardTecnologia | dashboard | Authenticated | Sim |
| `/dashboard/gestao` | DashboardGestao | dashboard | Authenticated | Sim |
| `/solicitacoes` | Solicitacoes | solicitacoes | Authenticated | Sim |
| `/solicitacoes/erros-duvidas` | SolicitacoesPanel | solicitacoes | Authenticated | Sim |
| `/solicitacoes/melhorias-ajustes` | SolicitacoesPanel | solicitacoes | Authenticated | Sim |
| `/solicitacoes/projetos` | ProjetosPanel | projetos | Authenticated | Sim |
| `/cronogramas` | Cronogramas | solicitacoes | Authenticated | Sim |
| `/documentacoes` | Documentacoes | documentacoes | Authenticated | Sim |
| `/tarefas` | Tarefas | tarefas | Authenticated | Sim |
| `/cadastros/tabelas` | TabelasAuxiliares | admin | Authenticated | Sim |
| `/apis` | APIs | admin/apis | Authenticated | Sim |
| `/automacoes` | Automacoes | admin/automacoes | Authenticated | Sim |
| `/usuarios` | Usuarios | admin/usuarios | Authenticated | Sim |
| `/logs` | Logs | logs | Authenticated | Sim |
| `*` | NotFound | shared | — | Sim |

[ref: src/app/routes.tsx:36-76]

---

## Módulo 1: Dashboard (3 Views)

**Localização**: `src/features/dashboard/`

### Dashboard Geral (`/`)
- **KPIs**: totalAbertas, emAtendimento, resolvidosHoje, resolvidosPeriodo, aguardando, tempoMedioResolucao — ver [[07-dashboard-kpis]] KPI-001 a KPI-007
- **Gráficos**: Solicitações por dia (line), por tipo (pie), por prioridade (pie)
- **Filtro de período**: today / 7days / 30days / month
- **Listagem**: 5 solicitações recentes
- **Drill-down**: Click em KPI card filtra por status

### Dashboard Gestão (`/dashboard/gestao`)
- **KPIs**: SLA (tempo médio, taxa no prazo, satisfação), comparativo mensal — ver [[07-dashboard-kpis]] KPI-008 a KPI-016
- **Foco**: Visão gerencial com tendências e comparativos

### Dashboard Tecnologia (`/dashboard/tecnologia`)
- **KPIs**: APIs ativas, sincronizações hoje, erros 24h, uptime médio — ver [[07-dashboard-kpis]] KPI-011 a KPI-014
- **Status de integrações**: Card por API com uptime individual
- **Logs recentes**: Últimas 5 execuções com auto-refresh (30s)

**Hooks**: useDashboardStats, useSLAMetrics, useGestaoStats, useTechDashboardStats, useIntegrationStatus, useRecentSyncLogs, useSolicitacoesPorDia, useSolicitacoesPorTipo, useSolicitacoesPorPrioridade, useRecentSolicitacoes, useSolicitacoesByStatus

---

## Módulo 2: Projetos (`/solicitacoes/projetos`)

**Localização**: `src/features/projetos/`

### Capacidades
- **Kanban Board**: Colunas por etapa (projetos_etapas_kanban), cards com info do projeto
- **List View**: Tabela alternativa ao kanban
- **Filtros**: Busca por código/título, filtro por status, prioridade, tipo de assunto
- **Toggle de view**: Kanban ↔ Lista (persisted em localStorage)
- **Detalhe (Sheet)**: Abas — Detalhes, Entregas, Cronograma, Requisitos
- **Status badges**: Cor por status (Futuro=blue, Aprovação=amber, Desenvolvimento=purple, etc.)
- **Prioridade badges**: Urgente=red, Alta=orange, Normal=blue, Baixa=gray
- **Última sync**: Exibe timestamp da última sincronização
- **Mutações**: Alterar etapa kanban (useUpdateProjetoEtapa), alterar status (useUpdateProjetoStatus)

### Componentes
- ProjetosPanel (página principal)
- ProjetoKanbanBoard + ProjetoKanbanColumn
- ProjetoListView
- ProjetoDetailSheet (com tabs)
- ProjetoFilters

### Hooks
- useProjetos, useProjeto(id), useEntregasProjeto(id), useCronogramasProjeto(id), useRequisitosProjeto(id)
- useCronogramasProjetos (todos), useProjetosStatus, useProjetosEtapasKanban
- useUpdateProjetoEtapa, useUpdateProjetoStatus

[ref: src/features/projetos/]

---

## Módulo 3: Solicitações

**Localização**: `src/features/solicitacoes/`

### Capacidades
- **Kanban**: Colunas por etapa_kanban, filtros avançados
- **Lista**: DataTable com ordenação, busca, filtros
- **Painéis separados**: erros-duvidas e melhorias-ajustes (mesma SolicitacoesPanel, dados filtrados)
- **Cronogramas**: Timeline/Gantt dos cronogramas de solicitações
- **Detalhe (Sheet)**: Informações completas, entregas, cronogramas, requisitos, interações

### Hooks
- useSolicitacoes, useLookupTables

### Schemas
- Validação Zod com testes unitários

[ref: src/features/solicitacoes/]

---

## Módulo 4: Admin — APIs (`/apis`)

**Localização**: `src/features/admin/apis/`

### Capacidades
- **Grid de cards**: 3 colunas responsivo, card por API
- **CRUD completo**: Criar, editar, excluir APIs
- **Tipos**: espaider, rest, webhook, custom
- **Recursos**: projetos, entregas, cronogramas, requisitos, solicitacoes
- **Auth types**: Bearer, QueryParam, ApiKey, Basic, None
- **Token mascarado**: Exibido como `****` via apis_safe view
- **Teste de conexão**: Botão "Testar" invoca edge function test-api
- **Sincronização manual**: Botão "Sincronizar" (só tipo espaider) invoca sync-espaider
- **Ativo/Inativo**: Toggle visual + funcional

### Hooks
- useApis, useApi(id), useCreateApi, useUpdateApi, useDeleteApi
- useTestApiConnection, useSyncApi

[ref: src/features/admin/apis/]

---

## Módulo 5: Admin — Tabelas Auxiliares (`/cadastros/tabelas`)

**Localização**: `src/features/admin/tabelas-auxiliares/`

### Capacidades
- CRUD de todas as lookup tables: status, prioridades, tipos, categorias, areas, etapas_kanban
- Configuração de cor, ordem, código_externo (para mapeamento API)
- Toggle ativo/inativo

---

## Módulo 6: Admin — Automações e Usuários

- **Automações** (`/automacoes`): Gestão de jobs, ativar/desativar, execução manual
- **Usuários** (`/usuarios`): Gestão de perfis e papéis (admin/user/viewer)

---

## Módulo 7: Documentações (`/documentacoes`)

**Localização**: `src/features/documentacoes/`

### Capacidades
- CRUD com editor Markdown
- Categorização
- Listagem e visualização

---

## Módulo 8: Logs (`/logs`)

**Localização**: `src/features/logs/`

### Capacidades
- Tabela de logs_execucao com linhas expansíveis
- Detalhes técnicos (JSON) visíveis para admin
- Sanitização para usuários não-admin via logs_execucao_safe — ver [[12-security-rbac]]
- Métricas por execução: processados, novos, atualizados, erros, duração

---

## Módulo 9: Tarefas de Sincronização (`/tarefas`)

**Localização**: `src/features/tarefas/`

### Capacidades
- Listagem de tarefas_sincronizacao
- Configuração de frequência, horário, cron
- Link com API fonte
- Status de próxima execução

---

## Decisões Pendentes

> [!question] Q-FEAT-001: Painéis de solicitações
> `/solicitacoes/erros-duvidas` e `/solicitacoes/melhorias-ajustes` usam o mesmo componente SolicitacoesPanel. Como é feita a filtragem? Por tipo? Por categoria? Verificar lógica do componente.

> [!question] Q-FEAT-002: Drag-and-drop no Kanban de projetos
> O DND Kit está no package.json mas o uso no Kanban de projetos precisa ser verificado. O `useUpdateProjetoEtapa` existe, mas o wiring de drag events pode estar incompleto.
