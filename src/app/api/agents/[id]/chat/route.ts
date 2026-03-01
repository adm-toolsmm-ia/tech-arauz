export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

  if (!body.message) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  try {
    const res = await fetch(`${AI_SERVICE_URL}/api/agents/${id}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        session_id: body.session_id,
        message: body.message,
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json(error, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[agents/[id]/chat/POST] Proxy error:', error);
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 });
  }
}
