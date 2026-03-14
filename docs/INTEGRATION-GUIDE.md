# Integration Guide — Using AIOX 10/10 Docs in Daily Work

**Version:** 0.2.3
**Framework:** Synkra AIOX v1.0.0

---

## Where to Find Docs

**Master Documents (START HERE):**
- `docs/ARCHITECTURE-10-10.md` — Tech architecture overview
- `docs/AIOX-FRAMEWORK-INTEGRATION.md` — Framework integration
- `docs/ENGINEERING-10-10.md` — Build, test, deploy
- `docs/GOVERNANCE-10-10.md` — Quality gates, compliance

---

## How Stories Reference Architecture

**Story File:** `docs/stories/story-7.2.story.md`

**References:**
```
File List:
- `src/components/ProjectKanbanCard.tsx` [NEW]
  → See: SOFTWARE-ARCHITECTURE.md (component hierarchy)

- `supabase/migrations/024_*.sql` [MODIFIED]
  → See: DATABASE-ARCHITECTURE.md (RLS + schema)
```

---

## How Code Reviews Use Governance

**QA Gate:**
```
@qa *qa-gate
  → See: GOVERNANCE-10-10.md (7-point checklist)
  → See: SECURITY-STANDARDS.md (OWASP validation)
```

---

## How New Devs Onboard

**Step 1:** Read `DEVELOPMENT-ENVIRONMENT.md` (setup)
**Step 2:** Read `ARCHITECTURE-10-10.md` (overview)
**Step 3:** Read `SOFTWARE-ARCHITECTURE.md` (patterns)
**Step 4:** Start coding (follow module-standards.md)

---

## How to Evolve Docs

1. Architecture change → Update ADR-REGISTRY.md
2. Workflow change → Update AIOX-WORKFLOW-MAP.md
3. Quality gate change → Update QUALITY-GATES-FRAMEWORK.md
4. Security update → Update SECURITY-STANDARDS.md

---

**Authored by:** Claude Code (Haiku 4.5)
