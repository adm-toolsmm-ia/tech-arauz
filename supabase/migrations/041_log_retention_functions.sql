-- =============================================================================
-- Migration 041: Log Retention Functions
-- =============================================================================
-- OBJETIVO: Implementar a política de retenção de logs definida em
-- docs/architecture/log-retention-policy.md
--
-- Prazos:
--   integration_log_entries: 90 dias
--   sync_logs:               180 dias
--
-- Story: 2.27 — DB Governance (Retenção de Logs)
-- =============================================================================

-- ============================================================================
-- PART 1: Create purge_old_logs() function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.purge_old_logs(
  p_dry_run BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
  table_name TEXT,
  rows_deleted BIGINT,
  oldest_remaining TIMESTAMPTZ
) AS $$
DECLARE
  v_integration_deleted BIGINT := 0;
  v_sync_deleted BIGINT := 0;
  v_integration_oldest TIMESTAMPTZ;
  v_sync_oldest TIMESTAMPTZ;
BEGIN
  IF p_dry_run THEN
    -- Dry run: only count what WOULD be deleted
    SELECT COUNT(*) INTO v_integration_deleted
    FROM integration_log_entries
    WHERE created_at < NOW() - INTERVAL '90 days';

    SELECT COUNT(*) INTO v_sync_deleted
    FROM sync_logs
    WHERE started_at < NOW() - INTERVAL '180 days';
  ELSE
    -- Purge integration_log_entries (90 days retention)
    -- Delete oldest first, respecting FK order
    DELETE FROM integration_log_entries
    WHERE created_at < NOW() - INTERVAL '90 days';
    GET DIAGNOSTICS v_integration_deleted = ROW_COUNT;

    -- Purge sync_logs (180 days retention)
    -- Only delete sync_logs whose log_entries are already purged
    DELETE FROM sync_logs
    WHERE started_at < NOW() - INTERVAL '180 days'
      AND NOT EXISTS (
        SELECT 1 FROM integration_log_entries ile
        WHERE ile.sync_log_id = sync_logs.id
      );
    GET DIAGNOSTICS v_sync_deleted = ROW_COUNT;
  END IF;

  -- Get oldest remaining record for each table
  SELECT MIN(created_at) INTO v_integration_oldest
  FROM integration_log_entries;

  SELECT MIN(started_at) INTO v_sync_oldest
  FROM sync_logs;

  RETURN QUERY VALUES
    ('integration_log_entries'::TEXT, v_integration_deleted, v_integration_oldest),
    ('sync_logs'::TEXT, v_sync_deleted, v_sync_oldest);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.purge_old_logs IS
'Purge old log entries according to retention policy.
 - integration_log_entries: 90 days
 - sync_logs: 180 days (only if no linked log_entries remain)
 Use p_dry_run=TRUE to preview what would be deleted without actually deleting.
 Reference: docs/architecture/log-retention-policy.md';

-- ============================================================================
-- PART 2: Create log_volume_stats() for monitoring
-- ============================================================================

CREATE OR REPLACE FUNCTION public.log_volume_stats()
RETURNS TABLE (
  table_name TEXT,
  total_rows BIGINT,
  oldest_record TIMESTAMPTZ,
  newest_record TIMESTAMPTZ,
  rows_older_than_retention BIGINT,
  estimated_size_mb NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    'integration_log_entries'::TEXT,
    (SELECT COUNT(*) FROM integration_log_entries),
    (SELECT MIN(created_at) FROM integration_log_entries),
    (SELECT MAX(created_at) FROM integration_log_entries),
    (SELECT COUNT(*) FROM integration_log_entries WHERE created_at < NOW() - INTERVAL '90 days'),
    (SELECT pg_total_relation_size('integration_log_entries')::NUMERIC / (1024 * 1024));

  RETURN QUERY
  SELECT
    'sync_logs'::TEXT,
    (SELECT COUNT(*) FROM sync_logs),
    (SELECT MIN(started_at) FROM sync_logs),
    (SELECT MAX(started_at) FROM sync_logs),
    (SELECT COUNT(*) FROM sync_logs WHERE started_at < NOW() - INTERVAL '180 days'),
    (SELECT pg_total_relation_size('sync_logs')::NUMERIC / (1024 * 1024));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.log_volume_stats IS
'Returns volume statistics for log tables. Use for monitoring growth and planning purges.';

-- ============================================================================
-- Verification queries (run manually)
-- ============================================================================
--
-- Preview what would be purged:
-- SELECT * FROM purge_old_logs(TRUE);
--
-- Actually purge:
-- SELECT * FROM purge_old_logs(FALSE);
--
-- Check volume stats:
-- SELECT * FROM log_volume_stats();
-- ============================================================================
