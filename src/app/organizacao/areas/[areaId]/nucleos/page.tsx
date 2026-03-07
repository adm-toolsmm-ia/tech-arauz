import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { dbNucleusToUI } from '@/lib/transformers/organization';
import type { DBOrgNucleus } from '@/lib/transformers/organization';
import { NucleosContent } from './nucleos-content';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

interface NucleosPageProps {
  params: Promise<{ areaId: string }>;
}

export default async function NucleosPage({ params }: NucleosPageProps) {
  const { areaId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: area, error: areaError } = await supabase
    .from('org_areas')
    .select('id, name')
    .eq('id', areaId)
    .single();

  if (areaError || !area) {
    notFound();
  }

  const { data: nucleiRaw, error } = await supabase
    .from('org_nuclei')
    .select('*')
    .eq('area_id', areaId)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching nuclei:', error);
  }

  const nuclei = ((nucleiRaw as DBOrgNucleus[]) || []).map((row) => dbNucleusToUI(row));

  return (
    <ErrorBoundary label="Núcleos">
      <NucleosContent
        areaId={areaId}
        areaName={area.name}
        nuclei={nuclei}
      />
    </ErrorBoundary>
  );
}
