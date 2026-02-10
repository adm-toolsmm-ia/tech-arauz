import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { IntegracoesContent } from './integracoes-content';

export interface EspaiderApiRow {
  id: string;
  nome: string;
  base_url: string;
  token: string;
  identificador: string;
  tipo: string;
  is_active: boolean;
  last_sync_at: string | null;
  last_sync_status: string | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export default async function IntegracoesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user profile for role check
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('Error fetching profile:', profileError);
  }

  // Fetch all APIs for this tenant
  const { data: apis, error } = await supabase
    .from('espaider_apis')
    .select('*')
    .order('tipo', { ascending: true });

  if (error) {
    console.error('Error fetching APIs:', error);
  }

  return (
    <IntegracoesContent
      apis={(apis as EspaiderApiRow[]) || []}
      userRole={profile?.role ?? 'viewer'}
      tenantId={profile?.tenant_id ?? ''}
    />
  );
}
