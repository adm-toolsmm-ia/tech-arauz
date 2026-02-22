import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Star,
  AlertTriangle,
  Clock,
  Building2,
  User,
  Calendar,
  GitBranch,
} from 'lucide-react';
import {
  statusStyles,
  statusLabels,
  resolvePhaseLabel,
} from '@/lib/constants/phase-labels';
import {
  PROJECT_BAR_COLORS,
  getProjectColorIndex,
} from '@/lib/constants/project-colors';
import { isOverdue, isWithin7Days, formatDateBR } from '@/lib/utils/date-helpers';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ProjectCardData {
  id: string;
  espaider_code: string;
  project_name: string;
  status: string;
  area?: string | null;
  responsible: string | null;
  end_date: string | null;
  fase_atual?: string | null;
  prazo_aprovador?: string | null;
  prazo_cronograma?: string | null;
  objetivo?: string | null;
  justificativa?: string | null;
  importancia_especial?: boolean | null;
  complexidade_tecnica?: string | null;
}

interface ProjectKanbanCardProps {
  project: ProjectCardData;
  projectIds: string[];
}

function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * Componente auxiliar: trunca texto e oferece tooltip com conteúdo completo.
 * Accessible text truncation with fallback tooltip.
 */
function TextWithTooltip({
  text,
  className,
  maxLength = 30,
}: {
  text?: string | null;
  className?: string;
  maxLength?: number;
}) {
  if (!text) return <span className={className}>-</span>;

  const isTruncated = text.length > maxLength;
  const displayText = isTruncated ? `${text.substring(0, maxLength)}…` : text;

  if (isTruncated) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={cn('cursor-help', className)} title={text}>
              {displayText}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs break-words">
            {text}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return <span className={className}>{displayText}</span>;
}

function ImpactBadge({ value }: { value: string }) {
  const lower = value.toLowerCase();
  return (
    <Badge
      variant="outline"
      className={cn(
        'h-5 px-2 text-[10px]',
        lower === 'alta' &&
          'border-red-300 text-red-700 dark:border-red-800 dark:text-red-300',
        (lower === 'media' || lower === 'médio') &&
          'border-amber-300 text-amber-700 dark:border-amber-800 dark:text-amber-300',
        lower === 'baixa' &&
          'border-green-300 text-green-700 dark:border-green-800 dark:text-green-300',
      )}
    >
      {value}
    </Badge>
  );
}

export function ProjectKanbanCard({ project, projectIds }: ProjectKanbanCardProps) {
  const colorIdx = getProjectColorIndex(project.id, projectIds);
  const barColor = PROJECT_BAR_COLORS[colorIdx];

  const isProjectOverdue = isOverdue(project.end_date, project.status);
  const isDeadlineNear = isWithin7Days(project.end_date) && !isProjectOverdue;

  const nextDeadline = project.prazo_aprovador || project.prazo_cronograma;

  const normalizedStatus = normalizeSlug(project.status);
  const faseSlug = project.fase_atual
    ? normalizeSlug(project.fase_atual)
    : '';

  const showAlerts =
    project.importancia_especial || isProjectOverdue || isDeadlineNear;

  return (
    <div className="relative flex flex-col h-full">
      {/* Barra lateral colorida */}
      <div
        className={cn(
          'absolute left-0 top-0 bottom-0 w-1 rounded-l-lg',
          barColor,
        )}
      />

      <div className="flex-1 space-y-1.5 pl-3 py-2">
        {/* SEÇÃO 1: HEADER - Título + Código */}
        <div className="space-y-0.5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <h4 className="text-sm font-semibold leading-normal text-foreground/90 cursor-help">
                  {project.project_name}
                </h4>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                {project.project_name}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <span className="font-mono text-[10px] text-muted-foreground">
            #{project.espaider_code}
          </span>
        </div>

        {/* SEÇÃO 2: ALERTAS - Especial, Atrasado, Prazo */}
        {showAlerts && (
          <div className="flex items-center gap-1 flex-wrap">
            {project.importancia_especial && (
              <Badge variant="warning" className="h-5 px-1.5 text-[9px]">
                <Star className="mr-0.5 h-3 w-3 fill-current" />
                Especial
              </Badge>
            )}
            {isProjectOverdue && (
              <Badge variant="destructive" className="h-5 px-1.5 text-[9px]">
                <AlertTriangle className="mr-0.5 h-3 w-3" />
                Atrasado
              </Badge>
            )}
            {isDeadlineNear && (
              <Badge className="h-5 border-0 bg-amber-100 px-1.5 text-[9px] text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                <Clock className="mr-0.5 h-3 w-3" />
                Prazo crítico
              </Badge>
            )}
          </div>
        )}

        {/* SEÇÃO 3: RESPONSABILIDADE - Responsável + Área */}
        <div className="space-y-1 border-t border-border/30 pt-1">
          {/* Responsável */}
          <div className="flex items-start gap-1.5 text-xs">
            <User className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground" />
            <TextWithTooltip
              text={project.responsible}
              maxLength={40}
              className="text-foreground/85 leading-snug"
            />
          </div>

          {/* Área (se disponível) */}
          {project.area && (
            <div className="flex items-start gap-1.5 text-xs">
              <Building2 className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground" />
              <TextWithTooltip
                text={project.area}
                maxLength={40}
                className="text-foreground/85 leading-snug"
              />
            </div>
          )}
        </div>

        {/* SEÇÃO 4: PRAZOS (Destaque em Hierarquia) */}
        <div className="space-y-1 border-t border-border/30 pt-1">
          {/* Prazo Final (GRANDE E DESTACADO) */}
          <div className="flex items-start gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground" />
            <div className="flex-1">
              <span className="text-[10px] text-muted-foreground block">Prazo Final:</span>
              <span
                className={cn(
                  'text-xs font-semibold',
                  isProjectOverdue && 'text-red-600 dark:text-red-400',
                  !isProjectOverdue && isDeadlineNear && 'text-amber-600 dark:text-amber-400',
                  !isProjectOverdue && !isDeadlineNear && 'text-foreground/90',
                )}
              >
                {formatDateBR(project.end_date)}
              </span>
            </div>
          </div>

          {/* Próximo Prazo (se disponível) */}
          {nextDeadline && (
            <div className="flex items-start gap-1.5 text-xs">
              <Clock className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground" />
              <div className="flex-1">
                <span className="text-muted-foreground text-[9px]">Próximo:</span>
                <span className="text-foreground/80 block text-xs">
                  {formatDateBR(nextDeadline)}
                </span>
              </div>
            </div>
          )}

          {/* Fase Atual (se disponível) */}
          {project.fase_atual && (
            <div className="flex items-start gap-1.5 text-xs">
              <GitBranch className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground" />
              <div className="flex-1">
                <span className="text-foreground/85">
                  {resolvePhaseLabel(faseSlug, project.fase_atual) || '-'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RODAPÉ: Status Badge */}
      <div className="flex items-center justify-start border-t border-border/30 pt-1 px-3 pb-2 mt-auto">
        <Badge
          className={cn(
            'h-5 px-2.5 text-[10px] font-medium',
            statusStyles[normalizedStatus] || statusStyles.projeto_futuro,
          )}
        >
          {statusLabels[normalizedStatus] || project.status}
        </Badge>
      </div>
    </div>
  );
}
