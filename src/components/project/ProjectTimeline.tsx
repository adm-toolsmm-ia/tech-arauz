'use client';

import { useMemo } from 'react';
import { Calendar, Package, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface TimelineItem {
  id: string;
  type: 'schedule' | 'delivery';
  title: string;
  date: Date;
  status: 'pendente' | 'em_andamento' | 'concluido' | 'atrasado';
}

interface ProjectTimelineProps {
  schedules: Array<{
    id: string;
    description: string;
    scheduled_date: string;
    status: string;
  }>;
  deliveries: Array<{
    id: string;
    description: string;
    deadline: string;
    completed: boolean;
  }>;
}

function getScheduleStatus(status: string, date: Date): TimelineItem['status'] {
  if (status === 'Concluido' || status === 'concluido') return 'concluido';
  if (status === 'Em Andamento' || status === 'em_andamento') return 'em_andamento';
  if (date < new Date()) return 'atrasado';
  return 'pendente';
}

function getDeliveryStatus(completed: boolean, deadline: Date): TimelineItem['status'] {
  if (completed) return 'concluido';
  if (deadline < new Date()) return 'atrasado';
  return 'pendente';
}

const statusConfig = {
  pendente: {
    icon: Clock,
    color: 'text-muted-foreground',
    bg: 'bg-muted',
    badge: 'secondary',
    label: 'Pendente',
  },
  em_andamento: {
    icon: Clock,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    badge: 'default',
    label: 'Em Andamento',
  },
  concluido: {
    icon: CheckCircle2,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900/30',
    badge: 'outline',
    badgeClass: 'border-green-500 text-green-600 dark:text-green-400',
    label: 'Concluido',
  },
  atrasado: {
    icon: AlertCircle,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/30',
    badge: 'destructive',
    label: 'Atrasado',
  },
} as const;

function TimelineItemCard({ item, index }: { item: TimelineItem; index: number }) {
  const config = statusConfig[item.status];
  const Icon = config.icon;
  const TypeIcon = item.type === 'schedule' ? Calendar : Package;

  return (
    <div
      className="relative flex animate-slide-in-left gap-4 pb-8 last:pb-0"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Timeline line */}
      <div className="absolute bottom-0 left-[15px] top-8 w-0.5 bg-border last:hidden" />

      {/* Icon */}
      <div
        className={cn(
          'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-background',
          config.bg,
        )}
      >
        <Icon className={cn('size-4', config.color)} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <TypeIcon className="size-4 text-muted-foreground" />
            <span className="truncate text-sm font-medium">{item.title}</span>
          </div>
          <Badge
            variant={config.badge as 'default' | 'secondary' | 'destructive' | 'outline'}
            className={cn('shrink-0 text-xs', 'badgeClass' in config && config.badgeClass)}
          >
            {config.label}
          </Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {item.date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </p>
      </div>
    </div>
  );
}

export function ProjectTimeline({ schedules, deliveries }: ProjectTimelineProps) {
  const timelineItems = useMemo(() => {
    const items: TimelineItem[] = [
      ...schedules.map((s) => ({
        id: s.id,
        type: 'schedule' as const,
        title: s.description || 'Atividade sem descricao',
        date: new Date(s.scheduled_date),
        status: getScheduleStatus(s.status, new Date(s.scheduled_date)),
      })),
      ...deliveries.map((d) => ({
        id: d.id,
        type: 'delivery' as const,
        title: d.description || 'Entrega sem descricao',
        date: new Date(d.deadline),
        status: getDeliveryStatus(d.completed, new Date(d.deadline)),
      })),
    ];

    return items.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [schedules, deliveries]);

  if (timelineItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Calendar className="mb-4 size-12 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">Nenhum cronograma ou entrega cadastrado</p>
      </div>
    );
  }

  return (
    <div className="relative py-4">
      {timelineItems.map((item, index) => (
        <TimelineItemCard key={item.id} item={item} index={index} />
      ))}
    </div>
  );
}
