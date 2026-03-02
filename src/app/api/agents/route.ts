export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

function logProxyError(operation: 'GET' | 'POST', error: unknown) {
  const err = error instanceof Error ? error : new Error(String(error));
  console.error(`[agents/${operation}] Proxy error`, {
    message: err.message,
    stack: err.stack,
    ai_service_url: AI_SERVICE_URL,
  });
}

export async function GET(request: Request) {
  const supabase = await createClient();

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Role check
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role === 'viewer') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Get JWT session token
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return NextResponse.json({ error: 'No session token' }, { status: 401 });
  }

  // Proxy to Python service v2 with JWT; fallback to Supabase when FastAPI unavailable
  const { searchParams } = new URL(request.url);
  const params = new URLSearchParams(searchParams);

  try {
    const res = await fetch(`${AI_SERVICE_URL}/api/agents/v2${params.size ? `?${params}` : ''}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!res.ok) {
      if (res.status === 503) {
        // Fallback: fetch from Supabase when FastAPI unavailable
        const fallback = await fetchAgentsFromSupabase(supabase, searchParams);
        if (fallback) return fallback;
      }
      const error = await res.json().catch(() => ({}));
      return NextResponse.json(error, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    logProxyError('GET', error);
    // Fallback: fetch from Supabase when FastAPI unreachable
    const fallback = await fetchAgentsFromSupabase(supabase, searchParams);
    if (fallback) return fallback;
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 });
  }
}

/** Fallback: fetch agents from Supabase when FastAPI returns 503 or is unreachable */
async function fetchAgentsFromSupabase(
  supabase: Awaited<ReturnType<typeof createClient>>,
  searchParams: URLSearchParams,
) {
  try {
    const usageType = searchParams.get('usage_type');
    const status = searchParams.get('status');
    const showInShortcut = searchParams.get('show_in_shortcut');
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 100);

    let query = supabase.from('agents').select('id, name, description, status, usage_type, show_in_shortcut');

    if (usageType) query = query.eq('usage_type', usageType);
    if (status) query = query.eq('status', status);
    if (showInShortcut === 'true') query = query.eq('show_in_shortcut', true);

    const { data: rows, error } = await query.order('created_at', { ascending: false }).limit(limit);

    if (error) {
      console.error('[agents/GET] Supabase fallback error:', error);
      return null;
    }

    const agents = (rows || []).map((r: { id: string; name: string; description: string | null }) => ({
      id: r.id,
      name: r.name,
      description: r.description || '',
    }));

    return Response.json({
      agents,
      total: agents.length,
      page: 1,
      page_size: agents.length,
      has_next: false,
    });
  } catch (e) {
    console.error('[agents/GET] Supabase fallback exception:', e);
    return null;
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Role check
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role === 'viewer') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Get JWT session token
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return NextResponse.json({ error: 'No session token' }, { status: 401 });
  }

  // Parse request body
  const body = await request.json();

  try {
    const res = await fetch(`${AI_SERVICE_URL}/api/agents/v2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json(error, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    logProxyError('POST', error);
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 });
  }
}
