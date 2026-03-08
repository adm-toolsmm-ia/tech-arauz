-- =============================================================================
-- Migration 063: Espaider BPM Seed — Processos, Rotinas e Atividades
-- Fonte: docs/espaider/extracao-rotinas-espaider.md
-- =============================================================================
-- Adiciona processos/rotinas/atividades documentados da operação Espaider
-- para exibição no módulo Organização (frontend).
-- Executa apenas se as áreas já existirem (062 ou cadastro manual).
-- =============================================================================

DO $$
DECLARE
  v_tenant_id UUID;
  v_area_legalops UUID;
  v_area_exp UUID;
  v_area_civil UUID;
  v_area_consult UUID;
  v_area_admin UUID;
  v_area_tech UUID;
  v_nucleus_prot UUID;
  v_nucleus_prazos UUID;
  v_nucleus_publ UUID;
  v_process_protocolo UUID;
  v_process_cancelamento UUID;
  v_process_readequacao UUID;
  v_process_posicionamento UUID;
  v_process_cumprimento UUID;
  v_process_prot_sem_prazo UUID;
  v_process_prazo_protocolado UUID;
  v_process_avaliacao UUID;
  v_process_publicacoes UUID;
  v_process_agenda UUID;
  v_process_docsite UUID;
  v_process_timesheet UUID;
  v_process_relatorios UUID;
  v_routine_prot UUID;
  v_routine_canc UUID;
  v_routine_readeq UUID;
  v_routine_pos UUID;
  v_routine_cumpr UUID;
  v_routine_psp UUID;
  v_routine_pp UUID;
  v_routine_av UUID;
  v_routine_pub UUID;
  v_routine_ag UUID;
  v_routine_doc UUID;
  v_routine_ts UUID;
  v_routine_rel UUID;
BEGIN
  SELECT id INTO v_tenant_id FROM public.tenants WHERE slug = 'arauz' LIMIT 1;
  IF v_tenant_id IS NULL THEN RETURN; END IF;

  -- Lookup áreas (podem vir do 062 ou cadastro manual)
  SELECT id INTO v_area_legalops FROM public.org_areas WHERE tenant_id = v_tenant_id AND name = 'Legal Operations' LIMIT 1;
  SELECT id INTO v_area_exp FROM public.org_areas WHERE tenant_id = v_tenant_id AND name = 'Experiência do Cliente' LIMIT 1;
  SELECT id INTO v_area_civil FROM public.org_areas WHERE tenant_id = v_tenant_id AND name = 'Contencioso Cível' LIMIT 1;
  SELECT id INTO v_area_consult FROM public.org_areas WHERE tenant_id = v_tenant_id AND name = 'Consultivo' LIMIT 1;
  SELECT id INTO v_area_admin FROM public.org_areas WHERE tenant_id = v_tenant_id AND name = 'Administrativo' LIMIT 1;
  SELECT id INTO v_area_tech FROM public.org_areas WHERE tenant_id = v_tenant_id AND name = 'Inovação e Tecnologia' LIMIT 1;

  IF v_area_legalops IS NULL THEN
    RETURN; -- Áreas não existem, pular seed
  END IF;

  -- Lookup núcleos
  SELECT id INTO v_nucleus_prot FROM public.org_nuclei n
    JOIN public.org_areas a ON n.area_id = a.id
    WHERE a.tenant_id = v_tenant_id AND a.name = 'Legal Operations' AND n.name = 'Núcleo de Protocolos' LIMIT 1;
  SELECT id INTO v_nucleus_prazos FROM public.org_nuclei n
    JOIN public.org_areas a ON n.area_id = a.id
    WHERE a.tenant_id = v_tenant_id AND a.name = 'Legal Operations' AND n.name = 'Núcleo de Controle de Prazos' LIMIT 1;
  SELECT id INTO v_nucleus_publ FROM public.org_nuclei n
    JOIN public.org_areas a ON n.area_id = a.id
    WHERE a.tenant_id = v_tenant_id AND a.name = 'Legal Operations' AND n.name = 'Núcleo de Publicações' LIMIT 1;

  -- Criar Núcleo de Controle de Prazos se não existir (062 tem "Núcleo de Controle de Prazos")
  IF v_nucleus_prazos IS NULL THEN
    INSERT INTO public.org_nuclei (tenant_id, area_id, name, description, objective)
    SELECT v_tenant_id, v_area_legalops, 'Núcleo de Controle de Prazos', 'Controle e alertas de prazos processuais', 'Evitar perda de prazos processuais'
    WHERE EXISTS (SELECT 1 FROM public.org_areas WHERE id = v_area_legalops)
    RETURNING id INTO v_nucleus_prazos;
  END IF;

  -- =========================================================================
  -- PROCESSOS (Espaider)
  -- =========================================================================

  INSERT INTO public.org_processes (tenant_id, area_id, nucleus_id, name, description, objective, inputs, outputs, responsible_roles, risks, impacts, documentation)
  SELECT v_tenant_id, v_area_legalops, v_nucleus_prot, 'Solicitação de Protocolo (Espaider)', 'Fluxo de solicitação de protocolo com prazo agendado. Requisição à controladoria.', 'Protocolar peças dentro do prazo', '["petição","documentos anexos","prazo agendado"]'::jsonb, '["requisição enviada","comprovante de protocolo"]'::jsonb, '["advogado","analista_processos"]'::jsonb, '["perda de prazo","reprovação na data fatal"]'::jsonb, '["preclusão"]'::jsonb, '{"source":"espaider","horario_limite":"17h00 da data fatal","doc":"Agenda-e-Protocolo.pdf"}'::jsonb
  WHERE NOT EXISTS (SELECT 1 FROM public.org_processes WHERE tenant_id = v_tenant_id AND name = 'Solicitação de Protocolo (Espaider)')
  RETURNING id INTO v_process_protocolo;
  INSERT INTO public.org_processes (tenant_id, area_id, nucleus_id, name, description, objective, inputs, outputs, responsible_roles, risks, impacts, documentation)
  SELECT v_tenant_id, v_area_legalops, v_nucleus_prazos, 'Cancelamento de Agendamento (Espaider)', 'Cancelamento de prazos/providências via requisição à controladoria.', 'Cancelar agendamentos quando necessário', '["prazo ou providência","motivo"]'::jsonb, '["requisição cancelamento","prazo cancelado"]'::jsonb, '["advogado"]'::jsonb, '["motivo inadequado","reprovação na data fatal"]'::jsonb, '["inconsistência"]'::jsonb, '{"source":"espaider","doc":"Agenda-e-Protocolo.pdf"}'::jsonb
  WHERE NOT EXISTS (SELECT 1 FROM public.org_processes WHERE tenant_id = v_tenant_id AND name = 'Cancelamento de Agendamento (Espaider)')
  RETURNING id INTO v_process_cancelamento;

  INSERT INTO public.org_processes (tenant_id, area_id, nucleus_id, name, description, objective, inputs, outputs, responsible_roles, documentation)
  SELECT v_tenant_id, v_area_legalops, v_nucleus_prazos, 'Readequação de Agendamento (Espaider)', 'Alteração de responsável, data final ou tipo do prazo.', 'Readequar agendamentos quando necessário', '["responsável","data final","tipo do prazo"]'::jsonb, '["requisição readequação","prazo retorna a cumprir"]'::jsonb, '["advogado"]'::jsonb, '{"source":"espaider","doc":"Agenda-e-Protocolo.pdf"}'::jsonb
  WHERE NOT EXISTS (SELECT 1 FROM public.org_processes WHERE tenant_id = v_tenant_id AND name = 'Readequação de Agendamento (Espaider)')
  RETURNING id INTO v_process_readequacao;

  INSERT INTO public.org_processes (tenant_id, area_id, nucleus_id, name, description, objective, inputs, outputs, responsible_roles, documentation)
  SELECT v_tenant_id, v_area_legalops, v_nucleus_prazos, 'Posicionamento de Prazo Fatal (Espaider)', 'Justificativa de ausência de início até horário limite. Botão disponível a partir das 18h do dia anterior.', 'Posicionar prazo quando não for possível iniciar', '["motivo"]'::jsonb, '["justificativa registrada","prazo posicionado"]'::jsonb, '["advogado"]'::jsonb, '{"source":"espaider","disponivel_a_partir":"18h do dia anterior","doc":"Agenda-e-Protocolo.pdf"}'::jsonb
  WHERE NOT EXISTS (SELECT 1 FROM public.org_processes WHERE tenant_id = v_tenant_id AND name = 'Posicionamento de Prazo Fatal (Espaider)')
  RETURNING id INTO v_process_posicionamento;

  INSERT INTO public.org_processes (tenant_id, area_id, nucleus_id, name, description, objective, inputs, outputs, responsible_roles, documentation)
  SELECT v_tenant_id, v_area_legalops, v_nucleus_prazos, 'Cumprimento Providência Sem Fluxo (Espaider)', 'Cumprimento direto de providências especiais sem fluxo próprio.', 'Cumprir providências sem fluxo', '["campo cumprido em","observações encerramento","documentos"]'::jsonb, '["providência cumprida"]'::jsonb, '["advogado"]'::jsonb, '{"source":"espaider","doc":"Agenda-e-Protocolo.pdf"}'::jsonb
  WHERE NOT EXISTS (SELECT 1 FROM public.org_processes WHERE tenant_id = v_tenant_id AND name = 'Cumprimento Providência Sem Fluxo (Espaider)')
  RETURNING id INTO v_process_cumprimento;

  INSERT INTO public.org_processes (tenant_id, area_id, nucleus_id, name, description, objective, inputs, outputs, responsible_roles, documentation)
  SELECT v_tenant_id, v_area_legalops, v_nucleus_prot, 'Protocolo Sem Prazo (Espaider)', 'Envio de petição para protocolo quando não há prazo agendado. Não dá baixa em prazo existente.', 'Protocolar sem prazo agendado', '["petição","documentos"]'::jsonb, '["requisição enviada"]'::jsonb, '["advogado"]'::jsonb, '{"source":"espaider","horario_mesmo_dia":"14h30","correios_cruz_alta":"11h30","doc":"Agenda-e-Protocolo.pdf"}'::jsonb
  WHERE NOT EXISTS (SELECT 1 FROM public.org_processes WHERE tenant_id = v_tenant_id AND name = 'Protocolo Sem Prazo (Espaider)')
  RETURNING id INTO v_process_prot_sem_prazo;

  INSERT INTO public.org_processes (tenant_id, area_id, nucleus_id, name, description, objective, inputs, outputs, responsible_roles, documentation)
  SELECT v_tenant_id, v_area_legalops, v_nucleus_prot, 'Prazo Protocolado - Exceção (Espaider)', 'Vinculação direta do comprovante quando não foi possível solicitar protocolo à controladoria.', 'Registrar protocolo excepcional', '["comprovante de protocolo","justificativa"]'::jsonb, '["prazo cumprido"]'::jsonb, '["advogado"]'::jsonb, '{"source":"espaider","doc":"Agenda-e-Protocolo.pdf"}'::jsonb
  WHERE NOT EXISTS (SELECT 1 FROM public.org_processes WHERE tenant_id = v_tenant_id AND name = 'Prazo Protocolado - Exceção (Espaider)')
  RETURNING id INTO v_process_prazo_protocolado;

  INSERT INTO public.org_processes (tenant_id, area_id, nucleus_id, name, description, objective, inputs, outputs, responsible_roles, risks, documentation)
  SELECT v_tenant_id, v_area_legalops, NULL, 'Avaliação de Risco (Espaider)', 'Avaliação e provisão de pedidos nas pastas. Avaliação obrigatória em todos os pedidos.', 'Avaliar risco dos pedidos', '["pedidos da pasta","prioridade","motivo"]'::jsonb, '["avaliação registrada","provisão de pedidos"]'::jsonb, '["advogado"]'::jsonb, '["pedidos em duplicidade"]'::jsonb, '{"source":"espaider","regra":"risco_remoto_sempre_zero","doc":"Ajuste-Avaliação-e-Lançamentos.pdf"}'::jsonb
  WHERE NOT EXISTS (SELECT 1 FROM public.org_processes WHERE tenant_id = v_tenant_id AND name = 'Avaliação de Risco (Espaider)')
  RETURNING id INTO v_process_avaliacao;

  INSERT INTO public.org_processes (tenant_id, area_id, nucleus_id, name, description, objective, inputs, outputs, responsible_roles, documentation)
  SELECT v_tenant_id, v_area_legalops, v_nucleus_publ, 'Confirmação de Publicações (Espaider)', 'Confirmação de leitura de publicações processuais. Prazo de 24h.', 'Garantir ciência das publicações', '["publicação aguardando confirmação"]'::jsonb, '["confirmação de leitura","providências criadas/canceladas"]'::jsonb, '["advogado"]'::jsonb, '{"source":"espaider","prazo":"24h","filtro":"Aguardando confirmação de leitura","doc":"Ajuste-Avaliação-e-Lançamentos.pdf"}'::jsonb
  WHERE NOT EXISTS (SELECT 1 FROM public.org_processes WHERE tenant_id = v_tenant_id AND name = 'Confirmação de Publicações (Espaider)')
  RETURNING id INTO v_process_publicacoes;

  INSERT INTO public.org_processes (tenant_id, area_id, nucleus_id, name, description, objective, inputs, outputs, responsible_roles, documentation)
  SELECT v_tenant_id, v_area_legalops, v_nucleus_prazos, 'Gestão de Agenda (Espaider)', 'Visualização, organização e cumprimento de agendamentos. Módulos Contencioso e Consultivo.', 'Gerenciar agenda de prazos e providências', '[]'::jsonb, '["agenda organizada","prazos cumpridos"]'::jsonb, '["advogado"]'::jsonb, '{"source":"espaider","modulos":["contencioso","consultivo","area_trabalho"],"filtro_sugerido":"Providências ativas/iniciadas/posicionadas","doc":"Agenda-e-Protocolo.pdf"}'::jsonb
  WHERE NOT EXISTS (SELECT 1 FROM public.org_processes WHERE tenant_id = v_tenant_id AND name = 'Gestão de Agenda (Espaider)')
  RETURNING id INTO v_process_agenda;

  INSERT INTO public.org_processes (tenant_id, area_id, nucleus_id, name, description, objective, inputs, outputs, responsible_roles, documentation)
  SELECT v_tenant_id, v_area_legalops, NULL, 'Lançamento DocSite (Espaider)', 'Inclusão de documentos no DocSite. Assuntos: Petição, Contrato, Procuração, E-MAIL, COMPROVANTE.', 'Arquivar documentos no sistema', '["arquivos","classificação"]'::jsonb, '["documento indexado"]'::jsonb, '["advogado"]'::jsonb, '{"source":"espaider","assuntos":["Petição","Contrato","Procuração","Substabelecimento","Cálculo","COMPROVANTE DE PROTOCOLO","COMPROVANTE DE CUMPRIMENTO","E-MAIL"],"doc":"Ajuste-Avaliação-e-Lançamentos.pdf"}'::jsonb
  WHERE NOT EXISTS (SELECT 1 FROM public.org_processes WHERE tenant_id = v_tenant_id AND name = 'Lançamento DocSite (Espaider)')
  RETURNING id INTO v_process_docsite;

  INSERT INTO public.org_processes (tenant_id, area_id, nucleus_id, name, description, objective, inputs, outputs, responsible_roles, documentation)
  SELECT v_tenant_id, v_area_admin, NULL, 'Lançamento Time Sheet (Espaider)', 'Registro de horas trabalhadas. Cronômetro ou ajuste manual.', 'Registrar horas de trabalho', '["atividade","descrição","item de trabalho"]'::jsonb, '["horas lançadas"]'::jsonb, '["advogado"]'::jsonb, '{"source":"espaider","doc":"Ajuste-Avaliação-e-Lançamentos.pdf"}'::jsonb
  WHERE NOT EXISTS (SELECT 1 FROM public.org_processes WHERE tenant_id = v_tenant_id AND name = 'Lançamento Time Sheet (Espaider)')
  RETURNING id INTO v_process_timesheet;

  INSERT INTO public.org_processes (tenant_id, area_id, nucleus_id, name, description, objective, inputs, outputs, responsible_roles, documentation)
  SELECT v_tenant_id, v_area_tech, NULL, 'Emissão de Relatórios (Espaider)', 'Geração de relatórios personalizados. Botão Relatórios em quase todas as abas.', 'Emitir relatórios gerenciais', '["filtros","campos","modelo"]'::jsonb, '["relatório gerado"]'::jsonb, '["advogado"]'::jsonb, '{"source":"espaider","doc":"Ajuste-Avaliação-e-Lançamentos.pdf"}'::jsonb
  WHERE NOT EXISTS (SELECT 1 FROM public.org_processes WHERE tenant_id = v_tenant_id AND name = 'Emissão de Relatórios (Espaider)')
  RETURNING id INTO v_process_relatorios;

  -- Lookup IDs (para rotinas, caso já existissem)
  SELECT id INTO v_process_protocolo FROM public.org_processes WHERE tenant_id = v_tenant_id AND name = 'Solicitação de Protocolo (Espaider)' LIMIT 1;
  SELECT id INTO v_process_cancelamento FROM public.org_processes WHERE tenant_id = v_tenant_id AND name = 'Cancelamento de Agendamento (Espaider)' LIMIT 1;
  SELECT id INTO v_process_readequacao FROM public.org_processes WHERE tenant_id = v_tenant_id AND name = 'Readequação de Agendamento (Espaider)' LIMIT 1;
  SELECT id INTO v_process_posicionamento FROM public.org_processes WHERE tenant_id = v_tenant_id AND name = 'Posicionamento de Prazo Fatal (Espaider)' LIMIT 1;
  SELECT id INTO v_process_cumprimento FROM public.org_processes WHERE tenant_id = v_tenant_id AND name = 'Cumprimento Providência Sem Fluxo (Espaider)' LIMIT 1;
  SELECT id INTO v_process_prot_sem_prazo FROM public.org_processes WHERE tenant_id = v_tenant_id AND name = 'Protocolo Sem Prazo (Espaider)' LIMIT 1;
  SELECT id INTO v_process_prazo_protocolado FROM public.org_processes WHERE tenant_id = v_tenant_id AND name = 'Prazo Protocolado - Exceção (Espaider)' LIMIT 1;
  SELECT id INTO v_process_avaliacao FROM public.org_processes WHERE tenant_id = v_tenant_id AND name = 'Avaliação de Risco (Espaider)' LIMIT 1;
  SELECT id INTO v_process_publicacoes FROM public.org_processes WHERE tenant_id = v_tenant_id AND name = 'Confirmação de Publicações (Espaider)' LIMIT 1;
  SELECT id INTO v_process_agenda FROM public.org_processes WHERE tenant_id = v_tenant_id AND name = 'Gestão de Agenda (Espaider)' LIMIT 1;
  SELECT id INTO v_process_docsite FROM public.org_processes WHERE tenant_id = v_tenant_id AND name = 'Lançamento DocSite (Espaider)' LIMIT 1;
  SELECT id INTO v_process_timesheet FROM public.org_processes WHERE tenant_id = v_tenant_id AND name = 'Lançamento Time Sheet (Espaider)' LIMIT 1;
  SELECT id INTO v_process_relatorios FROM public.org_processes WHERE tenant_id = v_tenant_id AND name = 'Emissão de Relatórios (Espaider)' LIMIT 1;

  -- =========================================================================
  -- ROTINAS (por processo)
  -- =========================================================================

  IF v_process_protocolo IS NOT NULL THEN
    INSERT INTO public.org_routines (tenant_id, process_id, name, description, objective, documentation)
    SELECT v_tenant_id, v_process_protocolo, 'Preencher requisição de protocolo', 'Preencher capa, vincular petição, anexos e enviar', 'Protocolar dentro do prazo', '{"steps":["Abrir prazo e clicar Solicitar protocolo","Preencher capa (tipo conforme tipo do prazo)","Vincular petição DocSite assunto Petição","Anexos em DocSite com classificação","Enviar para aprovação","Acompanhar conclusão e conferir recibo"],"horario_limite":"17h00"}'::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM public.org_routines WHERE process_id = v_process_protocolo AND name = 'Preencher requisição de protocolo')
    RETURNING id INTO v_routine_prot;
  END IF;

  IF v_process_cancelamento IS NOT NULL THEN
    INSERT INTO public.org_routines (tenant_id, process_id, name, description, objective, documentation)
    SELECT v_tenant_id, v_process_cancelamento, 'Solicitar cancelamento', 'Preencher motivo e enviar requisição', 'Cancelar agendamento', '{"steps":["Clicar cancelar tarefa no cabeçalho","Preencher capa (motivo conforme caso)","Salvar e enviar","Acompanhar conclusão"]}'::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM public.org_routines WHERE process_id = v_process_cancelamento AND name = 'Solicitar cancelamento')
    RETURNING id INTO v_routine_canc;
  END IF;

  IF v_process_readequacao IS NOT NULL THEN
    INSERT INTO public.org_routines (tenant_id, process_id, name, description, objective, documentation)
    SELECT v_tenant_id, v_process_readequacao, 'Solicitar readequação', 'Ajustar responsável, data ou tipo e enviar', 'Readequar agendamento', '{"steps":["Clicar readequar tarefa","Ajustar campos (responsável/tipo/data)","Detalhar justificativa","Salvar e enviar"]}'::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM public.org_routines WHERE process_id = v_process_readequacao AND name = 'Solicitar readequação')
    RETURNING id INTO v_routine_readeq;
  END IF;

  IF v_process_posicionamento IS NOT NULL THEN
    INSERT INTO public.org_routines (tenant_id, process_id, name, description, objective, documentation)
    SELECT v_tenant_id, v_process_posicionamento, 'Posicionar prazo', 'Justificar ausência de início até horário limite', 'Posicionar prazo', '{"steps":["Clicar posicionar prazo fatal (disponível 18h dia anterior)","Preencher motivo conforme caso","Salvar e enviar"]}'::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM public.org_routines WHERE process_id = v_process_posicionamento AND name = 'Posicionar prazo')
    RETURNING id INTO v_routine_pos;
  END IF;

  IF v_process_cumprimento IS NOT NULL THEN
    INSERT INTO public.org_routines (tenant_id, process_id, name, description, objective, documentation)
    SELECT v_tenant_id, v_process_cumprimento, 'Cumprir diretamente', 'Preencher cumprido em, observações e vincular documentos', 'Cumprir providência sem fluxo', '{"steps":["Preencher Cumprido em","Preencher Observações encerramento ou DocSite COMPROVANTE DE CUMPRIMENTO","Vincular documentos se necessário","Salvar e fechar"]}'::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM public.org_routines WHERE process_id = v_process_cumprimento AND name = 'Cumprir diretamente')
    RETURNING id INTO v_routine_cumpr;
  END IF;

  IF v_process_prot_sem_prazo IS NOT NULL THEN
    INSERT INTO public.org_routines (tenant_id, process_id, name, description, objective, documentation)
    SELECT v_tenant_id, v_process_prot_sem_prazo, 'Solicitar protocolo sem prazo', 'Preencher capa, vincular petição e enviar', 'Protocolar sem prazo', '{"steps":["Clicar Protocolo sem prazo no cabeçalho da ficha","Preencher capa","Vincular petição assunto Petição","Anexos se houver","Enviar para aprovação"],"regra":"Se houver prazo pendente sem agendamento, solicitar lançamento"}'::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM public.org_routines WHERE process_id = v_process_prot_sem_prazo AND name = 'Solicitar protocolo sem prazo')
    RETURNING id INTO v_routine_psp;
  END IF;

  IF v_process_prazo_protocolado IS NOT NULL THEN
    INSERT INTO public.org_routines (tenant_id, process_id, name, description, objective, documentation)
    SELECT v_tenant_id, v_process_prazo_protocolado, 'Vincular comprovante', 'Exceção: vincular comprovante diretamente', 'Registrar protocolo excepcional', '{"steps":["Clicar Prazo protocolado (PRP)","Preencher capa e justificativa","Aba Documentos Novo assunto COMPROVANTE DE PROTOCOLO","Cumprir e enviar para controladoria"]}'::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM public.org_routines WHERE process_id = v_process_prazo_protocolado AND name = 'Vincular comprovante')
    RETURNING id INTO v_routine_pp;
  END IF;

  IF v_process_avaliacao IS NOT NULL THEN
    INSERT INTO public.org_routines (tenant_id, process_id, name, description, objective, documentation)
    SELECT v_tenant_id, v_process_avaliacao, 'Realizar avaliação', 'Prioridade, motivo, provisão ou novos pedidos', 'Avaliar risco dos pedidos', '{"steps":["Abrir ficha e clicar Avaliar risco","Selecionar prioridade, data início vigência, motivo","Provisão de pedidos ou Novos pedidos","Ajustar valores (risco remoto zero)","Salvar e enviar aprovação"],"regra":"Avaliação em todos os pedidos"}'::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM public.org_routines WHERE process_id = v_process_avaliacao AND name = 'Realizar avaliação')
    RETURNING id INTO v_routine_av;
  END IF;

  IF v_process_publicacoes IS NOT NULL THEN
    INSERT INTO public.org_routines (tenant_id, process_id, name, description, objective, documentation)
    SELECT v_tenant_id, v_process_publicacoes, 'Confirmar publicação', 'Avaliar, verificar providências e confirmar leitura', 'Confirmar em 24h', '{"steps":["Acessar Aprovação de Publicações","Filtro Aguardando confirmação de leitura","Avaliar publicação","Verificar providências criar/cancelar","Assinalar Confirmação de leitura","Salvar e fechar"],"prazo":"24h"}'::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM public.org_routines WHERE process_id = v_process_publicacoes AND name = 'Confirmar publicação')
    RETURNING id INTO v_routine_pub;
  END IF;

  IF v_process_agenda IS NOT NULL THEN
    INSERT INTO public.org_routines (tenant_id, process_id, name, description, objective, documentation)
    SELECT v_tenant_id, v_process_agenda, 'Visualizar e organizar agenda', 'Ordenar, filtrar e acompanhar agendamentos', 'Organizar agenda', '{"steps":["Acessar agenda Contencioso/Consultivo/Área de trabalho","Ordenar por data final","Filtro Providências ativas/iniciadas/posicionadas","Verificar na ficha aba Providências"]}'::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM public.org_routines WHERE process_id = v_process_agenda AND name = 'Visualizar e organizar agenda')
    RETURNING id INTO v_routine_ag;
  END IF;

  IF v_process_docsite IS NOT NULL THEN
    INSERT INTO public.org_routines (tenant_id, process_id, name, description, objective, documentation)
    SELECT v_tenant_id, v_process_docsite, 'Incluir documento no Espaider', 'DocSite Novo, classificar e vincular', 'Arquivar documentos', '{"steps":["Abrir DocSite","Clicar Novo","Escolher arquivos","Selecionar Biblioteca e Assunto","Vincular andamento/providência se necessário","Concluir"]}'::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM public.org_routines WHERE process_id = v_process_docsite AND name = 'Incluir documento no Espaider')
    RETURNING id INTO v_routine_doc;
  END IF;

  IF v_process_timesheet IS NOT NULL THEN
    INSERT INTO public.org_routines (tenant_id, process_id, name, description, objective, documentation)
    SELECT v_tenant_id, v_process_timesheet, 'Lançar horas', 'Cronômetro ou ajuste manual', 'Registrar horas', '{"steps":["Clicar Cronômetro","Selecionar atividade e descrição","Salvar","Ajustar se esquecido (Nova tarefa, Horas, Data)","Finalizar"]}'::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM public.org_routines WHERE process_id = v_process_timesheet AND name = 'Lançar horas')
    RETURNING id INTO v_routine_ts;
  END IF;

  IF v_process_relatorios IS NOT NULL THEN
    INSERT INTO public.org_routines (tenant_id, process_id, name, description, objective, documentation)
    SELECT v_tenant_id, v_process_relatorios, 'Emitir relatório', 'Personalizar campos, filtros e gerar', 'Emitir relatório', '{"steps":["Clicar Relatórios","Buscar ou listar","Emitir","Agendar periodicidade opcional","Personalizar campos e salvar modelo","Selecionar filtro e clientes","Avançar"]}'::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM public.org_routines WHERE process_id = v_process_relatorios AND name = 'Emitir relatório')
    RETURNING id INTO v_routine_rel;
  END IF;

  -- =========================================================================
  -- ATIVIDADES (exemplos para Solicitação de Protocolo)
  -- =========================================================================

  IF v_routine_prot IS NOT NULL THEN
    INSERT INTO public.org_activities (tenant_id, routine_id, name, description, complexity, priority, required_role, average_execution_time, inputs, outputs, documentation)
    VALUES
      (v_tenant_id, v_routine_prot, 'Abrir prazo e clicar Solicitar protocolo', 'Acessar o prazo na agenda e clicar em Solicitar protocolo (ENP) no cabeçalho', 'low', 'high', 'advogado', 2, '[]'::jsonb, '[]'::jsonb, '{"step":"1. Abrir prazo 2. Clicar Solicitar protocolo"}'::jsonb),
      (v_tenant_id, v_routine_prot, 'Preencher capa da requisição', 'Preencher campos sinalizados. Tipo de petição restrito ao tipo do prazo.', 'medium', 'high', 'advogado', 10, '[]'::jsonb, '[]'::jsonb, '{"campos_obrigatorios":true,"tipo_restrito":"conforme tipo do prazo"}'::jsonb),
      (v_tenant_id, v_routine_prot, 'Vincular petição no DocSite', 'Vincular petição (Assunto Petição) na aba DocSite', 'medium', 'high', 'advogado', 5, '[]'::jsonb, '[]'::jsonb, '{"apenas_peticao":true}'::jsonb),
      (v_tenant_id, v_routine_prot, 'Enviar para aprovação', 'Clicar Enviar para aprovação', 'low', 'high', 'advogado', 1, '[]'::jsonb, '[]'::jsonb, '{}'::jsonb),
      (v_tenant_id, v_routine_prot, 'Acompanhar conclusão', 'Verificar conclusão da requisição pela controladoria e conferir recibo', 'low', 'high', 'advogado', 0, '[]'::jsonb, '[]'::jsonb, '{"nao_duas_requisicoes_simultaneas":true}'::jsonb);
  END IF;

END $$;
