import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Star,
  AlertTriangle,
  Clock,
  Building2,
  Tag,
  User,
  UserPlus,
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
  tipo_chamado?: string | null;
  responsible: string | null;
  end_date: string | null;
  solicitante?: string | null;
  fase_atual?: string | null;
  prazo_aprovador?: string | null;
  prazo_cronograma?: string | null;
  objetivo?: string | null;
  justificativa?: string | null;
  importancia_especial?: boolean | null;
  impacto_operacional?: string | null;
  impacto_estrategico?: string | null;
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

function ImpactBadge({ label, value }: { label: string; value: string }) {
  const lower = value.toLowerCase();
  return (
    <Badge
      variant="outline"
      className={cn(
        'h-5 px-1.5 text-[10px]',
        lower === 'alto' &&
          'border-red-300 text-red-700 dark:border-red-800 dark:text-red-300',
        (lower === 'medio' || lower === 'médio') &&
          'border-amber-300 text-amber-700 dark:border-amber-800 dark:text-amber-300',
        lower === 'baixo' &&
          'border-green-300 text-green-700 dark:border-green-800 dark:text-green-300',
      )}
    >
      {label}: {value}
    </Badge>
  );
}

export function ProjectKanbanCard({ project, projectIds }: ProjectKanbanCardProps) {
  const colorIdx = getProjectColorIndex(project.id, projectIds);
  const barColor = PROJECT_BAR_COLORS[colorIdx];

  const isProjectOverdue = isOverdue(project.end_date, project.status);
  const isDeadlineNear = isWithin7Days(project.end_date) && !isProjectOverdue;

  const nextDeadline = project.prazo_aprovador || project.prazo_cronograma;
  const nextDeadlineLabel = project.prazo_aprovador ? 'Aprovador' : 'Cronograma';
  const detalhamento = project.objetivo || project.justificativa;

  const normalizedStatus = normalizeSlug(project.status);
  const faseSlug = project.fase_atual
    ? normalizeSlug(project.fase_atual)
    : '';

  const showAlerts =
    project.importancia_especial || isProjectOverdue || isDeadlineNear;
  const showImpacts =
    project.impacto_operacional ||
    project.impacto_estrategico ||
    project.complexidade_tecnica;

  return (
    <div className="relative">
      {/* Barra lateral colorida */}
      <div
        className={cn(
          'absolute left-0 top-0 bottom-0 w-1 rounded-l-lg',
          barColor,
        )}
      />

      <div className="space-y-2.5 pl-3">
        {/* HEADER: Título + Código + Alertas */}
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
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
          </div>
          <span className="font-mono text-[10px] text-muted-foreground">
            #{project.espaider_code}
          </span>
        </div>

        {/* ALERTAS (Especial, Atrasado, Prazo) - em linha */}
        {showAlerts && (
          <div className="flex items-center gap-1 flex-wrap">
            {project.importancia_especial && (
              <Badge variant="warning" className="h-5 px-1.5 text-[10px]">
                <Star className="mr-0.5 h-3 w-3 fill-current" />
                Especial
              </Badge>
            )}
            {isProjectOverdue && (
              <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                <AlertTriangle className="mr-0.5 h-3 w-3" />
                Atrasado
              </Badge>
            )}
            {isDeadlineNear && (
              <Badge className="h-5 border-0 bg-amber-100 px-1.5 text-[10px] text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                <Clock className="mr-0.5 h-3 w-3" />
                Prazo
              </Badge>
            )}
          </div>
        )}

        {/* METADADOS ESSENCIAIS: Área + Tipo Chamado */}
        {(project.area || project.tipo_chamado) && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground flex-wrap">
            {project.area && (
              <>
                <Building2 className="h-3 w-3 shrink-0" />
                <TextWithTooltip text={project.area} maxLength={20} />
              </>
            )}
            {project.tipo_chamado && (
              <>
                <span className="text-border">·</span>
                <Tag className="h-3 w-3 shrink-0" />
                <TextWithTooltip text={project.tipo_chamado} maxLength={15} />
              </>
            )}
          </div>
        )}

        {/* BLOCO ESSENCIAL: Responsável + Prazo Final (em linha, sem grid comprimido) */}
        <div className="space-y-1 border-t border-border/30 pt-2">
          {/* Row 1: Responsável */}
          <div className="flex items-center gap-2 text-[11px]">
            <User className="h-3 w-3 shrink-0 text-muted-foreground" />
            <TextWithTooltip
              text={project.responsible}
              maxLength={25}
              className="text-foreground/80"
            />
          </div>

          {/* Row 2: Prazo Final */}
          <div className="flex items-center gap-2 text-[11px]">
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

          {/* Row 3: Solicitante + Fase Atual */}
          {(project.solicitante || project.fase_atual) && (
            <>
              {project.solicitante && (
                <div className="flex items-center gap-2 text-[11px]">
                  <UserPlus className="h-3 w-3 shrink-0 text-muted-foreground" />
                  <TextWithTooltip
                    text={project.solicitante}
                    maxLength={20}
                    className="text-foreground/80"
                  />
                </div>
              )}
              {project.fase_atual && (
                <div className="flex items-center gap-2 text-[11px]">
                  <GitBranch className="h-3 w-3 shrink-0 text-muted-foreground" />
                  <span className="text-foreground/80">
                    {resolvePhaseLabel(faseSlug, project.fase_atual) || '-'}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* PRÓXIMO PRAZO (condicional, secundário) */}
        {nextDeadline && (
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <Clock className="h-3 w-3 shrink-0" />
            <span>
              Próximo ({nextDeadlineLabel}): {formatDateBR(nextDeadline)}
            </span>
          </div>
        )}

        {/* DETALHAMENTO (Objetivo/Justificativa) - secundário com line-clamp */}
        {detalhamento && (
          <div className="border-t border-border/30 pt-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="line-clamp-2 text-[10px] leading-relaxed text-muted-foreground cursor-help">
                    {detalhamento}
                  </p>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-sm break-words">
                  {detalhamento}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        {/* BADGES DE IMPACTO */}
        {showImpacts && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {project.impacto_operacional && (
              <ImpactBadge label="Op" value={project.impacto_operacional} />
            )}
            {project.impacto_estrategico && (
              <ImpactBadge label="Est" value={project.impacto_estrategico} />
            )}
            {project.complexidade_tecnica && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                {project.complexidade_tecnica}
              </Badge>
            )}
          </div>
        )}

        {/* RODAPÉ: Status */}
        <div className="flex items-center justify-between border-t border-border/30 pt-1.5">
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
