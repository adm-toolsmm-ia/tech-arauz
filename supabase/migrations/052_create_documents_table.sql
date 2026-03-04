-- ============================================================
-- Migration 048: Create documents table for documentation engine
-- Epic 8 / Story 8.5 — Modelagem de Dados
-- ============================================================

-- Create category enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_category') THEN
    CREATE TYPE document_category AS ENUM (
      'manual',
      'regra_negocio',
      'arquitetura',
      'guia'
    );
  END IF;
END$$;

-- Main documents table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) >= 3),
  slug TEXT NOT NULL,
  content_md TEXT NOT NULL DEFAULT '',
  category document_category NOT NULL DEFAULT 'guia',
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT documents_tenant_slug_unique UNIQUE (tenant_id, slug)
);

COMMENT ON TABLE public.documents IS 'Documentation engine — Markdown documents for manuals, business rules, architecture docs, and guides';
COMMENT ON COLUMN public.documents.slug IS 'URL-friendly identifier, unique per tenant';
COMMENT ON COLUMN public.documents.content_md IS 'Full Markdown content of the document';
COMMENT ON COLUMN public.documents.category IS 'Classification: manual, regra_negocio, arquitetura, guia';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_documents_tenant ON public.documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON public.documents(tenant_id, category);
CREATE INDEX IF NOT EXISTS idx_documents_slug ON public.documents(tenant_id, slug);
CREATE INDEX IF NOT EXISTS idx_documents_published ON public.documents(tenant_id, is_published);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_documents_updated_at ON public.documents;
CREATE TRIGGER trg_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_documents_updated_at();

-- ============================================================
-- RLS Policies
-- ============================================================
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Read: Any authenticated user of the same tenant can read published docs
CREATE POLICY documents_select_policy ON public.documents
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT p.tenant_id FROM public.profiles p WHERE p.id = auth.uid()
    )
    AND (
      is_published = true
      OR author_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'manager')
      )
    )
  );

-- Insert: Only admin and manager roles
CREATE POLICY documents_insert_policy ON public.documents
  FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT p.tenant_id FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'manager')
    )
  );

-- Update: Only admin and manager roles within same tenant
CREATE POLICY documents_update_policy ON public.documents
  FOR UPDATE
  USING (
    tenant_id IN (
      SELECT p.tenant_id FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'manager')
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT p.tenant_id FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'manager')
    )
  );

-- Delete: Only admin role
CREATE POLICY documents_delete_policy ON public.documents
  FOR DELETE
  USING (
    tenant_id IN (
      SELECT p.tenant_id FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );
