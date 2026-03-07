-- =============================================================================
-- RLS Test Template — Copy-Paste Template for New RLS Policies
-- Story 5.4: RLS Testing Template
-- Date: 2026-03-07
-- Author: Dara (@data-engineer)
-- =============================================================================
-- INSTRUCTIONS:
-- 1. Copy this entire section when adding a new table with RLS
-- 2. Replace [TABLE_NAME] with your actual table name
-- 3. Replace [POLICY_NAME] with your policy name
-- 4. Update test descriptions to match your table
-- 5. Increment SELECT plan(N) count at top of rls_policies.test.sql
-- 6. Run: npm run test:rls
-- =============================================================================

-- =============================================================================
-- TEST GROUP N: [TABLE_NAME] TABLE (M tests)
-- =============================================================================
-- Test N.1: SELECT policy exists for [table_name]
-- Test N.2: INSERT policy exists for [table_name]
-- Test N.3: UPDATE policy exists for [table_name]
-- Test N.4: RLS is enabled on [table_name]
-- Test N.5: [table_name] has isolation column (tenant_id/user_id)
-- Test N.6: [table_name] table exists

-- Test N.1: SELECT policy exists
SELECT ok(
    EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = '[table_name]'
        AND policyname LIKE '%select%'
    ),
    'Test N.1: SELECT RLS policy exists for [table_name]'
);

-- Test N.2: INSERT policy exists
SELECT ok(
    EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = '[table_name]'
        AND policyname LIKE '%insert%'
    ),
    'Test N.2: INSERT RLS policy exists for [table_name]'
);

-- Test N.3: UPDATE policy exists
SELECT ok(
    EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = '[table_name]'
        AND policyname LIKE '%update%'
    ),
    'Test N.3: UPDATE RLS policy exists for [table_name]'
);

-- Test N.4: RLS is enabled
SELECT ok(
    (SELECT relrowsecurity FROM pg_class WHERE relname = '[table_name]'),
    'Test N.4: RLS is enabled on [table_name] table'
);

-- Test N.5: Isolation column exists (choose one or add both)
SELECT ok(
    EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = '[table_name]'
        AND column_name IN ('tenant_id', 'user_id')  -- Adjust based on isolation type
    ),
    'Test N.5: [table_name] has isolation column'
);

-- Test N.6: Table exists
SELECT ok(
    EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = '[table_name]'
        AND table_schema = 'public'
    ),
    'Test N.6: [table_name] table exists'
);

-- =============================================================================
-- ADVANCED PATTERNS (Optional — for more complex testing)
-- =============================================================================

-- Pattern A: Check for specific policy name (not just existence)
-- SELECT ok(
--     EXISTS (
--         SELECT 1 FROM pg_policies
--         WHERE tablename = '[table_name]'
--         AND policyname = '[table_name]_tenant_isolation_select'
--     ),
--     'Test N.X: SELECT policy has correct naming convention'
-- );

-- Pattern B: Verify foreign key constraints
-- SELECT ok(
--     EXISTS (
--         SELECT 1 FROM pg_constraint
--         WHERE conname LIKE '%fk_%'
--         AND conrelid = 'public.[table_name]'::regclass
--     ),
--     'Test N.X: [table_name] has foreign key constraint'
-- );

-- Pattern C: Check for UNIQUE constraint (tenant_id, espaider_id)
-- SELECT ok(
--     EXISTS (
--         SELECT 1 FROM pg_constraint
--         WHERE contype = 'u'
--         AND conrelid = 'public.[table_name]'::regclass
--     ),
--     'Test N.X: [table_name] has UNIQUE constraint'
-- );

-- Pattern D: Verify multiple policies exist (for fine-grained control)
-- DO $$
-- BEGIN
--     IF NOT EXISTS (
--         SELECT 1 FROM pg_policies
--         WHERE tablename = '[table_name]'
--         AND policyname LIKE '%admin%'
--     ) THEN
--         RAISE EXCEPTION 'Admin policy missing for [table_name]';
--     END IF;
-- END;
-- $$;

-- =============================================================================
-- NOTES:
-- =============================================================================
-- - Each table should have at least 6-8 tests covering:
--   1. SELECT policy exists
--   2. INSERT policy exists
--   3. UPDATE policy exists (if applicable)
--   4. DELETE policy exists (if applicable)
--   5. RLS is enabled
--   6. Isolation column exists
--   7. Constraints/FKs in place
--   8. Table schema is correct

-- - For tenant-isolated tables, test uses (tenant_id = public.get_user_tenant_id())
-- - For user-isolated tables, test uses (user_id = auth.uid())
-- - For hierarchical tables (FK to projects), test uses subquery isolation

-- - Do NOT test policy *logic* here (e.g., "User A cannot see User B's data")
--   That belongs in application integration tests with real auth context

-- - These tests validate *structure*, not *behavior*
-- =============================================================================
