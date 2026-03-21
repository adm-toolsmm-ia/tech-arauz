# 🎯 CONTEXT ENGINEERING RULES — Tech Arauz

**Purpose:** Prevent stale/outdated documentation from polluting AI decision-making and causing context confusion.

**Effective Date:** 2026-03-14
**Framework:** AIOX Story Development Cycle
**Owner:** Orion (@aiox-master)

---

## ⚠️ PROBLEM STATEMENT

**Issue Discovered (2026-03-14):** Multiple EPICs had documentation marked "Ready for Implementation" when features were already deployed to production.

**Example Failures:**
- EPIC 7: Stories documented as "Ready" but v0.2.2 already deployed all 5 stories
- EPIC 10: Stories documented as "Ready for Review" but v0.2.3+ already deployed all 3 stories
- EPIC 5, 6, 8: Documented as active but many features already implemented (conflicting with codebase reality)

**Root Cause:** Documentation not updated when features implemented and deployed. Leads to:
1. ❌ AI agents making wrong decisions based on stale context
2. ❌ Duplicate work proposed on already-complete features
3. ❌ Incorrect timeline planning
4. ❌ Context bloat (160+ lines per story for already-done work)

---

## ✅ SOLUTION: CONTEXT ENGINEERING RULES

### RULE 1: Single Source of Truth (Code First)
**Principle:** Code and git history are ALWAYS the authoritative source. Documentation must align with code reality.

**Implementation:**
- ✅ Check git commits BEFORE planning work
- ✅ Grep source code for feature existence
- ✅ Look at migrations (schema changes) as truth for DB features
- ✅ Trust `src/`, `supabase/`, and git log over documentation

**Anti-Pattern:**
```
❌ WRONG: "EPIC 10 is ready for story creation" (when commits show already deployed)
✅ CORRECT: "EPIC 10 is DONE — stories 10.1, 10.2, 10.3 deployed via commits 6d8f815, c50c698, bae7947"
```

---

### RULE 2: Immediate Documentation After Deployment
**Principle:** When code is deployed, update documentation WITHIN 24 HOURS.

**Process:**
1. ✅ Feature implemented and tested
2. ✅ Commit to git + create tag (e.g., v0.2.3)
3. ✅ Deploy to production
4. ✅ **IMMEDIATELY update story files:**
   - Change `Status:` from "Ready for Review" → "✅ DONE"
   - Add `Deployed:` date and commit hash
   - Update EPIC-INDEX.md
   - Move story to completed section (if applicable)

**Timeline:** Deployment → +24 hours max for doc update
**Responsibility:** Developer (Dex) or whoever marks PR complete

---

### RULE 3: Archive Completed Cycles Immediately
**Principle:** Once an EPIC is complete, move it out of active documentation immediately.

**Process:**
1. ✅ All stories in EPIC complete and deployed
2. ✅ Mark EPIC status: ✅ COMPLETE (with version tag)
3. ✅ Move stories to `_deprecated/stories/completed/` or archive folder
4. ✅ Update EPIC-INDEX.md with ✅ **COMPLETE** status
5. ✅ Remove from "Getting Started" / active planning sections

**Anti-Pattern:**
```
❌ WRONG: EPIC-INDEX says "EPIC 10: Ready for Story Creation" when all 3 stories deployed
✅ CORRECT: EPIC-INDEX says "EPIC 10: ✅ COMPLETE (v0.2.3+, 3/3 stories deployed)"
```

---

### RULE 4: PROJECT-CURRENT-STATE.md Is Single Source for Decision Making
**Principle:** All AI agents must reference **ONLY** PROJECT-CURRENT-STATE.md for understanding what's deployed vs. what's to-do.

**Process:**
1. ✅ Create PROJECT-CURRENT-STATE.md at docs/reference/ (single source)
2. ✅ Update when ANY EPIC status changes
3. ✅ Keep timestamp of last update (shows freshness)
4. ✅ Link from CLAUDE.md memory system
5. ✅ Reference in all planning / architecture decisions

**Content Required in PROJECT-CURRENT-STATE:**
```markdown
## ✅ DEPLOYED (Production Ready)
- EPIC X: Status + deployment version
- Feature list + QA scores

## ❌ ARCHIVED (Not Recommended)
- EPIC Y: Reason for archive
- Link to detailed findings

## 🆕 NOT YET PLANNED
- EPIC Z status
- Recommendations for next steps
```

---

### RULE 5: Git Commit Messages Are Documentation
**Principle:** Commit messages must be specific enough to serve as documentation for AI agents.

**Format:**
```bash
# ✅ GOOD
git commit -m "feat: Implement Story 10.1 - Add responsible_roles to Database (Migration 065)"
git commit -m "chore: Mark Story 10.1 as Ready for Review with Dev Agent Record"

# ❌ BAD
git commit -m "implement story"
git commit -m "update docs"
git commit -m "fix"
```

**Why:** AI agents and developers later read commit history to understand:
- What was implemented
- When it was done
- How it relates to stories/EPICs
- Whether it's deployed or still WIP

---

### RULE 6: Deprecated Stories Go to _deprecated/ Immediately
**Principle:** Completed or archived stories must not pollute active documentation space.

**Structure:**
```
docs/stories/
├── reference/PROJECT-CURRENT-STATE.md ← Single source of truth
├── EPIC-INDEX.md ← Index only (links to active + deprecated)
├── (active EPIC files only)
└── _deprecated/stories/
    ├── completed/ (finished EPICs)
    ├── auditoria-encerrada-epic-5-6-8/
    ├── deprecated-versions/ (old story versions)
    └── logs/ (execution records)
```

**When to Archive:**
- ✅ EPIC complete + deployed → Move entire folder to `_deprecated/completed/`
- ✅ Story decided as low-priority → Move to `_deprecated/` with "DEPRECATED" tag
- ✅ Story superseded by newer version → Keep old version in `_deprecated/deprecated-versions/`

---

### RULE 7: Document Decisions with Dates & Audit Trail
**Principle:** Every major decision (archive, deprecate, change priority) must be documented with DATE + REASON.

**Format:**
```markdown
**Decision:** Archive EPIC 5, 6, 8
**Date:** 2026-03-14
**Decision Maker:** Orion (@aiox-master)
**Reason:** Features missing, low-priority, or already implemented per audit
**Evidence:** See _deprecated/stories/auditoria-encerrada-epic-5-6-8/AUDIT-COMPLETION-REPORT.md
**Impact:** Removed from active planning; available in deprecated folder for reference
```

---

### RULE 8: AI Context Must Refresh Weekly
**Principle:** AI agents reviewing old documentation should trigger context refresh if >7 days old.

**Implementation (for AI agents):**
1. ✅ Check PROJECT-CURRENT-STATE.md timestamp
2. ✅ If timestamp >7 days old → **RUN AUDIT** of actual codebase
   - git log recent commits?
   - New migrations applied?
   - New story files created?
   - Features mentioned in stories actually exist in code?
3. ✅ Update documentation if discrepancies found
4. ✅ Do NOT trust stale docs without verification

**Trigger Checklist:**
```
- [ ] Read PROJECT-CURRENT-STATE.md timestamp
- [ ] Is timestamp >7 days old?
- [ ] YES → Run codebase audit before planning
- [ ] NO → Safe to use as reference
```

---

## 🎓 HOW TO APPLY THESE RULES

### For Developers (After Completing a Story)
1. ✅ Run `npm run test && npm run lint && npm run typecheck`
2. ✅ Create commit: `feat: Implement Story X.Y - [description]`
3. ✅ Deploy to production
4. ✅ **IMMEDIATELY** (within 24h) update story file:
   - Change `Status:` to `✅ DONE`
   - Add deployment info + commit hash
   - Update File List
5. ✅ Update EPIC-INDEX.md if EPIC now complete

### For Product/Architects (Planning Next Work)
1. ✅ **ALWAYS** read PROJECT-CURRENT-STATE.md FIRST
2. ✅ For past EPICs, check git history before re-proposing features
3. ✅ Propose new work based on what's ACTUALLY deployed (not documentation promises)
4. ✅ If unsure, run: `git log --oneline | grep "Story X"`

### For AI Agents (Making Decisions)
1. ✅ Reference PROJECT-CURRENT-STATE.md as ONLY source for "what's deployed"
2. ✅ If document >7 days old, trigger codebase audit before trusting it
3. ✅ When planning work, ALWAYS check git commits matching the story
4. ✅ Trust `src/`, `migrations/`, and git log over .story.md files
5. ✅ If documentation conflicts with code, assume code is truth

---

## 🚨 FAILURE SCENARIOS & HOW TO PREVENT

| Scenario | What Went Wrong | How to Prevent |
|----------|-----------------|----------------|
| **EPIC 7: "Ready" but deployed v0.2.2** | Docs never updated after deployment | Rule 2: Update within 24h |
| **EPIC 10: "Ready for Review" but implemented** | Docs never marked as DONE | Rule 2: Change status immediately |
| **EPIC 5, 6, 8: "Ready" but conflicts with code** | Docs outdated vs. real implementation | Rule 1: Check code first |
| **AI agent proposed duplicate work** | Trusted stale docs instead of git log | Rule 8: Refresh context weekly |
| **Deprecated stories in active docs** | No archival process | Rule 6: Move to _deprecated/ |

---

## ✅ VERIFICATION CHECKLIST

**Use this checklist quarterly to maintain context health:**

- [ ] PROJECT-CURRENT-STATE.md exists and timestamp is <30 days old
- [ ] EPIC-INDEX.md links to PROJECT-CURRENT-STATE.md
- [ ] All completed EPICs (7, 9, 10) marked as ✅ COMPLETE
- [ ] All archived EPICs (5, 6, 8) marked as ❌ ARCHIVED
- [ ] No "Ready for Implementation" EPICs that are actually deployed
- [ ] _deprecated/stories/ folder has proper archive structure
- [ ] Recent commits (last 10) have clear, story-related messages
- [ ] Git tags match version deployments
- [ ] No story files older than 2 weeks without deployment update
- [ ] CLAUDE.md memory points to PROJECT-CURRENT-STATE.md

---

## 📞 SUPPORT & ESCALATION

**If you find stale documentation:**
1. ✅ Check git log to find ACTUAL deployment date
2. ✅ Update documentation to match code reality
3. ✅ Create decision log entry (Rule 7)
4. ✅ Archive old docs to `_deprecated/` (Rule 6)
5. ✅ Notify team of update (for awareness)

**If AI agent makes wrong decision based on stale docs:**
1. ✅ Document the error (what doc was used, what code showed)
2. ✅ Update PROJECT-CURRENT-STATE.md
3. ✅ Consider adding timestamp refresh triggers to agent activation

---

## 🎯 METRICS FOR SUCCESS

**After implementing these rules, the team should see:**

1. **✅ Zero context-based duplicate work** — AI agents won't propose already-completed features
2. **✅ Cleaner documentation** — Archived EPICs don't pollute active planning
3. **✅ Faster planning cycles** — PROJECT-CURRENT-STATE.md provides immediate clarity
4. **✅ Higher AI decision quality** — Context engineering prevents hallucinations
5. **✅ 100% doc-to-code alignment** — No surprises when developing

---

**Framework:** AIOX Story Development Cycle v1.0
**Reviewed By:** Orion (@aiox-master)
**Last Updated:** 2026-03-14
**Status:** ✅ **ACTIVE & ENFORCED**

