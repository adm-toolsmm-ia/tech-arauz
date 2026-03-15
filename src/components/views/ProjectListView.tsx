'use client';

import * as React from 'react';
import { AlertTriangle, Star, Clock, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { statusStyles, statusLabels, resolvePhaseLabel } from '@/lib/constants/phase-labels';
import { isOverdue, isWithin7Days, formatDateBR } from '@/lib/utils/date-helpers';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ProjectListViewProps {
  projects: any[];
  onSelectProject?: (projectId: string) => void;
  isLoading?: boolean;
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

const AlertIcons = ({ project }: { project: any }) => {
  const isProjectOverdue = isOverdue(project.end_date, project.status);
  const isDeadlineNear = isWithin7Days(project.end_date) && !isProjectOverdue;

  return (
    <div className="flex items-center gap-1">
      {project.importancia_especial && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Star className="h-3.5 w-3.5 fill-current text-yellow-600 dark:text-yellow-400" />
            </TooltipTrigger>
            <TooltipContent side="left">Especial</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      {isProjectOverdue && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertTriangle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
            </TooltipTrigger>
            <TooltipContent side="left">Atrasado</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      {isDeadlineNear && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            </TooltipTrigger>
            <TooltipContent side="left">Prazo próximo</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export function ProjectListView({
  projects,
  onSelectProject,
  isLoading = false,
}: ProjectListViewProps) {
  const [sortBy, setSortBy] = React.useState<'name' | 'date' | 'status'>('name');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set());

  const toggleExpanded = (projectId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedRows(newExpanded);
  };

  const sortedProjects = React.useMemo(() => {
    const sorted = [...projects];
    sorted.sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'name') {
        comparison = (a.project_name || '').localeCompare(b.project_name || '');
      } else if (sortBy === 'date') {
        const dateA = new Date(a.end_date || 0).getTime();
        const dateB = new Date(b.end_date || 0).getTime();
        comparison = dateA - dateB;
      } else if (sortBy === 'status') {
        comparison = (a.status || '').localeCompare(b.status || '');
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [projects, sortBy, sortDirection]);

  const SortHeader = ({ column, label }: { column: 'name' | 'date' | 'status'; label: string }) => (
    <button
      onClick={() => {
        if (sortBy === column) {
          setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
          setSortBy(column);
          setSortDirection('asc');
        }
      }}
      className="hover:text-primary flex items-center gap-1.5 text-xs font-semibold transition-colors"
    >
      {label}
      {sortBy === column &&
        (sortDirection === 'asc' ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        ))}
    </button>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Carregando projetos...</p>
      </div>
    );
  }

  if (sortedProjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Nenhum projeto encontrado</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      {/* Desktop Table View */}
      <div className="hidden overflow-hidden rounded-lg border bg-card md:block">
        <div className="max-h-[600px] overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50 sticky top-0 border-b">
              <tr>
                <th className="w-8 px-3 py-2 text-left"></th>
                <th className="w-16 min-w-fit px-3 py-2 text-left font-semibold text-muted-foreground">
                  Código
                </th>
                <th className="min-w-fit px-3 py-2 text-left font-semibold text-muted-foreground">
                  <SortHeader column="name" label="Projeto" />
                </th>
                <th className="w-20 min-w-fit px-3 py-2 text-left font-semibold text-muted-foreground">
                  <SortHeader column="status" label="Status" />
                </th>
                <th className="w-16 min-w-fit px-3 py-2 text-left font-semibold text-muted-foreground">
                  Responsável
                </th>
                <th className="w-20 min-w-fit px-3 py-2 text-left font-semibold text-muted-foreground">
                  <SortHeader column="date" label="Prazo" />
                </th>
                <th className="w-10 min-w-fit px-3 py-2 text-left font-semibold text-muted-foreground">
                  Alertas
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sortedProjects.map((project) => {
                const isExpanded = expandedRows.has(project.id);
                const isProjectOverdue = isOverdue(project.end_date, project.status);
                const isDeadlineNear = isWithin7Days(project.end_date) && !isProjectOverdue;
                const normalizedStatus = normalizeSlug(project.status);
                const faseSlug = project.fase_atual ? normalizeSlug(project.fase_atual) : '';

                return (
                  <React.Fragment key={project.id}>
                    <tr className="hover:bg-muted/50 transition-colors">
                      <td className="px-3 py-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => toggleExpanded(project.id)}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </td>
                      <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                        #{project.espaider_code}
                      </td>
                      <td
                        className="text-foreground/90 hover:text-primary cursor-pointer truncate px-3 py-2 font-medium transition-colors"
                        onClick={() => onSelectProject?.(project.id)}
                        title={project.project_name}
                      >
                        {project.project_name}
                      </td>
                      <td className="px-3 py-2">
                        <Badge
                          className={cn(
                            'px-1.5 py-0 text-xs',
                            statusStyles[normalizedStatus] || statusStyles.projeto_futuro,
                          )}
                        >
                          {statusLabels[normalizedStatus] || project.status}
                        </Badge>
                      </td>
                      <td className="text-foreground/80 truncate px-3 py-2 text-xs">
                        {project.responsible || '-'}
                      </td>
                      <td
                        className={cn(
                          'px-3 py-2 text-xs font-medium',
                          isProjectOverdue && 'text-red-600 dark:text-red-400',
                          !isProjectOverdue &&
                            isDeadlineNear &&
                            'text-amber-600 dark:text-amber-400',
                        )}
                      >
                        {formatDateBR(project.end_date)}
                      </td>
                      <td className="px-3 py-2">
                        <AlertIcons project={project} />
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-muted/20">
                        <td colSpan={7} className="px-4 py-3">
                          <div className="grid grid-cols-2 gap-3 text-xs lg:grid-cols-4">
                            <div>
                              <p className="mb-1 font-semibold text-muted-foreground">Área</p>
                              <p className="text-foreground/80">{project.area || '-'}</p>
                            </div>
                            <div>
                              <p className="mb-1 font-semibold text-muted-foreground">Fase</p>
                              <p className="text-foreground/80">
                                {resolvePhaseLabel(faseSlug, project.fase_atual) || '-'}
                              </p>
                            </div>
                            <div>
                              <p className="mb-1 font-semibold text-muted-foreground">
                                Complexidade
                              </p>
                              <p className="text-foreground/80">
                                {project.complexidade_tecnica || '-'}
                              </p>
                            </div>
                            <div>
                              <p className="mb-1 font-semibold text-muted-foreground">Objetivo</p>
                              <p className="text-foreground/80 truncate">
                                {project.objetivo || '-'}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="space-y-2 md:hidden">
        {sortedProjects.map((project) => {
          const isExpanded = expandedRows.has(project.id);
          const isProjectOverdue = isOverdue(project.end_date, project.status);
          const isDeadlineNear = isWithin7Days(project.end_date) && !isProjectOverdue;
          const normalizedStatus = normalizeSlug(project.status);
          const faseSlug = project.fase_atual ? normalizeSlug(project.fase_atual) : '';

          return (
            <Card key={project.id} className="cursor-pointer transition-shadow hover:shadow-md">
              <CardContent className="p-3">
                <div
                  role="button"
                  tabIndex={0}
                  className="mb-2 flex items-start justify-between gap-2"
                  onClick={() => onSelectProject?.(project.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectProject?.(project.id);
                    }
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs text-muted-foreground">
                      #{project.espaider_code}
                    </p>
                    <p className="truncate text-sm font-semibold text-foreground">
                      {project.project_name}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 flex-shrink-0 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpanded(project.id);
                    }}
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="mb-2 flex items-center justify-between gap-2">
                  <Badge
                    className={cn(
                      'flex-shrink-0 px-1.5 py-0 text-xs',
                      statusStyles[normalizedStatus] || statusStyles.projeto_futuro,
                    )}
                  >
                    {statusLabels[normalizedStatus] || project.status}
                  </Badge>
                  <AlertIcons project={project} />
                </div>

                <div className="mb-2 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Responsável:</span>
                    <span className="text-foreground/80 font-medium">
                      {project.responsible || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Prazo:</span>
                    <span
                      className={cn(
                        'font-medium',
                        isProjectOverdue && 'text-red-600 dark:text-red-400',
                        !isProjectOverdue && isDeadlineNear && 'text-amber-600 dark:text-amber-400',
                      )}
                    >
                      {formatDateBR(project.end_date)}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="space-y-2 border-t pt-2 text-xs">
                    {project.area && (
                      <div>
                        <p className="mb-0.5 font-semibold text-muted-foreground">Área</p>
                        <p className="text-foreground/80">{project.area}</p>
                      </div>
                    )}
                    {project.fase_atual && (
                      <div>
                        <p className="mb-0.5 font-semibold text-muted-foreground">Fase</p>
                        <p className="text-foreground/80">
                          {resolvePhaseLabel(faseSlug, project.fase_atual)}
                        </p>
                      </div>
                    )}
                    {project.complexidade_tecnica && (
                      <div>
                        <p className="mb-0.5 font-semibold text-muted-foreground">Complexidade</p>
                        <Badge variant="outline" className="px-1.5 py-0 text-xs">
                          {project.complexidade_tecnica}
                        </Badge>
                      </div>
                    )}
                    {project.objetivo && (
                      <div>
                        <p className="mb-0.5 font-semibold text-muted-foreground">Objetivo</p>
                        <p className="text-foreground/80 line-clamp-2">{project.objetivo}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
