# ESPAIDER-MODERNIZATION-003: Comprehensive Contract Tests for Espaider API

**Epic:** EPIC-ESPAIDER-MODERNIZATION
**Phase:** A (Validation & Type Safety)
**Priority:** 🔴 CRITICAL (ensures schema correctness)
**Effort:** 1-1.5 days
**Owner:** @dev (Dex)
**Status:** READY

---

## Goal

Create comprehensive contract tests that validate Zod schemas against real Espaider API responses, ensuring type safety and early detection of API contract changes.

---

## Acceptance Criteria

- [ ] Create `src/integrations/espaider/__tests__/contract.test.ts` with 30+ test cases
- [ ] Validate 8+ real API responses (from Espaider API documentation/staging)
- [ ] Test both success and error scenarios (OK, ERROR, TIMEOUT, INVALID_DATASET)
- [ ] All fixtures stored in `__tests__/__fixtures__/` directory (5+ files)
- [ ] Test coverage: 100% of schema validation paths
- [ ] Zero tolerance for breaking changes (test fails if API response incompatible)
- [ ] Document where each fixture came from (API docs, staging API call, etc.)
- [ ] Integration with CI/CD: contract tests run on every commit

---

## Technical Details

### Test Structure

```
src/integrations/espaider/__tests__/
├── contract.test.ts (NEW - comprehensive contract tests)
├── __fixtures__/
│   ├── exportarDados-success.json          (scenario: projects dataset success)
│   ├── exportarDados-success-empty.json    (scenario: no records returned)
│   ├── exportarDados-error-invalid-date.json (scenario: API error - invalid date)
│   ├── exportarDados-error-unauthorized.json (scenario: API error - auth failed)
│   ├── exportarDados-nested-filhos.json    (scenario: complex nested structure)
│   ├── exportarDados-large-payload.json    (scenario: 1000+ records)
│   ├── exportarDados-special-chars.json    (scenario: Unicode, special chars)
│   └── exportarDados-missing-campos.json   (scenario: malformed response)
```

### Test Scenarios

1. **Success Cases (valid API responses)**
   - Normal sync (10+ records)
   - Empty result (0 records)
   - Large payload (1000+ records)
   - Nested structures (filhos, campos with complex types)
   - Special characters (Unicode, HTML entities)

2. **Error Cases (API returns error structure)**
   - Invalid date format
   - Unauthorized (invalid token)
   - Dataset not found
   - Malformed response (missing required fields)

3. **Edge Cases**
   - Null values in optional fields
   - Empty strings in required fields
   - Extra fields not in schema (should fail with .strict())
   - Type coercion (numeric strings in numeric fields)

### Fixture Format Example

**exportarDados-success.json:**
```json
{
  "resultado": "OK",
  "mensagem": "Sincronização realizada com sucesso",
  "dados": [
    {
      "nomeInterno": "PROJ_001",
      "campos": [
        { "nomeInterno": "nomeProjeto", "valor": "Projeto A", "tipo": "texto" },
        { "nomeInterno": "dataInicio", "valor": "2026-01-01", "tipo": "data" }
      ],
      "filhos": [
        { "url": "https://espaider.api/projects/PROJ_001/deliveries", "descricao": "Deliveries" }
      ]
    }
  ]
}
```

---

## Implementation Steps

1. **Collect Real API Responses**
   - Use Espaider API documentation (https://docs.espaider.com)
   - Call staging API with valid credentials (if available)
   - Document source of each fixture (URL, date retrieved, context)

2. **Create Fixture Files**
   - Store in `__tests__/__fixtures__/` directory
   - Name: `exportarDados-{scenario}.json`
   - Add comment at top of each file documenting its source and purpose

3. **Write Contract Tests**
   - Load each fixture file
   - Validate against ExportarDadosResponseSchema
   - Assert validation succeeds for valid responses
   - Assert validation fails for invalid responses with specific error messages

4. **Add Metadata**
   - Create `__tests__/__fixtures__/FIXTURES_MANIFEST.md` documenting each fixture
   - Include: source URL, date retrieved, scenario description, expected behavior

5. **CI/CD Integration**
   - Add contract tests to `test` script in package.json
   - Ensure tests run before build

---

## Test Implementation

**contract.test.ts:**

```typescript
import { ExportarDadosResponseSchema } from '../schemas'
import fs from 'fs'
import path from 'path'

describe('Espaider API Contract', () => {
  const fixturesDir = path.join(__dirname, '__fixtures__')
  const loadFixture = (filename: string) => {
    const content = fs.readFileSync(path.join(fixturesDir, filename), 'utf-8')
    return JSON.parse(content)
  }

  describe('Success Scenarios', () => {
    it('validates normal sync response (10+ records)', () => {
      const data = loadFixture('exportarDados-success.json')
      expect(() => ExportarDadosResponseSchema.parse(data)).not.toThrow()
    })

    it('validates empty result (0 records)', () => {
      const data = loadFixture('exportarDados-success-empty.json')
      expect(() => ExportarDadosResponseSchema.parse(data)).not.toThrow()
    })

    it('validates large payload (1000+ records)', () => {
      const data = loadFixture('exportarDados-large-payload.json')
      expect(() => ExportarDadosResponseSchema.parse(data)).not.toThrow()
      expect(data.dados).toHaveLength(1000)
    })

    it('validates nested structures with filhos', () => {
      const data = loadFixture('exportarDados-nested-filhos.json')
      expect(() => ExportarDadosResponseSchema.parse(data)).not.toThrow()
      expect(data.dados[0].filhos).toBeDefined()
    })

    it('validates special characters (Unicode, HTML entities)', () => {
      const data = loadFixture('exportarDados-special-chars.json')
      expect(() => ExportarDadosResponseSchema.parse(data)).not.toThrow()
    })
  })

  describe('Error Scenarios', () => {
    it('validates error response (invalid date)', () => {
      const data = loadFixture('exportarDados-error-invalid-date.json')
      expect(() => ExportarDadosResponseSchema.parse(data)).not.toThrow()
      expect(data.resultado).toBe('ERROR')
    })

    it('validates error response (unauthorized)', () => {
      const data = loadFixture('exportarDados-error-unauthorized.json')
      expect(() => ExportarDadosResponseSchema.parse(data)).not.toThrow()
      expect(data.resultado).toBe('ERROR')
    })
  })

  describe('Edge Cases & Malformed Responses', () => {
    it('rejects response missing required field (resultado)', () => {
      const invalid = { mensagem: '...', dados: [] }
      expect(() => ExportarDadosResponseSchema.parse(invalid)).toThrow()
    })

    it('rejects response with extra fields (strict mode)', () => {
      const data = loadFixture('exportarDados-success.json')
      const invalid = { ...data, extraField: 'not allowed' }
      expect(() => ExportarDadosResponseSchema.parse(invalid)).toThrow()
    })

    it('rejects malformed nested structure', () => {
      const data = loadFixture('exportarDados-missing-campos.json')
      expect(() => ExportarDadosResponseSchema.parse(data)).toThrow()
    })

    it('handles null values in optional fields', () => {
      const data = loadFixture('exportarDados-success.json')
      data.dados[0].filhos = null // filhos may be optional
      // Should either pass or fail consistently
      expect(() => ExportarDadosResponseSchema.parse(data)).not.toThrow()
    })

    it('rejects empty string in required field (nomeInterno)', () => {
      const data = loadFixture('exportarDados-success.json')
      data.dados[0].nomeInterno = ''
      expect(() => ExportarDadosResponseSchema.parse(data)).toThrow()
    })
  })

  describe('Contract Stability', () => {
    it('fails if API response structure changes unexpectedly', () => {
      // This test intentionally documents breaking changes
      // If Espaider API changes structure, this test fails → alerts developer
      const data = loadFixture('exportarDados-success.json')
      // If API adds required field, or changes field type, parse() fails
      expect(() => ExportarDadosResponseSchema.parse(data)).not.toThrow()
    })
  })
})
```

### Fixture Manifest

**FIXTURES_MANIFEST.md:**
```markdown
# Espaider API Fixture Manifest

## exportarDados-success.json
- **Source:** Espaider API docs (https://docs.espaider.com/exportarDados)
- **Date Retrieved:** 2026-03-20
- **Scenario:** Normal sync with 10+ records, nested filhos
- **Expected:** Validation passes; result is OK
- **Notes:** Anonymized project names; representative of production data

## exportarDados-success-empty.json
- **Source:** Staging API call (date filter with no records)
- **Date Retrieved:** 2026-03-20
- **Scenario:** Query returns zero records (empty dataset)
- **Expected:** Validation passes; dados array is empty

## exportarDados-error-invalid-date.json
- **Source:** Espaider API docs (error response example)
- **Date Retrieved:** 2026-03-20
- **Scenario:** API error due to invalid date format
- **Expected:** Validation passes; resultado is ERROR
```

---

## File List

**Create:**
- [ ] `src/integrations/espaider/__tests__/contract.test.ts` (NEW - ~200 LOC)
- [ ] `src/integrations/espaider/__tests__/__fixtures__/exportarDados-success.json` (NEW)
- [ ] `src/integrations/espaider/__tests__/__fixtures__/exportarDados-success-empty.json` (NEW)
- [ ] `src/integrations/espaider/__tests__/__fixtures__/exportarDados-error-invalid-date.json` (NEW)
- [ ] `src/integrations/espaider/__tests__/__fixtures__/exportarDados-error-unauthorized.json` (NEW)
- [ ] `src/integrations/espaider/__tests__/__fixtures__/exportarDados-nested-filhos.json` (NEW)
- [ ] `src/integrations/espaider/__tests__/__fixtures__/exportarDados-large-payload.json` (NEW)
- [ ] `src/integrations/espaider/__tests__/__fixtures__/exportarDados-special-chars.json` (NEW)
- [ ] `src/integrations/espaider/__tests__/__fixtures__/FIXTURES_MANIFEST.md` (NEW)

---

## Validation Checklist

```bash
npm test -- src/integrations/espaider/__tests__/contract.test.ts
npm test -- --coverage src/integrations/espaider/__tests__/contract.test.ts
```

Expected results:
- ✅ All 30+ tests pass
- ✅ 100% coverage of schema validation paths
- ✅ Zero new eslint/typecheck errors

---

## Commit Message

```
test: Add comprehensive contract tests for Espaider API

- Create 30+ contract tests for all schema validation paths
- Add 8+ fixture files covering success, error, and edge cases
- Add FIXTURES_MANIFEST.md documenting fixture sources
- Test both valid and invalid API responses
- Ensure zero tolerance for API contract changes

Provides early warning if Espaider API structure changes.
100% schema validation coverage.
```

---

## References

- **Schemas:** ESPAIDER-MODERNIZATION-001
- **Validation Layer:** ESPAIDER-MODERNIZATION-002
- **Espaider API Docs:** https://docs.espaider.com
- **Jest Testing Patterns:** https://jestjs.io/docs/testing-frameworks

---

**Story Status:** ✅ READY FOR ASSIGNMENT
**Assigned to:** @dev (Dex)
**Blocked by:** ESPAIDER-MODERNIZATION-001, ESPAIDER-MODERNIZATION-002
**Blocks:** ESPAIDER-MODERNIZATION-004 (Phase B starts)
