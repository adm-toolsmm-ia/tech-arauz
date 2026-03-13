# Story 7-A-2: Query Performance Baseline

**Story ID:** 7-A-2
**Epic:** EPIC 7-A | **Type:** Database Performance
**Assignee:** @data-engineer (Dara) | **Effort:** 3-5.5h
**Sprint:** Week 2 (2026-03-15 to 2026-03-22)
**Status:** Ready for Dev

---

## User Story

As a database architect,
I want to establish query performance baselines and SLA targets,
So we can detect regressions and optimize continuously.

---

## Acceptance Criteria

- [x] EXPLAIN ANALYZE on 20+ top queries (from query logs)
- [x] Performance baseline report created
- [x] SLA targets documented (95th percentile <100ms)
- [x] Regression detection playbook written
- [x] Baseline integrated into CI/CD monitoring

---

## Subtasks

### 1. Extract Top Queries from Logs
- [ ] Query pg_stat_statements for top 20 queries by execution time
- [ ] Document query text, call count, mean/max times
- [ ] Identify slow queries (>100ms)

### 2. Run EXPLAIN ANALYZE
- [ ] Execute EXPLAIN ANALYZE on each top query
- [ ] Capture execution plans
- [ ] Note query cost and actual execution time
- [ ] Compare to post-index performance (from Story 7-A-1)

### 3. Create Baseline Report
- [ ] Document in `docs/performance/baseline.md`
- [ ] Include before/after EXPLAIN output
- [ ] Calculate % improvement from indexes
- [ ] Establish SLA targets (95th percentile <100ms)

### 4. Setup Monitoring
- [ ] Create continuous performance tracking query
- [ ] Document in Supabase logs/monitoring
- [ ] Setup alert if queries exceed SLA

---

## Test Strategy

- Run same 20 queries with indexes active
- Verify cost reduced by ≥20%
- Confirm no regressions

---

**Status:** Ready for Development
**Created:** 2026-03-08

*AIOX Story Development Cycle — EPIC 7-A Track A*
