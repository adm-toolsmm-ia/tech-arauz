import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CronogramasContent } from './cronogramas-content';

export default async function CronogramasPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch schedules with their project info
  const { data: schedules, error } = await supabase
    .from('project_schedules')
    .select(`
      *,
      project:projects(id, titulo, codigo, status, fase_atual)
    `)
    .order('data_fim', { ascending: true });

  if (error) {
    console.error('Error fetching schedules:', error);
  }

  return <CronogramasContent schedules={schedules || []} />;
}
