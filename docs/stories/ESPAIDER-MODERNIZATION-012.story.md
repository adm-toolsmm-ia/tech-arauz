# ESPAIDER-MODERNIZATION-012: Reintegrate HorasLancadas Dataset

**Epic:** EPIC-ESPAIDER-MODERNIZATION
**Phase:** E (Dataset Recovery & Feature Flags)
**Priority:** 🟠 HIGH (restores lost functionality)
**Effort:** 0.75 days
**Owner:** @dev (Dex)
**Status:** READY

---

## Goal

Reintegrate HorasLancadas dataset (currently disabled due to API endpoint changes) with updated mapping and validation.

---

## Acceptance Criteria

- [ ] Update HorasLancadas mapper for current API endpoint
- [ ] Add Zod schema for HorasLancadas records
- [ ] Create HorasLancadasRepository (using IRepository pattern)
- [ ] Add contract tests validating current API responses
- [ ] Integration tests confirm sync works end-to-end
- [ ] Enable HorasLancadas in sync configuration
- [ ] Backward compatibility: no breaking changes

---

## Context

HorasLancadas dataset was disabled in previous HOTFIX because:
- API endpoint `/exportarHorasLancadas` changed structure
- Mapper expected old field names
- No validation caught the mismatch → silent failures

## Solution

1. **Update API Endpoint Configuration**
   - Verify current endpoint URL
   - Update client configuration

2. **Create Zod Schema for HorasLancadas**
   - Define validated structure
   - Update mapper to accept validated data

3. **Update Mapper**
   - Map validated records to HorasLancadas entity
   - Handle new field names

4. **Implement Repository**
   - Create HorasLancadasRepository
   - Support upsert, query by employee, project, date range

5. **Add Tests**
   - Contract tests with real API responses
   - Integration tests for sync

---

## File List

**Create:**
- [ ] `src/integrations/espaider/schemas/horas-lancadas.schema.ts` (NEW)
- [ ] `src/integrations/espaider/mappers/horas-lancadas-mapper.ts` (NEW)
- [ ] `src/integrations/espaider/repositories/HorasLancadasRepository.ts` (NEW)
- [ ] `src/integrations/espaider/__tests__/__fixtures__/horasLancadas-response.json` (NEW)
- [ ] `src/integrations/espaider/__tests__/mappers/horas-lancadas-mapper.test.ts` (NEW)

**Modify:**
- [ ] `src/integrations/espaider/client.ts` (add horasLancadas() method)
- [ ] `src/integrations/espaider/sync/espaider-sync.ts` (add HorasLancadas sync)
- [ ] `src/integrations/espaider/repositories/repository-factory.ts` (register repo)

---

## Validation Checklist

```bash
npm run typecheck
npm run lint
npm test -- src/integrations/espaider/__tests__/mappers/horas-lancadas-mapper.test.ts
# Manual: Trigger sync; verify HorasLancadas records appear
```

Expected:
- ✅ Contract tests pass
- ✅ HorasLancadas data syncs successfully

---

## Commit Message

```
feat: Reintegrate HorasLancadas dataset

- Update HorasLancadas schema for current API endpoint
- Create mapper and repository for HorasLancadas
- Add contract tests with real API responses
- Enable HorasLancadas in sync pipeline

Restores previously disabled dataset functionality.
```

---

**Story Status:** ✅ READY FOR ASSIGNMENT
**Assigned to:** @dev (Dex)
**Blocked by:** ESPAIDER-MODERNIZATION-001
**Blocks:** None (parallel work)
