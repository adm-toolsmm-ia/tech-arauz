# ESPAIDER-MODERNIZATION-014: Implement Circuit Breaker Persistence

**Epic:** EPIC-ESPAIDER-MODERNIZATION
**Phase:** F (Resilience & Multi-Instance)
**Priority:** 🟠 HIGH (enables multi-instance resilience)
**Effort:** 1 day
**Owner:** @dev (Dex)
**Status:** READY

---

## Goal

Persist circuit breaker state to database so that breaker state survives process restarts and is shared across multiple sync service instances.

---

## Acceptance Criteria

- [ ] Store circuit breaker state in database (circuit_breaker_states table)
- [ ] Circuit breaker state persists across process restarts
- [ ] State shared across multiple instances (prevents thundering herd)
- [ ] Performance: state check/update <5ms
- [ ] RLS policies enforce tenant isolation
- [ ] Integration tests verify persistence + multi-instance behavior

---

## Current Problem

**Before:**
- Circuit breaker state stored in process memory
- Restart → state lost → all instances immediately retry failed API
- Multiple instances → all send requests simultaneously (thundering herd)

**After:**
- Circuit breaker state in database
- Persist across restarts
- Shared across instances (one instance opens breaker → all instances see it)

## Implementation

### Circuit Breaker State Table

```sql
CREATE TABLE circuit_breaker_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  service_name TEXT NOT NULL, -- 'espaider_api'
  state TEXT NOT NULL, -- 'closed', 'open', 'half_open'
  failure_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  last_failure_at TIMESTAMP,
  opened_at TIMESTAMP,
  next_retry_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(tenant_id, service_name),
  CONSTRAINT state_check CHECK (state IN ('closed', 'open', 'half_open'))
);

ALTER TABLE circuit_breaker_states ENABLE ROW LEVEL SECURITY;
```

### Persistent Circuit Breaker

**src/lib/circuit-breaker-persistent.ts:**
```typescript
export class PersistentCircuitBreaker {
  constructor(
    private supabase: SupabaseClient,
    private serviceName: string,
    private tenantId: string
  ) {}

  async isOpen(): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('circuit_breaker_states')
      .select('state, next_retry_at')
      .eq('service_name', this.serviceName)
      .eq('tenant_id', this.tenantId)
      .single()

    if (!data) return false

    if (data.state === 'closed') return false

    if (data.state === 'open' && data.next_retry_at && new Date() > new Date(data.next_retry_at)) {
      // Time to transition to half-open
      await this.transitionToHalfOpen()
      return false
    }

    return data.state === 'open'
  }

  async recordSuccess(): Promise<void> {
    await this.supabase
      .from('circuit_breaker_states')
      .upsert({
        tenant_id: this.tenantId,
        service_name: this.serviceName,
        state: 'closed',
        failure_count: 0,
        success_count: 0,
        updated_at: new Date()
      }, { onConflict: 'tenant_id,service_name' })
  }

  async recordFailure(): Promise<void> {
    const { data } = await this.supabase
      .from('circuit_breaker_states')
      .select('failure_count')
      .eq('service_name', this.serviceName)
      .single()

    const newFailureCount = (data?.failure_count ?? 0) + 1

    if (newFailureCount >= 5) { // threshold
      await this.open()
    } else {
      await this.supabase
        .from('circuit_breaker_states')
        .upsert({
          tenant_id: this.tenantId,
          service_name: this.serviceName,
          state: 'half_open',
          failure_count: newFailureCount,
          updated_at: new Date()
        }, { onConflict: 'tenant_id,service_name' })
    }
  }

  private async open(): Promise<void> {
    const nextRetry = new Date(Date.now() + 60 * 1000) // 60s retry

    await this.supabase
      .from('circuit_breaker_states')
      .upsert({
        tenant_id: this.tenantId,
        service_name: this.serviceName,
        state: 'open',
        opened_at: new Date(),
        next_retry_at: nextRetry,
        updated_at: new Date()
      }, { onConflict: 'tenant_id,service_name' })
  }

  private async transitionToHalfOpen(): Promise<void> {
    await this.supabase
      .from('circuit_breaker_states')
      .update({ state: 'half_open', updated_at: new Date() })
      .eq('service_name', this.serviceName)
      .eq('tenant_id', this.tenantId)
  }
}
```

---

## File List

**Create:**
- [ ] `supabase/migrations/{timestamp}_create_circuit_breaker_states.sql` (NEW)
- [ ] `src/lib/circuit-breaker-persistent.ts` (NEW - ~150 LOC)
- [ ] `src/lib/__tests__/circuit-breaker-persistent.test.ts` (NEW - ~100 LOC)

**Modify:**
- [ ] `src/integrations/espaider/client.ts` (use PersistentCircuitBreaker)
- [ ] `src/integrations/espaider/__tests__/client.test.ts` (add persistence tests)

---

## Validation Checklist

```bash
npm run typecheck
npm run lint
npm test -- src/lib/__tests__/circuit-breaker-persistent.test.ts
# Manual: Stop/restart instance; verify breaker state persists
```

Expected:
- ✅ All tests pass
- ✅ State survives restarts
- ✅ Multi-instance behavior correct

---

## Commit Message

```
feat: Persist circuit breaker state to database

- Create circuit_breaker_states table with RLS
- Implement PersistentCircuitBreaker class
- State persists across process restarts
- Shared across multiple instances
- Integration tests for persistence + multi-instance

Prevents thundering herd; enables resilience at scale.
```

---

**Story Status:** ✅ READY FOR ASSIGNMENT
**Assigned to:** @dev (Dex)
**Blocked by:** ESPAIDER-MODERNIZATION-008
**Blocks:** None (independent)
