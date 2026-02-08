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

| Campo API | Campo Portal | Descrição |
|-----------|--------------|-----------|
| IDEspaider | id_espaider | Identificador único |
| NOME | titulo | Nome do projeto |
| STATUSPROJETO | status | Status atual |
| RESPONSAVELPROJETO | responsavel | Responsável pelo projeto |
| PRIORIDADE | prioridade | Nível de prioridade |
| PRAZOFINAL | prazo_final | Data limite |
| DATAMOVIMENTACAO | updated_at | Última movimentação |
| CODIGO | codigo | Código interno (ex: SUPOR.00001/25) |
| TIPOASSUNTO | categoria | Área/assunto do projeto |

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

| Entidade Pai | Entidades Filhas |
|--------------|------------------|
| **Projeto** | Entregas, Cronogramas, Requisitos |

### Comportamento
- Filhos são vinculados ao pai durante a sincronização
- Se projeto pai não existe, filhos ficam "órfãos" (registrados mas não vinculados)

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
