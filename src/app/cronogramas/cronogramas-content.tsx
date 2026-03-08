'use client';

import * as React from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { useCronogramasFilters, CronogramaData } from '@/hooks/useCronogramasFilters';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ErpReadOnlyBanner } from '@/components/shared/erp-readonly-banner';
import { feedback } from '@/lib/feedback';
import { syncEspaiderAction } from '@/app/actions/sync';
import type { KpiFilterName } from '@/lib/domain/schedule-kpi';
import { filterByKpi } from '@/lib/domain/schedule-kpi';
import { isWithinRange, isSameDay, filterSchedulesByPeriod } from '@/lib/domain/schedule-status';

import { PeriodNavigationBar } from '@/components/cronogramas/PeriodNavigationBar';
import { CronogramasKPIBar } from './components/CronogramasKPIBar';
import { CronogramaFilters } from './components/CronogramaFilters';
import { CronogramaCalendar } from './components/CronogramaCalendar';
import { CronogramaKanbanView } from './components/CronogramaKanbanView';
import { CronogramaTableView } from './components/CronogramaTableView';
import { CronogramaCockpit, SelectedDayPanel } from './components/CronogramaCockpit';

// ---------- Types ----------

type Schedule = CronogramaData;

interface CronogramasContentProps {
  schedules: Schedule[];
}

// ---------- Main Orchestrator ----------

export function CronogramasContent({ schedules }: CronogramasContentProps) {
  const {
    filters,
    search,
    viewMode,
    calendarPeriod,
    filteredData,
    updateFilter,
    setSearch,
    setViewMode,
    setCalendarPeriod,
    resetAllFilters,
    registry,
  } = useCronogramasFilters(schedules);

  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [selectedDay, setSelectedDay] = React.useState<Date | null>(null);
  const [selectedSchedule, setSelectedSchedule] = React.useState<Schedule | null>(null);
  const [activeKpiFilter, setActiveKpiFilter] = React.useState<KpiFilterName | null>(null);
  const [isSyncing, setIsSyncing] = React.useState(false);

  // Unique project IDs for consistent coloring
  const projectIds = React.useMemo(() => {
    const ids = Array.from(new Set(filteredData.map((s) => s.project_id)));
    return ids.sort();
  }, [filteredData]);

  // Apply KPI filter on top of filtered data
  const finalFilteredSchedules = React.useMemo(
    () => filterByKpi(filteredData, activeKpiFilter),
    [filteredData, activeKpiFilter],
  );

  // Apply period filter for Kanban and Lista (Dia/Semana/Mês)
  const periodFilteredSchedules = React.useMemo(
    () =>
      viewMode === 'kanban' || viewMode === 'lista'
        ? filterSchedulesByPeriod(
            finalFilteredSchedules,
            currentDate,
            calendarPeriod as 'day' | 'week' | 'month',
          )
        : finalFilteredSchedules,
    [viewMode, finalFilteredSchedules, currentDate, calendarPeriod],
  );

  const handleKpiClick = (filterName: KpiFilterName) => {
    setActiveKpiFilter((prev) => (prev === filterName ? null : filterName));
  };

  const handleSync = async () => {
    setIsSyncing(true);
    feedback.info('Iniciando sincronização com Espaider...');
    try {
      const result = await syncEspaiderAction();
      if (result.success) {
        feedback.success(result.message);
      } else {
        feedback.error(result.message);
      }
    } catch {
      feedback.error('Erro inesperado na sincronização. Tente novamente.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Navigation
  const navigateMonth = (direction: number) => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + direction);
    setCurrentDate(d);
    setSelectedDay(null);
  };

  const navigateWeek = (direction: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + direction * 7);
    setCurrentDate(d);
    setSelectedDay(null);
  };

  const navigateDay = (direction: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + direction);
    setCurrentDate(d);
    setSelectedDay(null);
  };

  const onNavigatePeriod = (direction: number) => {
    if (calendarPeriod === 'day') navigateDay(direction);
    else if (calendarPeriod === 'week') navigateWeek(direction);
    else navigateMonth(direction);
  };

  // Get schedules for a specific date
  const getSchedulesForDate = React.useCallback(
    (date: Date): Schedule[] => {
      return finalFilteredSchedules.filter((s) => {
        const start = s.data_inicio ? new Date(s.data_inicio) : null;
        const end = s.data_fim ? new Date(s.data_fim) : null;
        if (start && end) return isWithinRange(date, start, end);
        if (start) return isSameDay(date, start);
        if (end) return isSameDay(date, end);
        return false;
      });
    },
    [finalFilteredSchedules],
  );

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex w-full min-w-0 max-w-full flex-col overflow-hidden">
        <DashboardHeader title="Cronogramas" subtitle="Atividades importadas do ERP Espaider" />

        <div className="px-6 pt-4">
          <ErpReadOnlyBanner variant="page" />
        </div>

        <div className="flex-1 space-y-6 p-6">
          {/* KPIs — now BEFORE filters */}
          <ErrorBoundary label="KPIs Cronogramas">
            <CronogramasKPIBar
              schedules={schedules}
              activeKpiFilter={activeKpiFilter}
              onKpiClick={handleKpiClick}
            />
          </ErrorBoundary>

          {/* Filters — now AFTER KPIs */}
          <CronogramaFilters
            registry={registry}
            filters={filters}
            search={search}
            viewMode={viewMode}
            calendarPeriod={calendarPeriod}
            isSyncing={isSyncing}
            onUpdateFilter={updateFilter}
            onResetFilters={() => {
              resetAllFilters();
              setSearch('');
            }}
            onSearchChange={setSearch}
            onViewModeChange={setViewMode}
            onCalendarPeriodChange={(period) =>
              setCalendarPeriod(period as 'day' | 'week' | 'month')
            }
            onSync={handleSync}
          />

          {/* Content Views */}

          {/* Calendar Views (Agenda mode) */}
          {viewMode === 'agenda' && (
            <ErrorBoundary label="Calendario Cronogramas">
              <CronogramaCalendar
                currentDate={currentDate}
                selectedDay={selectedDay}
                calendarPeriod={calendarPeriod as 'day' | 'week' | 'month'}
                projectIds={projectIds}
                getSchedulesForDate={getSchedulesForDate}
                onSelectDay={setSelectedDay}
                onNavigateMonth={navigateMonth}
                onNavigateWeek={navigateWeek}
                onNavigateDay={navigateDay}
                onActivityClick={setSelectedSchedule}
              />
            </ErrorBoundary>
          )}

          {/* Selected Day Activities */}
          {selectedDay &&
            viewMode === 'agenda' &&
            (calendarPeriod === 'month' || calendarPeriod === 'week') && (
              <SelectedDayPanel
                date={selectedDay}
                schedules={getSchedulesForDate(selectedDay)}
                projectIds={projectIds}
                onActivityClick={setSelectedSchedule}
              />
            )}

          {/* Kanban View (read-only) */}
          {viewMode === 'kanban' && (
            <ErrorBoundary label="Kanban Cronogramas">
              <div className="space-y-4">
                <PeriodNavigationBar
                  currentDate={currentDate}
                  period={calendarPeriod as 'day' | 'week' | 'month'}
                  onNavigate={onNavigatePeriod}
                />
                <CronogramaKanbanView
                  schedules={periodFilteredSchedules}
                  projectIds={projectIds}
                  onActivityClick={setSelectedSchedule}
                />
              </div>
            </ErrorBoundary>
          )}

          {/* Table View (Lista) */}
          {viewMode === 'lista' && (
            <ErrorBoundary label="Tabela Cronogramas">
              <div className="space-y-4">
                <PeriodNavigationBar
                  currentDate={currentDate}
                  period={calendarPeriod as 'day' | 'week' | 'month'}
                  onNavigate={onNavigatePeriod}
                />
                <CronogramaTableView
                  schedules={periodFilteredSchedules}
                  onActivityClick={setSelectedSchedule}
                />
              </div>
            </ErrorBoundary>
          )}

          {/* Schedule Detail (SplitView) */}
          <CronogramaCockpit
            selectedSchedule={selectedSchedule}
            allSchedules={schedules}
            onClose={() => setSelectedSchedule(null)}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
