import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AgentsContent } from './agentes-content';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export default async function AgentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch agents from Python service
  let agents: Array<Record<string, unknown>> = [];
  let budget = {
    spent_usd: 0,
    remaining_usd: 0,
    total_agents_cost_usd: 0,
    monthly_limit_usd: 50,
    usage_percentage: 0,
  };

  try {
    const [agentsRes, budgetRes] = await Promise.all([
      fetch(`${AI_SERVICE_URL}/api/agents`, {
        next: { revalidate: 30 },
      }),
      fetch(`${AI_SERVICE_URL}/api/budget`, {
        next: { revalidate: 30 },
      }),
    ]);

    if (agentsRes.ok) {
      const agentsData = await agentsRes.json();
      agents = agentsData.items || [];
    }
    if (budgetRes.ok) {
      budget = await budgetRes.json();
    }
  } catch {
    // Service unavailable - render with empty data
    console.error('[AgentsPage] AI service unavailable');
  }

  return <AgentsContent agents={agents} budget={budget} />;
}
