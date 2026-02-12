-- Migration: Add status_original to projects table
-- Purpose: Store the original status text from Espaider before normalization
-- Date: 2026-02-11

ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS status_original TEXT;

COMMENT ON COLUMN public.projects.status_original IS 'Status original recebido do Espaider (não normalizado)';
