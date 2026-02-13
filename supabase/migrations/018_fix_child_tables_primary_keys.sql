-- Migration 018: Fix child tables primary keys
-- Created: 2026-02-13
-- Description: Replace old 'id bigint PK' with auto-increment id + use composite UNIQUE for upsert

-- ============================================================================
-- PART 1: Fix project_histories table
-- ============================================================================

-- Drop old PK constraint
ALTER TABLE public.project_histories
  DROP CONSTRAINT IF EXISTS project_histories_pkey;

-- Change id to auto-generated
ALTER TABLE public.project_histories
  ALTER COLUMN id DROP NOT NULL,
  ALTER COLUMN id DROP DEFAULT;

-- Add new auto-increment id column (as new PK)
ALTER TABLE public.project_histories
  ADD COLUMN IF NOT EXISTS new_id BIGSERIAL;

-- Copy existing IDs if any (should be none)
UPDATE public.project_histories SET new_id = id WHERE id IS NOT NULL;

-- Drop old id column
ALTER TABLE public.project_histories DROP COLUMN IF EXISTS id;

-- Rename new_id to id
ALTER TABLE public.project_histories RENAME COLUMN new_id TO id;

-- Set id as PRIMARY KEY
ALTER TABLE public.project_histories
  ADD PRIMARY KEY (id);

-- ============================================================================
-- PART 2: Fix project_approvers table
-- ============================================================================

ALTER TABLE public.project_approvers
  DROP CONSTRAINT IF EXISTS project_approvers_pkey;

ALTER TABLE public.project_approvers
  ALTER COLUMN id DROP NOT NULL,
  ALTER COLUMN id DROP DEFAULT;

ALTER TABLE public.project_approvers
  ADD COLUMN IF NOT EXISTS new_id BIGSERIAL;

UPDATE public.project_approvers SET new_id = id WHERE id IS NOT NULL;

ALTER TABLE public.project_approvers DROP COLUMN IF EXISTS id;

ALTER TABLE public.project_approvers RENAME COLUMN new_id TO id;

ALTER TABLE public.project_approvers
  ADD PRIMARY KEY (id);

-- ============================================================================
-- PART 3: Fix project_budgets table
-- ============================================================================

ALTER TABLE public.project_budgets
  DROP CONSTRAINT IF EXISTS project_budgets_pkey;

ALTER TABLE public.project_budgets
  ALTER COLUMN id DROP NOT NULL,
  ALTER COLUMN id DROP DEFAULT;

ALTER TABLE public.project_budgets
  ADD COLUMN IF NOT EXISTS new_id BIGSERIAL;

UPDATE public.project_budgets SET new_id = id WHERE id IS NOT NULL;

ALTER TABLE public.project_budgets DROP COLUMN IF EXISTS id;

ALTER TABLE public.project_budgets RENAME COLUMN new_id TO id;

ALTER TABLE public.project_budgets
  ADD PRIMARY KEY (id);
