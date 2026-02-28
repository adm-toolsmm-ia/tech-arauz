# Story 2.16 — Fix getWeekStart() ISO-8601

Story ID: 2.16
Epic: PRD-UX-2026
Sprint: 1 — Fundação
Agente: @dev
Esforço: 2h
Prioridade: Alta (bug)
Gaps resolvidos: UX-C04, SYS-09

## Como usuário

Quero que a semana comece na segunda-feira (padrão brasileiro e ISO-8601), não no domingo, para que os dados na Agenda de Cronogramas estejam corretos.

## Critérios de aceite

- [ ] `getWeekStart()` retorna segunda-feira para qualquer data
- [ ] Testes unitários cobrem:
  - Segunda-feira → retorna segunda (mesma data)
  - Domingo → retorna segunda anterior
  - Quarta-feira → retorna segunda da mesma semana
  - Sábado → retorna segunda da mesma semana
- [ ] Nenhuma regressão na Agenda de Cronogramas
- [ ] `getWeekEnd()` (se existir) também ajustada para domingo

## Implementação

### Arquivo: `src/lib/domain/schedule-status.ts`

**Antes (bug):**
```typescript
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day); // domingo = 0, subtrai 0
  d.setHours(0, 0, 0, 0);
  return d;
}
```

**Depois (fix ISO-8601):**
```typescript
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - ((day + 6) % 7)); // segunda = 0
  d.setHours(0, 0, 0, 0);
  return d;
}
```

### Testes

- [ ] Unit: 4 casos (segunda, domingo, quarta, sábado)
- [ ] Unit: edge case — 1º de janeiro (virada de ano)
- [ ] Unit: edge case — fevereiro 29 (ano bissexto)

## Dependências

- Nenhuma (pode começar imediatamente, menor story do sprint)

## Definition of Done

- [ ] AC validados
- [ ] Bug fix aplicado
- [ ] Testes passando
- [ ] Code review aprovado
