import { useEffect, useState } from 'react';
import {
  getTeamPerformanceData,
  type GetTeamPerformanceDataParams,
  type PerformanceMetrics,
} from '@/app/dashboard/operacoes/actions';

interface UsePerformanceDataResult {
  data: PerformanceMetrics[];
  summary: {
    top_performer: string;
    avg_tempo_per_person: number;
    total_movements_period: number;
    projects_completed_period: number;
  } | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook: usePerformanceData
 *
 * Fetches team performance metrics based on period and team scope
 * Handles loading, error states, and data caching
 *
 * Usage:
 * const { data, summary, loading, error } = usePerformanceData({
 *   period: 'mensal',
 *   team_scope: 'minha-equipe'
 * })
 */
export function usePerformanceData(
  params: GetTeamPerformanceDataParams = {},
): UsePerformanceDataResult {
  const [data, setData] = useState<PerformanceMetrics[]>([]);
  const [summary, setSummary] = useState<{
    top_performer: string;
    avg_tempo_per_person: number;
    total_movements_period: number;
    projects_completed_period: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getTeamPerformanceData(params);

        if (isMounted) {
          if (result.success && result.data) {
            setData(result.data);
            setSummary(result.summary || null);
          } else {
            setError(result.message);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [params.period, params.team_scope, params.custom_start_date, params.custom_end_date]);

  return { data, summary, loading, error };
}
