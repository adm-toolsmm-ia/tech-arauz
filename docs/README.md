# Tech Arauz Documentation — AIOX 10/10

**Version:** 0.2.4+ (Production Live)
**Framework:** Synkra AIOX v1.0.0
**Last Updated:** 2026-03-21
**Status:** ✅ Organized & Current

---

## 🧭 Composer Documentation Pack

Para gerar ou atualizar documentação com **zero invenção** e engenharia de contexto 10/10:

- **[engineering/COMPOSER-DOCUMENTATION-PACK.md](engineering/COMPOSER-DOCUMENTATION-PACK.md)** — Global Contract, prompts por artefacto, checklist anti-alucinação
- **[engineering/DOCUMENTATION-SOURCES.md](engineering/DOCUMENTATION-SOURCES.md)** — Matriz doc → fontes obrigatórias + ordem de leitura

Use estes documentos como entrada para sessões Composer antes de produzir qualquer artefacto.

---

## 📚 Estrutura de Documentação (Padrão AIOX)

Documentação organizada em pastas por domínio para engenharia de contexto AI.

### 📐 Architecture & Design (`architecture/`)

Decisões técnicas, design de sistema, integrações:

- **ADR Registry** — [architecture/ADR-REGISTRY.md](architecture/ADR-REGISTRY.md)
- **ARCHITECTURE-OVERVIEW** — [architecture/ARCHITECTURE-OVERVIEW.md](architecture/ARCHITECTURE-OVERVIEW.md)
- **Module Standards** — [architecture/module-standards.md](architecture/module-standards.md)
- **ESPAIDER-INTEGRATION** — [architecture/ESPAIDER-INTEGRATION.md](architecture/ESPAIDER-INTEGRATION.md)
- **DATA-FLOW-DIAGRAMS** — [architecture/DATA-FLOW-DIAGRAMS.md](architecture/DATA-FLOW-DIAGRAMS.md)
- **SECURITY-PATTERNS** — [architecture/SECURITY-PATTERNS.md](architecture/SECURITY-PATTERNS.md)
- **Build & Deploy Gates** — [architecture/build-deploy-gates.md](architecture/build-deploy-gates.md)

### 📋 ADRs (`adr/`)

Architectural Decision Records:

- **ADR-001: RLS Strategy** — [adr/ADR-001-RLS-STRATEGY.md](adr/ADR-001-RLS-STRATEGY.md)
- **ADR-002: Token Fallback Chain** — [adr/ADR-002-TOKEN-FALLBACK-CHAIN.md](adr/ADR-002-TOKEN-FALLBACK-CHAIN.md)
- **ADR-004: Feature Folders** — [adr/ADR-004-FEATURE-FOLDERS.md](adr/ADR-004-FEATURE-FOLDERS.md)
- **ADR-005: Organization Architecture** — [adr/ADR-005-organization-architecture.md](adr/ADR-005-organization-architecture.md)

### 📖 Guides (`guides/`)

Setup, testes, regras de contexto:

- **DEVELOPMENT-SETUP** — [guides/DEVELOPMENT-SETUP.md](guides/DEVELOPMENT-SETUP.md)
- **TESTING-STRATEGY** — [guides/TESTING-STRATEGY.md](guides/TESTING-STRATEGY.md)
- **CONTEXT-ENGINEERING-RULES** — [guides/CONTEXT-ENGINEERING-RULES.md](guides/CONTEXT-ENGINEERING-RULES.md)
- **INTEGRATION-GUIDE** — [guides/INTEGRATION-GUIDE.md](guides/INTEGRATION-GUIDE.md)
- **TROUBLESHOOTING-FAQ** — [guides/v0.2.4-TROUBLESHOOTING-FAQ.md](guides/v0.2.4-TROUBLESHOOTING-FAQ.md)
- **AI-CONTEXT-ENGINEERING** — [guides/AI-CONTEXT-ENGINEERING.md](guides/AI-CONTEXT-ENGINEERING.md)
- **BOOTSTRAP-CUSTOMIZATION** — [guides/BOOTSTRAP-CUSTOMIZATION.md](guides/BOOTSTRAP-CUSTOMIZATION.md)

### 🔍 Reference (`reference/`)

Referência técnica, versões, API, estado:

- **PROJECT-CURRENT-STATE** — [reference/PROJECT-CURRENT-STATE.md](reference/PROJECT-CURRENT-STATE.md) — Fonte única para decisões (deployed vs to-do)
- **VERSION-SNAPSHOT** — [reference/VERSION-SNAPSHOT.md](reference/VERSION-SNAPSHOT.md) — Versões e config atual
- **API-DOCUMENTATION** — [reference/API-DOCUMENTATION.md](reference/API-DOCUMENTATION.md)
- **SERVER-ACTIONS-GUIDE** — [reference/SERVER-ACTIONS-GUIDE.md](reference/SERVER-ACTIONS-GUIDE.md)
- **STATE-MANAGEMENT** — [reference/STATE-MANAGEMENT.md](reference/STATE-MANAGEMENT.md)
- **COMPONENTS-CATALOG** — [reference/COMPONENTS-CATALOG.md](reference/COMPONENTS-CATALOG.md)
- **DATABASE-SCHEMA** — [reference/DATABASE-SCHEMA.md](reference/DATABASE-SCHEMA.md)
- **TECH-STACK** — [framework/TECH-STACK.md](framework/TECH-STACK.md)
- **v0.2.4 API/Schema refs** — [reference/v0.2.4-*](reference/)

### 📋 PRD & Product (`prd/`)

Requisitos e capacidades atuais:

- **PRD-BROWFIELD-CAPABILITIES** — [prd/PRD-BROWFIELD-CAPABILITIES.md](prd/PRD-BROWFIELD-CAPABILITIES.md) — Mapa de capacidades por rota
- **EPIC-11-COMPLETE-FEATURE-GUIDE** — [prd/v0.2.4-EPIC-11-COMPLETE-FEATURE-GUIDE.md](prd/v0.2.4-EPIC-11-COMPLETE-FEATURE-GUIDE.md)
- **technical-debt-assessment** — [prd/technical-debt-assessment.md](prd/technical-debt-assessment.md)

### 🔧 Engineering (`engineering/`)

Build, deploy, pack Composer:

- **COMPOSER-DOCUMENTATION-PACK** — [engineering/COMPOSER-DOCUMENTATION-PACK.md](engineering/COMPOSER-DOCUMENTATION-PACK.md)
- **DOCUMENTATION-SOURCES** — [engineering/DOCUMENTATION-SOURCES.md](engineering/DOCUMENTATION-SOURCES.md)
- **OPERATIONS-REFERENCE** — [engineering/OPERATIONS-REFERENCE.md](engineering/OPERATIONS-REFERENCE.md) — Scripts npm, env, Supabase
- **DEPLOYMENT-GUIDE** — [engineering/DEPLOYMENT-GUIDE.md](engineering/DEPLOYMENT-GUIDE.md)
- **OPERATIONAL-RUNBOOK** — [engineering/OPERATIONAL-RUNBOOK.md](engineering/OPERATIONAL-RUNBOOK.md)

### 📖 User Stories (`stories/`)

Development stories and epics:

- [docs/stories/EPIC-INDEX.md](stories/EPIC-INDEX.md)
- [reference/PROJECT-CURRENT-STATE.md](reference/PROJECT-CURRENT-STATE.md)

---

## 🚀 Quick Navigation

**I'm new and want to...**

- ✅ **Set up local development** → [guides/DEVELOPMENT-SETUP.md](guides/DEVELOPMENT-SETUP.md)
- ✅ **Understand the architecture** → [architecture/ARCHITECTURE-OVERVIEW.md](architecture/ARCHITECTURE-OVERVIEW.md), [adr/ADR-001-RLS-STRATEGY.md](adr/ADR-001-RLS-STRATEGY.md)
- ✅ **Generate/update docs** → [engineering/COMPOSER-DOCUMENTATION-PACK.md](engineering/COMPOSER-DOCUMENTATION-PACK.md)
- ✅ **Implement a feature** → [guides/CONTEXT-ENGINEERING-RULES.md](guides/CONTEXT-ENGINEERING-RULES.md) then [stories/](stories/)
- ✅ **Test my code** → [guides/TESTING-STRATEGY.md](guides/TESTING-STRATEGY.md)
- ✅ **Understand security** → [architecture/SECURITY-PATTERNS.md](architecture/SECURITY-PATTERNS.md), [governance/SECURITY-STANDARDS.md](governance/SECURITY-STANDARDS.md)
- ✅ **Work with Espaider** → [architecture/ESPAIDER-INTEGRATION.md](architecture/ESPAIDER-INTEGRATION.md)

**I'm working on...**

- 🔨 **Backend/API** → [reference/SERVER-ACTIONS-GUIDE.md](reference/SERVER-ACTIONS-GUIDE.md)
- 🎨 **Frontend** → [reference/STATE-MANAGEMENT.md](reference/STATE-MANAGEMENT.md)
- 🗄️ **Database** → [architecture/data/schema.prisma](architecture/data/schema.prisma), [adr/ADR-001-RLS-STRATEGY.md](adr/ADR-001-RLS-STRATEGY.md)
- 📋 **Capabilities (PRD)** → [prd/PRD-BROWFIELD-CAPABILITIES.md](prd/PRD-BROWFIELD-CAPABILITIES.md)
- 🔧 **Ops & Scripts** → [engineering/OPERATIONS-REFERENCE.md](engineering/OPERATIONS-REFERENCE.md)
- 🔐 **Security** → [architecture/SECURITY-PATTERNS.md](architecture/SECURITY-PATTERNS.md)
- 🧪 **Testing** → [guides/TESTING-STRATEGY.md](guides/TESTING-STRATEGY.md)

---

## 📊 Documentation Metrics

| Category | Documents | Status | Last Updated |
|----------|-----------|--------|---|
| Composer Pack & Sources | 2 docs | ✅ Current | 2026-03-21 |
| Architecture & ADRs | 8+ docs | ✅ Current | 2026-03-21 |
| Guides & How-To | 5+ docs | ✅ Current | 2026-03-21 |
| Reference (root + framework) | 5+ docs | ✅ Current | 2026-03-21 |
| Stories & Epics | 50+ docs | ✅ Current | 2026-03-21 |

---

## ✅ Quality Assurance

All documentation follows **AIOX 10/10 standards**:

- ✅ **Code-to-Doc Verified** — Every statement traced to source code
- ✅ **No Invention** — Facts only, patterns from codebase
- ✅ **Current Version** — Reflects v0.2.3+ production code
- ✅ **Framework Compliant** — Synkra AIOX Constitution adherence
- ✅ **Owner Assigned** — Each doc has responsible agent (@architect, @dev, @data-engineer, etc.)

---

## 🗂️ Archived Documentation (`_deprecated/`)

Documentos históricos preservados para referência — **não usar para engenharia de contexto atual**:

- `_deprecated/roadmaps-and-plans/` — Planos de documentação, roadmaps, análises pendentes
- `_deprecated/audits-and-reports/` — Audits operacionais, reports de modernização Espaider, status quick-lookup
- `_deprecated/reports/` — Deployment reports, sprint summaries

*Para decisões e estado atual, usar sempre [reference/PROJECT-CURRENT-STATE.md](reference/PROJECT-CURRENT-STATE.md).*

---

## 🔄 Contributing to Documentation

### Guidelines

1. **Code-to-Doc Only** — Every statement must trace to actual code
2. **AIOX Format** — Follow the format of existing docs (frontmatter, sections, examples)
3. **Owner Assignment** — Include "Para [Agent]" section at end
4. **Verification** — Run `npm run audit:docs` before committing
5. **Update README** — Add new docs to this README

### Adding a New Document

1. Create doc in appropriate folder (`architecture/`, `adr/`, `guides/`, `reference/`, `prd/`, `engineering/`)
2. Use [engineering/DOCUMENTATION-SOURCES.md](engineering/DOCUMENTATION-SOURCES.md) for required sources when documenting code
3. Include AIOX frontmatter:
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
- **Implementation questions** → @dev (Dex) via `docs/guides/` or root docs
- **Database questions** → @data-engineer (Dara) via `docs/architecture/data/`
- **Testing questions** → @qa (Quinn) via `docs/guides/TESTING-STRATEGY.md`
- **Documentation generation** → [engineering/COMPOSER-DOCUMENTATION-PACK.md](engineering/COMPOSER-DOCUMENTATION-PACK.md)

---

## 📜 Version History

| Version | Date | Change |
|---------|------|--------|
| **0.2.4+** | 2026-03-21 | Reorganização AIOX: reference/, prd/, adr/, guides/; docs Composer pack em engineering/ |
| **0.2.3+** | 2026-03-15 | Reorganized documentation per AIOX 10/10, archived old docs, created README |

---

**Maintained by:** @architect (Aria), @dev (Dex), @data-engineer (Dara)
**Framework:** Synkra AIOX v1.0.0
**Compliance:** ✅ AIOX Constitution Article IV (No Invention)

— Orion, orquestrando o sistema 🎯
