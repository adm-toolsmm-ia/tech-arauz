import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { dbAgentsToUI, type DBAgent } from '@/lib/transformers/agent';
import type { LmProvider } from '@/types/agents';
import { AgentsContent } from './agentes-content';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

export default async function AgentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch agents from Supabase with related data
  const { data: agents, error } = await supabase
    .from('agents')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching agents:', error);
  }

  // Fetch LM providers for CreateAgentDialog (provedores e modelos do banco)
  const { data: providers } = await supabase
    .from('lm_providers')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  // Transform DB rows to UI format
  const uiAgents = ((agents as DBAgent[]) || []).map((a) => dbAgentsToUI([a])[0]);
  const lmProviders = (providers as LmProvider[]) || [];

  return (
    <ErrorBoundary label="Agentes">
      <AgentsContent agents={uiAgents} providers={lmProviders} />
    </ErrorBoundary>
  );
}
