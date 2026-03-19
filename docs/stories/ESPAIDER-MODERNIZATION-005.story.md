# ESPAIDER-MODERNIZATION-005: Implement Additional Repositories (Delivery, Contact, Task)

**Epic:** EPIC-ESPAIDER-MODERNIZATION
**Phase:** B (Repository Pattern & DDD)
**Priority:** 🟠 HIGH (required by sync orchestration)
**Effort:** 1.5 days
**Owner:** @dev (Dex)
**Status:** READY

---

## Goal

Implement concrete repository classes for Delivery, Contact, and Task entities following the IRepository pattern established in Story 004. Ensure consistent behavior and full test coverage across all entity types.

---

## Acceptance Criteria

- [ ] Create DeliveryRepository, ContactRepository, TaskRepository (each <500 LOC)
- [ ] All repositories implement IRepository<T> interface completely
- [ ] Consistent filtering, sorting, and pagination logic across all repositories
- [ ] 90%+ test coverage (unit + integration tests for each)
- [ ] Correlation IDs propagate through all operations
- [ ] Batch operations (upsertMany, deleteMany) optimized for performance
- [ ] Support for complex filters (date ranges, status enums, etc.)
- [ ] Zero breaking changes to existing code

---

## Technical Details

### Repositories to Implement

**1. DeliveryRepository**
- Entity: Delivery (with relationships to Project)
- Key queries:
  - Find by project_id
  - Find by status (pending, completed, delayed)
  - Find by date range (data_entrega)
  - Count pending deliveries per project

**2. ContactRepository**
- Entity: Contact (with relationships to Project)
- Key queries:
  - Find by project_id
  - Find by role (manager, developer, client, etc.)
  - Find by email (for duplicate detection)
  - Search by name (fuzzy)

**3. TaskRepository**
- Entity: Task (with relationships to Delivery, Contact)
- Key queries:
  - Find by delivery_id
  - Find by assigned_to (contact_id)
  - Find by status (pending, completed, overdue)
  - Find by date range (data_vencimento)

### File Structure

```
src/integrations/espaider/repositories/
├── IRepository.ts (exists from Story 004)
├── repository-factory.ts (updated to include new repos)
├── ProjectRepository.ts (exists from Story 004)
├── DeliveryRepository.ts (NEW)
├── ContactRepository.ts (NEW)
├── TaskRepository.ts (NEW)
└── __tests__/
    ├── DeliveryRepository.test.ts (NEW)
    ├── ContactRepository.test.ts (NEW)
    └── TaskRepository.test.ts (NEW)
```

### Implementation Pattern

All repositories follow the same pattern:

```typescript
export class DeliveryRepository implements IRepository<Delivery> {
  private readonly tableName = 'deliveries'
  private readonly logger = getLogger(__filename)

  constructor(private supabase: SupabaseClient) {}

  async findAll(filter?: FindFilter<Delivery>, correlationId?: string): Promise<Delivery[]> {
    const span = this.logger.startSpan('findAll', { correlationId, table: this.tableName })
    try {
      // Implementation using Supabase query builder
      const { data, error } = await query
      if (error) throw error
      span.end({ count: data?.length ?? 0 })
      return data as Delivery[]
    } catch (error) {
      span.end({ error: true })
      throw error
    }
  }

  // ... other methods
}
```

### Complex Filters (Examples)

**Find deliveries in date range:**
```typescript
const deliveries = await repo.findAll({
  where: {
    data_entrega: { $gte: startDate, $lte: endDate },
    status: 'pending'
  },
  orderBy: 'data_entrega',
  limit: 50
}, correlationId)
```

**Find contacts by role:**
```typescript
const managers = await contactRepo.findAll({
  where: { role: 'manager', project_id: 'proj-123' },
  orderBy: 'name'
}, correlationId)
```

### Update RepositoryFactory

```typescript
export class RepositoryFactory {
  constructor(private supabaseClient: SupabaseClient) {}

  getRepository<T>(type: RepositoryType): IRepository<T> {
    switch (type) {
      case 'projects':
        return new ProjectRepository(this.supabaseClient) as any
      case 'deliveries':
        return new DeliveryRepository(this.supabaseClient) as any
      case 'contacts':
        return new ContactRepository(this.supabaseClient) as any
      case 'tasks':
        return new TaskRepository(this.supabaseClient) as any
      default:
        throw new Error(`Unknown repository type: ${type}`)
    }
  }
}
```

---

## Testing Strategy

### Unit Tests (DeliveryRepository.test.ts)

```typescript
describe('DeliveryRepository', () => {
  let repository: DeliveryRepository
  let supabaseMock: jest.Mocked<SupabaseClient>

  beforeEach(() => {
    supabaseMock = createMockSupabaseClient()
    repository = new DeliveryRepository(supabaseMock)
  })

  describe('findAll with filters', () => {
    it('filters deliveries by status', async () => {
      await repository.findAll({ where: { status: 'pending' } })
      expect(supabaseMock.from().select().eq).toHaveBeenCalledWith('status', 'pending')
    })

    it('filters by date range', async () => {
      const startDate = '2026-01-01'
      const endDate = '2026-03-31'
      await repository.findAll({
        where: {
          data_entrega: { $gte: startDate, $lte: endDate }
        }
      })
      // Verify date range queries
    })

    it('filters by project_id', async () => {
      await repository.findAll({ where: { project_id: 'proj-123' } })
      expect(supabaseMock.from().select().eq).toHaveBeenCalledWith('project_id', 'proj-123')
    })
  })

  describe('findById', () => {
    it('returns delivery by ID', async () => {
      const delivery = { id: 'del-1', titulo: 'Delivery 1', ... }
      supabaseMock.from().select().eq().single()
      const result = await repository.findById('del-1')
      expect(result).toEqual(delivery)
    })

    it('returns null if delivery not found', async () => {
      supabaseMock.from().select().eq().single() // No error but null
      const result = await repository.findById('nonexistent')
      expect(result).toBeNull()
    })
  })

  describe('upsertMany (batch operation)', () => {
    it('upserts multiple deliveries efficiently', async () => {
      const deliveries = [
        { id: 'del-1', titulo: 'Delivery 1', ... },
        { id: 'del-2', titulo: 'Delivery 2', ... }
      ]
      await repository.upsertMany(deliveries)
      expect(supabaseMock.from().upsert).toHaveBeenCalledWith(deliveries)
    })

    it('returns all upserted deliveries', async () => {
      const deliveries = [ /* ... */ ]
      supabaseMock.from().upsert().select() // Returns all rows
      const result = await repository.upsertMany(deliveries)
      expect(result).toHaveLength(2)
    })
  })
})
```

### Integration Tests

```typescript
describe('DeliveryRepository (Integration)', () => {
  let repository: DeliveryRepository
  let supabaseClient: SupabaseClient

  beforeAll(async () => {
    supabaseClient = await createTestSupabaseClient()
    repository = new DeliveryRepository(supabaseClient)
  })

  it('upserts deliveries and maintains relationships', async () => {
    const delivery = {
      id: 'del-1',
      project_id: 'proj-1',
      titulo: 'Test Delivery',
      data_entrega: new Date('2026-04-01'),
      status: 'pending'
    }

    await repository.upsert(delivery)
    const result = await repository.findById('del-1')

    expect(result).toEqual(expect.objectContaining({
      id: 'del-1',
      project_id: 'proj-1'
    }))
  })

  it('respects RLS policies (multi-tenant isolation)', async () => {
    // Create delivery as tenant A
    const tenantAClient = createSupabaseClientForTenant('tenant-a')
    const repoA = new DeliveryRepository(tenantAClient)
    await repoA.upsert({ id: 'del-1', tenant_id: 'tenant-a', ... })

    // Try to query as tenant B
    const tenantBClient = createSupabaseClientForTenant('tenant-b')
    const repoB = new DeliveryRepository(tenantBClient)
    const result = await repoB.findById('del-1')

    expect(result).toBeNull() // RLS prevents access
  })
})
```

---

## File List

**Create:**
- [ ] `src/integrations/espaider/repositories/DeliveryRepository.ts` (NEW - ~150 LOC)
- [ ] `src/integrations/espaider/repositories/ContactRepository.ts` (NEW - ~150 LOC)
- [ ] `src/integrations/espaider/repositories/TaskRepository.ts` (NEW - ~150 LOC)
- [ ] `src/integrations/espaider/__tests__/repositories/DeliveryRepository.test.ts` (NEW - ~150 LOC)
- [ ] `src/integrations/espaider/__tests__/repositories/ContactRepository.test.ts` (NEW - ~150 LOC)
- [ ] `src/integrations/espaider/__tests__/repositories/TaskRepository.test.ts` (NEW - ~150 LOC)

**Modify:**
- [ ] `src/integrations/espaider/repositories/repository-factory.ts` (add 3 new repository types)
- [ ] `src/integrations/espaider/entities/index.ts` (add Delivery, Contact, Task entity types)

---

## Validation Checklist

```bash
npm run typecheck
npm run lint
npm run build
npm test -- src/integrations/espaider/__tests__/repositories/
npm test -- --coverage src/integrations/espaider/repositories/
```

Expected results:
- ✅ Zero typecheck errors
- ✅ Zero eslint errors
- ✅ All tests pass (unit + integration)
- ✅ Coverage ≥90% for all repositories

---

## Commit Message

```
feat: Implement DeliveryRepository, ContactRepository, TaskRepository

- Create 3 repository classes implementing IRepository<T> pattern
- Support complex filters (date ranges, status, relationships)
- Add batch operations for efficient syncing
- Add unit and integration tests for all repositories
- Update RepositoryFactory to support all entity types

Enables modular data access; consistent across all entities.
Correlation IDs flow through all repository operations.
```

---

## References

- **IRepository Pattern:** ESPAIDER-MODERNIZATION-004
- **Entity Definitions:** docs/architecture/ESPAIDER-DATABASE-SCHEMA.md
- **Next Story:** ESPAIDER-MODERNIZATION-006 (refactor sync orchestration)

---

**Story Status:** ✅ READY FOR ASSIGNMENT
**Assigned to:** @dev (Dex)
**Blocked by:** ESPAIDER-MODERNIZATION-004
**Blocks:** ESPAIDER-MODERNIZATION-006
