import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LmProvidersContent } from './lm-providers-content';
import type { LmProvider } from '@/types/agents';

export const metadata = {
  title: 'Provedores de LM - Tech Arauz',
  description: 'Gerenciar provedores de modelos de linguagem',
};

export default async function LmProvidersPage() {
  const supabase = await createClient();
  const { data: { session }, } = await supabase.auth.getSession();
  if (!session) { redirect('/login'); }

  // Fetch LM providers
  const { data: providers, error } = await supabase
    .from('lm_providers')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching providers:', error);
    return notFound();
  }

  return (
    <LmProvidersContent
      initialProviders={(providers as LmProvider[]) || []}
    />
  );
}
