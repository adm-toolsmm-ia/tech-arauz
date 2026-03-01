import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { ConversasContent } from './conversas-content';

export const metadata = {
  title: 'Histórico de Conversas - Tech Arauz',
  description: 'Histórico de todas as conversas com assistentes IA',
};

export default async function ConversasPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Forward cookies from original request so /api/sessions can authenticate
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');

  // Fetch initial sessions data
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/sessions?page=1&limit=20`,
    {
      headers: cookieHeader ? { Cookie: cookieHeader } : {},
    }
  ).catch(() => null);

  const sessionsData = response?.ok
    ? await response.json()
    : { sessions: [], total: 0, page: 1, limit: 20, hasMore: false };

  // Fetch list of chatbot agents for filter
  const { data: agents, error: agentsError } = await supabase
    .from('agents')
    .select('id, name')
    .eq('usage_type', 'chatbot')
    .eq('status', 'published')
    .order('name', { ascending: true });

  if (agentsError) {
    console.error('Error fetching agents:', agentsError);
  }

  return (
    <ConversasContent
      initialSessions={sessionsData.sessions || []}
      initialTotal={sessionsData.total || 0}
      agents={(agents || []) as Array<{ id: string; name: string }> }
    />
  );
}
