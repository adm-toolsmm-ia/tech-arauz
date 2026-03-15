import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { dbProcessToUI, dbRoutineToUI, dbSystemToUI } from '@/lib/transformers/organization';
import type { DBOrgProcess, DBOrgRoutine, DBOrgSystem } from '@/lib/transformers/organization';
import type { OrgProcess, OrgRoutine, OrgSystem } from '@/types/organization';
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
    { data: routinesRaw },
    { data: systemsRaw },
    { data: processSystemsRaw },
  ] = await Promise.all([
    supabase.from('org_processes').select('*').order('name', { ascending: true }),
    supabase.from('org_areas').select('id, name').order('name'),
    supabase.from('org_nuclei').select('id, name, area_id').order('name'),
    supabase.from('org_routines').select('*').order('name', { ascending: true }),
    supabase.from('org_systems').select('*').order('name', { ascending: true }),
    supabase.from('org_process_systems').select('process_id, system_id'),
  ]);

  if (error) {
    console.error('Error fetching processes:', error);
  }

  const processes = ((processesRaw as DBOrgProcess[]) || []).map((row) => dbProcessToUI(row));
  const routines = ((routinesRaw as DBOrgRoutine[]) ?? []).map((r) => dbRoutineToUI(r));
  const systems = ((systemsRaw as DBOrgSystem[]) ?? []).map((r) => dbSystemToUI(r));
  const areaMap = new Map((areas ?? []).map((a) => [a.id, a.name]));
  const nucleusMap = new Map((nuclei ?? []).map((n) => [n.id, n.name]));

  const routinesByProcessId = routines.reduce<Record<string, OrgRoutine[]>>((acc, r) => {
    const list = acc[r.process_id] ?? [];
    list.push(r);
    acc[r.process_id] = list;
    return acc;
  }, {});

  const processSystems = (processSystemsRaw ?? []) as {
    process_id: string;
    system_id: string;
  }[];
  const systemsByProcessId = processSystems.reduce<Record<string, OrgSystem[]>>((acc, ps) => {
    const list = acc[ps.process_id] ?? [];
    const system = systems.find((s) => s.id === ps.system_id);
    if (system && !list.some((s) => s.id === system.id)) {
      list.push(system);
    }
    acc[ps.process_id] = list;
    return acc;
  }, {});

  return (
    <ErrorBoundary label="Processos">
      <ProcessosContent
        processes={processes}
        areas={areas ?? []}
        nuclei={nuclei ?? []}
        areaMap={Object.fromEntries(areaMap)}
        nucleusMap={Object.fromEntries(nucleusMap)}
        routinesByProcessId={routinesByProcessId}
        systems={systems}
        systemsByProcessId={systemsByProcessId}
      />
    </ErrorBoundary>
  );
}
