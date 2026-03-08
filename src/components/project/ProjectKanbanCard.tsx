import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Star, AlertTriangle, Clock, Building2, User, Calendar, GitBranch } from 'lucide-react';
import { statusStyles, statusLabels, resolvePhaseLabel } from '@/lib/constants/phase-labels';
import { PROJECT_BAR_COLORS, getProjectColorIndex } from '@/lib/constants/project-colors';
import { isOverdue, isWithin7Days, formatDateBR } from '@/lib/utils/date-helpers';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  mensagem_movimentacao?: string | null;
  data_movimentacao?: string | null;
  tempos_permanencia?: Array<{
    fase: string | null;
    tempo_permanencia_dias: number | null;
    situacao: string | null;
  }>;
  schedules?: Array<{
    status: string | null;
    atrasado?: boolean | null;
  }>;
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
 * Format relative date (e.g., "Hoje", "Ontem", "há 3 dias")
 */
function formatRelativeDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `há ${diffDays} dias`;
    if (diffDays < 30) return `há ${Math.floor(diffDays / 7)} sem.`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  } catch {
    return '';
  }
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

interface ImpactBadgeProps {
  value: string;
}

const ImpactBadge: React.FC<ImpactBadgeProps> = ({ value }) => {
  const lower = value.toLowerCase();
  return (
    <Badge
      variant="outline"
      className={cn(
        'h-5 px-2 text-[10px]',
        lower === 'alta' && 'border-red-300 text-red-700 dark:border-red-800 dark:text-red-300',
        (lower === 'media' || lower === 'médio') &&
          'border-amber-300 text-amber-700 dark:border-amber-800 dark:text-amber-300',
        lower === 'baixa' &&
          'border-green-300 text-green-700 dark:border-green-800 dark:text-green-300',
      )}
    >
      {value}
    </Badge>
  );
};

export const ProjectKanbanCard: React.FC<ProjectKanbanCardProps> = ({ project, projectIds }) => {
  const colorIdx = getProjectColorIndex(project.id, projectIds);
  const barColor = PROJECT_BAR_COLORS[colorIdx];

  const isProjectOverdue = isOverdue(project.end_date, project.status);
  const isDeadlineNear = isWithin7Days(project.end_date) && !isProjectOverdue;

  const nextDeadline = project.prazo_aprovador || project.prazo_cronograma;

  const normalizedStatus = normalizeSlug(project.status);
  const faseSlug = project.fase_atual ? normalizeSlug(project.fase_atual) : '';

  const showAlerts = project.importancia_especial || isProjectOverdue || isDeadlineNear;

  const currentPhaseTime = project.tempos_permanencia?.find(
    (tp) => tp.fase === project.fase_atual || tp.situacao === 'Andamento', // Heurística Espaider para pegar a fase em andamento
  );

  const diasNaFase = currentPhaseTime?.tempo_permanencia_dias ?? null;

  const totalAtividades = project.schedules?.length || 0;
  const atividadesConcluidas =
    project.schedules?.filter((s) => (s.status || '').toLowerCase() === 'concluído').length || 0;
  const atividadesAtrasadas = project.schedules?.filter((s) => s.atrasado).length || 0;
  const hasCronograma = totalAtividades > 0;

  return (
    <div className="relative flex h-full flex-col">
      {/* Barra lateral colorida */}
      <div className={cn('absolute bottom-0 left-0 top-0 w-1 rounded-l-lg', barColor)} />

      <div className="flex-1 space-y-1.5 py-2 pl-3">
        {/* SEÇÃO 1: HEADER - Título + Código */}
        <div className="space-y-0.5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <h4 className="cursor-help text-sm font-semibold leading-normal text-foreground/90">
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
          <div className="flex flex-wrap items-center gap-1">
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
            <User className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <TextWithTooltip
              text={project.responsible}
              maxLength={40}
              className="leading-snug text-foreground/85"
            />
          </div>

          {/* Área (se disponível) */}
          {project.area && (
            <div className="flex items-start gap-1.5 text-xs">
              <Building2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <TextWithTooltip
                text={project.area}
                maxLength={40}
                className="leading-snug text-foreground/85"
              />
            </div>
          )}
        </div>

        {/* SEÇÃO 4: PRAZOS (Destaque em Hierarquia) */}
        <div className="space-y-1 border-t border-border/30 pt-1">
          {/* Prazo Final (GRANDE E DESTACADO) */}
          <div className="flex items-start gap-1.5">
            <Calendar className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <div className="flex-1">
              <span className="block text-[10px] text-muted-foreground">Prazo Final:</span>
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
              <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <div className="flex-1">
                <span className="text-[9px] text-muted-foreground">Próximo:</span>
                <span className="block text-xs text-foreground/80">
                  {formatDateBR(nextDeadline)}
                </span>
              </div>
            </div>
          )}

          {/* Fase Atual (se disponível) */}
          {project.fase_atual && (
            <div className="flex items-start justify-between gap-1.5 text-xs">
              <div className="flex flex-1 items-start gap-1.5">
                <GitBranch className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="text-foreground/85">
                  {resolvePhaseLabel(faseSlug, project.fase_atual) || '-'}
                </span>
              </div>
              {diasNaFase !== null && (
                <div
                  className={cn(
                    'shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium',
                    diasNaFase > 30
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : diasNaFase > 15
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        : 'bg-muted text-muted-foreground',
                  )}
                  title={`Este projeto já está há ${diasNaFase} dia(s) nesta etapa.`}
                >
                  {diasNaFase} d
                </div>
              )}
            </div>
          )}

          {/* Cronograma (Opcional - Progress bar) */}
          {hasCronograma && (
            <div className="pb-0.5 pt-1.5">
              <div className="mb-1 flex items-center justify-between text-[10px]">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Cronograma
                </span>
                <span
                  className={cn(
                    'font-medium',
                    atividadesAtrasadas > 0 ? 'text-red-500' : 'text-foreground/70',
                  )}
                >
                  {atividadesConcluidas}/{totalAtividades}
                  {atividadesAtrasadas > 0 && ` (${atividadesAtrasadas} atrasadas)`}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn('h-full', atividadesAtrasadas > 0 ? 'bg-red-500' : 'bg-primary')}
                  style={{ width: `${(atividadesConcluidas / totalAtividades) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* SEÇÃO 5: ÚLTIMA MENSAGEM DE MOVIMENTAÇÃO (se disponível) */}
        {project.mensagem_movimentacao && (
          <div className="space-y-1 border-t border-border/30 pt-1">
            <span className="block text-[9px] text-muted-foreground">Último histórico:</span>
            <p
              className="line-clamp-3 text-[11px] leading-snug text-muted-foreground"
              title={project.mensagem_movimentacao}
            >
              {project.mensagem_movimentacao}
            </p>
            {project.data_movimentacao && (
              <p className="text-[9px] text-muted-foreground/60">
                {formatRelativeDate(project.data_movimentacao)}
              </p>
            )}
          </div>
        )}
      </div>

      {/* RODAPÉ: Status Badge */}
      <div className="mt-auto flex items-center justify-start border-t border-border/30 px-3 pb-2 pt-1">
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
};
