-- =============================================================================
-- Migration 073: Tipificação Agente / Squad + Skills de projeto (catálogo)
-- Objetivo:
--   - agents.entity_kind: 'agent' | 'squad'
--   - agent_squad_members: composição de squads (somente agentes)
--   - project_skills + skill_documents: conhecimento/contexto gerenciável na UI
-- RLS: isolamento por tenant (mesmo padrão de agents)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. agents.entity_kind
-- -----------------------------------------------------------------------------
ALTER TABLE public.agents
  ADD COLUMN IF NOT EXISTS entity_kind TEXT NOT NULL DEFAULT 'agent';

ALTER TABLE public.agents
  DROP CONSTRAINT IF EXISTS agents_entity_kind_check;

ALTER TABLE public.agents
  ADD CONSTRAINT agents_entity_kind_check
  CHECK (entity_kind IN ('agent', 'squad'));

COMMENT ON COLUMN public.agents.entity_kind IS 'agent: executor único; squad: agrupamento lógico de agentes (sem chat direto na UI)';

CREATE INDEX IF NOT EXISTS idx_agents_entity_kind ON public.agents(tenant_id, entity_kind);

-- -----------------------------------------------------------------------------
-- 2. agent_squad_members
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.agent_squad_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  squad_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  member_agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  CONSTRAINT agent_squad_members_no_self CHECK (squad_id <> member_agent_id),
  CONSTRAINT agent_squad_members_unique_member UNIQUE (squad_id, member_agent_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_squad_members_tenant ON public.agent_squad_members(tenant_id);
CREATE INDEX IF NOT EXISTS idx_agent_squad_members_squad ON public.agent_squad_members(squad_id);
CREATE INDEX IF NOT EXISTS idx_agent_squad_members_member ON public.agent_squad_members(member_agent_id);

DROP TRIGGER IF EXISTS trg_agent_squad_members_updated_at ON public.agent_squad_members;
CREATE TRIGGER trg_agent_squad_members_updated_at
  BEFORE UPDATE ON public.agent_squad_members
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON TABLE public.agent_squad_members IS 'Membros (agents.entity_kind=agent) de um squad (agents.entity_kind=squad)';

-- -----------------------------------------------------------------------------
-- 3. project_skills (catálogo por tenant — gestão via app)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.project_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'custom',
  skill_type TEXT NOT NULL DEFAULT 'custom',
  instruction_body TEXT NOT NULL DEFAULT '',
  source_urls TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  context_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  status TEXT NOT NULL DEFAULT 'draft',
  owners TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  CONSTRAINT project_skills_slug_unique UNIQUE (tenant_id, slug),
  CONSTRAINT project_skills_status_check CHECK (status IN ('draft', 'published', 'archived'))
);

CREATE INDEX IF NOT EXISTS idx_project_skills_tenant ON public.project_skills(tenant_id);
CREATE INDEX IF NOT EXISTS idx_project_skills_status ON public.project_skills(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_project_skills_category ON public.project_skills(tenant_id, category);

DROP TRIGGER IF EXISTS trg_project_skills_updated_at ON public.project_skills;
CREATE TRIGGER trg_project_skills_updated_at
  BEFORE UPDATE ON public.project_skills
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON TABLE public.project_skills IS 'Skills de contexto para gestão de projetos e TI (instruções, URLs, metadados) — separado de agents';
COMMENT ON COLUMN public.project_skills.category IS 'documentation | extraction | research | governance | delivery | communication | technical | custom';
COMMENT ON COLUMN public.project_skills.skill_type IS 'web_scrape | document_extract | synthesis | monitoring | template | risk | compliance | custom';
COMMENT ON COLUMN public.project_skills.instruction_body IS 'Conteúdo principal (Markdown) carregado por orquestradores / playbooks';

-- -----------------------------------------------------------------------------
-- 4. skill_documents (anexos textuais extraídos ou colados pelo usuário)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.skill_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.project_skills(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  source_label TEXT,
  mime_type TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_skill_documents_tenant ON public.skill_documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_skill_documents_skill ON public.skill_documents(skill_id);

DROP TRIGGER IF EXISTS trg_skill_documents_updated_at ON public.skill_documents;
CREATE TRIGGER trg_skill_documents_updated_at
  BEFORE UPDATE ON public.skill_documents
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON TABLE public.skill_documents IS 'Fragmentos de documentação ou extrações vinculadas a uma project_skill';

-- -----------------------------------------------------------------------------
-- 5. RLS
-- -----------------------------------------------------------------------------
ALTER TABLE public.agent_squad_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY agent_squad_members_tenant_isolation ON public.agent_squad_members
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY project_skills_tenant_isolation ON public.project_skills
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY skill_documents_tenant_isolation ON public.skill_documents
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

-- -----------------------------------------------------------------------------
-- 6. Seed: skills padrão por tenant (idempotente)
-- -----------------------------------------------------------------------------
INSERT INTO public.project_skills (
  tenant_id, name, slug, description, category, skill_type, instruction_body, source_urls, tags, status
)
SELECT
  t.id,
  v.name,
  v.slug,
  v.description,
  v.category,
  v.skill_type,
  v.instruction_body,
  ARRAY[]::TEXT[],
  v.tags,
  'published'
FROM public.tenants t
CROSS JOIN (
  VALUES
    (
      'Captura de documentação web (fornecedor)',
      'skill-web-docs-vendor',
      'Coletar e resumir páginas públicas de APIs/SDKs, limites de uso, autenticação e exemplos oficiais.',
      'documentation',
      'web_scrape',
      E'# Captura de documentação web\n- Respeite robots.txt e termos do site.\n- Priorize páginas oficiais (developer.*, docs.*).\n- Extraia: autenticação, quotas, endpoints críticos, exemplos de request/response.\n- Registre URL e data de coleta no contexto do projeto.',
      ARRAY['fornecedores', 'api', 'documentação']::TEXT[]
    ),
    (
      'Extração estruturada de documentos',
      'skill-doc-extract-structured',
      'PDFs, DOCX e planilhas: cronogramas, escopo, valores e requisitos para o projeto.',
      'extraction',
      'document_extract',
      E'# Extração de documentos\n- Identifique tipo (contrato, cronograma, proposta, manual).\n- Preserve valores monetários, datas e marcos com referência à página/seção.\n- Sinalize lacunas ou ambiguidades para validação humana.',
      ARRAY['pdf', 'cronograma', 'escopo']::TEXT[]
    ),
    (
      'Síntese de reuniões e atas',
      'skill-meeting-notes-actions',
      'Transformar notas em decisões, riscos, owners e próximos passos rastreáveis.',
      'communication',
      'synthesis',
      E'# Atas e follow-up\n- Liste decisões com data e responsável.\n- Separe itens: bloqueadores, riscos, ações (com prazo).\n- Alinhe com marcos do cronograma quando possível.',
      ARRAY['atas', 'stakeholders']::TEXT[]
    ),
    (
      'Comparativo de propostas / RFP',
      'skill-rfp-comparison',
      'Normalizar critérios (preço, SLA, segurança, roadmap) entre fornecedores.',
      'governance',
      'template',
      E'# Comparativo RFP\n- Use matriz: requisito × fornecedor × evidência.\n- Destaque gaps e dependências externas.\n- Não invente dados ausentes — marque como "não informado".',
      ARRAY['compras', 'rfp']::TEXT[]
    ),
    (
      'Monitoramento de mudanças em documentação',
      'skill-doc-changelog-watch',
      'Registrar versões de APIs e breaking changes relevantes ao projeto.',
      'technical',
      'monitoring',
      E'# Changelog / versões\n- Compare release notes com dependências do projeto.\n- Classifique impacto: breaking, deprecação, melhoria.\n- Sugira ações de migração quando aplicável.',
      ARRAY['changelog', 'breaking-change']::TEXT[]
    ),
    (
      'Orçamento e aprovações',
      'skill-budget-approved-extract',
      'Extrair baseline de custo aprovado, alçadas e condições de faturamento.',
      'governance',
      'document_extract',
      E'# Orçamento\n- Extraia total, moeda, parcelas, aprovador e vigência.\n- Relacione com entregáveis ou fases quando citado.\n- Marque itens "a confirmar" se o documento for ambíguo.',
      ARRAY['financeiro', 'baseline']::TEXT[]
    ),
    (
      'Gestão de riscos do projeto',
      'skill-project-risk-register',
      'Manter registro de riscos com probabilidade, impacto e mitigação.',
      'governance',
      'risk',
      E'# Riscos\n- Formato: risco, causa, impacto, probabilidade, mitigação, owner.\n- Vincule a marcos ou fornecedores quando fizer sentido.',
      ARRAY['riscos', 'pmo']::TEXT[]
    ),
    (
      'Conformidade e licenças de software',
      'skill-oss-license-audit',
      'Mapear dependências OSS, licenças e obrigações de atribuição.',
      'technical',
      'compliance',
      E'# Licenças\n- Liste pacote, versão, licença, URL da licença.\n- Sinalize GPL/AGPL ou incompatibilidades com política da empresa.',
      ARRAY['legal', 'opensource']::TEXT[]
    ),
    (
      'ADR — decisões de arquitetura',
      'skill-architecture-decision-record',
      'Padronizar registro de decisões técnicas com contexto, opções e trade-offs.',
      'technical',
      'template',
      E'# ADR\n- Título, status, contexto, decisão, consequências.\n- Referencie RFCs, POCs ou benchmarks quando existirem.',
      ARRAY['arquitetura', 'adr']::TEXT[]
    ),
    (
      'Postmortem de incidentes',
      'skill-incident-postmortem',
      'Linha do tempo, causa raiz, ações corretivas e prevenção.',
      'technical',
      'synthesis',
      E'# Postmortem\n- Timeline objetiva, impacto ao usuário, causa raiz (5 porquês opcional).\n- Ações: imediatas, curto e longo prazo com owner.',
      ARRAY['sre', 'incidente']::TEXT[]
    ),
    (
      'Release notes a partir de entregas',
      'skill-release-notes-from-commits',
      'Converter entregas técnicas em notas legíveis para negócio.',
      'delivery',
      'synthesis',
      E'# Release notes\n- Agrupe por: novidades, melhorias, correções, breaking.\n- Linguagem acessível; linke issues/tickets quando existirem.',
      ARRAY['release', 'produto']::TEXT[]
    ),
    (
      'Checklist de revisão de segurança',
      'skill-security-review-checklist',
      'Revisão de superfície: auth, dados sensíveis, dependências, segredos.',
      'governance',
      'compliance',
      E'# Security review\n- AuthN/Z, armazenamento de segredos, exposição de PII, headers, rate limit.\n- Aponte severidade e referência OWASP ASVS quando útil.',
      ARRAY['segurança', 'owasp']::TEXT[]
    ),
    (
      'Pesquisa técnica orientada',
      'skill-technical-research-brief',
      'Produzir brief com hipóteses, fontes e recomendação para decisão.',
      'research',
      'synthesis',
      E'# Research brief\n- Pergunta, escopo, fontes citadas, prós/contras, recomendação e incertezas.\n- Diferencie opinião de fato verificável.',
      ARRAY['pesquisa', 'spike']::TEXT[]
    )
) AS v(name, slug, description, category, skill_type, instruction_body, tags)
ON CONFLICT (tenant_id, slug) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 7. Estender auditoria RLS (Story 2.25+)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.audit_all_rls_policies()
RETURNS TABLE (
    table_name TEXT,
    rls_enabled BOOLEAN,
    total_policies INT,
    service_role_policies INT,
    authenticated_policies INT,
    tenant_isolation_found BOOLEAN,
    has_tenant_id_column BOOLEAN,
    policy_details JSONB
) AS $$
DECLARE
    v_table RECORD;
BEGIN
    FOR v_table IN (
        SELECT unnest(ARRAY[
            'tenants',
            'profiles',
            'projects',
            'project_schedules',
            'project_deliveries',
            'project_requirements',
            'espaider_apis',
            'sync_logs',
            'integration_log_entries',
            'project_histories',
            'project_approvers',
            'project_budgets',
            'agents',
            'agent_types',
            'agent_versions',
            'agent_variables',
            'agent_runs',
            'agent_templates',
            'lm_providers',
            'lm_models',
            'agent_squad_members',
            'project_skills',
            'skill_documents'
        ]) AS name
    ) LOOP
        IF EXISTS (
            SELECT 1 FROM pg_tables
            WHERE schemaname = 'public' AND tablename = v_table.name
        ) THEN
            RETURN QUERY SELECT * FROM public.audit_rls_policy(v_table.name);
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
