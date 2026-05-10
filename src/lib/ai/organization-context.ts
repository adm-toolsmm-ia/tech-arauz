import type { SupabaseClient } from '@supabase/supabase-js';
import { toAIContext, type OrgAIContext } from '@/lib/transformers/organization';
import type { OrgActivity, OrgArea, OrgNucleus, OrgProcess, OrgRoutine } from '@/types/organization';

type SupabaseLike = SupabaseClient;

export interface OrganizationContextSnapshot {
  areas: OrgArea[];
  nuclei: OrgNucleus[];
  processes: OrgProcess[];
  routines: OrgRoutine[];
  activities: OrgActivity[];
}

const MAX_ITEMS_PER_LEVEL = 3;
const MAX_TEXT_LENGTH = 180;

function truncate(value: string | null | undefined, maxLength = MAX_TEXT_LENGTH): string | null {
  if (!value) return null;
  const compact = value.replace(/\s+/g, ' ').trim();
  if (!compact) return null;
  if (compact.length <= maxLength) return compact;
  return `${compact.slice(0, maxLength - 1).trimEnd()}…`;
}

function joinRoles(roles: string[] | null | undefined): string {
  if (!roles || roles.length === 0) return 'Não definido';
  return roles.join(', ');
}

function formatOrgLine(label: string, name: string, details: Array<string | null | undefined>): string {
  const compactDetails = details.filter(Boolean).join(' | ');
  return compactDetails ? `- ${label} ${name} | ${compactDetails}` : `- ${label} ${name}`;
}

function formatAIContextLine(label: string, context: OrgAIContext, details: Array<string | null | undefined>): string {
  const compactDetails = details.filter(Boolean).join(' | ');
  return compactDetails ? `- ${label} ${context.title} | ${compactDetails}` : `- ${label} ${context.title}`;
}

function selectColumns(level: keyof OrganizationContextSnapshot): string {
  switch (level) {
    case 'areas':
      return 'id, tenant_id, name, description, objective, responsible_roles, documentation, created_at, updated_at';
    case 'nuclei':
      return 'id, tenant_id, area_id, name, description, objective, responsible_roles, documentation, created_at, updated_at';
    case 'processes':
      return 'id, tenant_id, area_id, nucleus_id, name, description, objective, inputs, outputs, responsible_roles, risks, impacts, documentation, created_at, updated_at';
    case 'routines':
      return 'id, tenant_id, process_id, name, description, objective, responsible_roles, documentation, created_at, updated_at';
    case 'activities':
      return 'id, tenant_id, routine_id, name, description, objective, complexity, priority, required_role, average_execution_time, inputs, outputs, risks, impacts, responsible_roles, documentation, created_at, updated_at';
    default:
      return 'id';
  }
}

async function fetchLevel<T>(
  supabase: SupabaseLike,
  tenantId: string,
  level: keyof OrganizationContextSnapshot,
): Promise<T[]> {
  const { data, error } = await supabase
    .from(`org_${level}`)
    .select(selectColumns(level))
    .eq('tenant_id', tenantId)
    .order('updated_at', { ascending: false })
    .limit(MAX_ITEMS_PER_LEVEL);

  if (error || !Array.isArray(data)) {
    return [];
  }

  return data as T[];
}

function buildIndex(snapshot: OrganizationContextSnapshot) {
  return {
    areasById: new Map(snapshot.areas.map((area) => [area.id, area])),
    nucleiById: new Map(snapshot.nuclei.map((nucleus) => [nucleus.id, nucleus])),
    processesById: new Map(snapshot.processes.map((process) => [process.id, process])),
    routinesById: new Map(snapshot.routines.map((routine) => [routine.id, routine])),
  };
}

export function formatOrganizationContext(snapshot: OrganizationContextSnapshot): string {
  const { areasById, nucleiById, processesById, routinesById } = buildIndex(snapshot);
  const sections: string[] = [];
  const coveredNuclei = new Set<string>();
  const coveredProcesses = new Set<string>();
  const coveredRoutines = new Set<string>();
  const coveredActivities = new Set<string>();

  if (snapshot.areas.length > 0) {
    sections.push(`Áreas (${snapshot.areas.length})`);

    for (const area of snapshot.areas) {
      sections.push(
        formatOrgLine('Área', area.name, [
          `objetivo: ${truncate(area.objective) ?? 'Não definido'}`,
          `roles: ${joinRoles(area.responsible_roles)}`,
        ]),
      );

      const areaNuclei = snapshot.nuclei.filter((nucleus) => nucleus.area_id === area.id);
      for (const nucleus of areaNuclei) {
        coveredNuclei.add(nucleus.id);
        sections.push(
          formatOrgLine('Núcleo', nucleus.name, [
            `área: ${area.name}`,
            `objetivo: ${truncate(nucleus.objective) ?? 'Não definido'}`,
            `roles: ${joinRoles(nucleus.responsible_roles)}`,
          ]),
        );

        const nucleusProcesses = snapshot.processes.filter((process) => process.nucleus_id === nucleus.id);
        for (const process of nucleusProcesses) {
          coveredProcesses.add(process.id);
          const processContext = toAIContext(process);
          sections.push(
            formatAIContextLine('Processo', processContext, [
              `área: ${area.name}`,
              `núcleo: ${nucleus.name}`,
              `objetivo: ${truncate(processContext.objective) ?? 'Não definido'}`,
              `roles: ${joinRoles(processContext.roles)}`,
              processContext.steps.length > 0 ? `passos: ${processContext.steps.slice(0, 3).join(' · ')}` : null,
            ]),
          );

          const processRoutines = snapshot.routines.filter((routine) => routine.process_id === process.id);
          for (const routine of processRoutines) {
            coveredRoutines.add(routine.id);
            const routineContext = toAIContext(routine);
            sections.push(
              formatAIContextLine('Rotina', routineContext, [
                `processo: ${process.name}`,
                `objetivo: ${truncate(routineContext.objective) ?? 'Não definido'}`,
                `roles: ${joinRoles(routineContext.roles)}`,
                routineContext.steps.length > 0 ? `passos: ${routineContext.steps.slice(0, 3).join(' · ')}` : null,
              ]),
            );

            const routineActivities = snapshot.activities.filter((activity) => activity.routine_id === routine.id);
            for (const activity of routineActivities) {
              coveredActivities.add(activity.id);
              const activityContext = toAIContext(activity);
              sections.push(
                formatAIContextLine('Atividade', activityContext, [
                  `rotina: ${routine.name}`,
                  `role: ${activity.required_role || joinRoles(activityContext.roles)}`,
                  `complexidade: ${activityContext.complexity ?? 'medium'}`,
                  `prioridade: ${activityContext.priority ?? 'normal'}`,
                  activityContext.avgExecutionTime ? `tempo: ${activityContext.avgExecutionTime}` : null,
                ]),
              );
            }
          }
        }
      }
    }
  }

  for (const nucleus of snapshot.nuclei) {
    if (coveredNuclei.has(nucleus.id)) continue;
    const areaName = areasById.get(nucleus.area_id)?.name ?? 'Área não identificada';
    sections.push(
      formatOrgLine('Núcleo', nucleus.name, [
        `área: ${areaName}`,
        `objetivo: ${truncate(nucleus.objective) ?? 'Não definido'}`,
        `roles: ${joinRoles(nucleus.responsible_roles)}`,
      ]),
    );
  }

  for (const process of snapshot.processes) {
    if (coveredProcesses.has(process.id)) continue;
    const areaName = process.area_id ? areasById.get(process.area_id)?.name ?? 'Área não identificada' : 'Sem área';
    const nucleusName = process.nucleus_id
      ? nucleiById.get(process.nucleus_id)?.name ?? 'Núcleo não identificado'
      : 'Sem núcleo';
    const processContext = toAIContext(process);
    sections.push(
      formatAIContextLine('Processo', processContext, [
        `área: ${areaName}`,
        `núcleo: ${nucleusName}`,
        `objetivo: ${truncate(processContext.objective) ?? 'Não definido'}`,
        `roles: ${joinRoles(processContext.roles)}`,
        processContext.steps.length > 0 ? `passos: ${processContext.steps.slice(0, 3).join(' · ')}` : null,
      ]),
    );
  }

  for (const routine of snapshot.routines) {
    if (coveredRoutines.has(routine.id)) continue;
    const processName = processesById.get(routine.process_id)?.name ?? 'Processo não identificado';
    const routineContext = toAIContext(routine);
    sections.push(
      formatAIContextLine('Rotina', routineContext, [
        `processo: ${processName}`,
        `objetivo: ${truncate(routineContext.objective) ?? 'Não definido'}`,
        `roles: ${joinRoles(routineContext.roles)}`,
      ]),
    );
  }

  for (const activity of snapshot.activities) {
    if (coveredActivities.has(activity.id)) continue;
    const routineName = routinesById.get(activity.routine_id)?.name ?? 'Rotina não identificada';
    const activityContext = toAIContext(activity);
    sections.push(
      formatAIContextLine('Atividade', activityContext, [
        `rotina: ${routineName}`,
        `role: ${activity.required_role || joinRoles(activityContext.roles)}`,
        `complexidade: ${activityContext.complexity ?? 'medium'}`,
        `prioridade: ${activityContext.priority ?? 'normal'}`,
        activityContext.avgExecutionTime ? `tempo: ${activityContext.avgExecutionTime}` : null,
      ]),
    );
  }

  return sections.join('\n');
}

async function resolveTenantId(supabase: SupabaseLike, explicitTenantId?: string | null): Promise<string | null> {
  if (explicitTenantId) return explicitTenantId;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();

  return profile?.tenant_id ?? null;
}

export async function buildAgentOrganizationContext(
  supabase: SupabaseLike,
  explicitTenantId?: string | null,
): Promise<string | null> {
  const tenantId = await resolveTenantId(supabase, explicitTenantId);
  if (!tenantId) return null;

  const [areas, nuclei, processes, routines, activities] = await Promise.all([
    fetchLevel<OrgArea>(supabase, tenantId, 'areas'),
    fetchLevel<OrgNucleus>(supabase, tenantId, 'nuclei'),
    fetchLevel<OrgProcess>(supabase, tenantId, 'processes'),
    fetchLevel<OrgRoutine>(supabase, tenantId, 'routines'),
    fetchLevel<OrgActivity>(supabase, tenantId, 'activities'),
  ]);

  const snapshot: OrganizationContextSnapshot = { areas, nuclei, processes, routines, activities };
  const prompt = formatOrganizationContext(snapshot);

  if (!prompt) return null;

  return [
    '# Contexto organizacional do tenant',
    'Use este recorte tenant-scoped para perguntas sobre operação, cadastros, responsabilidades e execução.',
    prompt,
    '## Diretriz',
    '- Prefira respostas ancoradas no contexto acima.',
    '- Se houver ambiguidade ou ausência de vínculo, explicite a limitação ao invés de inferir.',
  ].join('\n\n');
}
