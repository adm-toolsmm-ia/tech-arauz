'use server';

import { createClient } from '@/lib/supabase/server';

export async function switchIntegrationVersion(
  apiVersion: 'v1' | 'v2'
): Promise<{
  success: boolean;
  activeVersion?: string;
  message: string;
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: 'Unauthorized' };
    }

    // Get tenant
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    if (!profile?.tenant_id) {
      return { success: false, message: 'Tenant not found' };
    }

    // Update espaider_apis settings
    const tipoToUpdate = apiVersion === 'v1' ? 'Projetos' : 'Projetos-v2';

    const { error } = await supabase
      .from('espaider_apis')
      .update({
        settings: {
          api_version: apiVersion
        },
        updated_at: new Date().toISOString()
      })
      .eq('tenant_id', profile.tenant_id)
      .eq('tipo', tipoToUpdate);

    if (error) {
      return {
        success: false,
        message: `Failed to update API version: ${error.message}`
      };
    }

    return {
      success: true,
      activeVersion: apiVersion,
      message: `Switched to API v${apiVersion === 'v1' ? '1' : '2'}`
    };
  } catch (err) {
    console.error('Error switching API version:', err);
    return {
      success: false,
      message: 'Internal server error'
    };
  }
}
