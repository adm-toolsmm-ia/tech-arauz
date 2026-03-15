# Story 13.1 — Required Fixes (Detailed)

**Total Fixes Required:** 4
**Estimated Time:** 30-40 minutes
**Priority:** CRITICAL (blocks TypeScript build)
**Assigned to:** @dev (Dex)

---

## Fix #1: ProcessSlaList Missing Import

**Severity:** CRITICAL (TypeScript compilation error)
**File:** `src/components/organization/ProcessSlaList.tsx`
**Line:** 17

### Issue

```typescript
// Current (BROKEN):
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';  // ❌ CANNOT FIND MODULE
```

**Error:**
```
ProcessSlaList.tsx(17,8): error TS2307: Cannot find module '@/components/ui/alert-dialog'
or its corresponding type declarations.
```

### Solution

**Step 1:** Verify the alert-dialog component exists
```bash
ls src/components/ui/alert-dialog.tsx
# Should exist in the project (shadcn/ui component)
```

**Step 2:** Fix the import path

The import is actually correct — the issue is likely that the component index doesn't export it. Check and use:

```typescript
// Option A: Import directly from the component file
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Option B: If not available, use from primitives
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
```

**Step 3:** Verify it compiles

```bash
npm run typecheck
# Should show 0 errors after this fix
```

### Verification
- [ ] Fix applied
- [ ] TypeScript compiles without error on this import
- [ ] Component still renders correctly

---

## Fix #2: ProcessSlaList Type Annotation

**Severity:** MEDIUM (TypeScript compilation error)
**File:** `src/components/organization/ProcessSlaList.tsx`
**Line:** 151

### Issue

```typescript
// Current (BROKEN):
<AlertDialog open={!!slaToDelete} onOpenChange={(open) => !open && setSlaToDelete(null)}>
                                           // ❌ Parameter 'open' implicitly has an 'any' type
```

**Error:**
```
ProcessSlaList.tsx(151,56): error TS7006: Parameter 'open' implicitly has an 'any' type.
```

### Solution

Add explicit type annotation:

```typescript
// Fixed (CORRECT):
<AlertDialog
  open={!!slaToDelete}
  onOpenChange={(open: boolean) => !open && setSlaToDelete(null)}
>
```

**Complete Context:**
```typescript
const handleDeleteConfirm = useCallback(async () => {
  if (!slaToDelete) return;

  setIsDeleting(true);
  try {
    const { deleteProcessSlaAction } = await import('@/app/actions/organization');
    const result = await deleteProcessSlaAction(slaToDelete.id);

    if (result.success) {
      setSlaToDelete(null);
      onDeleteSuccess?.();
    } else {
      console.error('Error deleting SLA:', result.message);
    }
  } catch (error) {
    console.error('Error deleting SLA:', error);
  } finally {
    setIsDeleting(false);
  }
}, [slaToDelete, onDeleteSuccess]);

// ... in render:
<AlertDialog
  open={!!slaToDelete}
  onOpenChange={(open: boolean) => !open && setSlaToDelete(null)}  // ✅ FIXED
>
```

### Verification
- [ ] Type annotation added: `(open: boolean)`
- [ ] TypeScript compiles without error
- [ ] Component behavior unchanged

---

## Fix #3: ProcessSlaModal Test Case

**Severity:** MEDIUM (Test failure)
**File:** `src/components/organization/__tests__/ProcessSlaModal.test.tsx`
**Lines:** 155-180
**Test Name:** "should validate warning < critical threshold"

### Issue

```typescript
// Current (BROKEN):
it('should validate warning < critical threshold', async () => {
  const user = userEvent.setup();
  render(
    <ProcessSlaModal
      processId={processId}
      isOpen={true}
      onClose={mockOnClose}
      mode="create"
    />
  );

  const metricInput = screen.getByPlaceholderText(/Ex: tempo_conclusão/i);
  const durationInput = screen.getByPlaceholderText(/Ex: 5/i);
  const warningInput = screen.getByPlaceholderText(/Ex: 75/i);

  // ❌ PROBLEM: Only filling 3 fields, critical threshold is EMPTY
  await user.type(metricInput, 'test_metric');
  await user.type(durationInput, '5');
  await user.type(warningInput, '95');
  // Missing: await user.type(criticalInput, '...');

  const submitButton = screen.getByRole('button', { name: /Criar/i });
  await user.click(submitButton);

  await waitFor(() => {
    // ❌ Test expects this error, but validation doesn't trigger because
    // critical field is empty (caught by other validation first)
    expect(screen.getByText(/Threshold de aviso deve ser menor que o crítico/i)).toBeInTheDocument();
  });
});
```

**Error:**
```
Unable to find an element with the text: /Threshold de aviso deve ser menor que o crítico/i
```

**Root Cause:**
The test sets warning=95 but doesn't set critical threshold. The form validation catches the missing critical threshold first (returns "Threshold crítico deve estar entre 0 e 100") before checking if warning < critical.

### Solution

Fill all required fields correctly:

```typescript
// Fixed (CORRECT):
it('should validate warning < critical threshold', async () => {
  const user = userEvent.setup();
  render(
    <ProcessSlaModal
      processId={processId}
      isOpen={true}
      onClose={mockOnClose}
      mode="create"
    />
  );

  const metricInput = screen.getByPlaceholderText(/Ex: tempo_conclusão/i);
  const durationInput = screen.getByPlaceholderText(/Ex: 5/i);
  const warningInput = screen.getByPlaceholderText(/Ex: 75/i);

  // Get critical threshold input correctly
  const criticalInputs = screen.getAllByRole('spinbutton');
  const criticalInput = criticalInputs[criticalInputs.length - 1]; // Last spinbutton

  // ✅ Fill ALL fields
  await user.type(metricInput, 'test_metric');
  await user.type(durationInput, '5');
  await user.type(warningInput, '95');  // ← warning high
  await user.type(criticalInput, '85'); // ← critical LOWER than warning

  const submitButton = screen.getByRole('button', { name: /Criar/i });
  await user.click(submitButton);

  await waitFor(() => {
    // ✅ NOW this error will be triggered
    expect(screen.getByText(/Threshold de aviso deve ser menor que o crítico/i)).toBeInTheDocument();
  });
});
```

**Key Changes:**
1. Set warning=95, critical=85 (violation of warning < critical)
2. Get critical input using spinbutton query (same as other tests)
3. Validation now triggers the expected error message

### Verification
- [ ] Test case updated with all fields filled
- [ ] Critical value set LOWER than warning value
- [ ] Test runs and passes (error message appears)
- [ ] `npm run test` shows 413/413 passing

---

## Fix #4: Install Playwright Package

**Severity:** MEDIUM (TypeScript + E2E setup)
**Files Affected:**
- `e2e/epic-11-gaps.spec.ts`
- `playwright.config.ts`

### Issue

```typescript
// e2e/epic-11-gaps.spec.ts (line 1):
import { test, expect } from '@playwright/test';
// ❌ ERROR: Cannot find module '@playwright/test'
```

**Error:**
```
e2e/epic-11-gaps.spec.ts(1,30): error TS2307: Cannot find module '@playwright/test'
or its corresponding type declarations.
```

### Solution

**Step 1:** Install Playwright as dev dependency
```bash
npm install @playwright/test --save-dev
```

**Step 2:** Verify installation
```bash
npm list @playwright/test
# Should show: @playwright/test@latest (or installed version)
```

**Step 3:** Verify TypeScript recognizes the package
```bash
npm run typecheck
# E2E test file errors should now resolve
```

**Note:** This is a one-time setup. After installation:
- E2E tests can reference @playwright/test without errors
- playwright.config.ts will be recognized
- E2E tests can be run (if implemented): `npx playwright test`

### Verification
- [ ] Package installed: `npm install @playwright/test --save-dev`
- [ ] package.json updated with new dev dependency
- [ ] TypeScript compile errors on @playwright/test resolved
- [ ] `npm run typecheck` shows 0 errors (or only E2E-specific errors if tests not yet written)

---

## Execution Checklist

### Phase 1: Fixes (Order matters)

**Priority Order** (dependencies must be respected):

```
1. ✓ Fix #1: ProcessSlaList import
   └─ Unblocks TypeScript check

2. ✓ Fix #2: ProcessSlaList type annotation
   └─ Unblocks TypeScript check

3. ✓ Fix #3: ProcessSlaModal test case
   └─ Unblocks unit tests

4. ✓ Fix #4: Install Playwright
   └─ Unblocks E2E test setup
```

### Phase 2: Verification

After all fixes:

```bash
# 1. Run unit tests
npm run test
# Expected: 413/413 passing (all tests pass)

# 2. Run TypeScript check
npm run typecheck
# Expected: 0 errors (clean)

# 3. Run linter
npm run lint
# Expected: ✔ No ESLint warnings or errors
```

### Phase 3: Commit & PR

```bash
git add .
git commit -m "fix: Story 13.1 — Resolve TypeScript errors and test failure

- Fix missing alert-dialog import in ProcessSlaList
- Add type annotation to AlertDialog onOpenChange parameter
- Correct ProcessSlaModal validation test case
- Install @playwright/test for E2E test support

Story 13.1 | Phase 4 | QA Gate Fixes"

git push origin feature/epic-11-frontend-gaps
```

---

## Timeline Estimate

| Fix # | Task | Time | Cumulative |
|-------|------|------|-----------|
| 1 | ProcessSlaList import | 5 min | 5 min |
| 2 | Type annotation | 5 min | 10 min |
| 3 | Test case fix | 10 min | 20 min |
| 4 | Install Playwright | 5 min | 25 min |
| — | Run all tests | 5 min | 30 min |
| — | Verify no errors | 2 min | 32 min |
| **TOTAL** | | | **~35 min** |

---

## Sign-Off Template

After completing all fixes, verify:

```
STORY 13.1 FIX CHECKLIST — @dev (Dex)
=====================================

[✓] Fix #1: ProcessSlaList import
[✓] Fix #2: Type annotation
[✓] Fix #3: Test case
[✓] Fix #4: Playwright install

[✓] npm run test         → 413/413 passing
[✓] npm run typecheck    → 0 errors
[✓] npm run lint         → 0 errors
[✓] Code review ready    → YES

Ready for PR: ✓ YES
Date: 2026-03-16
```

---

## Questions?

If blocked on any fix:
- **Import issues:** Check `src/components/ui/` structure
- **Test issues:** Re-read test intent (validate warning < critical)
- **Playwright:** See @playwright/test docs for setup
- **TypeScript:** Run `npm run typecheck` to see full error context

---

**Document prepared by:** Quinn (@qa)
**For:** Dex (@dev)
**Date:** 2026-03-16

