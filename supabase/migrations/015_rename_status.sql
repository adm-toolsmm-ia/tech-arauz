-- Migration: Rename status to situacao_original
-- Objective: Store raw API status in 'situacao_original' and use 'status_original' for metrics.

ALTER TABLE projects
RENAME COLUMN status TO situacao_original;

-- Add comment to explain the column usage
COMMENT ON COLUMN projects.situacao_original IS 'Status cru da API (ex: Em Execução). Antigo campo status (slug).';
COMMENT ON COLUMN projects.status_original IS 'Status normalizado para métricas (ex: Projeto Futuro, Em Andamento).';
