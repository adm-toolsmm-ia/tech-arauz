import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { executeSyncAll } from '@/lib/sync/espaider-sync';

const TENANT_ARAUZ_ID = '00000000-0000-0000-0000-000000000001';

/**
 * POST /api/integracoes/sync - Trigger a full sync from Espaider
 *
 * Requires authenticated user with admin or user role.
 * Uses service client to bypass RLS for data operations.
 */
export async function POST() {
  // 1. Verify authentication
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, message: 'Não autenticado' }, { status: 401 });
  }

  // 2. Check permissions via user client
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ success: false, message: 'Perfil não encontrado' }, { status: 404 });
  }

  if (profile.role === 'viewer') {
    return NextResponse.json({ success: false, message: 'Sem permissão (viewer)' }, { status: 403 });
  }

  // 3. Use service client for sync operations (bypasses RLS)
  const serviceClient = createServiceClient();
  const tenantId = profile.tenant_id || TENANT_ARAUZ_ID;

  try {
    const result = await executeSyncAll(serviceClient, tenantId);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
