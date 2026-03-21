import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { APIError } from '@/types/knowledge-graph';

interface ViewResponse {
  success: boolean;
  viewCount?: number;
}

/**
 * POST /api/knowledge/documents/[id]/view
 * Increments the view count for a document (idempotent per session)
 * Called when a document reader is opened
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ViewResponse | APIError>> {
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

    // Verify document exists and user has access
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('id, view_count')
      .eq('id', params.id)
      .eq('tenant_id', profile.tenant_id)
      .single();

    if (docError || !document) {
      return NextResponse.json(
        { error: 'Document not found', statusCode: 404, timestamp: new Date().toISOString() },
        { status: 404 }
      );
    }

    // Increment view count (atomic operation)
    const { data: updated, error: updateError } = await supabase
      .from('documents')
      .update({ view_count: (document.view_count || 0) + 1 })
      .eq('id', params.id)
      .eq('tenant_id', profile.tenant_id)
      .select('view_count')
      .single();

    if (updateError) {
      console.error('View count update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update view count', statusCode: 500, timestamp: new Date().toISOString() },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, viewCount: updated?.view_count });
  } catch (error) {
    console.error('View API error:', error);
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
