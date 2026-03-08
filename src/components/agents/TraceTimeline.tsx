'use client';

import { CheckCircle, XCircle, SkipForward, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TraceStep {
  name: string;
  duration_ms: number;
  status: string;
}

interface TraceTimelineProps {
  steps: TraceStep[];
  className?: string;
}

const stepStatusConfig: Record<string, { icon: typeof CheckCircle; color: string }> = {
  completed: { icon: CheckCircle, color: 'text-green-500' },
  failed: { icon: XCircle, color: 'text-red-500' },
  skipped: { icon: SkipForward, color: 'text-gray-400' },
  running: { icon: Clock, color: 'text-blue-500 animate-pulse' },
};

const stepLabels: Record<string, string> = {
  parse_input: 'Processar Entrada',
  retrieve_context: 'Buscar Contexto',
  llm_call: 'Chamada LLM',
  format_output: 'Formatar Saída',
};

export const TraceTimeline: React.FC<TraceTimelineProps> = ({ steps, className }) => {
  return (
    <div className={cn('space-y-0', className)}>
      {steps.map((step, idx) => {
        const config = stepStatusConfig[step.status] || stepStatusConfig.completed;
        const Icon = config.icon;
        const isLast = idx === steps.length - 1;

        return (
          <div
            key={`${step.name}-${idx}`}
            className="animate-fade-in flex items-start gap-3"
            style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'both' }}
          >
            {/* Timeline connector */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 bg-background',
                  config.color === 'text-green-500'
                    ? 'border-green-500'
                    : config.color === 'text-red-500'
                      ? 'border-red-500'
                      : config.color === 'animate-pulse text-blue-500'
                        ? 'border-blue-500'
                        : 'border-gray-300',
                )}
              >
                <Icon className={cn('h-3.5 w-3.5', config.color)} />
              </div>
              {!isLast && <div className="h-8 w-0.5 bg-border" />}
            </div>

            {/* Content */}
            <div className="flex-1 pb-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{stepLabels[step.name] || step.name}</p>
                <span className="text-xs text-muted-foreground">{step.duration_ms}ms</span>
              </div>
              <p className="text-xs capitalize text-muted-foreground">
                {step.status === 'completed'
                  ? 'Concluído'
                  : step.status === 'failed'
                    ? 'Falhou'
                    : step.status === 'skipped'
                      ? 'Ignorado'
                      : 'Executando'}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
