import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { dbAgentToUI, type DBAgent } from '@/lib/transformers/agent';
import { AgentEditContent } from './agent-edit-content';

interface AgentEditPageProps {
  params: { id: string };
}

export default async function AgentEditPage({ params }: AgentEditPageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: agent, error } = await supabase
    .from('agents')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !agent) {
    notFound();
  }

  const uiAgent = dbAgentToUI(agent as DBAgent);

  return <AgentEditContent initialAgent={uiAgent} />;
}
