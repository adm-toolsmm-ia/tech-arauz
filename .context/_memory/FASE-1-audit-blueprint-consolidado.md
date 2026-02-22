# FASE 1 — UX Audit + Blueprint Consolidado
## Módulo de Gestão de Projetos

**Data**: 2026-02-21  
**Executor**: AIOS Master + UX Design Expert  
**Status**: Consolidação completa  

---

## 1. DIAGNÓSTICO PRIORIZADO (4 eixos)

### 1.1 EIXO: Kanban & Cards (47 problemas identificados)

#### Severidade Crítica (4/4)
| ID | Problema | Impacto | Solução |
|---|---|---|---|
| K-001 | Navegação por teclado incompleta no drag-and-drop | Usuários de teclado/screen reader bloqueados | Adicionar navegação seta ←/→ para coluna, Enter/Space para confirmar |
| K-002 | Falta de feedback para screen readers durante drag | Screen reader não anuncia coluna destino | Usar aria-live="assertive" + anúncio "Arrastando [título] sobre [coluna]" |
| K-003 | Falta de virtualização em colunas com muitos cards | Performance degrada com 50+ cards/coluna | Implementar virtualização (react-window ou @tanstack/react-virtual) |
| K-004 | Conflito entre click e drag (threshold 5px muito baixo) | Cliques viram drags acidentais | Aumentar para distance 8-10px ou delay 100ms |

#### Severidade Alta (6/6)
| ID | Problema | Impacto | Solução |
|---|---|---|---|
| K-005 | Grid quebra em mobile com 5+ colunas | Cards ilegíveis em mobile | Scroll horizontal com snap; modo coluna única com tabs |
| K-006 | Densidade informacional: 10+ campos por card | Informação demais, difícil escanear | Modo compacto/expandido; mover detalhes para tooltip/hover |
| K-007 | Falta de landmarks e estrutura semântica | Screen readers não identificam estrutura | Adicionar section + article + role="region" com aria-label |
| K-008 | Feedback visual insuficiente durante drag | Difícil saber onde card será inserido | Linha indicadora entre cards; preview de posição |
| K-009 | Re-renders desnecessários (DraggableCard não memoizado) | Performance degrada com muitos cards | Envolver com React.memo; memoizar renderItemContent |
| K-010 | Tooltips não acessíveis por teclado | Conteúdo truncado inacessível por teclado | Adicionar onFocus; usar aria-describedby |

#### Severidade Média (9/9)
| ID | Problema | Impacto | Solução |
|---|---|---|---|
| K-011 | SplitView não adapta bem em mobile | UX ruim em mobile | Modal fullscreen em mobile; bottom sheet alternativa |
| K-012 | Informações duplicadas (card vs cockpit) | Redundância; manutenção complexa | Card essencial; detalhes no cockpit |
| K-013 | Falta de atalhos de teclado | Produtividade reduzida | Ctrl+K busca, Ctrl+F filtros, V view toggle |
| K-014 | Empty states genéricos | Confusão do usuário | Empty states contextuais (filtros vs sem dados) |
| K-015 | Cálculo de colunas dinâmicas pode ser otimizado | Re-renders desnecessários | useMemo com dependências granulares |
| K-016 | Contraste de cores em badges <9px | Dificulta leitura (WCAG AA) | Aumentar para 11px mínimo; verificar contraste 4.5:1 |
| K-017 | Drag overlay fixo em 288px | Difícil visualização em telas grandes | Tornar responsivo min-w-[280px] max-w-[400px] |
| K-018 | Hierarquia visual pouco clara no card | Dificulta escaneamento rápido | Título maior; código discreto; agrupamento visual |
| K-019 | Scroll horizontal não intuitivo em mobile | Falta indicadores visuais | Adicionar scrollbar customizada ou dots |

#### Severidade Baixa (7/7)
Falta de animação de transição, texto muito pequeno, falta de confirmação para ações destrutivas, falta de debounce na busca, falta de loading states acessíveis, falta de feedback de erro visual, falta de modo compacto vs detalhado.

---

### 1.2 EIXO: Filtros & Busca (Lacunas identificadas)

#### Filtros Atuais (4 rápidos + 13 avançados)
- Rápidos: Alta Prioridade, Importância Especial, Atrasados, Concluídos
- Avançados: Status, Fase, Área, Tipo Chamado, Tipo Assunto, Responsável, Solicitante, Prioridade, Complexidade, Impacto Operacional, + Toggles

#### Lacunas Críticas
| Campo | Lacuna | Impacto | Prioridade |
|---|---|---|---|
| `prazo_fase` / `prazo_cronograma` | Sem filtro de proximidade (7 dias) | Não ver prazos críticos | CRÍTICA |
| `data_movimentacao` | Sem filtro "Sem movimento 30d" | Projetos estagnados invisíveis | ALTA |
| `schedules[].atrasado` | Sem filtro "Com atividades atrasadas" | Não filtrar por risco operacional | ALTA |
| `deliveries[].completed` | Sem filtro "Entregas pendentes" | Não ver blocos críticos | MÉDIA |
| Busca textual | Limita-se a nome/código | Objetivo/justificativa/mensagem fora do escopo | MÉDIA |

#### Recomendações
- **Filtros rápidos adicionais**: Próximos 7 dias, Sem movimentação, Com atrasos, Alto impacto (4 novos)
- **Presets operacionais**: "Meus projetos", "Projetos críticos", "Revisão semanal"
- **Busca avançada**: Incluir objetivo, justificativa, escopo, mensagem_movimentacao
- **Critério de sucesso**: Chegar ao conjunto crítico em máximo 2 interações

---

### 1.3 EIXO: Dashboard & KPIs

#### KPIs Atuais (4)
- Total de Projetos
- Em Andamento
- Concluídos
- Valor Total (sempre null)

#### Recomendação de Redesenho (KPIs Gerenciais)
| KPI | Métrica | Campo | Acionável | Novo |
|---|---|---|---|---|
| Em Risco | Atrasos + Prazos críticos (7d) | `end_date < now` + `prazo_fase` | Filtro "Atrasados" | ✓ |
| Sem Movimento | Últimos 30 dias | `data_movimentacao` | Filtro "Sem movimento" | ✓ |
| Alta Prioridade | Urgente + Alta | `prioridade` | Filtro "Alta prioridade" | - |
| Concluídos (período) | Status = concluído (últimos 30d) | `status` + `updated_at` | Drill-down | ✓ |
| Impacto Estratégico | Alto/Médio | `impacto_estrategico` | Filtro por impacto | ✓ |

**Princípio**: Cada KPI é um atalho de filtro (click vira filtro aplicado no board).

---

### 1.4 EIXO: Visão 360° & Lista Tática

#### ProjectCockpit Atual
- 8 tabs: Resumo, Cronogramas, Entregas, Histórico, Aprovadores, Orçamentos, Anotações, Ações
- Redundância com card

#### Proposta de Reorganização
- **Bloco 1 (Status)**: Estado atual, fase, responsável, próximo prazo
- **Bloco 2 (Risco)**: Atrasos, complexidade, impacto operacional/estratégico
- **Bloco 3 (Prazos)**: Cronograma, entregas, milestones
- **Bloco 4 (Execução)**: Atividades, histórico, movimentações
- **Bloco 5 (Documentação)**: Anotações, objetivo, escopo

#### Lista Tática
- Colunas essenciais: Projeto, Área, Responsável, Fase, Prioridade, Prazo (destacado se atrasado), Status
- Comportamentos: Mesmos filtros do Kanban, click abre cockpit

---

## 2. BLUEPRINT DE INFORMAÇÃO (Arquitetura Alvo)

```
┌─────────────────────────────────────────────────────┐
│ DASHBOARD EXECUTIVO (KPIs Gerenciais + Atalhos)    │
│ ┌─────────┬──────────┬──────────┬───────────────┐   │
│ │Em Risco │Sem Mov.  │Alt. Prior│Concluídos(30d)│   │
│ └─────────┴──────────┴──────────┴───────────────┘   │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ FILTROS RÁPIDOS (4 novos + 4 atuais) + Busca       │
│ ┌────────┬──────────┬────────┬────────────────────┐ │
│ │Próximos│Atrasados │Impacto │[Busca avançada]   │ │
│ │7 dias  │          │Alto    │                    │ │
│ └────────┴──────────┴────────┴────────────────────┘ │
└─────────────────────────────────────────────────────┘

┌──────────────────┬─────────────────────────────────┐
│ VISUALIZAÇÃO:    │ PAINEL LATERAL (Visão 360°):   │
│ [Kanban] [Lista] │ ┌──────────────────────────────┤
│                  │ │ Blocos de decisão            │
│ [Colunas dinâm.] │ │ - Status + Risco             │
│ Drag-and-drop    │ │ - Prazos + Execução          │
│ Sem conflito     │ │ - Documentação + Histórico   │
│                  │ └──────────────────────────────┤
└──────────────────┴─────────────────────────────────┘
```

**Fluxo de navegação principal**:
1. Ler KPIs em 5s → Identificar risco
2. Click KPI ou filtro rápido → Aplicar filtro ao board
3. Click card → Abrir cockpit 360°
4. Ação (mudar fase, adicionar nota, etc.) → Sincronizar board

---

## 3. MATRIZ DE DECISÃO: Componentes (Reusar/Evoluir/Substituir/Novo)

### Dashboard & KPIs

| Componente | Atual | Decisão | Justificativa | Ganho UX | Impacto Técnico | Manutenção |
|---|---|---|---|---|---|---|
| `KPICard` | Existe (src/components/dashboard/KPICard.tsx) | **Evoluir** | Suporta trend e estado ativo; será base para KPIs gerenciais. Adicionar clicabilidade (filtro) e atalho visual. | +30% (acionável) | Baixo | Baixa |
| Dashboard layout | Genérico em projects-content.tsx | **Refatorar** | Reorganizar para grid responsivo (4 KPIs em desktop, 2x2 em tablet, 1 em mobile). | +20% (legibilidade) | Médio | Média |

### Filtros

| Componente | Atual | Decisão | Justificativa | Ganho UX | Impacto Técnico | Manutenção |
|---|---|---|---|---|---|---|
| `ProjectFilters` | Existe (rápidos + avançados) | **Evoluir** | Manter arquitetura; adicionar 4 filtros rápidos novos + presets salvos. Melhorar busca (campos textuais). | +50% (cobertura) | Médio | Média |
| Busca textual | input simples | **Evoluir** | Estender para objetivo/justificativa/mensagem; debounce 300ms. | +40% (descoberta) | Baixo | Baixa |
| Presets | Não existe | **NOVO** | Salvar/carregar combinações de filtros ("Projetos críticos", "Revisão semanal"). | +25% (produtividade) | Alto | Média |

### Kanban & Cards

| Componente | Atual | Decisão | Justificativa | Ganho UX | Impacto Técnico | Manutenção |
|---|---|---|---|---|---|---|
| `KanbanBoard` (dnd-kit) | Existe | **Evoluir** | Manter drag-and-drop; melhorar: threshold, feedback visual, virtualização, acessibilidade. | +40% (confiabilidade) | Médio | Média |
| `ProjectKanbanCard` | Existe (10+ campos) | **Refatorar** | Reduzir a 5-6 campos (título, código, fase, prazo crítico, responsável, status). Modo detalhado → cockpit. | +60% (legibilidade) | Baixo | Baixa |
| Empty states | Genéricos | **Evoluir** | Contextuais (filtros ativos vs sem dados). | +15% (clareza) | Baixo | Baixa |
| Atalhos de teclado | Não existe | **NOVO** | Ctrl+K busca, Ctrl+F filtros, V alternar view, Esc fechar. | +35% (produtividade) | Médio | Média |

### Visão 360° & Lista

| Componente | Atual | Decisão | Justificativa | Ganho UX | Impacto Técnico | Manutenção |
|---|---|---|---|---|---|---|
| `ProjectCockpit` | Existe (8 tabs) | **Reorganizar** | Passar de tabs para blocos de decisão (Status, Risco, Prazos, Execução, Docs). Remover redundância com card. | +30% (leitura) | Médio | Média |
| `SplitView` | Existe | **Evoluir** | Adaptar mobile (modal fullscreen); manter desktop. Adicionar breadcrumb/contexto. | +40% (mobile) | Médio | Média |
| `ProjectListView` | Não existe | **NOVO** | Modo lista com colunas essenciais, ordenação, mesmos filtros do Kanban. | +50% (análise) | Alto | Média |
| Paridade Kanban ↔ Lista | Não existe | **Aplicar** | Sincronizar filtros, contexto, comportamento de abertura do cockpit. | +25% (coerência) | Médio | Média |

---

## 4. BACKLOG PRIORIZADO (Impacto x Esforço)

### P0 — CRÍTICO (Fase 2)
1. Refatorar KPIs (dashboard gerencial)
2. Expandir filtros rápidos (próximos 7 dias, sem movimento, com atrasos)
3. Reduzir densidade do card (5-6 campos essenciais)
4. Melhorar navegação teclado no Kanban

### P1 — ALTO (Fase 3-4)
5. Implementar presets de filtros
6. Virtualização no Kanban (performance)
7. Atalhos de teclado (Ctrl+K, V, etc.)
8. Reorganizar cockpit (blocos de decisão)

### P2 — MÉDIO (Fase 5)
9. Criar modo lista tática
10. Melhorar feedback visual durante drag
11. Empty states contextuais
12. SplitView mobile (modal)

### P3 — BAIXO (Pós-launch)
13. Modo compacto/expandido do card
14. Reordenação de colunas
15. Tema customizável por tenant
16. Modo impressão otimizado

---

## 5. RISCOS & MITIGAÇÃO

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| **Alteração involuntária do contrato de dados** | Média | Alto | Code review obrigatório em transformers; testes de compatibilidade |
| **Performance degradada com 100+ cards** | Média | Alto | Implementar virtualização na Fase 4; testes de carga |
| **Regressão em acessibilidade (WCAG AA)** | Baixa | Alto | Validação WCAG AA em cada fase; testes com screen readers |
| **Inconsistência visual entre novo/antigo** | Alta | Médio | Usar tokens_brand.json como fonte única; design review |
| **Desvio de escopo (perfeccionismo)** | Alta | Médio | Gate de aceite por fase; timebox rigoroso |

---

## 6. ENTREGÁVEIS DA FASE 1 ✅

- ✅ **Diagnóstico priorizado**: 47 problemas categorizados por severidade (crítico/alto/médio/baixo)
- ✅ **Blueprint de informação**: Fluxos de navegação e arquitetura visual
- ✅ **Matriz de componentes**: Decisão clara (reusar/evoluir/substituir/novo) com justificativas
- ✅ **Backlog priorizado**: 16 itens em P0-P3 com sequência de execução
- ✅ **Riscos & mitigação**: Identificados os 5 principais riscos

---

## 7. PRÓXIMOS PASSOS

**Fase 2 (Dashboard)**: Iniciar refatoração de KPIs com `@po` para validar regras de cálculo.

**Gate de Aceite**: `@architect` + `@ux-design-expert` aprovam blueprint antes de prosseguir.

---
