export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { exportarDados } from '@/integrations/espaider/client';
import { validateConnectivity } from '@/integrations/espaider-v2/client';

/**
 * POST /api/integracoes/test - Test connection to an Espaider API
 *
 * Query: ?version=v2 → uses v2 client (header auth, ConsultarRegistros)
 * Query: (default)   → uses v1 client (body auth, ExportaDados)
 *
 * Body for v1: { base_url, token, identificador }
 * Body for v2: { base_url, token }
 *
 * Returns: { success, totalRecords } or { success: false, error }
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const version = req.nextUrl.searchParams.get('version');

  try {
    if (version === 'v2') {
      const { base_url, token } = await req.json();

      if (!base_url || !token) {
        return NextResponse.json(
          { success: false, error: 'Parâmetros obrigatórios para v2: base_url, token' },
          { status: 400 },
        );
      }

      const result = await validateConnectivity({ baseUrl: base_url, token });

      return NextResponse.json({
        success: result.success,
        version: 'v2',
        totalRecords: result.recordCount,
        childDatasetCount: result.childDatasetCount,
        situacao: result.situacao,
        durationMs: result.durationMs,
        ...(result.error ? { error: result.error } : {}),
      });
    }

    // v1 (default)
    const { base_url, token, identificador } = await req.json();

    if (!base_url || !token || !identificador) {
      return NextResponse.json(
        { success: false, error: 'Parâmetros obrigatórios: base_url, token, identificador' },
        { status: 400 },
      );
    }

    const response = await exportarDados({
      identificador,
      baseUrl: base_url,
      token,
    });

    return NextResponse.json({
      success: true,
      version: 'v1',
      totalRecords: response.ListaRegistros.length,
      situacao: response.Situacao,
    });
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : typeof err === 'object' && err !== null && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Erro desconhecido';

    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
