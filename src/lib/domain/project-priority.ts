import { isConsideredActive } from '@/lib/domain/project-health';

export interface ProjectPriorityLike {
  status?: string | null;
  priority?: string | null;
  prioridade?: string | null;
  importancia_especial?: boolean | null;
  impacto_estrategico?: string | null;
  impacto_operacional?: string | null;
}

function normalizeText(value: string | null | undefined): string {
  return (value || '').trim().toLowerCase();
}

function getPriorityValue(project: ProjectPriorityLike): string {
  return normalizeText(project.priority || project.prioridade);
}

export function isHighPriorityProject(project: ProjectPriorityLike): boolean {
  if (!isConsideredActive(project.status)) return false;

  const priority = getPriorityValue(project);
  const strategicImpact = normalizeText(project.impacto_estrategico);
  const operationalImpact = normalizeText(project.impacto_operacional);

  return (
    priority === 'urgente' ||
    priority === 'alta' ||
    project.importancia_especial === true ||
    strategicImpact === 'alto' ||
    operationalImpact === 'alto'
  );
}
