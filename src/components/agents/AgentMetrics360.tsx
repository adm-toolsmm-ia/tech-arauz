'use client';

import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle, Zap, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { KPICard } from '@/components/dashboard/KPICard';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

interface MetricsResponse {
  runs_total: number;
  success_rate: number;
  avg_latency_ms: number;
  total_cost_usd: number;
  daily_data: Array<{
    date: string;
    runs: number;
    successful: number;
    failed: number;
    cost_usd: number;
    avg_latency_ms: number;
  }>;
  deployments: Array<{
    id: string;
    status: string;
    deployed_at: string;
    version: string;
  }>;
}

interface AgentMetrics360Props {
  agentId: string;
}

export function AgentMetrics360({ agentId }: AgentMetrics360Props) {
  const [selectedDateRange, setSelectedDateRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [data, setData] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/agents/${agentId}/metrics?dateRange=${selectedDateRange}`,
        );

        if (!response.ok) {
          throw new Error('Failed to fetch metrics');
        }

        const metricsData = await response.json();
        setData(metricsData);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        toast.error(`Error loading metrics: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [agentId, selectedDateRange]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}`;
  };

  const chartData =
    data?.daily_data.map((d) => ({
      ...d,
      date: formatDate(d.date),
    })) || [];

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-destructive">Erro ao carregar métricas</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex justify-end gap-2">
        {(['7d', '30d', '90d'] as const).map((range) => (
          <Button
            key={range}
            variant={selectedDateRange === range ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedDateRange(range)}
            disabled={loading}
          >
            {range}
          </Button>
        ))}
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {loading ? (
          <>
            <Skeleton className="h-24" data-testid="skeleton-kpi" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </>
        ) : (
          <>
            <KPICard
              title="Sessões"
              value={data?.runs_total || 0}
              icon={Activity}
              subtitle="chat sessions"
            />
            <KPICard
              title="Success Rate"
              value={`${(data?.success_rate || 0).toFixed(1)}%`}
              icon={CheckCircle}
              subtitle="sucesso"
            />
            <KPICard
              title="Avg Latency"
              value={data?.avg_latency_ms || 0}
              icon={Zap}
              subtitle="ms"
            />
            <KPICard
              title="Total Cost"
              value={`$${(data?.total_cost_usd || 0).toFixed(2)}`}
              icon={DollarSign}
              subtitle="USD"
            />
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Sessions Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Sessões por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-80" />
            ) : chartData.length === 0 ? (
              <div className="flex h-80 items-center justify-center text-sm text-muted-foreground">
                Nenhum dado no período selecionado
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="successful" fill="#22c55e" name="Sucesso" />
                  <Bar dataKey="failed" fill="#ef4444" name="Falha" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Placeholder for Budget Gauge (can be integrated later) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Informações</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Período</p>
                <p className="text-sm font-medium">
                  {selectedDateRange === '7d' && 'Últimos 7 dias'}
                  {selectedDateRange === '30d' && 'Últimos 30 dias'}
                  {selectedDateRange === '90d' && 'Últimos 90 dias'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Deployments</p>
                <p className="text-sm font-medium">{data?.deployments?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Over Time Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Custo ao Longo do Tempo</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-80" />
          ) : chartData.length === 0 ? (
            <div className="flex h-80 items-center justify-center text-sm text-muted-foreground">
              Nenhum dado no período selecionado
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="cost_usd"
                  stroke="#22c55e"
                  fillOpacity={1}
                  fill="url(#colorCost)"
                  name="Custo (USD)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
