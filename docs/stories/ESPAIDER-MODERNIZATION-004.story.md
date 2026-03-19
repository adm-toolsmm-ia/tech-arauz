# ESPAIDER-MODERNIZATION-004: Create IRepository Interface and Factory Pattern

**Epic:** EPIC-ESPAIDER-MODERNIZATION
**Phase:** B (Repository Pattern & DDD)
**Priority:** 🔴 CRITICAL (blocks Phase B.2 and B.3)
**Effort:** 1-1.5 days
**Owner:** @dev (Dex)
**Status:** READY

---

## Goal

Define repository interface and factory pattern to abstract data access operations, enabling testability and future flexibility (e.g., switching from Supabase to another database).

---

## Acceptance Criteria

- [ ] Create `src/integrations/espaider/repositories/IRepository.ts` with generic interface
- [ ] Implement repository factory in `src/integrations/espaider/repositories/repository-factory.ts`
- [ ] Factory returns Supabase-specific implementation (for now)
- [ ] Support 6 core repository methods: findAll, findById, upsert, delete, count, exists
- [ ] All methods accept domain entities (Project, Delivery, etc.) not raw database rows
- [ ] Repository methods are async; include correlation IDs for logging
- [ ] <500 LOC per repository class (modularity constraint)
- [ ] 90%+ test coverage with mocked database
- [ ] Zero breaking changes to existing sync code

---

## Technical Details

### IRepository Interface

**What it does:**
- Defines contract for CRUD operations on a single entity type (e.g., Project)
- Accepts domain entities, not database rows
- Async methods for all operations
- Supports correlation IDs for tracing

**File: `src/integrations/espaider/repositories/IRepository.ts`**

```typescript
export interface IRepository<T> {
  // Read operations
  findAll(filter?: FindFilter<T>, correlationId?: string): Promise<T[]>
  findById(id: string, correlationId?: string): Promise<T | null>
  exists(id: string, correlationId?: string): Promise<boolean>
  count(filter?: FindFilter<T>, correlationId?: string): Promise<number>

  // Write operations
  upsert(entity: T, correlationId?: string): Promise<T>
  delete(id: string, correlationId?: string): Promise<boolean>

  // Batch operations
  upsertMany(entities: T[], correlationId?: string): Promise<T[]>
  deleteMany(ids: string[], correlationId?: string): Promise<number>
}

export interface FindFilter<T> {
  where?: Partial<T>
  orderBy?: keyof T
  limit?: number
  offset?: number
}
```

### Repository Factory Pattern

**File: `src/integrations/espaider/repositories/repository-factory.ts`**

```typescript
export type RepositoryType = 'projects' | 'deliveries' | 'contacts' | 'etc'

export class RepositoryFactory {
  constructor(private supabaseClient: SupabaseClient) {}

  getRepository<T>(type: RepositoryType): IRepository<T> {
    switch (type) {
      case 'projects':
        return new ProjectRepository(this.supabaseClient)
      case 'deliveries':
        return new DeliveryRepository(this.supabaseClient)
      case 'contacts':
        return new ContactRepository(this.supabaseClient)
      default:
        throw new Error(`Unknown repository type: ${type}`)
    }
  }
}
```

### Implementation Pattern

**Example: ProjectRepository**

```typescript
export class ProjectRepository implements IRepository<Project> {
  private readonly tableName = 'projects'
  private readonly logger = getLogger(__filename)

  constructor(private supabase: SupabaseClient) {}

  async findAll(filter?: FindFilter<Project>, correlationId?: string): Promise<Project[]> {
    const span = this.logger.startSpan('findAll', { correlationId })

    try {
      let query = this.supabase.from(this.tableName).select('*')

      if (filter?.where) {
        Object.entries(filter.where).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }

      if (filter?.orderBy) {
        query = query.order(filter.orderBy)
      }

      if (filter?.limit) {
        query = query.limit(filter.limit)
      }

      if (filter?.offset) {
        query = query.range(filter.offset, filter.offset + filter.limit - 1)
      }

      const { data, error } = await query
      if (error) throw error

      span.end({ count: data?.length ?? 0 })
      return (data as Project[]) || []
    } catch (error) {
      span.end({ error: true })
      throw error
    }
  }

  async upsert(entity: Project, correlationId?: string): Promise<Project> {
    const span = this.logger.startSpan('upsert', { correlationId, id: entity.id })

    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .upsert(entity, { onConflict: 'id' })
        .select()
        .single()

      if (error) throw error

      span.end({ success: true })
      return data as Project
    } catch (error) {
      span.end({ error: true })
      throw error
    }
  }

  // ... other methods (findById, delete, count, exists, upsertMany, deleteMany)
}
```

### Entity Types (Domain Models)

**File: `src/integrations/espaider/entities/index.ts`**

```typescript
export interface Project {
  id: string
  tenant_id: string
  espaider_project_id: string
  nome_projeto: string
  data_inicio: Date
  data_fim?: Date
  status: 'active' | 'closed' | 'pending'
  created_at: Date
  updated_at: Date
}

export interface Delivery {
  id: string
  tenant_id: string
  project_id: string
  espaider_delivery_id: string
  titulo: string
  data_entrega: Date
  status: 'pending' | 'completed' | 'delayed'
  created_at: Date
  updated_at: Date
}

// ... other entities (Contact, Task, etc.)
```

---

## Implementation Steps

1. **Create IRepository interface**
   - Define 6 core methods (findAll, findById, upsert, delete, count, exists)
   - Add batch methods (upsertMany, deleteMany)
   - Support FindFilter for flexible queries

2. **Create Repository Factory**
   - Implement factory pattern
   - Support all 6 entity types (projects, deliveries, contacts, etc.)
   - Return typed repository instances

3. **Create Entity Type Definitions**
   - Define Project, Delivery, Contact, etc. interfaces
   - Include required fields (id, tenant_id, espaider_*_id, created_at, updated_at)
   - Include domain-specific fields (status, dates, etc.)

4. **Implement ProjectRepository**
   - Implement all IRepository methods for Project entity
   - Use Supabase client for all queries
   - Add correlation ID to all log spans
   - Ensure RLS policies are enforced (Supabase handles automatically)

5. **Add Unit Tests**
   - Mock Supabase client
   - Test findAll, findById, upsert, delete, count, exists
   - Test error handling (query failures, RLS violations)
   - Test filter logic (where, orderBy, limit, offset)

6. **Add Integration Tests**
   - Run against test database
   - Verify upsert behavior (insert + update)
   - Verify RLS isolation (tenants can't see each other's data)

---

## Testing Strategy

### Unit Tests (Mock Supabase)

```typescript
describe('ProjectRepository', () => {
  let repository: ProjectRepository
  let supabaseMock: jest.Mocked<SupabaseClient>

  beforeEach(() => {
    supabaseMock = createMockSupabaseClient()
    repository = new ProjectRepository(supabaseMock)
  })

  describe('findAll', () => {
    it('returns all projects', async () => {
      const projects = [
        { id: '1', nome_projeto: 'Project A' },
        { id: '2', nome_projeto: 'Project B' }
      ]
      supabaseMock.from().select().returns(Promise.resolve({ data: projects }))

      const result = await repository.findAll()
      expect(result).toEqual(projects)
    })

    it('filters by where clause', async () => {
      supabaseMock.from().select().eq() // chain mocks
      await repository.findAll({ where: { status: 'active' } })
      expect(supabaseMock.from().eq).toHaveBeenCalledWith('status', 'active')
    })

    it('applies orderBy and limit', async () => {
      await repository.findAll({ orderBy: 'created_at', limit: 10 })
      expect(supabaseMock.from().order).toHaveBeenCalledWith('created_at')
      expect(supabaseMock.from().limit).toHaveBeenCalledWith(10)
    })

    it('logs span with correlation ID', async () => {
      const correlationId = 'trace-123'
      await repository.findAll({}, correlationId)
      expect(loggerSpy.startSpan).toHaveBeenCalledWith(
        'findAll',
        expect.objectContaining({ correlationId })
      )
    })
  })

  describe('upsert', () => {
    it('inserts new project', async () => {
      const newProject = { id: '1', nome_projeto: 'New Project', ... }
      supabaseMock.from().upsert().select().single() // chain

      const result = await repository.upsert(newProject)
      expect(supabaseMock.from().upsert).toHaveBeenCalledWith(
        newProject,
        { onConflict: 'id' }
      )
    })

    it('updates existing project', async () => {
      const updated = { id: '1', nome_projeto: 'Updated', ... }
      await repository.upsert(updated)
      // Supabase upsert handles both insert and update
      expect(supabaseMock.from().upsert).toHaveBeenCalled()
    })
  })

  describe('upsertMany', () => {
    it('upsets multiple projects', async () => {
      const projects = [ /* ... */ ]
      await repository.upsertMany(projects)
      expect(supabaseMock.from().upsert).toHaveBeenCalledWith(projects)
    })
  })
})
```

### Integration Tests (Test Database)

```typescript
describe('ProjectRepository (Integration)', () => {
  it('upserts respect RLS isolation', async () => {
    // Tenant A creates project
    const tenantAClient = createSupabaseClientForTenant('tenant-a')
    const repoA = new ProjectRepository(tenantAClient)
    await repoA.upsert({ id: '1', tenant_id: 'tenant-a', ... })

    // Tenant B tries to query same project
    const tenantBClient = createSupabaseClientForTenant('tenant-b')
    const repoB = new ProjectRepository(tenantBClient)
    const result = await repoB.findAll() // Should be empty (RLS policy)

    expect(result).toHaveLength(0)
  })
})
```

---

## File List

**Create:**
- [ ] `src/integrations/espaider/repositories/IRepository.ts` (NEW - ~50 LOC)
- [ ] `src/integrations/espaider/repositories/repository-factory.ts` (NEW - ~50 LOC)
- [ ] `src/integrations/espaider/entities/index.ts` (NEW - ~80 LOC)
- [ ] `src/integrations/espaider/repositories/ProjectRepository.ts` (NEW - ~150 LOC)
- [ ] `src/integrations/espaider/__tests__/repositories/IRepository.test.ts` (NEW - ~100 LOC)
- [ ] `src/integrations/espaider/__tests__/repositories/repository-factory.test.ts` (NEW - ~60 LOC)
- [ ] `src/integrations/espaider/__tests__/repositories/ProjectRepository.test.ts` (NEW - ~200 LOC)

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
- ✅ All tests pass
- ✅ Coverage ≥90% for repositories

---

## Commit Message

```
feat: Create IRepository interface and factory pattern

- Define generic IRepository<T> interface for CRUD operations
- Implement RepositoryFactory for dependency injection
- Create entity type definitions (Project, Delivery, Contact, etc.)
- Implement ProjectRepository with all IRepository methods
- Add unit and integration tests (mocked + real DB)

Enables abstraction of data access layer; supports future
database switching; improves testability. Correlation IDs
propagate through all repository operations.
```

---

## References

- **Technical Debt Assessment:** Section 8.2 (Modularity improvements)
- **Repository Pattern:** https://martinfowler.com/eaaCatalog/repository.html
- **Next Story:** ESPAIDER-MODERNIZATION-005 (DeliveryRepository)
- **Phase B Overview:** EPIC-ESPAIDER-MODERNIZATION

---

**Story Status:** ✅ READY FOR ASSIGNMENT
**Assigned to:** @dev (Dex)
**Blocked by:** ESPAIDER-MODERNIZATION-001, ESPAIDER-MODERNIZATION-003
**Blocks:** ESPAIDER-MODERNIZATION-005, ESPAIDER-MODERNIZATION-006
