import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AgentsContent } from './agentes-content';

export default async function AgentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return <AgentsContent />;
}
