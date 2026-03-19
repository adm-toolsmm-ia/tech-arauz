# ESPAIDER-MODERNIZATION-015: Add Jitter to Exponential Backoff

**Epic:** EPIC-ESPAIDER-MODERNIZATION
**Phase:** F (Resilience & Multi-Instance)
**Priority:** 🟠 MEDIUM (prevents thundering herd in edge cases)
**Effort:** 0.5-1 day
**Owner:** @dev (Dex)
**Status:** READY

---

## Goal

Implement jitter in exponential backoff retry logic to prevent thundering herd problem when multiple instances retry simultaneously.

---

## Acceptance Criteria

- [ ] Implement exponential backoff with jitter utility function
- [ ] Jitter range: ±20% of retry delay
- [ ] Apply to all API retry scenarios
- [ ] 95%+ test coverage
- [ ] No performance impact (calculation <1ms)

---

## Problem

**Without jitter:**
- Instance 1 fails at 14:30:00 → schedules retry at 14:30:30
- Instance 2 fails at 14:30:01 → schedules retry at 14:30:31
- Instance 3 fails at 14:30:02 → schedules retry at 14:30:32
- All retry within 2-second window → spike in requests → potential cascade failure

**With jitter:**
- Instance 1 fails at 14:30:00 → schedules retry at 14:30:24 (30s - 20% jitter)
- Instance 2 fails at 14:30:01 → schedules retry at 14:30:37 (30s + 20% jitter)
- Instance 3 fails at 14:30:02 → schedules retry at 14:30:28 (30s - 10% jitter)
- Retries spread out → smooth request distribution

## Implementation

**src/lib/backoff-jitter.ts:**
```typescript
export function calculateBackoffWithJitter(
  attempt: number,
  baseDelay: number = 1000, // milliseconds
  maxDelay: number = 60000,
  jitterFraction: number = 0.2 // ±20%
): number {
  // Exponential backoff: 2^attempt * baseDelay
  const exponentialDelay = Math.min(
    Math.pow(2, attempt) * baseDelay,
    maxDelay
  )

  // Jitter: random value between -jitterFraction and +jitterFraction
  const jitter = exponentialDelay * (Math.random() * 2 * jitterFraction - jitterFraction)

  return Math.max(0, exponentialDelay + jitter) // Never negative
}

// Example:
// Attempt 0: 1000ms (base)
// Attempt 1: 2000ms ± 400ms = [1600, 2400]
// Attempt 2: 4000ms ± 800ms = [3200, 4800]
// Attempt 3: 8000ms ± 1600ms = [6400, 9600]
// Attempt 4: 16000ms ± 3200ms = [12800, 19200]
// Attempt 5: 32000ms ± 6400ms = [25600, 38400]
```

---

## Integration Points

**In PersistentCircuitBreaker:**
```typescript
private async open(): Promise<void> {
  const baseRetryDelay = 60 * 1000 // 60 seconds
  const nextRetryDelay = calculateBackoffWithJitter(
    this.failureCount,
    baseRetryDelay,
    300 * 1000 // max 5 minutes
  )

  const nextRetry = new Date(Date.now() + nextRetryDelay)

  await this.supabase
    .from('circuit_breaker_states')
    .upsert({
      // ... state update with jittered nextRetry
      next_retry_at: nextRetry
    })
}
```

**In HTTP Client Retry:**
```typescript
async function retryWithBackoff(fn: () => Promise<T>, maxAttempts = 5) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      if (attempt === maxAttempts - 1) throw error

      const delayMs = calculateBackoffWithJitter(attempt)
      await delay(delayMs)
    }
  }
}
```

---

## File List

**Create:**
- [ ] `src/lib/backoff-jitter.ts` (NEW - ~30 LOC)
- [ ] `src/lib/__tests__/backoff-jitter.test.ts` (NEW - ~80 LOC)

**Modify:**
- [ ] `src/lib/circuit-breaker-persistent.ts` (use jitter in retry delay)
- [ ] `src/integrations/espaider/client.ts` (use jitter in API retries)

---

## Testing Strategy

```typescript
describe('calculateBackoffWithJitter', () => {
  it('returns value in expected range', () => {
    for (let attempt = 0; attempt < 5; attempt++) {
      const delay = calculateBackoffWithJitter(attempt)
      const baseDelay = Math.pow(2, attempt) * 1000

      // Should be within ±20% of base
      expect(delay).toBeGreaterThanOrEqual(baseDelay * 0.8)
      expect(delay).toBeLessThanOrEqual(baseDelay * 1.2)
    }
  })

  it('respects max delay', () => {
    const delay = calculateBackoffWithJitter(10, 1000, 60000)
    expect(delay).toBeLessThanOrEqual(60000 * 1.2) // max + jitter
  })

  it('is random (different values for same attempt)', () => {
    const values = Array.from({ length: 100 }, () =>
      calculateBackoffWithJitter(2)
    )
    const unique = new Set(values).size
    expect(unique).toBeGreaterThan(50) // Most values should differ
  })

  it('never returns negative', () => {
    for (let i = 0; i < 100; i++) {
      const delay = calculateBackoffWithJitter(Math.random() * 10)
      expect(delay).toBeGreaterThanOrEqual(0)
    }
  })
})
```

---

## Validation Checklist

```bash
npm run typecheck
npm run lint
npm test -- src/lib/__tests__/backoff-jitter.test.ts
npm test -- --coverage src/lib/backoff-jitter.ts
```

Expected:
- ✅ All tests pass
- ✅ Coverage ≥95%

---

## Commit Message

```
feat: Add jitter to exponential backoff retry logic

- Implement calculateBackoffWithJitter() utility
- Apply jitter ±20% of retry delay
- Prevent thundering herd in multi-instance deployments
- Comprehensive tests for jitter distribution

Improves resilience at scale.
```

---

## References

- **AWS Exponential Backoff And Jitter:** https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/
- **Previous Story:** ESPAIDER-MODERNIZATION-014 (circuit breaker)

---

**Story Status:** ✅ READY FOR ASSIGNMENT
**Assigned to:** @dev (Dex)
**Blocked by:** None (can start parallel with other Phase F work)
**Blocks:** None (independent utility)
