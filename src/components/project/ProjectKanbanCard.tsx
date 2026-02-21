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
  const detalhamento = project.objetivo || project.justificativa;

  const normalizedStatus = normalizeSlug(project.status);
  const faseSlug = project.fase_atual
    ? normalizeSlug(project.fase_atual)
    : '';

  const showAlerts =
    project.importancia_especial || isProjectOverdue || isDeadlineNear;

  return (
    <div className="relative">
      {/* Barra lateral colorida */}
      <div
        className={cn(
          'absolute left-0 top-0 bottom-0 w-1 rounded-l-lg',
          barColor,
        )}
      />

      <div className="space-y-2 pl-3">
        {/* HEADER: Título + Código */}
        <div className="space-y-0.5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <h4 className="flex-1 text-sm font-semibold leading-snug text-foreground/90 line-clamp-2 cursor-help">
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

        {/* ALERTAS (Especial, Atrasado, Prazo) - em linha compacta */}
        {showAlerts && (
          <div className="flex items-center gap-1 flex-wrap">
            {project.importancia_especial && (
              <Badge variant="warning" className="h-4 px-1 text-[9px]">
                <Star className="mr-0.5 h-2.5 w-2.5 fill-current" />
                Especial
              </Badge>
            )}
            {isProjectOverdue && (
              <Badge variant="destructive" className="h-4 px-1 text-[9px]">
                <AlertTriangle className="mr-0.5 h-2.5 w-2.5" />
                Atrasado
              </Badge>
            )}
            {isDeadlineNear && (
              <Badge className="h-4 border-0 bg-amber-100 px-1 text-[9px] text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                <Clock className="mr-0.5 h-2.5 w-2.5" />
                Prazo
              </Badge>
            )}
          </div>
        )}

        {/* DADOS PRINCIPAIS: Área, Responsável, Prazo e Fase */}
        <div className="space-y-1 border-t border-border/30 pt-1.5">
          {/* Área (se disponível) */}
          {project.area && (
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Building2 className="h-3 w-3 shrink-0" />
              <TextWithTooltip text={project.area} maxLength={20} />
            </div>
          )}

          {/* Responsável */}
          <div className="flex items-center gap-1.5 text-[10px]">
            <User className="h-3 w-3 shrink-0 text-muted-foreground" />
            <TextWithTooltip
              text={project.responsible}
              maxLength={28}
              className="text-foreground/80"
            />
          </div>

          {/* Prazo Final */}
          <div className="flex items-center gap-1.5 text-[10px]">
            <Calendar className="h-3 w-3 shrink-0 text-muted-foreground" />
            <span
              className={cn(
                'text-foreground/80',
                isProjectOverdue && 'font-medium text-red-600 dark:text-red-400',
              )}
            >
              {formatDateBR(project.end_date)}
            </span>
          </div>

          {/* Fase Atual */}
          {project.fase_atual && (
            <div className="flex items-center gap-1.5 text-[10px]">
              <GitBranch className="h-3 w-3 shrink-0 text-muted-foreground" />
              <span className="text-foreground/80">
                {resolvePhaseLabel(faseSlug, project.fase_atual) || '-'}
              </span>
            </div>
          )}
        </div>

        {/* PRÓXIMO PRAZO (condicional, compacto) */}
        {nextDeadline && (
          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
            <Clock className="h-3 w-3 shrink-0" />
            <span>
              Próximo: {formatDateBR(nextDeadline)}
            </span>
          </div>
        )}

        {/* DETALHAMENTO (Objetivo/Justificativa) - compacto */}
        {detalhamento && (
          <div className="border-t border-border/30 pt-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="line-clamp-1 text-[9px] leading-tight text-muted-foreground cursor-help">
                    {detalhamento}
                  </p>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-sm break-words text-[11px]">
                  {detalhamento}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        {/* COMPLEXIDADE TÉCNICA */}
        {project.complexidade_tecnica && (
          <div className="flex items-center gap-1.5 text-[9px]">
            <span className="text-muted-foreground">Complexidade:</span>
            <ImpactBadge value={project.complexidade_tecnica} />
          </div>
        )}

        {/* RODAPÉ: Status */}
        <div className="flex items-center justify-start border-t border-border/30 pt-1">
          <Badge
            className={cn(
              'h-5 px-2 text-[10px]',
              statusStyles[normalizedStatus] || statusStyles.projeto_futuro,
            )}
          >
            {statusLabels[normalizedStatus] || project.status}
          </Badge>
        </div>
      </div>
    </div>
  );
}
