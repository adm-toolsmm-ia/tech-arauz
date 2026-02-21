'use client';

import { Bot, Activity, Clock, DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface Agent {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  version: string;
  created_at: string;
  last_run: string | null;
  total_runs: number;
  success_rate: number;
  avg_latency_ms: number;
  total_cost_usd: number;
}

interface AgentCardProps {
  agent: Agent;
  onClick?: (agent: Agent) => void;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  active: {
    label: 'Ativo',
    className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  },
  inactive: {
    label: 'Inativo',
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
  },
  development: {
    label: 'Em Desenvolvimento',
    className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  },
  deprecated: {
    label: 'Descontinuado',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  },
};

const typeConfig: Record<string, { label: string; className: string }> = {
  automation: {
    label: 'Automação',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  },
  analysis: {
    label: 'Análise',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  },
  integration: {
    label: 'Integração',
    className: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  },
  assistant: {
    label: 'Assistente',
    className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  },
};

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return 'Nunca executado';
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}min atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  return `${days}d atrás`;
}

export function AgentCard({ agent, onClick }: AgentCardProps) {
  const status = statusConfig[agent.status] || statusConfig.inactive;
  const type = typeConfig[agent.type] || typeConfig.assistant;

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:border-primary/50 hover:shadow-md',
        'active:scale-[0.99]',
      )}
      onClick={() => onClick?.(agent)}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{agent.name}</h3>
                <span className="text-xs text-muted-foreground">v{agent.version}</span>
              </div>
              <p className="line-clamp-2 text-sm text-muted-foreground">{agent.description}</p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
                status.className,
              )}
            >
              {status.label}
            </span>
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
                type.className,
              )}
            >
              {type.label}
            </span>
          </div>
        </div>

        {/* Metrics row */}
        <div className="mt-4 grid grid-cols-4 gap-3 border-t pt-3">
          <div className="flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Execuções</p>
              <p className="text-sm font-medium">{agent.total_runs}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Sucesso</p>
              <p className="text-sm font-medium">{agent.success_rate}%</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Latência</p>
              <p className="text-sm font-medium">{(agent.avg_latency_ms / 1000).toFixed(1)}s</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Custo</p>
              <p className="text-sm font-medium">${agent.total_cost_usd.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Last run */}
        <div className="mt-2 text-xs text-muted-foreground">
          Última execução: {formatRelativeTime(agent.last_run)}
        </div>
      </CardContent>
    </Card>
  );
}
