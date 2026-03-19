# ESPAIDER-MODERNIZATION-009: Split Mappers (One Per Entity)

**Epic:** EPIC-ESPAIDER-MODERNIZATION
**Phase:** D (Modularity & Error Handling)
**Priority:** 🟠 HIGH (improves maintainability)
**Effort:** 1 day
**Owner:** @dev (Dex)
**Status:** READY

---

## Goal

Split monolithic mapper file into individual files (one per entity type) for better maintainability and testability.

---

## Acceptance Criteria

- [ ] Create separate mapper files: project-mapper.ts, delivery-mapper.ts, contact-mapper.ts, task-mapper.ts
- [ ] Each mapper file <200 LOC (single responsibility)
- [ ] Export factory function: `mapEspaiderToProject(record): Project`
- [ ] All mappers accept validated Zod-typed data
- [ ] 95%+ test coverage (unit tests for each mapper)
- [ ] Zero breaking changes to sync pipeline

---

## File Structure

```
src/integrations/espaider/mappers/
├── index.ts (re-export all mappers)
├── project-mapper.ts (NEW)
├── delivery-mapper.ts (NEW)
├── contact-mapper.ts (NEW)
├── task-mapper.ts (NEW)
└── __tests__/
    ├── project-mapper.test.ts (NEW)
    ├── delivery-mapper.test.ts (NEW)
    ├── contact-mapper.test.ts (NEW)
    └── task-mapper.test.ts (NEW)
```

---

## Implementation

**project-mapper.ts:**
```typescript
export function mapEspaiderToProject(
  record: z.infer<typeof RegistroEspaiderSchema>
): Project {
  return {
    id: record.nomeInterno,
    nome_projeto: getFieldValue(record, 'nomeProjeto'),
    data_inicio: parseDate(getFieldValue(record, 'dataInicio')),
    // ...
  }
}

function getFieldValue(record: RegistroEspaider, fieldName: string): string | null {
  return record.campos.find(c => c.nomeInterno === fieldName)?.valor ?? null
}
```

---

## File List

**Create:**
- [ ] `src/integrations/espaider/mappers/project-mapper.ts`
- [ ] `src/integrations/espaider/mappers/delivery-mapper.ts`
- [ ] `src/integrations/espaider/mappers/contact-mapper.ts`
- [ ] `src/integrations/espaider/mappers/task-mapper.ts`
- [ ] `src/integrations/espaider/mappers/index.ts` (re-exports)
- [ ] `src/integrations/espaider/mappers/__tests__/project-mapper.test.ts`
- [ ] `src/integrations/espaider/mappers/__tests__/delivery-mapper.test.ts`
- [ ] `src/integrations/espaider/mappers/__tests__/contact-mapper.test.ts`
- [ ] `src/integrations/espaider/mappers/__tests__/task-mapper.test.ts`

**Modify:**
- [ ] `src/integrations/espaider/sync/espaider-sync.ts` (import from new structure)

---

## Validation Checklist

```bash
npm run typecheck
npm run lint
npm run build
npm test -- src/integrations/espaider/mappers/
npm test -- --coverage src/integrations/espaider/mappers/
```

Expected:
- ✅ All tests pass
- ✅ Coverage ≥95%

---

## Commit Message

```
refactor: Split mappers into individual entity files

- Extract mapper logic into separate files (project, delivery, contact, task)
- Each file <200 LOC (single responsibility)
- Export factory functions accepting validated Zod types
- Add comprehensive unit tests for each mapper

Improves maintainability and testability.
```

---

**Story Status:** ✅ READY FOR ASSIGNMENT
**Assigned to:** @dev (Dex)
**Blocked by:** ESPAIDER-MODERNIZATION-002
**Blocks:** ESPAIDER-MODERNIZATION-010
