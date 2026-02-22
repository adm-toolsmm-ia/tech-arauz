# Quick Reference: React Error #130 Fix

## 🔴 THE ISSUE IN 30 SECONDS

**Projetos e Cronogramas não renderizam com Error #130**

**Root Cause**: `SelectControl` converte arrays para strings
```typescript
String([]) → "[]"  // ✘ WRONG!
onChange("Iniciado")  // Sends STRING, expects ARRAY
```

---

## 📍 3 FILES TO FIX

### 1. `src/components/filters/FilterControl.tsx` (CRITICAL)

**Line 175**: Replace
```typescript
// BEFORE
<Select value={String(value || '')} onValueChange={onChange} ...>

// AFTER - preserve original type
const stringValue = useMemo(() => {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return '';
  return String(value);
}, [value]);

const handleChange = useCallback((newString: string) => {
  const option = options.find((opt) => String(opt.value) === newString);
  if (option) onChange(option.value);  // ← Return ORIGINAL type
  else onChange(newString);
}, [options, onChange]);

<Select value={stringValue} onValueChange={handleChange} ...>
```

### 2. `src/components/filters/FilterBar.tsx` (SECONDARY)

**Line 158 & 226**: Replace icon rendering
```typescript
// BEFORE
{filterDef.icon && <filterDef.icon className="h-4 w-4 mr-1" />}

// AFTER
{filterDef.icon ? <filterDef.icon className="h-4 w-4 mr-1" /> : null}
```

### 3. `src/lib/filters/filter-utils.ts` (VALIDATION)

**Lines 160-169**: Add null check
```typescript
// In buildFilterOptions, ensure values are not null:
value: value ?? ''  // Fallback if null
```

---

## 🧪 TEST AFTER FIX

```bash
# Terminal 1: Build and watch
npm run dev

# Browser: Check both modules
1. Navigate to /projetos → should render without error
2. Navigate to /cronogramas → should render without error
3. Console: No Error #130, no TypeError
4. Filters: Click status filter → should show options
5. Select: "Iniciado" → should filter projects
```

---

## 🎯 WHAT'S BROKEN RIGHT NOW

```
User selects "Iniciado"
         ↓
SelectControl sends: "Iniciado" (STRING) ✘
         ↓
Parent expects: ["Iniciado"] (ARRAY) ✘
         ↓
State stores: "Iniciado" (STRING) ✘
         ↓
applyFilters checks: Array.isArray(filterValue) → FALSE ✘
         ↓
Matching logic: "Em execução" === "Iniciado" → FALSE ✘
         ↓
Result: No projects shown + React Error #130 ✘
```

---

## ✅ AFTER FIX

```
User selects "Iniciado"
         ↓
SelectControl sends: "Iniciado" (STRING) → converted back to original type
         ↓
Parent receives: ["Iniciado"] (ARRAY) ✓
         ↓
State stores: ["Iniciado"] (ARRAY) ✓
         ↓
applyFilters checks: Array.isArray(filterValue) → TRUE ✓
         ↓
Matching logic: ["Iniciado"].includes("Em execução") → FALSE
                ["Iniciado"].includes("Iniciado") → TRUE ✓
         ↓
Result: Correct projects shown + No Error #130 ✓
```

---

## 🔍 WHERE TO LOOK FOR THE BUG

### Symptom 1: Cannot Read Property
```
TypeError: Cannot read property 'includes' of undefined
```
→ filterValue is string, not array

### Symptom 2: React Error #130
```
React Error #130 in minified code
```
→ Type mismatch during render reconciliation

### Symptom 3: Empty Results
```
Projetos/Cronogramas show no items when filter applied
```
→ Type mismatch in applyFilters logic

---

## 📚 DETAILED DOCS

- **Full Diagnosis**: `.context/RUNTIME_ERROR_DIAGNOSIS.md`
- **Implementation Guide**: `.context/FIX_PLAN_RUNTIME_ERRORS.md`
- **Portuguese Version**: `.context/DIAGNOSTICO_ERROR_130.pt-BR.md`

---

## ⏱️ TIME ESTIMATE

| Task | Time |
|------|------|
| Apply SelectControl fix | 15 min |
| Apply icon fix | 5 min |
| Apply validation | 5 min |
| Test projetos | 10 min |
| Test cronogramas | 10 min |
| **TOTAL** | **45 min** |

---

## ⚠️ COMMON MISTAKES TO AVOID

❌ Don't do:
```typescript
// Wrong - still converts to string
const handleChange = (v: string) => onChange(String(v));
```

❌ Don't do:
```typescript
// Wrong - doesn't preserve type
onChange(newString);  // if you found original option, use option.value!
```

❌ Don't do:
```typescript
// Wrong - state will be string
filterState.updateFilter(id, String(selectedValue));
```

✅ Do:
```typescript
// Correct - returns original type
const option = options.find(opt => String(opt.value) === selectedValue);
if (option) onChange(option.value);  // ← Use original type
```

---

## 🎓 WHY THIS HAPPENS

React component controlled values need **type consistency**:

```typescript
// Type must match between:
1. State: filterState.filters[id] = ["Iniciado"]  (array)
2. Control: value={stringValue}                   (string for display)
3. Handler: onChange receives value               (must convert back to array)
4. Filter: applyFilters uses filterValue          (expects array)
```

When types don't match:
- Array.isArray() returns wrong result
- Filtering logic breaks
- React can't reconcile DOM
- Error #130 thrown

---

## 📞 IF YOU GET STUCK

1. Check `.context/RUNTIME_ERROR_DIAGNOSIS.md` Section 2-3
2. Check `.context/FIX_PLAN_RUNTIME_ERRORS.md` Implementation section
3. Search for "SelectControl" - should have handleChange with option lookup
4. Verify onChange passes original type, not string

---

**Status**: Ready for implementation
**Priority**: CRITICAL - blocks module rendering
**Review**: See full diagnosis in `.context/` folder
