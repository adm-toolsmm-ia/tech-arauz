-- Migration: Add created_by and updated_by to agent_types
-- Description: Fixes "Could not find the 'created_by' column" error when creating agent types
-- Created: 2026-02-25

ALTER TABLE agent_types
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
