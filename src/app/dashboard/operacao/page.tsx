import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getProjectData } from '@/app/dashboard/projetos/actions';
import { DashboardOperacaoContent } from './dashboard-operacao-content';

export const metadata = {
  title: 'Dashboard Operação',
  description: 'Visão operacional e histórico de atividades.',
};

export default async function OperacaoDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch the same project data to power the operation metrics
  const { projects, profile } = await getProjectData();

  // For chart data we query histories alongside
  const { data: chartProjects } = await supabase
    .from('projects')
    .select(
      `
      id,
      status, 
      created_at, 
      fase_atual, 
      area,
      prazo_final,
      data_encerramento,
      prioridade,
      importancia_especial,
      impacto_estrategico,
      impacto_operacional,
      complexidade_tecnica,
      responsible:profiles!projects_responsible_id_fkey(full_name),
      budgets:project_budgets(value, currency),
      histories:project_histories(id, step_from, step_to, date, user_id, user:profiles(full_name))
    `,
    )
    .order('created_at', { ascending: false });

  // Format chart projects to flatten relations
  const formattedChartProjects = (chartProjects || []).map((p: any) => ({
    ...p,
    responsible: p.responsible?.[0]?.full_name || p.responsible?.full_name || null,
    histories: p.histories || [],
  }));

  return (
    <DashboardOperacaoContent
      user={user}
      profile={profile}
      projects={projects}
      chartProjects={formattedChartProjects}
    />
  );
}
