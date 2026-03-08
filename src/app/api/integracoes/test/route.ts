export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { exportarDados } from '@/integrations/espaider/client';

/**
 * POST /api/integracoes/test - Test connection to an Espaider API
 *
 * Body: { base_url, token, identificador }
 * Returns: { success, totalRecords } or { success: false, error }
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  try {
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
