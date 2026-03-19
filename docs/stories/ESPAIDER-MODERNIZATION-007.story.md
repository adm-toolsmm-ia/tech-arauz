# ESPAIDER-MODERNIZATION-007: Implement Structured Logger with Correlation IDs

**Epic:** EPIC-ESPAIDER-MODERNIZATION
**Phase:** C (Logging & Observability)
**Priority:** 🔴 CRITICAL (enables observability for all Phase D-F work)
**Effort:** 1-1.5 days
**Owner:** @dev (Dex)
**Status:** READY

---

## Goal

Create structured logger utility with correlation ID support to enable request tracing across the entire sync pipeline.

---

## Acceptance Criteria

- [ ] Create `src/lib/structured-logger.ts` with correlation ID support
- [ ] Logger methods: debug, info, warn, error (structured format)
- [ ] Correlation IDs propagate through all operations
- [ ] Log output format: JSON (for parsing) + human-readable (for console)
- [ ] Integration with Phase C table (sync_log_entries) for persistence
- [ ] 90%+ test coverage
- [ ] Zero performance regression (logging <1ms overhead per operation)
- [ ] Support for nested spans (operation → sub-operation tracing)

---

## Technical Details

### Structured Logger Interface

```typescript
export interface LogContext {
  correlationId: string
  traceId?: string
  spanId?: string
  userId?: string
  tenantId?: string
}

export interface LogEntry {
  timestamp: Date
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  context: LogContext
  metadata: Record<string, any>
  spanDuration?: number // milliseconds
}

export class StructuredLogger {
  constructor(
    private context: LogContext,
    private transport: LogTransport // writes to database, console, etc.
  ) {}

  debug(message: string, metadata?: Record<string, any>): void
  info(message: string, metadata?: Record<string, any>): void
  warn(message: string, metadata?: Record<string, any>): void
  error(message: string | Error, metadata?: Record<string, any>): void

  startSpan(name: string, metadata?: Record<string, any>): LogSpan
}

export interface LogSpan {
  end(metadata?: Record<string, any>): void
}
```

### Usage Example

```typescript
export async function syncEspaider(datasetId: string, correlationId: string) {
  const logger = getLogger(__filename, { correlationId, datasetId })

  const span = logger.startSpan('syncEspaider')

  try {
    logger.info('Starting sync', { dataset: datasetId })

    // API call
    const apiSpan = logger.startSpan('api.exportarDados')
    const response = await apiClient.exportarDados(...)
    apiSpan.end({ statusCode: 200, recordCount: response.dados.length })

    // Mapping
    const mapSpan = logger.startSpan('mapping')
    const entities = mapData(response.dados)
    mapSpan.end({ entityCount: entities.length })

    // Database upsert
    const dbSpan = logger.startSpan('db.upsert')
    const upserted = await repository.upsertMany(entities, correlationId)
    dbSpan.end({ insertCount: upserted.length })

    logger.info('Sync completed', { recordCount: upserted.length })
    span.end({ success: true, duration: totalMs })

    return upserted
  } catch (error) {
    logger.error('Sync failed', { error: error.message })
    span.end({ success: false, error: error.message })
    throw error
  }
}
```

### Log Output Format

**Console (human-readable):**
```
[2026-03-20 14:30:45.123] INFO [correlationId=trace-123] Starting sync dataset=projects
[2026-03-20 14:30:45.234]   → API call exportarDados [45ms] statusCode=200 recordCount=52
[2026-03-20 14:30:45.250]   → Mapping [16ms] entityCount=52
[2026-03-20 14:30:45.380]   → Database upsert [130ms] insertCount=52
[2026-03-20 14:30:45.381] INFO [correlationId=trace-123] Sync completed recordCount=52
```

**Database (JSON):**
```json
{
  "id": "log-abc123",
  "timestamp": "2026-03-20T14:30:45Z",
  "correlationId": "trace-123",
  "level": "info",
  "message": "Starting sync",
  "metadata": { "dataset": "projects" },
  "category": "sync",
  "parent_span_id": null
}
```

---

## Implementation Steps

1. **Create StructuredLogger class**
   - Constructor accepts context (correlationId, userId, tenantId, etc.)
   - Methods: debug, info, warn, error
   - startSpan() returns LogSpan with end() method

2. **Implement LogTransport interface**
   - Console transport (development)
   - Database transport (production - writes to sync_log_entries table)
   - Support multiple transports (compose pattern)

3. **Create getLogger() factory**
   - Singleton per module/context
   - Injects context (correlationId) automatically
   - Example: `const logger = getLogger(__filename, { correlationId })`

4. **Integrate with Sync Pipeline**
   - Update syncEspaider() to use logger
   - Update repositories to accept logger (or use thread-local context)
   - Update handlers to generate/extract correlationId

5. **Test Logger Output**
   - Mock transport
   - Verify log format
   - Verify correlation ID propagation
   - Test span duration calculation

---

## File List

**Create:**
- [ ] `src/lib/structured-logger.ts` (NEW - ~150 LOC)
- [ ] `src/lib/log-transport.ts` (NEW - ~100 LOC)
- [ ] `src/integrations/espaider/logger.ts` (NEW - ~50 LOC, Espaider-specific config)
- [ ] `src/lib/__tests__/structured-logger.test.ts` (NEW - ~150 LOC)

**Modify:**
- [ ] `src/integrations/espaider/sync/espaider-sync.ts` (add logger calls)
- [ ] `src/integrations/espaider/repositories/*.ts` (accept logger context)
- [ ] `src/integrations/espaider/sync/handlers.ts` (generate/extract correlationId)

---

## Validation Checklist

```bash
npm run typecheck
npm run lint
npm run build
npm test -- src/lib/__tests__/structured-logger.test.ts
npm test -- --coverage src/lib/structured-logger.ts
```

Expected results:
- ✅ All tests pass
- ✅ Coverage ≥90%
- ✅ Logging overhead <1ms per operation

---

## Commit Message

```
feat: Implement structured logger with correlation IDs

- Create StructuredLogger with correlation ID support
- Implement LogTransport interface (console + database)
- Add LogSpan for operation tracing
- Integrate with sync pipeline
- Add comprehensive tests

Enables end-to-end request tracing; foundation for Phase D observability.
```

---

## References

- **Next Story:** ESPAIDER-MODERNIZATION-008 (consolidate logging tables)

---

**Story Status:** ✅ READY FOR ASSIGNMENT
**Assigned to:** @dev (Dex)
**Blocked by:** ESPAIDER-MODERNIZATION-006
**Blocks:** ESPAIDER-MODERNIZATION-008
