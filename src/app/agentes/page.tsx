import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { dbAgentsToUI, type DBAgent } from '@/lib/transformers/agent';
import { dbProjectSkillToUI } from '@/lib/transformers/skill';
import type { LmProvider } from '@/types/agents';
import type { DBProjectSkill } from '@/types/skills';
import { AgentesModuleContent } from './agentes-module-content';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

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

  const { data: skillsRows, error: skillsError } = await supabase
    .from('project_skills')
    .select('*')
    .order('name', { ascending: true });

  if (skillsError) {
    console.error('Error fetching project_skills:', skillsError);
  }

  // Fetch LM providers for CreateAgentDialog (provedores e modelos do banco)
  const { data: providers } = await supabase
    .from('lm_providers')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  // Transform DB rows to UI format
  const uiAgents = ((agents as DBAgent[]) || []).map((a) => dbAgentsToUI([a])[0]);
  const uiSkills = ((skillsRows as DBProjectSkill[]) || []).map(dbProjectSkillToUI);
  const lmProviders = (providers as LmProvider[]) || [];

  return (
    <ErrorBoundary label="Agentes">
      <AgentesModuleContent agents={uiAgents} skills={uiSkills} providers={lmProviders} />
    </ErrorBoundary>
  );
}
