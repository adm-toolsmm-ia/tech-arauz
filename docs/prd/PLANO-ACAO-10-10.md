# Plano de Acao 10/10 — UX/UI, Design System, Engenharia e Arquitetura

Data: 2026-02-27
Versao: 1.0
Base: Brownfield Discovery (2026-02-26) + Auditoria Profunda do Codigo (2026-02-27)
Gate: PENDENTE APROVACAO

---

## 1. Executive Summary

O Tech Arauz possui uma **base solida** com stack moderna (Next.js 14, Supabase, shadcn/ui, React Query) e um brownfield discovery completo ja executado. O epic TD-EPIC-01 (3 stories de debito tecnico) foi concluido com sucesso.

**Porem, para nota 10/10, existem gaps significativos em 6 dimensoes:**

| Dimensao | Nota Atual | Nota Alvo | Gap |
|----------|-----------|-----------|-----|
| Design System & Tokens | 7/10 | 10/10 | Documentacao, catalogo, semântica |
| UX/UI Patterns & Consistency | 5/10 | 10/10 | Componentes gigantes, a11y, jornadas |
| Engenharia Frontend | 6/10 | 10/10 | Modularidade, ErrorBoundary, testes |
| Data Layer & Architecture | 6/10 | 10/10 | Padrao unico, domain extraction |
| Testing & Quality Gates | 7/10 | 10/10 | Cobertura ampla, a11y tests |
| AI Context & Efficiency | 6/10 | 10/10 | Documentacao para agentes, patterns |

**Investimento estimado**: ~180-220 horas
**Impacto**: Portal de classe enterprise com UX previsivel, engenharia sustentavel e maximo aproveitamento de AI

---

## 2. Diagnostico Detalhado — O que Funciona vs O que Falta

### 2.1 O que JA FUNCIONA (strengths)

| Area | Evidencia | Score |
|------|-----------|-------|
| Design tokens (Tailwind + CSS vars) | 158 linhas em tailwind.config + 421 linhas em globals.css + dark mode | Maduro |
| 25 componentes UI base (shadcn/ui) | Biblioteca completa com primitivos Radix | Solido |
| Sistema de filtros (4 camadas) | types → registry → hooks → components, 7 modulos | Excelente |
| CI pipeline completo | lint + typecheck + format + test + RLS audit + build | Completo |
| AI proxy com JWT forwarding | Auth + role check + session forwarding | Bem estruturado |
| Server Actions (5 modulos) | Projects, LM models, agent types, LM providers, sync | Funcional |
| Toast/Notificacoes (Sonner) | 14 arquivos, componentes dedicados, store, testes | Maduro |
| Dark mode | CSS vars + hook + duplo seletor | Funcional |
| Loading skeletons customizados | KPI, Kanban card, Table row | Parcial |
| Domain logic extraction | 3 arquivos (health, priority, phase) | Iniciado |
| 19 arquivos de teste | Domain, hooks, API routes, contracts, security | Moderado |

### 2.2 GAPS CRITICOS (o que impede o 10/10)

#### GAP-1: Componentes Monoliticos (CRITICO)
- `cronogramas-content.tsx`: **1.263 linhas** — KPIs + filtros + calendario + logica de dominio em 1 arquivo
- `projects-content.tsx`: **1.161 linhas** — mesma situacao
- `agent-types-content.tsx`: **770 linhas** — borderline
- `lm-providers-content.tsx`: **656 linhas** — borderline
- **Impacto**: Velocidade de evolucao UX ~50% menor, risco alto de regressao, AI menos eficiente

#### GAP-2: Zero ErrorBoundary (CRITICO)
- Nenhum `ErrorBoundary` em toda a aplicacao
- Erro de render do React = tela branca para o usuario
- **Impacto**: UX catastrofica em cenarios de erro, sem recovery declarativo

#### GAP-3: Acessibilidade Sem Baseline (ALTO)
- 55 ocorrencias de `aria-*` em 18 arquivos (baixa cobertura)
- Zero testes de a11y automatizados (sem axe-core, pa11y, lighthouse CI)
- Sem checklist de a11y no PR template
- **Impacto**: Barreiras para usuarios com deficiencia, risco legal, UX incompleta

#### GAP-4: Domain Logic Dispersa (ALTO)
- Apenas 95 linhas extraidas para `src/lib/domain/` (health, priority, phase)
- Cronogramas, agentes, LM: zero extracao de dominio
- Calculos duplicados entre dashboard e projetos
- **Impacto**: Inconsistencia de regras, impossibilidade de testar dominio isolado

#### GAP-5: Data Layer Heterogeneo (MEDIO)
- 3 padroes coexistindo: Server Actions + API Routes + Client Services
- Sem contrato formal de quando usar qual padrao
- Agent layer com dual source (API service + Supabase)
- **Impacto**: Confusao de onboarding, debugging mais lento, feedback de loading/erro inconsistente

#### GAP-6: Testes Insuficientes para Componentes Criticos (MEDIO)
- cronogramas-content (1.263 linhas): **zero testes**
- agent-types-content (770 linhas): **zero testes**
- lm-providers-content (656 linhas): **zero testes**
- Server Actions (962 linhas, 5 arquivos): **zero testes**
- FilterBar + FilterControl (895 linhas): **zero testes**
- **Impacto**: Refatoracao arriscada, regressao silenciosa

#### GAP-7: Design System Sem Documentacao (MEDIO)
- Tokens definidos apenas em codigo (tailwind.config + globals.css)
- Sem `docs/design-system.md` ou catalogo de componentes
- Sem Storybook ou equivalente
- Sem guia de microinteracoes para sync, save, erro
- **Impacto**: Inconsistencia visual entre desenvolvedores, AI sem referencia de design

#### GAP-8: Jornadas por Persona Nao Formalizadas (MEDIO)
- Nenhuma documentacao de fluxo por persona (diretoria, operacao, admin)
- Decisoes de UX tomadas por intuicao, nao por design
- **Impacto**: Features desalinhadas com necessidades reais

#### GAP-9: Feedback Async Sem Padrao Unico (BAIXO-MEDIO)
- Toast para tudo (global e local)
- Sem padrao de estado idle/loading/success/error por operacao
- Sem retry guidado
- **Impacto**: Experiencia fragmentada

#### GAP-10: Dual Dark Mode Selectors (BAIXO)
- `.dark` class em globals.css vs `[data-theme='dark']` em dark-mode.css
- Potencial mismatch de estilos
- **Impacto**: Bugs visuais edge-case no dark mode

---

## 3. Plano de Acao — Roadmap para 10/10

### Estrutura: 4 Epics, 12 Stories, 4 Sprints

```
EPIC-UX-01: Design System & UX Foundation (Sprint 1)
  ├── Story UX-1.1: Documentar design system e tokens
  ├── Story UX-1.2: Criar ErrorBoundary e padroes de estado
  └── Story UX-1.3: Formalizar jornadas por persona

EPIC-UX-02: Component Decomposition & Domain (Sprint 2)
  ├── Story UX-2.1: Decompor cronogramas-content (1.263→5-7 arquivos)
  ├── Story UX-2.2: Decompor projects-content (1.161→5-7 arquivos)
  ├── Story UX-2.3: Extrair domain logic completa
  └── Story UX-2.4: Alinhar auxiliares ao baseline

EPIC-UX-03: Accessibility & Quality (Sprint 3)
  ├── Story UX-3.1: Baseline de acessibilidade (WCAG 2.1 AA)
  ├── Story UX-3.2: Testes de componentes criticos
  └── Story UX-3.3: Padronizar feedback async

EPIC-UX-04: Data Layer & AI Optimization (Sprint 4)
  ├── Story UX-4.1: Formalizar data fetching patterns
  └── Story UX-4.2: Otimizar contexto AI e documentacao para agentes
```

---

## 4. Detalhamento por Epic

### EPIC-UX-01: Design System & UX Foundation (Sprint 1)

**Objetivo**: Criar a base documentada e os guardrails que vao guiar todas as demais melhorias.

#### Story UX-1.1: Documentar Design System e Tokens
**Esforco**: 16h | **Impacto**: Alto

Acceptance Criteria:
- [ ] Criar `docs/design-system.md` com catalogo completo de tokens (cores, tipografia, espacamento, sombras, animacoes)
- [ ] Documentar paleta semantica: status, prioridade, tipo, chart
- [ ] Documentar padroes de componentes: quando usar Card, Dialog, Sheet, Toast, Skeleton
- [ ] Criar mapa visual de layout padrao por modulo (ref: module-standards.md)
- [ ] Incluir guia de microinteracoes: estados de loading, success, error, empty
- [ ] Documentar padroes de dark mode (resolver dual selector .dark vs [data-theme])
- [ ] Consolidar dark-mode.css dentro de globals.css (eliminar duplicidade)

#### Story UX-1.2: Criar ErrorBoundary e Padroes de Estado
**Esforco**: 12h | **Impacto**: Critico

Acceptance Criteria:
- [ ] Criar `src/components/error/ErrorBoundary.tsx` com fallback UI amigavel
- [ ] Criar `src/components/error/ErrorFallback.tsx` com opcao de retry
- [ ] Aplicar ErrorBoundary no root layout (`src/app/layout.tsx`)
- [ ] Aplicar ErrorBoundary granular em cada content component (dashboard, projetos, cronogramas)
- [ ] Criar `src/app/error.tsx` (Next.js App Router error page)
- [ ] Criar `src/app/not-found.tsx` (404 customizado)
- [ ] Definir padrao de estado por operacao: `idle | loading | success | error` (type compartilhado)
- [ ] Criar hook `useAsyncOperation` com retry e estado padronizado

#### Story UX-1.3: Formalizar Jornadas por Persona
**Esforco**: 10h | **Impacto**: Medio-Alto

Acceptance Criteria:
- [ ] Criar `docs/ux/personas.md` com 3 personas: Diretoria, Operacao, Admin
- [ ] Mapear jornada principal de cada persona (entry point → goal → steps → exit)
- [ ] Identificar pontos de dor por persona no fluxo atual
- [ ] Definir metricas de sucesso por jornada (ex: "Diretoria → ver KPI em <3 cliques")
- [ ] Priorizar gaps de UX por impacto na jornada

---

### EPIC-UX-02: Component Decomposition & Domain (Sprint 2)

**Objetivo**: Quebrar monolitos em componentes testáveis e extrair lógica de domínio.

#### Story UX-2.1: Decompor cronogramas-content (1.263 linhas)
**Esforco**: 24h | **Impacto**: Alto

Acceptance Criteria:
- [ ] Extrair `CronogramasKPIBar.tsx` (bloco de KPIs)
- [ ] Extrair `CronogramaCalendar.tsx` (visualizacao de calendario)
- [ ] Extrair `CronogramaList.tsx` (visualizacao em lista)
- [ ] Extrair `CronogramaFilters.tsx` (wrapper de filtros do modulo)
- [ ] Extrair `CronogramaCockpit.tsx` (detalhe lateral)
- [ ] `cronogramas-content.tsx` deve ter max 150-200 linhas (orquestracao apenas)
- [ ] Extrair logica de dominio para `src/lib/domain/schedule-*`
- [ ] Manter funcionalidade identica (zero breaking changes)
- [ ] Adicionar testes de regressao para fluxos criticos

#### Story UX-2.2: Decompor projects-content (1.161 linhas)
**Esforco**: 24h | **Impacto**: Alto

Acceptance Criteria:
- [ ] Extrair `ProjectsKPIBar.tsx` (bloco de KPIs)
- [ ] Extrair `ProjectsListView.tsx` (grid com 9 colunas)
- [ ] Extrair `ProjectsKanbanView.tsx` (kanban board)
- [ ] Extrair `ProjectsFilters.tsx` (wrapper de filtros do modulo)
- [ ] Extrair logica de dominio restante para `src/lib/domain/project-*`
- [ ] `projects-content.tsx` deve ter max 150-200 linhas
- [ ] Manter funcionalidade identica
- [ ] Adicionar testes de regressao

#### Story UX-2.3: Extrair Domain Logic Completa
**Esforco**: 16h | **Impacto**: Alto

Acceptance Criteria:
- [ ] Criar `src/lib/domain/schedule-status.ts` (calculos de atraso de cronograma)
- [ ] Criar `src/lib/domain/schedule-kpi.ts` (KPIs de cronogramas)
- [ ] Criar `src/lib/domain/agent-rules.ts` (regras de validacao de agentes)
- [ ] Criar `src/lib/domain/lm-provider-rules.ts` (regras de providers)
- [ ] Criar `src/lib/domain/kpi-calculations.ts` (calculos de KPI compartilhados dashboard/projetos)
- [ ] Garantir que dashboard e projetos usam MESMA funcao de KPI (zero duplicacao)
- [ ] Adicionar testes unitarios para CADA modulo de dominio (100% cobertura de domain)
- [ ] Remover calculos inline dos content components

#### Story UX-2.4: Alinhar Auxiliares ao Baseline
**Esforco**: 8h | **Impacto**: Medio

Acceptance Criteria:
- [ ] Migrar `agent-types-content.tsx` de `confirm()` nativo para Dialog (ref: module-standards.md gap #3)
- [ ] Reduzir `agent-types-content.tsx` de 770 para ~400 linhas (extrair subcomponentes)
- [ ] Reduzir `lm-providers-content.tsx` de 656 para ~350 linhas
- [ ] Verificar que todos os auxiliares seguem FilterBar padrao
- [ ] Documentar excecoes no module-standards.md

---

### EPIC-UX-03: Accessibility & Quality (Sprint 3)

**Objetivo**: Atingir baseline WCAG 2.1 AA e cobertura de testes adequada.

#### Story UX-3.1: Baseline de Acessibilidade (WCAG 2.1 AA)
**Esforco**: 20h | **Impacto**: Alto

Acceptance Criteria:
- [ ] Instalar e configurar `@axe-core/react` para dev mode
- [ ] Adicionar `eslint-plugin-jsx-a11y` no lint (regras error, nao warn)
- [ ] Auditar e corrigir navegacao por teclado nos 5 fluxos criticos (login, dashboard, projetos, cronogramas, integracoes)
- [ ] Garantir focus visible consistente em todos os interativos
- [ ] Adicionar `aria-live` para feedbacks async (toast, sync status, loading)
- [ ] Verificar contraste AA em toda a paleta (light + dark)
- [ ] Criar checklist de a11y em `.aios-core/development/checklists/a11y-checklist.md`
- [ ] Adicionar `npm run a11y:check` no CI (via axe ou lighthouse)

#### Story UX-3.2: Testes de Componentes Criticos
**Esforco**: 24h | **Impacto**: Alto

Acceptance Criteria:
- [ ] Testes de regressao para `cronogramas-content` (ou subcomponentes apos decomposicao)
- [ ] Testes de regressao para `dashboard-content`
- [ ] Testes para `FilterBar.tsx` e `FilterControl.tsx` (895 linhas sem testes)
- [ ] Testes para todas as 5 Server Actions (projects, lm-models, agent-types, lm-providers, sync)
- [ ] Testes de a11y basicos (axe-core) para telas criticas
- [ ] Meta: cobertura total de src/ > 60% (medir via vitest --coverage)
- [ ] Adicionar coverage gate no CI (fail if < 50%)

#### Story UX-3.3: Padronizar Feedback Async
**Esforco**: 10h | **Impacto**: Medio

Acceptance Criteria:
- [ ] Criar tipo `AsyncOperationState<T>` em `src/lib/types/async.ts`
- [ ] Criar hook `useAsyncFeedback` que encapsula estado + toast + retry
- [ ] Definir regra: toast para eventos globais, inline message para contexto local
- [ ] Padronizar loading state em todas as operacoes de sync (skeleton → content → toast)
- [ ] Padronizar estados vazios com ilustracao/mensagem + CTA
- [ ] Documentar padroes em `docs/design-system.md` (secao "Feedback Patterns")

---

### EPIC-UX-04: Data Layer & AI Optimization (Sprint 4)

**Objetivo**: Consolidar arquitetura de dados e otimizar para produtividade com AI.

#### Story UX-4.1: Formalizar Data Fetching Patterns
**Esforco**: 12h | **Impacto**: Medio-Alto

Acceptance Criteria:
- [ ] Criar `docs/architecture/data-fetching-patterns.md` com regras claras:
  - Server Components → query direta Supabase (read-only, sem interacao)
  - Server Actions → mutations e operacoes autenticadas (CRUD)
  - API Routes → proxy para servicos externos (AI service, webhooks)
  - Client Services → apenas para servicos que precisam de estado real-time (agents store)
- [ ] Mapear cada modulo para o padrao correto e documentar excecoes
- [ ] Migrar inconsistencias onde possivel (sem breaking changes)
- [ ] Documentar em ADR (Architecture Decision Record)

#### Story UX-4.2: Otimizar Contexto AI e Documentacao para Agentes
**Esforco**: 8h | **Impacto**: Medio-Alto

Acceptance Criteria:
- [ ] Atualizar `docs/architecture/module-standards.md` com exemplos de codigo de referencia
- [ ] Criar `docs/architecture/component-catalog.md` listando todos os componentes reutilizaveis e quando usar cada um
- [ ] Atualizar MEMORY.md com estado atual pos-brownfield e pos-plano
- [ ] Criar `docs/architecture/ai-development-guide.md` com:
  - Padroes que devem ser seguidos por agentes AI
  - Exemplos de decomposicao de componentes
  - Exemplos de domain extraction
  - Checklist rapido para qualquer nova feature
- [ ] Validar que module-standards.md reflete estado real do codigo (nao estado aspiracional)

---

## 5. Matriz de Impacto x Esforco

```
IMPACTO
  ^
  |  [UX-1.2]         [UX-2.1] [UX-2.2]
  |  ErrorBoundary     Decompor cronogramas/projetos
  |
  |  [UX-2.3]    [UX-3.1]    [UX-3.2]
  |  Domain       A11y         Testes
  |
  |  [UX-1.1]    [UX-4.1]    [UX-1.3]
  |  Design Sys   Data Layer   Personas
  |
  |  [UX-2.4]    [UX-3.3]    [UX-4.2]
  |  Auxiliares   Feedback     AI Context
  |
  +-----------------------------------------> ESFORCO
      Baixo (8-12h)   Medio (16-20h)   Alto (24h)
```

---

## 6. Dependencias de Execucao

```
UX-1.1 (Design System docs) ──┐
UX-1.2 (ErrorBoundary)   ─────┼──> UX-2.1, UX-2.2 (decomposicao depende de padroes definidos)
UX-1.3 (Personas)        ─────┘

UX-2.3 (Domain logic) ────────> depende de UX-2.1 e UX-2.2 (extrai durante decomposicao)

UX-2.1 + UX-2.2 ─────────────> UX-3.2 (testes de componentes decompostos)
UX-1.1 ──────────────────────> UX-3.1 (a11y precisa de design tokens documentados)
UX-1.2 ──────────────────────> UX-3.3 (feedback async usa padrao de estado de UX-1.2)

UX-2.3 ──────────────────────> UX-4.1 (data layer formaliza apos domain extraction)
UX-3.2 ──────────────────────> UX-4.2 (AI guide documenta padroes validados por testes)
```

---

## 7. Criterios de Sucesso — Nota 10/10

| Dimensao | Criterio Objetivo | Metrica |
|----------|------------------|---------|
| Design System | Documentacao completa, tokens semanticos, catalogo de componentes | docs/design-system.md > 500 linhas |
| UX Consistency | Nenhum content file > 300 linhas, layout padrao em todos os modulos | Max LOC por arquivo content |
| Engenharia | ErrorBoundary em todas as paginas, domain 100% extraido | Zero logica de dominio em components |
| Testing | Coverage > 60%, a11y checks no CI, domain tests 100% | vitest --coverage report |
| Accessibility | WCAG 2.1 AA em 5 fluxos criticos, zero violacoes criticas | axe-core 0 critical/serious |
| AI Efficiency | Guia de desenvolvimento AI, module-standards atualizado | Tempo medio de implementacao por story |

---

## 8. Estimativa Consolidada

| Epic | Stories | Horas | Sprint |
|------|---------|-------|--------|
| EPIC-UX-01: Foundation | 3 | 38h | Sprint 1 |
| EPIC-UX-02: Decomposition | 4 | 72h | Sprint 2 |
| EPIC-UX-03: Quality | 3 | 54h | Sprint 3 |
| EPIC-UX-04: Optimization | 2 | 20h | Sprint 4 |
| **TOTAL** | **12** | **184h** | **4 sprints** |

Custo estimado (R$150/h): **R$ 27.600**

---

## 9. Riscos e Mitigacoes

| Risco | Probabilidade | Mitigacao |
|-------|---------------|-----------|
| Decomposicao quebra funcionalidade existente | Media | Testes de regressao ANTES da decomposicao |
| Escopo creep em design system | Media | Limitar a documentacao funcional, sem Storybook |
| A11y corrections afetam layout | Baixa | Mudancas incrementais, PR review com checklist |
| Domain extraction muda comportamento de KPIs | Media | Testes snapshot de KPIs antes e depois |
| Sprint 2 (72h) muito denso | Alta | Pode split em 2a e 2b se necessario |

---

## 10. Proximos Passos Imediatos

1. **AGORA**: Aprovar este plano
2. **Dia 1**: Criar epic EPIC-UX-01 + 3 stories com AC detalhados
3. **Dia 1-2**: @sm draft stories formais em docs/stories/
4. **Dia 2**: @po validar stories (10-point checklist)
5. **Dia 3+**: @dev iniciar Sprint 1 (UX-1.1, UX-1.2, UX-1.3)

---

*Documento gerado por Orion (AIOS Master) em 2026-02-27*
*Base: Brownfield Discovery outputs + Deep Code Audit*
*Status: PENDENTE APROVACAO*
