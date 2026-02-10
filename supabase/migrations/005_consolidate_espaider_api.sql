-- =============================================================================
-- Tech Arauz - Migration 005: Consolidação API Espaider
-- =============================================================================
-- Refatoração: 1 única API retorna projetos + interfaces filhas via ListaURLFilhos
-- Anteriormente: 4 APIs separadas (projetos, entregas, cronogramas, requisitos)
-- Agora: 1 API principal (BI_SOLICITACOES_SUPORTEESPAIDER) com fluxo hierárquico
-- =============================================================================

-- 1. Remover registros das 4 APIs antigas do tenant Araúz
DELETE FROM public.espaider_apis
WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
  AND identificador IN (
    'BI_SOLICITACOES_SUPORTEESPAIDER',
    'BI_SOLICITACOES_SUPORTEESPAIDER_ENTREGAS',
    'BI_SOLICITACOES_SUPORTEESPAIDER_CRONOGRAMAS',
    'BI_SOLICITACOES_SUPORTEESPAIDER_REQUISITOS'
  );

-- 2. Atualizar constraint de tipo para aceitar 'completo' como opção
ALTER TABLE public.espaider_apis
DROP CONSTRAINT IF EXISTS espaider_apis_tipo_check;

ALTER TABLE public.espaider_apis
ADD CONSTRAINT espaider_apis_tipo_check
CHECK (tipo IN ('projetos', 'entregas', 'cronogramas', 'requisitos', 'completo'));

-- 3. Inserir a API consolidada (única)
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
  'Projetos (API Completa)',
  'https://espaider.com.br/Arauz/WCF/WCFExportaDados/WCFExportaDados.svc',
  'PREENCHER_TOKEN',
  'BI_SOLICITACOES_SUPORTEESPAIDER',
  'projetos',
  TRUE,
  '{"fluxo": "hierarquico", "inclui_filhos": true}'
)
ON CONFLICT (tenant_id, identificador) DO UPDATE SET
  nome = EXCLUDED.nome,
  tipo = EXCLUDED.tipo,
  settings = EXCLUDED.settings,
  updated_at = NOW();

-- 4. Documentação
COMMENT ON TABLE public.espaider_apis IS
'Cadastro de APIs Espaider para integração.
Fluxo hierárquico: POST para API principal -> GET via ListaURLFilhos para interfaces filhas.
Identificador único por tenant garante idempotência.';

-- =============================================================================
-- Verificação
-- =============================================================================
-- Após executar, deve existir apenas 1 registro para o tenant Araúz:
-- SELECT * FROM espaider_apis WHERE tenant_id = '00000000-0000-0000-0000-000000000001';
-- Resultado esperado: 1 linha com identificador = 'BI_SOLICITACOES_SUPORTEESPAIDER'
