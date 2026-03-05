-- =============================================================================
-- Migration 054: Tempos de Permanência e Horas Lançadas
-- Created: 2026-03-04
-- Description:
--   1. Expande CHECK constraint tipo em espaider_apis ('horas_lancadas')
--   2. Adiciona pasta_consultivo_id (INTEGER) em projects
--   3. Cria tabela project_tempo_permanencia (interface filha de Projetos)
--   4. Cria tabela project_horas_lancadas (API independente)
--   5. RLS por tenant_id em ambas as tabelas
--   6. Seed: cadastra API BI_SOLICITACOES_PROJETOSESPAIDER_HORASLANCADAS
-- =============================================================================

-- ============================================================================
-- PARTE 1: Expandir constraint de tipo em espaider_apis
-- ============================================================================

ALTER TABLE public.espaider_apis
  DROP CONSTRAINT IF EXISTS espaider_apis_tipo_check;

ALTER TABLE public.espaider_apis
  ADD CONSTRAINT espaider_apis_tipo_check
  CHECK (tipo IN ('projetos', 'entregas', 'cronogramas', 'requisitos', 'completo', 'horas_lancadas'));

-- ============================================================================
-- PARTE 2: Adicionar pasta_consultivo_id em projects
-- ============================================================================

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS pasta_consultivo_id INTEGER;

COMMENT ON COLUMN public.projects.pasta_consultivo_id IS
  'ID numérico da pasta consultiva no ERP Espaider (PASTACONSULTIVO_ID). Diferente de pasta_consultivo (TEXT).';

-- ============================================================================
-- PARTE 3: Tabela project_tempo_permanencia
-- Interface filha retornada via ListaURLFilhos do BI_SOLICITACOES_PROJETOSESPAIDER
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.project_tempo_permanencia (
  id                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id              UUID        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id             UUID        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  espaider_id            INTEGER     NOT NULL,
  fase                   TEXT,
  responsavel            TEXT,
  situacao               TEXT,
  tempo_permanencia_dias NUMERIC(10,2),
  data_inicio            DATE,
  data_fim               DATE,
  espaider_raw           JSONB,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_tempo_permanencia_tenant_espaider UNIQUE (tenant_id, espaider_id),
  CONSTRAINT fk_tempo_permanencia_tenant
    FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);

COMMENT ON TABLE public.project_tempo_permanencia IS
  'Tempos de permanência por fase/responsável/situação. Populada via interface filha da API BI_SOLICITACOES_PROJETOSESPAIDER_TEMPOSPERMANENCIA.';

-- ============================================================================
-- PARTE 4: Tabela project_horas_lancadas
-- API independente: BI_SOLICITACOES_PROJETOSESPAIDER_HORASLANCADAS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.project_horas_lancadas (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id            UUID        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id           UUID        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  espaider_id          INTEGER     NOT NULL,
  solicitacao_id       INTEGER,
  pasta_consultivo_id  INTEGER,
  profissional         TEXT,
  horas                NUMERIC(10,2),
  data_lancamento      DATE,
  tipo_lancamento      TEXT,
  espaider_raw         JSONB,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_horas_lancadas_tenant_espaider UNIQUE (tenant_id, espaider_id),
  CONSTRAINT fk_horas_lancadas_tenant
    FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);

COMMENT ON TABLE public.project_horas_lancadas IS
  'Lançamentos de horas por profissional/projeto. Populada via API independente BI_SOLICITACOES_PROJETOSESPAIDER_HORASLANCADAS.';

-- ============================================================================
-- PARTE 5: Índices de performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_tempo_permanencia_project_id
  ON public.project_tempo_permanencia(project_id);

CREATE INDEX IF NOT EXISTS idx_tempo_permanencia_tenant_id
  ON public.project_tempo_permanencia(tenant_id);

CREATE INDEX IF NOT EXISTS idx_tempo_permanencia_espaider_id
  ON public.project_tempo_permanencia(espaider_id);

CREATE INDEX IF NOT EXISTS idx_horas_lancadas_project_id
  ON public.project_horas_lancadas(project_id);

CREATE INDEX IF NOT EXISTS idx_horas_lancadas_tenant_id
  ON public.project_horas_lancadas(tenant_id);

CREATE INDEX IF NOT EXISTS idx_horas_lancadas_espaider_id
  ON public.project_horas_lancadas(espaider_id);

-- ============================================================================
-- PARTE 6: Triggers updated_at
-- ============================================================================

DROP TRIGGER IF EXISTS set_updated_at_tempo_permanencia ON public.project_tempo_permanencia;
CREATE TRIGGER set_updated_at_tempo_permanencia
  BEFORE UPDATE ON public.project_tempo_permanencia
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_horas_lancadas ON public.project_horas_lancadas;
CREATE TRIGGER set_updated_at_horas_lancadas
  BEFORE UPDATE ON public.project_horas_lancadas
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- PARTE 7: Row Level Security
-- ============================================================================

ALTER TABLE public.project_tempo_permanencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_horas_lancadas    ENABLE ROW LEVEL SECURITY;

-- Policies: project_tempo_permanencia
DROP POLICY IF EXISTS "tempo_permanencia: tenant isolation select" ON public.project_tempo_permanencia;
CREATE POLICY "tempo_permanencia: tenant isolation select"
  ON public.project_tempo_permanencia FOR SELECT
  TO authenticated
  USING (tenant_id = public.get_user_tenant_id());

DROP POLICY IF EXISTS "tempo_permanencia: service role full access" ON public.project_tempo_permanencia;
CREATE POLICY "tempo_permanencia: service role full access"
  ON public.project_tempo_permanencia FOR ALL
  TO service_role
  USING (true);

-- Policies: project_horas_lancadas
DROP POLICY IF EXISTS "horas_lancadas: tenant isolation select" ON public.project_horas_lancadas;
CREATE POLICY "horas_lancadas: tenant isolation select"
  ON public.project_horas_lancadas FOR SELECT
  TO authenticated
  USING (tenant_id = public.get_user_tenant_id());

DROP POLICY IF EXISTS "horas_lancadas: service role full access" ON public.project_horas_lancadas;
CREATE POLICY "horas_lancadas: service role full access"
  ON public.project_horas_lancadas FOR ALL
  TO service_role
  USING (true);

-- ============================================================================
-- PARTE 8: Seed — cadastrar API de Horas Lançadas para o tenant Araúz
-- ============================================================================

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
  'Horas Lançadas',
  'https://espaider.com.br/Arauz/WCF/WCFExportaDados/WCFExportaDados.svc',
  'PREENCHER_TOKEN',
  'BI_SOLICITACOES_PROJETOSESPAIDER_HORASLANCADAS',
  'horas_lancadas',
  TRUE,
  '{"fluxo": "independente", "roda_apos": "projetos"}'
)
ON CONFLICT (tenant_id, identificador) DO NOTHING;

-- ============================================================================
-- Verificação pós-apply esperada:
--   SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public'
--     AND table_name IN ('project_tempo_permanencia', 'project_horas_lancadas');
--   → 2 linhas
--
--   SELECT tipo, identificador FROM espaider_apis
--   WHERE tenant_id = '00000000-0000-0000-0000-000000000001';
--   → incluir linha horas_lancadas / BI_SOLICITACOES_PROJETOSESPAIDER_HORASLANCADAS
-- ============================================================================
