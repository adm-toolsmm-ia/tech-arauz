# Fix Plan: React Error #130 Runtime Errors

**Diagnosis**: See `RUNTIME_ERROR_DIAGNOSIS.md`
**Root Cause**: SelectControl type coercion + icon type safety
**Files to Fix**: 3 critical files
**Estimated Impact**: Unblocks projetos/cronogramas rendering

---

## Root Cause Summary

### Issue 1: SelectControl Converts Arrays to Strings
**Location**: `src/components/filters/FilterControl.tsx` Line 175

```typescript
// WRONG - converts any value to string, breaking arrays
<Select value={String(value || '')} onValueChange={onChange}>
```

When `value = []` (array from multi-select definition):
- `String([])` becomes `"[]"` (literal string!)
- onChange receives string
- Parent state becomes string instead of array
- Array.isArray() check fails in applyFilters
- Filters break

---

### Issue 2: Icon Rendering Without Type Guard
**Location**: `src/components/filters/FilterBar.tsx` Lines 158, 226

```typescript
// WRONG - icon could be undefined, React throws error
{filterDef.icon && <filterDef.icon className="h-4 w-4 mr-1" />}
```

Type checker can't guarantee `filterDef.icon` is a component after `&&` check.

---

### Issue 3: Value Type Mismatch in applyFilters
**Location**: `src/lib/filters/filter-utils.ts` Line 58

```typescript
if (Array.isArray(filterValue)) {  // ✘ Fails because value is string!
  return filterValue.includes(itemValue);
}
```

Because SelectControl sends wrong type, this check always fails for multi-select.

---

## Fix Strategy

### Fix A: Separate SelectControl and MultiSelectControl Logic

**Current Problem**:
- Single function tries to handle both single-select and multi-select
- Value coercion fails for arrays

**Solution**:
- Make SelectControl only handle single values
- Keep MultiSelectControl for arrays
- Each has proper type handling

### Fix B: Add Type Guard for Icon Rendering

**Current Problem**:
- Icon could be undefined, causing React error

**Solution**:
- Extract to helper that validates component type
- Use React.ComponentType type guard

### Fix C: Ensure Filter Definitions Match Actual Types

**Current Problem**:
- Definition says `type: 'multi-select'` but SelectControl treats as single

**Solution**:
- Verify all multi-select filters use MultiSelectControl
- Check defaultValue matches type (array for multi, single for select)

---

## DETAILED FIX IMPLEMENTATION

### FIX #1: FilterControl.tsx - Separate Logic

**File**: `src/components/filters/FilterControl.tsx`

**Current Code** (Lines 68-150):
```typescript
switch (definition.type) {
  case 'select':
    return (
      <SelectControl /* ... */ />
    );
  case 'multi-select':
    return (
      <MultiSelectControl /* ... */ />
    );
  // ...
}
```

**Problem**: SelectControl on line 175 does `String(value || '')` which breaks for arrays.

**New SelectControl** (Lines 155-189):

```typescript
function SelectControl({
  definition,
  options,
  value,
  onChange,
  disabled,
  isLoading,
  className,
}: {
  definition: FilterDefinition;
  options: FilterOption[];
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
}) {
  // FIX: Handle value type properly
  // For single-select, value should be string | number | boolean, NOT array
  const stringValue = React.useMemo(() => {
    if (value === null || value === undefined) return '';
    if (Array.isArray(value)) return ''; // Shouldn't happen for single-select
    return String(value);
  }, [value]);

  const handleChange = React.useCallback(
    (newStringValue: string) => {
      // FIX: Find original type from options and return in that type
      const option = options.find((opt) => String(opt.value) === newStringValue);
      if (option) {
        // Return original type, not string
        onChange(option.value);
      } else {
        onChange(newStringValue); // Fallback to string
      }
    },
    [options, onChange],
  );

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label className="text-sm font-medium">{definition.label}</label>
      <Select value={stringValue} onValueChange={handleChange} disabled={disabled || isLoading}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={definition.placeholder || `Select ${definition.label}...`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
```

**Key Changes**:
1. `stringValue` calculation properly handles null/undefined/array
2. `handleChange` finds original type and returns it
3. If value was number, returns number; if boolean, returns boolean
4. onChange receives correct type, not coerced string

---

### FIX #2: FilterBar.tsx - Icon Type Safety

**File**: `src/components/filters/FilterBar.tsx`

**Current Code** (Line 158):
```typescript
{filterDef.icon && <filterDef.icon className="h-4 w-4 mr-1" />}
```

**Problem**: React can't guarantee `filterDef.icon` is a component after `&&`.

**Solution** (Line 158):

```typescript
{filterDef.icon ? (
  <filterDef.icon className="h-4 w-4 mr-1" />
) : null}
```

OR better - extract to a helper:

```typescript
// Add helper function at top of file
const renderIcon = (Icon: React.ComponentType<{ className?: string }> | undefined) => {
  if (!Icon) return null;
  return <Icon className="h-4 w-4 mr-1" />;
};

// Then in JSX:
{renderIcon(filterDef.icon)}
```

**Do same for line 226**:
```typescript
{mode.icon ? (
  <mode.icon className="h-4 w-4" />
) : null}
```

---

### FIX #3: Verify Filter Definitions

**File**: `src/lib/filters/filters-projetos.ts`

**Check**: All filters with `type: 'multi-select'` should have `defaultValue: []`

**Current** (Lines 43-62):
```typescript
{
  id: 'status',
  label: 'Status',
  type: 'multi-select',
  group: 'Status',
  quickFilter: true,
  quickFilterLimit: 4,
  icon: AlertTriangle,
  description: 'Filter by project status',
  options: [
    { value: 'Iniciado', label: 'Iniciado', badge: 'Start' },
    // ...
  ],
  defaultValue: [],  // ✓ CORRECT - array for multi-select
  searchable: true,
  clearable: true,
  sortOptions: true,
},
```

**Verify**: Every multi-select has `defaultValue: []`

---

### FIX #4: Filter Utils - Type Safety

**File**: `src/lib/filters/filter-utils.ts`

**Current Code** (Lines 47-72, applyFilters):
```typescript
// Apply structured filters (AND logic)
return Object.entries(filters).every(([filterId, filterValue]) => {
  if (!filterValue || (Array.isArray(filterValue) && filterValue.length === 0)) {
    return true;
  }

  const itemValue = item[filterId];
  if (itemValue === null || itemValue === undefined) {
    return false;
  }

  // Handle array filters (multi-select)
  if (Array.isArray(filterValue)) {
    return filterValue.includes(itemValue);  // ← Will now work because value is array!
  }

  // Handle date range filters
  if (filterValue instanceof Object && 'start' in filterValue && 'end' in filterValue) {
    const itemDate = new Date(itemValue).getTime();
    const start = new Date(filterValue.start).getTime();
    const end = new Date(filterValue.end).getTime();
    return itemDate >= start && itemDate <= end;
  }

  // Handle exact match
  return itemValue === filterValue;
});
```

**Status**: This code is actually CORRECT! The issue is that SelectControl sends wrong type.
Once SelectControl is fixed (Fix #1), this will work properly.

---

### FIX #5: Test Type Safety in Hooks

**File**: `src/hooks/useProjetosFilters.ts`

**Verify** (Lines 89-130):
```typescript
const filterRegistry = useMemo(() => {
  const registry = JSON.parse(JSON.stringify(PROJETOS_FILTER_REGISTRY));

  // Build dynamic filter options from actual data
  updateProjetosFilterOptions(
    registry,
    'responsible',
    buildFilterOptions(projects, 'responsible', (v) => v || 'Sem Responsável'),
  );
  // ... more updates
  return registry;
}, [projects]);
```

**Status**: This is correct. The issue is SelectControl doesn't use returned types properly.
Once SelectControl Fix #1 is applied, this will work.

---

## Testing the Fixes

### Test 1: SelectControl Type Preservation

```typescript
// Test: Select filter with number value
<FilterControl
  definition={{ id: 'priority', type: 'select', options: [
    { value: 1, label: 'High' },
    { value: 2, label: 'Low' },
  ] }}
  value={1}  // Number
  onChange={(v) => console.log(typeof v, v)}  // Should log: "number 1"
/>

// User selects "Low"
// onChange should receive: 2 (number), NOT "2" (string)
```

### Test 2: MultiSelectControl Type Preservation

```typescript
// Test: Multi-select filter with string array
<FilterControl
  definition={{ id: 'status', type: 'multi-select', defaultValue: [] }}
  value={['Iniciado', 'Em execução']}  // Array of strings
  onChange={(v) => console.log(Array.isArray(v), v)}  // Should log: "true [ 'Iniciado', 'Em execução' ]"
/>

// User selects "Concluído"
// onChange should receive: ['Iniciado', 'Em execução', 'Concluído'] (array)
// NOT "Concluído" (string)
```

### Test 3: Icon Rendering Safety

```typescript
// Test: Icon rendering with undefined
<FilterBar
  filters={{
    filters: [
      { id: 'test', label: 'Test', type: 'select', icon: undefined }  // Undefined icon
    ]
  }}
/>

// Should render without error (icon helper handles undefined)
```

---

## Validation Checklist

- [ ] SelectControl properly returns option.value type
- [ ] MultiSelectControl returns array
- [ ] Icon rendering handles undefined
- [ ] Projetos filters load without error
- [ ] Cronogramas filters load without error
- [ ] Multi-select filters actually filter data
- [ ] Single-select filters properly match
- [ ] No React Error #130 in console
- [ ] No type errors in build

---

## Implementation Order

1. **First**: Fix SelectControl (Fix #1) - most critical
2. **Second**: Fix Icon rendering (Fix #2) - secondary error prevention
3. **Third**: Verify filter definitions (Fix #3) - validation
4. **Test**: Run both modules to confirm no errors

---

## Rollback Plan

If fixes cause issues:
1. Revert SelectControl to original (simple string conversion)
2. Add explicit type coercion in parent components
3. Add logging to understand actual data types being used

---

**Implementation Plan**: Ready for @dev execution
**Risk Level**: Low - isolated to filter components, no breaking changes
**Testing Required**: Manual test in browser for both modules
