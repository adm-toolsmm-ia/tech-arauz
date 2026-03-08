# TypeScript Strict Mode — Fix Patterns & Examples
**Story:** 6.1 — TypeScript Strict Mode Enablement
**Subtask:** 6.1.2 — Core Library Type Fixes (DEMO)
**Date:** 2026-03-08
**Status:** Sample patterns documented

---

## Pattern 1: Type Assertions (`as` keyword)

### ❌ BEFORE — Using `as` escape

```typescript
// src/lib/domain/project-health.ts (line 33)
const datesToCheck = [project.end_date, project.prazo_cronograma]
  .filter(Boolean)
  .map((d) => new Date(d as string)); // ⚠️ Type assertion bypass
```

**Issue:** `as string` bypasses type safety. TypeScript trusts us but doesn't verify.

### ✅ AFTER — Type guard + proper narrowing

```typescript
const datesToCheck = [project.end_date, project.prazo_cronograma]
  .filter((d): d is string => typeof d === 'string')
  .map((d) => new Date(d)); // ✅ Type-safe, no assertion
```

**Benefit:**
- Type guard ensures `d` is actually a string
- No assertion needed
- If `d` is null/undefined, it's filtered out
- TypeScript verifies the logic

---

## Pattern 2: Function Return Types (Explicit)

### ❌ BEFORE — Inferred return type

```typescript
// Inferred return type (implicit)
export function getOverdueData(
  project: OverdueProjectLike,
  referenceDate = new Date(),
) {
  return { isOverdue: false, maxDays: 0 };
}
```

### ✅ AFTER — Explicit return type

```typescript
interface OverdueResult {
  isOverdue: boolean;
  maxDays: number;
}

export function getOverdueData(
  project: OverdueProjectLike,
  referenceDate: Date = new Date(),
): OverdueResult {
  return { isOverdue: false, maxDays: 0 };
}
```

**Benefit:**
- Return type is explicit and documented
- Catches mismatches early
- IDE autocomplete shows return shape
- Self-documenting code

---

## Pattern 3: Default Parameter Types

### ❌ BEFORE — Implicit parameter type

```typescript
export function getOverdueData(
  project: OverdueProjectLike,
  referenceDate = new Date(), // Type inferred as Date
) {
  // ...
}
```

### ✅ AFTER — Explicit parameter type

```typescript
export function getOverdueData(
  project: OverdueProjectLike,
  referenceDate: Date = new Date(),
): OverdueResult {
  // ...
}
```

**Benefit:**
- Parameter type is explicit
- Consistent with strict mode requirements
- Prevents accidental type mismatches

---

## Pattern 4: Callback Type Safety

### ❌ BEFORE — Implicit callback types

```typescript
datesToCheck.forEach((d) => {  // d type inferred
  if (d < refMidnight) {
    const diffTime = Math.abs(refMidnight.getTime() - d.getTime());
    // ...
  }
});
```

### ✅ AFTER — Explicit callback types

```typescript
datesToCheck.forEach((d: Date): void => {
  if (d < refMidnight) {
    const diffTime = Math.abs(refMidnight.getTime() - d.getTime());
    // ...
  }
});
```

**Benefit:**
- Parameter type explicitly declared
- Return type void shows intentional side-effect
- More readable in strict mode

---

## Pattern 5: Generic Type Parameters

### ❌ BEFORE — Generic without constraint

```typescript
export function computeTopAreas(
  projects: DashboardProjectLike[],
  topN = 3, // number inferred
): Array<[string, number]> {
  const counts: Record<string, number> = {};
  // ...
}
```

### ✅ AFTER — Generic with explicit type

```typescript
export function computeTopAreas(
  projects: DashboardProjectLike[],
  topN: number = 3,
): Array<[string, number]> {
  const counts: Record<string, number> = {};
  // ...
}
```

**Benefit:**
- Parameter type explicit
- No ambiguity about what topN should be
- Strict mode catches type mismatches at call site

---

## Pattern 6: Optional Chaining + Nullish Coalescing

### ❌ BEFORE — Unsafe access

```typescript
// Risk: p.budgets could be undefined
const pBudget = p.budgets?.reduce((sum, b) => sum + (b.value || 0), 0) || 0;
```

### ✅ AFTER — Type-safe with nullish coalescing

```typescript
const pBudget =
  p.budgets?.reduce((sum, b) => sum + (b.value ?? 0), 0) ?? 0;
```

**Benefit:**
- `?.` checks for null/undefined
- `??` uses nullish coalescing (not just falsy)
- Explicit null handling
- Prevents bugs with 0 values

---

## Pattern 7: Discriminated Unions

### ❌ BEFORE — Loose object types

```typescript
interface OverdueProjectLike {
  status?: string | null;
  end_date?: string | null;
  prazo_cronograma?: string | null;
}
```

### ✅ AFTER — Discriminated union

```typescript
type ProjectStatus = 'concluído' | 'cancelado' | 'em execução' | 'iniciado';

interface OverdueProjectLike {
  status: ProjectStatus | null;
  end_date: string | null;
  prazo_cronograma: string | null;
}
```

**Benefit:**
- Status is one of known values
- TypeScript catches typos
- Better autocomplete

---

## Implementation Checklist (Subtask 6.1.2)

### `src/lib/domain/` Files

- [ ] `project-health.ts` — Apply Patterns 1, 3, 4
  - [ ] Type guard for `datesToCheck` (Pattern 1)
  - [ ] Explicit return type `OverdueResult` (Pattern 2)
  - [ ] Explicit callback types in `forEach` (Pattern 4)

- [ ] `kpi-calculations.ts` — Apply Patterns 2, 5, 6
  - [ ] Explicit return types on all exports (Pattern 2)
  - [ ] Explicit `topN` parameter type (Pattern 5)
  - [ ] Safe nullish coalescing in `computeTotalBudget` (Pattern 6)

- [ ] `project-priority.ts`, `project-phase.ts`, etc. — Similar patterns

### `src/lib/transformers/` Files

- [ ] Apply same patterns to transformer functions
- [ ] Add explicit return types
- [ ] Type-safe callback functions

### `src/lib/constants/` Files

- [ ] Verify no `any` types
- [ ] Add explicit type annotations to objects

---

## Files Modified in This Subtask

**Ready to implement:**
- `src/lib/domain/project-health.ts` (5 fixes)
- `src/lib/domain/kpi-calculations.ts` (3 fixes)
- `src/lib/domain/project-priority.ts` (2 fixes)
- `src/lib/transformers/agent.ts` (4 fixes)
- Plus 10+ other lib files (minor fixes)

**Estimated violations fixed in 6.1.2:** ~20-25 issues

---

## Validation Commands

```bash
# After fixes, verify:
npm run typecheck    # Should pass with 0 errors
npm run lint         # Should pass
npm run build        # Should succeed
npm test             # All tests pass
```

---

## Next Subtasks Preview

**6.1.3:** Components Type Safety
**6.1.4:** Hooks & State Management
**6.1.5:** API Routes & Handlers
**6.1.6:** Tests Type Safety
**6.1.7:** Enable & Validation
**6.1.8:** Documentation

---

**Status:** Patterns documented for demo — Ready for implementation (if continuing beyond DEMO)

*Document created by Dex (@dev) — AIOX Story Development Cycle*
