# React Error #130 Runtime Error Diagnosis - Tech Arauz

**Status**: IDENTIFIED AND DIAGNOSED
**Severity**: CRITICAL - Blocks projetos/cronogramas rendering
**Root Cause**: Type Mismatch in SelectControl + onChange Handler
**Affected Modules**: Projetos, Cronogramas

---

## 1. THE ERROR: React #130 Type Mismatch

### Symptom
- React Error #130 appearing (minified code)
- Modules load but fail to render
- FilterBar integrates but components crash immediately
- TypeError: Property access/mismatch on filter values

### Location
**Primary**: `src/components/filters/FilterControl.tsx` Line 175 (SelectControl)
**Secondary**: `src/components/filters/FilterBar.tsx` Line 158 (Icon rendering)

---

## 2. ROOT CAUSE ANALYSIS

### Problem 1: SelectControl - onChange Type Mismatch

**File**: `src/components/filters/FilterControl.tsx` (Lines 155-189)

```typescript
// LINE 175 - PROBLEM!
<Select value={String(value || '')} onValueChange={onChange} disabled={disabled || isLoading}>
  {options.map((opt) => (
    <SelectItem key={String(opt.value)} value={String(opt.value)}>
```

**THE BUG**:
1. `value` is converted to **STRING**: `String(value || '')`
2. But `onChange` handler receives the original type
3. When user selects, `onValueChange` fires with **STRING** value
4. But parent expects value in original type (number, boolean, etc.)
5. Example: `opt.value` = `123` (number), but `SelectItem` value = `"123"` (string)
6. User selects → onChange("123") → parent sets filter to string
7. Next render: value from state is string, but option lookup expects number
8. Type mismatch causes React to throw error during render reconciliation

**Data Flow**:
```
User selects option with value: 123 (number)
SelectItem value attribute: "123" (string)  ← converted on Line 181
onValueChange fires with: "123" (string)
onChange handler receives: "123" (string)
Parent filterState.updateFilter('filterId', "123")
Next render: filterState.filters[filterId] = "123" (string)
But definition.options expect value type: number
Type mismatch → React Error #130
```

---

### Problem 2: FilterBar - Icon Rendering Type Error

**File**: `src/components/filters/FilterBar.tsx` (Lines 158, 226)

```typescript
// LINE 158 - PROBLEM!
{filterDef.icon && <filterDef.icon className="h-4 w-4 mr-1" />}

// LINE 226 - SAME PROBLEM!
{mode.icon && <mode.icon className="h-4 w-4" />}
```

**THE BUG**:
1. `filterDef.icon` is typed as `React.ComponentType<{ className?: string }>`
2. But it could be `undefined` (checked with `&&`)
3. Passing `className` as prop when icon is `undefined` causes type error
4. Even though check exists, TypeScript/React can't guarantee type safety
5. Minified React complains about component type mismatch

**Fix**: Ensure icon is safely a component type before rendering

---

### Problem 3: Value Types in Dynamic Options

**File**: `src/hooks/useProjetosFilters.ts` (Lines 89-130)

```typescript
// LINE 96 - PROBLEM!
buildFilterOptions(projects, 'responsible', (v) => v || 'Sem Responsável'),
```

**THE BUG**:
1. `buildFilterOptions()` returns `Array<{ value: any; label: string }>`
2. Options generated from data have type `any` for value
3. But SelectItem converts to STRING: `value={String(opt.value)}`
4. Original data is string, option.value is string
5. But conversion to String still causes mismatch with initial state

---

## 3. DATA FLOW BREAKDOWN

### Cronogramas Module (Similar Issue)

**File**: `src/hooks/useCronogramasFilters.ts` (Lines 137-140)

```typescript
// Line 137-140: project_id filter
updateCronogramasFilterOptions(
  registry,
  'project_id',
  buildFilterOptions(schedules, 'project_id', (v) => {
    const schedule = schedules.find((s) => s.project_id === v);
    return schedule?.project?.titulo || String(v);
  }),
);
```

**THE BUG**:
1. `project_id` field in schedules is STRING (UUID)
2. But `buildFilterOptions` extracts raw value
3. Option value becomes UUID string
4. SelectItem converts to String (no-op)
5. But parent receives string, expects UUID
6. Type mismatch occurs when filtering data

---

## 4. IMPACT ANALYSIS

| Component | Field | Value Type | Stored Type | Mismatch? |
|-----------|-------|-----------|-------------|-----------|
| Projetos | status | string | string (array) | TYPE ARRAY vs STRING |
| Projetos | priority | string | string (array) | TYPE ARRAY vs STRING |
| Projetos | responsible | string | string (array) | TYPE ARRAY vs STRING |
| Cronogramas | responsavel | string | string (array) | TYPE ARRAY vs STRING |
| Cronogramas | project_id | string | string | ✅ OK |
| Cronogramas | fase_atividade | string | string (array) | TYPE ARRAY vs STRING |

---

## 5. THE REAL ROOT CAUSE

The problem is **TWO-FOLD TYPE MISMATCH**:

### Issue A: Multi-Select to Single-Select Confusion

In `FilterControl.tsx`, the mapping is:
- `multi-select` → MultiSelectControl (value is array)
- `select` → SelectControl (value is single)

BUT in filters-projetos.ts, ALL filters are defined as:
```typescript
{
  id: 'status',
  type: 'multi-select',  // ← TYPE IS MULTI-SELECT
  defaultValue: [],      // ← BUT NO OPTION SAYS IT'S REALLY MULTI
  // ...
}
```

And SelectControl does:
```typescript
<Select value={String(value || '')} onValueChange={onChange}>
  {/* But value could be an ARRAY from multi-select definition! */}
```

**THE CRASH POINT**:
```
filterState.filters['status'] = []  // Array
SelectControl expects: value: string | undefined
SelectControl does: String([]) → "[]" (literal string!)
Next render: filterState receives [""] instead of []
Type chaos ensues → React Error #130
```

---

### Issue B: FilterDefinition Type Coercion

In `FilterControl.tsx` Line 175:
```typescript
<Select value={String(value || '')} onValueChange={onChange} disabled={disabled || isLoading}>
```

Problem:
1. Input: `value: any` (could be array, string, null, undefined)
2. Conversion: `String(value || '')`
   - If `value = []` → `String([])` → `"[]"` ✘ WRONG
   - If `value = ['status1']` → `String(['status1'])` → `"status1"` (accidental)
   - If `value = 'status1'` → `String('status1')` → `"status1"` ✓ CORRECT
3. SelectItem value: `value={String(opt.value)}` always converts to string
4. onChange receives string
5. Parent state gets string, but expects array (for multi-select filters)
6. Type mismatch in applyFilters when comparing filterValue (string) vs itemValue

---

## 6. VERIFICATION: Where Types Diverge

### Start of Flow (Hook)
```typescript
// useProjetosFilters.ts Line 134
const filterState = useModuleFilters(
  'projetos',
  filterRegistry.filters,  // ← FilterDefinition[] with multi-select types
  projects,                 // ← Project[] data
  filterProjetosData,      // ← Filter function expecting FilterState
  { persistence: { enabled: true, storageKey: 'projetos-filters' } }
);
```

### Filter Registry Definition
```typescript
// filters-projetos.ts Line 43-62
{
  id: 'status',
  label: 'Status',
  type: 'multi-select',  // ← Says it's multi-select
  defaultValue: [],      // ← Default is empty array
  // ...
}
```

### Initial State
```typescript
// useFilterState.ts Line 64
return resetFilters(definitions);  // ← Creates { status: [] }
```

### Component Rendering
```typescript
// FilterControl.tsx Line 175
<Select value={String(value || '')} onValueChange={onChange}>
  // value = [] (from state)
  // String([]) = "[]"
  // Component gets value="[]"
```

### onChange Handler
```typescript
// When user selects "Iniciado"
onChange("Iniciado")  // Receives STRING
// But parent expects ARRAY for multi-select!
// Sets filterState.filters.status = "Iniciado" (wrong type!)
```

### Next Render
```typescript
// FilterControl.tsx Line 175 again
<Select value={String(value || '')} onValueChange={onChange}>
  // value = "Iniciado" (STRING from state)
  // String("Iniciado") = "Iniciado"
  // OK so far, but...
```

### Filter Application
```typescript
// filterProjetosData in useProjetosFilters.ts
return applyFilters(projects, filters, {
  searchFields: ['project_name', 'espaider_code', 'objetivo', 'solicitante'],
  matchMode: 'partial',
  caseSensitive: false,
});

// Inside applyFilters (filter-utils.ts Line 47-72)
Object.entries(filters).every(([filterId, filterValue]) => {
  // filterValue = "Iniciado" (STRING, not array!)
  // But we expect multi-select to have: filterValue = ["Iniciado"]

  if (Array.isArray(filterValue)) {  // ✘ FALSE!
    return filterValue.includes(itemValue);  // ✘ NOT EXECUTED
  }

  return itemValue === filterValue;  // ✘ WRONG LOGIC!
  // itemValue is "Em execução", filterValue is "Iniciado"
  // Returns false even if user selected them!
});
```

---

## 7. DIAGNOSIS SUMMARY

### Primary Error
**SelectControl type coercion failure**:
- Converts array values to string `"[]"`
- onChange sends STRING to parent
- Parent stores STRING instead of ARRAY
- Multi-select filters break

### Secondary Error
**Icon component type safety**:
- Icon could be undefined after check
- Passing props to potentially undefined component
- React can't reconcile component type

### Tertiary Error
**applyFilters logic assumes array for multi-select**:
- But receives string because of SelectControl bug
- Array.isArray() check fails
- Falls through to `===` comparison (wrong)
- Filters don't match correctly

---

## 8. FIX STRATEGY (Technical Plan)

### Fix 1: Type Preservation in SelectControl

**Problem Code**:
```typescript
<Select value={String(value || '')} onValueChange={onChange}>
```

**Solution**:
- For `multi-select`: value should be array
- For `select`: value should be string/single
- DON'T convert array to string
- Handle each type explicitly

### Fix 2: Icon Type Safety

**Problem Code**:
```typescript
{filterDef.icon && <filterDef.icon className="h-4 w-4 mr-1" />}
```

**Solution**:
- Ensure icon is actually a component type
- Use `React.isValidElement()` or type guard
- Or inline icon rendering

### Fix 3: Align FilterDefinition with Actual Usage

**Problem Code**:
```typescript
{
  id: 'status',
  type: 'multi-select',  // Says multi
  defaultValue: [],      // But is array!
  // ...
}
```

**Solution**:
- Add explicit `multi: true` flag
- Fix defaultValue to match type
- Pass correct type to SelectControl

---

## 9. NEXT STEPS

1. **Immediate**: Identify which filters are truly multi-select vs single-select
2. **Immediate**: Add type guards in SelectControl to handle array vs string
3. **Quick Fix**: Separate SelectControl and MultiSelectControl logic completely
4. **Validation**: Test with actual data to ensure types match throughout flow
5. **Regression Test**: Verify cronogramas filters work the same way

---

**Analysis completed**: 2026-02-22
**Severity**: CRITICAL
**Estimated Fix Time**: 1-2 hours
