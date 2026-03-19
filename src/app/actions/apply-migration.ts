'use server';

import { createServiceClient } from '@/lib/supabase/service';

export async function applyMigration056() {
  const supabase = createServiceClient();

  const migrationSQL = `
-- ============================================================================
-- Migration 056: Expand dataset CHECK Constraints
-- ============================================================================

-- PARTE 1: Expand sync_logs dataset constraint
ALTER TABLE public.sync_logs
  DROP CONSTRAINT IF EXISTS sync_logs_dataset_check;

ALTER TABLE public.sync_logs
  ADD CONSTRAINT sync_logs_dataset_check
  CHECK (dataset IN (
    'Projetos', 'Entregas', 'Cronogramas', 'Requisitos',
    'Historicos', 'Aprovadores', 'Orcamentos',
    'TempoPermanencia', 'HorasLancadas'
  ));

-- PARTE 2: Expand integration_log_entries dataset constraint
ALTER TABLE public.integration_log_entries
  DROP CONSTRAINT IF EXISTS integration_log_entries_dataset_check;

ALTER TABLE public.integration_log_entries
  ADD CONSTRAINT integration_log_entries_dataset_check
  CHECK (dataset IN (
    'Projetos', 'Entregas', 'Cronogramas', 'Requisitos', 'Geral',
    'Historicos', 'Aprovadores', 'Orcamentos',
    'TempoPermanencia', 'HorasLancadas'
  ));
`;

  try {
    console.log('[applyMigration056] Starting migration...');

    // Execute raw SQL via postgres.js interface
    const { error } = await supabase.rpc('exec', {
      sql: migrationSQL,
    });

    if (error) {
      console.error('[applyMigration056] Migration error:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log('[applyMigration056] ✅ Migration applied successfully');

    // Test insert with HorasLancadas
    console.log('[applyMigration056] Testing insert with HorasLancadas...');
    const { error: testError } = await supabase
      .from('integration_log_entries')
      .insert([
        {
          tenant_id: '00000000-0000-0000-0000-000000000001',
          request_id: 'MIGRATION-TEST-056',
          level: 'info',
          dataset: 'HorasLancadas',
          message: 'Migration 056: HorasLancadas constraint expansion verified',
          logged_at: new Date().toISOString(),
        },
      ]);

    if (testError) {
      console.error('[applyMigration056] Test insert failed:', testError.message);
      return {
        success: false,
        error: `Migration applied but test failed: ${testError.message}`,
      };
    }

    // Cleanup test entry
    await supabase
      .from('integration_log_entries')
      .delete()
      .eq('request_id', 'MIGRATION-TEST-056');

    console.log('[applyMigration056] ✅ All checks passed');

    return {
      success: true,
      message: 'Migration 056 applied successfully. HorasLancadas now supported.',
    };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('[applyMigration056] Unexpected error:', errMsg);
    return {
      success: false,
      error: errMsg,
    };
  }
}
