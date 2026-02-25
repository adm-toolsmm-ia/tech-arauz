# ADR-006: Centralização do Período em Cronogramas

**Data:** 2025-02-25  
**Status:** PROPOSTO (implementação em progresso)  
**Responsáveis:** @architect (design), @dev (implementação)

---

## Contexto

Atualmente, o módulo Cronogramas tem **dois sistemas de período independentes**:

1. **FilterBar → agendaPeriod** (controla visualização de Agenda)
2. **CronogramaGantt → viewMode interno** (controla visualização do Gantt)

**Resultado:** Período da Agenda não sincroniza com período do Gantt. Ao trocar de período em um, o outro não responde.

### Problema de UX

```
Usuario clica "Semana" no Gantt
  ↓
Gantt muda para "Semana"
  ↓
FilterBar ainda mostra "Dia"
  ↓
Estado duplicado, confusão de UX
```

---

## Decisão

**Centralizar o período em um único estado (`calendarPeriod`) no hook `useCronogramasFilters`.**

- Uma única fonte de verdade para `calendarPeriod: 'day' | 'week' | 'month'`
- FilterBar **lê** e **controla** `calendarPeriod`
- Agenda **lê** `calendarPeriod` e renderiza baseado nele
- Gantt **lê** `calendarPeriod` e ajusta coluna (day/week/month) baseado nele

---

## Consequências

### ✅ Benefícios

- UX consistente: período sincronizado entre Agenda e Gantt
- Arquitetura limpa: single source of truth
- Fácil manutenção: mudança de período em um lugar afeta todos
- Escalável: outros views (Timeline, etc.) usam mesmo sistema

### ⚠️ Trade-offs

- Refatoração de CronogramaGantt (remove `viewMode` interno)
- FilterBar precisa exibir período global (não apenas "agendaPeriod")
- Testes precisam ser atualizados

---

## Implementação

### Estrutura Nova

```typescript
// useCronogramasFilters.ts
const [calendarPeriod, setCalendarPeriod] = useState<'day' | 'week' | 'month'>('day');

return {
  calendarPeriod,
  setCalendarPeriod,
  // ... filters, search, etc
};
```

### Em cronogramas-content.tsx

```typescript
const { calendarPeriod, setCalendarPeriod } = useCronogramasFilters(schedules);

// FilterBar controla período global
<FilterBar
  onCalendarPeriodChange={setCalendarPeriod}
  currentCalendarPeriod={calendarPeriod}
/>

// Agenda renderiza conforme período
{viewMode === 'agenda' && calendarPeriod === 'month' ? <MonthView /> : ...}

// Gantt renderiza conforme período (sem viewMode interno)
{viewMode === 'gantt' && <CronogramaGantt calendarPeriod={calendarPeriod} />}
```

### Em CronogramaGantt.tsx

```typescript
interface CronogramaGanttProps {
  schedules: Schedule[];
  projectIds: string[];
  calendarPeriod: 'day' | 'week' | 'month'; // único período global
  onActivityClick?: (schedule: Schedule) => void;
}

// Remove viewMode interno
// Usa calendarPeriod para determinar columnWidth
const columnWidth = calendarPeriod === 'month' ? 250 : calendarPeriod === 'week' ? 150 : 60;
```

---

## Alternativas Consideradas

### Alternativa 1: Manter duplicado (REJEITADA)
- Mantém status quo com período duplicado
- UX ruim, confusão de estado

### Alternativa 2: Sincronizar via efeitos (REJEITADA)
- UseEffect para sincronizar dois estados
- Acoplamento fraco, difícil de debugar

### **Alternativa 3: Centralizar (ESCOLHIDA)**
- Período em um lugar (`useCronogramasFilters`)
- Todos os components leem do mesmo estado
- Limpo, explícito, fácil de testar

---

## Arquivos Afetados

| Arquivo | Mudança |
|---------|---------|
| `src/hooks/useCronogramasFilters.ts` | Adicionar `calendarPeriod` + `setCalendarPeriod` |
| `src/app/cronogramas/cronogramas-content.tsx` | Usar `calendarPeriod` centralizado |
| `src/components/cronogramas/CronogramaGantt.tsx` | Remover `viewMode` interno, usar `calendarPeriod` |
| `src/lib/filters/filter-types.ts` | Adicionar `onCalendarPeriodChange` em FilterBarProps |
| `src/components/filters/FilterBar.tsx` | Exibir período global (fora do modo Agenda-only) |

---

## Critérios de Sucesso

- [ ] Período é compartilhado entre Agenda e Gantt
- [ ] Trocar período em um afeta o outro automaticamente
- [ ] FilterBar mostra período global (não apenas agendaPeriod)
- [ ] Lint: sem erros
- [ ] Typecheck: sem erros
- [ ] Testes passam

---

## Próximo Passo

✅ **Implementação com validação antes de liberar**
