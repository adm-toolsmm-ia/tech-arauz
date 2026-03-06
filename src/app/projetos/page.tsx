import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { dbProjectToUI } from '@/lib/transformers/project';
import type { DBProject } from '@/lib/transformers/project';
import { ProjectsContent } from './projects-content';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

export default async function ProjectsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: projects, error } = await supabase
    .from('projects')
    .select(
      `
        *,
        schedules:project_schedules(*),
        deliveries:project_deliveries(*),
        histories:project_histories(*),
        approvers:project_approvers(*),
        budgets:project_budgets(*),
        tempos_permanencia:project_tempo_permanencia(*)
      `,
    )
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error);
  }

  // Transform DB rows to UI format
  const uiProjects = ((projects as DBProject[]) || []).map(dbProjectToUI);

  return (
    <ErrorBoundary label="Projetos">
      <ProjectsContent projects={uiProjects} />
    </ErrorBoundary>
  );
}
