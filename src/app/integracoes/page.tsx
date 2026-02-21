import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { IntegracoesContent } from './integracoes-content';

export default async function IntegracoesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user role (components fetch their own data via API)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return <IntegracoesContent userRole={profile?.role ?? 'viewer'} />;
}
