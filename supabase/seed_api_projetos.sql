-- =============================================================================
-- Tech Arauz - Seed API Projetos (Executar no Supabase Dashboard)
-- =============================================================================
-- Este script insere a API de Projetos para o tenant Araúz
-- Executar via SQL Editor no Supabase Dashboard
-- =============================================================================

-- 1. Primeiro, limpar APIs antigas (se existirem)
DELETE FROM public.espaider_apis
WHERE tenant_id = '00000000-0000-0000-0000-000000000001';

-- 2. Inserir a API consolidada de Projetos
INSERT INTO public.espaider_apis (
  tenant_id,
  nome,
  base_url,
  token,
  identificador,
  tipo,
  is_active,
  settings
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'API Projetos Espaider',
  'https://espaider.com.br/Arauz/WCF/WCFExportaDados/WCFExportaDados.svc',
  'PREENCHER_TOKEN',
  'BI_SOLICITACOES_SUPORTEESPAIDER',
  'projetos',
  TRUE,
  '{"fluxo": "hierarquico", "inclui_filhos": true}'::jsonb
);

-- 3. Verificar se foi inserido
SELECT
  id,
  nome,
  identificador,
  tipo,
  is_active,
  created_at
FROM public.espaider_apis
WHERE tenant_id = '00000000-0000-0000-0000-000000000001';
