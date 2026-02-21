'use client';

import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { HealthStatus } from '@/lib/mocks/project-mocks';

interface HealthIndicatorCardProps {
  title: string;
  status: HealthStatus;
  icon: LucideIcon;
  subtitle?: string;
  className?: string;
}

const statusConfig = {
  verde: {
    bg: 'bg-green-50 dark:bg-green-950/30',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-700 dark:text-green-400',
    dot: 'bg-green-500',
    label: 'Saudavel',
  },
  amarelo: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500',
    label: 'Atencao',
  },
  vermelho: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-700 dark:text-red-400',
    dot: 'bg-red-500',
    label: 'Critico',
  },
};

export function HealthIndicatorCard({
  title,
  status,
  icon: Icon,
  subtitle,
  className,
}: HealthIndicatorCardProps) {
  const config = statusConfig[status];

  return (
    <Card
      className={cn(
        'animate-scale-in transition-all duration-300 hover:shadow-card-hover',
        config.bg,
        config.border,
        className,
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex size-10 items-center justify-center rounded-lg',
                config.bg,
                config.text,
              )}
            >
              <Icon className="size-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className={cn('animate-pulse-soft size-2.5 rounded-full', config.dot)} />
                <span className={cn('text-sm font-semibold', config.text)}>{config.label}</span>
              </div>
            </div>
          </div>
        </div>
        {subtitle && <p className="mt-2 text-xs text-muted-foreground">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}
