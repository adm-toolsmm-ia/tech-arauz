import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { dbAreaToUI } from '@/lib/transformers/organization';
import type { DBOrgArea } from '@/lib/transformers/organization';
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

  const { data: areasRaw, error } = await supabase
    .from('org_areas')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching areas:', error);
  }

  const { data: nucleiRaw } = await supabase.from('org_nuclei').select('area_id');
  const nucleiCountByArea = (nucleiRaw || []).reduce<Record<string, number>>((acc, n) => {
    acc[n.area_id] = (acc[n.area_id] || 0) + 1;
    return acc;
  }, {});

  const areas = ((areasRaw as DBOrgArea[]) || []).map((row) =>
    dbAreaToUI(row, nucleiCountByArea[row.id] ?? 0),
  );

  return (
    <ErrorBoundary label="Áreas">
      <AreasContent areas={areas} />
    </ErrorBoundary>
  );
}
