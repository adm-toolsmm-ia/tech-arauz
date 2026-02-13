import * as React from 'react';
import { type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  subtitle?: string;
  className?: string;
  onClick?: () => void;
  active?: boolean;
}

export function KPICard({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
  className,
  onClick,
  active,
}: KPICardProps) {
  return (
    <Card
      className={cn(
        'shadow-soft hover:shadow-card-hover transition-all duration-300',
        'hover:-translate-y-0.5 animate-scale-in',
        onClick && 'cursor-pointer',
        active && 'ring-2 ring-primary ring-offset-2',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight">{value}</span>
              {trend && (
                <span
                  className={cn(
                    'text-sm font-medium',
                    trend.positive ? 'text-success' : 'text-destructive'
                  )}
                >
                  {trend.positive ? '+' : ''}
                  {trend.value}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className={cn(
            'rounded-lg p-3',
            active ? 'bg-primary/20' : 'bg-primary/10'
          )}>
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
