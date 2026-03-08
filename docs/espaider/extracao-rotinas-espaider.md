# Extração de Rotinas Espaider — Cadastros e BPM

**Fontes:** Agenda-e-Protocolo.pdf, Papel advogado.pdf, Ajuste-Avaliação-e-Lançamentos.pdf  
**Data:** 2026-03-08  
**Objetivo:** Subsídio para cadastros de operação e modelagem BPM (processos, rotinas, atividades)

---

## 1. Estrutura de Módulos (Área de Trabalho)

| Módulo | Descrição |
|--------|-----------|
| **Contencioso** | Processos judiciais/administrativos |
| **Consultivo** | Consultas recebidas |
| **Área de trabalho** | Visão unificada das agendas |
| **Solicitações** | Todas as solicitações do sistema |
| **Pastas** | Pastas e apensos do contencioso |
| **Fichas/Processos** | Fichas/processos do contencioso |
| **Consultas** | Consultas do módulo consultivo |
| **Painel abertura pastas/fichas** | Solicitações de criação contencioso |
| **Painel abertura consultas** | Solicitações de criação consultivo |
| **Adiantamentos** | Cadastro e visualização de adiantamentos |
| **Lotes de despesas** | Cadastro de despesas/coletores |
| **Relatórios** | Relatórios disponíveis |

---

## 2. Classificação de Agendamentos (Providências)

| Tipo | Descrição | Tratamento |
|------|-----------|------------|
| **Audiência** | Audiências nos processos | Informativo; baixada pela controladoria |
| **Perícia** | Perícias nos processos | Informativo; baixada pela controladoria |
| **Prazos** | Prazos processuais | Requer início/posicionamento até horário limite |
| **Providência interna (Especial)** | Relevantes para processos/consultas (ex.: Pagar custas recursais) | Equivalente a prazo; horário limite 14h30 (consultivo) ou 18h00 (contencioso) |
| **Providência interna (comum)** | Menor relevância (ex.: Verificar trânsito em julgado) | Não pode ficar pendente de um mês para outro |
| **Verificação** | Agendamentos livres, lançados pelo advogado (ex.: Acompanhamento semanal) | Não conferidas |

---

## 3. Situações de Agendamento

| Situação | Descrição |
|----------|-----------|
| **A cumprir** | Pendente, sem tratamento |
| **Iniciado** | Após envio de requisição (protocolo, cancelamento, readequação) |
| **Cumprido** | Finalizado com cumprimento do prazo |
| **Cancelado** | Finalizado sem cumprimento |
| **Posicionado** | Justificativa de ausência de início até horário limite |

---

## 4. Regras de Controle de Prazos

| Tipo | Horário limite | Penalidade |
|------|----------------|------------|
| **Prazos** | 14h30 da data fatal | Inconsistência |
| **Providências especiais consultivo** | 14h30 da data fatal | Inconsistência |
| **Providências especiais contencioso** | 18h00 da data fatal | Inconsistência + alerta e-mail |
| **Providências internas** | — | Não podem ficar pendentes de um mês para outro |
| **Verificações** | — | Não conferidas |

### Alertas automáticos (e-mail)

| Horário | Alerta |
|---------|--------|
| 09h30 | Prazos/providências especiais vencidos do dia anterior não finalizados |
| 14h30 | Prazos/providências consultivo não iniciados/posicionados com vencimento no dia |
| 17h00 | Lembrete consultivo iniciados/posicionados; inconsistência se não iniciados |
| 18h00 | Providências especiais contencioso não iniciados/posicionados |

---

## 5. Requisições (Fluxos de Trabalho)

### 5.1 Prazos

| Requisição | Destino | Resultado |
|------------|---------|-----------|
| **Solicitar protocolo** | Controladoria | Prazo baixado como cumprido |
| **Cancelar tarefa** | Controladoria | Prazo baixado como cancelado |
| **Readequar tarefa** | Controladoria | Alteração responsável/data/tipo; retorna "a cumprir" |
| **Posicionar prazo fatal** | — | Justificativa de não início até horário limite |
| **Prazo protocolado** | Exceção | Vinculação direta do comprovante (justificar) |

### 5.2 Providências especiais

| Requisição | Quando usar |
|------------|-------------|
| **Início com fluxo** | Ex.: "Pagar custas recursais" via requisição Guias |
| **Cancelar tarefa** | Idem prazos |
| **Readequar tarefa** | Idem prazos |
| **Posicionar prazo fatal** | Idem prazos |
| **Cumprimento direto (sem fluxo)** | Preencher "Cumprido em", "Observações encerramento", vincular documento |

### 5.3 Protocolo sem prazo

- Envio de petição quando não há prazo agendado
- Não dá baixa em prazo existente
- Envio até 14h30 para mesmo dia
- Correios/Cruz Alta: até 11h30

---

## 6. Cadastros por Permissão

### 6.1 Advogado — Direto (sem solicitação)

| Entidade | Ação |
|----------|------|
| **Andamentos** | Criar: Anotações Gerais, Medidas Pró-Ativas, Acionamentos Call Center, Telefonema |
| **Andamentos** | Alterar: os mesmos acima |
| **Providências** | Criar: Verificação |
| **Providências** | Readequar: Verificação, Providência interna |
| **Providências** | Cumprir: Verificação, Providência interna, Providência interna (Especial) — preenchendo "Cumprido em" e "Observações Encerramento" ou DocSite |
| **Contratos/títulos** | Criar e alterar na pasta |
| **Garantias/penhoras** | Criar e alterar na pasta |
| **Adiantamentos** | Criar para próprio usuário |
| **Lotes de despesas** | Criar para próprio usuário |
| **Consultivo** | Criar andamento, readequar andamento, criar providências |

### 6.2 Advogado — Via Solicitação

| Entidade | Documentação de referência |
|----------|----------------------------|
| Pastas | Criar pasta (clientes escritório), Criar pasta (novo cliente) |
| Fichas/Processos | Criar ficha-processo, Criar apenso |
| Readequação | Readequação pasta-ficha-processo (Alterações, Transferir, Excluir) |
| Andamentos | Criar andamento, intimação e publicação; Readequar andamento |
| Providências | Criar providência (exceto Verificação); Readequar (Audiência, Prazo, Providência Especial) |
| Cancelamento | Cancelar providência |
| Acordos | Criar acordo a receber, Criar acordo a pagar |
| Guias | Diversos tipos (controladoria/advogado, escritório/cliente) |
| Serviços | Cartório, Correio-Motoboy, Viagem |
| Diligências | Atualizar sistema cliente, Cópia processo, Enviar e-mail, Pesquisa de bens, Correspondente, Digitalização |
| Provisionamento | Provisionar pedidos |
| Encerramento | Encerrar pasta, Encerrar ficha-processo, Encerrar consulta |
| Reativação | Reativar pasta/consulta |

---

## 7. Tipos de Guias

| Tipo | Quem elabora | Quem paga |
|------|--------------|-----------|
| Controladoria | Escritório |
| Controladoria | Cliente |
| Advogado | Escritório |
| Advogado | Cliente |
| Colaborador | Adiantamento |

---

## 8. Tipos de Serviços

| Serviço |
|---------|
| Cartório |
| Correio-Motoboy |
| Viagem |

---

## 9. Tipos de Diligências

| Diligência |
|------------|
| Atualizar sistema do cliente |
| Cópia de processo (Eletrônico) |
| Cópia de processo (Físico - Curitiba) |
| Cópia de processo (Físico) |
| Enviar e-mail |
| Pesquisa de bens |
| Solicitar correspondente (Audiência) |
| Solicitar correspondente (Padrão) |
| Solicitar digitalização |

---

## 10. Avaliação de Risco

- **Prioridade**: campo obrigatório
- **Data início vigência**: quando ocorreu a avaliação
- **Motivo**: seleção
- **Provisão de pedidos**: vincular pedidos existentes
- **Novos pedidos**: criar quando não há pedido cadastrado
- **Valores**: Valor pedido (original), valores de risco (risco remoto = zero)
- **Regra**: Avaliação em todos os pedidos; sistema não permite pedidos em duplicidade na mesma pasta

---

## 11. Confirmação de Publicações

- Filtro: Responsável — Aguardando confirmação de leitura
- Verificar providências agendadas; criar ou cancelar se necessário
- Assinalar "Confirmação de leitura"
- **Prazo**: 24h para confirmar (evitar inconsistência)

---

## 12. DocSite (Documentos)

- **Assuntos**: Petição, Contrato, Procuração, Substabelecimento, COMPROVANTE DE PROTOCOLO, COMPROVANTE DE CUMPRIMENTO, E-MAIL
- Vinculação a pasta, ficha, andamento, providência
- Arquivamento automático de e-mails relacionados

---

## 13. Time Sheet

- **Atividade**: seleção
- **Descrição**: texto
- **Item de trabalho**: seleção
- **Horas trabalhadas**: ajuste manual quando necessário
- **Data da tarefa**: quando realizada
- Ajustes em lançamentos em aberto; alguns requerem autorização

---

## 14. Classificação de Documentos (DocSite)

| Assunto |
|---------|
| Petição |
| Contrato |
| Procuração |
| Substabelecimento |
| Cálculo |
| COMPROVANTE DE PROTOCOLO |
| COMPROVANTE DE CUMPRIMENTO |
| E-MAIL |

---

## 15. Mapeamento BPM Detalhado (org_processes, org_routines, org_activities)

### 15.1 Hierarquia proposta (Área → Núcleo → Processo → Rotina → Atividade)

```
Legal Operations
├── Núcleo de Protocolos
│   ├── Solicitação de Protocolo (processo)
│   ├── Protocolo Sem Prazo (processo)
│   └── Prazo Protocolado - Exceção (processo)
├── Núcleo de Controle de Prazos
│   ├── Gestão de Agenda (processo)
│   ├── Cancelamento de Agendamento (processo)
│   ├── Readequação de Agendamento (processo)
│   ├── Posicionamento de Prazo (processo)
│   └── Cumprimento Providência Sem Fluxo (processo)
├── Núcleo de Publicações
│   └── Confirmação de Publicações (processo)
└── (sem núcleo)
    ├── Avaliação de Risco (processo)
    └── Lançamento DocSite (processo)

Experiência do Cliente / Contencioso
├── Abertura de Pasta (processo)
├── Abertura de Ficha/Processo (processo)
└── Abertura de Consulta (processo - Consultivo)

Administrativo
└── Lançamento Time Sheet (processo)

Inovação e Tecnologia
└── Emissão de Relatórios (processo)
```

---

### 15.2 Processos com Rotinas e Atividades (detalhado)

#### Processo: Solicitação de Protocolo

| Campo | Valor |
|-------|-------|
| Área | Legal Operations |
| Núcleo | Protocolos |
| Inputs | Petição, documentos anexos, prazo agendado |
| Outputs | Requisição enviada, comprovante de protocolo |
| Responsáveis | advogado, analista_processos |
| Riscos | Perda de prazo, reprovação na data fatal |
| Horário limite | 17h00 da data fatal |

**Rotina: Preencher requisição de protocolo**

| Atividade | Descrição | Complexidade | Prioridade | Tempo (min) | Role | Documentação |
|-----------|-----------|--------------|------------|-------------|------|--------------|
| Abrir prazo e clicar Solicitar protocolo | Acessar o prazo na agenda e clicar em "Solicitar protocolo (ENP)" no cabeçalho | low | high | 2 | advogado | step_by_step: 1. Abrir prazo 2. Clicar Solicitar protocolo |
| Preencher capa da requisição | Preencher campos sinalizados na capa (tipo de petição conforme tipo do prazo) | medium | high | 10 | advogado | Campos obrigatórios; tipo restrito ao tipo do prazo |
| Vincular petição no DocSite | Vincular petição (Assunto "Petição") na aba DocSite | medium | high | 5 | advogado | Apenas petição; demais docs em aba DocSite com classificação |
| Adicionar anexos (se houver) | Aba DocSite → Novo → classificar (Contrato, Procuração, Substabelecimento) | low | normal | 5 | advogado | Numerar arquivos na ordem de protocolo |
| Enviar para aprovação | Clicar "Enviar para aprovação" | low | high | 1 | advogado | Acompanhar conclusão e conferir recibo |
| Acompanhar conclusão | Verificar conclusão da requisição pela controladoria | low | high | — | advogado | Não enviar duas requisições simultâneas |

**Regras documentadas:** Arquivos numerados; classificação conforme assunto Espaider; tamanho e formatação do tribunal; Correios/Cruz Alta até 11h30.

---

#### Processo: Cancelamento de Agendamento

| Campo | Valor |
|-------|-------|
| Área | Legal Operations |
| Núcleo | Controle de Prazos |
| Inputs | Prazo/providência a cancelar, motivo |
| Outputs | Requisição cancelamento, prazo baixado como cancelado |
| Responsáveis | advogado |
| Riscos | Motivo inadequado → inconsistência; reprovação na data fatal |

**Rotina: Solicitar cancelamento**

| Atividade | Descrição | Complexidade | Prioridade | Tempo | Role |
|-----------|-----------|--------------|------------|-------|------|
| Clicar cancelar tarefa | No cabeçalho do prazo, clicar "Cancelar tarefa" | low | high | 1 | advogado |
| Preencher capa da requisição | Preencher campos (motivo conforme caso concreto) | medium | high | 5 | advogado |
| Salvar e enviar | Salvar e enviar para aprovação | low | high | 1 | advogado |
| Acompanhar conclusão | Acompanhar conclusão da requisição | low | high | — | advogado |

**Documentação:** Link manual de motivos; atentar ao pedido na data fatal.

---

#### Processo: Readequação de Agendamento

| Campo | Valor |
|-------|-------|
| Inputs | Responsável, data final, tipo do prazo a alterar |
| Outputs | Requisição readequação; prazo retorna "a cumprir" |
| Responsáveis | advogado |

**Rotina: Solicitar readequação**

| Atividade | Descrição | Complexidade | Prioridade | Role |
|-----------|-----------|--------------|------------|------|
| Clicar readequar tarefa | No cabeçalho do prazo | low | high | advogado |
| Ajustar campos desejados | Responsável, tipo do prazo, data fatal | medium | high | advogado |
| Detalhar justificativa | Preencher justificativa da alteração | medium | high | advogado |
| Salvar e enviar | Salvar e enviar | low | high | advogado |

---

#### Processo: Posicionamento de Prazo Fatal

| Campo | Valor |
|-------|-------|
| Quando | Botão disponível a partir das 18h do dia anterior à data fatal |
| Inputs | Motivo (conforme tabela) |
| Outputs | Justificativa registrada; prazo posicionado |
| Responsáveis | advogado |

**Rotina: Posicionar prazo**

| Atividade | Descrição | Role |
|-----------|-----------|------|
| Clicar posicionar prazo fatal | No cabeçalho do prazo (disponível 18h do dia anterior) | advogado |
| Preencher motivo | Motivo conforme caso concreto (link manual) | advogado |
| Salvar e enviar | Salvar e enviar | advogado |

---

#### Processo: Cumprimento Providência Sem Fluxo

| Campo | Valor |
|-------|-------|
| Quando | Providência especial sem fluxo próprio (ex.: Verificar trânsito em julgado) |
| Inputs | Campo "Cumprido em", "Observações encerramento", documentos |
| Outputs | Providência cumprida |

**Rotina: Cumprir diretamente**

| Atividade | Descrição | Role |
|-----------|-----------|------|
| Preencher Cumprido em | Data/hora do cumprimento | advogado |
| Preencher Observações encerramento | Ou indexar DocSite assunto COMPROVANTE DE CUMPRIMENTO | advogado |
| Vincular documentos (se necessário) | Aba Documentos (DocSite) | advogado |
| Salvar e fechar | Clicar "Salvar e fechar" | advogado |

---

#### Processo: Protocolo Sem Prazo

| Campo | Valor |
|-------|-------|
| Quando | Envio de petição sem prazo agendado |
| Regra | Se houver prazo pendente sem agendamento no Espaider, solicitar lançamento (não usar protocolo sem prazo) |
| Horário | Até 14h30 para mesmo dia; Correios/Cruz Alta até 11h30 |
| Outputs | Requisição enviada; não dá baixa em prazo |

**Rotina: Solicitar protocolo sem prazo**

| Atividade | Descrição | Role |
|-----------|-----------|------|
| Clicar Protocolo sem prazo | No cabeçalho da ficha | advogado |
| Preencher capa | Campos sinalizados | advogado |
| Vincular petição | Assunto: Petição | advogado |
| Anexos (se houver) | Aba DocSite, classificar | advogado |
| Enviar para aprovação | Enviar | advogado |

---

#### Processo: Prazo Protocolado (Exceção)

| Campo | Valor |
|-------|-------|
| Quando | Exceção: não foi possível solicitar protocolo à controladoria |
| Inputs | Comprovante de protocolo, justificativa (tabela de motivos) |
| Outputs | Prazo cumprido com comprovante vinculado |

**Rotina: Vincular comprovante**

| Atividade | Descrição | Role |
|-----------|-----------|------|
| Clicar Prazo protocolado (PRP) | No cabeçalho do prazo | advogado |
| Preencher capa | Campos sinalizados, justificativa | advogado |
| Aba Documentos → Novo | Assunto: COMPROVANTE DE PROTOCOLO | advogado |
| Cumprir e enviar para controladoria | Finalizar | advogado |

---

#### Processo: Avaliação de Risco

| Campo | Valor |
|-------|-------|
| Área | Legal Operations |
| Inputs | Pedidos da pasta, prioridade, motivo |
| Outputs | Avaliação registrada, provisão de pedidos |
| Regra | Avaliação em todos os pedidos; sem pedidos em duplicidade na mesma pasta |

**Rotina: Realizar avaliação**

| Atividade | Descrição | Complexidade | Role |
|-----------|-----------|--------------|------|
| Abrir ficha e clicar Avaliar risco | Acessar ficha/processo | low | advogado |
| Selecionar prioridade e motivo | Data início vigência, motivo | medium | advogado |
| Provisão de pedidos (se houver) | Vincular pedidos existentes, indicar alteração | medium | advogado |
| Novos pedidos (se não houver) | Criar pedido, valor original, valores de risco | high | advogado |
| Ajustar riscos | Risco remoto sempre zero | medium | advogado |
| Salvar e enviar aprovação | Salvar e fechar, Enviar para aprovação | low | advogado |

---

#### Processo: Confirmação de Publicações

| Campo | Valor |
|-------|-------|
| Área | Legal Operations |
| Núcleo | Publicações |
| Filtro | Responsável — Aguardando confirmação de leitura |
| Prazo | 24h para confirmar |
| Outputs | Confirmação de leitura, providências criadas/canceladas se necessário |

**Rotina: Confirmar publicação**

| Atividade | Descrição | Role |
|-----------|-----------|------|
| Acessar Aprovação de Publicações | Contencioso | advogado |
| Aplicar filtro | Responsável — Aguardando confirmação de leitura | advogado |
| Avaliar publicação | Selecionar, aumentar para leitura | advogado |
| Verificar providências | Aba Providências; criar ou cancelar se necessário | advogado |
| Assinalar Confirmação de leitura | Aba Geral | advogado |
| Salvar e fechar | Concluir | advogado |

---

#### Processo: Gestão de Agenda

| Campo | Valor |
|-------|-------|
| Área | Legal Operations |
| Núcleo | Controle de Prazos |
| Módulos | Contencioso, Consultivo, Área de trabalho (unificada) |

**Rotina: Visualizar e organizar agenda**

| Atividade | Descrição | Role |
|-----------|-----------|------|
| Acessar agenda | Contencioso, Consultivo ou Área de trabalho | advogado |
| Ordenar por data final | Clicar no cabeçalho | advogado |
| Aplicar filtro rápido | Providências ativas/iniciadas/posicionadas | advogado |
| Verificar na ficha | Aba Providências, filtro ativas/iniciadas/posicionadas | advogado |

---

#### Processo: Abertura de Pasta (Contencioso)

| Campo | Valor |
|-------|-------|
| Permissão | Via solicitação |
| Tipos | Criar pasta clientes escritório, Criar pasta novo cliente |

**Rotina: Solicitar criação de pasta**

| Atividade | Descrição | Role |
|-----------|-----------|------|
| Acessar Painel abertura pastas/fichas | Módulo Área de trabalho | analista_atendimento |
| Criar solicitação | Conforme documentação específica | analista_atendimento |
| Aguardar aprovação | Acompanhar conclusão | analista_atendimento |

---

#### Processo: Abertura de Ficha/Processo (Contencioso)

| Campo | Valor |
|-------|-------|
| Permissão | Via solicitação |
| Tipos | Criar ficha-processo, Criar apenso |

---

#### Processo: Abertura de Consulta (Consultivo)

| Campo | Valor |
|-------|-------|
| Permissão | Via solicitação |
| Documentação | Criar consulta novo cliente, Criar nova consulta |

---

#### Processo: Lançamento DocSite

| Campo | Valor |
|-------|-------|
| Assuntos | Petição, Contrato, Procuração, Substabelecimento, Cálculo, COMPROVANTE DE PROTOCOLO, COMPROVANTE DE CUMPRIMENTO, E-MAIL |
| Vinculação | Pasta, ficha, andamento, providência |

**Rotina: Incluir documento no Espaider**

| Atividade | Descrição | Role |
|-----------|-----------|------|
| Abrir DocSite | Na tela do processo | advogado |
| Clicar Novo | Iniciar inclusão | advogado |
| Escolher arquivos | Arrastar ou Explorer | advogado |
| Selecionar Biblioteca e Assunto | Classificar corretamente | advogado |
| Vincular (se necessário) | Andamento e/ou Providência | advogado |
| Concluir | Finalizar | advogado |

**Rotina: Incluir documento via e-mail**

| Atividade | Descrição | Role |
|-----------|-----------|------|
| Salvar mensagem | No e-mail | advogado |
| Preencher tela | Biblioteca, Assunto E-MAIL, Pasta, Ficha | advogado |
| Vincular andamento/providência | Opcional | advogado |
| Arquivamento automático | Próximos e-mails relacionados | sistema |

---

#### Processo: Lançamento Time Sheet

| Campo | Valor |
|-------|-------|
| Área | Administrativo |
| Inputs | Atividade, descrição, item de trabalho |
| Outputs | Horas lançadas |

**Rotina: Lançar horas**

| Atividade | Descrição | Role |
|-----------|-----------|------|
| Clicar Cronômetro | Em qualquer tela | advogado |
| Selecionar atividade e descrição | Preencher campos | advogado |
| Salvar | Iniciar contagem | advogado |
| Ajustar (se esquecido) | Nova tarefa, Horas trabalhadas, Data | advogado |
| Finalizar | Concluir lançamento | advogado |

---

#### Processo: Emissão de Relatórios

| Campo | Valor |
|-------|-------|
| Área | Inovação e Tecnologia |
| Onde | Botão Relatórios em quase todas as abas |

**Rotina: Emitir relatório**

| Atividade | Descrição | Role |
|-----------|-----------|------|
| Clicar Relatórios | Na aba de trabalho | advogado |
| Buscar ou listar | Encontrar relatório desejado | advogado |
| Emitir | Clicar Emitir | advogado |
| Agendar (opcional) | Periodicidade, envio por e-mail | advogado |
| Personalizar campos | Selecionar campos, salvar modelo | advogado |
| Selecionar filtro | Modelo de filtro, clientes, grupo | advogado |
| Avançar | Gerar relatório | advogado |

---

### 15.3 Resumo para seed/cadastro no frontend

| Processo | Área | Núcleo | Rotinas | Atividades |
|----------|------|--------|---------|------------|
| Solicitação de Protocolo | Legal Operations | Protocolos | 1 | 6 |
| Cancelamento de Agendamento | Legal Operations | Controle de Prazos | 1 | 4 |
| Readequação de Agendamento | Legal Operations | Controle de Prazos | 1 | 4 |
| Posicionamento de Prazo | Legal Operations | Controle de Prazos | 1 | 3 |
| Cumprimento Providência Sem Fluxo | Legal Operations | Controle de Prazos | 1 | 4 |
| Protocolo Sem Prazo | Legal Operations | Protocolos | 1 | 5 |
| Prazo Protocolado (Exceção) | Legal Operations | Protocolos | 1 | 4 |
| Avaliação de Risco | Legal Operations | — | 1 | 6 |
| Confirmação de Publicações | Legal Operations | Publicações | 1 | 6 |
| Gestão de Agenda | Legal Operations | Controle de Prazos | 1 | 4 |
| Abertura de Pasta | Experiência do Cliente | — | 1 | 3 |
| Abertura de Ficha/Processo | Contencioso Cível | — | 1 | 3 |
| Abertura de Consulta | Consultivo | — | 1 | 3 |
| Lançamento DocSite | Legal Operations | — | 2 | 6+4 |
| Lançamento Time Sheet | Administrativo | — | 1 | 5 |
| Emissão de Relatórios | Inovação e Tecnologia | — | 1 | 7 |

---

## 16. Horários Limite (Regras de Negócio)

| Ação | Horário |
|------|---------|
| Solicitar protocolo | Até 17h00 da data fatal |
| Exceções (aviso) | Até 16h00 |
| Exceções (envio) | Até 18h30 (e-mail protocolo@arauz.com.br) |
| Protocolo Correios/Cruz Alta | Até 11h30 |
| Protocolo sem prazo (mesmo dia) | Até 14h30 |
| Posicionar prazo fatal | A partir das 18h do dia anterior |

---

## 17. Mapeamento para Frontend BPM (Organização)

Esta seção define como os dados extraídos devem ser exibidos no módulo Organização (Processos → Rotinas → Atividades), permitindo documentação viva dos fluxos Espaider.

### 17.1 Campos a exibir por entidade

| Entidade | Campos principais | Campos documentação (JSONB) |
|----------|-------------------|------------------------------|
| **Processo** | name, description, objective, area, nucleus | inputs, outputs, responsible_roles, risks, impacts, documentation (source, doc, horario_limite, regras) |
| **Rotina** | name, description, objective | documentation (steps, regra, prazo, horario_limite) |
| **Atividade** | name, description, complexity, priority, required_role, average_execution_time | inputs, outputs, risks, impacts, documentation (step_by_step, guidelines, common_errors) |

### 17.2 Regras de negócio documentadas (para exibição)

| Processo | Regra | Fonte |
|----------|-------|-------|
| Solicitação de Protocolo | Horário limite 17h00 da data fatal | Agenda-e-Protocolo.pdf |
| Solicitação de Protocolo | Arquivos numerados na ordem de protocolo | Agenda-e-Protocolo.pdf |
| Solicitação de Protocolo | Não enviar duas requisições simultâneas | Agenda-e-Protocolo.pdf |
| Protocolo Sem Prazo | Se houver prazo pendente sem agendamento, solicitar lançamento (não usar protocolo sem prazo) | Agenda-e-Protocolo.pdf |
| Protocolo Sem Prazo | Mesmo dia até 14h30; Correios/Cruz Alta até 11h30 | Agenda-e-Protocolo.pdf |
| Posicionamento | Botão disponível a partir das 18h do dia anterior | Agenda-e-Protocolo.pdf |
| Avaliação de Risco | Avaliação em todos os pedidos; sem pedidos em duplicidade na mesma pasta | Ajuste-Avaliação-e-Lançamentos.pdf |
| Confirmação de Publicações | Prazo 24h para confirmar | Ajuste-Avaliação-e-Lançamentos.pdf |

### 17.3 Alertas automáticos (e-mail) — referência para integração futura

| Horário | Alerta | Destinatário |
|---------|--------|--------------|
| 09h30 | Prazos/providências vencidos do dia anterior não finalizados | Responsável |
| 14h30 | Prazos/providências consultivo não iniciados/posicionados | Responsável |
| 17h00 | Lembrete consultivo; inconsistência se não iniciados | Responsável |
| 18h00 | Providências especiais contencioso não iniciados/posicionados | Responsável |

### 17.4 Vínculos entre entidades (para navegação)

| Origem | Destino | Relação |
|--------|--------|---------|
| Processo | Sistema (Espaider) | org_process_systems |
| Processo | Área | org_processes.area_id |
| Processo | Núcleo | org_processes.nucleus_id |
| Rotina | Processo | org_routines.process_id |
| Atividade | Rotina | org_activities.routine_id |
| Atividade | Documento | org_activity_documents |

### 17.5 Classificação de providências (referência para filtros)

| Tipo | Conferido | Horário limite |
|------|-----------|---------------|
| Audiência | Sim (controladoria) | — |
| Perícia | Sim (controladoria) | — |
| Prazo | Sim | 14h30 (consultivo) / 18h00 (contencioso) |
| Providência especial | Sim | 14h30 (consultivo) / 18h00 (contencioso) |
| Providência interna | Não | Não pode ficar pendente de um mês para outro |
| Verificação | Não | — |

---

## 18. Checklist de documentação via frontend

- [ ] Processos Espaider exibem inputs, outputs, risks, impacts e documentation
- [ ] Rotinas exibem steps e regras no painel de detalhe
- [ ] Atividades exibem step_by_step, guidelines e common_errors
- [ ] Badge "Espaider" ou similar para processos com source=espaider
- [ ] Link para documento fonte (doc) quando disponível
- [ ] Horários limite destacados em processos de protocolo/prazo

---

*Documento gerado para subsidiar cadastros no módulo Organização e modelagem BPM do Tech Arauz.*
