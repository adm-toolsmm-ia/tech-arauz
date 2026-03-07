# QA Review — PRD UX/UI 2026

Data: 2026-02-28
Agente: @qa
Documentos revisados:
1. `docs/prd/technical-debt-DRAFT.md`
2. `docs/reviews/db-specialist-review.md`
3. `docs/reviews/ux-specialist-review.md`
PRD: Padronização UX/UI + Cronogramas Read-Only + Tecnologia & IA

---

## Gate Status: APPROVED

O assessment está coerente, completo e pronto para consolidação final (Phase 8).

---

## 1. Gaps identificados no assessment

### 1.1 Cobertura de áreas

| Área                                   | Coberta? | Notas                               |
| -------------------------------------- | -------- | ----------------------------------- |
| Cronogramas (Kanban/Lista/Agenda)      | ✅        | Detalhado em 11 gaps (C01-C11)      |
| Projetos (read-only)                   | ✅        | 5 gaps (P01-P05)                    |
| Tecnologia & IA (CRUD)                 | ✅        | 6 gaps de Agentes + 7 de Auxiliares |
| Sidebar/Navegação                      | ✅        | 3 gaps mapeados                     |
| Database/Schema                        | ✅        | 12 débitos (DB-01 a DB-12)          |
| UX Universal (a11y, feedback, estados) | ✅        | 4 gaps transversais (U01-U04)       |
| Performance (paginação, índices)       | ✅        | Coberto em DB-06 e SYS-05           |
| Segurança (RLS, token, auth)           | ✅        | DB-01 a DB-04                       |

### 1.2 Gap não coberto: Telemetria e eventos

O PRD menciona: "Telemetria: eventos de visualização/filtros/aplicações; sem eventos de mutação para Projetos/Cronogramas."

**Ação:** Incluir story de telemetria na Onda 4. Definir quais eventos capturar (page view, filtro aplicado, view mode changed).

### 1.3 Gap não coberto: i18n e chaves preparadas

O PRD menciona: "i18n: pt-BR; chaves preparadas para outros idiomas."

Atualmente textos são hardcoded em pt-BR. Não há abstração de chaves. **Recomendação:** Não bloquear por isso agora, mas registrar como dívida para sprint futuro.

---

## 2. Riscos cruzados

| Risco                                                                     | Áreas afetadas         | Probabilidade | Mitigação                                                                                   |
| ------------------------------------------------------------------------- | ---------------------- | ------------- | ------------------------------------------------------------------------------------------- |
| Regressão de RLS ao criar índices/migrations                              | Database + Segurança   | Média         | `audit_all_rls_policies()` no CI antes e depois da migration                                |
| Dados de status inconsistentes entre ERP e UI                             | Database + Frontend    | Alta          | Documentar mapping **antes** de codificar Kanban; fallback visual para valores não mapeados |
| Refatoração de componentes quebrar funcionalidade existente               | Frontend + Produto     | Média         | Testes de regressão em Projetos (baseline) antes de mexer em Cronogramas                    |
| Paginação server-side alterar comportamento de filtros                    | Frontend + Performance | Média         | Filtros devem ser query params (URL); testar combinações filtro + paginação                 |
| Feature flags mal configuradas exporem WIP para usuários                  | DevOps + UX            | Baixa         | Flag por módulo (não por componente); gate no middleware Next.js                            |
| Exclusão de concluídos por padrão confundir usuários que buscam histórico | UX + Produto           | Média         | Atalho toggle visível e persistido; tooltip "X concluídos ocultos"                          |

---

## 3. Dependências validadas

### Ordem de execução recomendada

```
SPRINT 1 — Fundação
├── DB-06: Criar índices de período (ANTES de paginação)
├── DB-07: Documentar status mapping (ANTES de Kanban)
├── SYS-01: Sidebar (quick win, desbloqueia navegação)
├── UX-C01/P01: ErpReadOnlyBanner (componente base para todos os módulos)
├── DP-01: Decisão de campos ausentes (desbloqueia specs de Kanban/Lista)
├── DP-02: Decisão de DnD em Projetos (desbloqueia ajuste)
└── UX-C04: Fix getWeekStart() (bug, quick fix)

SPRINT 2 — Core PRD
├── UX-C02: Kanban Cronogramas (depende de DB-07 + DP-01)
├── UX-C03: Tabela Cronogramas (depende de DB-06)
├── SYS-05: Paginação server-side (depende de DB-06)
├── UX-C09/C10: Exclusão de concluídos + atalhos
├── UX-A01: Migrar filtros de Agentes para FilterBar
├── SYS-06: Kanban de Agentes por Tipo
└── UX-P02: Desabilitar DnD em Projetos (depende de DP-02)

SPRINT 3 — Qualidade e polimento
├── UX-U01: Baseline a11y WCAG AA
├── UX-U02: Padrão de feedback async
├── UX-U03: Empty/loading/error states padronizados
├── UX-T03: ModelCockpit dedicado
├── UX-T04: Fix bug DnD Modelos
├── UX-A02: Migrar Kanban Agentes para KanbanBoard
└── UX-T07: DashboardHeader prop actions

SPRINT 4 — Governança e tech debt
├── DB-01: RLS CI test suite
├── DB-02: Token handling
├── DB-03: Tenant hardcode
├── DB-09-12: Governança de dados
└── UX-U04: Feature flags cleanup
```

### Dependências críticas (bloqueios)

| Bloqueio              | O que impede                                      | Resolução                                                                    |
| --------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------- |
| DP-01 sem decisão     | Kanban e Tabela de Cronogramas (quantas colunas?) | Decidir: 7 colunas sem prioridade/progresso (recomendado por @data-engineer) |
| DP-02 sem decisão     | Ajuste de Projetos Kanban                         | Decidir: desabilitar DnD (recomendado por @ux-design-expert)                 |
| DB-06 sem implementar | Paginação server-side                             | Criar índices ANTES da paginação                                             |
| DB-07 sem documentar  | Colunas do Kanban de Cronogramas                  | Query no banco real para valores de status                                   |

---

## 4. Plano de testes requeridos

### 4.1 Interseção de período (4 casos obrigatórios)

```
Dado período P = [P.start, P.end]:

Caso 1 — DENTRO:     atividade [start, end] está contida em P → INCLUIR
Caso 2 — ENTRA:      atividade começa antes de P.start mas termina dentro → INCLUIR
Caso 3 — SAI:        atividade começa dentro mas termina após P.end → INCLUIR
Caso 4 — FORA:       atividade [start, end] não intersecta P → EXCLUIR

Bordas: start == P.end → INCLUIR (inclusivo)
Bordas: end == P.start → INCLUIR (inclusivo)
```

### 4.2 Read-only enforcement

| Teste                                                               | Tipo    | Critério                                                           |
| ------------------------------------------------------------------- | ------- | ------------------------------------------------------------------ |
| Nenhum botão de Criar/Editar/Excluir em Cronogramas                 | E2E     | `expect(page.locator('[data-action="create"]')).toHaveCount(0)`    |
| Nenhum botão de Criar/Editar/Excluir em Projetos                    | E2E     | Idem                                                               |
| DnD desabilitado no Kanban de Cronogramas                           | E2E     | Drag attempt não move card                                         |
| DnD desabilitado no Kanban de Projetos (se DP-02 = A)               | E2E     | Idem                                                               |
| Banner "somente leitura" visível em Cronogramas                     | E2E     | `expect(page.locator('[data-testid="erp-banner"]')).toBeVisible()` |
| Banner "somente leitura" visível em Projetos                        | E2E     | Idem                                                               |
| Logs: nenhum POST/PUT/DELETE para /api/projetos ou /api/cronogramas | Backend | Auditoria de network requests                                      |

### 4.3 Kanban de Cronogramas

| Teste                                            | Tipo | Critério                                              |
| ------------------------------------------------ | ---- | ----------------------------------------------------- |
| Colunas renderizam baseada em status mapeados    | Unit | Colunas == mapping definido                           |
| Cards exibem dados corretos (7 campos)           | Unit | Nome, Projeto, Status, Início, Fim, Responsável, Fase |
| Filtro de período aplica interseção corretamente | Unit | 4 casos de período                                    |
| Concluídos ocultos por padrão                    | E2E  | Cards com status "concluído" não aparecem             |
| Toggle "incluir concluídos" funciona             | E2E  | Cards aparecem após toggle                            |

### 4.4 Tabela de Cronogramas

| Teste                          | Tipo | Critério                      |
| ------------------------------ | ---- | ----------------------------- |
| 7 colunas visíveis em desktop  | E2E  | Count de `<th>` == 7          |
| Ordenação por coluna funciona  | E2E  | Click no header ordena        |
| Paginação server-side funciona | E2E  | Navegação entre páginas       |
| Mobile fallback para cards     | E2E  | Viewport < 640px mostra cards |

### 4.5 Acessibilidade

| Teste                       | Tipo         | Critério                                  |
| --------------------------- | ------------ | ----------------------------------------- |
| Navegação completa por Tab  | Manual + axe | Todos os elementos interativos acessíveis |
| Foco visível                | Visual       | Ring visível em todos os estados          |
| `aria-live` em filtros/sync | Audit        | Mudanças de conteúdo anunciadas           |
| Contraste AA                | axe DevTools | 4.5:1 texto, 3:1 UI                       |

### 4.6 Cobertura mínima

| Área                                       | Meta       | Tipo          |
| ------------------------------------------ | ---------- | ------------- |
| Novos componentes (Kanban, Tabela, Banner) | 80%        | Unit (Vitest) |
| Lógica de interseção de período            | 100%       | Unit (Vitest) |
| Fluxos E2E (filtros + período + read-only) | 5 cenários | E2E (Cypress) |
| Módulos auxiliares (CRUD)                  | 60%        | Unit          |

---

## 5. Parecer final

Assessment **coerente e completo** para seguir para consolidação final. Os reviews de @data-engineer e @ux-design-expert complementam bem o DRAFT com dados técnicos e especificações visuais.

**Condições para prosseguir:**
1. ✅ Decidir DP-01 (campos ausentes) — @data-engineer recomenda Opção A (omitir, ajustar de 9 para 7 colunas)
2. ✅ Decidir DP-02 (DnD Projetos) — @ux-design-expert recomenda Opção A (desabilitar)
3. ✅ Registrar backlog com ordem de execução (dependências validadas acima)
4. ✅ Incluir story de telemetria na Onda 4

---

*Documento gerado em 2026-02-28 por @qa — Brownfield Discovery Phase 7*
*Status: APPROVED — Pronto para Phase 8 (@architect consolidação final)*
