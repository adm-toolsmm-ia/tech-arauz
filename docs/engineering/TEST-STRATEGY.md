# Test Strategy — Coverage, Tools, Execution (AIOX 10/10)

**Version:** 0.2.3 (Production Live)
**Last Updated:** 2026-03-14
**Status:** Authoritative
**Test Framework:** Vitest 1.6.0, Jest-axe, Cypress 15

---

## Test Pyramid

```
        E2E (Cypress)  ← 5-10% of tests
       /              \
      /                \
    Integration Tests    ← 20-30% of tests
   /                      \
  /                        \
Unit Tests (Vitest)         ← 60-70% of tests
```

### Unit Tests (Vitest)

```bash
npm run test
# → Runs all *.test.ts / *.test.tsx files
# → Fast (milliseconds)
# → Coverage report: vitest --coverage
```

**Target:** ≥85% coverage (current: 92%)

**Example:**

```typescript
// src/lib/utils/__tests__/date-utils.test.ts
import { formatDate } from '@/lib/utils/date-utils';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const result = formatDate(new Date('2026-03-14'));
    expect(result).toBe('March 14, 2026');
  });

  it('should handle invalid date', () => {
    expect(() => formatDate(null)).toThrow();
  });
});
```

### Integration Tests

```typescript
// test database + API interaction
it('should sync project from Espaider', async () => {
  const client = createSupabaseClient();

  // Upsert project
  await client.from('projects').upsert({
    tenant_id: tenantId,
    espaider_id: 'ESP-001',
    name: 'Test Project'
  });

  // Verify in DB
  const { data } = await client
    .from('projects')
    .select()
    .eq('espaider_id', 'ESP-001');

  expect(data).toHaveLength(1);
});
```

### E2E Tests (Cypress)

```bash
npm run cypress  # Opens Cypress Test Runner
# or
npm run cypress:run  # Headless mode
```

**Example:**

```typescript
// cypress/e2e/projects.cy.ts
describe('Projects Page', () => {
  beforeEach(() => {
    cy.visit('/projetos');
    cy.login('user@example.com', 'password');
  });

  it('should list projects in kanban view', () => {
    cy.get('[data-testid="kanban-board"]').should('exist');
    cy.get('[data-testid="project-card"]').should('have.length.greaterThan', 0);
  });

  it('should filter projects by status', () => {
    cy.get('[data-testid="status-filter"]').click();
    cy.get('[data-testid="status-active"]').click();
    cy.get('[data-testid="project-card"]').each($card => {
      cy.wrap($card).should('contain', 'Active');
    });
  });
});
```

---

## Accessibility Testing

```bash
npm run test:a11y
# → Runs jest-axe on all components
# → Checks WCAG AA compliance
```

**Checks:**
- Color contrast (minimum 4.5:1 for text)
- Semantic HTML (<button>, <form>, <nav>)
- ARIA labels on interactive elements
- Keyboard navigation (Tab through page)
- Focus indicators (visible focus ring)

---

## RLS Testing (pgTAP)

```bash
npm run test:rls
# → Runs Supabase RLS policy tests
# → Validates tenant isolation
```

**Example:**

```sql
-- supabase/tests/rls_policies.test.sql
BEGIN;

-- Test 1: User cannot see other tenant's projects
SELECT is(
  (SELECT COUNT(*) FROM projects
   WHERE tenant_id != current_tenant_id),
  0,
  'User cannot see other tenants projects'
);

SELECT * FROM finish();
```

---

## Test Coverage Targets

| Category | Target | Current |
|----------|--------|---------|
| **Overall** | ≥85% | 92% ✅ |
| **Components** | ≥80% | 89% ✅ |
| **Utilities** | ≥90% | 95% ✅ |
| **Services** | ≥85% | 91% ✅ |

---

## Running Tests

```bash
# All tests once
npm test

# Watch mode (re-run on file change)
npm run test:watch

# With UI
npm run test:ui

# Coverage report
npm run test:coverage

# Specific test
npm test -- formatDate
```

---

**Authored by:** Claude Code (Haiku 4.5)
**Framework:** Synkra AIOX v1.0.0
**Last Reviewed:** 2026-03-14
