export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

/**
 * GET /api/integracoes/logs - Fetch integration log entries with filters and pagination
 *
 * AUTHORIZATION: Users with role='admin' or 'user' can read logs for their tenant
 *
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 50, max: 100)
 * - level: Filter by level (info, warn, error, success)
 * - dataset: Filter by dataset (Projetos, Entregas, Cronogramas, Requisitos, Historicos, Aprovadores, Orcamentos, TempoPermanencia, HorasLancadas, Geral)
 * - startDate: ISO date string for range start
 * - endDate: ISO date string for range end
 * - requestId: Filter by specific sync request
 *
 * Response:
 * {
 *   data: LogEntry[],
 *   pagination: { page, limit, total, totalPages },
 *   meta: { query_time_ms, returned_count }
 * }
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now();

  try {
    // STEP 1: Check authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('[GET /api/integracoes/logs] Auth error:', authError?.message);
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
      console.error('[GET /api/integracoes/logs] Profile lookup error:', profileError.message);
      return NextResponse.json({ error: 'Erro ao carregar perfil do usuário.' }, { status: 500 });
    }

    if (!profile) {
      console.error('[GET /api/integracoes/logs] Profile not found for user:', user.id);
      return NextResponse.json({ error: 'Perfil não encontrado.' }, { status: 404 });
    }

    // STEP 3: Check authorization (admin/user only)
    if (!['admin', 'user'].includes(profile.role)) {
      console.warn(
        `[GET /api/integracoes/logs] Unauthorized: user ${user.id} has role ${profile.role}`,
      );
      return NextResponse.json(
        { error: `Sem permissão. Sua role (${profile.role}) não permite acesso a logs.` },
        { status: 403 },
      );
    }

    // STEP 4: Parse and validate query params
    const searchParams = req.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const level = searchParams.get('level') || undefined;
    const dataset = searchParams.get('dataset') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const requestId = searchParams.get('requestId') || undefined;
    const search = searchParams.get('search') || undefined;

    // STEP 5: Use service client to access data (bypasses RLS, but user auth + role already checked)
    const serviceClient = createServiceClient();

    // STEP 6: Build query with tenant filter
    let query = serviceClient
      .from('integration_log_entries')
      .select('*', { count: 'exact' })
      .eq('tenant_id', profile.tenant_id)
      .order('logged_at', { ascending: false });

    // Apply optional filters
    if (level) {
      query = query.eq('level', level);
    }
    if (dataset) {
      query = query.eq('dataset', dataset);
    }
    if (startDate) {
      query = query.gte('logged_at', startDate);
    }
    if (endDate) {
      // Include the entire end date day
      query = query.lte('logged_at', `${endDate}T23:59:59.999Z`);
    }
    if (requestId) {
      query = query.eq('request_id', requestId);
    }
    if (search) {
      query = query.ilike('message', `%${search}%`);
    }

    // STEP 7: Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    // STEP 8: Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error('[GET /api/integracoes/logs] Query error:', error.message);
      return NextResponse.json(
        { error: 'Erro ao buscar logs. Tente novamente mais tarde.' },
        { status: 500 },
      );
    }

    // STEP 9: Return successful response
    const queryTime = Date.now() - startTime;
    return NextResponse.json({
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      meta: {
        query_time_ms: queryTime,
        returned_count: (data || []).length,
      },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('[GET /api/integracoes/logs] Unexpected error:', {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: 'Erro interno do servidor. Contate o administrador.' },
      { status: 500 },
    );
  }
}
