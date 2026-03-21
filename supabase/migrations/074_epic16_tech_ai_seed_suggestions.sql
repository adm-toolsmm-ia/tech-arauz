-- EPIC 16 — Sugestões Tech AI (escritório / gestão de projetos)
-- Idempotente: ON CONFLICT DO NOTHING em project_skills e agents.
-- Agentes/squad só inseridos se existir ao menos um lm_models ativo no tenant.

-- -----------------------------------------------------------------------------
-- 1. project_skills adicionais (OCR, web scraping foco TI, playbook escritório)
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
      'OCR e dados estruturados a partir de documentos escaneados',
      'skill-ocr-scanned-documents-tech-ai',
      'Fluxo para extrair campos de PDFs/imagens (contratos, notas fiscais, atas) com validação humana obrigatória.',
      'extraction',
      'document_extract',
      E'# OCR / documentos escaneados\n- Identifique tipo de documento e idioma.\n- Extraia apenas campos com alta confiança; marque baixa confiança para revisão.\n- Preserve referência (página, trecho ou bbox se disponível).\n- Nunca invente valores ilegíveis — use "ilegível" ou "não detectado".\n- Sugira checklist de validação humana antes de uso em decisões.',
      ARRAY['ocr', 'pdf', 'escaneado', 'extração']::TEXT[]
    ),
    (
      'Web scraping responsável — fornecedores e docs de APIs em projetos de TI',
      'skill-web-scrape-vendor-api-docs-tech-ai',
      'Monitorar páginas públicas de documentação, status e changelogs relevantes ao projeto.',
      'technical',
      'web_scrape',
      E'# Web scraping (TI / fornecedores)\n- Respeite robots.txt, termos de uso e rate limits.\n- Priorize fontes oficiais (developer.*, status.*, docs.*).\n- Registre URL, data/hora da coleta e hash ou etag quando existir.\n- Classifique: breaking change, deprecação, melhoria ou informativo.\n- Não armazene credenciais ou dados pessoais sem base legal.',
      ARRAY['scraping', 'fornecedor', 'api', 'changelog']::TEXT[]
    ),
    (
      'Playbook — assistente escritório Tech AI (dia a dia)',
      'skill-daily-tech-ai-office-playbook',
      'Síntese e priorização de tarefas técnicas e administrativas do dia.',
      'delivery',
      'template',
      E'# Assistente escritório Tech AI\n- Resuma em até 5 bullets o que precisa de atenção hoje.\n- Separe: urgente/importante, bloqueios, follow-ups com cliente/fornecedor.\n- Sugira próximo passo concreto (ação, owner sugerido, prazo relativo).\n- Alinhe linguagem ao contexto jurídico/negocial quando o usuário indicar.\n- Não substitua parecer jurídico ou aprovações formais.',
      ARRAY['produtividade', 'escritório', 'tech-ai']::TEXT[]
    )
) AS v(name, slug, description, category, skill_type, instruction_body, tags)
ON CONFLICT (tenant_id, slug) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 2. Agentes draft (sugestão) — modelo LLM = primeiro ativo do tenant
-- -----------------------------------------------------------------------------
INSERT INTO public.agents (
  tenant_id,
  name,
  slug,
  description,
  status,
  entity_kind,
  usage_type,
  show_in_shortcut,
  is_global_chatbot,
  model_provider,
  model_id,
  model_temperature,
  model_max_tokens,
  persona,
  prompt_objective,
  prompt_instructions,
  agent_type,
  requirements,
  tags
)
SELECT
  t.id,
  'Tech AI — Gestão de projetos (sugestão)',
  'seed-tech-ai-projetos',
  'Rascunho sugerido: status, riscos e marcos. Revise prompts e publique quando adequado.',
  'draft',
  'agent',
  'chatbot',
  FALSE,
  FALSE,
  mm.provider_slug,
  mm.model_id,
  0.7,
  2000,
  E'Assistente de PMO técnico no escritório. Português, objetivo, sem jargão desnecessário.',
  E'Ajudar a estruturar status de projetos de TI, dependências, riscos e próximos passos.',
  E'["Responda em português","Use listas curtas","Marque incertezas explicitamente"]',
  'custom',
  ARRAY[]::TEXT[],
  ARRAY['seed', 'projetos', 'tech-ai']::TEXT[]
FROM public.tenants t
CROSS JOIN LATERAL (
  SELECT m.model_id, p.slug AS provider_slug
  FROM public.lm_models m
  INNER JOIN public.lm_providers p ON p.id = m.provider_id AND p.tenant_id = t.id
  WHERE m.tenant_id = t.id
    AND COALESCE(m.is_active, TRUE)
    AND COALESCE(p.is_active, TRUE)
  ORDER BY m.display_order NULLS LAST, m.name
  LIMIT 1
) mm
ON CONFLICT (tenant_id, slug) DO NOTHING;

INSERT INTO public.agents (
  tenant_id,
  name,
  slug,
  description,
  status,
  entity_kind,
  usage_type,
  show_in_shortcut,
  is_global_chatbot,
  model_provider,
  model_id,
  model_temperature,
  model_max_tokens,
  persona,
  prompt_objective,
  prompt_instructions,
  agent_type,
  requirements,
  tags
)
SELECT
  t.id,
  'Tech AI — Documentos e OCR (sugestão)',
  'seed-tech-ai-documentos',
  'Rascunho sugerido: leitura de documentos, extração e checklist de validação.',
  'draft',
  'agent',
  'workflow',
  FALSE,
  FALSE,
  mm.provider_slug,
  mm.model_id,
  0.3,
  4000,
  E'Especialista em análise de documentos de projeto e contratos (texto/OCR). Conservador quanto a inferências.',
  E'Extrair e estruturar informações de documentos para apoio à gestão, com foco em rastreabilidade.',
  E'["Indique trechos ou páginas de referência","Liste campos não encontrados","Sinalize necessidade de revisão humana"]',
  'custom',
  ARRAY[]::TEXT[],
  ARRAY['seed', 'ocr', 'documentos', 'tech-ai']::TEXT[]
FROM public.tenants t
CROSS JOIN LATERAL (
  SELECT m.model_id, p.slug AS provider_slug
  FROM public.lm_models m
  INNER JOIN public.lm_providers p ON p.id = m.provider_id AND p.tenant_id = t.id
  WHERE m.tenant_id = t.id
    AND COALESCE(m.is_active, TRUE)
    AND COALESCE(p.is_active, TRUE)
  ORDER BY m.display_order NULLS LAST, m.name
  LIMIT 1
) mm
ON CONFLICT (tenant_id, slug) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 3. Squad draft (sem membros — composição na UI)
-- -----------------------------------------------------------------------------
INSERT INTO public.agents (
  tenant_id,
  name,
  slug,
  description,
  status,
  entity_kind,
  usage_type,
  show_in_shortcut,
  is_global_chatbot,
  model_provider,
  model_id,
  model_temperature,
  model_max_tokens,
  persona,
  prompt_objective,
  prompt_instructions,
  agent_type,
  requirements,
  tags
)
SELECT
  t.id,
  'Squad — Entrega de projetos Tech AI (sugestão)',
  'seed-squad-entrega-projetos',
  'Squad sugerido: adicione agentes individuais na edição. Sem chat de teste direto.',
  'draft',
  'squad',
  'workflow',
  FALSE,
  FALSE,
  mm.provider_slug,
  mm.model_id,
  0.5,
  2000,
  E'Equipe lógica para orquestrar agentes de projeto e documentação.',
  E'Coordenar visão de entrega combinando especialistas (configure os membros).',
  E'[]',
  'custom',
  ARRAY[]::TEXT[],
  ARRAY['seed', 'squad', 'tech-ai']::TEXT[]
FROM public.tenants t
CROSS JOIN LATERAL (
  SELECT m.model_id, p.slug AS provider_slug
  FROM public.lm_models m
  INNER JOIN public.lm_providers p ON p.id = m.provider_id AND p.tenant_id = t.id
  WHERE m.tenant_id = t.id
    AND COALESCE(m.is_active, TRUE)
    AND COALESCE(p.is_active, TRUE)
  ORDER BY m.display_order NULLS LAST, m.name
  LIMIT 1
) mm
ON CONFLICT (tenant_id, slug) DO NOTHING;
