import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { dbActivityToUI } from '@/lib/transformers/organization';
import type { DBOrgActivity } from '@/lib/transformers/organization';
import { AtividadesContent } from './atividades-content';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

interface AtividadesPageProps {
  params: Promise<{ processId: string; routineId: string }>;
}

export default async function AtividadesPage({ params }: AtividadesPageProps) {
  const { processId, routineId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: routine, error: routineError } = await supabase
    .from('org_routines')
    .select('id, name, process_id')
    .eq('id', routineId)
    .eq('process_id', processId)
    .single();

  if (routineError || !routine) {
    notFound();
  }

  const { data: process } = await supabase
    .from('org_processes')
    .select('id, name')
    .eq('id', processId)
    .single();

  const { data: activitiesRaw, error } = await supabase
    .from('org_activities')
    .select('*')
    .eq('routine_id', routineId)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching activities:', error);
  }

  const activities = ((activitiesRaw as DBOrgActivity[]) || []).map((row) => dbActivityToUI(row));

  return (
    <ErrorBoundary label="Atividades">
      <AtividadesContent
        processId={processId}
        processName={process?.name ?? ''}
        routineId={routineId}
        routineName={routine.name}
        activities={activities}
      />
    </ErrorBoundary>
  );
}
