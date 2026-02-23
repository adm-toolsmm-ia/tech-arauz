# Mapa Filtros x Colunas - Projetos & Cronogramas

> **Versão**: 1.0 | **Data**: 2026-02-23 | **Objetivo**: Definir dados a filtrar e dados a exibir

---

## 📊 Módulo: Projetos

### Dados Disponíveis

```
Tabela: projects
├─ id, tenant_id, espaider_id (metadados)
├─ codigo, titulo (identificação)
├─ status, prioridade, categoria (classificação)
├─ responsavel (atribuição)
├─ prazo_final (prazo)
├─ sync_status, last_sync_at (sincronização)
└─ created_at, updated_at (timestamps)
```

---

### Fase 1: QUICK FILTERS (Barra Rápida)

**Local**: Visível por padrão na barra (Popover quando inativo)

**Limite**: Max 5 filtros para não poluir UI

| # | ID Filtro | Label | Tipo | Opções | Icon | Prioridade | Justificativa |
|---|-----------|-------|------|--------|------|-----------|---------------|
| 1 | `status` | Status | multi-select | [Novo, Em Análise, Em Desenvolvimento, Em Homologação, Concluído, Cancelado, Suspenso] | CheckCircle2 | **P0** | Mais usado (60% consultas) |
| 2 | `prioridade` | Prioridade | multi-select | [Baixa, Normal, Alta] | AlertCircle | **P1** | Segundo filtro mais usado |
| 3 | `responsavel` | Responsável | multi-select | [Dinâmico: extractUniqueValues] | Users | **P2** | Atribuição importante |
| 4 | `prazo_final` | Prazo | date-range | - | Calendar | **P1** | Gerenciamento de prazos |
| - | `categoria` | Categoria | multi-select | [Dinâmico] | Folder | **P3** | Pode ir para Advanced |

**Recomendação**: Manter `status`, `prioridade`, `responsavel`, `prazo_final` como quick filters (4 filtros).

---

### Fase 2: ADVANCED FILTERS (Sheet Lateral)

**Local**: Botão "Filters" → Sheet deslizante

| ID Filtro | Tipo | Campo SQL | Valores |
|-----------|------|-----------|---------|
| `status` | multi-select | projects.status | ← Mesmo do quick |
| `prioridade` | multi-select | projects.prioridade | ← Mesmo do quick |
| `responsavel` | multi-select | projects.responsavel | ← Mesmo do quick |
| `prazo_final` | date-range | projects.prazo_final | ← Mesmo do quick |
| `categoria` | multi-select | projects.categoria | [Dinâmico] |
| `created_at` | date-range | projects.created_at | Range de datas |

---

### Colunas de Visualização: KANBAN

**Vista**: Colunas por status

```
┌─────────────┬─────────────┬──────────────┬────────────┬──────────┐
│    Novo     │ Em Análise  │ Em Progresso │ Homolog.   │ Concluído│
├─────────────┼─────────────┼──────────────┼────────────┼──────────┤
│ [Card]      │ [Card]      │ [Card]       │ [Card]     │ [Card]   │
│             │             │              │            │          │
│ Título      │ Título      │ Título       │ Título     │ Título   │
│ Responsável │ Responsável │ Responsável  │ Responsável│ Responsável
│ Prioridade  │ Prioridade  │ Prioridade   │ Prioridade │ Prioridade
│ Prazo: XX   │ Prazo: XX   │ Prazo: XX    │ Prazo: XX  │ Prazo: XX
│ [Ações]     │ [Ações]     │ [Ações]      │ [Ações]    │ [Ações]   │
└─────────────┴─────────────┴──────────────┴────────────┴──────────┘
```

**Campos do Card**:
1. `titulo` (bold) - Título do projeto
2. `responsavel` (subtle) - Quem é responsável
3. `prioridade` (badge: color) - Cor conforme prioridade (Alta=red, Normal=yellow, Baixa=gray)
4. `prazo_final` (subtle) - Data limite
5. `codigo` (very subtle) - Código Espaider (referência)

---

### Colunas de Visualização: LISTA

**Vista**: Tabela com informações detalhadas

| Coluna | Campo SQL | Tipo | Largura | Sortável | Filtável |
|--------|-----------|------|---------|----------|----------|
| Código | `codigo` | string | 100px | ✅ | ✅ |
| Título | `titulo` | string | flex | ✅ | ✅ |
| Status | `status` | badge | 120px | ✅ | ✅ |
| Prioridade | `prioridade` | badge | 100px | ✅ | ✅ |
| Responsável | `responsavel` | string | 150px | ✅ | ✅ |
| Prazo | `prazo_final` | date | 100px | ✅ | ✅ |
| Atualizado | `updated_at` | date | 100px | ✅ | ✅ |

---

### SearchBar (Integrada na FilterBar)

**Campos Pesquisáveis**:
```typescript
searchFields: ['titulo', 'codigo', 'categoria']
```

**Exemplo**:
```
Busca: "REST API"
Resultado: Projetos com titulo ILIKE '%REST API%' OR codigo ILIKE '%REST API%'
```

---

### View Mode Toggle

**Opções**:
1. **Kanban** (padrão) - Visualização por colunas de status
2. **Lista** - Tabela tradicional com scroll

**Implementação**: `viewModes` array no FilterRegistry

---

## 📅 Módulo: Cronogramas

### Dados Disponíveis

```
Tabela: project_schedules
├─ id, tenant_id, espaider_id (metadados)
├─ project_id (relação com projects)
├─ atividade (descrição)
├─ responsavel (atribuição)
├─ status (Pendente, Em Progresso, Concluída, Atrasada, Cancelada)
├─ data_inicio, data_fim (datas)
└─ created_at, updated_at (timestamps)
```

---

### Fase 1: QUICK FILTERS (Barra Rápida)

| # | ID Filtro | Label | Tipo | Opções | Icon | Prioridade |
|---|-----------|-------|------|--------|------|-----------|
| 1 | `project_id` | Projeto | select | [Dinâmico: projects] | Building2 | **P0** | Contexto principal |
| 2 | `status` | Status | multi-select | [Pendente, Em Progresso, Concluída, Atrasada, Cancelada] | CheckCircle | **P0** | Organização por status |
| 3 | `responsavel` | Responsável | multi-select | [Dinâmico] | Users | **P1** | Atribuição |
| 4 | `data_fim` | Prazo | date-range | - | Calendar | **P1** | Prazos importantes |

**Recomendação**: Manter estes 4 (max) como quick filters.

---

### Fase 2: ADVANCED FILTERS (Sheet Lateral)

| ID Filtro | Tipo | Campo SQL |
|-----------|------|-----------|
| `project_id` | select | project_schedules.project_id |
| `status` | multi-select | project_schedules.status |
| `responsavel` | multi-select | project_schedules.responsavel |
| `data_inicio` | date-range | project_schedules.data_inicio |
| `data_fim` | date-range | project_schedules.data_fim |
| `created_at` | date-range | project_schedules.created_at |

---

### Colunas de Visualização: TIMELINE / GANTT

**Vista**: Timeline horizontal (futuro)

```
┌───────────────────────────────────────────────────────────────┐
│ Cronograma de Projetos - Visualization Timeline              │
├────────┬─────────────┬──────────────────────────────────────┤
│Ativid. │Responsável  │ Jan  │ Fev  │ Mar  │ Abr  │ Mai  │Jun│
├────────┼─────────────┼──────┼──────┼──────┼──────┼──────┼───┤
│Design  │João Silva   │██████│      │      │      │      │   │
│Backend │Maria Santos│      │██████│██████│      │      │   │
│QA      │Pedro Costa │      │      │██████│██████│      │   │
│Deploy  │João Silva   │      │      │      │      │██████│███
└────────┴─────────────┴──────┴──────┴──────┴──────┴──────┴───┘
```

**v1.0**: Usar Lista (mais simples)

---

### Colunas de Visualização: LISTA (v1.0)

| Coluna | Campo SQL | Tipo | Largura | Sortável | Filtável |
|--------|-----------|------|---------|----------|----------|
| Projeto | `project_id` → projects.titulo | link | 200px | ❌ | ✅ |
| Atividade | `atividade` | string | flex | ✅ | ✅ |
| Status | `status` | badge | 120px | ✅ | ✅ |
| Responsável | `responsavel` | string | 150px | ✅ | ✅ |
| Início | `data_inicio` | date | 100px | ✅ | ✅ |
| Fim | `data_fim` | date | 100px | ✅ | ✅ |
| Dias Restantes | Cálculo: `data_fim - TODAY()` | number | 80px | ✅ | ❌ |

---

### SearchBar (Integrada na FilterBar)

**Campos Pesquisáveis**:
```typescript
searchFields: ['atividade', 'responsavel']
```

---

## 🔗 Mapeamento: FilterDefinition → UI/DB

### Tabela de Referência Rápida

| Módulo | Filtro | Tipo | Multi? | Rápido? | SQL Field | Opcoes Dinâmicas? |
|--------|--------|------|--------|---------|-----------|------------------|
| **Projetos** | status | select | ✅ | ✅ | projects.status | ❌ |
| | prioridade | select | ✅ | ✅ | projects.prioridade | ❌ |
| | responsavel | select | ✅ | ✅ | projects.responsavel | ✅ |
| | categoria | select | ✅ | ❌ | projects.categoria | ✅ |
| | prazo_final | date-range | - | ✅ | projects.prazo_final | ❌ |
| | created_at | date-range | - | ❌ | projects.created_at | ❌ |
| **Cronogramas** | project_id | select | ❌ | ✅ | project_schedules.project_id | ✅ (via JOIN) |
| | status | select | ✅ | ✅ | project_schedules.status | ❌ |
| | responsavel | select | ✅ | ✅ | project_schedules.responsavel | ✅ |
| | data_inicio | date-range | - | ❌ | project_schedules.data_inicio | ❌ |
| | data_fim | date-range | - | ✅ | project_schedules.data_fim | ❌ |

---

## 🎨 Design Tokens para Badges

**Status Projetos**:
```
- Novo: gray-500
- Em Análise: blue-500
- Em Desenvolvimento: purple-500
- Em Homologação: cyan-500
- Concluído: green-500
- Cancelado: red-500
- Suspenso: gray-400
```

**Prioridade**:
```
- Alta: red-500
- Normal: yellow-500
- Baixa: green-500
```

**Status Cronogramas**:
```
- Pendente: gray-500
- Em Progresso: blue-500
- Concluída: green-500
- Atrasada: red-500
- Cancelada: gray-400
```

---

## 📐 Contagem de Componentes

### Projetos (v1.0)
- **Quick Filters**: 4 (status, prioridade, responsavel, prazo_final)
- **Advanced Filters**: 6 (+ categoria, created_at)
- **Search Fields**: 3 (titulo, codigo, categoria)
- **View Modes**: 2 (kanban, list)
- **Colunas Kanban**: 5 (titulo, responsavel, prioridade, prazo, codigo)
- **Colunas Lista**: 7 (codigo, titulo, status, prioridade, responsavel, prazo, updated_at)

### Cronogramas (v1.0)
- **Quick Filters**: 4 (project_id, status, responsavel, data_fim)
- **Advanced Filters**: 6 (+ data_inicio, created_at)
- **Search Fields**: 2 (atividade, responsavel)
- **View Modes**: 1 (list) [Timeline para v1.1]
- **Colunas Lista**: 7 (projeto, atividade, status, responsavel, inicio, fim, dias_restantes)

---

## ✅ Checklist de Implementação

- [ ] Criar `filters-projetos.ts` com 6 FilterDefinitions
- [ ] Criar `filters-cronogramas.ts` com 6 FilterDefinitions
- [ ] Implementar `useProjetosFilters` hook
- [ ] Implementar `useCronogramasFilters` hook
- [ ] Integrar `<FilterBar>` em projetos-content.tsx
- [ ] Integrar `<FilterBar>` em cronogramas-content.tsx
- [ ] Componente KanbanBoard para Projetos
- [ ] Componente Lista (Table) para Cronogramas
- [ ] SearchBar integrada em FilterBar
- [ ] View Mode Toggle (Kanban/List)
- [ ] Persistência de filtros (localStorage)
- [ ] Testes de filtragem (unit + integration)

---

**Próximos Passos**: Fase 2.3 (filter-data-context-projetos-cronogramas.md)

**Mantido por**: @data-engineer + @dev | **Data**: 2026-02-23
