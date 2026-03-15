# Tech Arauz Documentation — AIOX 10/10

**Version:** 0.2.3+ (Production Live)
**Framework:** Synkra AIOX v1.0.0
**Last Updated:** 2026-03-15
**Status:** ✅ Organized & Current

---

## 📚 Documentation Structure

This directory contains **authoritative documentation** for Tech Arauz following AIOX 10/10 standards (code-to-doc verified, no invented content).

### 📐 Architecture & Design (`architecture/`)

Technical decisions, system design, and ADRs:

- **ADR-001: RLS Strategy** — Row-level security, tenant isolation, helper functions
- **ADR-002: Token Fallback Chain** — AES-256-GCM encryption, token resolution
- **ADR-004: Feature Folders** — Feature-based structure, shared vs. specific code
- **SECURITY-PATTERNS.md** — 4-layer security, RBAC, authentication, error handling
- **ESPAIDER-INTEGRATION.md** — Espaider BI sync, circuit breaker, UPSERT idempotency
- **DATA-FLOW-DIAGRAMS.md** — Read/Write/Sync flows with timing, error paths

### 📖 Guides & How-To (`guides/`)

Development guides, setup instructions, and learning resources:

- **DEVELOPMENT-SETUP.md** — Local development environment, npm scripts, troubleshooting
- **TESTING-STRATEGY.md** — Testing pyramid, Vitest/Jest-axe/Cypress, 92% coverage
- **CONTEXT-ENGINEERING-RULES.md** — AIOX framework rules, agent authority, gates

### 🔍 Reference & API (`reference/`)

API documentation, technical reference, and implementation guides:

- **API-DOCUMENTATION.md** — 21 endpoints, proxy patterns, auth flow, error handling
- **SERVER-ACTIONS-GUIDE.md** — 10+ server actions, auth patterns, form state
- **STATE-MANAGEMENT.md** — React Query, Zustand, form state layers (3-layer architecture)
- **COMPONENTS-CATALOG.md** — UI components, layout, common patterns
- **DATABASE-SCHEMA.md** — Database schema, RLS policies, migrations

### 📖 User Stories (`stories/`)

Development stories and epics (separate folder):

- EPIC-5, 6, 7, 8, 9, 10 (completed)
- Story tracking and implementation details

---

## 🚀 Quick Navigation

**I'm new and want to...**

- ✅ **Set up local development** → `guides/DEVELOPMENT-SETUP.md`
- ✅ **Understand the architecture** → `architecture/ADR-001`, `ADR-002`, `ADR-004`
- ✅ **Write API code** → `reference/API-DOCUMENTATION.md`
- ✅ **Implement a feature** → `guides/CONTEXT-ENGINEERING-RULES.md` then `stories/`
- ✅ **Test my code** → `guides/TESTING-STRATEGY.md`
- ✅ **Understand security** → `architecture/SECURITY-PATTERNS.md`
- ✅ **Work with Espaider** → `architecture/ESPAIDER-INTEGRATION.md`

**I'm working on...**

- 🔨 **Backend/API** → `reference/API-DOCUMENTATION.md` + `reference/SERVER-ACTIONS-GUIDE.md`
- 🎨 **Frontend** → `reference/STATE-MANAGEMENT.md` + `reference/COMPONENTS-CATALOG.md`
- 🗄️ **Database** → `reference/DATABASE-SCHEMA.md` + `architecture/ADR-001-RLS-STRATEGY.md`
- 🔐 **Security** → `architecture/SECURITY-PATTERNS.md`
- 🧪 **Testing** → `guides/TESTING-STRATEGY.md`

---

## 📊 Documentation Metrics

| Category | Documents | Status | Last Updated |
|----------|-----------|--------|---|
| Architecture & ADRs | 6 docs | ✅ Current | 2026-03-15 |
| Guides & How-To | 3 docs | ✅ Current | 2026-03-15 |
| Reference & API | 5 docs | ✅ Current | 2026-03-15 |
| Stories & Epics | 20+ docs | ✅ Current | 2026-03-12 |
| **TOTAL** | **34 docs** | **✅ AIOX 10/10** | **2026-03-15** |

---

## ✅ Quality Assurance

All documentation follows **AIOX 10/10 standards**:

- ✅ **Code-to-Doc Verified** — Every statement traced to source code
- ✅ **No Invention** — Facts only, patterns from codebase
- ✅ **Current Version** — Reflects v0.2.3+ production code
- ✅ **Framework Compliant** — Synkra AIOX Constitution adherence
- ✅ **Owner Assigned** — Each doc has responsible agent (@architect, @dev, @data-engineer, etc.)

---

## 🗂️ Archived Documentation

Historical documents (deployment reports, planning docs, old audits) are preserved in `_deprecated/` for reference:

- `_deprecated/reports/` — Historical deployment & execution reports
- `_deprecated/planning/` — Old planning documents & roadmaps
- `_deprecated/audits/` — Past technical audits & assessments

*These are kept for historical context only and should not be referenced for current development.*

---

## 🔄 Contributing to Documentation

### Guidelines

1. **Code-to-Doc Only** — Every statement must trace to actual code
2. **AIOX Format** — Follow the format of existing docs (frontmatter, sections, examples)
3. **Owner Assignment** — Include "Para [Agent]" section at end
4. **Verification** — Run `npm run audit:docs` before committing
5. **Update README** — Add new docs to this README

### Adding a New Document

1. Create doc in appropriate folder (`architecture/`, `guides/`, or `reference/`)
2. Include AIOX frontmatter:
   ```markdown
   # Title
   **Status:** ACCEPTED
   **Date:** YYYY-MM-DD
   **Code-to-Doc Verified:** ✅ source/file.ts (line X)
   ```
3. Include "Para [Agent]" section at end
4. Update this README.md
5. Commit with message: `docs: Add {title} to {category}`

---

## 📞 Contact & Questions

- **Architecture questions** → @architect (Aria) via `docs/architecture/`
- **Implementation questions** → @dev (Dex) via `docs/guides/` or `docs/reference/`
- **Database questions** → @data-engineer (Dara) via `docs/reference/DATABASE-SCHEMA.md`
- **Testing questions** → @qa (Quinn) via `docs/guides/TESTING-STRATEGY.md`

---

## 📜 Version History

| Version | Date | Change |
|---------|------|--------|
| **0.2.3+** | 2026-03-15 | Reorganized documentation per AIOX 10/10, archived old docs, created README |
| **0.2.3** | 2026-03-12 | Initial AIOX 10/10 documentation created (16 artifacts) |

---

**Maintained by:** @architect (Aria), @dev (Dex), @data-engineer (Dara)
**Framework:** Synkra AIOX v1.0.0
**Compliance:** ✅ AIOX Constitution Article IV (No Invention)

— Orion, orquestrando o sistema 🎯
