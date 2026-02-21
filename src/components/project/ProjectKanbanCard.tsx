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

      <div className="space-y-2 pl-3">
        {/* Badges de alerta (topo direita) */}
        {showAlerts && (
          <div className="flex items-center justify-end gap-1.5">
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

        {/* Título */}
        <h4 className="line-clamp-2 text-sm font-semibold leading-tight text-foreground/90">
          {project.project_name}
        </h4>

        {/* Área + Tipo Chamado (inline) */}
        {(project.area || project.tipo_chamado) && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Building2 className="h-3 w-3 shrink-0" />
            <span className="truncate">{project.area || '-'}</span>
            {project.tipo_chamado && (
              <>
                <span className="text-border">·</span>
                <Tag className="h-3 w-3 shrink-0" />
                <span className="truncate">{project.tipo_chamado}</span>
              </>
            )}
          </div>
        )}

        {/* Grid 2 colunas - Row 1: Responsável + Prazo Final */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          <div className="flex items-center gap-1.5">
            <User className="h-3 w-3 shrink-0 text-muted-foreground" />
            <span className="truncate text-[11px] text-foreground/80">
              {project.responsible || '-'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3 shrink-0 text-muted-foreground" />
            <span
              className={cn(
                'truncate text-[11px]',
                isProjectOverdue
                  ? 'font-medium text-red-600 dark:text-red-400'
                  : 'text-foreground/80',
              )}
            >
              {formatDateBR(project.end_date)}
            </span>
          </div>
        </div>

        {/* Grid 2 colunas - Row 2: Solicitante + Fase Atual */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          <div className="flex items-center gap-1.5">
            <UserPlus className="h-3 w-3 shrink-0 text-muted-foreground" />
            <span className="truncate text-[11px] text-foreground/80">
              {project.solicitante || '-'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <GitBranch className="h-3 w-3 shrink-0 text-muted-foreground" />
            <span className="truncate text-[11px] text-foreground/80">
              {resolvePhaseLabel(faseSlug, project.fase_atual) || '-'}
            </span>
          </div>
        </div>

        {/* Próximo Prazo (condicional) */}
        {nextDeadline && (
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Clock className="h-3 w-3 shrink-0" />
            <span>
              Próximo ({nextDeadlineLabel}): {formatDateBR(nextDeadline)}
            </span>
          </div>
        )}

        {/* Detalhamento (objetivo ou justificativa) */}
        {detalhamento && (
          <div className="border-t border-border/30 pt-1.5">
            <p className="line-clamp-2 text-[10px] leading-relaxed text-muted-foreground">
              {detalhamento}
            </p>
          </div>
        )}

        {/* Badges de Impacto */}
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

        {/* Rodapé: Status + Código Espaider */}
        <div className="flex items-center justify-between border-t border-border/30 pt-1.5">
          <Badge
            className={cn(
              'h-5 px-2 text-[10px]',
              statusStyles[normalizedStatus] || statusStyles.projeto_futuro,
            )}
          >
            {statusLabels[normalizedStatus] || project.status}
          </Badge>
          <span className="font-mono text-[10px] text-muted-foreground">
            #{project.espaider_code}
          </span>
        </div>
      </div>
    </div>
  );
}
