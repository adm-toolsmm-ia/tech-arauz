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
    // Fetch daily usage data
    const { data: dailyData, error: dailyError } = await supabase
      .from('agent_usage_daily')
      .select('date, runs_total, runs_successful, cost_usd, avg_latency_ms')
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

    // Calculate aggregations
    const runs_total = dailyData?.reduce((sum, d) => sum + (d.runs_total || 0), 0) || 0;
    const runs_successful = dailyData?.reduce((sum, d) => sum + (d.runs_successful || 0), 0) || 0;
    const success_rate = runs_total > 0 ? ((runs_successful / runs_total) * 100).toFixed(1) : 0;
    const avg_latency_ms = dailyData && dailyData.length > 0
      ? Math.round(
          dailyData.reduce((sum, d) => sum + (d.avg_latency_ms || 0), 0) / dailyData.length,
        )
      : 0;
    const total_cost_usd = dailyData?.reduce((sum, d) => sum + (d.cost_usd || 0), 0) || 0;

    // Transform daily data
    const transformedDailyData = (dailyData || []).map((d) => ({
      date: d.date,
      runs: d.runs_total || 0,
      successful: d.runs_successful || 0,
      failed: (d.runs_total || 0) - (d.runs_successful || 0),
      cost_usd: d.cost_usd || 0,
      avg_latency_ms: d.avg_latency_ms || 0,
    }));

    return NextResponse.json({
      runs_total,
      success_rate: parseFloat(success_rate as unknown as string),
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
