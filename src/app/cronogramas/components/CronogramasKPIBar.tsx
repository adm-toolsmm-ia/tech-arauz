'use client';

import * as React from 'react';
import { CalendarDays, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { KPICard } from '@/components/dashboard/KPICard';
import type { Schedule } from '@/lib/domain/schedule-status';
import type { KpiFilterName } from '@/lib/domain/schedule-kpi';
import {
  countPendingSchedules,
  countInExecutionSchedules,
  getOverdueSchedulesInfo,
  countNearDeadlineSchedules,
  countMissingDeadlineSchedules,
} from '@/lib/domain/schedule-kpi';

interface CronogramasKPIBarProps {
  schedules: Schedule[];
  activeKpiFilter: KpiFilterName | null;
  onKpiClick: (filterName: KpiFilterName) => void;
}

export function CronogramasKPIBar({
  schedules,
  activeKpiFilter,
  onKpiClick,
}: CronogramasKPIBarProps) {
  const pendingCount = React.useMemo(() => countPendingSchedules(schedules), [schedules]);
  const inExecutionCount = React.useMemo(() => countInExecutionSchedules(schedules), [schedules]);
  const overdueInfo = React.useMemo(() => getOverdueSchedulesInfo(schedules), [schedules]);
  const nearDeadlineCount = React.useMemo(() => countNearDeadlineSchedules(schedules), [schedules]);
  const missingDeadlineCount = React.useMemo(
    () => countMissingDeadlineSchedules(schedules),
    [schedules],
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <KPICard
        title="Atividades Pendentes"
        value={pendingCount}
        icon={CalendarDays}
        subtitle="Vinculados a proj. ativos"
        active={activeKpiFilter === 'pendentes'}
        onClick={() => onKpiClick('pendentes')}
      />
      <KPICard
        title="Em Execução"
        value={inExecutionCount}
        icon={Clock}
        subtitle="Operação ativa em campo"
        active={activeKpiFilter === 'em_execucao'}
        onClick={() => onKpiClick('em_execucao')}
      />
      <KPICard
        title="Atrasadas"
        value={overdueInfo.count}
        icon={AlertTriangle}
        className={
          overdueInfo.count > 0 ? '[&_[class*=bg-primary]]:bg-red-500/10 [&_svg]:text-red-500' : ''
        }
        subtitle={
          overdueInfo.count > 0
            ? `Maior atraso: ${overdueInfo.maxDays} dias`
            : 'Nenhuma atividade atrasada'
        }
        active={activeKpiFilter === 'atrasados'}
        onClick={() => onKpiClick('atrasados')}
      />
      <KPICard
        title="Próximas do Prazo"
        value={nearDeadlineCount}
        icon={CheckCircle2}
        subtitle="Vencimentos em ≤ 7 dias"
        active={activeKpiFilter === 'proximos_vencer'}
        onClick={() => onKpiClick('proximos_vencer')}
      />
      <KPICard
        title="Data Ausente"
        value={missingDeadlineCount}
        icon={AlertTriangle}
        className={
          missingDeadlineCount > 0
            ? '[&_[class*=bg-primary]]:bg-amber-500/10 [&_svg]:text-amber-500'
            : ''
        }
        subtitle="Necessitam preencher prazo"
        active={activeKpiFilter === 'sem_prazo'}
        onClick={() => onKpiClick('sem_prazo')}
      />
    </div>
  );
}
