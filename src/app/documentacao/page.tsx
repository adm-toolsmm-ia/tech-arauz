import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DocumentacaoContent } from './documentacao-content';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

export default async function DocumentacaoPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  return (
    <ErrorBoundary label="Documentação">
      <DocumentacaoContent user={user} profile={profile} />
    </ErrorBoundary>
  );
}
