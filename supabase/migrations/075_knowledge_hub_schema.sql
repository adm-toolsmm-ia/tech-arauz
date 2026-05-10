-- Migration 075: Knowledge Hub Schema Enhancements
-- Adds metadata to documents table and creates document_entity_links junction table
-- 2026-03-21

-- Enhance documents table with reading time, tags, summary, and view tracking
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS reading_time_minutes INTEGER
  GENERATED ALWAYS AS (greatest(1, ceil(length(coalesce(content_md, '')) / 1500.0)::integer)) STORED,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS summary TEXT,
ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- Full-text search vector (Portuguese)
-- Stored as a regular column because generated tsvector expressions are not immutable.
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS search_vector TSVECTOR;

CREATE OR REPLACE FUNCTION public.documents_search_vector_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector := to_tsvector(
    'portuguese'::regconfig,
    coalesce(NEW.title, '') || ' ' ||
    coalesce(NEW.content_md, '') || ' ' ||
    array_to_string(coalesce(NEW.tags, '{}'::text[]), ' ')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_documents_search_vector ON public.documents;
CREATE TRIGGER trg_documents_search_vector
BEFORE INSERT OR UPDATE OF title, content_md, tags ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.documents_search_vector_update();

UPDATE public.documents
SET search_vector = to_tsvector(
  'portuguese'::regconfig,
  coalesce(title, '') || ' ' ||
  coalesce(content_md, '') || ' ' ||
  array_to_string(coalesce(tags, '{}'::text[]), ' ')
);

-- Index for full-text search
CREATE INDEX IF NOT EXISTS idx_documents_search_vector
  ON public.documents USING GIN(search_vector);

-- Index for common filters
CREATE INDEX IF NOT EXISTS idx_documents_category_published
  ON public.documents(category, is_published);

CREATE INDEX IF NOT EXISTS idx_documents_view_count
  ON public.documents(view_count DESC) WHERE is_published = true;

-- Create document_entity_links table for explicit cross-entity linking
CREATE TABLE IF NOT EXISTS public.document_entity_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN (
    'org_area', 'org_nucleus', 'org_process', 'org_routine',
    'org_activity', 'org_system', 'skill'
  )),
  entity_id UUID NOT NULL,
  link_label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(document_id, entity_type, entity_id)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_document_entity_links_tenant
  ON public.document_entity_links(tenant_id);

CREATE INDEX IF NOT EXISTS idx_document_entity_links_document
  ON public.document_entity_links(document_id);

CREATE INDEX IF NOT EXISTS idx_document_entity_links_entity
  ON public.document_entity_links(entity_type, entity_id);

-- Enable RLS on document_entity_links
ALTER TABLE public.document_entity_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies: tenant isolation
CREATE POLICY "del_select" ON public.document_entity_links
  FOR SELECT USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "del_insert" ON public.document_entity_links
  FOR INSERT WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY "del_update" ON public.document_entity_links
  FOR UPDATE USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY "del_delete" ON public.document_entity_links
  FOR DELETE USING (tenant_id = public.get_user_tenant_id());
