'use client';

import { CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface Trace {
  id: string;
  agent_id: string;
  agent_name: string;
  status: string;
  input_preview: string;
  output_preview: string | null;
  started_at: string;
  completed_at: string | null;
  duration_ms: number | null;
  cost_usd: number;
  tokens_used: number;
  steps: Array<{ name: string; duration_ms: number; status: string }>;
  trace_url: string | null;
}

interface TraceListProps {
  traces: Trace[];
  onTraceClick?: (trace: Trace) => void;
  className?: string;
}

const statusConfig: Record<string, { icon: typeof CheckCircle; label: string; className: string }> =
  {
    completed: {
      icon: CheckCircle,
      label: 'Concluído',
      className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    },
    failed: {
      icon: XCircle,
      label: 'Falhou',
      className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    },
    running: {
      icon: Clock,
      label: 'Executando',
      className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    },
  };

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const TraceList: React.FC<TraceListProps> = ({ traces, onTraceClick, className }) => {
  if (traces.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        Nenhuma execução encontrada.
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {traces.map((trace, idx) => {
        const config = statusConfig[trace.status] || statusConfig.completed;
        const Icon = config.icon;

        return (
          <Card
            key={trace.id}
            className={cn(
              'cursor-pointer transition-all hover:border-primary/30 hover:shadow-sm',
              'animate-fade-in',
            )}
            style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'both' }}
            onClick={() => onTraceClick?.(trace)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Icon
                      className={cn(
                        'h-4 w-4',
                        trace.status === 'completed'
                          ? 'text-green-500'
                          : trace.status === 'failed'
                            ? 'text-red-500'
                            : 'text-blue-500',
                      )}
                    />
                    <p className="line-clamp-1 text-sm font-medium">{trace.input_preview}</p>
                  </div>
                  {trace.output_preview && (
                    <p className="line-clamp-1 pl-6 text-xs text-muted-foreground">
                      {trace.output_preview}
                    </p>
                  )}
                  <div className="flex items-center gap-3 pl-6 text-xs text-muted-foreground">
                    <span>{trace.agent_name}</span>
                    <span>{formatDate(trace.started_at)}</span>
                    {trace.duration_ms && <span>{(trace.duration_ms / 1000).toFixed(1)}s</span>}
                    <span>{trace.tokens_used} tokens</span>
                    <span>${trace.cost_usd.toFixed(4)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
                      config.className,
                    )}
                  >
                    {config.label}
                  </span>
                  {trace.trace_url && (
                    <a
                      href={trace.trace_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-muted-foreground transition-colors hover:text-primary"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
