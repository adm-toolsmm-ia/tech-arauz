export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  encryptIntegrationToken,
  hasIntegrationTokenSecret,
} from '@/lib/security/integration-token';

type IntegracaoPayload = {
  id?: string;
  nome?: string;
  base_url?: string;
  token?: string;
  identificador?: string;
  tipo?: string;
  is_active?: boolean;
};

function buildTokenForStorage(token: string | undefined): string | null {
  const normalized = typeof token === 'string' ? token.trim() : '';
  if (!normalized) return 'PREENCHER_TOKEN';
  if (!hasIntegrationTokenSecret()) {
    // Fallback: store plaintext when encryption secret is not configured.
    // resolveApiToken() in espaider-sync.ts handles plaintext tokens natively.
    console.warn(
      '[integracoes] INTEGRATION_TOKEN_SECRET not set — storing token in plaintext. ' +
      'Configure the secret for encrypted storage.',
    );
    return normalized;
  }
  return encryptIntegrationToken(normalized);
}

/**
 * GET /api/integracoes - List all APIs for the user's tenant
 *
 * AUTHORIZATION: authenticated users with role admin/user
 * RLS: filtered by tenant_id from user profile
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nao autenticado. Faca login para continuar.' },
        { status: 401 },
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('[GET /api/integracoes] Profile error:', profileError?.message);
      return NextResponse.json({ error: 'Erro ao carregar perfil do usuario.' }, { status: 500 });
    }

    if (!['admin', 'user'].includes(profile.role)) {
      return NextResponse.json(
        { error: `Sem permissao. Role "${profile.role}" nao tem acesso a integracoes.` },
        { status: 403 },
      );
    }

    const { data, error } = await supabase
      .from('espaider_apis')
      .select(
        'id, tenant_id, nome, identificador, tipo, is_active, base_url, last_sync_at, last_sync_status, created_at, updated_at',
      )
      .eq('tenant_id', profile.tenant_id)
      .order('tipo');

    if (error) {
      console.error('[GET /api/integracoes] Query error:', error.message);
      return NextResponse.json({ error: 'Erro ao buscar APIs.' }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('[GET /api/integracoes] Unexpected error:', error.message);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}

/**
 * POST /api/integracoes - Create a new API (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Nao autenticado.' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Apenas administradores podem cadastrar APIs.' },
        { status: 403 },
      );
    }

    const body = (await req.json()) as IntegracaoPayload;
    const { nome, identificador, tipo, is_active } = body;

    if (!nome || !identificador) {
      return NextResponse.json(
        { error: 'Nome e Identificador sao obrigatorios.' },
        { status: 400 },
      );
    }

    const tokenToStore = buildTokenForStorage(body.token);

    const { data, error } = await supabase
      .from('espaider_apis')
      .insert({
        tenant_id: profile.tenant_id,
        nome,
        base_url: body.base_url || process.env.ESPAIDER_BASE_URL,
        token: tokenToStore,
        identificador,
        tipo: tipo || 'projetos',
        is_active: is_active ?? true,
      })
      .select(
        'id, tenant_id, nome, identificador, tipo, is_active, base_url, last_sync_at, last_sync_status, created_at, updated_at',
      )
      .single();

    if (error) {
      console.error('[POST /api/integracoes] Insert error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('[POST /api/integracoes] Unexpected error:', error.message);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}

/**
 * PUT /api/integracoes - Update an existing API (admin only)
 */
export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Nao autenticado.' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Apenas administradores podem editar APIs.' },
        { status: 403 },
      );
    }

    const body = (await req.json()) as IntegracaoPayload;
    const { id, nome, base_url, identificador, tipo, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID obrigatorio.' }, { status: 400 });
    }

    const updates: Record<string, unknown> = {
      nome,
      base_url,
      identificador,
      tipo,
      is_active,
    };

    if (Object.prototype.hasOwnProperty.call(body, 'token')) {
      const tokenToStore = buildTokenForStorage(body.token);
      updates.token = tokenToStore;
    }

    const { data, error } = await supabase
      .from('espaider_apis')
      .update(updates)
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .select(
        'id, tenant_id, nome, identificador, tipo, is_active, base_url, last_sync_at, last_sync_status, created_at, updated_at',
      )
      .single();

    if (error) {
      console.error('[PUT /api/integracoes] Update error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('[PUT /api/integracoes] Unexpected error:', error.message);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}

/**
 * DELETE /api/integracoes?id=xxx - Remove an API (admin only)
 */
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Nao autenticado.' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Apenas administradores podem remover APIs.' },
        { status: 403 },
      );
    }

    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID obrigatorio.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('espaider_apis')
      .delete()
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id);

    if (error) {
      console.error('[DELETE /api/integracoes] Delete error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('[DELETE /api/integracoes] Unexpected error:', error.message);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}
