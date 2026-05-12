export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { runEspaiderSync } from '@/lib/sync/sync-orchestrator';

const TENANT_ARAUZ_ID = '00000000-0000-0000-0000-000000000001';

/**
 * POST /api/integracoes/sync - Trigger a full sync from Espaider
 *
 * AUTHORIZATION: Only 'admin' role users can trigger sync (not 'user' or 'viewer')
 *
 * Request body (optional):
 * {
 *   apiId?: string (if provided, sync only that API; if not, sync all)
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   request_id: string,
 *   details?: { ... }
 * }
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  let requestBody: { apiId?: string } = {};

  try {
    // STEP 1: Check authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('[POST /api/integracoes/sync] Auth error:', authError?.message);
      return NextResponse.json(
        {
          success: false,
          message: 'Não autenticado. Faça login para continuar.',
        },
        { status: 401 },
      );
    }

    // STEP 2: Parse request body (optional)
    try {
      const text = await req.text();
      if (text) {
        requestBody = JSON.parse(text);
      }
    } catch (parseErr) {
      // Body is optional, ignore parse errors
    }

    // STEP 3: Get user profile for tenant_id and role check
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('[POST /api/integracoes/sync] Profile lookup error:', profileError.message);
      return NextResponse.json(
        {
          success: false,
          message: 'Erro ao carregar perfil do usuário.',
        },
        { status: 500 },
      );
    }

    if (!profile) {
      console.error('[POST /api/integracoes/sync] Profile not found for user:', user.id);
      return NextResponse.json(
        {
          success: false,
          message: 'Perfil não encontrado.',
        },
        { status: 404 },
      );
    }

    // STEP 4: Check authorization (ADMIN ONLY for sync trigger)
    if (profile.role !== 'admin') {
      console.warn(
        `[POST /api/integracoes/sync] Unauthorized: user ${user.id} has role ${profile.role}`,
      );
      return NextResponse.json(
        {
          success: false,
          message: `Sem permissão. Sua role (${profile.role}) não permite iniciar sincronizações. Apenas administradores podem fazer isso.`,
        },
        { status: 403 },
      );
    }

    // STEP 5: Use service client for sync operations
    const serviceClient = createServiceClient();
    const tenantId = profile.tenant_id || TENANT_ARAUZ_ID;

    // STEP 6: Execute sync (version routed by orchestrator)
    console.info(
      `[POST /api/integracoes/sync] Starting sync for tenant ${tenantId}, user ${user.id}`,
    );
    const result = await runEspaiderSync(serviceClient, tenantId);

    // STEP 7: Log sync result
    const duration = Date.now() - startTime;
    console.info(`[POST /api/integracoes/sync] Sync completed in ${duration}ms:`, {
      success: result.success,
      version: result.version,
      request_id: result.requestId,
    });

    // STEP 8: Return successful response
    return NextResponse.json({
      success: result.success,
      message: result.message,
      request_id: result.requestId,
      version: result.version,
      details: result.details,
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    const duration = Date.now() - startTime;
    console.error('[POST /api/integracoes/sync] Unexpected error:', {
      message: error.message,
      stack: error.stack,
      duration_ms: duration,
    });
    return NextResponse.json(
      {
        success: false,
        message: 'Erro ao iniciar sincronização. Contate o administrador.',
      },
      { status: 500 },
    );
  }
}
