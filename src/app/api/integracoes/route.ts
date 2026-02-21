export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
        { error: 'Não autenticado. Faça login para continuar.' },
        { status: 401 },
      );
    }

    // Get user profile for tenant_id and role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('[GET /api/integracoes] Profile error:', profileError?.message);
      return NextResponse.json(
        { error: 'Erro ao carregar perfil do usuário.' },
        { status: 500 },
      );
    }

    if (!['admin', 'user'].includes(profile.role)) {
      return NextResponse.json(
        { error: `Sem permissão. Role "${profile.role}" não tem acesso a integrações.` },
        { status: 403 },
      );
    }

    const { data, error } = await supabase
      .from('espaider_apis')
      .select('*')
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
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 },
    );
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
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
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

    const body = await req.json();
    const { nome, identificador, tipo, is_active } = body;

    if (!nome || !identificador) {
      return NextResponse.json(
        { error: 'Nome e Identificador são obrigatórios.' },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from('espaider_apis')
      .insert({
        tenant_id: profile.tenant_id,
        nome,
        base_url: body.base_url || process.env.ESPAIDER_BASE_URL,
        token: body.token || process.env.ESPAIDER_TOKEN,
        identificador,
        tipo: tipo || 'projetos',
        is_active: is_active ?? true,
      })
      .select()
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
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
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

    const body = await req.json();
    const { id, nome, base_url, token, identificador, tipo, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID obrigatório.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('espaider_apis')
      .update({ nome, base_url, token, identificador, tipo, is_active })
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .select()
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
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
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
      return NextResponse.json({ error: 'ID obrigatório.' }, { status: 400 });
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
