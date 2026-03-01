import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ChatContent } from './chat-content';
import { DashboardHeader } from '@/components/layout/DashboardHeader';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

interface ApiMessage {
  role: string;
  content: string;
  tokens_used?: number;
  metadata?: { sql?: string; cost?: number };
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  tokens?: number;
  cost?: number;
  sql?: string;
}

function mapApiMessagesToChat(apiMessages: ApiMessage[]): ChatMessage[] {
  return [...apiMessages]
    .reverse()
    .map((m) => ({
      role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: m.content || '',
      tokens: m.tokens_used,
      cost: m.metadata?.cost,
      sql: m.metadata?.sql,
    }));
}

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

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
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
  let initialMessages: ChatMessage[] = [];

  const authHeaders = {
    Authorization: `Bearer ${session.access_token}`,
  };

  try {
    // If sessionId provided in query params, use it and load messages
    if (searchParams.sessionId) {
      initialSessionId = searchParams.sessionId;
      const messagesRes = await fetch(
        `${AI_SERVICE_URL}/api/agents/${params.id}/sessions/${initialSessionId}/messages?page=1&page_size=100`,
        { headers: authHeaders },
      );
      if (messagesRes.ok) {
        const data = await messagesRes.json();
        initialMessages = mapApiMessagesToChat(data.messages || []);
      }
    } else {
      // Try to load last session
      const sessionsRes = await fetch(
        `${AI_SERVICE_URL}/api/agents/${params.id}/sessions?page=1&page_size=1`,
        { headers: authHeaders },
      );

      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json();
        if (sessionsData.sessions && sessionsData.sessions.length > 0) {
          initialSessionId = sessionsData.sessions[0].id;

          // Load messages for this session
          const messagesRes = await fetch(
            `${AI_SERVICE_URL}/api/agents/${params.id}/sessions/${initialSessionId}/messages?page=1&page_size=100`,
            { headers: authHeaders },
          );

          if (messagesRes.ok) {
            const messagesData = await messagesRes.json();
            initialMessages = mapApiMessagesToChat(messagesData.messages || []);
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
