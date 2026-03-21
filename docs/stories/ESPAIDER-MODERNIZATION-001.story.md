# ESPAIDER-MODERNIZATION-001: Create Zod Schemas for API Validation

**Epic:** EPIC-ESPAIDER-MODERNIZATION
**Phase:** A (Validation & Type Safety)
**Priority:** 🔴 CRITICAL (blocks Phase B)
**Effort:** 1-2 days
**Owner:** @dev (Dex)
**Status:** READY

---

## Goal

Create Zod schemas for all Espaider API request/response validation, enabling runtime type safety and eliminating silent failures due to API contract changes.

---

## Acceptance Criteria

- [ ] Create `src/integrations/espaider/schemas.ts` with 8 Zod schemas
  - ExportarDadosRequest
  - ExportarDadosResponse
  - RegistroEspaider
  - CampoEspaider
  - URLFilho
  - DatasetConfig
  - SyncOperation
  - ErrorResponse
- [ ] All schemas include `.strict()` validation (no extra fields permitted)
- [ ] Contract tests validate 5+ real API responses (stored in `__fixtures__/`)
- [ ] Zero new eslint errors, zero typecheck errors, zero build errors
- [ ] 90%+ test coverage for schemas + validation in mappers
- [ ] Type exports work correctly in client.ts and handlers
- [ ] Documentation comments explain each schema field

---

## Technical Details

### Zod Schemas to Create

**ExportarDadosRequest Schema:**
```typescript
// Request to Espaider API exportarDados endpoint
// Includes: datasetId, filterDate, correlationId
// Must include all required fields per API documentation
```

**ExportarDadosResponse Schema:**
```typescript
// Response from Espaider API with registros array
// Includes: resultado (OK | ERROR), mensagem, dados (RegistroEspaider[])
```

**RegistroEspaider Schema:**
```typescript
// Single record from Espaider API
// Includes: campos (CampoEspaider[]), filhos (URLFilho[])
// Supports nested validation for complex structures
```

**CampoEspaider Schema:**
```typescript
// Field within a record
// Includes: nomeInterno, valor, tipo
```

**URLFilho Schema:**
```typescript
// Child URL reference (for nested data)
// Includes: url, descricao
```

**DatasetConfig Schema:**
```typescript
// Configuration for each dataset
// Includes: datasetId, name, enabled, retryPolicy
```

**SyncOperation Schema:**
```typescript
// Represents a sync operation (used in Phase C logging)
// Includes: operationId, datasetId, recordCount, duration, status
```

**ErrorResponse Schema:**
```typescript
// Error structure from Espaider API
// Includes: code, message, timestamp
```

### File Structure

```
src/integrations/espaider/
├── schemas.ts (NEW — all Zod schemas)
├── types.ts (export type inference from schemas)
├── client.ts (use schemas in HTTP client)
├── handlers.ts (use schemas in request handlers)
└── __tests__/
    ├── schemas.test.ts (NEW)
    ├── contract.test.ts (NEW)
    └── fixtures/
        ├── exportarDados-response-1.json (sample API response)
        ├── exportarDados-response-2.json
        └── ... (5+ real responses from Espaider API docs)
```

### Implementation Steps

1. **Create schemas.ts**
   - Import Zod: `import { z } from 'zod'`
   - Define all 8 schemas with .strict() and descriptive comments
   - Export type inferences: `export type ExportarDadosRequest = z.infer<typeof ExportarDadosRequestSchema>`

2. **Create contract tests (contract.test.ts)**
   - Load 5+ real API responses from `__fixtures__/`
   - Validate each response against ExportarDadosResponse schema
   - Assert validation succeeds (no exceptions)
   - Assert invalid data is rejected (e.g., missing required fields)

3. **Update types.ts**
   - Replace manual type definitions with Zod-inferred types
   - Ensure backward compatibility (no breaking changes to exports)

4. **Update client.ts**
   - Import schemas from schemas.ts
   - Add validation to `exportarDados()` method:
     ```typescript
     const validated = ExportarDadosResponseSchema.parse(response.data)
     // Handle parse errors with try-catch → convert to custom error
     ```

5. **Update handlers**
   - Validate incoming requests at handler boundary
   - Return 400 Bad Request for validation failures with specific field errors

6. **Update mappers.ts**
   - Use validated types from schemas
   - Remove any manual `as` type casts (rely on schema validation)

---

## Testing Strategy

### Unit Tests (schemas.test.ts)
```typescript
describe('ExportarDadosResponseSchema', () => {
  it('validates valid API response', () => {
    const valid = { resultado: 'OK', mensagem: '...', dados: [...] }
    expect(() => ExportarDadosResponseSchema.parse(valid)).not.toThrow()
  })

  it('rejects response with missing required field', () => {
    const invalid = { resultado: 'OK' } // missing mensagem, dados
    expect(() => ExportarDadosResponseSchema.parse(invalid)).toThrow()
  })

  it('rejects response with extra fields when .strict()', () => {
    const invalid = { ..., extraField: 'not allowed' }
    expect(() => ExportarDadosResponseSchema.parse(invalid)).toThrow()
  })
})
```

### Contract Tests (contract.test.ts)
```typescript
describe('Espaider API Contract', () => {
  const fixtures = [
    'exportarDados-response-1.json',
    'exportarDados-response-2.json',
    // ... 5+ fixtures
  ]

  fixtures.forEach(fixture => {
    it(`validates ${fixture}`, () => {
      const data = JSON.parse(fs.readFileSync(`__fixtures__/${fixture}`))
      expect(() => ExportarDadosResponseSchema.parse(data)).not.toThrow()
    })
  })
})
```

### Integration Test (handlers.test.ts)
```typescript
describe('POST /api/sync/exportarDados', () => {
  it('validates request and calls client', async () => {
    const response = await request(app)
      .post('/api/sync/exportarDados')
      .send({ datasetId: 'projects', filterDate: '2026-03-20' })

    expect(response.status).toBe(200)
  })

  it('returns 400 for invalid request', async () => {
    const response = await request(app)
      .post('/api/sync/exportarDados')
      .send({ /* missing required fields */ })

    expect(response.status).toBe(400)
    expect(response.body.errors).toBeDefined()
  })
})
```

---

## File List

**Create:**
- [ ] `src/integrations/espaider/schemas.ts` (NEW - ~200 LOC)
- [ ] `src/integrations/espaider/__tests__/schemas.test.ts` (NEW - ~150 LOC)
- [ ] `src/integrations/espaider/__tests__/contract.test.ts` (NEW - ~80 LOC)
- [ ] `src/integrations/espaider/__tests__/__fixtures__/exportarDados-response-1.json` (NEW)
- [ ] `src/integrations/espaider/__tests__/__fixtures__/exportarDados-response-2.json` (NEW)
- [ ] Additional 3+ fixture files (5+ total)

**Modify:**
- [ ] `src/integrations/espaider/types.ts` (replace manual types with Zod inferences)
- [ ] `src/integrations/espaider/client.ts` (add validation in exportarDados())
- [ ] `src/integrations/espaider/handlers.ts` (add validation at request boundary)
- [ ] `src/integrations/espaider/mappers.ts` (remove type casts; use validated types)

---

## Validation Checklist

Before marking complete, run:

```bash
# Type checking
npm run typecheck
# Linting
npm run lint
# Build
npm run build
# Tests
npm test -- src/integrations/espaider/__tests__/schemas.test.ts
npm test -- src/integrations/espaider/__tests__/contract.test.ts
# Coverage
npm test -- --coverage src/integrations/espaider/
```

Expected results:
- ✅ Zero typecheck errors
- ✅ Zero eslint errors
- ✅ Zero build errors
- ✅ All tests pass
- ✅ Coverage ≥90% for schemas.ts and contract tests

---

## Commit Message

```
feat: Add Zod validation schemas for Espaider API contracts

- Create 8 Zod schemas for all API request/response types
- Add contract tests validating 5+ real API responses
- Export TypeScript types inferred from schemas
- Update client.ts to validate responses at parse time
- Update handlers to validate requests at boundary

This enables runtime type safety and eliminates silent failures
when API contract changes. Zero breaking changes to existing code.
```

---

## References

- **Zod Docs:** https://zod.dev
- **API Contract:** `docs/architecture/ESPAIDER-INTEGRATION.md#api-endpoints`
- **Next Story:** ESPAIDER-MODERNIZATION-002 (use schemas in handlers)
- **Technical Debt Assessment:** Section 8.2 (Type Safety improvements)

---

**Story Status:** ✅ READY FOR ASSIGNMENT
**Assigned to:** @dev (Dex)
**Blocked by:** None
**Blocks:** ESPAIDER-MODERNIZATION-002, ESPAIDER-MODERNIZATION-003
