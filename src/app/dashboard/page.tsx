import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { dbProjectToDashboard } from '@/lib/transformers/project';
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
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Buscar todos os projetos para charts + KPIs
  const { data: allProjects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  // Transform DB rows to UI format (recent 10 for list)
  const allDbProjects = (allProjects as DBProject[]) || [];
  const recentProjects = allDbProjects.slice(0, 10).map(dbProjectToDashboard);

  // Chart data: pass raw status and created_at for chart helpers
  const chartProjects = allDbProjects.map((p) => ({
    status: p.status || 'projeto_futuro',
    created_at: p.created_at || '',
  }));

  return (
    <DashboardContent 
      user={user} 
      profile={profile} 
      projects={recentProjects}
      chartProjects={chartProjects}
    />
  );
}
