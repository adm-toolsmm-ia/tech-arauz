import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { dbNucleusToUI } from '@/lib/transformers/organization';
import type { DBOrgNucleus } from '@/lib/transformers/organization';
import { NucleosContent } from './nucleos-content';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

export default async function NucleosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const [{ data: nucleiRaw, error }, { data: areas }, { data: processCounts }] = await Promise.all([
    supabase.from('org_nuclei').select('*').order('name', { ascending: true }),
    supabase.from('org_areas').select('id, name').order('name'),
    supabase.from('org_processes').select('nucleus_id'),
  ]);

  if (error) {
    console.error('Error fetching nuclei:', error);
  }

  const processCountByNucleus = (processCounts ?? []).reduce<Record<string, number>>((acc, p) => {
    if (p.nucleus_id) {
      acc[p.nucleus_id] = (acc[p.nucleus_id] || 0) + 1;
    }
    return acc;
  }, {});

  const areaMap = new Map((areas ?? []).map((a) => [a.id, a.name]));

  const nuclei = ((nucleiRaw as DBOrgNucleus[]) || []).map((row) => {
    const ui = dbNucleusToUI(row);
    return {
      ...ui,
      processes_count: processCountByNucleus[row.id] ?? 0,
      area_name: areaMap.get(row.area_id) ?? '',
    };
  });

  return (
    <ErrorBoundary label="Núcleos">
      <NucleosContent nuclei={nuclei} areas={areas ?? []} />
    </ErrorBoundary>
  );
}
