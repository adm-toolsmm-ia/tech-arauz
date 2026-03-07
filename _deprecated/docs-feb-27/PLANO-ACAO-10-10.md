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

*Documento arquivado em 2026-03-07 — AIOS-era document, superseded by AIOX Brownfield Discovery assessment (FASES 1-9)*
*Para informações atualizadas sobre technical debt e roadmap, consulte: docs/prd/technical-debt-assessment.md (v3.1-FINAL)*
