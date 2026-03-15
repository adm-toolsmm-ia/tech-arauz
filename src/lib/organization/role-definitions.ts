/**
 * Organization Role Definitions — Role Registry
 * Story 10.2: Responsible Roles UI Component
 * Story 11.6: ResponsibleRolesInput Component (EPIC 11)
 * Story 11.4: Role Permissions & Governance
 *
 * Roles synced with Migration 069 (org_role_definitions seed)
 * Extensível para future DB-driven roles
 */

export interface RoleDefinition {
  value: string;
  label: string;
  description?: string;
  category: 'management' | 'specialist' | 'operational' | 'external';
}

/**
 * ORGANIZATION_ROLES — 9 default roles (Story 11.4 + 11.6)
 * Aligned with Migration 069 org_role_definitions seed
 * Organizados por categoria hierárquica
 */
export const ORGANIZATION_ROLES: RoleDefinition[] = [
  // Management (Gestão)
  { value: 'diretor', label: 'Diretor', description: 'Direção/Diretoria', category: 'management' },
  { value: 'gerente', label: 'Gerente', description: 'Gerência de área', category: 'management' },
  { value: 'coordenador', label: 'Coordenador', description: 'Coordenação de núcleo/processo', category: 'management' },

  // Specialist (Especialistas)
  { value: 'especialista', label: 'Especialista', description: 'Especialista técnico', category: 'specialist' },
  { value: 'analista_senior', label: 'Analista Sênior', description: 'Analista com senioridade', category: 'specialist' },
  { value: 'analista_junior', label: 'Analista Júnior', description: 'Analista em treinamento', category: 'specialist' },

  // Operational (Operacional)
  { value: 'operacional', label: 'Operacional', description: 'Executor operacional', category: 'operational' },
  { value: 'administrativo', label: 'Administrativo', description: 'Apoio administrativo', category: 'operational' },
  { value: 'supervisor', label: 'Supervisor', description: 'Supervisão operacional', category: 'operational' },
];

/**
 * Get all roles in a specific category
 */
export function getRolesByCategory(category: RoleDefinition['category']): RoleDefinition[] {
  return ORGANIZATION_ROLES.filter(r => r.category === category);
}

/**
 * Get all available roles
 */
export function getAllRoles(): RoleDefinition[] {
  return ORGANIZATION_ROLES;
}

/**
 * Get role label by value
 */
export function getRoleLabel(value: string): string | undefined {
  return ORGANIZATION_ROLES.find(r => r.value === value)?.label;
}

/**
 * Get role definition by value
 */
export function getRoleDefinition(value: string): RoleDefinition | undefined {
  return ORGANIZATION_ROLES.find(r => r.value === value);
}

/**
 * Pattern for EPIC 11 (Future):
 * Load roles from database instead of constant.
 * This interface and functions support both static and DB-driven roles.
 *
 * Example future usage:
 * const rolesFromDb = await fetchRolesFromDatabase();
 * getRolesByCategory('management', rolesFromDb);
 */
