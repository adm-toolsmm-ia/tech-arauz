import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CronogramasContent } from './cronogramas-content';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

export default async function CronogramasPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch schedules with their project info
  // NOTE: usando status_original (métrica verificada) ao invés de situacao_original (status bruto)
  // Ver .cursor/GLOSSARIO_CAMPOS.md para distinção entre campos de status
  const { data: schedules, error } = await supabase
    .from('project_schedules')
    .select(
      `
      *,
      project:projects(id, titulo, codigo, status:status_original, fase_atual)
    `,
    )
    .order('data_fim', { ascending: true });

  if (error) {
    console.error('Error fetching schedules:', error);
  }

  return (
    <ErrorBoundary label="Cronogramas">
      <CronogramasContent schedules={schedules || []} />
    </ErrorBoundary>
  );
}
