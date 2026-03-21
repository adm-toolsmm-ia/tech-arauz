# DOCUMENTATION SOURCES — Matriz Doc → Fontes Obrigatórias

**Purpose:** Matriz "documento alvo → ficheiros obrigatórios + ordem de leitura" para reuso por Composer e agentes AI.

**Framework:** AIOX 10/10 (zero invenção)
**Effective Date:** 2026-03-21
**Related:** [COMPOSER-DOCUMENTATION-PACK.md](COMPOSER-DOCUMENTATION-PACK.md)

---

## Regra de uso

Para gerar ou atualizar um documento alvo, ler as fontes **na ordem indicada** e citar cada path no `evidence_manifest` do documento gerado. Nunca afirmar factos sem incluir o ficheiro correspondente em `evidence_manifest`.

---

## Matriz: Documento → Fontes (ordem de leitura)

| Doc alvo | Prioridade | Fontes obrigatórias (ordem) |
|----------|------------|----------------------------|
| **Snapshot de versão** | P0 | 1. `package.json`<br>2. `configs/project.yaml`<br>3. `supabase/migrations/` (listar ficheiros)<br>4. `git rev-parse HEAD` / `git describe` |
| **DATABASE-SCHEMA** | P0 | 1. `docs/architecture/data/schema.prisma`<br>2. `docs/architecture/data/README.md`<br>3. `supabase/migrations/*.sql` (CREATE TABLE, ALTER, RLS)<br>4. `docs/adr/ADR-001-RLS-STRATEGY.md`<br>5. `docs/architecture/ADR-REGISTRY.md` |
| **ARCHITECTURE-OVERVIEW** | P0 | 1. `configs/project.yaml`<br>2. `docs/architecture/module-standards.md`<br>3. `src/app/**/page.tsx` (listar rotas)<br>4. `src/app/api/**` (listar routes)<br>5. `src/server/**` ou grep server actions<br>6. `docs/architecture/ESPAIDER-INTEGRATION.md`<br>7. `docs/architecture/ADR-REGISTRY.md` |
| **PRD / Capability map brownfield** | P0 | 1. `docs/reference/PROJECT-CURRENT-STATE.md`<br>2. `docs/stories/EPIC-INDEX.md`<br>3. `src/app/**/page.tsx` (validar contra docs)<br>4. `configs/project.yaml` (design_system, integrações) |
| **TECH-STACK** | P0 | 1. `package.json` (dependencies, devDependencies)<br>2. `configs/project.yaml` (stack, integrations)<br>3. `docs/framework/TECH-STACK.md` (se existir, cruzar) |
| **API-DOCUMENTATION** | P0 | 1. `src/app/api/**/route.ts` (listar)<br>2. Handlers em cada route<br>3. `docs/v0.2.4-API-TYPES-AND-RELATIONSHIPS.md` (se existir, cruzar) |
| **SERVER-ACTIONS-GUIDE** | P0 | 1. `src/app/actions/**` ou grep `"use server"`<br>2. Ficheiros de server actions<br>3. `docs/reference/SERVER-ACTIONS-GUIDE.md` (se existir, cruzar) |
| **COMPONENTS-CATALOG** | P1 | 1. `src/components/**` (listar por categoria)<br>2. `configs/project.yaml` (design_system)<br>3. `docs/architecture/module-standards.md` (§2.3 referências) |
| **STATE-MANAGEMENT** | P1 | 1. `package.json` (@tanstack/react-query, zustand)<br>2. `src/hooks/**` (listar hooks)<br>3. `docs/reference/STATE-MANAGEMENT.md` (se existir, cruzar) |
| **Operações (setup/deploy/test)** | P0 | 1. `package.json` (scripts)<br>2. `.env.example` (sem valores, só nomes)<br>3. `supabase/README.md`<br>4. `docs/architecture/build-deploy-gates.md`<br>5. `docs/engineering/DEPLOYMENT-GUIDE.md` |
| **ESPAIDER-INTEGRATION** | P1 | 1. `docs/architecture/ESPAIDER-INTEGRATION.md`<br>2. `configs/project.yaml` (integrations.espaider)<br>3. Código Espaider (grep `espaider`, `ESPAIDER`) |
| **ADR Registry sync** | P1 | 1. `docs/architecture/ADR-REGISTRY.md`<br>2. `docs/adr/ADR-001-RLS-STRATEGY.md`<br>3. `docs/adr/ADR-002-TOKEN-FALLBACK-CHAIN.md`<br>4. `docs/adr/ADR-004-FEATURE-FOLDERS.md`<br>5. `docs/adr/ADR-005-organization-architecture.md` |
| **Índice (docs/README)** | P0 | 1. `Get-ChildItem docs -Recurse` (árvore real)<br>2. `docs/README.md` (estado atual)<br>3. `docs/engineering/COMPOSER-DOCUMENTATION-PACK.md` |
| **VERSION-SNAPSHOT** | P0 | 1. `package.json`<br>2. `configs/project.yaml`<br>3. `supabase/migrations/` (count)<br>4. Git ref |
| **PRD-BROWFIELD-CAPABILITIES** | P0 | 1. `docs/reference/PROJECT-CURRENT-STATE.md`<br>2. `docs/stories/EPIC-INDEX.md`<br>3. `src/app/**/page.tsx`<br>4. `configs/project.yaml` |
| **OPERATIONS-REFERENCE** | P0 | 1. `package.json` (scripts)<br>2. `.env.example`<br>3. `supabase/README.md`<br>4. `docs/architecture/build-deploy-gates.md` |

---

## Estrutura de pastas AIOX (documentação)

| Pasta | Conteúdo |
|-------|----------|
| `docs/reference/` | PROJECT-CURRENT-STATE, VERSION-SNAPSHOT, API-DOCUMENTATION, SERVER-ACTIONS-GUIDE, STATE-MANAGEMENT, COMPONENTS-CATALOG, DATABASE-SCHEMA, v0.2.4-* |
| `docs/prd/` | PRD-BROWFIELD-CAPABILITIES, v0.2.4-EPIC-11-COMPLETE-FEATURE-GUIDE, technical-debt-assessment |
| `docs/engineering/` | COMPOSER-DOCUMENTATION-PACK, DOCUMENTATION-SOURCES, OPERATIONS-REFERENCE, DEPLOYMENT-GUIDE, OPERATIONAL-RUNBOOK |
| `docs/architecture/` | ADR-REGISTRY, module-standards, ESPAIDER-INTEGRATION, DATA-FLOW-DIAGRAMS, SECURITY-PATTERNS |
| `docs/adr/` | ADR-001, ADR-002, ADR-004, ADR-005 |
| `docs/guides/` | DEVELOPMENT-SETUP, TESTING-STRATEGY, CONTEXT-ENGINEERING-RULES, INTEGRATION-GUIDE, TROUBLESHOOTING-FAQ |
| `docs/_deprecated/` | roadmaps-and-plans/, audits-and-reports/, reports/ |

---

## Comandos de verificação (PowerShell)

```powershell
Test-Path docs/reference ; Test-Path docs/prd ; Test-Path docs/engineering
Get-ChildItem docs -Recurse -Filter "*.md" | Select-Object -ExpandProperty FullName
```

---

**Last Updated:** 2026-03-21
