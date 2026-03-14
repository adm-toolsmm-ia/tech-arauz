/**
 * Organization Role Definitions — Role Registry
 * Story 10.2: Responsible Roles UI Component
 * Extensível para EPIC 11 (DB-driven roles)
 */

export interface RoleDefinition {
  value: string;
  label: string;
  description: string;
  category: 'management' | 'specialist' | 'operational' | 'external';
}

export const ORGANIZATION_ROLES: RoleDefinition[] = [
  // Management
  { value: 'ceo', label: 'CEO', description: 'Chief Executive Officer', category: 'management' },
  { value: 'manager', label: 'Manager', description: 'Department Manager', category: 'management' },
  { value: 'director', label: 'Director', description: 'Area Director', category: 'management' },
  { value: 'head_of_department', label: 'Head of Department', description: 'Department Head', category: 'management' },

  // Specialist
  { value: 'vendor_manager', label: 'Vendor Manager', description: 'Manages supplier relationships', category: 'specialist' },
  { value: 'procurement_lead', label: 'Procurement Lead', description: 'Leads procurement activities', category: 'specialist' },
  { value: 'analyst', label: 'Analyst', description: 'Data or business analyst', category: 'specialist' },
  { value: 'compliance_officer', label: 'Compliance Officer', description: 'Ensures regulatory compliance', category: 'specialist' },
  { value: 'legal_reviewer', label: 'Legal Reviewer', description: 'Reviews legal documents', category: 'specialist' },
  { value: 'service_lead', label: 'Service Lead', description: 'Leads service operations', category: 'specialist' },

  // Operational
  { value: 'coordinator', label: 'Coordinator', description: 'Coordinates processes', category: 'operational' },
  { value: 'executor', label: 'Executor', description: 'Executes tasks', category: 'operational' },
  { value: 'operations_manager', label: 'Operations Manager', description: 'Manages operations', category: 'operational' },

  // External
  { value: 'external_consultant', label: 'External Consultant', description: 'Consultant from outside org', category: 'external' },
  { value: 'partner', label: 'Partner', description: 'External partner', category: 'external' },
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
