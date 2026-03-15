/**
 * Organization types — AI Organizational Bootstrap
 * Aligned with supabase/migrations/060_org_bootstrap_schema.sql
 */

export type OrgActivityComplexity = 'low' | 'medium' | 'high';
export type OrgActivityPriority = 'low' | 'normal' | 'high';

export interface OrgArea {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  objective: string | null;
  responsible_roles: string[];
  documentation: OrgDocumentation;
  created_at: string;
  updated_at: string;
  nuclei_count?: number;
}

export interface OrgNucleus {
  id: string;
  tenant_id: string;
  area_id: string;
  name: string;
  description: string | null;
  objective: string | null;
  responsible_roles: string[];
  documentation: OrgDocumentation;
  created_at: string;
  updated_at: string;
  area?: OrgArea | null;
  processes_count?: number;
}

export interface OrgProcess {
  id: string;
  tenant_id: string;
  area_id: string | null;
  nucleus_id: string | null;
  name: string;
  description: string | null;
  objective: string | null;
  inputs: OrgInputOutput[];
  outputs: OrgInputOutput[];
  responsible_roles: string[];
  risks: string[];
  impacts: string[];
  documentation: OrgDocumentation;
  created_at: string;
  updated_at: string;
  area?: OrgArea | null;
  nucleus?: OrgNucleus | null;
}

export interface OrgRoutine {
  id: string;
  tenant_id: string;
  process_id: string;
  name: string;
  description: string | null;
  objective: string | null;
  responsible_roles: string[];
  documentation: OrgDocumentation;
  created_at: string;
  updated_at: string;
  process?: OrgProcess | null;
  activities_count?: number;
}

export interface OrgActivity {
  id: string;
  tenant_id: string;
  routine_id: string;
  name: string;
  description: string | null;
  objective: string | null;
  complexity: OrgActivityComplexity;
  priority: OrgActivityPriority;
  required_role: string | null;
  average_execution_time: number | null;
  inputs: OrgInputOutput[];
  outputs: OrgInputOutput[];
  risks: string[];
  impacts: string[];
  responsible_roles: string[]; // Story 11.1: Added for role-based activity management
  documentation: OrgActivityDocumentation;
  created_at: string;
  updated_at: string;
  routine?: OrgRoutine | null;
}

export interface OrgSystem {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  purpose: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrgSystemResource {
  id: string;
  tenant_id: string;
  system_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  system?: OrgSystem | null;
}

export interface OrgSupplier {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  responsible_roles: string[];
  created_at: string;
  updated_at: string;
}

export interface OrgService {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  responsible_roles: string[];
  created_at: string;
  updated_at: string;
}

export interface OrgDocument {
  id: string;
  tenant_id: string;
  name: string;
  type: string | null;
  description: string | null;
  associated_process_id: string | null;
  responsible_roles: string[];
  created_at: string;
  updated_at: string;
  process?: OrgProcess | null;
}

export interface OrgCompanyType {
  id: string;
  tenant_id: string;
  slug: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrgBootstrapTemplate {
  id: string;
  company_type_id: string;
  entity_type: string;
  payload: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface OrgDocumentation {
  procedures?: string;
  instructions?: string;
  best_practices?: string;
  internal_guidelines?: string;
  common_errors?: string;
  /** BPM/Espaider: fonte (ex.: espaider) */
  source?: string;
  /** BPM/Espaider: documento de referência */
  doc?: string;
  /** BPM/Espaider: horário limite */
  horario_limite?: string;
  /** BPM/Espaider: regra de negócio */
  regra?: string;
  /** BPM/Espaider: disponível a partir de */
  disponivel_a_partir?: string;
  /** BPM: passos da rotina */
  steps?: string[];
  /** BPM: prazo (ex.: 24h) */
  prazo?: string;
}

export interface OrgActivityDocumentation extends OrgDocumentation {
  step_by_step?: string;
  guidelines?: string;
}

export interface OrgInputOutput {
  name: string;
  description?: string;
  required?: boolean;
}

/**
 * AI Context for organization entities
 * Flat structure optimized for tokenization and AI prompt injection
 * @see src/lib/transformers/organization.ts toAIContext()
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
  priority?: 'low' | 'normal' | 'high'; // Activity only
}

// =============================================================================
// EPIC 11: New entity types for Organizational Enrichment & BPM Mastery
// =============================================================================

/**
 * Story 11.2: Activity-System relationship (many-to-many junction)
 * Maps which systems are used in each activity
 */
export interface OrgActivitySystem {
  activity_id: string;
  system_id: string;
  tenant_id: string;
  usage_context?: string; // e.g., "data entry", "query lookup", "report generation"
  created_at: string;
  updated_at: string;
}

/**
 * Story 11.2 extended: Activity with systems
 * Populated when needed with JOIN from org_activity_systems
 */
export interface OrgActivityWithSystems extends OrgActivity {
  systems?: OrgSystem[];
}

/**
 * Story 11.3: Service Level Agreement definition for a process
 * Defines performance targets and thresholds
 */
export interface OrgProcessSla {
  id: string;
  tenant_id: string;
  process_id: string;
  metric_name: string; // e.g., "completion_time", "quality_score"
  target_duration_days: number;
  warning_threshold_pct: number; // e.g., 80 = warning at 80% of SLA
  critical_threshold_pct: number; // e.g., 95 = critical at 95% of SLA
  created_at: string;
  updated_at: string;
}

/**
 * Story 11.3: Aggregated process metrics for a time period
 * Stores observed performance metrics
 */
export interface OrgProcessMetrics {
  id: string;
  tenant_id: string;
  process_id: string;
  period_start: string; // DATE as ISO string
  period_end: string;
  metric_name: string;
  avg_duration_days?: number;
  compliance_pct?: number; // Percentage of instances meeting SLA
  instances_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Story 11.4: Role definition in organizational hierarchy
 * Defines organizational roles and their metadata
 */
export interface OrgRoleDefinition {
  id: string;
  tenant_id: string;
  role_id: string; // e.g., "diretor", "gerente", "coordenador", "analista_senior"
  role_name: string;
  description?: string;
  category: 'management' | 'specialist' | 'operational' | 'external';
  level: number; // 1-10: hierarchical ordering (10 = most senior)
  created_at: string;
  updated_at: string;
}

/**
 * Story 11.4: Role-based permission grant
 * Defines what actions a role can perform on resource types
 */
export interface OrgRolePermission {
  id: string;
  tenant_id: string;
  role_id: string;
  resource_type: string; // area|process|activity|document|system|supplier|routine
  action: string; // view|create|edit|delete|approve|manage
  scope: string; // own_tenant|own_unit|all_units
  conditions?: Record<string, unknown>; // Complex permission rules (future use)
  created_at: string;
  updated_at: string;
}

/**
 * Story 11.5: Reusable activity pattern template
 * Allows cloning activities from templates within a nucleus
 */
export interface OrgActivityTemplate {
  id: string;
  tenant_id: string;
  nucleus_id?: string;
  name: string;
  description?: string;
  complexity: OrgActivityComplexity;
  priority: OrgActivityPriority;
  inputs: OrgInputOutput[];
  outputs: OrgInputOutput[];
  risks: string[];
  impacts: string[];
  documentation: OrgActivityDocumentation;
  created_at: string;
  updated_at: string;
}

/**
 * Story 11.5: Immutable process version snapshot
 * Append-only audit trail of process changes
 */
export interface OrgProcessVersion {
  id: string;
  tenant_id: string;
  process_id: string;
  version_number: number; // Auto-incrementing per process
  process_snapshot: Record<string, unknown>; // Complete process state at this version
  change_summary?: string;
  changed_by?: string; // Profile ID of who made the change
  created_at: string;
  // Note: No updated_at — versions are immutable
}
