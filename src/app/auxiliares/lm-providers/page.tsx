import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LmProvidersContent } from './lm-providers-content';
import type { LmProvider } from '@/types/agents';

export const metadata = {
  title: 'Provedores IA - Tech Arauz',
  description: 'Gerenciar fornecedores de modelos de linguagem',
};

export default async function LmProvidersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: providers, error } = await supabase
    .from('lm_providers')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching providers:', error);
  }

  return <LmProvidersContent initialProviders={(providers as LmProvider[]) || []} />;
}
