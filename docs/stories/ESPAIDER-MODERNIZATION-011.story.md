# ESPAIDER-MODERNIZATION-011: Reintegrate TempoPermanencia Dataset

**Epic:** EPIC-ESPAIDER-MODERNIZATION
**Phase:** E (Dataset Recovery & Feature Flags)
**Priority:** 🟠 HIGH (restores lost functionality)
**Effort:** 0.75 days
**Owner:** @dev (Dex)
**Status:** READY

---

## Goal

Reintegrate TempoPermanencia dataset (currently disabled due to API endpoint changes) with updated mapping and validation.

---

## Acceptance Criteria

- [ ] Update TempoPermanencia mapper for current API endpoint
- [ ] Add Zod schema for TempoPermanencia records
- [ ] Create TempoPermanenciaRepository (using IRepository pattern)
- [ ] Add contract tests validating current API responses
- [ ] Integration tests confirm sync works end-to-end
- [ ] Enable TempoPermanencia in sync configuration
- [ ] Backward compatibility: no breaking changes

---

## Context

TempoPermanencia dataset was disabled in previous HOTFIX because:
- API endpoint `/exportarTemposPermanencia` changed structure
- Mapper expected old field names (nomeInterno, campos)
- No validation caught the mismatch → silent failures

## Solution

1. **Update API Endpoint Configuration**
   - Verify current endpoint URL (confirm with Espaider docs)
   - Update client configuration

2. **Create Zod Schema for TempoPermanencia**
   - Define validated structure
   - Update mapper to accept validated data

3. **Update Mapper**
   - Map validated records to TempoPermanencia entity
   - Handle new field names

4. **Implement Repository**
   - Create TempoPermanenciaRepository
   - Support upsert, query by employee, date range

5. **Add Tests**
   - Contract tests with real API responses
   - Integration tests for sync

---

## File List

**Create:**
- [ ] `src/integrations/espaider/schemas/tempo-permanencia.schema.ts` (NEW)
- [ ] `src/integrations/espaider/mappers/tempo-permanencia-mapper.ts` (NEW)
- [ ] `src/integrations/espaider/repositories/TempoPermanenciaRepository.ts` (NEW)
- [ ] `src/integrations/espaider/__tests__/__fixtures__/temposPermanencia-response.json` (NEW)
- [ ] `src/integrations/espaider/__tests__/mappers/tempo-permanencia-mapper.test.ts` (NEW)

**Modify:**
- [ ] `src/integrations/espaider/client.ts` (add temposPermanencia() method)
- [ ] `src/integrations/espaider/sync/espaider-sync.ts` (add TempoPermanencia sync)
- [ ] `src/integrations/espaider/repositories/repository-factory.ts` (register repo)

---

## Validation Checklist

```bash
npm run typecheck
npm run lint
npm test -- src/integrations/espaider/__tests__/mappers/tempo-permanencia-mapper.test.ts
# Manual: Trigger sync; verify TempoPermanencia records appear
```

Expected:
- ✅ Contract tests pass
- ✅ TempoPermanencia data syncs successfully

---

## Commit Message

```
feat: Reintegrate TempoPermanencia dataset

- Update TempoPermanencia schema for current API endpoint
- Create mapper and repository for TempoPermanencia
- Add contract tests with real API responses
- Enable TempoPermanencia in sync pipeline

Restores previously disabled dataset functionality.
```

---

**Story Status:** ✅ READY FOR ASSIGNMENT
**Assigned to:** @dev (Dex)
**Blocked by:** ESPAIDER-MODERNIZATION-001
**Blocks:** None (parallel work)
