import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { dbProjectToUI } from '@/lib/transformers/project';
import type { DBProject } from '@/lib/transformers/project';
import { DashboardContent } from './dashboard-content';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Buscar profile do usuário
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  // Buscar todos os projetos com relações para dashboard interativo
  const { data: allProjects } = await supabase
    .from('projects')
    .select(
      `
      *,
      schedules:project_schedules(*),
      deliveries:project_deliveries(*),
      histories:project_histories(*),
      approvers:project_approvers(*),
      budgets:project_budgets(*)
    `,
    )
    .order('created_at', { ascending: false });

  // Transform DB rows to full UI format
  const allDbProjects = (allProjects as DBProject[]) || [];
  const projects = allDbProjects.map(dbProjectToUI);

  // Chart data: pass raw status and created_at for chart helpers
  const chartProjects = allDbProjects.map((p) => ({
    status: p.status_original || 'projeto_futuro',
    created_at: p.created_at || '',
    fase_atual: p.fase_atual || '',
    area: p.area || '',
    prazo_final: p.prazo_final || '',
    data_encerramento: p.data_encerramento || '',
    prioridade: p.prioridade || '',
    importancia_especial: p.importancia_especial || false,
    impacto_estrategico: p.impacto_estrategico || '',
    impacto_operacional: p.impacto_operacional || '',
    responsible: p.responsavel || '',
  }));

  return (
    <DashboardContent
      user={user}
      profile={profile}
      projects={projects}
      chartProjects={chartProjects}
    />
  );
}
