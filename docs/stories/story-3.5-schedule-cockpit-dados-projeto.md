# Story 3.5 — ScheduleCockpit: Popular tabs com dados reais do projeto vinculado

Story ID: 3.5
Epic: Épico 3 — Cronogramas Ajustes Gerais
Sprint: 5 — Padronização de UI
Agente: @dev
Esforço: 3h
Prioridade: Média-Alta
Status: Draft

## Como usuário

Como gestor clicando em uma atividade de cronograma,
quero visualizar as informações completas do projeto vinculado (entregas, histórico, aprovadores, orçamentos) no painel lateral,
para ter uma visão 360° sem precisar navegar até o módulo de Projetos.

## Contexto

O `ScheduleCockpit` já possui a estrutura de tabs correta (7 tabs: Detalhes Cronograma, Detalhes, Anotações, Entregas, Histórico, Aprovadores, Ações), mas as tabs que dependem dos dados do projeto recebem arrays vazios, exibindo "Nenhum registro".

**Root cause:** O `page.tsx` de Cronogramas faz um query Supabase que busca apenas campos básicos do projeto (`id, titulo, codigo, status, fase_atual`), sem buscar as relações (`histories`, `approvers`, `budgets`, `deliveries`).

O `CronogramaCockpit.tsx` passa esses dados para o `ScheduleCockpit` com arrays vazios hardcoded:
```tsx
projectDeliveries={[]}
projectHistories={[]}
projectApprovers={[]}
projectBudgets={[]}
```

**Solução:** Expandir o query do `page.tsx` para incluir as relações do projeto via nested select do Supabase, e propagar esses dados através do `CronogramaData` type e `CronogramaCockpit`.

**Referência de tipo:** `src/app/projetos/projects-content.tsx` define o tipo `Project` com todas as relações necessárias.

**Referência de query:** `src/app/projetos/page.tsx` — busca projetos com todas as relações aninhadas.

## Critérios de aceite

- [ ] O query em `cronogramas/page.tsx` inclui as relações do projeto:
  - `project_histories` (histories do projeto)
  - `project_approvers` (aprovadores)
  - `project_budgets` (orçamentos)
  - `project_deliveries` (entregas)
- [ ] O tipo `CronogramaData` (em `src/hooks/useCronogramasFilters.ts`) é atualizado para refletir os campos adicionais do projeto
- [ ] `CronogramaCockpit.tsx` passa os dados reais do projeto ao `ScheduleCockpit` (substituindo arrays vazios)
- [ ] A tab **"Entregas"** exibe as entregas reais do projeto vinculado (ou mensagem "Nenhuma entrega" se zero)
- [ ] A tab **"Histórico"** exibe os históricos reais do projeto vinculado
- [ ] A tab **"Aprovadores"** exibe os aprovadores reais do projeto vinculado
- [ ] A tab **"Orçamentos"** exibe os orçamentos reais do projeto vinculado
- [ ] A tab **"Detalhes Cronograma"** é renomeada para **"Atividade"** (primeiro tab, padrão ao abrir)
- [ ] Nenhuma regressão nas demais funcionalidades do módulo Cronogramas
- [ ] `npm run lint` sem erros
- [ ] `npm run typecheck` sem erros de tipo

## Implementação necessária

### 1. Atualizar query em `src/app/cronogramas/page.tsx`

Expandir o nested select para incluir relações do projeto:

```typescript
const { data: schedules, error } = await supabase
  .from('project_schedules')
  .select(`
    *,
    project:projects(
      id,
      titulo,
      codigo,
      status:status_original,
      fase_atual,
      histories:project_histories(id, type, from, to, step_from, step_to, message, date),
      approvers:project_approvers(id, type, responsible),
      budgets:project_budgets(id, value, supplier, date, currency),
      deliveries:project_deliveries(id, description, deadline, completed)
    )
  `)
  .order('data_fim', { ascending: true });
```

> **Nota de performance:** O query retorna todos os schedules com os dados completos do projeto. Como projetos se repetem entre cronogramas, os dados do projeto são retornados múltiplas vezes. Isso é aceitável para o volume atual de dados (verificar se o Supabase duplica ou referencia — comportamento de nested select). Se houver problema de performance, considerar query separada por project_id único como otimização futura.

### 2. Atualizar tipo `CronogramaData` em `src/hooks/useCronogramasFilters.ts`

O tipo do campo `project` precisa incluir as relações. Verificar a definição atual e adicionar os campos:

```typescript
project?: {
  id: string;
  titulo: string | null;
  codigo: string | null;
  status: string | null;
  fase_atual: string | null;
  // Novos campos:
  histories?: Array<{
    id: string;
    type: string;
    from: string;
    to: string;
    step_from: string;
    step_to: string;
    message: string;
    date: string;
  }>;
  approvers?: Array<{
    id: string;
    type: string;
    responsible: string;
  }>;
  budgets?: Array<{
    id: string;
    value: number;
    supplier: string;
    date: string;
    currency: string;
  }>;
  deliveries?: Array<{
    id: string;
    description: string;
    deadline: string;
    completed: boolean;
  }>;
} | null;
```

### 3. Atualizar `src/app/cronogramas/components/CronogramaCockpit.tsx`

Substituir arrays vazios pelos dados reais do `selectedSchedule?.project`:

```tsx
<ScheduleCockpit
  schedule={selectedSchedule}
  onClose={onClose}
  project={selectedSchedule?.project || undefined}
  projectSchedules={allSchedules.filter((s) => s.project_id === selectedSchedule?.project_id)}
  projectDeliveries={selectedSchedule?.project?.deliveries || []}
  projectHistories={selectedSchedule?.project?.histories || []}
  projectApprovers={selectedSchedule?.project?.approvers || []}
  projectBudgets={selectedSchedule?.project?.budgets || []}
/>
```

### 4. Renomear primeira tab em `src/components/cronogramas/ScheduleCockpit.tsx`

Trocar "Detalhes Cronograma" por "Atividade":

```tsx
// ANTES
<TabsTrigger value="detalhes-cronograma" ...>
  <Calendar className="mr-2 size-4" />
  Detalhes Cronograma
</TabsTrigger>
<TabsContent value="detalhes-cronograma" ...>

// DEPOIS
<TabsTrigger value="atividade" ...>
  <Calendar className="mr-2 size-4" />
  Atividade
</TabsTrigger>
<TabsContent value="atividade" ...>
```

E atualizar `defaultValue` do `Tabs`:
```tsx
<Tabs defaultValue="atividade" className="w-full">
```

## Dependências

- `project_histories`, `project_approvers`, `project_budgets`, `project_deliveries` — tabelas já existentes no banco (criadas em migrations anteriores) ✅
- RLS policies dessas tabelas já permitem leitura via join ✅
- Pode ser implementada após ou em paralelo com 3.1-3.4 (arquivos diferentes)

## Riscos e observações

- **Performance:** O nested select retorna dados de projeto duplicados por cronograma. Monitorar se há impacto perceptível de latência. Solução de otimização futura: buscar projetos únicos separadamente e fazer merge client-side.
- **Nomes de tabelas:** Verificar os nomes exatos das tabelas no banco (`project_histories` vs `histories`, `project_approvers` vs `approvers`, etc.) para garantir que o nested select usa o nome correto. Consultar migrations em `supabase/migrations/`.

## Definition of Done

- [ ] Query expandido com relações do projeto
- [ ] Tipo `CronogramaData.project` inclui arrays de histories/approvers/budgets/deliveries
- [ ] `CronogramaCockpit.tsx` passa dados reais (não arrays vazios)
- [ ] Tabs Entregas, Histórico, Aprovadores e Orçamentos populadas com dados reais
- [ ] Primera tab renomeada para "Atividade"
- [ ] Sem regressão no módulo Cronogramas
- [ ] `npm run lint` ✅
- [ ] `npm run typecheck` ✅

## File List

- `src/app/cronogramas/page.tsx` (MODIFICAR — expandir query com relações do projeto)
- `src/hooks/useCronogramasFilters.ts` (MODIFICAR — atualizar tipo CronogramaData.project)
- `src/app/cronogramas/components/CronogramaCockpit.tsx` (MODIFICAR — passar dados reais ao ScheduleCockpit)
- `src/components/cronogramas/ScheduleCockpit.tsx` (MODIFICAR — renomear tab "Atividade" e defaultValue)
