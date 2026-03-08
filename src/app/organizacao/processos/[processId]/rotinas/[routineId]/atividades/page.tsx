import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { dbActivityToUI, dbOrgDocumentToUI } from '@/lib/transformers/organization';
import type { DBOrgActivity, DBOrgDocument } from '@/lib/transformers/organization';
import type { OrgDocument } from '@/types/organization';
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

  const [
    { data: activitiesRaw, error },
    { data: activityDocumentsRaw },
    { data: documentsRaw },
  ] = await Promise.all([
    supabase
      .from('org_activities')
      .select('*')
      .eq('routine_id', routineId)
      .order('name', { ascending: true }),
    supabase.from('org_activity_documents').select('activity_id, org_document_id'),
    supabase.from('org_documents').select('*').order('name', { ascending: true }),
  ]);

  if (error) {
    console.error('Error fetching activities:', error);
  }

  const activities = ((activitiesRaw as DBOrgActivity[]) || []).map((row) => dbActivityToUI(row));
  const documents = ((documentsRaw as DBOrgDocument[]) ?? []).map((r) => dbOrgDocumentToUI(r));
  const activityDocuments = (activityDocumentsRaw ?? []) as {
    activity_id: string;
    org_document_id: string;
  }[];

  const documentsByActivityId = activityDocuments.reduce<Record<string, OrgDocument[]>>(
    (acc, ad) => {
      const list = acc[ad.activity_id] ?? [];
      const doc = documents.find((d) => d.id === ad.org_document_id);
      if (doc && !list.some((d) => d.id === doc.id)) {
        list.push(doc);
      }
      acc[ad.activity_id] = list;
      return acc;
    },
    {},
  );

  return (
    <ErrorBoundary label="Atividades">
      <AtividadesContent
        processId={processId}
        processName={process?.name ?? ''}
        routineId={routineId}
        routineName={routine.name}
        activities={activities}
        documents={documents}
        documentsByActivityId={documentsByActivityId}
      />
    </ErrorBoundary>
  );
}
