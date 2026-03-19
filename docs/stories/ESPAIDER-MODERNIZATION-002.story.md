# ESPAIDER-MODERNIZATION-002: Add Validation Layer to HTTP Client

**Epic:** EPIC-ESPAIDER-MODERNIZATION
**Phase:** A (Validation & Type Safety)
**Priority:** 🔴 CRITICAL (required by Phase B)
**Effort:** 1-1.5 days
**Owner:** @dev (Dex)
**Status:** READY

---

## Goal

Integrate Zod validation into the Espaider HTTP client to ensure all API responses are validated at parse time before processing.

---

## Acceptance Criteria

- [ ] Update `exportarDados()` method in client.ts to validate responses
- [ ] Implement validation error handling with custom `ValidationError` class
- [ ] All validation failures logged with correlation ID (Phase C integration)
- [ ] Validation middleware catches parse errors and returns 422 Unprocessable Entity
- [ ] Zero breaking changes to client.ts API (backward compatible)
- [ ] 95%+ test coverage for validation paths (success + error cases)
- [ ] Performance: validation adds <5ms overhead to API calls
- [ ] Documentation: update handler JSDoc comments to note validation behavior

---

## Technical Details

### Current State

**client.ts (current - no validation):**
```typescript
async exportarDados(request: ExportarDadosRequest): Promise<ExportarDadosResponse> {
  const response = await this.http.post('/exportarDados', request)
  return response.data // Direct return; no validation
}
```

**Problem:** If API response structure changes, client silently uses malformed data → mappers fail → sync fails → support escalation.

### Target State

**client.ts (with validation):**
```typescript
async exportarDados(request: ExportarDadosRequest): Promise<ExportarDadosResponse> {
  const response = await this.http.post('/exportarDados', request)

  try {
    const validated = ExportarDadosResponseSchema.parse(response.data)
    return validated
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationError = new ValidationError(
        'Espaider API response validation failed',
        {
          datasetId: request.datasetId,
          errors: error.errors,
          receivedData: response.data
        }
      )
      logger.error(validationError, { correlationId: request.correlationId })
      throw validationError
    }
    throw error
  }
}
```

### Validation Error Class

**Create `src/integrations/espaider/validation-error.ts`:**
```typescript
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly details: {
      datasetId: string
      errors: z.ZodIssue[]
      receivedData: unknown
    }
  ) {
    super(message)
    this.name = 'ValidationError'
  }

  getHumanReadableErrors(): string[] {
    return this.details.errors.map(
      (err) => `${err.path.join('.')}: ${err.message}`
    )
  }
}
```

### Integration Points

1. **handlers.ts**
   - Catch ValidationError and return 422 with structured error response
   - Include `fieldErrors` in response for client to display

2. **logging (Phase C)**
   - Log validation errors with correlation ID
   - Include `datasetId` and field error paths for debugging

3. **error-remediation (Phase D)**
   - Add remediation step: "API response structure changed; check Espaider docs"

---

## Implementation Steps

1. **Create validation-error.ts**
   - Define ValidationError class with `details` property
   - Add `getHumanReadableErrors()` method for UI display

2. **Update client.ts exportarDados()**
   - Import schemas and ValidationError
   - Wrap response parsing with try-catch
   - Log errors with correlation ID (if available)

3. **Update handlers.ts**
   - Import ValidationError
   - Add catch block for ValidationError → return 422
   - Structure error response: `{ fieldErrors: [...], message: '...' }`

4. **Update error handling middleware (if exists)**
   - Add ValidationError handler to global error middleware
   - Convert to 422 HTTP status with structured response

5. **Create integration tests**
   - Mock API responses that fail validation
   - Verify ValidationError is thrown
   - Verify error is caught in handler → 422 response

---

## Testing Strategy

### Unit Tests (client.test.ts)

```typescript
describe('ExportarDadosClient.exportarDados()', () => {
  it('returns validated response on success', async () => {
    const validResponse = { resultado: 'OK', mensagem: '...', dados: [...] }
    httpMock.post.mockResolvedValueOnce({ data: validResponse })

    const result = await client.exportarDados(validRequest)
    expect(result).toEqual(validResponse)
  })

  it('throws ValidationError on invalid response', async () => {
    const invalidResponse = { resultado: 'OK' } // missing fields
    httpMock.post.mockResolvedValueOnce({ data: invalidResponse })

    await expect(client.exportarDados(validRequest)).rejects.toThrow(ValidationError)
  })

  it('logs validation error with correlation ID', async () => {
    const invalidResponse = { resultado: 'OK' }
    httpMock.post.mockResolvedValueOnce({ data: invalidResponse })
    const requestWithCorrelation = { ...validRequest, correlationId: 'trace-123' }

    try {
      await client.exportarDados(requestWithCorrelation)
    } catch (e) {
      // Expected
    }

    expect(logger.error).toHaveBeenCalledWith(
      expect.any(ValidationError),
      expect.objectContaining({ correlationId: 'trace-123' })
    )
  })

  it('includes human-readable errors in ValidationError', async () => {
    const invalidResponse = { resultado: 'OK' }
    httpMock.post.mockResolvedValueOnce({ data: invalidResponse })

    try {
      await client.exportarDados(validRequest)
    } catch (error) {
      expect((error as ValidationError).getHumanReadableErrors()).toEqual([
        'mensagem: Required',
        'dados: Required'
      ])
    }
  })

  it('adds <5ms overhead on valid responses', async () => {
    const validResponse = { resultado: 'OK', mensagem: '...', dados: [...] }
    httpMock.post.mockResolvedValueOnce({ data: validResponse })

    const start = performance.now()
    await client.exportarDados(validRequest)
    const duration = performance.now() - start

    expect(duration).toBeLessThan(5) // 5ms overhead acceptable
  })
})
```

### Integration Tests (handlers.test.ts)

```typescript
describe('POST /api/sync/exportarDados', () => {
  it('returns 200 on valid API response', async () => {
    mockEspaiderAPI({ resultado: 'OK', mensagem: '...', dados: [...] })

    const response = await request(app)
      .post('/api/sync/exportarDados')
      .send(validRequest)

    expect(response.status).toBe(200)
  })

  it('returns 422 on API response validation failure', async () => {
    mockEspaiderAPI({ resultado: 'OK' }) // Invalid: missing fields

    const response = await request(app)
      .post('/api/sync/exportarDados')
      .send(validRequest)

    expect(response.status).toBe(422)
    expect(response.body).toMatchObject({
      error: 'Unprocessable Entity',
      fieldErrors: expect.any(Array)
    })
  })

  it('includes field error details in 422 response', async () => {
    mockEspaiderAPI({ resultado: 'OK' })

    const response = await request(app)
      .post('/api/sync/exportarDados')
      .send(validRequest)

    expect(response.body.fieldErrors).toContain(
      expect.objectContaining({ path: 'mensagem' })
    )
  })
})
```

---

## File List

**Create:**
- [ ] `src/integrations/espaider/validation-error.ts` (NEW - ~40 LOC)
- [ ] `src/integrations/espaider/__tests__/validation-error.test.ts` (NEW - ~40 LOC)

**Modify:**
- [ ] `src/integrations/espaider/client.ts` (add validation in exportarDados)
- [ ] `src/integrations/espaider/handlers.ts` (catch ValidationError → 422)
- [ ] `src/integrations/espaider/__tests__/client.test.ts` (add validation tests)
- [ ] `src/integrations/espaider/__tests__/handlers.test.ts` (add integration tests)
- [ ] `src/middleware/error-handler.ts` (add ValidationError handler if exists)

---

## Validation Checklist

```bash
npm run typecheck
npm run lint
npm run build
npm test -- src/integrations/espaider/__tests__/client.test.ts
npm test -- src/integrations/espaider/__tests__/handlers.test.ts
npm test -- --coverage src/integrations/espaider/
```

Expected results:
- ✅ Zero typecheck errors
- ✅ Zero eslint errors
- ✅ All tests pass
- ✅ Coverage ≥95% for client.ts validation paths

---

## Commit Message

```
feat: Add validation layer to Espaider HTTP client

- Create ValidationError class for structured error handling
- Validate all API responses with Zod schemas at parse time
- Log validation failures with correlation ID and field errors
- Return 422 Unprocessable Entity for validation failures
- Add integration tests for validation error handling

Prevents silent failures when API contract changes. <5ms overhead.
```

---

## References

- **Previous Story:** ESPAIDER-MODERNIZATION-001 (schemas)
- **Next Story:** ESPAIDER-MODERNIZATION-003 (contract tests)
- **Error Handling Pattern:** `docs/guides/error-handling.md`
- **Zod Error Details:** https://zod.dev/ERROR_HANDLING

---

**Story Status:** ✅ READY FOR ASSIGNMENT
**Assigned to:** @dev (Dex)
**Blocked by:** ESPAIDER-MODERNIZATION-001
**Blocks:** ESPAIDER-MODERNIZATION-003
