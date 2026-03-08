import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { ConversasContent } from './conversas-content';

export const metadata = {
  title: 'Chatbot AI - Tech Arauz',
  description: 'Histórico de todas as conversas com assistentes IA',
};

export default async function ConversasPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch initial sessions data directly from DB
  const limit = 10;
  const {
    data: rawSessions,
    error: sessionsError,
    count,
  } = await supabase
    .from('agent_sessions')
    .select(
      `
      id,
      user_id,
      agent_id,
      agents(name),
      started_at,
      ended_at,
      status,
      message_count,
      created_at,
      updated_at
    `,
      { count: 'exact' },
    )
    .eq('user_id', user.id)
    .order('started_at', { ascending: false })
    .range(0, limit - 1);

  if (sessionsError) {
    console.error('Error fetching initial sessions:', sessionsError);
  }

  const sessionsData = {
    sessions: (rawSessions || []).map((session: any) => ({
      id: session.id,
      user_id: session.user_id,
      agent_id: session.agent_id,
      agent_name: Array.isArray(session.agents)
        ? session.agents[0]?.name || 'Unknown Agent'
        : session.agents?.name || 'Unknown Agent',
      started_at: session.started_at,
      ended_at: session.ended_at,
      status: session.status,
      message_count: session.message_count,
      created_at: session.created_at,
      updated_at: session.updated_at,
    })),
    total: count || 0,
  };

  return (
    <ConversasContent
      initialSessions={sessionsData.sessions || []}
      initialTotal={sessionsData.total || 0}
    />
  );
}
