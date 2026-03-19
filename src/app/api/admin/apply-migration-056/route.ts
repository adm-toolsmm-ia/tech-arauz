export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

/**
 * API Endpoint: Apply Migration 056
 *
 * Expands dataset CHECK constraints to include HorasLancadas and TempoPermanencia
 *
 * GET /api/admin/apply-migration-056
 *
 * Response: { success: boolean, message: string, error?: string }
 */
export async function GET(req: NextRequest) {
  const adminKey = req.nextUrl.searchParams.get('key');

  // Simple auth check - in production this should be more robust
  if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 },
    );
  }

  const supabase = createServiceClient();

  const migrationSQL = `
-- ============================================================================
-- Migration 056: Expand dataset CHECK Constraints for HorasLancadas + TempoPermanencia
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
    console.log('[apply-migration-056] Starting migration...');

    // Execute migration via RPC if available
    // Since we're using service role, we have direct DB access through supabase-js

    // Test 1: Try to insert a log with HorasLancadas (will fail if constraint not updated)
    console.log('[apply-migration-056] Step 1: Testing current constraint...');
    const { error: preTestError } = await supabase
      .from('integration_log_entries')
      .insert([
        {
          tenant_id: '00000000-0000-0000-0000-000000000001',
          request_id: 'TEST-PRE-056',
          level: 'info',
          dataset: 'HorasLancadas',
          message: 'Pre-migration test',
          logged_at: new Date().toISOString(),
        },
      ]);

    if (preTestError?.message.includes('violates check constraint')) {
      console.log('[apply-migration-056] ✅ Confirmed: Constraint needs expansion');
    } else if (preTestError) {
      console.log('[apply-migration-056] Pre-test error:', preTestError.message);
    } else {
      console.log('[apply-migration-056] ⚠️  HorasLancadas already works (constraint may already be expanded)');
      // Cleanup
      await supabase
        .from('integration_log_entries')
        .delete()
        .eq('request_id', 'TEST-PRE-056');
    }

    // Execute the migration SQL
    // Since Supabase doesn't expose raw SQL execution via SDK easily,
    // we'll use the documented approach: direct PostgreSQL connection
    console.log('[apply-migration-056] Step 2: Applying migration SQL...');

    // For now, return instructions to apply manually
    // The user can run this via Supabase SQL Editor
    return NextResponse.json({
      success: false,
      message: 'Migration 056 requires manual SQL execution',
      sqlToExecute: migrationSQL,
      instructions: [
        '1. Go to Supabase SQL Editor: https://app.supabase.com/project/pybmawlwpmxshtccpqui/sql',
        '2. Create a new query',
        '3. Paste the SQL provided in "sqlToExecute" field',
        '4. Click "Run" to execute',
        '5. Then retry synchronization from /integracoes',
      ],
    });
  } catch (err) {
    console.error('[apply-migration-056] Error:', err);
    return NextResponse.json(
      {
        error: 'Failed to apply migration',
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
