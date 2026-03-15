# Next Actions for v0.2.4 Release

**Status:** Release blocked pending 3 blockers
**Timeline:** 24 hours to production-ready state
**Framework:** Synkra AIOX v1.0.0

---

## 🎯 IMMEDIATE ACTIONS (Start Now)

### ACTION 1: @dev (Dex) — Fix Unicode Test Failures
**Priority:** CRITICAL
**Time Budget:** 4-6 hours
**Deadline:** Same day

**What to do:**
1. Open test file: `src/lib/organization/__tests__/import-export.test.ts`
2. Look for test at line 458 (unicode names)
3. Find the import/export implementation in `src/lib/organization/import-export.ts`
4. Check character encoding:
   - Ensure all file reads use `'utf8'` encoding explicitly
   - Ensure JSON.stringify/parse uses UTF-8 safe methods
   - Verify Blob creation includes `charset=utf-8`

**Step-by-step investigation:**
```bash
# 1. Check what the test expects
grep -n "Москва\|unicode" src/lib/organization/__tests__/import-export.test.ts

# 2. Find the export function
grep -n "export.*function\|const.*export" src/lib/organization/import-export.ts

# 3. Look for encoding issues
grep -n "readFile\|writeFile\|JSON.parse\|JSON.stringify\|Blob" src/lib/organization/import-export.ts

# 4. Check file I/O encoding
grep -n "utf" src/lib/organization/import-export.ts
```

**Key fix patterns to look for:**
- `readFileSync(path)` → change to `readFileSync(path, 'utf-8')`
- `new Blob([content])` → change to `new Blob([content], { type: 'text/plain;charset=utf-8' })`
- JSON parsing → ensure round-trip integrity (export → import → compare)

**Validation:**
```bash
npm test -- src/lib/organization/__tests__/import-export.test.ts

# Expected output:
# ✓ All tests passing
# ✓ 44 previously failing tests now pass
# ✓ Unicode names (Москва, ñ, etc.) handled correctly
```

**Deliverable:**
- Commit: `fix: unicode character encoding in import-export [Story 11.13]`
- All 400 tests passing

---

### ACTION 2: @dev (Dex) — Fix Lint Errors
**Priority:** HIGH
**Time Budget:** 2-3 hours
**Deadline:** Same day (after Action 1)

**What to do:**

**Fix 1: Missing BarChart3 Import**
```
File: src/components/organization/ProcessCockpit360.tsx:130
Error: 'BarChart3' is not defined

Action:
1. Go to top of file (imports section)
2. Find: import { BarChart, LineChart, ... } from '...'
3. Change to: import { BarChart, BarChart3, LineChart, ... } from '...'
   OR if BarChart3 doesn't exist in the library, replace usage with existing chart
4. Test: npm run lint -- src/components/organization/ProcessCockpit360.tsx
```

**Fix 2: Form Label Not Associated**
```
File: src/components/organization/ProcessCockpit360.tsx:349
Error: A form label must be associated with a control

Action:
1. Go to line 349
2. Find the <label> element
3. Change: <label>Text</label>
   To: <label htmlFor="input-id">Text</label>
4. Change the corresponding input: <input id="input-id" ... />
5. Test: npm run lint -- src/components/organization/ProcessCockpit360.tsx
```

**Fix 3: React Hooks in Storybook (4 violations)**
```
File: src/stories/ProcessMetrics.stories.tsx (lines 275, 299, 356, 384)
Error: useState called in function "render" (not a component)

Action:
1. Find each story with useState violations
2. Extract the hooks into a separate component:

   WRONG:
   export const MyStory = {
     render: () => {
       const [count, setCount] = useState(0);
       return <div>{count}</div>;
     }
   };

   RIGHT:
   const MyComponent = () => {
     const [count, setCount] = useState(0);
     return <div>{count}</div>;
   };

   export const MyStory = {
     render: () => <MyComponent />
   };

3. Repeat for all 4 violations
4. Test: npm run lint -- src/stories/ProcessMetrics.stories.tsx
```

**Fix 4: Unescaped Quotes in JSX (8 violations)**
```
File: src/stories/ResponsibleRolesInput.stories.tsx (lines 251, 325, 326)
Error: Unescaped " characters

Action:
1. Find each occurrence of "text with unescaped quotes"
2. Change: <div>He said "hello"</div>
   To: <div>He said &quot;hello&quot;</div>
3. Test: npm run lint -- src/stories/ResponsibleRolesInput.stories.tsx
```

**Validation:**
```bash
npm run lint

# Expected output:
# 0 errors
# 0 warnings (or only non-critical warnings)
```

**Deliverable:**
- Commit: `fix: lint errors in ProcessCockpit + Storybook stories [Story 11.13]`
- 0 lint errors

---

### ACTION 3: @analyst (Alex) — Complete Documentation (Story 11.14 Phase 2)
**Priority:** MEDIUM
**Time Budget:** 1-2 hours
**Deadline:** Same day (after Actions 1-2 or in parallel)

**What to do:**

**Task 1: Update `.claude/CLAUDE.md` (30 min)**

File: `.claude/CLAUDE.md`
Location: After the "## Phase 3 Completion" section

Add this content (you can copy from `.aiox/BLOCKERS-DETAILED-RESOLUTION-GUIDE.md`):

```markdown
## Phase 4: EPIC 11 — Organizational Enrichment & BPM Mastery (2026-03-15 — 2026-04-25)

**Status:** 🟢 PHASE 4 IN PROGRESS (75% complete) | v0.2.4 release candidate

**Stories Completed:** 11/14
- Story 11.1-11.9: Foundation + Core Implementation (Phase 2-3) ✅
- Story 11.10: Advanced Search & Filter ✅
- Story 11.11: AI Context Embeddings ✅
- Story 11.12: Organizational Setup Wizard ✅
- Story 11.13: Bulk Operations & Permissions ✅
- Story 11.14: Complete Documentation & AI Patterns (Phase 2: 78% progress)

[Copy full section from resolution guide above]
```

**Command to validate:**
```bash
# Check file exists and contains EPIC 11
grep -n "EPIC 11\|Phase 4" .claude/CLAUDE.md

# Expected: Lines showing EPIC 11 Phase 4 section exists
```

**Task 2: Create `docs/stories/EPIC-INDEX.md` (1 hour)**

File: `docs/stories/EPIC-INDEX.md` (NEW)
Content: Copy from `.aiox/BLOCKERS-DETAILED-RESOLUTION-GUIDE.md` section "Task 2: Create `docs/stories/EPIC-INDEX.md`"

**Command to validate:**
```bash
# Check file exists
test -f docs/stories/EPIC-INDEX.md && echo "File created" || echo "File missing"

# Check it has content
wc -l docs/stories/EPIC-INDEX.md

# Expected: 450+ lines of content
```

**Validation:**
```bash
# All documentation present
ls -la .claude/CLAUDE.md docs/stories/EPIC-INDEX.md

# Expected: Both files exist and are readable
```

**Deliverable:**
- Commit: `docs: complete EPIC 11 documentation [Story 11.14]`
- Both files created and linked
- Story 11.14 AC 100% met

---

## 📋 SEQUENCE & DEPENDENCIES

```
ACTION 1 (4-6h): Fix unicode tests (Dex)
    ↓ (Commit: fix-unicode-encoding)
    ↓ (Validation: 400/400 tests)
    ↓
ACTION 2 (2-3h): Fix lint errors (Dex)
    ↓ (Commit: fix-lint-errors)
    ↓ (Validation: 0 lint errors)
    ↓
ACTION 3 (1-2h): Complete docs (Alex) [can start while Action 1-2 in progress]
    ↓ (Commit: docs-complete-EPIC-11)
    ↓ (Validation: 2 files created)
    ↓
ACTION 4: Final QA Validation (Quinn) — 30 min
    ↓ (Run: npm test && npm run lint)
    ↓ (Verify: All gates GREEN)
    ↓
RESULT: Release Sign-Off Issued ✅
```

**Parallelization Option:** Action 3 can start immediately while Dex works on Actions 1-2. No dependency.

---

## ✅ VALIDATION CHECKLIST FOR EACH ACTION

### After Action 1 (Unicode Fix)
- [ ] File: `src/lib/organization/import-export.ts` — encoding fixed
- [ ] Command: `npm test` → **All 400 tests passing** ✅
- [ ] Commit: `fix: unicode character encoding in import-export`

### After Action 2 (Lint Fix)
- [ ] File: `src/components/organization/ProcessCockpit360.tsx` — BarChart3 imported
- [ ] File: `src/components/organization/ProcessCockpit360.tsx` — form label associated
- [ ] File: `src/stories/ProcessMetrics.stories.tsx` — 4 hook violations fixed
- [ ] File: `src/stories/ResponsibleRolesInput.stories.tsx` — quotes escaped
- [ ] Command: `npm run lint` → **0 errors** ✅
- [ ] Commit: `fix: lint errors in ProcessCockpit + Storybook stories`

### After Action 3 (Documentation)
- [ ] File: `.claude/CLAUDE.md` — EPIC 11 Phase 4 section added (~50 lines)
- [ ] File: `docs/stories/EPIC-INDEX.md` — Created with comprehensive index (~450 lines)
- [ ] Validation: Both files readable and properly formatted
- [ ] Commit: `docs: complete EPIC 11 documentation [Story 11.14]`

### Final QA Re-Validation (Action 4)
- [ ] Command: `npm test` → **All 400 tests passing** ✅
- [ ] Command: `npm run lint` → **0 errors** ✅
- [ ] Command: `npm run typecheck` → **0 errors** ✅
- [ ] Files: `.claude/CLAUDE.md` + `docs/stories/EPIC-INDEX.md` verified
- [ ] Report: Final release sign-off issued
- [ ] Decision: ✅ **APPROVED FOR v0.2.4 RELEASE**

---

## 📞 COMMUNICATION PROTOCOL

### Dex (@dev) — Actions 1 & 2
**When starting:**
- Message: "Starting blocker fixes — unicode tests first, then lint"
- Estimated time: 6-9 hours total

**Milestone 1 (after Action 1):**
- Message: "Unicode tests fixed and passing (400/400)"
- Commit: `fix: unicode character encoding in import-export`

**Milestone 2 (after Action 2):**
- Message: "Lint errors fixed (0 errors, lint passing)"
- Commit: `fix: lint errors in ProcessCockpit + Storybook stories`
- Status: **Ready for QA re-validation**

### Alex (@analyst) — Action 3
**When starting:**
- Message: "Creating CLAUDE.md EPIC 11 section + EPIC-INDEX.md"
- Can start immediately (no dependency on Dex's work)

**When complete:**
- Message: "Documentation complete — EPIC 11 section added, EPIC-INDEX created"
- Commit: `docs: complete EPIC 11 documentation [Story 11.14]`
- Status: **Story 11.14 AC 100% met**

### Quinn (@qa) — Action 4
**When notified of all fixes:**
- Message: "Running final QA validation — all gates check"
- Time: ~30 minutes

**When complete:**
- Report: Final release sign-off document
- Decision: ✅ **APPROVED FOR v0.2.4** or 🔴 **BLOCKED** (if issues found)

---

## 🚀 SUCCESS CRITERIA

**Action 1 Success:**
✅ `npm test` returns: **Test Files: 50 passed, Tests: 400 passed**

**Action 2 Success:**
✅ `npm run lint` returns: **0 errors** (warnings acceptable if non-critical)

**Action 3 Success:**
✅ Both files exist: `.claude/CLAUDE.md` (with EPIC 11 section) + `docs/stories/EPIC-INDEX.md`

**Action 4 Success:**
✅ All gates GREEN + Final release sign-off issued

**Overall Success:**
✅ **v0.2.4 APPROVED FOR RELEASE**

---

## ⏰ TIMELINE TARGETS

| Action | Owner | Time | Deadline | Status |
|--------|-------|------|----------|--------|
| 1: Unicode fix | Dex | 4-6h | Today 20:00 | 🟡 START NOW |
| 2: Lint fix | Dex | 2-3h | Today 23:00 | ⏳ AFTER #1 |
| 3: Docs complete | Alex | 1-2h | Today/Tomorrow | ⏳ CAN START NOW |
| 4: Final QA | Quinn | 0.5h | Tomorrow AM | ⏳ AFTER #1-3 |
| **Release ready** | — | — | Tomorrow 02:00 | ✅ TARGET |
| Deploy to prod | @devops | — | 2026-04-25 | ✅ SCHEDULED |

---

## 📚 REFERENCE DOCUMENTS

**For detailed instructions:**
- `.aiox/BLOCKERS-DETAILED-RESOLUTION-GUIDE.md` — Step-by-step fix guide
- `.aiox/QA-FINAL-GATE-REPORT.md` — Complete QA assessment
- `.aiox/EPIC-11-FINAL-RELEASE-VALIDATION.md` — Validation details

**For story context:**
- `docs/stories/11.14-documentation-ai-patterns.story.md` — Story 11.14 full details
- `.aiox/EPIC-11-AUTONOMOUS-EXECUTION.md` — Full EPIC 11 plan

---

## ❓ QUESTIONS?

**For blockers/issues:** Check `.aiox/BLOCKERS-DETAILED-RESOLUTION-GUIDE.md`
**For validation details:** Check `.aiox/QA-FINAL-GATE-REPORT.md`
**For overall status:** Check `.aiox/EPIC-11-FINAL-RELEASE-VALIDATION.md`

---

**Document:** Next Actions for v0.2.4 Release
**Created by:** Quinn (@qa)
**Framework:** Synkra AIOX v1.0.0
**Status:** RELEASE BLOCKED — AWAITING ACTION

*Execute these actions to move from BLOCKED to APPROVED.*

---

## 🎬 START HERE

**Right now:**
1. **Dex:** Open `src/lib/organization/__tests__/import-export.test.ts` and start investigating unicode encoding
2. **Alex:** Start creating `docs/stories/EPIC-INDEX.md` (no dependency on Dex's work)

**Expected result in 12-24 hours:**
✅ All 3 blockers fixed
✅ All gates GREEN
✅ Release sign-off issued
✅ Ready for deployment on 2026-04-25
