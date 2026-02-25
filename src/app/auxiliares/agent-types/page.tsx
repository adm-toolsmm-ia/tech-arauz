import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { AgentTypesContent } from './agent-types-content';
import type { AgentType } from '@/types/agents';

/**
 * Server Component: Fetch agent types and pass to client
 */
export default async function AgentTypesPage() {
  const supabase = await createClient();

  // Get current user (via session)
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  try {
    // Fetch agent_types for current tenant (RLS will filter)
    const { data: agentTypes, error } = await supabase
      .from('agent_types')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching agent types:', error);
      return notFound();
    }

    return <AgentTypesContent initialAgentTypes={(agentTypes as AgentType[]) || []} />;
  } catch (error) {
    console.error('Unexpected error:', error);
    return notFound();
  }
}
