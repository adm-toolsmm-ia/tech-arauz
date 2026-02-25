import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { dbAgentsToUI, type DBAgent } from '@/lib/transformers/agent';
import { AgentsContent } from './agentes-content';

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

  // Transform DB rows to UI format
  const uiAgents = ((agents as DBAgent[]) || []).map((a) =>
    dbAgentsToUI([a])[0]
  );

  return <AgentsContent agents={uiAgents} />;
}
