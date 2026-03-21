import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { KnowledgeDocument, APIError } from '@/types/knowledge-graph';

/**
 * GET /api/knowledge/documents/[id]/related
 * Returns up to 6 documents related to the given document
 * Related means:
 *   1. Share the same entity links (via document_entity_links)
 *   2. Same category (fallback)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<{ related: KnowledgeDocument[] } | APIError>> {
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

    // Verify document exists
    const { data: baseDoc, error: docError } = await supabase
      .from('documents')
      .select('id, category')
      .eq('id', params.id)
      .eq('tenant_id', profile.tenant_id)
      .single();

    if (docError || !baseDoc) {
      return NextResponse.json(
        { error: 'Document not found', statusCode: 404, timestamp: new Date().toISOString() },
        { status: 404 }
      );
    }

    // Find other documents that share entity links with this document
    const { data: sharedLinks, error: linksError } = await supabase
      .from('document_entity_links')
      .select('entity_id, entity_type')
      .eq('document_id', params.id)
      .eq('tenant_id', profile.tenant_id)
      .limit(20); // Limit to avoid too many queries

    if (linksError) {
      console.error('Links query error:', linksError);
      return NextResponse.json(
        { error: 'Failed to fetch related documents', statusCode: 500, timestamp: new Date().toISOString() },
        { status: 500 }
      );
    }

    let relatedDocs: KnowledgeDocument[] = [];

    // If document has entity links, find other documents linked to the same entities
    if (sharedLinks && sharedLinks.length > 0) {
      const entityIds = sharedLinks.map((l) => l.entity_id);

      const { data: linkedDocs, error: linkedError } = await supabase
        .from('document_entity_links')
        .select('documents(*)')
        .in('entity_id', entityIds)
        .neq('document_id', params.id)
        .eq('tenant_id', profile.tenant_id)
        .limit(10);

      if (!linkedError && linkedDocs) {
        relatedDocs = linkedDocs
          .map((link: any) => link.documents)
          .filter((doc: any) => doc && doc.is_published)
          .slice(0, 6) as KnowledgeDocument[];
      }
    }

    // Fallback: if no linked documents, get documents from same category
    if (relatedDocs.length === 0) {
      const { data: categoryDocs, error: catError } = await supabase
        .from('documents')
        .select('*')
        .eq('category', baseDoc.category)
        .eq('tenant_id', profile.tenant_id)
        .eq('is_published', true)
        .neq('id', params.id)
        .order('created_at', { ascending: false })
        .limit(6);

      if (!catError && categoryDocs) {
        relatedDocs = categoryDocs as KnowledgeDocument[];
      }
    }

    return NextResponse.json({ related: relatedDocs });
  } catch (error) {
    console.error('Related documents API error:', error);
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
