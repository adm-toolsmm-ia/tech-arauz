import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const res = await fetch(`${AI_SERVICE_URL}/api/agents/v2/types`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Backend error: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching agent types:', error);
    return NextResponse.json({ error: 'Failed to fetch agent types' }, { status: 500 });
  }
}
