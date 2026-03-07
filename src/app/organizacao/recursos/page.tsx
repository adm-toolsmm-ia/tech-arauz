import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { RecursosContent } from './recursos-content';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

export default async function RecursosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const [
    { data: systems },
    { data: suppliers },
    { data: services },
    { data: documents },
  ] = await Promise.all([
    supabase.from('org_systems').select('*').order('name'),
    supabase.from('org_suppliers').select('*').order('name'),
    supabase.from('org_services').select('*').order('name'),
    supabase.from('org_documents').select('*').order('name'),
  ]);

  return (
    <ErrorBoundary label="Recursos">
      <RecursosContent
        systems={systems ?? []}
        suppliers={suppliers ?? []}
        services={services ?? []}
        documents={documents ?? []}
      />
    </ErrorBoundary>
  );
}
