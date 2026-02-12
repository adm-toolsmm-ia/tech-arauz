-- Migration: Add 360 Project View fields
-- Created at: 2026-02-12
-- Description: Adds strategic and operational fields to projects table for Director's View.

ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS trm_espaider text,
ADD COLUMN IF NOT EXISTS tipo_chamado text,
ADD COLUMN IF NOT EXISTS tipo_assunto text,
ADD COLUMN IF NOT EXISTS solicitante text,
ADD COLUMN IF NOT EXISTS objetivo text,
ADD COLUMN IF NOT EXISTS motivo_importancia_especial text,
ADD COLUMN IF NOT EXISTS mensagem_movimentacao text,
ADD COLUMN IF NOT EXISTS justificativa text,
ADD COLUMN IF NOT EXISTS importancia_especial boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS impacto_operacional text,
ADD COLUMN IF NOT EXISTS impacto_estrategico text,
ADD COLUMN IF NOT EXISTS escopo text,
ADD COLUMN IF NOT EXISTS complexidade_tecnica text;

-- Add comments for documentation
COMMENT ON COLUMN public.projects.trm_espaider IS 'Número do ticket externo (TRM Espaider)';
COMMENT ON COLUMN public.projects.tipo_chamado IS 'Classificação do tipo de chamado (Ex: Melhoria, Projeto)';
COMMENT ON COLUMN public.projects.tipo_assunto IS 'Classificação do assunto (Ex: RH, Faturamento)';
COMMENT ON COLUMN public.projects.solicitante IS 'Nome do solicitante do projeto';
COMMENT ON COLUMN public.projects.objetivo IS 'Objetivo estratégico do projeto';
COMMENT ON COLUMN public.projects.motivo_importancia_especial IS 'Razão para flag de importância especial';
COMMENT ON COLUMN public.projects.mensagem_movimentacao IS 'Última mensagem de trâmite/movimentação';
COMMENT ON COLUMN public.projects.justificativa IS 'Justificativa de negócio';
COMMENT ON COLUMN public.projects.importancia_especial IS 'Flag de destaque/prioridade estratégica';
COMMENT ON COLUMN public.projects.impacto_operacional IS 'Nível de impacto na operação (Alto, Médio, Baixo / Normal)';
COMMENT ON COLUMN public.projects.impacto_estrategico IS 'Nível de impacto na estratégia (Alto, Médio, Baixo / Normal)';
COMMENT ON COLUMN public.projects.escopo IS 'Descrição do escopo do projeto';
COMMENT ON COLUMN public.projects.complexidade_tecnica IS 'Nível de complexidade técnica';
