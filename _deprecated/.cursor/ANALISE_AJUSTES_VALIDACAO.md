# Análise dos Ajustes Mapeados na Validação
**Data:** 2025-02-25 | **Status:** Diagnóstico e Plano  
**Equipe:** @aios-master, @architect, @po

---

## 1. CRONOGRAMAS — Agenda: período não altera lista

### ✅ CORRIGIDO
- **Problema:** Lista "Todas as Atividades" mostrava sempre `finalFilteredSchedules` (todas atividades), independente do período (Dia/Semana/Mês) selecionado na Agenda.
- **Solução aplicada:** Alterada lógica para exibir `getSchedulesForDate(currentDate)` quando em modo Agenda; o rótulo agora mostra o período.
- **Arquivo:** `src/app/cronogramas/cronogramas-content.tsx`

---

## 2. CRONOGRAMAS — Gantt: vazio + períodos + status projeto vs cronograma

### 📋 DIAGNÓSTICO

#### 2.1 Gantt vazio (sem atividades)

**Possíveis causas:**
1. Filtro de projeto ativo (`isProjectActiveForGantt`) exclui todos os cronogramas
2. Dados chegando vazios do servidor ou com status que não corresponde à comparação
3. Campo `status` do projeto está sendo mapeado de forma incorreta (ex.: `status:situacao_original` em `page.tsx`)

**Investigação necessária:**
- Verificar valores reais de `project.status` no banco (dev tools → Network/GraphQL)
- Comparar valores esperados vs. reais de "iniciado" e "em execução"
- Revisar query em `page.tsx` linha 22: `status:situacao_original` pode estar causando conflito

#### 2.2 Gantt deve ter períodos (Dia/Semana/Mês)

**Situação atual:** Gantt tem controles Dia/Semana/Mês, mas:
- Estado `viewMode` (interno do Gantt) é diferente de `agendaPeriod` (da Agenda)
- Não há integração com FilterBar para sincronizar períodos

**Solução proposta:**
- Criar `ganttPeriod` no hook ou usar `agendaPeriod` quando `viewMode === 'gantt'` (conforme decisão)
- Sincronizar controles de período do Gantt com FilterBar
- Gantt recebe `ganttPeriod` (day|week|month) e filtra tasks conforme janela de datas

#### 2.3 Status: projeto vs cronograma

**Distinção necessária:**
- `project.status` = status do projeto (Iniciado, Em Execução, Concluído, Cancelado, etc.) — tabela `projects`
- `schedule.status` = status da atividade (Pendente, Em Andamento, Concluído, etc.) — tabela `project_schedules`

**Correção necessária em `CronogramaGantt.tsx`:**
- Manter filtro `isProjectActiveForGantt()` baseado em `project.status`
- Não confundir com `schedule.status` (status da atividade dentro do cronograma)

### 🔧 PLANO DE AÇÃO (Item 2)

1. **Validar dados** (dev/logs):
   - Executar query manual: `SELECT DISTINCT project.status FROM project_schedules...`
   - Verificar valores reais (case, espaços, encoding)

2. **Corrigir mapeamento** se necessário:
   - Revisar `page.tsx` — campo `status:situacao_original` está correto?
   - Atualizar comparação em `isProjectActiveForGantt()` se valores forem diferentes

3. **Integrar períodos do Gantt com FilterBar:**
   - Se `viewMode === 'gantt'`, usar `agendaPeriod` do hook (reutilizar)
   - Gantt exibe dia/semana/mês conforme `agendaPeriod`

4. **Testar:**
   - Gantt exibe cronogramas de projetos iniciado/em execução
   - Ao trocar período, gráfico se atualiza
   - FilterBar sincroniza com períodos do Gantt

---

## 3. AGENTES — Cadastrar provedores/modelos padrões AI

### 📋 CONTEXTO

**Objetivo:** Pré-registrar provedores globais e seus modelos (OpenAI, Anthropic, Gemini, etc.)

**Tabelas envolvidas:**
- `ai_lm_providers` (provedores: OpenAI, Anthropic, Gemini, etc.)
- `ai_lm_provider_models` (modelos de cada provedor: gpt-4, claude-3, gemini-pro, etc.)

**Localização esperada:**
- Migrations ou seed script: `supabase/migrations/` ou `scripts/seed-ai-providers.ts`

### 🔧 PLANO DE AÇÃO (Item 3)

1. **Criar migration ou seed:**
   - Inserir provedores padrão (OpenAI, Anthropic, Gemini, etc.)
   - Inserir modelos para cada provedor (com criatividade, versão, etc.)
   
2. **Modelos sugeridos:**
   ```
   OpenAI: gpt-4, gpt-4-turbo, gpt-3.5-turbo
   Anthropic: claude-3-opus, claude-3-sonnet, claude-3-haiku
   Gemini: gemini-pro, gemini-pro-vision
   ```

3. **Garantir RLS:** tabelas devem permitir SELECT tenant_id

---

## 4. AGENTES — Erro ao criar tipo de agente e provedor LLM

### 📋 DIAGNÓSTICO

**Possíveis causas:**
- Validação de campos obrigatórios falhando
- Conflito com tipos TypeScript no dialog
- Erro em API `/api/agents/types` ou `/api/agents/lm-providers`
- Problema de autorização (RLS, tenant_id)

**Imagens de contexto:**
- Dialog "Criar Novo Agente" mostra campos: Provedor (dropdown), Modelo, Criatividade
- Erro não está visível; precisa checar console/logs

### 🔧 PLANO DE AÇÃO (Item 4)

1. **Capturar erro:**
   - Abrir DevTools → Console
   - Tentar criar agente e anotar erro exato
   - Verificar Network tab → request `/api/agents/types` ou `/api/agents`

2. **Localizar endpoint:**
   - `src/app/api/agents/` (GET/POST)
   - Revisar validação e RLS

3. **Corrigir** conforme erro específico

---

## 5. AGENTES — Card não abre ao clicar em agente cadastrado

### 📋 DIAGNÓSTICO

**Localização:** `src/app/agentes/agentes-content.tsx`

**Provável causa:**
- `onAgentClick` handler não está implementado ou conectado
- `SplitView` ou modal não está sendo acionado
- Estado `selectedAgent` não está sendo atualizado

### 🔧 PLANO DE AÇÃO (Item 5)

1. **Revisar agentes-content.tsx:**
   - Procurar handler de clique nos cards/items
   - Garantir que `setSelectedAgent()` é chamado
   - Verificar se `SplitView` ou modal está renderizando conforme estado

2. **Padrão (referência Projetos):**
   - `ProjectKanbanCard` → onClick → `setSelectedProject`
   - `SplitView` renderiza `ProjectCockpit` quando `selectedProject` ativo

3. **Aplicar padrão similar aos Agentes**

---

## 6. AGENTES — Alinhar com padrões de Projetos

### 📋 CONTEXTO

**Diferenças atuais:**
- Filtros: Agentes não tem quick filters como Projetos
- Kanban: Agentes podem estar sem emojis/status visuais
- Ícones: Inconsistência de ícones
- Cores: Status colors diferentes

**Referência (Projetos):**
- Quick filters: Projeto, Status, Responsável, etc.
- Kanban columns: Futuro, Aprovação, Desenvolvimento, Homologação, Concluído, Cancelado
- Emojis: ✅ Concluído, ⏳ Em Aprovação, 🔄 Em Desenvolvimento, etc.
- Colors: design tokens (`tokens_brand.json`)

### 🔧 PLANO DE AÇÃO (Item 6)

1. **Adicionar Quick Filters:**
   - Reutilizar `FilterBar` do cronogramas
   - Definir `filterRegistryAgentes` em `src/lib/filters/filters-agentes.ts`
   - Quick filters: Tipo de Agente, Status, Provedor LLM, etc.

2. **Implementar Kanban:**
   - Usar `KanbanBoard` (se existir) ou replicar padrão de Projetos
   - Colunas: Rascunho, Ativo, Desativado, Arquivado
   - Cards com emojis e colors

3. **Design tokens:**
   - Aplicar emojis para status: 📝 Rascunho, ✅ Ativo, ❌ Desativado, 📦 Arquivado
   - Usar cores de `tokens_brand.json` ou criar palette específica

4. **Estrutura de componentes:**
   - `AgentKanbanCard` (análogo a `ProjectKanbanCard`)
   - `AgentListView` ou `AgentGridView` (análogo a `ProjectListView`)
   - Manter `SplitView` para detalhes

---

## Priorização Recomendada

| Item | Prioridade | Complexidade | Dependências |
|------|-----------|-------------|-------------|
| 1 - Agenda período | ✅ FEITO | Baixa | - |
| 2 - Gantt vazio | 🔴 **ALTA** | Média | Diagnóstico de dados |
| 3 - Seed provedores | 🟠 ALTA | Baixa | Banco de dados |
| 4 - Erro criar agente | 🔴 **ALTA** | Média | Erro específico |
| 5 - Card agente | 🔴 **ALTA** | Baixa | Item 4 (possivelmente) |
| 6 - Padrões agentes | 🟠 MÉDIA | Alta | Item 5 + design |

---

## Próximos Passos

1. **@po**: Validar priorização e critérios de aceite
2. **@architect**: Revisar diagrama (projeto.status vs schedule.status, RLS)
3. **@dev**: Iniciar diagnóstico (item 2: capturar erro real)
4. **@data-engineer**: Preparar seed de provedores (item 3)
