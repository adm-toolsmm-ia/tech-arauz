-- =============================================================================
-- Migration: Add project notes (Visão 360° - Anotações)
-- Created: 2026-02-16
-- Description: Adds notes_html column to projects for rich-text project notes.
-- =============================================================================

ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS notes_html TEXT;

COMMENT ON COLUMN public.projects.notes_html IS 'Anotações do projeto em HTML (editor rico TipTap); uso interno na Visão 360°.';
