import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ChatContent } from './chat-content';
import { DashboardHeader } from '@/components/layout/DashboardHeader';

interface ChatPageProps {
  params: { id: string };
  searchParams: { sessionId?: string };
}

export default async function ChatPage({ params, searchParams }: ChatPageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch agent data
  const { data: agent, error: agentError } = await supabase
    .from('agents')
    .select('id, name, slug, status')
    .eq('id', params.id)
    .single();

  if (agentError || !agent) {
    notFound();
  }

  // Check if agent is published
  if (agent.status !== 'published') {
    redirect('/agentes');
  }

  // Try to load initial session and messages
  let initialSessionId: string | undefined;
  let initialMessages: any[] = [];

  try {
    // If sessionId provided in query params, use it
    if (searchParams.sessionId) {
      initialSessionId = searchParams.sessionId;
    } else {
      // Try to load last session
      const sessionsRes = await fetch(
        `${process.env.AI_SERVICE_URL || 'http://localhost:8000'}/api/agents/${params.id}/sessions?limit=1`,
        {
          headers: {
            Authorization: `Bearer ${user.id}`, // This will be replaced by the proxy with actual JWT
          },
        },
      );

      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json();
        if (sessionsData.sessions && sessionsData.sessions.length > 0) {
          initialSessionId = sessionsData.sessions[0].session_id;

          // Load messages for this session
          const messagesRes = await fetch(
            `${process.env.AI_SERVICE_URL || 'http://localhost:8000'}/api/agents/${params.id}/sessions/${initialSessionId}/messages?limit=10`,
            {
              headers: {
                Authorization: `Bearer ${user.id}`,
              },
            },
          );

          if (messagesRes.ok) {
            const messagesData = await messagesRes.json();
            initialMessages = messagesData.messages || [];
          }
        }
      }
    }
  } catch (error) {
    // Gracefully continue without initial messages
    console.error('Failed to load initial session:', error);
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b p-4">
        <DashboardHeader
          title={`Chat com ${agent.name}`}
          subtitle="Converse com seu agente AI"
        />
      </div>

      <div className="flex-1 p-4 overflow-hidden">
        <ChatContent
          agentId={params.id}
          initialSessionId={initialSessionId}
          initialMessages={initialMessages}
        />
      </div>
    </div>
  );
}
