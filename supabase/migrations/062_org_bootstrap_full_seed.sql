-- =============================================================================
-- Migration 062: AI Organizational Bootstrap — Seed Completo
-- Story 6.1.9: AI Bootstrap Engine
-- Epic: AI Organizational Bootstrap
-- =============================================================================
-- Cadastros padrões para escritório jurídico de médio/grande porte
-- Direito empresarial com destaque no agronegócio
-- Baseado nos exemplos do PRD
-- =============================================================================

DO $$
DECLARE
  v_tenant_id UUID;
  v_area_rc UUID;
  v_area_trab UUID;
  v_area_civil UUID;
  v_area_consult UUID;
  v_area_legalops UUID;
  v_area_exp UUID;
  v_area_comercial UUID;
  v_area_fin UUID;
  v_area_admin UUID;
  v_area_tech UUID;
  v_area_agro UUID;
  v_nucleus_ajuiz UUID;
  v_nucleus_negoc UUID;
  v_nucleus_acomp UUID;
  v_nucleus_exec UUID;
  v_nucleus_publ UUID;
  v_nucleus_prot UUID;
  v_nucleus_atual UUID;
  v_nucleus_dilig UUID;
  v_nucleus_prazos UUID;
  v_nucleus_contratos UUID;
  v_nucleus_reg UUID;
  v_nucleus_cred UUID;
  v_nucleus_comp UUID;
  v_process_contratos UUID;
  v_process_contenc UUID;
  v_process_consult UUID;
  v_process_abertura UUID;
  v_process_public UUID;
  v_process_prazos UUID;
  v_process_petic UUID;
  v_process_prot UUID;
  v_routine_analise UUID;
  v_routine_estrategia UUID;
  v_routine_elab UUID;
  v_routine_revisao UUID;
  v_routine_petic UUID;
  v_routine_acomp UUID;
  v_system_juridico UUID;
  v_system_crm UUID;
  v_system_fin UUID;
BEGIN
  SELECT id INTO v_tenant_id FROM public.tenants WHERE slug = 'arauz' LIMIT 1;
  IF v_tenant_id IS NULL THEN RETURN; END IF;

  IF EXISTS (SELECT 1 FROM public.org_areas WHERE tenant_id = v_tenant_id LIMIT 1) THEN
    RETURN;
  END IF;

  -- =========================================================================
  -- ÁREAS (11 áreas - PRD + Agronegócio)
  -- =========================================================================
  INSERT INTO public.org_areas (tenant_id, name, description, objective, responsible_roles, documentation)
  VALUES
    (v_tenant_id, 'Recuperação de Crédito', 'Gestão de cobrança e recuperação de créditos', 'Maximizar recuperação com eficiência processual', '["coordenador_rc","advogado_senior"]'::jsonb, '{}'::jsonb)
  RETURNING id INTO v_area_rc;

  INSERT INTO public.org_areas (tenant_id, name, description, objective, responsible_roles, documentation)
  VALUES
    (v_tenant_id, 'Trabalhista', 'Direito do trabalho e relações trabalhistas', 'Atuação em demandas trabalhistas', '["coordenador_trabalhista","advogado_senior"]'::jsonb, '{}'::jsonb)
  RETURNING id INTO v_area_trab;

  INSERT INTO public.org_areas (tenant_id, name, description, objective, responsible_roles, documentation)
  VALUES
    (v_tenant_id, 'Contencioso Cível', 'Litígios cíveis e demandas judiciais', 'Resolução de conflitos cíveis', '["coordenador_civel","advogado_senior"]'::jsonb, '{}'::jsonb)
  RETURNING id INTO v_area_civil;

  INSERT INTO public.org_areas (tenant_id, name, description, objective, responsible_roles, documentation)
  VALUES
    (v_tenant_id, 'Consultivo', 'Assessoria jurídica preventiva e consultiva', 'Orientação jurídica estratégica', '["socio","advogado_consultivo"]'::jsonb, '{}'::jsonb)
  RETURNING id INTO v_area_consult;

  INSERT INTO public.org_areas (tenant_id, name, description, objective, responsible_roles, documentation)
  VALUES
    (v_tenant_id, 'Legal Operations', 'Operações jurídicas e gestão processual', 'Eficiência operacional e controle de prazos', '["coordenador_legalops","analista_processos"]'::jsonb, '{}'::jsonb)
  RETURNING id INTO v_area_legalops;

  INSERT INTO public.org_areas (tenant_id, name, description, objective, responsible_roles, documentation)
  VALUES
    (v_tenant_id, 'Experiência do Cliente', 'Atendimento e satisfação do cliente', 'Excelência no relacionamento com clientes', '["gerente_relacionamento","analista_atendimento"]'::jsonb, '{}'::jsonb)
  RETURNING id INTO v_area_exp;

  INSERT INTO public.org_areas (tenant_id, name, description, objective, responsible_roles, documentation)
  VALUES
    (v_tenant_id, 'Comercial', 'Vendas e negócios jurídicos', 'Captação e retenção de clientes', '["diretor_comercial","analista_comercial"]'::jsonb, '{}'::jsonb)
  RETURNING id INTO v_area_comercial;

  INSERT INTO public.org_areas (tenant_id, name, description, objective, responsible_roles, documentation)
  VALUES
    (v_tenant_id, 'Financeiro', 'Gestão financeira e contábil', 'Controle financeiro e faturamento', '["controller","analista_financeiro"]'::jsonb, '{}'::jsonb)
  RETURNING id INTO v_area_fin;

  INSERT INTO public.org_areas (tenant_id, name, description, objective, responsible_roles, documentation)
  VALUES
    (v_tenant_id, 'Administrativo', 'Administração geral e suporte', 'Suporte administrativo à operação', '["gerente_administrativo","assistente_admin"]'::jsonb, '{}'::jsonb)
  RETURNING id INTO v_area_admin;

  INSERT INTO public.org_areas (tenant_id, name, description, objective, responsible_roles, documentation)
  VALUES
    (v_tenant_id, 'Inovação e Tecnologia', 'Tecnologia e automação jurídica', 'Inovação e suporte tecnológico', '["cto","analista_ti"]'::jsonb, '{}'::jsonb)
  RETURNING id INTO v_area_tech;

  INSERT INTO public.org_areas (tenant_id, name, description, objective, responsible_roles, documentation)
  VALUES
    (v_tenant_id, 'Agronegócio', 'Direito agrário, rural e agronegócio', 'Atuação especializada em direito do agronegócio', '["coordenador_agro","advogado_agro"]'::jsonb, '{"focus": "contratos rurais, regularização fundiária, crédito rural, compliance ambiental"}'::jsonb)
  RETURNING id INTO v_area_agro;

  -- =========================================================================
  -- NÚCLEOS (por área - exemplos PRD)
  -- =========================================================================
  INSERT INTO public.org_nuclei (tenant_id, area_id, name, description, objective)
  VALUES (v_tenant_id, v_area_rc, 'Núcleo de Ajuizamento', 'Ajuizamento de ações', 'Ajuizar demandas com qualidade')
  RETURNING id INTO v_nucleus_ajuiz;

  INSERT INTO public.org_nuclei (tenant_id, area_id, name, description, objective)
  VALUES (v_tenant_id, v_area_rc, 'Núcleo de Negociação', 'Negociação extrajudicial', 'Recuperar créditos via negociação')
  RETURNING id INTO v_nucleus_negoc;

  INSERT INTO public.org_nuclei (tenant_id, area_id, name, description, objective)
  VALUES (v_tenant_id, v_area_rc, 'Núcleo de Acompanhamento Processual', 'Acompanhamento de processos', 'Monitorar andamento processual')
  RETURNING id INTO v_nucleus_acomp;

  INSERT INTO public.org_nuclei (tenant_id, area_id, name, description, objective)
  VALUES (v_tenant_id, v_area_rc, 'Núcleo de Execução', 'Execuções e cumprimento de sentença', 'Efetivar cobranças via execução')
  RETURNING id INTO v_nucleus_exec;

  INSERT INTO public.org_nuclei (tenant_id, area_id, name, description, objective)
  VALUES (v_tenant_id, v_area_legalops, 'Núcleo de Publicações', 'Controle de publicações processuais', 'Garantir ciência das publicações')
  RETURNING id INTO v_nucleus_publ;

  INSERT INTO public.org_nuclei (tenant_id, area_id, name, description, objective)
  VALUES (v_tenant_id, v_area_legalops, 'Núcleo de Protocolos', 'Protocolos judiciais e extrajudiciais', 'Protocolo ágil e rastreável')
  RETURNING id INTO v_nucleus_prot;

  INSERT INTO public.org_nuclei (tenant_id, area_id, name, description, objective)
  VALUES (v_tenant_id, v_area_legalops, 'Núcleo de Atualização de Sistema do Cliente', 'Atualização em sistemas de clientes', 'Manter sistemas de clientes atualizados')
  RETURNING id INTO v_nucleus_atual;

  INSERT INTO public.org_nuclei (tenant_id, area_id, name, description, objective)
  VALUES (v_tenant_id, v_area_legalops, 'Núcleo de Diligências', 'Gestão de diligências externas', 'Executar diligências com eficiência')
  RETURNING id INTO v_nucleus_dilig;

  INSERT INTO public.org_nuclei (tenant_id, area_id, name, description, objective)
  VALUES (v_tenant_id, v_area_legalops, 'Núcleo de Controle de Prazos', 'Controle e alertas de prazos', 'Evitar perda de prazos processuais')
  RETURNING id INTO v_nucleus_prazos;

  INSERT INTO public.org_nuclei (tenant_id, area_id, name, description, objective)
  VALUES (v_tenant_id, v_area_agro, 'Núcleo de Contratos Rurais', 'Contratos agrários e rurais', 'Estruturar contratos do agronegócio')
  RETURNING id INTO v_nucleus_contratos;

  INSERT INTO public.org_nuclei (tenant_id, area_id, name, description, objective)
  VALUES (v_tenant_id, v_area_agro, 'Núcleo de Regularização Fundiária', 'Regularização de imóveis rurais', 'Regularizar documentação fundiária')
  RETURNING id INTO v_nucleus_reg;

  INSERT INTO public.org_nuclei (tenant_id, area_id, name, description, objective)
  VALUES (v_tenant_id, v_area_agro, 'Núcleo de Crédito Rural', 'Crédito e financiamento rural', 'Assessoria em operações de crédito rural')
  RETURNING id INTO v_nucleus_cred;

  INSERT INTO public.org_nuclei (tenant_id, area_id, name, description, objective)
  VALUES (v_tenant_id, v_area_agro, 'Núcleo de Compliance Ambiental', 'Compliance e licenciamento ambiental', 'Conformidade ambiental no agronegócio')
  RETURNING id INTO v_nucleus_comp;

  -- Núcleos adicionais para outras áreas
  INSERT INTO public.org_nuclei (tenant_id, area_id, name, description, objective)
  VALUES
    (v_tenant_id, v_area_tech, 'Núcleo de Suporte ao Sistema', 'Suporte ao sistema jurídico', 'Garantir disponibilidade dos sistemas'),
    (v_tenant_id, v_area_tech, 'Núcleo de Projetos', 'Projetos de tecnologia', 'Implementar melhorias tecnológicas'),
    (v_tenant_id, v_area_tech, 'Núcleo de Automação Jurídica', 'Automação de processos jurídicos', 'Automatizar rotinas repetitivas'),
    (v_tenant_id, v_area_tech, 'Núcleo de Gestão de Dados', 'Gestão e análise de dados', 'Data-driven na operação jurídica');

  -- =========================================================================
  -- PROCESSOS (exemplos PRD)
  -- =========================================================================
  INSERT INTO public.org_processes (tenant_id, area_id, nucleus_id, name, description, objective, inputs, outputs, responsible_roles, risks, impacts)
  VALUES (v_tenant_id, v_area_exp, NULL, 'Gestão de Contratos de Clientes', 'Gestão do ciclo de vida dos contratos de honorários', 'Manter contratos atualizados e vigentes', '[]'::jsonb, '[]'::jsonb, '["gerente_relacionamento"]'::jsonb, '[]'::jsonb, '[]'::jsonb)
  RETURNING id INTO v_process_contratos;

  INSERT INTO public.org_processes (tenant_id, area_id, nucleus_id, name, description, objective, inputs, outputs, responsible_roles, risks, impacts)
  VALUES (v_tenant_id, v_area_civil, NULL, 'Gestão de Processos Contenciosos', 'Gestão completa do ciclo processual contencioso', 'Eficiência na condução de processos', '["petição inicial","documentos do cliente"]'::jsonb, '["sentença","acórdão"]'::jsonb, '["advogado_senior","analista_processos"]'::jsonb, '["perda de prazo","erro jurídico"]'::jsonb, '["impacto financeiro","impacto reputacional"]'::jsonb)
  RETURNING id INTO v_process_contenc;

  INSERT INTO public.org_processes (tenant_id, area_id, nucleus_id, name, description, objective, inputs, outputs, responsible_roles, risks, impacts)
  VALUES (v_tenant_id, v_area_consult, NULL, 'Atuação Consultiva', 'Assessoria jurídica preventiva', 'Orientar clientes de forma preventiva', '[]'::jsonb, '[]'::jsonb, '["advogado_consultivo"]'::jsonb, '[]'::jsonb, '[]'::jsonb)
  RETURNING id INTO v_process_consult;

  INSERT INTO public.org_processes (tenant_id, area_id, nucleus_id, name, description, objective, inputs, outputs, responsible_roles, risks, impacts)
  VALUES (v_tenant_id, v_area_exp, NULL, 'Abertura de Pastas de Clientes', 'Abertura e cadastro de novos clientes', 'Cadastrar clientes com documentação completa', '["documentos do cliente","contrato"]'::jsonb, '["pasta aberta","cliente cadastrado"]'::jsonb, '["analista_atendimento"]'::jsonb, '[]'::jsonb, '[]'::jsonb)
  RETURNING id INTO v_process_abertura;

  INSERT INTO public.org_processes (tenant_id, area_id, nucleus_id, name, description, objective, inputs, outputs, responsible_roles, risks, impacts)
  VALUES (v_tenant_id, v_area_legalops, v_nucleus_publ, 'Controle de Publicações Processuais', 'Controle e ciência de publicações', 'Garantir ciência tempestiva de publicações', '["diário oficial","intimações"]'::jsonb, '["ciência registrada","alerta de prazo"]'::jsonb, '["analista_processos"]'::jsonb, '["perda de prazo"]'::jsonb, '["preclusão"]'::jsonb)
  RETURNING id INTO v_process_public;

  INSERT INTO public.org_processes (tenant_id, area_id, nucleus_id, name, description, objective, inputs, outputs, responsible_roles, risks, impacts)
  VALUES (v_tenant_id, v_area_legalops, v_nucleus_prazos, 'Controle de Prazos', 'Controle e alertas de prazos processuais', 'Evitar preclusões e perda de prazos', '["publicações","prazos do processo"]'::jsonb, '["alertas","controle de cumprimento"]'::jsonb, '["analista_processos"]'::jsonb, '["perda de prazo"]'::jsonb, '["preclusão","perda do direito"]'::jsonb)
  RETURNING id INTO v_process_prazos;

  INSERT INTO public.org_processes (tenant_id, area_id, nucleus_id, name, description, objective, inputs, outputs, responsible_roles, risks, impacts)
  VALUES (v_tenant_id, v_area_civil, NULL, 'Elaboração de Petições', 'Elaboração de peças processuais', 'Produzir petições com qualidade jurídica', '["documentos","pesquisa jurídica"]'::jsonb, '["petição elaborada"]'::jsonb, '["advogado","estagiário"]'::jsonb, '["erro jurídico"]'::jsonb, '["impacto no processo"]'::jsonb)
  RETURNING id INTO v_process_petic;

  INSERT INTO public.org_processes (tenant_id, area_id, nucleus_id, name, description, objective, inputs, outputs, responsible_roles, risks, impacts)
  VALUES (v_tenant_id, v_area_legalops, v_nucleus_prot, 'Protocolos Processuais', 'Protocolo em tribunais e cartórios', 'Protocolar peças com agilidade', '["petição","documentos"]'::jsonb, '["protocolo","comprovante"]'::jsonb, '["analista_processos"]'::jsonb, '[]'::jsonb, '[]'::jsonb)
  RETURNING id INTO v_process_prot;

  -- Processos adicionais
  INSERT INTO public.org_processes (tenant_id, area_id, nucleus_id, name, description, objective, inputs, outputs, responsible_roles, risks, impacts)
  VALUES
    (v_tenant_id, v_area_legalops, v_nucleus_atual, 'Atualização de Sistema do Cliente', 'Atualização de dados em sistemas de clientes', 'Manter sistemas sincronizados', '[]'::jsonb, '[]'::jsonb, '["analista_processos"]'::jsonb, '[]'::jsonb, '[]'::jsonb),
    (v_tenant_id, v_area_legalops, v_nucleus_dilig, 'Gestão de Diligências', 'Gestão de diligências externas', 'Executar diligências com eficiência', '[]'::jsonb, '[]'::jsonb, '["diligente"]'::jsonb, '[]'::jsonb, '[]'::jsonb),
    (v_tenant_id, v_area_legalops, NULL, 'Solicitação de Serviços Externos', 'Solicitação a correspondentes e terceiros', 'Contratar serviços externos quando necessário', '[]'::jsonb, '[]'::jsonb, '["analista_processos"]'::jsonb, '[]'::jsonb, '[]'::jsonb),
    (v_tenant_id, v_area_agro, v_nucleus_contratos, 'Gestão de Contratos Rurais', 'Contratos de arrendamento, parceria e compra e venda rural', 'Estruturar contratos do agronegócio', '[]'::jsonb, '[]'::jsonb, '["advogado_agro"]'::jsonb, '[]'::jsonb, '[]'::jsonb),
    (v_tenant_id, v_area_agro, v_nucleus_reg, 'Regularização Fundiária', 'Regularização de imóveis rurais e CAR', 'Regularizar documentação fundiária', '[]'::jsonb, '[]'::jsonb, '["advogado_agro"]'::jsonb, '[]'::jsonb, '[]'::jsonb);

  -- =========================================================================
  -- ROTINAS (exemplo: Gestão de Processos Contenciosos)
  -- =========================================================================
  INSERT INTO public.org_routines (tenant_id, process_id, name, description, objective)
  VALUES (v_tenant_id, v_process_contenc, 'Análise inicial do processo', 'Análise dos autos e documentação', 'Compreender o caso e definir próximos passos')
  RETURNING id INTO v_routine_analise;

  INSERT INTO public.org_routines (tenant_id, process_id, name, description, objective)
  VALUES (v_tenant_id, v_process_contenc, 'Definição de estratégia jurídica', 'Definir teses e estratégia de defesa/ataque', 'Estabelecer linha de atuação')
  RETURNING id INTO v_routine_estrategia;

  INSERT INTO public.org_routines (tenant_id, process_id, name, description, objective)
  VALUES (v_tenant_id, v_process_contenc, 'Elaboração de peças processuais', 'Redação de petições e peças', 'Produzir peças com qualidade')
  RETURNING id INTO v_routine_elab;

  INSERT INTO public.org_routines (tenant_id, process_id, name, description, objective)
  VALUES (v_tenant_id, v_process_contenc, 'Revisão jurídica', 'Revisão das peças antes de protocolar', 'Garantir qualidade e conformidade')
  RETURNING id INTO v_routine_revisao;

  INSERT INTO public.org_routines (tenant_id, process_id, name, description, objective)
  VALUES (v_tenant_id, v_process_contenc, 'Peticionamento', 'Protocolo das peças nos tribunais', 'Protocolar dentro dos prazos')
  RETURNING id INTO v_routine_petic;

  INSERT INTO public.org_routines (tenant_id, process_id, name, description, objective)
  VALUES (v_tenant_id, v_process_contenc, 'Acompanhamento processual', 'Acompanhamento de andamentos e publicações', 'Monitorar andamento e cumprir prazos')
  RETURNING id INTO v_routine_acomp;

  -- =========================================================================
  -- ATIVIDADES (exemplo: Elaboração de peças processuais)
  -- =========================================================================
  INSERT INTO public.org_activities (tenant_id, routine_id, name, description, complexity, priority, required_role, average_execution_time, inputs, outputs, risks, impacts, documentation)
  VALUES
    (v_tenant_id, v_routine_elab, 'Pesquisa jurisprudencial', 'Pesquisar jurisprudência e doutrina para fundamentar a peça', 'medium', 'high', 'advogado', 60, '["tema jurídico","legislação"]'::jsonb, '["pesquisa documentada"]'::jsonb, '[]'::jsonb, '[]'::jsonb, '{"procedures": "Pesquisar em bases de dados", "best_practices": "Priorizar jurisprudência vinculante"}'::jsonb),
    (v_tenant_id, v_routine_elab, 'Redação da petição', 'Redigir a petição com fundamentação técnica', 'high', 'high', 'advogado', 120, '["pesquisa","documentos do cliente"]'::jsonb, '["petição em rascunho"]'::jsonb, '["erro jurídico"]'::jsonb, '["impacto no processo"]'::jsonb, '{"step_by_step": "1. Introdução 2. Fatos 3. Direito 4. Pedidos", "common_errors": "Esquecer de citar artigos"}'::jsonb),
    (v_tenant_id, v_routine_elab, 'Formatação e revisão', 'Formatar conforme modelo e revisar ortografia', 'low', 'normal', 'estagiário', 30, '["petição em rascunho"]'::jsonb, '["petição formatada"]'::jsonb, '[]'::jsonb, '[]'::jsonb, '{}'::jsonb),
    (v_tenant_id, v_routine_analise, 'Leitura dos autos', 'Ler integralmente os autos do processo', 'medium', 'high', 'advogado', 90, '["autos do processo"]'::jsonb, '["resumo do caso"]'::jsonb, '[]'::jsonb, '[]'::jsonb, '{}'::jsonb),
    (v_tenant_id, v_routine_analise, 'Identificação de prazos', 'Identificar prazos pendentes e próximos', 'low', 'high', 'analista_processos', 15, '["publicações","prazos"]'::jsonb, '["lista de prazos"]'::jsonb, '["perda de prazo"]'::jsonb, '["preclusão"]'::jsonb, '{}'::jsonb);

  -- =========================================================================
  -- SISTEMAS
  -- =========================================================================
  INSERT INTO public.org_systems (tenant_id, name, description, purpose)
  VALUES (v_tenant_id, 'Sistema Jurídico', 'ERP jurídico para gestão de processos', 'Gestão processual e controle de prazos')
  RETURNING id INTO v_system_juridico;

  INSERT INTO public.org_systems (tenant_id, name, description, purpose)
  VALUES (v_tenant_id, 'CRM', 'Sistema de relacionamento com clientes', 'Gestão comercial e atendimento')
  RETURNING id INTO v_system_crm;

  INSERT INTO public.org_systems (tenant_id, name, description, purpose)
  VALUES (v_tenant_id, 'Sistema Financeiro', 'Controle financeiro e faturamento', 'Faturamento e controle de honorários')
  RETURNING id INTO v_system_fin;

  INSERT INTO public.org_system_resources (tenant_id, system_id, name, description)
  VALUES
    (v_tenant_id, v_system_juridico, 'Cadastro de processo', 'Cadastro e acompanhamento de processos'),
    (v_tenant_id, v_system_juridico, 'Controle de prazos', 'Alertas e controle de prazos processuais'),
    (v_tenant_id, v_system_juridico, 'Protocolo eletrônico', 'Integração com tribunais para peticionamento'),
    (v_tenant_id, v_system_crm, 'Cadastro de clientes', 'Cadastro e histórico de clientes'),
    (v_tenant_id, v_system_fin, 'Faturamento de honorários', 'Emissão de fatura e controle de cobrança');

  -- =========================================================================
  -- FORNECEDORES
  -- =========================================================================
  INSERT INTO public.org_suppliers (tenant_id, name, description)
  VALUES
    (v_tenant_id, 'Correspondentes jurídicos', 'Correspondentes para protocolos e diligências'),
    (v_tenant_id, 'Contabilidade', 'Serviços contábeis'),
    (v_tenant_id, 'Perícia', 'Peritos para laudos técnicos'),
    (v_tenant_id, 'Cartórios', 'Serviços cartorários');

  -- =========================================================================
  -- SERVIÇOS
  -- =========================================================================
  INSERT INTO public.org_services (tenant_id, name, description)
  VALUES
    (v_tenant_id, 'Diligência externa', 'Diligências em endereços e órgãos'),
    (v_tenant_id, 'Protocolo físico', 'Protocolo presencial em cartórios e tribunais'),
    (v_tenant_id, 'Envio via correios', 'Envio de documentos pelos Correios'),
    (v_tenant_id, 'Motoboy', 'Entrega urgente de documentos');

  -- =========================================================================
  -- DOCUMENTOS (modelos)
  -- =========================================================================
  INSERT INTO public.org_documents (tenant_id, name, type, description, associated_process_id)
  VALUES
    (v_tenant_id, 'Modelo de petição inicial', 'modelo_peticao', 'Modelo padrão de petição inicial', v_process_contenc),
    (v_tenant_id, 'Modelo de contestação', 'modelo_peticao', 'Modelo padrão de contestação', v_process_contenc),
    (v_tenant_id, 'Modelo de contrato de honorários', 'modelo_contrato', 'Modelo de contrato de prestação de serviços', v_process_contratos),
    (v_tenant_id, 'Checklist de abertura de pasta', 'checklist', 'Checklist para abertura de pasta de cliente', v_process_abertura),
    (v_tenant_id, 'Modelo de contrato rural', 'modelo_contrato', 'Modelo de contrato de arrendamento/parceria rural', NULL);

END $$;
