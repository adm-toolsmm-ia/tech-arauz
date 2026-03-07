import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { dbProcessToUI } from '@/lib/transformers/organization';
import type { DBOrgProcess } from '@/lib/transformers/organization';
import { ProcessosContent } from './processos-content';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

export default async function ProcessosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const [
    { data: processesRaw, error },
    { data: areas },
    { data: nuclei },
  ] = await Promise.all([
    supabase.from('org_processes').select('*').order('name', { ascending: true }),
    supabase.from('org_areas').select('id, name').order('name'),
    supabase.from('org_nuclei').select('id, name, area_id').order('name'),
  ]);

  if (error) {
    console.error('Error fetching processes:', error);
  }

  const processes = ((processesRaw as DBOrgProcess[]) || []).map((row) => dbProcessToUI(row));
  const areaMap = new Map((areas ?? []).map((a) => [a.id, a.name]));
  const nucleusMap = new Map((nuclei ?? []).map((n) => [n.id, n.name]));

  return (
    <ErrorBoundary label="Processos">
      <ProcessosContent
        processes={processes}
        areas={areas ?? []}
        nuclei={nuclei ?? []}
        areaMap={Object.fromEntries(areaMap)}
        nucleusMap={Object.fromEntries(nucleusMap)}
      />
    </ErrorBoundary>
  );
}
