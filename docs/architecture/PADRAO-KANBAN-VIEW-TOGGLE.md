# Padrão: Kanban + View Toggle (Arquitetura Unificada)

**Status:** ADR de facto  
**Data:** 2026-02-25  
**Responsável:** @architect + @aios-master  
**Objetivo:** Eliminar gap de desenvolvimento não padronizado — um único padrão para todos os módulos com Kanban.

---

## 1. Situação atual (gap identificado)

### 1.1 Módulo de **Projetos** (referência)

| Aspecto | Implementação |
|----------|----------------|
| **Fonte do toggle** | `FilterBar` + `filterRegistryProjetos.viewModes` |
| **Modos** | 2: `kanban` \| `list` |
| **Ícone Kanban** | **LayoutGrid** (Lucide) |
| **Ícone Lista** | **List** (Lucide) |
| **Estado** | `viewMode` via `useProjetosFilters` → `activeViewMode` |
| **Conteúdo Kanban** | `<KanbanBoard>` (componente compartilhado) |
| **Conteúdo Lista** | `<ProjectListView>` |

**Arquivos:**  
- `src/app/projetos/projects-content.tsx`  
- `src/lib/filters/filters-projetos.ts` (viewModes com `LayoutGrid`, `List`)  
- `src/components/filters/FilterBar.tsx` (renderiza botões a partir de `filterRegistry.viewModes`)

---

### 1.2 Módulo **Tipos de Agentes** (agent-types)

| Aspecto | Implementação |
|----------|----------------|
| **Fonte do toggle** | `FilterBar` + `filterRegistry` (agent-types) |
| **Modos** | 2: `kanban` \| `list` |
| **Ícone Kanban** | **LayoutGrid** |
| **Ícone Lista** | **List** |
| **Estado** | `viewMode` do hook, passado ao FilterBar |
| **Conteúdo** | `KanbanBoard` \| lista em cards |

**Conclusão:** Alinhado ao padrão Projetos (FilterBar + registry + LayoutGrid/List).

---

### 1.3 Módulo **Fornecedores** (lm-providers)

| Aspecto | Implementação |
|----------|----------------|
| **Fonte do toggle** | `FilterBar` + `filterRegistry` (lm-providers) |
| **Modos** | 2: `kanban` \| `list` |
| **Ícone Kanban** | **LayoutGrid** |
| **Ícone Lista** | **List** |
| **Estado** | `viewMode` do hook, passado ao FilterBar |
| **Conteúdo** | `KanbanBoard` \| lista |

**Conclusão:** Alinhado ao padrão Projetos.

---

### 1.4 Módulo **Modelos IA** (modelos-ia) — inconsistente

| Aspecto | Implementação |
|----------|----------------|
| **Fonte do toggle** | **Botões customizados** (FilterBar não controla view) |
| **Modos** | 3: `grid` \| `list` \| `kanban` |
| **Ícone Grid** | **LayoutGrid** |
| **Ícone Lista** | **List** |
| **Ícone Kanban** | **📊 (emoji)** — diferente do Projetos |
| **Estado** | `viewMode` local; FilterBar com `onViewModeChange={() => {}}` (desconectado) |
| **Conteúdo** | Grid de cards \| `ModelsListView` \| `KanbanBoard` |

**Gap:**  
- Não usa o view toggle do FilterBar (botões à parte).  
- Kanban com emoji em vez do ícone padrão (LayoutGrid).

---

### 1.5 Módulo **Agentes** (agentes) — inconsistente

| Aspecto | Implementação |
|----------|----------------|
| **Fonte do toggle** | **Botões customizados** (sem FilterBar para view) |
| **Modos** | 3: `grid` \| `list` \| `kanban` |
| **Ícone Grid** | **Grid3X3** (Lucide) — diferente do Projetos |
| **Ícone Lista** | **List** |
| **Ícone Kanban** | **Trello** (Lucide) — diferente do Projetos (LayoutGrid) |
| **Estado** | `viewMode` local |
| **Conteúdo** | Grid \| lista em cards \| Kanban custom (não usa `<KanbanBoard>`) |

**Gap:**  
- Sem FilterBar; ícones diferentes (Grid3X3, Trello).  
- Kanban implementado “na mão” em vez do componente compartilhado.

---

## 2. Resumo do gap

| Módulo        | Fonte do toggle | Ícone Kanban | Ícone Lista | Ícone Grid (se 3 modos) |
|---------------|-----------------|--------------|-------------|---------------------------|
| Projetos      | FilterBar       | LayoutGrid   | List        | —                         |
| Agent-types   | FilterBar       | LayoutGrid   | List        | —                         |
| Lm-providers  | FilterBar       | LayoutGrid   | List        | —                         |
| Modelos IA    | Custom buttons  | 📊 (emoji)   | List        | LayoutGrid                |
| Agentes       | Custom buttons  | Trello       | List        | Grid3X3                   |

Causa raiz:  
- Projetos, agent-types e lm-providers usam **FilterBar + filterRegistry.viewModes** com o mesmo par de ícones (LayoutGrid, List).  
- Modelos IA e Agentes usam **botões próprios** e ícones diferentes (emoji, Trello, Grid3X3), sem seguir o mesmo padrão.

---

## 3. Padrão único (decisão)

### 3.1 Regra geral

- **Sempre** usar **FilterBar** para o alternador de vista (não botões soltos no content).
- **Sempre** definir os modos e ícones em **filterRegistry** do módulo (`viewModes`).
- **Sempre** usar o **mesmo conjunto de ícones** para o mesmo tipo de modo em todo o app.

### 3.2 Ícones canônicos (Lucide)

| Modo   | Ícone        | Uso                                      |
|--------|--------------|------------------------------------------|
| Kanban | **LayoutGrid** | Colunas/board (igual Projetos)          |
| Lista  | **List**       | Tabela/lista                             |
| Grid   | **Grid3X3**    | Apenas quando existir 3º modo (cards em grade) |

Assim, em qualquer módulo, “Kanban” = sempre **LayoutGrid** (como em Projetos).

### 3.3 Módulos com 2 modos (Kanban | Lista)

- `viewModes`: `[{ id: 'kanban', label: 'Kanban', icon: LayoutGrid }, { id: 'list', label: 'Lista', icon: List }]`.
- Ex.: Projetos, Agent-types, Lm-providers (manter como estão).

### 3.4 Módulos com 3 modos (Grid | Lista | Kanban)

- `viewModes`:  
  - Grid: `Grid3X3`  
  - Lista: `List`  
  - Kanban: **LayoutGrid** (mesmo ícone do Projetos).
- Ex.: Modelos IA, Agentes (a ajustar).

### 3.5 Componente de conteúdo

- **Kanban:** sempre `<KanbanBoard>` (ou wrapper fino que delega a ele).  
- **Lista:** componente de lista/tabela do módulo (ex.: ProjectListView, ModelsListView).  
- **Grid:** quando existir, grid de cards do módulo.

---

## 4. Checklist de conformidade por módulo

Para cada módulo que tem Kanban/Lista (e eventualmente Grid):

- [ ] Usa **FilterBar** com `moduleId` e registry que inclui `viewModes`.
- [ ] `onViewModeChange` e `currentViewMode` estão ligados ao estado de view do módulo.
- [ ] Ícone de Kanban no registry = **LayoutGrid**.
- [ ] Ícone de Lista = **List**.
- [ ] Se houver 3º modo (grid de cards), ícone = **Grid3X3**.
- [ ] Conteúdo Kanban usa o componente compartilhado **KanbanBoard** (ou wrapper que o usa).
- [ ] Nenhum botão customizado de view fora do FilterBar (sem duplicar toggle).

---

## 5. Ações corretivas (resumo)

1. **Modelos IA**  
   - Trocar botões customizados por FilterBar como única fonte de view.  
   - Em `filters-modelos-ia.ts`: definir 3 viewModes com **Grid3X3**, **List**, **LayoutGrid** (Kanban).  
   - Conectar `onViewModeChange` ao `setViewMode` e passar `currentViewMode={viewMode}`.

2. **Agentes**  
   - Introduzir FilterBar (e, se não existir, `filterRegistry` para agentes) com viewModes.  
   - viewModes: Grid = **Grid3X3**, List = **List**, Kanban = **LayoutGrid**.  
   - Substituir os 3 botões atuais pelo selector de view do FilterBar.  
   - Se o Kanban de agentes não usar `<KanbanBoard>`, evoluir para usar (ou um wrapper que o use) para manter a mesma estrutura visual e de dados.

3. **Documentação**  
   - Manter este doc como referência e citá-lo em regras de front (ex.: project.mdc / component-patterns) para que novos módulos com Kanban sigam o mesmo padrão.

---

## 6. Referência de arquivos

| Papel | Caminho |
|-------|--------|
| FilterBar (selector de view) | `src/components/filters/FilterBar.tsx` |
| Tipos (ViewMode, FilterRegistry) | `src/lib/filters/filter-types.ts` |
| Registry Projetos | `src/lib/filters/filters-projetos.ts` |
| Registry Agent-types | `src/lib/filters/filters-agent-types.ts` |
| Registry Lm-providers | `src/lib/filters/filters-lm-providers.ts` |
| Registry Modelos IA | `src/lib/filters/filters-modelos-ia.ts` |
| KanbanBoard compartilhado | `src/components/views/KanbanBoard.tsx` |
| Projetos (referência) | `src/app/projetos/projects-content.tsx` |

---

---

## 7. Referência em regras do projeto

- Incluir em **Arquivos de referência** (ex.: `.cursor/rules/project.mdc`):  
  `docs/architecture/PADRAO-KANBAN-VIEW-TOGGLE.md`
- Novos módulos com Kanban: usar **FilterBar** + **filterRegistry.viewModes** e ícones **LayoutGrid** (Kanban), **List** (Lista), **Grid3X3** (Grade, se 3 modos).

---

**Assinado:** Orion (@aios-master) + Aria (@architect) — 2026-02-25
