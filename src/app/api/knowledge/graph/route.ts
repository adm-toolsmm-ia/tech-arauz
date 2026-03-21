import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { KnowledgeGraphResponse, APIError } from '@/types/knowledge-graph';

/**
 * GET /api/knowledge/graph
 * Returns the full knowledge graph (nodes + links) for the authenticated user's tenant
 * Used by the graph visualization component
 */
export async function GET(request: NextRequest): Promise<NextResponse<KnowledgeGraphResponse | APIError>> {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', statusCode: 401, timestamp: new Date().toISOString() },
        { status: 401 }
      );
    }

    // Get user's tenant
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found', statusCode: 400, timestamp: new Date().toISOString() },
        { status: 400 }
      );
    }

    // Call RPC function to get graph data
    const { data: graphData, error: rpcError } = await supabase.rpc('get_knowledge_graph', {
      p_tenant_id: profile.tenant_id,
    });

    if (rpcError) {
      console.error('Knowledge graph RPC error:', rpcError);
      return NextResponse.json(
        { error: 'Failed to fetch knowledge graph', statusCode: 500, timestamp: new Date().toISOString() },
        { status: 500 }
      );
    }

    // Return response with cache headers
    const response = NextResponse.json(graphData as KnowledgeGraphResponse);
    response.headers.set('Cache-Control', 'max-age=60, stale-while-revalidate=300'); // Cache 1 minute
    return response;
  } catch (error) {
    console.error('Knowledge graph API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
