'use client';

import { Heart, Clock, DollarSign, Package } from 'lucide-react';
import { useMemo } from 'react';

import { HealthIndicatorCard } from './HealthIndicatorCard';
import { KPICard } from '@/components/dashboard/KPICard';
import {
  generateProjectFinancials,
  calculatePrazoHealth,
  calculateCustoHealth,
  calculateOverallHealth,
  formatCurrency,
  getDaysUntilDeadline,
} from '@/lib/mocks/project-mocks';

interface ExecutiveSummaryProps {
  project: {
    id: string;
    espaider_code: string;
    project_name: string;
    end_date: string | null;
    responsible: string | null;
  };
  deliveries: Array<{
    completed: boolean;
  }>;
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({ project, deliveries }) => {
  const completedDeliveries = deliveries.filter((d) => d.completed).length;
  const totalDeliveries = deliveries.length;
  const completionRate =
    totalDeliveries > 0 ? Math.round((completedDeliveries / totalDeliveries) * 100) : 0;

  const financials = useMemo(() => generateProjectFinancials(project.id), [project.id]);

  const prazoHealth = calculatePrazoHealth(project.end_date, completionRate);
  const custoHealth = calculateCustoHealth(financials);
  const saudeGeral = calculateOverallHealth(prazoHealth, custoHealth);

  const daysRemaining = getDaysUntilDeadline(project.end_date);

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <HealthIndicatorCard
        title="Saude Geral"
        status={saudeGeral}
        icon={Heart}
        subtitle="Avaliacao consolidada"
      />
      <HealthIndicatorCard
        title="Prazo"
        status={prazoHealth}
        icon={Clock}
        subtitle={
          daysRemaining !== null
            ? daysRemaining >= 0
              ? `${daysRemaining} dias restantes`
              : `${Math.abs(daysRemaining)} dias em atraso`
            : 'Sem prazo definido'
        }
      />
      <HealthIndicatorCard
        title="Custo"
        status={custoHealth}
        icon={DollarSign}
        subtitle={`${formatCurrency(financials.realized)} / ${formatCurrency(financials.budgeted)}`}
      />
      <KPICard
        title="Entregas"
        value={`${completedDeliveries}/${totalDeliveries}`}
        icon={Package}
        trend={
          totalDeliveries > 0
            ? {
                value: `${completionRate}%`,
                positive: completionRate >= 60,
              }
            : undefined
        }
        subtitle="Conclusao"
        className="animate-scale-in"
      />
    </div>
  );
};
