# ESPAIDER-MODERNIZATION-010: Implement Error Classification (HTTP vs Data)

**Epic:** EPIC-ESPAIDER-MODERNIZATION
**Phase:** D (Modularity & Error Handling)
**Priority:** 🟠 HIGH (enables error remediation)
**Effort:** 1-1.5 days
**Owner:** @dev (Dex)
**Status:** READY

---

## Goal

Classify errors into categories (HTTP errors, validation errors, data errors, infrastructure errors) to enable specific remediation UI in Phase D.

---

## Acceptance Criteria

- [ ] Create error classification system (ErrorCategory enum)
- [ ] Categorize all error types: HTTP, ValidationError, DataError, NetworkError, RateLimitError, InfrastructureError
- [ ] Each error includes human-readable message + remediation steps
- [ ] 5+ remediation patterns implemented
- [ ] 90%+ test coverage for error classification
- [ ] Update handlers to return specific error categories in response

---

## Error Categories

```typescript
export enum ErrorCategory {
  HTTP_ERROR = 'HTTP_ERROR',           // 4xx, 5xx responses
  VALIDATION_ERROR = 'VALIDATION_ERROR', // Zod validation failure
  DATA_ERROR = 'DATA_ERROR',             // Mapper/transformation error
  NETWORK_ERROR = 'NETWORK_ERROR',       // Connection timeout, DNS failure
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR', // 429 Too Many Requests
  INFRASTRUCTURE_ERROR = 'INFRASTRUCTURE_ERROR' // DB unavailable, etc.
}

export class ClassifiedError extends Error {
  constructor(
    public readonly category: ErrorCategory,
    message: string,
    public readonly remediation: RemediationStep[],
    public readonly details: Record<string, any> = {}
  ) {
    super(message)
    this.name = 'ClassifiedError'
  }
}

export interface RemediationStep {
  action: string // What the user should do
  description: string
  isAutomatic?: boolean // Can be fixed automatically
}
```

---

## Remediation Patterns (5+)

1. **"Check API Credentials"**
   - Trigger: HTTP 401 Unauthorized
   - Action: Verify API token in environment
   - Automatic: No (requires manual intervention)

2. **"Check Date Format"**
   - Trigger: Validation error on date field
   - Action: Ensure date format is YYYY-MM-DD
   - Automatic: No (requires user correction)

3. **"Retry with Exponential Backoff"**
   - Trigger: Network timeout, 429 rate limit
   - Action: Wait 30 seconds and retry (auto-retry available)
   - Automatic: Yes (click "Retry Now")

4. **"Check Espaider API Status"**
   - Trigger: 5xx error from Espaider
   - Action: Visit status.espaider.com; wait for recovery
   - Automatic: No

5. **"Contact Support"**
   - Trigger: Unexpected error (500+ internal)
   - Action: Contact support with correlation ID
   - Automatic: No

---

## Implementation

**error-classifier.ts:**
```typescript
export function classifyError(error: Error): ClassifiedError {
  if (error instanceof ValidationError) {
    return new ClassifiedError(
      ErrorCategory.VALIDATION_ERROR,
      'API response validation failed',
      [
        {
          action: 'Check API Compatibility',
          description: 'Espaider API structure may have changed. Check API docs.'
        }
      ],
      { originalError: error.details }
    )
  }

  if (error instanceof AxiosError) {
    if (error.response?.status === 401) {
      return new ClassifiedError(
        ErrorCategory.HTTP_ERROR,
        'Authentication failed',
        [
          {
            action: 'Verify API Credentials',
            description: 'Check ESPAIDER_API_TOKEN in environment'
          }
        ],
        { statusCode: 401 }
      )
    }

    if (error.response?.status === 429) {
      return new ClassifiedError(
        ErrorCategory.RATE_LIMIT_ERROR,
        'Rate limit exceeded',
        [
          {
            action: 'Retry after waiting',
            description: 'Wait 30-60 seconds before retrying',
            isAutomatic: true
          }
        ],
        { statusCode: 429, retryAfter: error.response.headers['retry-after'] }
      )
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return new ClassifiedError(
        ErrorCategory.NETWORK_ERROR,
        'Network connection failed',
        [
          {
            action: 'Check Network Connection',
            description: 'Verify internet connectivity and firewall rules'
          },
          {
            action: 'Retry',
            description: 'Retry the operation',
            isAutomatic: true
          }
        ],
        { errorCode: error.code }
      )
    }
  }

  // Default: unexpected error
  return new ClassifiedError(
    ErrorCategory.INFRASTRUCTURE_ERROR,
    'Unexpected error occurred',
    [
      {
        action: 'Contact Support',
        description: 'Please contact support with the error ID below'
      }
    ],
    { originalError: error.message }
  )
}
```

---

## File List

**Create:**
- [ ] `src/integrations/espaider/errors/error-classifier.ts` (NEW - ~100 LOC)
- [ ] `src/integrations/espaider/errors/index.ts` (NEW)
- [ ] `src/integrations/espaider/__tests__/errors/error-classifier.test.ts` (NEW - ~150 LOC)

**Modify:**
- [ ] `src/integrations/espaider/sync/handlers.ts` (use error classifier)

---

## Validation Checklist

```bash
npm run typecheck
npm run lint
npm run build
npm test -- src/integrations/espaider/__tests__/errors/
npm test -- --coverage src/integrations/espaider/errors/
```

Expected:
- ✅ All tests pass
- ✅ Coverage ≥90%

---

## Commit Message

```
feat: Implement error classification system

- Create ErrorCategory enum (HTTP, Validation, Data, Network, RateLimit, Infrastructure)
- Classify errors to specific categories with remediation steps
- Implement 5+ remediation patterns
- Update handlers to return error category in response

Enables targeted error handling in UI (Phase D).
```

---

**Story Status:** ✅ READY FOR ASSIGNMENT
**Assigned to:** @dev (Dex)
**Blocked by:** ESPAIDER-MODERNIZATION-009
**Blocks:** (Phase D UI work depends on this)
