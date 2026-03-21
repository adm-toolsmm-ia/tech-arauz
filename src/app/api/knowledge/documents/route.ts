import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { KnowledgeDocumentsResponse, KnowledgeDocument, APIError } from '@/types/knowledge-graph';

interface SearchParams {
  category?: string;
  search?: string;
  tags?: string;
  sort?: 'recent' | 'popular';
  limit?: string;
  cursor?: string;
}

/**
 * GET /api/knowledge/documents
 * Returns paginated list of published documents with optional filters
 * Query params:
 *   - category: 'manual' | 'regra_negocio' | 'arquitetura' | 'guia'
 *   - search: full-text search query (Portuguese)
 *   - tags: comma-separated tag names
 *   - sort: 'recent' (default) or 'popular' (by view_count)
 *   - limit: number of results (default 10, max 50)
 *   - cursor: keyset pagination cursor (created_at)
 */
export async function GET(request: NextRequest): Promise<NextResponse<KnowledgeDocumentsResponse | APIError>> {
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

    // Parse query parameters
    const params = new URL(request.url).searchParams;
    const filters: SearchParams = {
      category: params.get('category') || undefined,
      search: params.get('search') || undefined,
      tags: params.get('tags') || undefined,
      sort: (params.get('sort') as 'recent' | 'popular') || 'recent',
      limit: params.get('limit') || '10',
      cursor: params.get('cursor') || undefined,
    };

    // Validate limit
    const limit = Math.min(Math.max(parseInt(filters.limit || '10'), 1), 50);

    // Build query
    let query = supabase
      .from('documents')
      .select('*', { count: 'exact' })
      .eq('tenant_id', profile.tenant_id)
      .eq('is_published', true);

    // Apply category filter
    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    // Apply search filter (full-text search)
    if (filters.search) {
      query = query.textSearch('search_vector', filters.search, {
        type: 'plain',
        config: 'portuguese',
      });
    }

    // Apply tags filter
    if (filters.tags) {
      const tagsArray = filters.tags.split(',').map((t) => t.trim());
      query = query.contains('tags', tagsArray);
    }

    // Apply sorting
    if (filters.sort === 'popular') {
      query = query.order('view_count', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Apply cursor-based pagination (keyset pagination)
    if (filters.cursor) {
      const [cursorDate, cursorId] = filters.cursor.split(':');
      if (filters.sort === 'popular') {
        query = query.lt('view_count', parseInt(cursorDate));
      } else {
        query = query.lt('created_at', cursorDate);
      }
    }

    // Fetch limit + 1 to determine if there are more results
    const { data: documents, count, error: queryError } = await query.limit(limit + 1);

    if (queryError) {
      console.error('Documents query error:', queryError);
      return NextResponse.json(
        { error: 'Failed to fetch documents', statusCode: 500, timestamp: new Date().toISOString() },
        { status: 500 }
      );
    }

    const hasMore = (documents?.length || 0) > limit;
    const resultDocs = (documents || []).slice(0, limit);

    // Generate next cursor
    let nextCursor: string | null = null;
    if (hasMore && resultDocs.length > 0) {
      const lastDoc = resultDocs[resultDocs.length - 1];
      if (filters.sort === 'popular') {
        nextCursor = `${lastDoc.view_count}:${lastDoc.id}`;
      } else {
        nextCursor = `${lastDoc.created_at}:${lastDoc.id}`;
      }
    }

    return NextResponse.json({
      documents: resultDocs as KnowledgeDocument[],
      total: count || 0,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error('Documents API error:', error);
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
