'use client';

import { DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface BudgetGaugeProps {
  spentUsd: number;
  limitUsd: number;
  usagePercentage: number;
  className?: string;
}

function getGaugeColor(percentage: number): string {
  if (percentage < 50) return 'text-green-500';
  if (percentage < 75) return 'text-amber-500';
  return 'text-red-500';
}

function getGaugeBg(percentage: number): string {
  if (percentage < 50) return 'bg-green-500';
  if (percentage < 75) return 'bg-amber-500';
  return 'bg-red-500';
}

export const BudgetGauge: React.FC<BudgetGaugeProps> = ({ spentUsd, limitUsd, usagePercentage, className }) => {
  const clampedPercentage = Math.min(usagePercentage, 100);
  const color = getGaugeColor(clampedPercentage);
  const bg = getGaugeBg(clampedPercentage);

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <DollarSign className="h-4 w-4" />
          Budget de IA
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Progress bar */}
        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <p className={cn('text-2xl font-bold', color)}>${spentUsd.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">de ${limitUsd.toFixed(2)} mensal</p>
            </div>
            <p className={cn('text-lg font-semibold', color)}>{clampedPercentage.toFixed(0)}%</p>
          </div>

          {/* Bar */}
          <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn('h-full rounded-full transition-all duration-700 ease-out', bg)}
              style={{ width: `${clampedPercentage}%` }}
            />
          </div>

          {/* Remaining */}
          <p className="text-right text-xs text-muted-foreground">
            Restante: ${(limitUsd - spentUsd).toFixed(2)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
