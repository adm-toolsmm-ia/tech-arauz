# ESPAIDER-MODERNIZATION-006: Refactor Sync Orchestration to Use Repositories

**Epic:** EPIC-ESPAIDER-MODERNIZATION
**Phase:** B (Repository Pattern & DDD)
**Priority:** 🔴 CRITICAL (integrates all Phase A-B work)
**Effort:** 1.5-2 days
**Owner:** @dev (Dex)
**Status:** READY

---

## Goal

Refactor `espaider-sync.ts` and handlers to use repositories instead of direct database calls, bringing together validation (Phase A), schemas, and repository pattern (Phase B).

---

## Acceptance Criteria

- [ ] Remove all direct Supabase calls from sync orchestration
- [ ] Replace with repository method calls via RepositoryFactory
- [ ] Refactor mappers to accept validated Zod-typed data
- [ ] All sync operations flow correlation IDs through repositories
- [ ] Sync workflow: API call → validate (Zod) → map to entity → upsert via repository
- [ ] 95%+ test coverage on orchestration logic
- [ ] <300 LOC for main sync function (readability)
- [ ] Zero breaking changes to API endpoints
- [ ] Performance: sync time unchanged ±5%

---

## Technical Details

### Current Sync Flow (Before)

```
API Call → HTTP Client → Raw Data → Mapper → Direct DB upsert
```

**Problems:**
- No validation between API and mapper
- Mapper works with untyped data (any)
- Direct DB calls scattered across codebase
- Hard to test (real DB calls)
- Hard to change DB layer (tightly coupled)

### Target Sync Flow (After)

```
API Call → HTTP Client
  → Zod Validation (ExportarDadosResponseSchema)
  → Typed Data (z.infer<...>)
  → Mapper (converts to Domain Entity)
  → Repository.upsertMany()
  → Correlation ID logged throughout
```

**Benefits:**
- Early validation (catch API changes immediately)
- Type safety at every step
- Testable (mock repositories easily)
- Flexible DB layer (swap repositories without touching sync code)
- Observable (correlation IDs in all logs)

### Refactoring espaider-sync.ts

**Current (Before):**
```typescript
export async function syncEspaider(datasetId: string) {
  const apiClient = new ExportarDadosClient(config)
  const response = await apiClient.exportarDados({ datasetId })

  const projects = response.dados.map(mapEspaiderToProject)

  const { error } = await supabase
    .from('projects')
    .upsert(projects, { onConflict: 'id' })

  if (error) throw error
}
```

**Refactored (After):**
```typescript
export async function syncEspaider(datasetId: string, correlationId: string) {
  const apiClient = new ExportarDadosClient(config)
  const factory = new RepositoryFactory(supabase)
  const logger = getLogger(__filename)

  const span = logger.startSpan('syncEspaider', { datasetId, correlationId })

  try {
    // Step 1: Fetch from API (with validation)
    const response = await apiClient.exportarDados({ datasetId, correlationId })
    // validation happens automatically in client.ts

    // Step 2: Map to domain entity
    const projects = response.dados.map(record =>
      mapEspaiderToProject(record) // Now works with validated, typed data
    )

    // Step 3: Upsert via repository
    const projectRepo = factory.getRepository<Project>('projects')
    const upserted = await projectRepo.upsertMany(projects, correlationId)

    span.end({ count: upserted.length })
    return upserted
  } catch (error) {
    span.end({ error: true })
    if (error instanceof ValidationError) {
      // Handle validation errors specifically
      logger.error('API validation failed', { correlationId, error })
    }
    throw error
  }
}
```

### Handler Refactoring

**Before:**
```typescript
export async function POST(request: Request) {
  const { datasetId } = await request.json()

  try {
    await syncEspaider(datasetId)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

**After:**
```typescript
export async function POST(request: Request) {
  const { datasetId } = await request.json()
  const correlationId = request.headers.get('x-correlation-id') || generateId()

  try {
    const logger = getLogger(__filename)
    logger.info('Sync requested', { datasetId, correlationId })

    const result = await syncEspaider(datasetId, correlationId)

    return NextResponse.json({
      success: true,
      count: result.length,
      correlationId
    })
  } catch (error) {
    const logger = getLogger(__filename)

    if (error instanceof ValidationError) {
      logger.warn('Validation error', { correlationId, ...error.details })
      return NextResponse.json(
        { error: 'API validation failed', fields: error.getHumanReadableErrors() },
        { status: 422 }
      )
    }

    logger.error('Sync failed', { correlationId, error })
    return NextResponse.json(
      { error: 'Sync failed', correlationId },
      { status: 500 }
    )
  }
}
```

### Mapper Refactoring

**Before:**
```typescript
export function mapEspaiderToProject(record: any): Project {
  return {
    id: record.campos.find(c => c.nomeInterno === 'id')?.valor,
    nome_projeto: record.campos.find(c => c.nomeInterno === 'nomeProjeto')?.valor,
    // ... lots of dynamic lookups; error-prone
  }
}
```

**After:**
```typescript
// Mapper now receives validated, typed data from Zod schema
export function mapEspaiderToProject(
  record: z.infer<typeof RegistroEspaiderSchema>
): Project {
  // Safe to access campos; we know they're valid
  const nameField = record.campos.find(c => c.nomeInterno === 'nomeProjeto')

  return {
    id: record.nomeInterno, // Use unique key
    nome_projeto: nameField?.valor ?? 'Unknown',
    // Safe access; typed; fewer errors
  }
}
```

---

## Implementation Steps

1. **Update Handler (POST /api/sync/exportarDados)**
   - Extract correlationId from request header or generate
   - Pass correlationId to syncEspaider()
   - Return correlationId in response

2. **Refactor syncEspaider()**
   - Accept correlationId parameter
   - Create RepositoryFactory instance
   - Replace direct supabase calls with repo method calls
   - Wrap in try-catch for ValidationError handling
   - Log with span (correlation ID)

3. **Update Mappers**
   - Change input type from `any` to Zod-inferred type
   - Remove defensive null checks (validation guarantees structure)
   - Simplify logic

4. **Update Sync Handler**
   - Call refactored syncEspaider()
   - Handle ValidationError specially (422 response)
   - Return correlationId in response

5. **Test All Integration**
   - Mock repositories
   - Mock API client
   - Test happy path (full sync)
   - Test validation failure (API returns invalid response)
   - Test database error (repository throws)
   - Test correlation ID propagation

---

## Testing Strategy

### Unit Tests (sync orchestration)

```typescript
describe('syncEspaider()', () => {
  let apiClient: jest.Mocked<ExportarDadosClient>
  let repositoryFactory: jest.Mocked<RepositoryFactory>
  let projectRepo: jest.Mocked<IRepository<Project>>

  beforeEach(() => {
    apiClient = createMockApiClient()
    repositoryFactory = createMockRepositoryFactory()
    projectRepo = createMockRepository<Project>()
    repositoryFactory.getRepository.mockReturnValueOnce(projectRepo)
  })

  it('syncs projects from API to repository', async () => {
    const validResponse = {
      resultado: 'OK',
      dados: [ /* validated records */ ]
    }
    apiClient.exportarDados.mockResolvedValueOnce(validResponse)
    projectRepo.upsertMany.mockResolvedValueOnce([ /* upserted projects */ ])

    const result = await syncEspaider('projects', 'trace-123')

    expect(apiClient.exportarDados).toHaveBeenCalledWith({
      datasetId: 'projects',
      correlationId: 'trace-123'
    })
    expect(projectRepo.upsertMany).toHaveBeenCalled()
    expect(result).toHaveLength(/* expected count */)
  })

  it('handles ValidationError from API client', async () => {
    apiClient.exportarDados.mockRejectedValueOnce(
      new ValidationError('Invalid response', { ... })
    )

    await expect(syncEspaider('projects', 'trace-123')).rejects.toThrow(ValidationError)
  })

  it('propagates correlation ID through repositories', async () => {
    await syncEspaider('projects', 'trace-123')

    expect(projectRepo.upsertMany).toHaveBeenCalledWith(
      expect.any(Array),
      'trace-123' // Correlation ID passed through
    )
  })
})
```

### Integration Tests (Handler + Sync + Repository)

```typescript
describe('POST /api/sync/exportarDados', () => {
  it('syncs data end-to-end', async () => {
    mockEspaiderAPI({ resultado: 'OK', dados: [ /* valid records */ ] })

    const response = await request(app)
      .post('/api/sync/exportarDados')
      .set('x-correlation-id', 'trace-123')
      .send({ datasetId: 'projects' })

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      success: true,
      count: expect.any(Number),
      correlationId: 'trace-123'
    })

    // Verify data was actually inserted into test DB
    const { data } = await supabase.from('projects').select()
    expect(data).toBeDefined()
  })

  it('returns 422 on validation error', async () => {
    mockEspaiderAPI({ resultado: 'OK' }) // Invalid: missing dados

    const response = await request(app)
      .post('/api/sync/exportarDados')
      .send({ datasetId: 'projects' })

    expect(response.status).toBe(422)
    expect(response.body.fieldErrors).toBeDefined()
  })

  it('generates correlationId if not provided', async () => {
    mockEspaiderAPI({ resultado: 'OK', dados: [] })

    const response = await request(app)
      .post('/api/sync/exportarDados')
      .send({ datasetId: 'projects' })
      // No x-correlation-id header

    expect(response.body.correlationId).toBeDefined()
    expect(response.body.correlationId).toMatch(/^[a-z0-9-]+$/)
  })
})
```

---

## File List

**Modify:**
- [ ] `src/integrations/espaider/sync/espaider-sync.ts` (refactor for repositories)
- [ ] `src/integrations/espaider/sync/handlers.ts` (add correlationId, error handling)
- [ ] `src/integrations/espaider/mappers.ts` (update to use typed inputs)
- [ ] `src/integrations/espaider/__tests__/sync.test.ts` (update tests)
- [ ] `src/integrations/espaider/__tests__/handlers.test.ts` (update tests)

---

## Validation Checklist

```bash
npm run typecheck
npm run lint
npm run build
npm test -- src/integrations/espaider/__tests__/sync.test.ts
npm test -- src/integrations/espaider/__tests__/handlers.test.ts
npm test -- --coverage src/integrations/espaider/sync/
```

Expected results:
- ✅ Zero typecheck errors
- ✅ Zero eslint errors
- ✅ All tests pass
- ✅ Coverage ≥95% for sync orchestration
- ✅ Performance unchanged ±5%

---

## Commit Message

```
refactor: Use repositories in sync orchestration (Phase B integration)

- Refactor syncEspaider() to use RepositoryFactory
- Replace direct Supabase calls with repository methods
- Update mappers to accept validated Zod-typed data
- Add correlationId propagation through handler → sync → repositories
- Handle ValidationError specifically (422 response)

Integrates validation (Phase A) + repository pattern (Phase B).
Enables testability and future DB layer flexibility.
```

---

## References

- **Repositories:** ESPAIDER-MODERNIZATION-004, 005
- **Validation:** ESPAIDER-MODERNIZATION-001, 002
- **Next Story:** ESPAIDER-MODERNIZATION-007 (logging and observability)

---

**Story Status:** ✅ READY FOR ASSIGNMENT
**Assigned to:** @dev (Dex)
**Blocked by:** ESPAIDER-MODERNIZATION-004, ESPAIDER-MODERNIZATION-005
**Blocks:** ESPAIDER-MODERNIZATION-007
