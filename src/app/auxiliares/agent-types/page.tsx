import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AgentTypesContent } from './agent-types-content';
import type { AgentType, LmProvider } from '@/types/agents';

/**
 * Server Component: Fetch agent types and providers (for edit form) and pass to client
 */
export default async function AgentTypesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: agentTypes, error } = await supabase
    .from('agent_types')
    .select('*')
    .order('name', { ascending: true });

  const { data: providers } = await supabase
    .from('lm_providers')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching agent types:', error);
  }

  return (
    <AgentTypesContent
      initialAgentTypes={(agentTypes as AgentType[]) || []}
      providers={(providers as LmProvider[]) || []}
    />
  );
}
