'use client';

import * as React from 'react';
import {
  AlertTriangle,
  Star,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  statusStyles,
  statusLabels,
  resolvePhaseLabel,
} from '@/lib/constants/phase-labels';
import { isOverdue, isWithin7Days, formatDateBR } from '@/lib/utils/date-helpers';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
      className="flex items-center gap-1 font-semibold hover:text-primary"
    >
      {label}
      {sortBy === column && (
        sortDirection === 'asc' ? 
          <ChevronUp className="h-4 w-4" /> : 
          <ChevronDown className="h-4 w-4" />
      )}
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
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/50 bg-muted/30">
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground"></th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground w-16">
              <SortHeader column="name" label="Código" />
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
              <SortHeader column="name" label="Projeto" />
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground w-32">
              <SortHeader column="status" label="Status" />
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground w-20">Área</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground w-24">Responsável</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground w-28">
              <SortHeader column="date" label="Prazo" />
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground w-20">Fase</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground w-20">Alertas</th>
          </tr>
        </thead>
        <tbody>
          {sortedProjects.map((project) => {
            const isExpanded = expandedRows.has(project.id);
            const isProjectOverdue = isOverdue(project.end_date, project.status);
            const isDeadlineNear = isWithin7Days(project.end_date) && !isProjectOverdue;
            const normalizedStatus = normalizeSlug(project.status);
            const faseSlug = project.fase_atual
              ? normalizeSlug(project.fase_atual)
              : '';

            return (
              <React.Fragment key={project.id}>
                <tr className="border-b border-border/30 hover:bg-muted/50 transition-colors cursor-pointer">
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => toggleExpanded(project.id)}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    #{project.espaider_code}
                  </td>
                  <td
                    className="px-4 py-3 font-medium text-foreground/90 truncate cursor-pointer hover:text-primary"
                    onClick={() => onSelectProject?.(project.id)}
                  >
                    {project.project_name}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      className={cn(
                        'text-xs px-2 py-0.5',
                        statusStyles[normalizedStatus] || statusStyles.projeto_futuro,
                      )}
                    >
                      {statusLabels[normalizedStatus] || project.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-foreground/80 truncate">
                    {project.area || '-'}
                  </td>
                  <td className="px-4 py-3 text-xs text-foreground/80 truncate">
                    {project.responsible || '-'}
                  </td>
                  <td
                    className={cn(
                      'px-4 py-3 text-xs font-medium',
                      isProjectOverdue && 'text-red-600 dark:text-red-400',
                      !isProjectOverdue && isDeadlineNear && 'text-amber-600 dark:text-amber-400',
                    )}
                  >
                    {formatDateBR(project.end_date)}
                  </td>
                  <td className="px-4 py-3 text-xs text-foreground/80">
                    {resolvePhaseLabel(faseSlug, project.fase_atual) || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {project.importancia_especial && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400 fill-current" />
                            </TooltipTrigger>
                            <TooltipContent>Especial</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      {isProjectOverdue && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            </TooltipTrigger>
                            <TooltipContent>Atrasado</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      {isDeadlineNear && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            </TooltipTrigger>
                            <TooltipContent>Prazo próximo</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </td>
                </tr>
                {isExpanded && (
                  <tr className="border-b border-border/30 bg-muted/20">
                    <td colSpan={9} className="px-6 py-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-semibold text-xs text-muted-foreground mb-1">Objetivo</p>
                          <p className="text-foreground/80">{project.objetivo || '-'}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-xs text-muted-foreground mb-1">Justificativa</p>
                          <p className="text-foreground/80">{project.justificativa || '-'}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-xs text-muted-foreground mb-1">Complexidade</p>
                          <Badge variant="outline" className="text-xs">
                            {project.complexidade_tecnica || '-'}
                          </Badge>
                        </div>
                        <div>
                          <p className="font-semibold text-xs text-muted-foreground mb-1">Impactos</p>
                          <div className="flex gap-2">
                            {project.impacto_estrategico && (
                              <Badge variant="outline" className="text-xs">Estratégico: {project.impacto_estrategico}</Badge>
                            )}
                            {project.impacto_operacional && (
                              <Badge variant="outline" className="text-xs">Operacional: {project.impacto_operacional}</Badge>
                            )}
                          </div>
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
  );
}
