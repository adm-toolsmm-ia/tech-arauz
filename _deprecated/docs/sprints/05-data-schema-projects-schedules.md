# Análise de Schema - Projects e Project_Schedules

> **Versão**: 1.0 | **Data**: 2026-02-23 | **Para**: Refatoração de Filtros Fase 2

---

## Sumário

Este documento mapeia campos filtráveis dos módulos **Projetos** e **Cronogramas**, alinhando-os com a arquitetura de filtros estabelecida em Fase 1.

---

## Tabela: `projects`

### Descrição
Projetos sincronizados do Espaider. Tabela principal com dados gerais do projeto.

### Campos Disponíveis

| Campo | Tipo | Filtro? | Operações | Notas |
|-------|------|---------|-----------|-------|
| `id` | UUID | ❌ | - | Chave primária (não filtrável) |
| `tenant_id` | UUID | ❌ | - | Isolamento (RLS automático) |
| `espaider_id` | INTEGER | ❌ | - | Referência externa (não filtrável) |
| `codigo` | TEXT | ✅ | contains | Código único do projeto |
| `titulo` | TEXT | ✅ | contains, exact | Nome/título do projeto |
| `status` | TEXT | ✅ | exact, multi | **Filtro Principal** (Novo, Ativo, Concluído, Cancelado) |
| `responsavel` | TEXT | ✅ | exact, multi | Pessoa responsável |
| `prioridade` | TEXT | ✅ | exact, multi | Normal, Alta, Baixa |
| `categoria` | TEXT | ✅ | exact, multi | Categoria/tipo do projeto |
| `prazo_final` | DATE | ✅ | date-range | Data limite do projeto |
| `sync_status` | TEXT | ❌ | - | Metadados de sincronização |
| `last_sync_at` | TIMESTAMPTZ | ❌ | - | Metadados de sincronização |
| `created_at` | TIMESTAMPTZ | ✅ | date-range | Data de criação |
| `updated_at` | TIMESTAMPTZ | ✅ | date-range | Data de atualização |
| `espaider_raw` | JSONB | ❌ | - | Dados brutos (não filtrável) |

### Índices Disponíveis

```sql
-- Índices otimizados para filtros
idx_projects_status         -- Filtrar por status
idx_projects_prioridade     -- Filtrar por prioridade
idx_projects_responsavel    -- Filtrar por responsável
idx_projects_prazo_final    -- Range de prazo
```

### Valores Conhecidos de `status`

```
- 'Novo'                    (Projeto recém-criado)
- 'Em Análise'              (Sob análise)
- 'Em Desenvolvimento'      (Em progresso)
- 'Em Homologação'          (Validação)
- 'Concluído'               (Finalizado)
- 'Cancelado'               (Cancelado)
- 'Suspenso'                (Parado temporariamente)
```

---

## Tabela: `project_schedules` (Cronogramas)

### Descrição
Cronogramas/atividades de projetos. Relação 1:N com `projects`.

### Campos Disponíveis

| Campo | Tipo | Filtro? | Operações | Notas |
|-------|------|---------|-----------|-------|
| `id` | UUID | ❌ | - | Chave primária |
| `tenant_id` | UUID | ❌ | - | Isolamento (RLS automático) |
| `project_id` | UUID | ✅ | exact | **FK** para projects |
| `espaider_id` | INTEGER | ❌ | - | Referência externa |
| `atividade` | TEXT | ✅ | contains | Nome/descrição da atividade |
| `responsavel` | TEXT | ✅ | exact, multi | Responsável pela atividade |
| `data_inicio` | DATE | ✅ | date-range | Data de início |
| `data_fim` | DATE | ✅ | date-range | Data de término |
| `status` | TEXT | ✅ | exact, multi | Status da atividade |
| `created_at` | TIMESTAMPTZ | ✅ | date-range | Data de criação |
| `updated_at` | TIMESTAMPTZ | ✅ | date-range | Data de atualização |
| `espaider_raw` | JSONB | ❌ | - | Dados brutos |

### Índices Disponíveis

```sql
idx_project_schedules_project_id   -- Filtrar por projeto
idx_project_schedules_tenant_id    -- Isolamento
```

### Valores Conhecidos de `status`

```
- 'Pendente'                (Não iniciada)
- 'Em Progresso'            (Iniciada)
- 'Concluída'               (Finalizada)
- 'Atrasada'                (Passou prazo)
- 'Cancelada'               (Cancelada)
```

---

## Tabelas Relacionadas (Filhos de Projects)

### `project_deliveries` (Entregas)

| Campo | Tipo | Filtro? |
|-------|------|---------|
| `project_id` | UUID | ✅ |
| `titulo` | TEXT | ✅ |
| `status` | TEXT | ✅ (Pendente, Concluída, Atrasada) |
| `data_prevista` | DATE | ✅ |
| `data_realizada` | DATE | ✅ |

### `project_requirements` (Requisitos)

| Campo | Tipo | Filtro? |
|-------|------|---------|
| `project_id` | UUID | ✅ |
| `codigo` | TEXT | ✅ |
| `descricao` | TEXT | ✅ |
| `tipo` | TEXT | ✅ |
| `prioridade` | TEXT | ✅ |
| `status` | TEXT | ✅ |

---

## Estratégia de Filtros por Módulo

### Módulo: Projetos

**Campos Recomendados para Quick Filters** (max 5):
1. `status` (multi-select) - Mais usado
2. `prioridade` (multi-select)
3. `responsavel` (multi-select)
4. `prazo_final` (date-range)

**Campos para Advanced Filters**:
- Todos os acima +
- `categoria` (multi-select)
- `created_at` (date-range)
- `titulo` / `codigo` (search na barra)

**Exemplo de Aplicação**:
```typescript
// Filtro: status IN ('Em Desenvolvimento', 'Em Homologação')
// AND prioridade = 'Alta'
// AND prazo_final >= '2026-03-01'
const filtered = projects.filter(p =>
  ['Em Desenvolvimento', 'Em Homologação'].includes(p.status) &&
  p.prioridade === 'Alta' &&
  new Date(p.prazo_final) >= new Date('2026-03-01')
);
```

---

### Módulo: Cronogramas

**Campos Recomendados para Quick Filters** (max 5):
1. `status` (multi-select) - Mais usado
2. `responsavel` (multi-select)
3. `project_id` (select) - Filtrar por projeto
4. `data_fim` (date-range) - Prazos

**Campos para Advanced Filters**:
- Todos os acima +
- `data_inicio` (date-range)
- `atividade` (search)

---

## Padrão de Filtro por Tipo de Campo

### TEXT (titulo, atividade, codigo)
- **Padrão UI**: Search input
- **Operação**: Contains (case-insensitive)
- **Implementação**:
```typescript
searchFields: ['titulo', 'codigo']  // useFI filterState com search
```

### TEXT com Valores Enumeados (status, prioridade, responsavel, categoria)
- **Padrão UI**: Select ou Multi-Select
- **Operação**: IN (multi) ou = (single)
- **Descoberta de Valores**: `extractUniqueValues(data, 'status')`
- **Implementação**:
```typescript
{
  id: 'status',
  type: 'multi-select',
  options: [
    { label: 'Em Desenvolvimento', value: 'em_desenvolvimento' },
    { label: 'Concluído', value: 'concluido' },
  ]
}
```

### DATE (prazo_final, data_inicio, data_fim, created_at)
- **Padrão UI**: Date Range (2x input[type=date])
- **Operação**: Between (data_inicio >= X AND data_fim <= Y)
- **Implementação**:
```typescript
{
  id: 'prazo_final',
  type: 'date-range',
  label: 'Prazo Final'
}
```

### UUID (project_id)
- **Padrão UI**: Select (options via parent context)
- **Operação**: =
- **Implementação**:
```typescript
{
  id: 'project_id',
  type: 'select',
  options: () => projects.map(p => ({ label: p.titulo, value: p.id }))
}
```

---

## Query Patterns (PostgreSQL)

### Pattern 1: Multi-filtro com AND

```sql
SELECT * FROM projects
WHERE tenant_id = $1
  AND status = ANY(ARRAY['Em Desenvolvimento', 'Em Homologação']::text[])
  AND prioridade = 'Alta'
  AND prazo_final >= '2026-03-01'
  AND prazo_final <= '2026-06-30'
ORDER BY prazo_final ASC;
```

**Índices utilizados**: `idx_projects_status`, `idx_projects_prioridade`, `idx_projects_prazo_final`

### Pattern 2: Full-text search + Filtros

```sql
SELECT * FROM projects
WHERE tenant_id = $1
  AND (titulo ILIKE '%busca%' OR codigo ILIKE '%busca%')
  AND status = ANY(ARRAY['Em Desenvolvimento']::text[])
ORDER BY updated_at DESC;
```

### Pattern 3: Range com Date

```sql
SELECT * FROM project_schedules
WHERE tenant_id = $1
  AND project_id = $2
  AND data_fim >= $3 AND data_fim <= $4
ORDER BY data_fim ASC;
```

---

## Limitações & Considerações

### 1. Valores de Status Não Normalizados

⚠️ **Problema**: Status são TEXT, não enumerados, causando inconsistências.

**Solução Recomendada** (v1.1):
```sql
-- Criar tabela de enumeração
CREATE TABLE public.project_statuses (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  code TEXT NOT NULL,
  label TEXT NOT NULL,
  color TEXT,
  UNIQUE(tenant_id, code)
);
```

### 2. Dados Dinâmicos (responsavel, categoria)

Valores dinâmicos por tenant e projeto. Usar `extractUniqueValues()` para descoberta:

```typescript
const responsavelOptions = buildFilterOptions(
  projects,
  'responsavel',
  (v) => v  // label = value
);
```

### 3. Performance com Grandes Datasets

- **Limite**: 10.000 projetos máximo recomendado para client-side filtering
- **Alternativa**: Server-side filtering via Supabase query para datasets maiores

---

## Mapeamento Sugerido: FilterDefinition → SQL

| FilterDefinition | Campo SQL | Operador | Índice |
|------------------|-----------|----------|--------|
| `status` (multi-select) | `status` | `IN` | ✅ idx_projects_status |
| `prioridade` (multi-select) | `prioridade` | `IN` | ✅ idx_projects_prioridade |
| `responsavel` (multi-select) | `responsavel` | `IN` | ✅ idx_projects_responsavel |
| `prazo_final` (date-range) | `prazo_final` | `>= AND <=` | ✅ idx_projects_prazo_final |
| `titulo` (search) | `titulo` | `ILIKE` | ❌ (recomendado criar) |
| `codigo` (search) | `codigo` | `ILIKE` | ❌ (recomendado criar) |

---

## Próximos Passos

1. ✅ Fase 2.1 (Atual): Documentar schema ← **VOCÊ ESTÁ AQUI**
2. 🔄 Fase 2.2: Mapear filtros x colunas
3. ⏳ Fase 2.3: Redação de filter-data-context
4. ⏳ Quality gates finais

---

**Mantido por**: @dev | **Última atualização**: 2026-02-23
