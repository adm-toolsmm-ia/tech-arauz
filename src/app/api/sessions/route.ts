import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export interface AgentSessionWithAgent {
  id: string;
  user_id: string;
  agent_id: string;
  agent_name: string;
  started_at: string;
  ended_at: string | null;
  status: 'active' | 'paused' | 'closed';
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface SessionsResponse {
  sessions: AgentSessionWithAgent[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * GET /api/sessions
 * List all agent_sessions for authenticated user
 *
 * Query params:
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 * - agent_id: string (optional)
 * - status: 'active' | 'paused' | 'closed' (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const agentId = searchParams.get('agent_id');
    const status = searchParams.get('status') as 'active' | 'paused' | 'closed' | null;

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('agent_sessions')
      .select(
        `
        id,
        user_id,
        agent_id,
        agents(name),
        started_at,
        ended_at,
        status,
        message_count,
        created_at,
        updated_at
      `,
        { count: 'exact' }
      )
      .eq('user_id', user.id)
      .order('started_at', { ascending: false });

    // Apply optional filters
    if (agentId) {
      query = query.eq('agent_id', agentId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    // Apply pagination
    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching sessions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch sessions' },
        { status: 500 }
      );
    }

    // Transform data to include agent_name
    const sessions: AgentSessionWithAgent[] = (data || []).map((session: any) => ({
      id: session.id,
      user_id: session.user_id,
      agent_id: session.agent_id,
      agent_name: Array.isArray(session.agents)
        ? session.agents[0]?.name || 'Unknown Agent'
        : session.agents?.name || 'Unknown Agent',
      started_at: session.started_at,
      ended_at: session.ended_at,
      status: session.status,
      message_count: session.message_count,
      created_at: session.created_at,
      updated_at: session.updated_at,
    }));

    const total = count || 0;
    const hasMore = offset + limit < total;

    const response: SessionsResponse = {
      sessions,
      total,
      page,
      limit,
      hasMore,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Unexpected error in GET /api/sessions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
