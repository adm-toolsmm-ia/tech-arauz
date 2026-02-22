# FASE 3 — Filtros Rápidos 2.0 Executável
## Expandir Cobertura de Filtros Operacionais

**Data Início**: 2026-02-21  
**Fase**: 3/6  
**Executor**: @dev (com validação @po)  
**Duração Estimada**: 4-5 horas  

---

## 1. OBJETIVO

Implementar 4 **filtros rápidos novos** + **3 presets operacionais** no componente `ProjectFilters.tsx`, expandindo a cobertura de filtros de 4 para 8 rápidos e adicionando salvamento de combinações de filtros para fluxos operacionais comuns (Revisão Semanal, Projetos Críticos, Meus Projetos).

---

## 2. ESCOPO

### O que ENTRA
- ✅ Adicionar 4 filtros rápidos novos (baseados em dados reais do banco)
- ✅ Implementar 3 presets operacionais salvos/carregáveis
- ✅ Estender busca textual para campos: `objetivo`, `justificativa`, `mensagem_movimentacao`
- ✅ Melhorar UX de filtros: debounce, agrupamento visual, indicadores de atividade
- ✅ Matriz completa filtro → campo para documentação

### O que NÃO ENTRA
- ❌ Refatorar Kanban/Cards (Fase 4)
- ❌ Alterar contrato de dados
- ❌ Implementar salvamento em banco (presets em localStorage apenas, Fase posterior)

---

## 3. ARQUIVOS-ALVO

| Arquivo | Mudança | Tipo |
|---|---|---|
| [src/components/filters/ProjectFilters.tsx](src/components/filters/ProjectFilters.tsx) | Adicionar 4 filtros rápidos; implementar presets; estender busca | MODIFICAR |
| [src/components/filters/ProjectFilters.tsx](src/components/filters/ProjectFilters.tsx) | Atualizar interface `ProjectFilterState` | EVOLUIR |
| [src/lib/utils/filter-helpers.ts](src/lib/utils/filter-helpers.ts) | Helpers para presets (novo arquivo, opcional) | NOVO (opcional) |

---

## 4. ESPECIFICAÇÃO FUNCIONAL DOS FILTROS

### FILTROS RÁPIDOS (4 novos)

#### F1: PRÓXIMOS 7 DIAS
- **Métrica**: Projetos com prazo ≤ 7 dias (não importa qual prazo)
- **Campos usados**: `end_date`, `prazo_fase`, `prazo_cronograma`
- **Lógica**:
  ```typescript
  const nextSevenDays = projects.filter(p => {
    const now = new Date();
    const prazosCriticos = [
      p.end_date ? new Date(p.end_date) : null,
      p.prazo_fase ? new Date(p.prazo_fase) : null,
      p.prazo_cronograma ? new Date(p.prazo_cronograma) : null,
    ].filter(Boolean);
    
    return prazosCriticos.some(prazo => {
      const diasRestantes = (prazo!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diasRestantes <= 7 && diasRestantes > 0;
    });
  }).length;
  ```
- **Ícone**: `Calendar` (lucide-react)
- **Cor**: `warning` (âmbar)
- **Aplicar filtro**: Custom logic `proximos_7_dias: true` (novo campo em ProjectFilterState)

#### F2: SEM MOVIMENTAÇÃO
- **Métrica**: Projetos sem atualização há 30+ dias
- **Campos usados**: `data_movimentacao`, `last_update`
- **Lógica**: (idêntica ao KPI "Sem Movimentação")
- **Ícone**: `Clock` (lucide-react)
- **Cor**: `warning`
- **Aplicar filtro**: `sem_movimento: true` (novo campo)

#### F3: COM ATRASOS
- **Métrica**: Projetos com atividades (`schedules`) atrasadas
- **Campos usados**: `schedules[].atrasado`
- **Lógica**:
  ```typescript
  const withDelays = projects.filter(p =>
    p.schedules?.some(s => s.atrasado === true)
  ).length;
  ```
- **Ícone**: `AlertTriangle` (lucide-react)
- **Cor**: `destructive` (vermelho)
- **Aplicar filtro**: `com_atrasos: true` (novo campo)

#### F4: ALTO IMPACTO OPERACIONAL
- **Métrica**: Projetos com `impacto_operacional` = "Alto"
- **Campos usados**: `impacto_operacional`
- **Lógica**:
  ```typescript
  const highOpImpact = projects.filter(p =>
    (p.impacto_operacional || '').toLowerCase() === 'alto'
  ).length;
  ```
- **Ícone**: `TrendingUp` (lucide-react)
- **Cor**: `primary` (azul)
- **Aplicar filtro**: `impacto_operacional_alto: true` (novo campo)

---

### PRESETS OPERACIONAIS (3 iniciais)

#### P1: MEUS PROJETOS
- **Composição**: `responsavel: [usuário.name]` + `status: ['em execução']`
- **Descrição**: "Projetos onde você é responsável e estão em execução"
- **Ícone**: `User`
- **Nota**: Requer contexto de usuário (localStorage ou via props)

#### P2: PROJETOS CRÍTICOS
- **Composição**: 
  - `prioridade: ['urgente', 'alta']` OU
  - `impacto_estrategico: ['Alto']` OU
  - `impacto_operacional: ['Alto']` OU
  - `proximos_7_dias: true`
- **Descrição**: "Todos os projetos críticos por prioridade ou impacto"
- **Ícone**: `Zap`

#### P3: REVISÃO SEMANAL
- **Composição**:
  - `proximos_7_dias: true` (prioritário)
  - `com_atrasos: true` (secundário)
  - `sem_movimento: false` (ativo)
  - `concluidos: false` (ocultar concluídos)
- **Descrição**: "Vista semanal: próximos vencimentos + atrasos"
- **Ícone**: `Calendar`

---

### BUSCA TEXTUAL ESTENDIDA

**Antes**: busca apenas em `project_name` e `espaider_code`

**Depois**: adicionar campos textuais estratégicos:
```typescript
const textFields = ['project_name', 'espaider_code', 'objetivo', 'justificativa', 'mensagem_movimentacao'];
const searchLower = filters.search.toLowerCase();

filteredBySearch = projects.filter(p =>
  textFields.some(field => {
    const value = p[field as keyof Project];
    return typeof value === 'string' && value.toLowerCase().includes(searchLower);
  })
);
```

**Performance**: Adicionar debounce de 300ms na busca (`React.useMemo` + dependência de `filters.search` com delay).

---

## 5. MATRIZ: Novo Filtro → Campo

| Filtro Rápido | Campo | Lógica | Interface | Fase |
|---|---|---|---|---|
| Próximos 7 dias | `prazo_*` | data ≤ 7d | `proximos_7_dias: boolean` | Fase 3 |
| Sem Movimentação | `data_movimentacao` | data > 30d | `sem_movimento: boolean` | Fase 3 |
| Com Atrasos | `schedules[].atrasado` | exists + true | `com_atrasos: boolean` | Fase 3 |
| Alto Impacto Op. | `impacto_operacional` | = "Alto" | `impacto_op_alto: boolean` | Fase 3 |
| (Preset) Meus Projetos | `responsible` + `status` | compose | preset name | Fase 3 |
| (Preset) Críticos | multi-field | OR logic | preset name | Fase 3 |
| (Preset) Revisão Semanal | multi-field | AND+OR logic | preset name | Fase 3 |

---

## 6. MUDANÇAS CONCRETAS

### 6.1 Em `src/components/filters/ProjectFilters.tsx` (interface)

**ANTES**:
```typescript
interface ProjectFilterState {
  search: string;
  status: string[];
  fase_atual: string[];
  // ... 10 outros campos
  importancia_especial: boolean | null;
  prazo_vencido: boolean;
  concluidos: boolean;
}
```

**DEPOIS** (adicionar 4 novos campos + preset):
```typescript
interface ProjectFilterState {
  search: string;
  status: string[];
  fase_atual: string[];
  // ... (todos os campos anteriores mantidos)
  importancia_especial: boolean | null;
  prazo_vencido: boolean;
  concluidos: boolean;
  // === NOVOS (Fase 3) ===
  proximos_7_dias: boolean;
  sem_movimento: boolean;
  com_atrasos: boolean;
  impacto_op_alto: boolean;
  preset?: 'meus_projetos' | 'criticos' | 'revisao_semanal';
}
```

### 6.2 Em `src/components/filters/ProjectFilters.tsx` (quick filters UI)

**LOCALIZAR**: Seção de "Quick Filters" (rápidos).

**ADICIONAR** 4 novos filtros rápidos após os 4 existentes:

```jsx
// Filtros rápidos NOVOS (após os 4 existentes)
<Button
  variant={filters.proximos_7_dias ? 'default' : 'outline'}
  size="sm"
  onClick={() => setFilters(prev => ({ ...prev, proximos_7_dias: !prev.proximos_7_dias }))}
  className="gap-1"
>
  <Calendar className="h-4 w-4" />
  Próximos 7 dias
</Button>

<Button
  variant={filters.sem_movimento ? 'default' : 'outline'}
  size="sm"
  onClick={() => setFilters(prev => ({ ...prev, sem_movimento: !prev.sem_movimento }))}
  className="gap-1"
>
  <Clock className="h-4 w-4" />
  Sem Movimento
</Button>

<Button
  variant={filters.com_atrasos ? 'default' : 'outline'}
  size="sm"
  onClick={() => setFilters(prev => ({ ...prev, com_atrasos: !prev.com_atrasos }))}
  className="gap-1"
>
  <AlertTriangle className="h-4 w-4" />
  Com Atrasos
</Button>

<Button
  variant={filters.impacto_op_alto ? 'default' : 'outline'}
  size="sm"
  onClick={() => setFilters(prev => ({ ...prev, impacto_op_alto: !prev.impacto_op_alto }))}
  className="gap-1"
>
  <TrendingUp className="h-4 w-4" />
  Alto Impacto
</Button>
```

### 6.3 Em `src/components/filters/ProjectFilters.tsx` (applyProjectFilters)

**Adicionar** lógica de filtro para cada novo campo (após filtro "concluidos"):

```typescript
// Próximos 7 dias
if (filters.proximos_7_dias) {
  filtered = filtered.filter(p => {
    const now = new Date();
    const prazosCriticos = [
      p.end_date ? new Date(p.end_date) : null,
      p.prazo_fase ? new Date(p.prazo_fase) : null,
      p.prazo_cronograma ? new Date(p.prazo_cronograma) : null,
    ].filter(Boolean);
    
    return prazosCriticos.some(prazo => {
      const diasRestantes = (prazo!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diasRestantes <= 7 && diasRestantes > 0;
    });
  });
}

// Sem Movimentação
if (filters.sem_movimento) {
  filtered = filtered.filter(p => {
    const now = new Date();
    const lastMove = p.data_movimentacao || p.last_update;
    if (!lastMove) return true;
    
    const diasSemMovimento = (now.getTime() - new Date(lastMove).getTime()) / (1000 * 60 * 60 * 24);
    return diasSemMovimento > 30;
  });
}

// Com Atrasos
if (filters.com_atrasos) {
  filtered = filtered.filter(p =>
    p.schedules?.some(s => s.atrasado === true)
  );
}

// Alto Impacto Operacional
if (filters.impacto_op_alto) {
  filtered = filtered.filter(p =>
    (p.impacto_operacional || '').toLowerCase() === 'alto'
  );
}
```

### 6.4 Em `src/components/filters/ProjectFilters.tsx` (busca estendida)

**Modificar** a lógica de busca para incluir campos textuais:

```typescript
if (filters.search) {
  const searchLower = normalize(filters.search);
  filtered = filtered.filter(p => {
    const fieldsToSearch = [
      p.project_name,
      p.espaider_code,
      p.objetivo,
      p.justificativa,
      p.mensagem_movimentacao,
    ];
    return fieldsToSearch.some(field => normalize(field || '') === searchLower);
  });
}
```

### 6.5 Em `src/components/filters/ProjectFilters.tsx` (presets)

**Adicionar** seção de presets (botões ou dropdown):

```jsx
<div className="flex gap-2 border-t pt-3">
  <Button
    variant={filters.preset === 'meus_projetos' ? 'default' : 'ghost'}
    size="sm"
    onClick={() => applyPreset('meus_projetos', setFilters)}
  >
    Meus Projetos
  </Button>
  <Button
    variant={filters.preset === 'criticos' ? 'default' : 'ghost'}
    size="sm"
    onClick={() => applyPreset('criticos', setFilters)}
  >
    Críticos
  </Button>
  <Button
    variant={filters.preset === 'revisao_semanal' ? 'default' : 'ghost'}
    size="sm"
    onClick={() => applyPreset('revisao_semanal', setFilters)}
  >
    Revisão Semanal
  </Button>
</div>
```

**Helper `applyPreset`**:
```typescript
function applyPreset(preset: string, setFilters: (fn: (prev: ProjectFilterState) => ProjectFilterState) => void) {
  switch (preset) {
    case 'meus_projetos':
      setFilters(prev => ({
        ...defaultFilters,
        status: ['em execução'],
        preset: 'meus_projetos',
      }));
      break;
    case 'criticos':
      setFilters(prev => ({
        ...defaultFilters,
        prioridade: ['urgente', 'alta'],
        impacto_op_alto: true,
        preset: 'criticos',
      }));
      break;
    case 'revisao_semanal':
      setFilters(prev => ({
        ...defaultFilters,
        proximos_7_dias: true,
        com_atrasos: true,
        concluidos: false,
        preset: 'revisao_semanal',
      }));
      break;
  }
}
```

---

## 7. CRITÉRIOS DE ACEITE

- ✅ 4 filtros rápidos novos funcionam e filtram corretamente (validar com 20+ projetos)
- ✅ 3 presets operacionais compõem filtros corretamente (aplicar + validar resultado)
- ✅ Busca textual estende para `objetivo`, `justificativa`, `mensagem_movimentacao`
- ✅ Debounce 300ms aplicado em busca (sem lag em input)
- ✅ Interface atualizada com novo campo `preset` opcional
- ✅ Nenhuma regressão em filtros existentes (4 rápidos + 13 avançados)
- ✅ `npm run lint`, `npm run typecheck`, `npm run build` passam
- ✅ Critério de UX: chegar a "Projetos Críticos" em máximo 1 click (preset)

---

## 8. RISCOS & MITIGAÇÃO

| Risco | Mitigation |
|---|---|
| **Lógica de filtro com bugs** | Testes com dados reais; validação visual de 10+ combinações |
| **Performance com muitos filtros** | Usar `React.useMemo` em `applyProjectFilters`; debounce em busca |
| **Regressão em filtros antigos** | Code review; testes regressivos dos 4 filtros + 13 avançados existentes |
| **Complexidade de presets** | Documentar cada preset com exemplo de use case |

---

## 9. PLANO DE VALIDAÇÃO

### UX
- [ ] Clicar "Próximos 7 dias" mostra apenas projetos com prazo ≤ 7d
- [ ] Clicar "Sem Movimento" mostra apenas 30+ dias sem atualização
- [ ] Clicar "Com Atrasos" filtra para projetos com `schedules.atrasado = true`
- [ ] Buscar por "objetivo" encontra projetos com keyword no campo
- [ ] Preset "Críticos" aplica em 1 click

### A11y
- [ ] Botões com role="button" ou `<button>` semântico
- [ ] Navegação por Tab funciona
- [ ] aria-label em presets

### Performance
- [ ] Filtro aplica em < 100ms (mesmo com 500 projetos)
- [ ] Busca com debounce não congela UI

### Funcional
- [ ] Combinação de filtros (ex: "Alta Prioridade" + "Próximos 7 dias") funciona
- [ ] Toggle OFF remove filtro
- [ ] Presets limpam filtro anterior e aplicam novo

---

## 10. ENTREGÁVEIS FASE 3

- ✅ Arquivo modificado: `ProjectFilters.tsx` (4 filtros + 3 presets + busca estendida)
- ✅ Documento: Matriz de filtros + presets
- ✅ Testes: Validação funcional de 20+ combinações de filtro
- ✅ Testes técnicos: lint, typecheck, build passando
- ✅ Evidência: Screenshot mostrando todos os 8 filtros rápidos + 3 presets

---

## 11. PRÓXIMO PASSO

**Fase 4**: Refatorar Kanban e Cards (reduzir densidade de informação, melhorar interação drag/click, acessibilidade WCAG AA).

**Gate**: @po valida cobertura de filtros (todos os casos de uso cobertos) antes de iniciar Fase 4.

---
