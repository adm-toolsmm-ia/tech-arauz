-- ============================================================
-- Migration 049: Seed initial documentation documents
-- Epic 8 / Story 8.11 — Seed de Documentação Inicial
-- ============================================================
-- Note: Replace <TENANT_ID> with the actual tenant UUID before running.
-- Example: SELECT id FROM public.tenants WHERE slug = 'arauz';
-- ============================================================

DO $$
DECLARE
  v_tenant_id UUID;
BEGIN
  -- Auto-detect the tenant (works for single-tenant setup)
  SELECT id INTO v_tenant_id FROM public.tenants LIMIT 1;

  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'No tenant found. Please ensure the tenants table has at least one row.';
  END IF;

  -- ── 1. Manual: Dashboard de Projetos ──────────────────────
  INSERT INTO public.documents (tenant_id, title, slug, content_md, category, is_published)
  VALUES (
    v_tenant_id,
    'Manual — Dashboard de Projetos',
    'manual-dashboard-projetos',
    E'# Manual — Dashboard de Projetos\n\n> **Visão Executiva** — Para Diretoria e CTO\n\n## Objetivo\n\nO Dashboard de Projetos responde duas perguntas centrais para a liderança:\n\n- *"Estamos investindo nas coisas certas?"*\n- *"Estamos dentro do orçamento e do prazo?"*\n\n---\n\n## KPIs Disponíveis\n\n| KPI | O que mede | Fonte de Dados |\n|-----|-----------|---------------|\n| **Total de Projetos** | Quantidade total cadastrada | `projects` |\n| **Em Execução** | Projetos ativos (inclui Homologação e Produção) | `projects.status` |\n| **Concluídos** | Projetos finalizados com trend mensal | `projects.data_encerramento` |\n| **Atrasados** | Projetos fora do prazo + maior atraso em dias | `projects.prazo_final` |\n| **Orçamento (Capex/Opex)** | Valor consolidado de todos os orçamentos | `project_budgets.value` |\n| **Projetos Estratégicos** | Projetos ativos com Impacto Estratégico "Alto" | `projects.impacto_estrategico` |\n| **Risco Executivo** | % de atraso cruzado com projetos de Importância Especial | Calculado |\n\n---\n\n## Gráficos\n\n### Pipeline de Status\nDistribuição dos projetos por status em barras. Identifica onde estão concentrados os projetos.\n\n### Carga por Responsável\nProjetos atribuídos a cada responsável. Detecta concentração de carga e risco de gargalo.\n\n### Matriz de Esforço x Impacto\nGráfico de dispersão onde cada ponto é um projeto:\n- **Eixo X**: Complexidade Técnica\n- **Eixo Y**: Impacto Estratégico\n\nQuadrantes:\n- 🟢 **Quick Wins**: Alto impacto, baixa complexidade — priorizar\n- 🟡 **Estratégicos**: Alto impacto, alta complexidade — planejar bem\n- 🔴 **Time Wasters**: Baixo impacto, alta complexidade — revisar\n- ⚪ **Fillers**: Baixo impacto, baixa complexidade — fazer quando possível\n\n---\n\n## Interatividade\n\nClique em qualquer KPI para **filtrar** a lista de projetos abaixo.\nClique em um projeto para abrir a **Visão 360°** (Cockpit) com:\n- Cronogramas\n- Entregas\n- Histórico de movimentações\n- Aprovadores',
    'manual',
    true
  )
  ON CONFLICT (tenant_id, slug) DO NOTHING;

  -- ── 2. Manual: Dashboard de Operações ─────────────────────
  INSERT INTO public.documents (tenant_id, title, slug, content_md, category, is_published)
  VALUES (
    v_tenant_id,
    'Manual — Dashboard de Operações',
    'manual-dashboard-operacoes',
    E'# Manual — Dashboard de Operações\n\n> **Visão de Fluxo** — Para CTO e Líderes de Engenharia\n\n## Objetivo\n\nO Dashboard de Operações identifica **gargalos sistêmicos**, mede a **vazão da equipe (Throughput)** e detecta **sobrecarga operacional** antes que ela vire problema.\n\n---\n\n## KPIs Disponíveis\n\n| KPI | O que mede | Limite / Alerta |\n|-----|-----------|----------------|\n| **Projetos no Funil** | Total de projetos ativos na esteira | — |\n| **Aprovação Pendente** | Projetos aguardando aprovação | > 0 = atenção |\n| **Sobrecarga (WIP)** | Pessoas com mais de 3 projetos ativos simultaneamente | > 3 = alerta |\n| **Lead Time Médio** | Média de dias do início ao encerramento | — |\n\n---\n\n## Conceitos\n\n### WIP (Work in Progress)\n\nLimite saudável: **3 projetos ativos por pessoa**.\n\nQuando uma pessoa ultrapassa esse limite, o risco de erros e atrasos aumenta exponencialmente. O KPI de Sobrecarga mostra **quantas pessoas** estão acima do limite.\n\n### Lead Time\n\nCalculado a partir da **primeira movimentação no histórico** (ou data de criação) até o **encerramento** do projeto.\n\nFórmula: `Lead Time = data_encerramento - data_primeira_movimentação`\n\n---\n\n## Gráficos\n\n### Pipeline de Status\nDistribuição por status da visão operacional. Mostra onde está o fluxo mais denso.\n\n### Histórico e Produtividade\n*(Em desenvolvimento)* — Movimentações por semana/mês por responsável.',
    'manual',
    true
  )
  ON CONFLICT (tenant_id, slug) DO NOTHING;

  -- ── 3. Arquitetura: Dashboards ────────────────────────────
  INSERT INTO public.documents (tenant_id, title, slug, content_md, category, is_published)
  VALUES (
    v_tenant_id,
    'Arquitetura Técnica — Dashboards',
    'arquitetura-tecnica-dashboards',
    E'# Arquitetura Técnica — Dashboards\n\n## Visão Geral\n\nOs dashboards seguem a **arquitetura AIOS** com separação clara de responsabilidades entre Server Components e Client Components.\n\n---\n\n## Fluxo de Dados\n\n```\nSupabase (DB)\n    └─> page.tsx (Server Component)\n            ├─> Busca dados com supabase-js\n            ├─> Transforma via dbProjectToUI()\n            └─> Passa props para *-content.tsx\n                    └─> *-content.tsx (Client Component)\n                            ├─> React.useMemo() para KPIs\n                            ├─> computeDashboardKpis()\n                            └─> Renderiza gráficos (Recharts)\n```\n\n---\n\n## Camadas\n\n### 1. Camada de Dados (Supabase)\n- Tabela principal: `projects`\n- Relacionamentos: `project_histories`, `project_budgets`, `project_approvers`, `project_schedules`\n- RLS: Todo acesso filtrado por `tenant_id`\n\n### 2. Transformadores (`lib/transformers/project.ts`)\n- `DBProject` → `UIProject`: Normaliza status, datas e campos do Espaider\n- `dbProjectToUI()`: Função principal de transformação\n\n### 3. Camada de Domínio (`lib/domain/`)\n- `kpi-calculations.ts`: Funções puras para KPIs (testável, sem side effects)\n- `project-health.ts`: Regras de atraso e saúde de projetos\n- `project-priority.ts`: Regras de prioridade\n\n### 4. Componentes de Gráfico (`components/charts/`)\n- Barrel export em `charts/index.ts`\n- Usa **Recharts** com tokens CSS do design system (`hsl(var(--primary))`)\n- Componentes: `ProjectPipelineChart`, `ResponsibleWorkloadChart`, `ProjectImpactMatrix`\n\n---\n\n## Performance\n\n- **Server-side fetch**: Dados buscados no servidor, sem waterfall no cliente\n- **`React.useMemo`**: KPIs e dados de gráfico memoizados por dependência\n- **Dynamic imports**: `html2pdf.js` carregado apenas quando necessário\n\n---\n\n## Segurança\n\n- Auth check em todas as `page.tsx` com redirect para `/login`\n- RLS ativo — usuários não veem dados de outros tenants\n- Server Actions com verificação de role antes de qualquer mutação',
    'arquitetura',
    true
  )
  ON CONFLICT (tenant_id, slug) DO NOTHING;

  -- ── 4. Guia: Glossário ────────────────────────────────────
  INSERT INTO public.documents (tenant_id, title, slug, content_md, category, is_published)
  VALUES (
    v_tenant_id,
    'Glossário de Termos',
    'glossario-de-termos',
    E'# Glossário de Termos\n\nReferência rápida de termos usados nos dashboards e operações do portal Araúz.\n\n---\n\n## KPIs e Métricas\n\n| Termo | Definição |\n|-------|-----------|\n| **KPI** | Key Performance Indicator — Indicador-chave de desempenho que mede o progresso em relação a um objetivo. |\n| **Lead Time** | Tempo total de um projeto do início ao fim (encerramento). Medido em dias. |\n| **Cycle Time** | Tempo de trabalho ativo em uma tarefa, excluindo tempo de espera. |\n| **Throughput** | Vazão — Quantidade de projetos ou entregas concluídas por período (semana/mês). |\n| **WIP** | Work in Progress — Quantidade de projetos em andamento simultâneo por pessoa. Limite saudável: 3. |\n| **SLA** | Service Level Agreement — Acordo de nível de serviço com prazo definido. |\n\n---\n\n## Classificações de Projeto\n\n| Termo | Definição |\n|-------|-----------|\n| **Impacto Estratégico** | Nível de impacto do projeto nos objetivos estratégicos da empresa (Alto / Médio / Baixo). |\n| **Importância Especial** | Flag booleano indicando projetos prioritários para a Diretoria. |\n| **Complexidade Técnica** | Nível de complexidade técnica de execução (Alta / Média / Baixa). |\n| **Quick Win** | Projeto com alto impacto e baixa complexidade — deve ser priorizado. |\n| **Time Waster** | Projeto com baixo impacto e alta complexidade — deve ser revisado ou cancelado. |\n\n---\n\n## Financeiro\n\n| Termo | Definição |\n|-------|-----------|\n| **Capex** | Capital Expenditure — Investimento em ativos (desenvolvimento, infraestrutura). |\n| **Opex** | Operational Expenditure — Custo operacional recorrente (licenças, suporte). |\n| **Orçamento Consolidado** | Soma de todos os valores dos orçamentos vinculados aos projetos ativos. |\n\n---\n\n## Risco\n\n| Termo | Definição |\n|-------|-----------|\n| **Risco Executivo** | Indicador calculado cruzando atrasos com projetos de Importância Especial. Quanto maior, maior a exposição da Diretoria. |\n| **Projeto Atrasado** | Projeto ativo com prazo final vencido (`prazo_final < hoje`). |\n| **Sobrecarga (WIP)** | Pessoa com mais de 3 projetos ativos simultaneamente — risco de gargalo. |',
    'guia',
    true
  )
  ON CONFLICT (tenant_id, slug) DO NOTHING;

  RAISE NOTICE 'Seed concluído: 4 documentos inseridos para tenant %', v_tenant_id;
END$$;
