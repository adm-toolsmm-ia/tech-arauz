export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import {
  encryptIntegrationToken,
  hasIntegrationTokenSecret,
} from '@/lib/security/integration-token';

const TENANT_ARAUZ_ID = '00000000-0000-0000-0000-000000000001';

/**
 * POST /api/integracoes/setup - Setup initial Espaider API configuration
 *
 * Uses service role to bypass RLS and ensure the API is properly inserted.
 * Requires authenticated admin user.
 */
export async function POST() {
  // 1. Verify user is authenticated and is admin
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json(
      { success: false, error: 'Acesso negado - apenas admins' },
      { status: 403 },
    );
  }

  // 2. Use service client to bypass RLS
  const serviceClient = createServiceClient();
  const tenantId = profile.tenant_id || TENANT_ARAUZ_ID;
  const envToken = process.env.ESPAIDER_TOKEN?.trim();
  const tokenToStore =
    envToken && hasIntegrationTokenSecret() ? encryptIntegrationToken(envToken) : 'PREENCHER_TOKEN';

  try {
    // 3. Check if API already exists
    const { data: existing } = await serviceClient
      .from('espaider_apis')
      .select('id, nome')
      .eq('tenant_id', tenantId)
      .eq('identificador', 'BI_SOLICITACOES_SUPORTEESPAIDER')
      .single();

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'API já cadastrada',
        api: existing,
      });
    }

    // 4. Insert the API
    const { data: newApi, error } = await serviceClient
      .from('espaider_apis')
      .insert({
        tenant_id: tenantId,
        nome: 'API Projetos Espaider',
        base_url: 'https://espaider.com.br/Arauz/WCF/WCFExportaDados/WCFExportaDados.svc',
        token: tokenToStore,
        identificador: 'BI_SOLICITACOES_SUPORTEESPAIDER',
        tipo: 'projetos',
        is_active: true,
        settings: { fluxo: 'hierarquico', inclui_filhos: true },
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting API:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // 5. Ensure user profile has correct tenant_id
    const { error: profileError } = await serviceClient
      .from('profiles')
      .update({ tenant_id: tenantId })
      .eq('id', user.id);

    if (profileError) {
      console.warn('Could not update profile tenant_id:', profileError);
    }

    return NextResponse.json({
      success: true,
      message: 'API cadastrada com sucesso',
      api: newApi,
    });
  } catch (err) {
    console.error('Setup error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Erro desconhecido',
      },
      { status: 500 },
    );
  }
}
