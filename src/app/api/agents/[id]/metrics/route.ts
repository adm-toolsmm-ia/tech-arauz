export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse query params
  const url = new URL(request.url);
  const dateRange = url.searchParams.get('dateRange') || '7d';

  // Calculate date range
  const now = new Date();
  const daysMap: Record<string, number> = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
  };

  const days = daysMap[dateRange] || 7;
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  try {
    // Fetch daily usage data (schema 042/043: sessions_count, messages_count, cost_total_usd, success_rate_pct)
    const { data: dailyData, error: dailyError } = await supabase
      .from('agent_usage_daily')
      .select(
        'date, sessions_count, messages_count, cost_total_usd, avg_latency_ms, success_rate_pct',
      )
      .eq('agent_id', id)
      .gte('date', startDate)
      .order('date', { ascending: true });

    if (dailyError) {
      throw dailyError;
    }

    // Fetch deployments
    const { data: deployments, error: deploymentsError } = await supabase
      .from('agent_deployments')
      .select('id, status, deployed_at, version')
      .eq('agent_id', id)
      .order('deployed_at', { ascending: false })
      .limit(10);

    if (deploymentsError) {
      throw deploymentsError;
    }

    // Calculate aggregations (map schema columns to front-end contract)
    const sessions_total = dailyData?.reduce((sum, d) => sum + (d.sessions_count || 0), 0) || 0;
    const total_cost_usd =
      dailyData?.reduce((sum, d) => sum + Number(d.cost_total_usd || 0), 0) || 0;
    const avg_latency_ms =
      dailyData && dailyData.length > 0
        ? Math.round(
            dailyData.reduce((sum, d) => sum + Number(d.avg_latency_ms || 0), 0) / dailyData.length,
          )
        : 0;
    const success_rate_pct_avg =
      dailyData && dailyData.length > 0
        ? dailyData.reduce((sum, d) => sum + Number(d.success_rate_pct || 100), 0) /
          dailyData.length
        : 100;

    // Transform daily data for front-end (runs_total -> sessions_count, derive successful/failed from success_rate_pct)
    const transformedDailyData = (dailyData || []).map((d) => {
      const runs = d.sessions_count || 0;
      const rate = Number(d.success_rate_pct ?? 100) / 100;
      const successful = Math.round(runs * rate);
      const failed = runs - successful;
      return {
        date: d.date,
        runs,
        successful,
        failed,
        cost_usd: Number(d.cost_total_usd || 0),
        avg_latency_ms: Number(d.avg_latency_ms || 0),
      };
    });

    return NextResponse.json({
      runs_total: sessions_total,
      success_rate: Math.round(success_rate_pct_avg * 10) / 10,
      avg_latency_ms,
      total_cost_usd,
      daily_data: transformedDailyData,
      deployments: deployments || [],
    });
  } catch (error) {
    console.error('[agents/[id]/metrics/GET] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}
