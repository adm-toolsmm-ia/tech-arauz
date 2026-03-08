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
  created_at: string;
  updated_at: string;
}

export interface DBOrgService {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
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
  return arr.map((v) =>
    typeof v === 'string' ? { name: v } : (v as OrgInputOutput),
  );
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
