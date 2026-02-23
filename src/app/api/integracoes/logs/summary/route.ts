export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

/**
 * GET /api/integracoes/logs/summary - Fetch sync execution summaries
 *
 * AUTHORIZATION: Users with role='admin' or 'user' can read sync summaries for their tenant
 *
 * Returns aggregated sync_logs entries for the last 50 sync operations.
 *
 * Response:
 * {
 *   data: SyncLog[],
 *   meta: { query_time_ms, returned_count }
 * }
 */
export async function GET() {
  const startTime = Date.now();

  try {
    // STEP 1: Check authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('[GET /api/integracoes/logs/summary] Auth error:', authError?.message);
      return NextResponse.json(
        { error: 'Não autenticado. Faça login para continuar.' },
        { status: 401 },
      );
    }

    // STEP 2: Get user profile for tenant_id and role check
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error(
        '[GET /api/integracoes/logs/summary] Profile lookup error:',
        profileError.message,
      );
      return NextResponse.json({ error: 'Erro ao carregar perfil do usuário.' }, { status: 500 });
    }

    if (!profile) {
      console.error('[GET /api/integracoes/logs/summary] Profile not found for user:', user.id);
      return NextResponse.json({ error: 'Perfil não encontrado.' }, { status: 404 });
    }

    // STEP 3: Check authorization (admin/user only)
    if (!['admin', 'user'].includes(profile.role)) {
      console.warn(
        `[GET /api/integracoes/logs/summary] Unauthorized: user ${user.id} has role ${profile.role}`,
      );
      return NextResponse.json(
        { error: `Sem permissão. Sua role (${profile.role}) não permite acesso a logs.` },
        { status: 403 },
      );
    }

    // STEP 4: Use service client to access data
    const serviceClient = createServiceClient();

    // STEP 5: Fetch last 50 sync executions for user's tenant
    const { data, error } = await serviceClient
      .from('sync_logs')
      .select('*')
      .eq('tenant_id', profile.tenant_id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('[GET /api/integracoes/logs/summary] Query error:', error.message);
      return NextResponse.json(
        { error: 'Erro ao buscar resumo de sincronizações.' },
        { status: 500 },
      );
    }

    // STEP 6: Return successful response
    const queryTime = Date.now() - startTime;
    return NextResponse.json({
      data: data || [],
      meta: {
        query_time_ms: queryTime,
        returned_count: (data || []).length,
      },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('[GET /api/integracoes/logs/summary] Unexpected error:', {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: 'Erro interno do servidor. Contate o administrador.' },
      { status: 500 },
    );
  }
}
