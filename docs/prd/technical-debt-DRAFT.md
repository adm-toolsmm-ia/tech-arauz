# PRD Gap Analysis & Implementation DRAFT

Data: 2026-02-28
Status: DRAFT para revisão dos especialistas
Orquestração: @aios-master (Orion) — Brownfield Discovery Phase 4
PRD: Padronização UX/UI + Cronogramas Read-Only + Tecnologia & IA
Insumos: Phase 1 (@architect), Phase 2 (@data-engineer), Phase 3 (@ux-design-expert)

---

## Contexto

O portal Tech Arauz é um projeto brownfield (Next.js 14 + Supabase) com padrões de engenharia AIOS estabelecidos. Este PRD visa **padronizar UX/UI entre módulos**, **completar Cronogramas (100% read-only)** e **alinhar os módulos de Tecnologia & IA** com CRUD pleno.

**Regra de ouro:** Projetos e Cronogramas são SOMENTE LEITURA. CRUD apenas em cadastros de tecnologia.

---

## 1. Gaps funcionais vs PRD — Cronogramas (Read-Only)

### 1.1 Kanban (NOVO — não existe)

O PRD exige Kanban com colunas por status do cronograma. Hoje só existem views `agenda` e `lista`.

| Requisito PRD                                                                     | Estado atual                                                                         | Trabalho necessário                                            |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| Colunas por status (mapear da API)                                                | ❌ Inexistente                                                                        | Criar `CronogramaKanbanView.tsx` usando `KanbanBoard` genérico |
| Cards: Título, Projeto, Início/Fim, Responsável, Progresso, Prioridade, Etiquetas | ❌ — campos `prioridade`, `progresso_percentual`, `etiquetas[]` não existem no schema | **Decisão de produto DP-01**                                   |
| Semântica de período por interseção (`start <= P.end AND end >= P.start`)         | ⚠️ Parcial — `isWithinRange` existe mas precisa validação                             | Validar e reutilizar                                           |
| Exclusão de concluídos + projetos concluídos/cancelados por padrão                | ❌ Ausente                                                                            | Implementar filtro padrão + atalhos toggle                     |
| Drag-and-drop DESABILITADO                                                        | ✅ Basta não passar `onStatusChange` ao KanbanBoard                                   | Confirmar                                                      |

### 1.2 Lista (CORRIGIR — layout errado)

O PRD exige tabela com colunas ordenáveis. Hoje é um card grid. Ajustado para **7 colunas** após confirmação de que `prioridade`, `progresso_percentual` e `etiquetas[]` não existem na API Espaider (DP-01 resolvido).

| Requisito PRD                                                          | Estado atual                 | Trabalho necessário                                |
| ---------------------------------------------------------------------- | ---------------------------- | -------------------------------------------------- |
| Colunas: Nome, Projeto, Status, Início, Fim, Responsável, Fase         | ❌ Card grid (sem tabela)     | Criar `CronogramaTableView.tsx` com `<table>` real |
| Ordenação multi-coluna (default: Início asc)                           | ❌ Ausente                    | Implementar sort state                             |
| Paginação server-side (default 25, preferências persistidas)           | ❌ Carrega TODOS os registros | Migrar para LIMIT/OFFSET via URL params            |
| Ações por linha: apenas "Ver Detalhes"                                 | ✅ Sem edição                 | Manter                                             |
| Filtros: Período (interseção), Status, Projeto, Responsável, Etiquetas | ⚠️ Parcial                    | Completar com campos ausentes                      |

### 1.3 Agenda (CORRIGIR — semana errada)

| Requisito PRD                   | Estado atual                              | Trabalho necessário         |
| ------------------------------- | ----------------------------------------- | --------------------------- |
| Semana ISO-8601 (segunda-feira) | ❌ Bug: `getWeekStart()` inicia no domingo | Fix em `schedule-status.ts` |
| Timezone do tenant/usuário      | ⚠️ Não verificado                          | Validar normalização        |
| Bordas inclusivas [início, fim] | ⚠️ `isWithinRange` existe                  | Validar correção de borda   |

### 1.4 Card de Detalhes (AJUSTAR)

| Requisito PRD                                                | Estado atual                 | Trabalho necessário                               |
| ------------------------------------------------------------ | ---------------------------- | ------------------------------------------------- |
| Banner "Fonte: ERP — somente leitura"                        | ❌ Ausente                    | Criar `ErpReadOnlyBanner` componente reutilizável |
| Layout idêntico ao card de Projeto                           | ⚠️ `CronogramaCockpit` existe | Verificar paridade visual                         |
| Seções: Cabeçalho, Metadados, Aba Detalhes, Aba Relacionados | ⚠️ Parcial                    | Completar                                         |
| "Atualizado às {timestamp}"                                  | ❌ Ausente                    | Usar `sync_logs.completed_at`                     |

---

## 2. Gaps funcionais vs PRD — Projetos (Read-Only)

| Requisito PRD                                 | Estado atual                                        | Trabalho necessário            |
| --------------------------------------------- | --------------------------------------------------- | ------------------------------ |
| Ações de edição removidas/desativadas         | ⚠️ DnD no Kanban altera `fase_atual`                 | **Decisão de produto DP-02**   |
| Banner "Fonte: ERP — somente leitura"         | ❌ Ausente                                           | Reutilizar `ErpReadOnlyBanner` |
| "Atualizado às {timestamp}"                   | ❌ Ausente                                           | Implementar                    |
| Subtítulo sem implicar edição                 | ❌ "gerencie" implica write                          | Ajustar para "Visualize"       |
| Indicador "somente leitura" em cards/tooltips | ❌ Ausente                                           | Tooltip ou badge               |
| Botão "Recarregar" (refaz fetch, não resync)  | ⚠️ Botão atual é "Sincronizar Espaider" na FilterBar | Renomear + mover posição       |

---

## 3. Gaps funcionais vs PRD — Sidebar e Navegação

| Requisito PRD                                                                          | Estado atual                  | Trabalho necessário                                 |
| -------------------------------------------------------------------------------------- | ----------------------------- | --------------------------------------------------- |
| Grupo "Tecnologia & IA" com: Agentes AI, Integrações, Usuários                         | ❌ Grupo chama-se "Sistema"    | Renomear em `sidebar-config.ts`                     |
| Grupo "Tabelas Auxiliares" (último) com: Tipos de Agentes, Modelos IA, Fornecedores IA | ❌ Grupo chama-se "Auxiliares" | Renomear                                            |
| Sem duplicidade de "Tipos de Agentes"                                                  | ⚠️ Possível duplicidade        | Manter apenas em "Tabelas Auxiliares" (default PRD) |
| Remover entradas que remetam a edição de Projetos/Cronogramas                          | ✅ Não existem                 | Confirmar                                           |

---

## 4. Gaps funcionais vs PRD — Tecnologia & IA (CRUD)

### 4.1 Agentes AI

| Requisito PRD                                                   | Estado atual                                       | Trabalho necessário                        |
| --------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------ |
| Kanban agrupado por "Tipo de Agente"                            | ❌ Agrupado por status (draft/published/deprecated) | Mudar colunas para `agent_types` dinâmicos |
| Card: Nome, Tipo, Modelo, Fornecedor, Status, Último run, Owner | ⚠️ Incompleto                                       | Enriquecer `renderItemContent`             |
| Filtros: Tipo, Fornecedor, Modelo, Status                       | ⚠️ Apenas busca + status + tipo                     | Adicionar filtros faltantes                |
| Ações: Criar/Editar/Arquivar/Clonar                             | ⚠️ Criar/Editar existe                              | Verificar Arquivar/Clonar                  |
| Usar FilterBar padrão (não filtros ad-hoc)                      | ❌ Filtros manuais (Input + Selects)                | Migrar para `FilterBar`                    |
| Usar KanbanBoard genérico (não div manual)                      | ❌ Kanban implementado com divs                     | Migrar para `KanbanBoard`                  |
| Campos: persona, system prompt, requisitos, objetivos, outputs  | ⚠️ Parcial no formulário de edição                  | Verificar completude                       |

### 4.2 Cadastros (Tipos de Agentes, Fornecedores IA, Modelos)

| Requisito PRD                                                                             | Estado atual                                | Trabalho necessário                           |
| ----------------------------------------------------------------------------------------- | ------------------------------------------- | --------------------------------------------- |
| Lista padrão + Formulários com validação                                                  | ✅ Tipos e Fornecedores OK                   | Verificar Modelos                             |
| Cockpit dedicado para detalhes                                                            | ⚠️ Modelos usa SplitView inline              | Criar `ModelCockpit`                          |
| Título consistente com sidebar ("Fornecedores IA")                                        | ❌ Header diz "Provedores de LM"             | Corrigir                                      |
| Telemetria futura (placeholder de schema)                                                 | ❌ Não existe                                | Schema placeholder para tokenização/custo/uso |
| KPIs clicáveis                                                                            | ❌ Nenhum módulo auxiliar tem KPIs clicáveis | Adicionar `onClick`                           |
| Bug: Kanban de Modelos muda `provider_id` via drag mas action só atualiza `display_order` | ❌ Bug de comportamento                      | Corrigir                                      |

---

## 5. Gaps transversais — UX/UI Universal

| Requisito PRD                                                                 | Estado atual                                   | Trabalho necessário                                 |
| ----------------------------------------------------------------------------- | ---------------------------------------------- | --------------------------------------------------- |
| Layout universal: Dashboard/resumo → Filtros → Atalhos → Seletores → Conteúdo | ⚠️ Inconsistente entre módulos                  | Padronizar em todos os módulos-alvo                 |
| Skeletons, empty states úteis, erros com retry                                | ⚠️ Parcial — `EmptyState` e `skeletons` existem | Verificar cobertura                                 |
| WCAG AA                                                                       | ❌ Sem baseline de a11y                         | Implementar: teclado, foco, aria-live, contraste AA |
| Navegação por teclado                                                         | ❌ Sem implementação dedicada                   | Implementar                                         |
| Indicador "Fonte: ERP — somente leitura" + timestamp                          | ❌ Componente não existe                        | Criar `ErpReadOnlyBanner`                           |
| DashboardHeader com prop `actions`                                            | ❌ Botão "Criar" fora do componente             | Padronizar                                          |
| FilterBar textos em PT-BR                                                     | ❌ Textos em inglês ("Click to clear")          | Internacionalizar                                   |
| Feature flags para novas visualizações                                        | ❌ Não implementado                             | Implementar antes do deploy                         |

---

## 6. Gaps de Database impactando o PRD

Fonte: `supabase/docs/DB-AUDIT.md`

| ID    | Gap                                                                                           | Impacto no PRD                               | Severidade | Esforço (h) |
| ----- | --------------------------------------------------------------------------------------------- | -------------------------------------------- | ---------- | ----------: |
| DB-01 | Histórico de regressão RLS em child tables                                                    | Risco de segurança ao mexer no schema        | Crítico    |          20 |
| DB-02 | Token sensível em `espaider_apis.token`                                                       | Exposição de credencial de sync              | Alto       |          12 |
| DB-03 | Tenant hardcoded em seeds/código                                                              | Bloqueia multi-tenant real                   | Alto       |          10 |
| DB-04 | Auth dividida entre DB e app sem matriz documentada                                           | Risco ao criar novos endpoints               | Alto       |           8 |
| DB-05 | Campos `prioridade`, `progresso_percentual`, `etiquetas[]` não existem em `project_schedules` | PRD exige dados que não existem no schema    | Bloqueante |           — |
| DB-06 | Sem índice em `project_schedules(data_inicio, data_fim)`                                      | Performance da paginação server-side         | Alto       |           4 |
| DB-07 | Status mapping (API → UI) não documentado                                                     | Colunas do Kanban sem mapeamento             | Alto       |           4 |
| DB-08 | `updated_at` pode não ser atualizado pelo sync                                                | Timestamp "Atualizado às" pode ser incorreto | Médio      |           4 |

⚠️ PENDENTE: Revisão do @data-engineer

---

## 7. Decisões de produto pendentes

> ⚠️ Bloqueiam implementação. Devem ser resolvidas antes de iniciar código.

### DP-01: Campos do PRD ausentes no schema de Cronogramas

O PRD especifica `prioridade`, `progresso_percentual` e `etiquetas[]` nos cards e na tabela, porém **nenhum existe** em `project_schedules`.

| Opção                 | Descrição                                                                   | Impacto                                        |
| --------------------- | --------------------------------------------------------------------------- | ---------------------------------------------- |
| **A — Omitir**        | Não mostrar esses campos na UI. Documentar como "não disponível no ERP"     | Entrega mais rápida; PRD parcialmente atendido |
| **B — Derivar**       | `prioridade` de `fase_atividade`; `progresso` de `atrasado`/`status`        | Dados imprecisos; risco de confusão            |
| **C — Verificar API** | Confirmar com DBA se os campos existem na API Espaider e não foram mapeados | Pode desbloquear; depende de resposta          |

**Default PRD (se sem resposta):** Opção A — omitir e sinalizar campos ausentes.

### DP-02: Drag-and-drop em Projetos Kanban

O PRD define Projetos como "somente leitura". O Kanban atual permite mover cards para alterar `fase_atual`.

| Opção                  | Descrição                                                             | Impacto                            |
| ---------------------- | --------------------------------------------------------------------- | ---------------------------------- |
| **A — Full read-only** | Remover DnD. Kanban somente visual. Consistente com "somente leitura" | Perda de funcionalidade existente  |
| **B — Write limitado** | Manter DnD apenas para `fase_atual` com tooltip explicativo           | Inconsistente com banner read-only |

**Default PRD (se sem resposta):** Opção A — desabilitar DnD.

### DP-03: Status mapping API → UI para colunas do Kanban

Quais são os valores reais de `status` em `project_schedules`? Sem isso, não é possível definir as colunas do Kanban.

**Ação:** @data-engineer deve documentar mapeamento completo.

---

## 8. Perguntas para especialistas

### Para @data-engineer (Phase 5)

1. **Campos ausentes**: `prioridade`, `progresso_percentual`, `etiquetas[]` existem na API Espaider para cronogramas? Se sim, por que não foram mapeados? Se não, qual a recomendação?
2. **Status mapping**: Quais são os valores reais de `status` em `project_schedules`? Documentar mapeamento completo API → UI para definir colunas do Kanban.
3. **Índices**: Existe índice em `project_schedules(data_inicio, data_fim)`? Crítico para paginação server-side.
4. **Timestamp de sync**: O `updated_at` de `project_schedules` é atualizado pelo sync? Pode ser usado como "Atualizado às"? Ou devemos usar `sync_logs.completed_at`?
5. **RLS**: Quais tabelas child precisam de auditoria adicional antes de mexermos no schema?
6. **Token**: Recomendação concreta para `espaider_apis.token` — secret manager, criptografia, ou remoção?
7. **Telemetria futura**: Qual schema placeholder recomendado para tokenização/custo/uso de agentes AI?

### Para @ux-design-expert (Phase 6)

1. **Banner ERP**: Posicionamento — topo da página, dentro de cards, ambos? Deve incluir link "como editar via ERP"?
2. **Kanban read-only**: O `KanbanBoard` genérico precisa de variante visual sem drag indicators?
3. **Tabela Cronogramas**: 9 colunas no mobile — scroll horizontal ou fallback para cards?
4. **Breakpoints**: Quais campos omitir em mobile para manter legibilidade?
5. **Feedback async**: Padrão de toast/inline para sync — sonner como base?
6. **Acessibilidade**: Baseline mínimo de a11y antes de liberar — teclado, foco, aria-live, contraste AA. Como validar?
7. **Estados**: Guia de componentes para empty/loading/error — reutilizar `EmptyState` e `skeletons` existentes ou criar novos?

### Para @qa (Phase 7)

1. **Interseção de período**: 4 casos de teste (dentro, entra-no-período, sai-no-período, fora) — cobertura suficiente?
2. **Read-only**: Como validar que nenhum endpoint de escrita é chamado para Projetos/Cronogramas?
3. **Timezone**: Estratégia de teste para bordas de timezone?
4. **Feature flags**: Critérios de gate para remover flags após QA?
5. **Cobertura**: Meta de 80% para novos componentes — viável no prazo?

---

## 9. ADRs propostos (@architect — Phase 1)

| ADR   | Decisão proposta                                       | Justificativa                                           |
| ----- | ------------------------------------------------------ | ------------------------------------------------------- |
| ADR-1 | Kanban de Cronogramas sem DnD                          | PRD: read-only. Usar `KanbanBoard` sem `onStatusChange` |
| ADR-2 | Lista de Cronogramas como tabela HTML real             | PRD: 9 colunas ordenáveis. Card grid não atende         |
| ADR-3 | Sidebar: "Tecnologia & IA" + "Tabelas Auxiliares"      | PRD define nova organização                             |
| ADR-4 | Agentes AI Kanban por Tipo (não por status)            | PRD especifica agrupamento por tipo                     |
| ADR-5 | `ErpReadOnlyBanner` reutilizável (variant inline/page) | PRD exige indicador em todos os módulos read-only       |
| ADR-6 | Paginação server-side para Cronogramas                 | PRD exige; performance necessária                       |

---

## 10. Equipe AIOS — Responsabilidades por fase

Orquestrada por @aios-master (Orion):

| Agente                  | Papel no workflow             | Entregáveis                                |
| ----------------------- | ----------------------------- | ------------------------------------------ |
| @architect (Aria)       | Phase 1 ✅, Phase 4 ✅, Phase 8 | Arquitetura, ADRs, consolidação final      |
| @data-engineer          | Phase 2 ✅, Phase 5            | Schema audit, status mapping, RLS, índices |
| @ux-design-expert (Uma) | Phase 3 ✅, Phase 6            | Spec UX, padrão canônico, a11y baseline    |
| @qa                     | Phase 7                       | Quality gate, plano de testes, cobertura   |
| @analyst                | Phase 9                       | Relatório executivo com custos e ROI       |
| @pm                     | Phase 10                      | Epic + stories com AC e testes por onda    |
| @dev                    | Pós-workflow                  | Implementação das stories                  |
| @devops                 | Pós-workflow                  | Feature flags, CI/CD, deploy               |

---

## 11. Fora de escopo (confirmado pelo PRD)

- ❌ Qualquer edição/criação/arquivamento de Projetos e Cronogramas no portal
- ❌ Escrever de volta no ERP ou em tabelas locais desses domínios
- ❌ Visualização em grade (grid view)
- ❌ i18n completo (apenas pt-BR; chaves preparadas para futuro)
- ❌ Telemetria completa (apenas placeholders de schema)

---

## 12. Critérios de aceite (extraídos do PRD)

### Cronogramas

- [ ] Agenda mantém semântica de período e timezone com interseção correta (bordas inclusivas)
- [ ] Kanban disponível, read-only, sem DnD; aplica período por interseção; oculta concluídos por padrão; atalhos funcionam
- [ ] Lista exibe 9 colunas (ou menos se DP-01 = omitir), respeita filtros/ordenadores; paginação server-side
- [ ] Cards/Detalhes sem ação de edição; banner "Fonte: ERP — somente leitura" presente

### Projetos

- [ ] Telas e cards somente leitura; nenhuma ação de mutação disponível
- [ ] Banner ERP presente com timestamp

### Tecnologia & IA

- [ ] Agentes AI com Kanban por Tipo; filtros funcionam; CRUD operacional
- [ ] Cadastros com listas padrão e formulários com validação

### Sidebar

- [ ] "Tecnologia & IA" conforme PRD; "Tabelas Auxiliares" por último
- [ ] Sem atalhos de edição para Projetos/Cronogramas

### Segurança/Logs

- [ ] Nenhum endpoint de escrita chamado para Projetos/Cronogramas (verificado em logs/QA)

### Acessibilidade

- [ ] WCAG AA nas novas telas

### Testes

- [ ] Cobertura mínima 80% dos novos componentes
- [ ] E2E para filtros de período e atalhos de concluídos

---

## 13. Próximo passo do workflow

Revisões especializadas (Phases 5-7):
1. `docs/reviews/db-specialist-review.md` — @data-engineer valida seção 6 e responde seção 8.1
2. `docs/reviews/ux-specialist-review.md` — @ux-design-expert valida seções 1-5 e responde seção 8.2
3. `docs/reviews/qa-review.md` — @qa faz quality gate e responde seção 8.3

---

*Documento gerado em 2026-02-28 por @architect — Brownfield Discovery Phase 4*
*Orquestração: @aios-master (Orion)*
*Status: DRAFT — Aguardando revisão dos especialistas nas Phases 5-7*
