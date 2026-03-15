'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';
import type {
  OrgArea,
  OrgNucleus,
  OrgProcess,
} from '@/types/organization';
import type {
  OrganizationType,
  BootstrapTemplate,
  WizardAreaSetup,
} from '@/lib/organization/bootstrap-templates';
import {
  getBootstrapTemplate,
  listBootstrapTemplates,
} from '@/lib/organization/bootstrap-templates';

export interface OrgActionResult<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

type AuthContextError = { error: string };
type AuthContextSuccess = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: User;
  tenantId: string;
};
type AuthContext = AuthContextError | AuthContextSuccess;

async function getAuthContext(): Promise<AuthContext> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Usuário não autenticado. Faça login novamente.' };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (profileError || !profile?.tenant_id) {
    return { error: 'Perfil não encontrado. Contate o administrador.' };
  }

  return { supabase, user, tenantId: profile.tenant_id as string };
}

/**
 * Get bootstrap templates for organization type
 * Story 11.12: Step 2 (Template Selection)
 */
export async function getBootstrapTemplatesAction(
  organizationType: OrganizationType
): Promise<OrgActionResult<BootstrapTemplate>> {
  try {
    if (!organizationType) {
      throw new Error('Tipo de organização não especificado');
    }

    const template = getBootstrapTemplate(organizationType);
    return {
      success: true,
      message: 'Template obtido com sucesso',
      data: template,
    };
  } catch (error) {
    console.error('Error fetching bootstrap template:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao obter template',
    };
  }
}

/**
 * List all available bootstrap templates
 */
export async function listBootstrapTemplatesAction(): Promise<
  OrgActionResult<ReturnType<typeof listBootstrapTemplates>>
> {
  try {
    const templates = listBootstrapTemplates();
    return {
      success: true,
      message: 'Templates listados com sucesso',
      data: templates,
    };
  } catch (error) {
    console.error('Error listing bootstrap templates:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao listar templates',
    };
  }
}

/**
 * Validate wizard step data
 * Story 11.12: Step validation
 */
export async function validateWizardStepAction(
  step: number,
  data: Record<string, any>
): Promise<OrgActionResult<{ valid: boolean; errors: string[] }>> {
  try {
    const errors: string[] = [];

    switch (step) {
      case 1: {
        // Organization basics validation
        if (!data.organization_type) {
          errors.push('Tipo de organização é obrigatório');
        }
        break;
      }

      case 2: {
        // Template selection validation
        if (!data.template_id) {
          errors.push('Template deve ser selecionado');
        }
        break;
      }

      case 3: {
        // Areas customization validation
        if (!Array.isArray(data.areas) || data.areas.length === 0) {
          errors.push('Pelo menos uma área é obrigatória');
        }

        (data.areas as WizardAreaSetup[]).forEach((area, idx) => {
          if (!area.name?.trim()) {
            errors.push(`Área ${idx + 1}: nome é obrigatório`);
          }
          if (!Array.isArray(area.nuclei) || area.nuclei.length === 0) {
            errors.push(`Área "${area.name}": pelo menos um núcleo é obrigatório`);
          }
          area.nuclei.forEach((nucleus, nIdx) => {
            if (!nucleus.name?.trim()) {
              errors.push(`Área "${area.name}", Núcleo ${nIdx + 1}: nome é obrigatório`);
            }
          });
        });
        break;
      }

      case 4: {
        // Process templates validation
        if (!Array.isArray(data.processes)) {
          errors.push('Processos devem ser um array');
        }
        break;
      }

      case 5: {
        // Integration review validation
        if (!data.organization_type) {
          errors.push('Tipo de organização não confirmado');
        }
        break;
      }

      default:
        errors.push('Passo inválido');
    }

    return {
      success: true,
      message: errors.length === 0 ? 'Validação bem-sucedida' : 'Validação encontrou erros',
      data: {
        valid: errors.length === 0,
        errors,
      },
    };
  } catch (error) {
    console.error('Error validating wizard step:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao validar passo',
    };
  }
}

/**
 * Create organization from wizard data
 * Story 11.12: Step 5 (Final submission)
 * This is a simplified version - full implementation would bulk-insert areas, nuclei, processes
 */
export async function createOrgFromWizardAction(
  wizardData: Record<string, any>
): Promise<OrgActionResult<{ organization_id: string }>> {
  const ctx = await getAuthContext();
  if ('error' in ctx) {
    return { success: false, message: ctx.error };
  }

  try {
    const { organization_type, areas } = wizardData;

    if (!organization_type || !Array.isArray(areas) || areas.length === 0) {
      throw new Error('Dados do wizard incompletos');
    }

    // Get current organization (from context)
    const { data: orgData, error: orgError } = await ctx.supabase
      .from('organizations')
      .select('id')
      .eq('tenant_id', ctx.tenantId)
      .single();

    if (orgError || !orgData) {
      throw new Error('Organização não encontrada');
    }

    const organizationId = orgData.id;

    // Bulk insert areas with nuclei
    const createdAreas: OrgArea[] = [];

    for (const areaPayload of areas as WizardAreaSetup[]) {
      const { data: areaData, error: areaError } = await ctx.supabase
        .from('org_areas')
        .insert({
          tenant_id: ctx.tenantId,
          organization_id: organizationId,
          name: areaPayload.name,
          description: areaPayload.description || null,
        })
        .select()
        .single();

      if (areaError || !areaData) {
        throw new Error(`Erro ao criar área: ${areaPayload.name}`);
      }

      createdAreas.push(areaData);

      // Insert nuclei for this area
      if (areaPayload.nuclei && areaPayload.nuclei.length > 0) {
        const nucleiPayloads = areaPayload.nuclei.map(nucleus => ({
          tenant_id: ctx.tenantId,
          area_id: areaData.id,
          name: nucleus.name,
          description: nucleus.description || null,
        }));

        const { error: nucleiError } = await ctx.supabase
          .from('org_nuclei')
          .insert(nucleiPayloads);

        if (nucleiError) {
          throw new Error(`Erro ao criar núcleos para área: ${areaPayload.name}`);
        }
      }
    }

    // Revalidate paths
    revalidatePath('/organizacao');
    revalidatePath('/organizacao/areas');
    revalidatePath('/organizacao/nucleos');

    return {
      success: true,
      message: 'Organização inicializada com sucesso',
      data: { organization_id: organizationId },
    };
  } catch (error) {
    console.error('Error creating organization from wizard:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao criar organização',
    };
  }
}
