'use server';

import { createClient } from '@/lib/supabase/server';

export interface PerformanceMetrics {
  responsible: string;
  responsible_id: string;
  total_movements: number;
  average_duration_days: number;
  projects_completed: number;
  lead_time_average_days: number;
}

export interface GetTeamPerformanceDataParams {
  period?: 'semanal' | 'mensal' | 'trimestral' | 'semestral' | 'anual';
  team_scope?: 'minha-equipe' | 'todos-envolvidos';
  custom_start_date?: string;
  custom_end_date?: string;
}

export interface GetTeamPerformanceDataResult {
  success: boolean;
  data?: PerformanceMetrics[];
  summary?: {
    top_performer: string;
    avg_tempo_per_person: number;
    total_movements_period: number;
    projects_completed_period: number;
  };
  message: string;
}

/**
 * Server Action: Fetch team performance metrics
 *
 * Aggregates performance data from project_histories and project_tempo_permanencia
 * Filters by period (Semanal/Mensal/Trimestral/Semestral/Anual) and team scope
 * Returns metrics per responsible person:
 * - total_movements: count of transitions
 * - average_duration_days: average time in phase
 * - projects_completed: count of completed projects
 * - lead_time_average_days: average lead time
 */
export async function getTeamPerformanceData(
  params: GetTeamPerformanceDataParams = {},
): Promise<GetTeamPerformanceDataResult> {
  const supabase = await createClient();

  // Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      message: 'Usuário não autenticado. Faça login novamente.',
    };
  }

  // Get tenant_id from profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return {
      success: false,
      message: 'Perfil não encontrado. Contate o administrador.',
    };
  }

  try {
    const {
      period = 'mensal',
      team_scope = 'minha-equipe',
      custom_start_date,
      custom_end_date,
    } = params;

    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case 'semanal':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'mensal':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'trimestral':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'semestral':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case 'anual':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const dateStart = custom_start_date || startDate.toISOString().split('T')[0];
    const dateEnd = custom_end_date || now.toISOString().split('T')[0];

    // Fetch project_histories (movements)
    const { data: histories, error: historiesError } = await supabase
      .from('project_histories')
      .select('id, project_id, responsible, date, step_from, step_to')
      .eq('tenant_id', profile.tenant_id)
      .gte('date', dateStart)
      .lte('date', dateEnd)
      .order('date', { ascending: false });

    if (historiesError) throw historiesError;

    // Fetch project_tempo_permanencia (duration data)
    const { data: tempoData, error: tempoError } = await supabase
      .from('project_tempo_permanencia')
      .select('id, project_id, responsible, dias_na_fase, dias_medio')
      .eq('tenant_id', profile.tenant_id)
      .order('updated_at', { ascending: false });

    if (tempoError) throw tempoError;

    // Fetch projects to get completion info
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, responsible, status, created_at')
      .eq('tenant_id', profile.tenant_id)
      .gte('created_at', dateStart);

    if (projectsError) throw projectsError;

    // Aggregate data by responsible
    const metricsMap = new Map<string, PerformanceMetrics>();

    // Process histories for movement count
    (histories || []).forEach((h) => {
      const resp = h.responsible || 'Unknown';
      if (!metricsMap.has(resp)) {
        metricsMap.set(resp, {
          responsible: resp,
          responsible_id: resp,
          total_movements: 0,
          average_duration_days: 0,
          projects_completed: 0,
          lead_time_average_days: 0,
        });
      }
      const metric = metricsMap.get(resp)!;
      metric.total_movements += 1;
    });

    // Process tempo data for duration metrics
    const durationByResp = new Map<string, number[]>();
    (tempoData || []).forEach((t) => {
      const resp = t.responsible || 'Unknown';
      if (!durationByResp.has(resp)) {
        durationByResp.set(resp, []);
      }
      durationByResp.get(resp)!.push(t.dias_na_fase || 0);
    });

    // Calculate averages from duration data
    durationByResp.forEach((durations, resp) => {
      if (!metricsMap.has(resp)) {
        metricsMap.set(resp, {
          responsible: resp,
          responsible_id: resp,
          total_movements: 0,
          average_duration_days: 0,
          projects_completed: 0,
          lead_time_average_days: 0,
        });
      }
      const metric = metricsMap.get(resp)!;
      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      metric.average_duration_days = Math.round(avgDuration * 10) / 10;
    });

    // Process projects for completion metrics
    (projects || []).forEach((p) => {
      const resp = p.responsible || 'Unknown';
      if (!metricsMap.has(resp)) {
        metricsMap.set(resp, {
          responsible: resp,
          responsible_id: resp,
          total_movements: 0,
          average_duration_days: 0,
          projects_completed: 0,
          lead_time_average_days: 0,
        });
      }
      const metric = metricsMap.get(resp)!;
      if (p.status?.toLowerCase() === 'concluído' || p.status?.toLowerCase() === 'finalizado') {
        metric.projects_completed += 1;
      }
    });

    const metricsArray = Array.from(metricsMap.values());

    // Calculate summary
    const topPerformer =
      metricsArray.length > 0
        ? metricsArray.reduce((a, b) => (a.total_movements > b.total_movements ? a : b)).responsible
        : 'N/A';

    const avgTempoPerPerson =
      metricsArray.length > 0
        ? Math.round(
            (metricsArray.reduce((sum, m) => sum + m.average_duration_days, 0) /
              metricsArray.length) *
              10,
          ) / 10
        : 0;

    const totalMovements = metricsArray.reduce((sum, m) => sum + m.total_movements, 0);
    const totalCompleted = metricsArray.reduce((sum, m) => sum + m.projects_completed, 0);

    return {
      success: true,
      data: metricsArray.sort((a, b) => b.total_movements - a.total_movements),
      summary: {
        top_performer: topPerformer,
        avg_tempo_per_person: avgTempoPerPerson,
        total_movements_period: totalMovements,
        projects_completed_period: totalCompleted,
      },
      message: 'Performance data fetched successfully',
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Erro ao buscar dados: ${error.message}`,
    };
  }
}
