# Regras de Negócio

> **Camada**: 1 - Regras  
> **Última atualização**: 2026-02-07

---

## Propósito

Este documento define **O QUE o sistema deve fazer** em termos de lógica de negócio. Cada regra é identificada por um código único (`BR-XXX`) para rastreabilidade.

---

# MÓDULO 1: GESTÃO DE PROJETOS

## BR-001: Sincronização de Dados (Espaider)

| Atributo | Valor |
|----------|-------|
| **Entidade** | Projeto, Entrega, Cronograma, Requisito |
| **Descrição** | Dados são importados do ERP Espaider para o Portal |
| **Comportamento** | Se registro existe (mesmo IDEspaider), atualiza; senão, insere |
| **Frequência** | Manual (botão) ou agendada (configurável) |
| **Direção** | Unidirecional (Espaider → Portal). Dados não são enviados de volta. |

---

## BR-002: Controle de Acesso por Perfil

| Atributo | Valor |
|----------|-------|
| **Entidade** | Usuário, Perfil |
| **Papéis Disponíveis** | `admin`, `user`, `viewer` |

### Permissões por Papel

| Ação | admin | user | viewer |
|------|-------|------|--------|
| Visualizar dashboards | ✅ | ✅ | ✅ |
| Visualizar projetos | ✅ | ✅ | ✅ |
| Visualizar agentes AI | ✅ | ✅ | ✅ |
| Configurar integrações (Espaider/LangSmith) | ✅ | ❌ | ❌ |
| Gerenciar usuários | ✅ | ❌ | ❌ |
| Ver logs detalhados | ✅ | ❌ | ❌ |
| Criar/editar workflows de agentes | ✅ | ✅ | ❌ |
| Documentar agentes | ✅ | ✅ | ❌ |

---

## BR-003: Mapeamento de Campos Espaider

> Atualizado em 2026-02-20: Mapper expandido com 35+ campos para Projetos, incluindo campos 360° e dados de aprovação/cronograma

### Campos Principais (Projetos)

| Campo API | Campo Portal | Descrição | Tipo |
|-----------|--------------|-----------|------|
| IDEspaider | id_espaider | Identificador único da API | Integer |
| CODIGO / TRMESPAIDER | codigo | Código interno (ex: SUPOR.00001/25) | String |
| NOME | titulo | Nome do projeto | String |
| STATUSPROJETO | status | Status atual | String |
| RESPONSAVELPROJETO | responsavel | Responsável pelo projeto | String |
| PRIORIDADE | prioridade | Nível de prioridade (Urgente/Alta/Normal/Baixa) | String |
| PRAZOFINAL | prazo_final | Data limite do projeto | Date |
| TIPOASSUNTO | categoria | Área/assunto do projeto | String |
| DATAMOVIMENTACAO | data_movimentacao | Última movimentação | Date |

### Campos 360° (Fase, Cronograma, Aprovadores)

| Campo API | Campo Portal | Descrição |
|-----------|--------------|-----------|
| APROVADORATUAL | fase_atual | Fase/aprovador atual |
| PRAZOAPROVADOR | prazo_fase | Prazo para próxima fase |
| CRONOGRAMAATUAL | cronograma_atual | Cronograma ativo |
| PRAZOCRONOGRAMAATUAL | prazo_cronograma | Prazo do cronograma atual |
| ASSUNTOAREA | area | Área responsável |
| SITUACAOATUAL | situacao_atual | Situação atual do projeto |
| DATAINICIOAPROVACAO | data_inicio_aprovacao | Data início da aprovação |
| ENCERRADOEM | data_encerramento | Data de encerramento |

### Campos de Contexto e Planejamento

| Campo API | Campo Portal | Descrição |
|-----------|--------------|-----------|
| SOLICITANTE | solicitante | Quem solicitou o projeto |
| OBJETIVO | objetivo | Objetivo principal |
| ESCOPO | escopo | Escopo do projeto |
| JUSTIFICATIVA | justificativa | Justificativa do projeto |
| MENSAGEM_MOVIMENTACAO | mensagem_movimentacao | Mensagem da última movimentação |
| PASTACONSULTIVO | pasta_consultivo | Pasta consultivo |
| SOLUCAOAPLICADAEM | solucao_aplicada | Data da solução aplicada |

### Campos de Impacto e Complexidade

| Campo API | Campo Portal | Descrição |
|-----------|--------------|-----------|
| IMPORTANCIAESPECIAL | importancia_especial | Marcado como especial (boolean) |
| MOTIVO_IMPORTANCIAESPECIAL | motivo_importancia_especial | Motivo da importância especial |
| TIPOCHAMADO | tipo_chamado | Tipo de chamado/ticket |
| IMPACTOOPERACIONAL | impacto_operacional | Nível de impacto operacional |
| IMPACTOESTRATEGICO | impacto_estrategico | Nível de impacto estratégico |
| COMPLEXIDADETECNICA | complexidade_tecnica | Nível de complexidade técnica |

### Entidades Filhas (via ListaURLFilhos)

**Entregas** (~8 campos)

- ENTREGA (título), DATAINICIO, DATACONCLUSAO, PRIORIDADE, ORDEM, DETALHAMENTO, IDREGISTROPAI (vínculo pai)

**Cronogramas** (~11 campos)

- ATIVIDADE, RESPONSAVEL, DATAINICIO, DATACONCLUSAO, DATAPRAZO, FASEATIVIDADE, STATUS, ATRASADO, SETORRESPONSAVEL, IDREGISTROPAI (vínculo pai)

**Requisitos** (~10 campos)

- DESCRICAO, PRIORIDADE, STATUS, DATAINICIO, DATAPREVISTA, RESPONSAVEL, CATEGORIA, IDREGISTROPAI (vínculo pai)

**Históricos, Aprovadores, Orçamentos** (~5+ campos cada)

- Mantêm referência a IDREGISTROPAI para vincular ao projeto pai

> **Total**: 135+ campos mapeados considerando todas as entidades filhas. Ver `src/integrations/espaider/mapper.ts` para lista completa.

---

## BR-004: Classificação de Prioridade

| Prioridade | Critério |
|------------|----------|
| **Urgente** | Sistema fora do ar, bloqueio total |
| **Alta** | Funcionalidade crítica com workaround |
| **Normal** | Melhoria ou ajuste sem impacto imediato |
| **Baixa** | Nice-to-have, sem prazo definido |

---

## BR-005: Proteção de Dados Sensíveis

| Atributo | Valor |
|----------|-------|
| **Entidade** | Token de API, Credenciais |
| **Descrição** | Tokens e senhas nunca são exibidos em texto plano |
| **Comportamento** | Exibir apenas primeiros 4 caracteres + asteriscos |

---

## BR-006: Hierarquia de Entidades (Projetos)

> Atualizado em 2026-02-20: Adicionadas entidades Históricos, Aprovadores e Orçamentos (migrations 013, 019-020)

| Entidade Pai | Entidades Filhas |
| --- | --- |
| Projeto | Entregas, Cronogramas, Requisitos, Históricos, Aprovadores, Orçamentos |

### Vínculo Pai-Filho

Todas as entidades filhas mantêm referência ao projeto pai via campo `IDREGISTROPAI`:

- **Entregas**: Deliverables / Entregas do projeto
- **Cronogramas**: Atividades e marcos temporais
- **Requisitos**: Requisitos técnicos/funcionais
- **Históricos**: Movimentações, status changes, anotações
- **Aprovadores**: Aprovadores, validadores, responsáveis por fases
- **Orçamentos**: Estimativas, custos, alocações de recursos

### Comportamento de Sincronização

- Filhos são vinculados ao pai durante a sincronização via `IDREGISTROPAI`
- Se projeto pai não existe, filhos ficam "órfãos" (registrados mas não vinculados)
- Validação: Field `project_id` NOT NULL garante vínculo após sincronização bem-sucedida
- Cascata: Deletar projeto pai **não** deleta filhos (soft delete via is_deleted ou similar)

### Rastreabilidade

Todas as entidades filhas possuem:
- Campo `espaider_raw JSONB` para rastrear dados originais da API
- Campo `espaider_id` para UPSERT idempotente via `UNIQUE(tenant_id, espaider_id)`
- Timestamps `created_at`, `updated_at` para auditoria

---

# MÓDULO 2: GESTÃO DE AGENTES AI

## BR-101: Integração com LangSmith

| Atributo | Valor |
|----------|-------|
| **Entidade** | Run, Trace, Agent |
| **Descrição** | Dados de execução são lidos do LangSmith |
| **Comportamento** | Consulta API LangSmith para listar runs e traces |
| **Direção** | Unidirecional (LangSmith → Portal). Apenas leitura. |

---

## BR-102: Categorização de Agentes

| Tipo | Descrição |
|------|-----------|
| **Automação** | Agentes que executam tarefas repetitivas |
| **Análise** | Agentes que processam e analisam dados |
| **Integração** | Agentes que conectam sistemas diferentes |
| **Assistente** | Agentes conversacionais interativos |

---

## BR-103: Status de Agente

| Status | Descrição |
|--------|-----------|
| `ativo` | Agente em operação normal |
| `inativo` | Agente desabilitado |
| `desenvolvimento` | Agente em construção |
| `deprecated` | Agente obsoleto (manter histórico) |

---

## BR-104: Métricas de Execução de Agente

| Métrica | Fórmula |
|---------|---------|
| **Taxa de Sucesso** | (runs com status=success) / (total de runs) × 100 |
| **Tempo Médio** | Soma(duração de runs) / quantidade de runs |
| **Custo Estimado** | Soma(tokens utilizados) × preço por token |

---

# INFRAESTRUTURA

## BR-201: Isolamento Multi-tenant

| Atributo | Valor |
|----------|-------|
| **Entidade** | Tenant |
| **Descrição** | Cada tenant tem dados isolados |
| **Comportamento** | Todas as queries filtram por tenant_id |
| **Tenant Padrão** | `arauz` |

---

## BR-202: Logs de Auditoria

| Informação | Descrição |
|------------|-----------|
| Data/hora | Timestamp da operação |
| Tipo | sync, login, crud, etc. |
| Usuário/Job | Quem executou |
| Detalhes | Métricas e resultados |
| Tenant | Identificador do tenant |
