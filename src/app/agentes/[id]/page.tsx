import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AgentDetailContent } from './agente-detail';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export default async function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch agent details and traces from Python service
  let agent: Record<string, unknown> | null = null;
  let traces: Array<Record<string, unknown>> = [];

  try {
    const [agentRes, tracesRes] = await Promise.all([
      fetch(`${AI_SERVICE_URL}/api/agents/${id}`, {
        next: { revalidate: 30 },
      }),
      fetch(`${AI_SERVICE_URL}/api/traces?agent_id=${id}&page_size=20`, {
        next: { revalidate: 10 },
      }),
    ]);

    if (agentRes.ok) {
      agent = await agentRes.json();
    }
    if (tracesRes.ok) {
      const tracesData = await tracesRes.json();
      traces = tracesData.items || [];
    }
  } catch {
    console.error('[AgentDetailPage] AI service unavailable');
  }

  if (!agent) {
    redirect('/agentes');
  }

  return <AgentDetailContent agent={agent} traces={traces} />;
}
