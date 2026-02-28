# Module Engineering and UX Standards (Projects Baseline)

Data da analise: 2026-02-26
Baseline de referencia: modulo `projetos`

## 1. Objetivo

Definir um padrao unico para criar novas tabelas, modulos e paginas com consistencia de engenharia, UX e arquitetura, para uso humano e por agentes AI.

## 2. Evidencias do baseline (projetos)

Arquitetura validada observada:

- Server page com auth + fetch + transform: `src/app/projetos/page.tsx`
- Client content rico com KPIs, filtros, Kanban/Lista e detalhe lateral: `src/app/projetos/projects-content.tsx`
- Componentes base reutilizados:
  - `src/components/layout/DashboardHeader.tsx`
  - `src/components/dashboard/KPICard.tsx`
  - `src/components/filters/FilterBar.tsx`
  - `src/components/views/KanbanBoard.tsx`
  - `src/components/views/ProjectListView.tsx`
  - `src/components/views/SplitView.tsx`

## 3. Blueprint obrigatorio para novo modulo

### 3.1 Camada de dados (tabela)

Nova tabela deve seguir padrao multi-tenant:

- `id uuid` como PK
- `tenant_id uuid` com FK para `tenants(id)`
- `created_at` e `updated_at`
- indices por `tenant_id` e campos de listagem/filtro
- RLS habilitado com policy por `tenant_id = get_user_tenant_id()`
- unique composto por tenant quando necessario (ex.: `(tenant_id, slug)`)

### 3.2 Camada de pagina (server)

Cada modulo deve ter `page.tsx` server-side com:

1. `createClient()`
2. `supabase.auth.getUser()`
3. `redirect('/login')` sem usuario
4. query principal com dados relacionais necessarios
5. transformacao DB -> UI quando houver diferenca de schema
6. render de `*-content.tsx` client

### 3.3 Camada client (conteudo do modulo)

Estrutura minima:

1. `DashboardHeader` no topo (padrao sticky global)
2. bloco de KPIs no topo da area de conteudo
3. `FilterBar` padronizado (busca + filtros + view toggle)
4. area de visualizacao (`KanbanBoard`, lista e/ou grid)
5. `SplitView` para detalhe do registro selecionado
6. `Dialog` para criar/editar registro

### 3.4 Estado e filtros

- Usar hook `use<Modulo>Filters` com `useFilterState`
- Manter `filterRegistry` do modulo em `src/lib/filters/*`
- Evitar filtro local paralelo fora do registry (single source of truth)

## 4. Padrao de design por componente (obrigatorio)

## 4.1 Kanban padrao

- Usar `KanbanBoard` como base unica de DnD
- Colunas orientadas ao contexto do modulo (nao hardcode generico)
- Card visual padrao com:
  - titulo e identificador
  - badges de status/prioridade
  - metadados contextuais do modulo
- Clique no card abre detalhe no `SplitView`

## 4.2 Dashboard topo padrao

- Sempre no topo da pagina de modulo
- KPIs com `KPICard` e grid responsivo
- KPI clicavel deve filtrar resultado quando aplicavel
- Lista deve refletir o mesmo recorte dos KPIs/filtros

## 4.3 Visualizacao em lista padrao

- Lista em `Card` com tabela responsiva (desktop + mobile)
- Ordenacao por colunas chave
- Estados padrao: loading, vazio, sem resultado, erro
- Selecao de linha abre `SplitView` no mesmo comportamento do Kanban

## 4.4 Filtros padrao

- `FilterBar` no topo da area de listagem
- Busca global + quick filters + filtros avancados
- Atalhos e reset de filtros padronizados
- Filtros devem ser contextuais ao modulo, sem ruido de outros dominios

## 4.5 Cards de criacao, edicao e visualizacao

- Criar/editar: `Dialog` com validacao e feedback (`toast`)
- Visualizar: `SplitView` + componente `*Cockpit`
- Excluir: confirmar com componente UI dedicado (evitar `confirm()` nativo)

## 4.6 Posicionamento padrao de elementos

- Header global: titulo/subtitulo + controles globais (tema/notificacoes)
- Area de modulo:
  - linha 1: KPIs
  - linha 2: filtros + acoes secundarias (ex.: sync)
  - linha 3: Kanban/Lista/Grid
  - lateral: detalhe (`SplitView`)
- CTA primaria ("Novo ...") no topo a direita da area do modulo

## 5. Gaps atuais identificados (fornecedores/modelos)

Atualização após Story 2.7 (alinhamento de auxiliares ao baseline):

1. `modelos-ia` foi alinhado ao baseline com `FilterBar` controlado, filtros centralizados, CRUD básico de create/delete e feedback async padronizado.
2. `lm-providers` foi alinhado com confirmação de exclusão via `Dialog` (sem `confirm()` nativo) e quick filters de status/origem.
3. ✅ `agent-types` — gap resolvido na Story 2.7: substituído `confirm()` nativo por Dialog de confirmação padronizado; conteúdo decomposto em subcomponentes (`AgentTypeListItem`, `AgentTypeFormDialog`); arquivo reduzido de 771 para ~290 linhas.
4. Gap residual: módulos auxiliares ainda repetem parte do scaffold manual e podem evoluir para um layout base compartilhado (próxima oportunidade de refactor).

## 6. Checklist de entrega para novos modulos (gate de workflow)

Antes de concluir qualquer story de novo modulo/tabela:

- [ ] Tabela criada com `tenant_id`, RLS e indices essenciais
- [ ] `page.tsx` server com auth guard e query principal
- [ ] `*-content.tsx` com DashboardHeader + KPIs + FilterBar + view principal
- [ ] Kanban e Lista seguindo componentes base compartilhados
- [ ] SplitView + Cockpit para detalhes
- [ ] Dialog de criacao/edicao com validacao e feedback padrao
- [ ] Estados de loading, vazio, erro e sem resultado cobertos
- [ ] Filtros centralizados em hook/registry do modulo
- [ ] Checklist e file list da story atualizados

## 8. Data Fetching Obrigatorio por Tipo de Operacao

Todo novo modulo ou feature DEVE seguir os padroes definidos em [data-fetching-patterns.md](./data-fetching-patterns.md).

Resumo normativo:

| Tipo de Operacao | Padrao Obrigatorio |
|-----------------|-------------------|
| Leitura para renderizacao inicial (SSR) | Server Component + Query Supabase direta |
| Mutacao / CRUD autenticado | Server Action |
| Chamada a servico externo (AI, Espaider, webhooks) | API Route |
| Estado real-time ou dual source | Client Service (Zustand) — requer aprovacao arquitetural |

**Regra de ouro:** Comece sempre pelo padrao mais simples. Adicione complexidade apenas com justificativa tecnica documentada na story.

ADR de referencia: [ADR-005 — Data Fetching Patterns Formais](./adr/ADR-005-data-fetching-patterns.md)

## 7. Politica para agentes AI

Agentes devem tratar este documento como padrao normativo para qualquer feature de:

- nova tabela
- novo modulo/pagina
- refactor de modulo existente

Se houver excecao de contexto, a excecao deve ser documentada na story com justificativa tecnica.
