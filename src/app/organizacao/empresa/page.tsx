import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getTenant360Action } from '@/app/actions/tenant';
import { EmpresaContent } from './empresa-content';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

export default async function EmpresaPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const result = await getTenant360Action();

  return (
    <ErrorBoundary label="Empresa">
      <EmpresaContent
        tenant={result.tenant}
        counts={result.counts}
        error={result.error}
      />
    </ErrorBoundary>
  );
}
