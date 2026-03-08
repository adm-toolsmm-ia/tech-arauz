import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { dbRoutineToUI } from '@/lib/transformers/organization';
import type { DBOrgRoutine } from '@/lib/transformers/organization';
import { RotinasContent } from './rotinas-content';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

interface RotinasPageProps {
  params: Promise<{ processId: string }>;
}

export default async function RotinasPage({ params }: RotinasPageProps) {
  const { processId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: process, error: processError } = await supabase
    .from('org_processes')
    .select('id, name')
    .eq('id', processId)
    .single();

  if (processError || !process) {
    notFound();
  }

  const { data: routinesRaw, error } = await supabase
    .from('org_routines')
    .select('*')
    .eq('process_id', processId)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching routines:', error);
  }

  const routines = ((routinesRaw as DBOrgRoutine[]) || []).map((row) => dbRoutineToUI(row));

  return (
    <ErrorBoundary label="Rotinas">
      <RotinasContent processId={processId} processName={process.name} routines={routines} />
    </ErrorBoundary>
  );
}
