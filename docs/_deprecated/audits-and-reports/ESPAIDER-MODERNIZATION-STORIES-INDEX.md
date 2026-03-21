# EPIC 15: Espaider Integration Modernization — Stories Index

**Framework:** AIOX Story Development Cycle (Padrão Sequencial)
**Total Stories:** 15 (divididas em 6 fases: A-F)
**Total Effort:** 19 developer-days
**Status:** ⏳ READY FOR PLANNING

---

## 📋 Quick Navigation

### Phase A: Validation & Type Safety (3-4 dias)
Implementar Zod schemas para validação runtime de API responses.

| Story | Title | Owner | Effort | File |
|-------|-------|-------|--------|------|
| **15.1** | Zod Schemas — API Validation | @dev | 1-2d | [15.1-zod-schemas-api-validation.story.md](./stories/15.1-zod-schemas-api-validation.story.md) |
| **15.2** | Validation Layer — HTTP Client | @dev | 1-2d | [15.2-validation-layer-http-client.story.md](./stories/15.2-validation-layer-http-client.story.md) |
| **15.3** | Contract Tests — API Specification | @qa | 1-2d | [15.3-contract-tests-api-specification.story.md](./stories/15.3-contract-tests-api-specification.story.md) |

**Deliverables:**
- Zod schemas (8+) em `src/integrations/espaider/schemas.ts`
- Validação integrada em `client.ts`
- Contract tests com 5+ fixtures reais da API
- 100% test coverage para schemas

---

### Phase B: Repository Pattern & DDD (4-5 dias)
Refatorar de monolítica para repository pattern.

| Story | Title | Owner | Effort | File |
|-------|-------|-------|--------|------|
| **15.4** | IRepository Interface — DDD | @architect | 1-2d | [15.4-irepository-interface-ddd.story.md](./stories/15.4-irepository-interface-ddd.story.md) |
| **15.5** | Project Repository — Implementation | @data-engineer | 2-3d | [15.5-project-repository-implementation.story.md](./stories/15.5-project-repository-implementation.story.md) |
| **15.6** | Refactor espaider-sync — Orchestrator | @dev | 3-4d | [15.6-refactor-espaider-sync-orchestrator.story.md](./stories/15.6-refactor-espaider-sync-orchestrator.story.md) |

**Deliverables:**
- `IRepository<T>` interface com 7 domain-specific implementations
- `ProjectRepository` com upsert, batch, query
- Refactoring de `espaider-sync.ts`: 2013 LOC → <600 LOC
- 90%+ test coverage

---

### Phase C: Logging & Observability (2-3 dias)
Implementar structured logging com correlation IDs.

| Story | Title | Owner | Effort | File |
|-------|-------|-------|--------|------|
| **15.7** | Structured Logger — Correlation IDs | @dev | 2-3d | [15.7-structured-logger-correlation-ids.story.md](./stories/15.7-structured-logger-correlation-ids.story.md) |
| **15.8** | Consolidate Logging — Single Source | @data-engineer | 1-2d | [15.8-consolidate-logging-single-source.story.md](./stories/15.8-consolidate-logging-single-source.story.md) |

**Deliverables:**
- Structured logger com typed fields
- Correlation IDs propagados em toda a chain
- Migration 073: consolidate `sync_logs` + `integration_log_entries`
- Single source of truth para logs

---

### Phase D: Modularity & Error Handling (2-3 dias)
Dividir mappers e classificar erros.

| Story | Title | Owner | Effort | File |
|-------|-------|-------|--------|------|
| **15.9** | Split Mappers — Per-Entity Files | @dev | 1-2d | [15.9-split-mappers-per-entity.story.md](./stories/15.9-split-mappers-per-entity.story.md) |
| **15.10** | Error Classification — HTTP vs Data | @architect | 1-2d | [15.10-error-classification-http-vs-data.story.md](./stories/15.10-error-classification-http-vs-data.story.md) |

**Deliverables:**
- 7 mapper files (ProjectMapper, DeliveryMapper, etc.)
- Error classification: HTTP errors (retryable) vs Data errors (non-retryable)
- Circuit breaker applica apenas a HTTP errors
- 95%+ test coverage

---

### Phase E: Dataset Recovery & Feature Flags (2-3 dias)
Reintegrar TempoPermanencia + HorasLancadas com feature flags.

| Story | Title | Owner | Effort | File |
|-------|-------|-------|--------|------|
| **15.11** | Reintegrate TempoPermanencia | @data-engineer | 1-2d | [15.11-reintegrate-tempo-permanencia-dataset.story.md](./stories/15.11-reintegrate-tempo-permanencia-dataset.story.md) |
| **15.12** | Reintegrate HorasLancadas | @data-engineer | 1-2d | [15.12-reintegrate-horas-lancadas-dataset.story.md](./stories/15.12-reintegrate-horas-lancadas-dataset.story.md) |
| **15.13** | Feature Flag UI — Dataset Control | @ux-design-expert | 1-2d | [15.13-feature-flag-ui-dataset-control.story.md](./stories/15.13-feature-flag-ui-dataset-control.story.md) |

**Deliverables:**
- TempoPermanencia + HorasLancadas schemas (Zod)
- Repositories para ambos datasets
- Feature flag UI em `/integracoes`
- Migrations 074-075 (if needed)

---

### Phase F: Resilience & Multi-Instance (1-2 dias)
Circuit breaker em Redis + jitter em backoff.

| Story | Title | Owner | Effort | File |
|-------|-------|-------|--------|------|
| **15.14** | Circuit Breaker Persistence — Redis | @dev | 1-2d | [15.14-circuit-breaker-persistence-redis.story.md](./stories/15.14-circuit-breaker-persistence-redis.story.md) |
| **15.15** | Exponential Backoff Jitter | @dev | 1-2d | [15.15-exponential-backoff-jitter.story.md](./stories/15.15-exponential-backoff-jitter.story.md) |

**Deliverables:**
- Circuit breaker state em Redis (com TTL)
- Fallback para in-memory se Redis indisponível
- Jitter em backoff: `delay × (0.5 + random())`
- Multi-instance safe

---

## 🔗 Dependency Graph

```
PHASE A (Validation)
├─ 15.1: Zod schemas
├─ 15.2: Validation layer (depends on 15.1)
└─ 15.3: Contract tests (depends on 15.1)
         ↓
PHASE B (Repository)
├─ 15.4: IRepository interface
├─ 15.5: ProjectRepository (depends on 15.4)
└─ 15.6: Refactor sync (depends on 15.4, 15.5)
         ↓
PHASE C (Logging)
├─ 15.7: Structured logger (depends on 15.6)
└─ 15.8: Consolidate logging (depends on 15.7)
         ↓
PHASE D (Modularity)
├─ 15.9: Split mappers (depends on 15.2)
└─ 15.10: Error classification (depends on 15.2)
         ↓
PHASE E (Datasets)
├─ 15.11: TempoPermanencia (depends on 15.1)
├─ 15.12: HorasLancadas (depends on 15.1)
└─ 15.13: Feature flag UI (depends on 15.11, 15.12)
         ↓
PHASE F (Resilience)
├─ 15.14: Circuit breaker Redis
└─ 15.15: Backoff jitter
```

**Critical Path:** A → B → C → D → E → F

---

## 👥 Team Assignment

| Agent | Stories | Total Effort |
|-------|---------|--------------|
| **@dev (Dex)** | 15.1, 15.2, 15.6, 15.7, 15.9, 15.14, 15.15 | 10-12 days |
| **@data-engineer (Dara)** | 15.5, 15.8, 15.11, 15.12 | 5-7 days |
| **@architect (Aria)** | 15.4, 15.10 | 2-4 days |
| **@ux-design-expert (Uma)** | 15.13 | 1-2 days |
| **@qa (Quinn)** | 15.3 | 1-2 days |

---

## 📝 Story Template Reference

Cada story segue o padrão AIOX:

```markdown
# Story X.Y: Título Descritivo

**EPIC:** 15 — Espaider Integration Modernization
**Story ID:** X.Y
**Status:** ⏳ READY FOR DEV
**Assignee:** @agent
**Priority:** 🔴 CRITICAL | 🟠 HIGH | 🟡 MEDIUM
**Effort:** N days
**Depends on:** Story X.Z (ou None)

---

## 🎯 Objetivo
[Descrição clara do objetivo]

---

## 📋 Critérios de Aceitação
- [ ] Item 1
- [ ] Item 2
...

---

## 🏗️ Arquitetura
[Detalhes técnicos, code examples]

---

## 📁 File List

**Criar:**
- path/file.ts

**Modificar:**
- path/file.ts

**Referência:**
- path/file.ts

---

## 🔗 Dependências

**Internas:**
- None

**Externas:**
- Package names

**Bloqueada por:**
- Story X.Z (if any)

**Bloqueia:**
- Story A.B (if any)

---

## 🧪 Testing Checklist
- [ ] Unit tests
- [ ] Integration tests
- [ ] Coverage >90%

**Run tests:**
```bash
npm run test
npm run typecheck
npm run lint
```

---

## ✅ Definição de Done

- [x] Acceptance criteria atendidos
- [x] Testes passando
- [x] npm run lint: ✅ PASS
- [x] npm run typecheck: ✅ PASS

**Commit Message:**
```
type: message (Story X.Y)

- Bullet point 1
- Bullet point 2

Resolves: EPIC-15 Phase X (Phase Name)
```
```

---

## 🚀 Execution Roadmap

### Week 1: Phase A + B Start
- **15.1-15.3:** Zod validation (3-4 days)
- **15.4-15.5:** Repository pattern start (parallel, 2-3 days)

### Week 2: Phase B Complete + C Start
- **15.6:** Refactor sync (3-4 days)
- **15.7:** Structured logging (2-3 days)

### Week 3: Phase C Complete + D
- **15.8:** Log consolidation (1-2 days)
- **15.9-15.10:** Mappers + error classification (2-3 days)

### Week 4: Phase E
- **15.11-15.13:** Dataset recovery + feature flags (2-3 days)

### Week 5: Phase F
- **15.14-15.15:** Resilience (1-2 days)
- **Testing & validation** (1-2 days)

---

## 📊 Success Metrics (Pre/Post)

| Métrica | Antes | Depois |
|---------|-------|--------|
| Type safety | 0% | 95%+ |
| Test coverage | 55% | 88%+ |
| Code modularity | 2013 LOC monolith | 7×<500 LOC modules |
| Observability | 2 tables | 1 source + correlation IDs |
| Datasets | 7 ativos | 9 ativos |
| Tech debt score | 5.8/10 | 8.0/10 |

---

## 📖 Supporting Documentation

- [ESPAIDER-TECHNICAL-DEBT-EXECUTIVE-REPORT.md](./ESPAIDER-TECHNICAL-DEBT-EXECUTIVE-REPORT.md) — Executive summary
- [docs/architecture/ESPAIDER-TECHNICAL-DEBT-ASSESSMENT.md](./architecture/ESPAIDER-TECHNICAL-DEBT-ASSESSMENT.md) — Full analysis (Phases 1-8)
- [docs/architecture/ESPAIDER-SYSTEM-ARCHITECTURE.md](./architecture/ESPAIDER-SYSTEM-ARCHITECTURE.md) — Current architecture
- [docs/architecture/ESPAIDER-DATABASE-SCHEMA.md](./architecture/ESPAIDER-DATABASE-SCHEMA.md) — Database design
- [docs/architecture/ESPAIDER-FRONTEND-SPEC.md](./architecture/ESPAIDER-FRONTEND-SPEC.md) — Frontend impact

---

**Created:** 2026-03-19
**Status:** ⏳ READY FOR PLANNING
**Framework:** AIOX Story Development Cycle v1.0
**Pattern:** Sequencial (15.1 → 15.2 → ... → 15.15)
