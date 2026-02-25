export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

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

  // Proxy to Python service v2 with JWT
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
      const error = await res.json();
      return NextResponse.json(error, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[agents/GET] Proxy error:', error);
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 });
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
    console.error('[agents/POST] Proxy error:', error);
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 });
  }
}
