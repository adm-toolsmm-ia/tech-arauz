import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/integracoes - List all APIs for the user's tenant
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { data, error } = await supabase
    .from('espaider_apis')
    .select('*')
    .order('tipo');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

/**
 * POST /api/integracoes - Create a new API
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const body = await req.json();
  const {
    nome,
    identificador,
    tipo,
    is_active,
    tenant_id,
    base_url = process.env.ESPAIDER_BASE_URL,
    token = process.env.ESPAIDER_TOKEN,
  } = body;

  if (!nome || !identificador) {
    return NextResponse.json({ error: 'Nome e Identificador são obrigatórios' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('espaider_apis')
    .insert({
      tenant_id,
      nome,
      base_url: base_url || process.env.ESPAIDER_BASE_URL,
      token: token || process.env.ESPAIDER_TOKEN,
      identificador,
      tipo: tipo || 'projetos',
      is_active: is_active ?? true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}

/**
 * PUT /api/integracoes - Update an existing API
 */
export async function PUT(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const body = await req.json();
  const { id, nome, base_url, token, identificador, tipo, is_active } = body;

  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

  const { data, error } = await supabase
    .from('espaider_apis')
    .update({ nome, base_url, token, identificador, tipo, is_active })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

/**
 * DELETE /api/integracoes?id=xxx - Remove an API
 */
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

  const { error } = await supabase
    .from('espaider_apis')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
