-- =============================================================================
-- Tech Arauz - Fix API Espaider (Executar no Supabase Dashboard > SQL Editor)
-- =============================================================================
-- Este script:
-- 1. Diagnostica o problema de visualização
-- 2. Verifica profiles e tenant
-- 3. Insere a API de Projetos
-- =============================================================================

-- PASSO 1: Verificar tenant Araúz existe
SELECT '=== TENANT ===' as diagnostico;
SELECT id, slug, name FROM public.tenants
WHERE id = '00000000-0000-0000-0000-000000000001';

-- PASSO 2: Verificar profiles existentes e seus tenants
SELECT '=== PROFILES ===' as diagnostico;
SELECT id, email, tenant_id, role FROM public.profiles LIMIT 10;

-- PASSO 3: Verificar o que existe na tabela espaider_apis
SELECT '=== APIS EXISTENTES ===' as diagnostico;
SELECT id, nome, identificador, tipo, tenant_id, is_active
FROM public.espaider_apis;

-- PASSO 4: Limpar APIs antigas (se existirem com tenant errado ou duplicadas)
DELETE FROM public.espaider_apis
WHERE identificador = 'BI_SOLICITACOES_SUPORTEESPAIDER';

-- PASSO 5: Inserir a API de Projetos com o tenant correto
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

-- PASSO 6: Verificar se foi inserido corretamente
SELECT '=== API INSERIDA ===' as diagnostico;
SELECT id, nome, identificador, tipo, tenant_id, is_active, created_at
FROM public.espaider_apis
WHERE identificador = 'BI_SOLICITACOES_SUPORTEESPAIDER';

-- =============================================================================
-- IMPORTANTE: Verificar se o profile do usuário logado tem o tenant_id correto
-- =============================================================================
-- Se o resultado do PASSO 2 mostrar um profile sem tenant_id ou com tenant errado,
-- execute o comando abaixo substituindo <USER_ID> pelo ID do usuário:
--
-- UPDATE public.profiles
-- SET tenant_id = '00000000-0000-0000-0000-000000000001'
-- WHERE id = '<USER_ID>';
-- =============================================================================
