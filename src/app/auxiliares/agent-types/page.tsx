import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AgentTypesContent } from './agent-types-content';
import type { AgentType } from '@/types/agents';

/**
 * Server Component: Fetch agent types and pass to client
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

  if (error) {
    console.error('Error fetching agent types:', error);
  }

  return <AgentTypesContent initialAgentTypes={(agentTypes as AgentType[]) || []} />;
}
