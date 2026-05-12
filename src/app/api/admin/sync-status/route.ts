export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

/**
 * API Endpoint: Get last sync logs with errors
 *
 * GET /api/admin/sync-status?limit=50&errorOnly=true
 *
 * Response: Last sync logs for debugging
 */
export async function GET(req: NextRequest) {
  const supabase = createServiceClient();
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '100', 10);
  const errorOnly = req.nextUrl.searchParams.get('errorOnly') === 'true';
  const dataset = req.nextUrl.searchParams.get('dataset');

  try {
    let query = supabase
      .from('integration_log_entries')
      .select('*')
      .order('logged_at', { ascending: false })
      .limit(limit);

    if (errorOnly) {
      query = query.eq('level', 'error');
    }

    if (dataset) {
      query = query.eq('dataset', dataset);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      total: data?.length || 0,
      logs: data || [],
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
