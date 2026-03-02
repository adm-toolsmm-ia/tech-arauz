-- =============================================================================
-- Migration 050: SQL QA RPC — Execute Readonly Queries
-- =============================================================================
-- Description:
--   RPC function for SQL QA chain to execute validated SELECT queries.
--   Python sql_validator validates before calling; this provides execution.
--   SECURITY INVOKER: runs as caller, RLS applies.
--
-- Usage: supabase.rpc('execute_readonly_query', {'query_text': validated_sql})
-- Returns: SETOF jsonb (one row per result row, each row as JSON object)
--
-- Created: 2026-03-01
-- =============================================================================

CREATE OR REPLACE FUNCTION execute_readonly_query(query_text TEXT)
RETURNS SETOF jsonb
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  upper_query TEXT;
BEGIN
  -- Basic safety: only allow SELECT (block INSERT, UPDATE, DELETE, DDL)
  upper_query := upper(trim(query_text));
  IF upper_query !~ '^\s*SELECT\s' THEN
    RAISE EXCEPTION 'sql_qa_rpc: Only SELECT queries allowed'
      USING errcode = 'P0001';
  END IF;
  IF upper_query ~ '\m(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE)\M' THEN
    RAISE EXCEPTION 'sql_qa_rpc: Mutation/DDL not allowed'
      USING errcode = 'P0001';
  END IF;

  RETURN QUERY EXECUTE format('SELECT row_to_json(t)::jsonb FROM (%s) t', query_text);
END;
$$;

COMMENT ON FUNCTION execute_readonly_query(TEXT) IS
  'Execute validated SELECT for SQL QA. Caller must validate via sql_validator first.';
