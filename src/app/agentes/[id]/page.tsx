import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AgentEditContent from './agent-edit-content';

interface AgentEditPageProps {
  params: { id: string };
}

export default async function AgentEditPage({ params }: AgentEditPageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const { data: agent } = await supabase.from('agents').select('*').eq('id', params.id).single();

  if (!agent) {
    return notFound();
  }

  return <AgentEditContent initialAgent={agent} />;
}
