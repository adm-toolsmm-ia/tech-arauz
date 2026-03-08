'use server';

import { createClient } from '@/lib/supabase/server';
import { dbProjectToUI } from '@/lib/transformers/project';
import type { DBProject } from '@/lib/transformers/project';

/**
 * Server action: fetch projects and profile for dashboard use.
 * Used by operacao dashboard and other consumers that need shared project data.
 */
export async function getProjectData() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { projects: [], profile: null };
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

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

  const allDbProjects = (allProjects as DBProject[]) || [];
  const projects = allDbProjects.map(dbProjectToUI);

  return { projects, profile };
}
