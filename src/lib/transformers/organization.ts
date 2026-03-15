/**
 * Organization transformers — DB row -> UI interface
 * Aligned with supabase/migrations/060_org_bootstrap_schema.sql
 */

import type {
  OrgArea,
  OrgNucleus,
  OrgProcess,
  OrgRoutine,
  OrgActivity,
  OrgSystem,
  OrgSystemResource,
  OrgSupplier,
  OrgService,
  OrgDocument,
  OrgCompanyType,
  OrgInputOutput,
} from '@/types/organization';

// DB row types (match Supabase schema)
export interface DBOrgArea {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  objective: string | null;
  responsible_roles: unknown;
  documentation: unknown;
  created_at: string;
  updated_at: string;
}

export interface DBOrgNucleus {
  id: string;
  tenant_id: string;
  area_id: string;
  name: string;
  description: string | null;
  objective: string | null;
  responsible_roles: unknown;
  documentation: unknown;
  created_at: string;
  updated_at: string;
}

export interface DBOrgProcess {
  id: string;
  tenant_id: string;
  area_id: string | null;
  nucleus_id: string | null;
  name: string;
  description: string | null;
  objective: string | null;
  inputs: unknown;
  outputs: unknown;
  responsible_roles: unknown;
  risks: unknown;
  impacts: unknown;
  documentation: unknown;
  created_at: string;
  updated_at: string;
}

export interface DBOrgRoutine {
  id: string;
  tenant_id: string;
  process_id: string;
  name: string;
  description: string | null;
  objective: string | null;
  responsible_roles: unknown;
  documentation: unknown;
  created_at: string;
  updated_at: string;
}

export interface DBOrgActivity {
  id: string;
  tenant_id: string;
  routine_id: string;
  name: string;
  description: string | null;
  objective: string | null;
  complexity: string;
  priority: string;
  required_role: string | null;
  average_execution_time: number | null;
  inputs: unknown;
  outputs: unknown;
  risks: unknown;
  impacts: unknown;
  responsible_roles: unknown;
  documentation: unknown;
  created_at: string;
  updated_at: string;
}

export interface DBOrgSystem {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  purpose: string | null;
  created_at: string;
  updated_at: string;
}

export interface DBOrgSystemResource {
  id: string;
  tenant_id: string;
  system_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface DBOrgSupplier {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  responsible_roles: string[];
  created_at: string;
  updated_at: string;
}

export interface DBOrgService {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  responsible_roles: string[];
  created_at: string;
  updated_at: string;
}

export interface DBOrgDocument {
  id: string;
  tenant_id: string;
  name: string;
  type: string | null;
  description: string | null;
  associated_process_id: string | null;
  responsible_roles: string[];
  created_at: string;
  updated_at: string;
}

export interface DBOrgCompanyType {
  id: string;
  tenant_id: string;
  slug: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

function parseJsonArray(val: unknown): string[] {
  if (Array.isArray(val)) return val as string[];
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function parseJsonArrayOfObjects(val: unknown): OrgInputOutput[] {
  const arr = (() => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  })();
  return arr.map((v) => (typeof v === 'string' ? { name: v } : (v as OrgInputOutput)));
}

function parseJsonObject(val: unknown): Record<string, unknown> {
  if (val && typeof val === 'object' && !Array.isArray(val)) return val as Record<string, unknown>;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }
  return {};
}

export function dbAreaToUI(row: DBOrgArea, nucleiCount = 0): OrgArea {
  return {
    id: row.id,
    tenant_id: row.tenant_id,
    name: row.name,
    description: row.description,
    objective: row.objective,
    responsible_roles: parseJsonArray(row.responsible_roles),
    documentation: parseJsonObject(row.documentation) as OrgArea['documentation'],
    created_at: row.created_at,
    updated_at: row.updated_at,
    nuclei_count: nucleiCount,
  };
}

export function dbNucleusToUI(row: DBOrgNucleus): OrgNucleus {
  return {
    id: row.id,
    tenant_id: row.tenant_id,
    area_id: row.area_id,
    name: row.name,
    description: row.description,
    objective: row.objective,
    responsible_roles: parseJsonArray(row.responsible_roles),
    documentation: parseJsonObject(row.documentation) as OrgNucleus['documentation'],
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function dbProcessToUI(row: DBOrgProcess): OrgProcess {
  return {
    id: row.id,
    tenant_id: row.tenant_id,
    area_id: row.area_id,
    nucleus_id: row.nucleus_id,
    name: row.name,
    description: row.description,
    objective: row.objective,
    inputs: parseJsonArrayOfObjects(row.inputs),
    outputs: parseJsonArrayOfObjects(row.outputs),
    responsible_roles: parseJsonArray(row.responsible_roles),
    risks: parseJsonArray(row.risks),
    impacts: parseJsonArray(row.impacts),
    documentation: parseJsonObject(row.documentation) as OrgProcess['documentation'],
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function dbRoutineToUI(row: DBOrgRoutine): OrgRoutine {
  return {
    id: row.id,
    tenant_id: row.tenant_id,
    process_id: row.process_id,
    name: row.name,
    description: row.description,
    objective: row.objective,
    responsible_roles: parseJsonArray(row.responsible_roles),
    documentation: parseJsonObject(row.documentation) as OrgRoutine['documentation'],
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function dbActivityToUI(row: DBOrgActivity): OrgActivity {
  return {
    id: row.id,
    tenant_id: row.tenant_id,
    routine_id: row.routine_id,
    name: row.name,
    description: row.description,
    objective: row.objective,
    complexity: (row.complexity as OrgActivity['complexity']) || 'medium',
    priority: (row.priority as OrgActivity['priority']) || 'normal',
    required_role: row.required_role,
    average_execution_time: row.average_execution_time,
    inputs: parseJsonArrayOfObjects(row.inputs),
    outputs: parseJsonArrayOfObjects(row.outputs),
    risks: parseJsonArray(row.risks),
    impacts: parseJsonArray(row.impacts),
    responsible_roles: parseJsonArray(row.responsible_roles),
    documentation: parseJsonObject(row.documentation) as OrgActivity['documentation'],
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function dbSystemToUI(row: DBOrgSystem): OrgSystem {
  return {
    id: row.id,
    tenant_id: row.tenant_id,
    name: row.name,
    description: row.description,
    purpose: row.purpose,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function dbSystemResourceToUI(row: DBOrgSystemResource): OrgSystemResource {
  return {
    id: row.id,
    tenant_id: row.tenant_id,
    system_id: row.system_id,
    name: row.name,
    description: row.description,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function dbSupplierToUI(row: DBOrgSupplier): OrgSupplier {
  return {
    id: row.id,
    tenant_id: row.tenant_id,
    name: row.name,
    description: row.description,
    responsible_roles: row.responsible_roles || [],
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function dbServiceToUI(row: DBOrgService): OrgService {
  return {
    id: row.id,
    tenant_id: row.tenant_id,
    name: row.name,
    description: row.description,
    responsible_roles: row.responsible_roles || [],
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function dbOrgDocumentToUI(row: DBOrgDocument): OrgDocument {
  return {
    id: row.id,
    tenant_id: row.tenant_id,
    name: row.name,
    type: row.type,
    description: row.description,
    associated_process_id: row.associated_process_id,
    responsible_roles: row.responsible_roles || [],
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function dbCompanyTypeToUI(row: DBOrgCompanyType): OrgCompanyType {
  return {
    id: row.id,
    tenant_id: row.tenant_id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * AI Context Engineering — Story 9.8
 * Transforms organization entities into flat AI context for Chatbot AI (EPIC 7.4)
 */

/**
 * Flat AI context for organization entities.
 * Optimized for tokenization and AI prompt injection.
 *
 * @example
 * const process = await getProcess(id);
 * const context = toAIContext(process);
 * const prompt = `Baseado neste processo: ${JSON.stringify(context)}...`;
 */
export interface OrgAIContext {
  entityType: 'process' | 'routine' | 'activity';
  entityId: string;
  title: string;
  objective: string | null;
  description: string | null;
  roles: string[];
  procedures: string | null;
  instructions: string | null;
  steps: string[]; // Separate array for easy tokenization
  rules: string | null; // documentation.regra — marked for AI emphasis
  deadline: string | null; // documentation.prazo
  executionLimit: string | null; // documentation.horario_limite
  inputs: Array<{ name: string; description?: string; required: boolean }>;
  outputs: Array<{ name: string; description?: string }>;
  risks: Array<{ name: string; severity?: string }>;
  impacts: Array<{ name: string; description?: string }>;
  avgExecutionTime: string | null; // Formatted like "45 min", "2h 30m"
  complexity?: 'low' | 'medium' | 'high'; // Activity only
  priority?: 'low' | 'normal' | 'high'; // Activity only (note: OrgActivityPriority is 'low' | 'normal' | 'high')
}

/**
 * Formats execution time in minutes to human-readable string.
 *
 * @param minutes - Number of minutes
 * @returns Formatted string like "45 min" or "2h 30m", or null if invalid
 *
 * @example
 * formatExecutionTime(45) // "45 min"
 * formatExecutionTime(90) // "1h 30m"
 * formatExecutionTime(120) // "2h"
 */
function formatExecutionTime(minutes: number | null): string | null {
  if (!minutes || minutes <= 0) return null;
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Transforms an organization entity into flat AI context.
 *
 * Uses discriminated union pattern to detect entity type:
 * - `average_execution_time` in entity → Activity
 * - `activities_count` in entity → Routine
 * - `nucleus_id` in entity → Process (default)
 *
 * @param entity - OrgProcess, OrgRoutine, or OrgActivity
 * @returns OrgAIContext — flat, serializable object without nesting
 *
 * @example
 * const process = { id: "123", name: "Approval", inputs: [...], ... };
 * const context = toAIContext(process);
 * // { entityType: "process", entityId: "123", title: "Approval", ... }
 */
export function toAIContext(entity: OrgProcess | OrgRoutine | OrgActivity): OrgAIContext {
  const documentation = entity.documentation || {};
  const inputs = (entity as OrgProcess)?.inputs || [];
  const outputs = (entity as OrgProcess)?.outputs || [];
  const risks = (entity as OrgActivity)?.risks || [];
  const impacts = (entity as OrgActivity)?.impacts || [];

  // Discriminated union: detect entity type by presence of distinctive fields
  const entityType =
    'average_execution_time' in entity
      ? 'activity'
      : 'activities_count' in entity
        ? 'routine'
        : 'process';

  // Handle roles - OrgActivity uses required_role (singular), others use responsible_roles (array)
  const roles =
    'average_execution_time' in entity
      ? (entity as OrgActivity)?.required_role
        ? [(entity as OrgActivity).required_role!]
        : []
      : (entity as OrgProcess | OrgRoutine)?.responsible_roles || [];

  return {
    entityType: entityType as 'process' | 'routine' | 'activity',
    entityId: entity.id,
    title: entity.name,
    objective: 'objective' in entity ? (entity.objective ?? null) : null,
    description: entity.description ?? null,
    roles,
    procedures: documentation.procedures ?? null,
    instructions: documentation.instructions ?? null,
    steps: Array.isArray(documentation.steps) ? documentation.steps : [],
    rules: documentation.regra ?? null,
    deadline: documentation.prazo ?? null,
    executionLimit: documentation.horario_limite ?? null,
    inputs: inputs.map((i) => ({
      name: i.name,
      description: i.description,
      required: i.required || false,
    })),
    outputs: outputs.map((o) => ({
      name: o.name,
      description: o.description,
    })),
    risks: risks.map((r) => ({
      name: typeof r === 'string' ? r : (r as any)?.name || '',
      severity: (typeof r === 'object' ? (r as any)?.severity : undefined) || undefined,
    })),
    impacts: impacts.map((im) => ({
      name: typeof im === 'string' ? im : (im as any)?.name || '',
      description: (typeof im === 'object' ? (im as any)?.description : undefined) || undefined,
    })),
    avgExecutionTime:
      'average_execution_time' in entity
        ? formatExecutionTime(entity.average_execution_time)
        : null,
    ...('complexity' in entity && { complexity: entity.complexity }),
    ...('priority' in entity && { priority: entity.priority }),
  };
}
