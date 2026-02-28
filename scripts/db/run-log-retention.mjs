/**
 * run-log-retention.mjs
 * Story 2.27 — DB Governance (Retenção de Logs)
 *
 * Invokes purge_old_logs() via Supabase to clean up old log entries.
 * Retention periods defined in docs/architecture/log-retention-policy.md:
 *   - integration_log_entries: 90 days
 *   - sync_logs: 180 days
 *
 * Usage:
 *   npm run db:purge-logs             # Execute purge
 *   npm run db:purge-logs -- --dry    # Preview (don't delete)
 *   npm run db:purge-logs -- --stats  # Show volume stats only
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('[purge-logs] Missing SUPABASE_URL');
  process.exit(1);
}
if (!serviceRoleKey) {
  console.error('[purge-logs] Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry');
const isStatsOnly = args.includes('--stats');

async function showStats() {
  const { data, error } = await supabase.rpc('log_volume_stats');

  if (error) {
    console.error('[purge-logs] Failed to get stats:', error.message);
    return;
  }

  console.log('\n[purge-logs] Volume Statistics:');
  console.log('─'.repeat(80));
  for (const row of data) {
    console.log(`  ${row.table_name}:`);
    console.log(`    Total rows:       ${row.total_rows.toLocaleString()}`);
    console.log(`    Oldest record:    ${row.oldest_record || 'N/A'}`);
    console.log(`    Newest record:    ${row.newest_record || 'N/A'}`);
    console.log(`    Past retention:   ${row.rows_older_than_retention.toLocaleString()} rows`);
    console.log(`    Estimated size:   ${Number(row.estimated_size_mb).toFixed(2)} MB`);
  }
  console.log('─'.repeat(80));
}

async function purge() {
  const mode = isDryRun ? 'DRY RUN' : 'EXECUTE';
  console.log(`\n[purge-logs] Mode: ${mode}`);
  console.log('[purge-logs] Retention policy:');
  console.log('  - integration_log_entries: 90 days');
  console.log('  - sync_logs: 180 days');

  const { data, error } = await supabase.rpc('purge_old_logs', {
    p_dry_run: isDryRun,
  });

  if (error) {
    console.error('[purge-logs] Failed:', error.message);
    process.exit(1);
  }

  console.log(`\n[purge-logs] Results (${mode}):`);
  console.log('─'.repeat(60));
  for (const row of data) {
    const action = isDryRun ? 'would delete' : 'deleted';
    console.log(`  ${row.table_name}: ${action} ${row.rows_deleted.toLocaleString()} rows`);
    if (row.oldest_remaining) {
      console.log(`    Oldest remaining: ${row.oldest_remaining}`);
    }
  }
  console.log('─'.repeat(60));

  const totalDeleted = data.reduce((sum, row) => sum + Number(row.rows_deleted), 0);
  if (totalDeleted === 0) {
    console.log('[purge-logs] No records to purge — all within retention period.');
  } else if (isDryRun) {
    console.log(`[purge-logs] Would delete ${totalDeleted.toLocaleString()} total rows.`);
    console.log('[purge-logs] Run without --dry to execute.');
  } else {
    console.log(`[purge-logs] Purged ${totalDeleted.toLocaleString()} total rows.`);
  }
}

// Main
if (isStatsOnly) {
  await showStats();
} else {
  await showStats();
  await purge();
}
