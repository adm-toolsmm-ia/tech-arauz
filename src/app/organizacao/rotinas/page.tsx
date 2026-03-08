import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { dbRoutineToUI } from '@/lib/transformers/organization';
import type { DBOrgRoutine } from '@/lib/transformers/organization';
import { RotinasContent } from './rotinas-content';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

export default async function RotinasPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const [{ data: routinesRaw }, { data: processesRaw }] = await Promise.all([
    supabase.from('org_routines').select('*').order('name', { ascending: true }),
    supabase.from('org_processes').select('id, name').order('name'),
  ]);

  const routines = ((routinesRaw as DBOrgRoutine[]) ?? []).map((row) => dbRoutineToUI(row));
  const processMap = new Map(
    (processesRaw ?? []).map((p: { id: string; name: string }) => [p.id, p.name]),
  );

  const routinesWithProcess = routines.map((r) => ({
    ...r,
    process_name: processMap.get(r.process_id) ?? '',
  }));

  return (
    <ErrorBoundary label="Rotinas">
      <RotinasContent
        routines={routinesWithProcess}
        processes={(processesRaw ?? []).map((p: { id: string; name: string }) => ({
          id: p.id,
          name: p.name,
        }))}
      />
    </ErrorBoundary>
  );
}
