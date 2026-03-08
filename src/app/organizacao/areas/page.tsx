import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { dbAreaToUI, dbNucleusToUI, dbProcessToUI } from '@/lib/transformers/organization';
import type { DBOrgArea, DBOrgNucleus, DBOrgProcess } from '@/lib/transformers/organization';
import { AreasContent } from './areas-content';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

export default async function AreasPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const [{ data: areasRaw, error }, { data: nucleiRaw }, { data: processesRaw }] =
    await Promise.all([
      supabase.from('org_areas').select('*').order('name', { ascending: true }),
      supabase.from('org_nuclei').select('*').order('name', { ascending: true }),
      supabase.from('org_processes').select('*').order('name', { ascending: true }),
    ]);

  if (error) {
    console.error('Error fetching areas:', error);
  }

  const nucleiCountByArea = (nucleiRaw || []).reduce<Record<string, number>>((acc, n) => {
    acc[n.area_id] = (acc[n.area_id] || 0) + 1;
    return acc;
  }, {});

  const areas = ((areasRaw as DBOrgArea[]) || []).map((row) =>
    dbAreaToUI(row, nucleiCountByArea[row.id] ?? 0),
  );
  const nuclei = ((nucleiRaw as DBOrgNucleus[]) || []).map((row) => dbNucleusToUI(row));
  const processes = ((processesRaw as DBOrgProcess[]) || []).map((row) => dbProcessToUI(row));

  const nucleiByAreaId = nuclei.reduce<Record<string, typeof nuclei>>((acc, n) => {
    const list = acc[n.area_id] ?? [];
    list.push(n);
    acc[n.area_id] = list;
    return acc;
  }, {});

  const processesByAreaId = processes.reduce<Record<string, typeof processes>>((acc, p) => {
    if (!p.area_id) return acc;
    const list = acc[p.area_id] ?? [];
    list.push(p);
    acc[p.area_id] = list;
    return acc;
  }, {});

  return (
    <ErrorBoundary label="Áreas">
      <AreasContent areas={areas} linkedData={{ nucleiByAreaId, processesByAreaId }} />
    </ErrorBoundary>
  );
}
