# UX Specialist Review — PRD UX/UI 2026

Data: 2026-02-28
Agente: @ux-design-expert (Uma)
Base analisada: `docs/prd/technical-debt-DRAFT.md`, `docs/frontend/frontend-spec-prd-ux-2026.md`, `docs/reviews/db-specialist-review.md`
PRD: Padronização UX/UI + Cronogramas Read-Only + Tecnologia & IA

---

## Gate da revisão UX

**Status: APPROVED WITH CHANGES**

---

## 1. Gaps validados — Cronogramas

| ID     | Gap                                                | Severidade          | Horas | Prioridade | Impacto UX                                                             |
| ------ | -------------------------------------------------- | ------------------- | ----: | ---------- | ---------------------------------------------------------------------- |
| UX-C01 | Banner ERP ausente                                 | Alta                |     4 | Alta       | Usuário não sabe que dados são read-only — frustração ao tentar editar |
| UX-C02 | View Kanban não implementada                       | Alta                |    12 | Alta       | Falta de visão de status agrupada — core do PRD                        |
| UX-C03 | "Lista" renderiza cards em grid (não tabela)       | Alta → **Ajustado** |    10 | Alta       | Tabela é necessária para leitura comparativa e ordenação               |
| UX-C04 | Bug `getWeekStart()` — semana no domingo           | Média               |     2 | Alta       | Dados na semana errada prejudicam confiança                            |
| UX-C05 | Layout de container inconsistente (KPIs separados) | Média               |     3 | Média      | Scroll duplo confunde                                                  |
| UX-C08 | Filtros com labels em inglês                       | Baixa               |     2 | Média      | Inconsistência de idioma em produto PT-BR                              |

### Ajustes de severidade

- **UX-C03**: Elevado de "Média" para **Alta** — PRD exige tabela com colunas ordenáveis. Card grid é incompatível.
- **UX-C04**: Prioridade elevada para **Alta** — bug que afeta confiança nos dados.

### Gaps adicionados — Cronogramas

| ID     | Gap                                                                              | Severidade | Horas | Prioridade | Impacto UX                                                                           |
| ------ | -------------------------------------------------------------------------------- | ---------- | ----: | ---------- | ------------------------------------------------------------------------------------ |
| UX-C09 | Exclusão de concluídos por padrão não implementada                               | Alta       |     3 | Alta       | PRD exige: ocultar concluídos + projetos concluídos/cancelados por padrão            |
| UX-C10 | Atalhos "incluir concluídos" e "incluir projetos concluídos/cancelados" ausentes | Alta       |     4 | Alta       | PRD exige quick toggles para reverter exclusão                                       |
| UX-C11 | Indicador de progresso/urgência inexistente sem campo `progresso_percentual`     | Média      |     3 | Média      | Usar `atrasado` como badge de urgência visual (conforme recomendação @data-engineer) |

---

## 2. Gaps validados — Projetos

| ID     | Gap                                                      | Severidade | Horas | Prioridade | Impacto UX                                                               |
| ------ | -------------------------------------------------------- | ---------- | ----: | ---------- | ------------------------------------------------------------------------ |
| UX-P01 | Banner ERP ausente                                       | Alta       |     2 | Alta       | Compartilha componente com UX-C01                                        |
| UX-P02 | DnD no Kanban altera dados do ERP                        | Alta       |     4 | Alta       | Inconsistente com "somente leitura". **Recomendo Opção A (desabilitar)** |
| UX-P03 | Botão "Sincronizar" na FilterBar                         | Média      |     2 | Média      | Renomear para "Recarregar" (PRD: refaz fetch, não resync)                |
| UX-P04 | Subtítulo diz "gerencie"                                 | Baixa      |     1 | Baixa      | Ajustar: "Visualize todos os projetos importados do Espaider"            |
| UX-P05 | Tooltip "somente leitura" ausente em ações desabilitadas | Média      |     2 | Média      | PRD: comunicação visual clara de read-only                               |

---

## 3. Gaps validados — Agentes AI e Cadastros

| ID     | Gap                                                                              | Severidade          | Horas | Prioridade | Impacto UX                                          |
| ------ | -------------------------------------------------------------------------------- | ------------------- | ----: | ---------- | --------------------------------------------------- |
| UX-A01 | Filtros ad-hoc (não usa FilterBar padrão)                                        | Alta → **Ajustado** |     8 | Alta       | Rompe padrão canônico — core do PRD de padronização |
| UX-A02 | Kanban manual (não usa KanbanBoard genérico)                                     | Média               |     6 | Média      | Perde DnD, a11y e animações                         |
| UX-T01 | Título "Provedores de LM" vs "Fornecedores IA"                                   | Baixa               |     1 | Alta       | Inconsistência com sidebar e PRD — confusão         |
| UX-T03 | SplitView de Modelos sem Cockpit dedicado                                        | Média               |     6 | Média      | Detalhe inline inconsistente com outros módulos     |
| UX-T04 | Bug: Kanban de Modelos muda `provider_id` mas action só atualiza `display_order` | Alta → **Ajustado** |     3 | Alta       | Bug funcional — dados não persistem corretamente    |
| UX-T07 | DashboardHeader sem prop `actions` padronizada                                   | Média               |     4 | Média      | Botão "Criar" fora do componente rompe layout       |

### Ajustes de severidade

- **UX-A01**: Elevado de "Média" para **Alta** — PRD é sobre padronização. Filtros ad-hoc são o oposto.
- **UX-T01**: Prioridade elevada para **Alta** — quick win de consistência.
- **UX-T04**: Severidade elevada para **Alta** — é um bug funcional, não cosmético.

---

## 4. Gaps transversais — UX Universal

| ID     | Gap                                                        | Severidade | Horas | Prioridade | Impacto UX                     |
| ------ | ---------------------------------------------------------- | ---------- | ----: | ---------- | ------------------------------ |
| UX-U01 | Baseline de acessibilidade WCAG AA ausente                 | Alta       |    16 | Alta       | PRD exige A11y                 |
| UX-U02 | Feedback async sem padrão único                            | Média      |     6 | Média      | Experiência fragmentada        |
| UX-U03 | Empty states e loading states inconsistentes entre módulos | Média      |     8 | Média      | Percepção de produto inacabado |
| UX-U04 | Feature flags para novas visualizações não implementadas   | Média      |     6 | Média      | Risk gate para QA              |

---

## 5. Respostas ao @architect

### Resposta 1 — Banner ERP: posicionamento

**Recomendação: AMBOS — topo de página + inline no card de detalhes.**

- **Topo (variant `page`):** Abaixo do `DashboardHeader`, antes dos KPIs. Texto: "Fonte: ERP Espaider — somente leitura. Atualizado às {timestamp}". Cor: `blue-50`/`blue-200` (informativo, não alarmante).
- **Inline (variant `card`):** No topo do `CronogramaCockpit`/`ProjectCockpit`. Formato mais compacto: ícone + "Somente leitura · Atualizado {relative time}".
- **Link:** Incluir "Como editar? Acesse o ERP →" com link configurável por tenant.

### Resposta 2 — Kanban read-only: variante visual

**Sim, precisa de adaptação visual:**

- Remover cursor `grab` dos cards
- Remover drop indicators (highlight de coluna)
- Manter hover para seleção (abre SplitView)
- Adicionar prop `readOnly` ao `KanbanBoard` que desabilita DnD internamente
- Card sem ação de arrastar, mas com clique para detalhes

### Resposta 3 — Tabela no mobile (7 colunas)

**Scroll horizontal com colunas fixas:**

- **Colunas fixas (visíveis sempre):** Nome (sticky left), Status (badge)
- **Colunas com scroll:** Projeto, Início, Fim, Responsável, Fase
- **Breakpoint < 640px:** Alternar para lista de cards (não tabela) com informações essenciais empilhadas

### Resposta 4 — Campos para omitir em mobile

Em viewports < 768px (tablet):
- Ocultar: Fase, Projeto (acessível via card de detalhes)
- Manter: Nome, Status, Início, Fim, Responsável

Em viewports < 640px (mobile):
- Fallback para cards compactos: Nome + Status badge + Início/Fim + Responsável

### Resposta 5 — Feedback async

**Sonner como base, com regras:**

| Contexto              | Pattern                          | Componente                     |
| --------------------- | -------------------------------- | ------------------------------ |
| Sync global (sucesso) | Toast success                    | `sonner.success()`             |
| Sync global (erro)    | Toast error + retry              | `sonner.error()` + botão retry |
| Save (CRUD)           | Toast success inline             | `sonner.success()`             |
| Erro de validação     | Inline error na form             | Mensagem abaixo do campo       |
| Loading longo (> 2s)  | Skeleton + progress              | Skeleton existente             |
| Estado transitório    | `idle → loading → success/error` | State machine explícito        |

### Resposta 6 — Baseline de acessibilidade

**Checklist mínimo antes de liberar:**

1. ✅ Navegação completa por teclado (Tab, Enter, Escape)
2. ✅ Foco visível consistente (`focus-visible` ring)
3. ✅ `aria-live="polite"` para mudanças de conteúdo (filtros, sync)
4. ✅ Contraste mínimo AA (4.5:1 para texto, 3:1 para elementos UI)
5. ✅ Labels em todos os inputs (não só placeholder)
6. ✅ Tooltips acessíveis (role + aria-describedby)

**Validação:** axe DevTools em cada módulo + teste manual com leitor de tela.

### Resposta 7 — Estados (empty/loading/error)

**Reutilizar componentes existentes com padronização:**

- `EmptyState` → Manter, mas padronizar textos/ações por módulo
- `skeletons.tsx` → Manter, criar variantes para tabela e Kanban
- **Criar:** `ErrorRetry` componente → mensagem de erro + botão retry + ação de fallback
- **Padrão de estados:** Todo componente de dados deve implementar `idle | loading | error | empty | data`

---

## 6. Recomendações de design

### Padrão canônico (PRD) — ordem de implementação

1. **Criar `ErpReadOnlyBanner`** — componente reutilizável com variants `page` e `card`
2. **Padronizar `DashboardHeader`** — adicionar prop `actions` + `subtitle` dinâmico
3. **Migrar filtros do Agentes** para `FilterBar` padrão
4. **Implementar Kanban Cronogramas** — `KanbanBoard` com prop `readOnly`
5. **Implementar Tabela Cronogramas** — substituir card grid
6. **Sidebar** — reorganizar grupos conforme PRD

### Tokens semânticos sugeridos

| Token                  | Uso                      | Valor sugerido |
| ---------------------- | ------------------------ | -------------- |
| `--status-atrasado`    | Badge "Atrasada"         | `red-500`      |
| `--status-pendente`    | Badge "Pendente"         | `amber-500`    |
| `--status-em-execucao` | Badge "Em Execução"      | `blue-500`     |
| `--status-concluido`   | Badge "Concluída"        | `green-500`    |
| `--erp-banner-bg`      | Background do banner ERP | `blue-50`      |
| `--erp-banner-border`  | Border do banner ERP     | `blue-200`     |

### Microinterações para sync/save/erro

- **Sync:** Botão com spinner → toast success → badge "Atualizado há 2s" (fade in)
- **Save (CRUD):** Shake sutil em erro + highlight do campo → toast success em sucesso
- **Erro de rede:** Banner inline com "Falha na conexão" + retry automático com countdown

---

*Documento gerado em 2026-02-28 por @ux-design-expert (Uma) — Brownfield Discovery Phase 6*
*Status: APPROVED WITH CHANGES — Pronto para Phase 7 (@qa)*
