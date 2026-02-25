# 🎨 Especificação UI/UX — Gestão 360° de Agentes AI

**Data**: 25/02/2026  
**Status**: Pendente Implementação  
**Prioridade**: ALTA

---

## **📋 Visão Geral**

O módulo de Gestão de Agentes AI precisa evoluir de um simples "Novo Agente" para um **sistema robusto de configuração, validação e gestão** de agentes inteligentes do tipo "Projetos" e "Requisitos".

---

## **🎯 Requisitos de Negócio**

1. **Criar Agentes com Tipo**: Usuário deve selecionar tipo ("Projetos", "Requisitos", etc.)
2. **Configurar Informações Críticas**: PERSONA, PROMPT, OBJETIVO, REQUISITOS
3. **Validação por Tipo**: Cada tipo tem campos obrigatórios/recomendados
4. **Reutilização**: Templates pré-preenchidos para acelerar criação
5. **Edição 360°**: Poder alterar tudo em um fluxo intuitivo

---

## **📐 Arquitetura da Solução**

### **Backend (Python/FastAPI)**

**Novos Endpoints:**

```
GET    /api/agents/v2/types              → Lista agent types
GET    /api/agents/v2/templates          → Lista templates
GET    /api/agents/v2/templates/{type}   → Templates por tipo
POST   /api/agents/v2/{id}/configure     → Salvar configuração completa
```

**Modelos Pydantic:**
- ✅ `AgentTypeModel` — Tipo de agente com campos obrigatórios
- ✅ `AgentTemplateModel` — Template reutilizável
- ✅ `AgentConfigModel` (expandido) — Campos: type, persona, prompt, objetivo, requisitos

**Banco de Dados (Supabase):**
- ✅ `agent_types` table (nome, slug, required_fields, recommended_fields)
- ✅ `agent_templates` table (persona_template, prompt_template, defaults)
- ✅ `agents` table (expandida com agent_type, requirements, validation_rules)

---

## **🎨 Componentes UI a Implementar**

### **1. AgentTypeSelector**

**Uso**: Primeira etapa da criação — user seleciona tipo

```typescript
<AgentTypeSelector 
  onSelect={(type) => setSelectedType(type)}
  types={[
    { id: 'proj', name: 'Projetos', icon: '📊', color: 'blue' },
    { id: 'req', name: 'Requisitos', icon: '📋', color: 'green' }
  ]}
/>
```

**UI**:
- Grid de cards (2x2) com tipos
- Cada card mostra: ícone, nome, descrição breve
- Click seleciona tipo e avança

### **2. AgentTemplateSelector**

**Uso**: Oferecer templates pré-preenchidos

```typescript
<AgentTemplateSelector 
  agentType="projetos"
  templates={[
    { id: 't1', name: 'Status Report Semanal', description: '...' },
    { id: 't2', name: 'Análise de Riscos', description: '...' }
  ]}
  onSelect={(template) => prefillForm(template)}
/>
```

**UI**:
- Lista de templates com preview
- Botão "Usar este template" carrega valores pré-preenchidos
- Opção "Criar do zero" sem template

### **3. AgentConfigEditor (Componente Principal)**

**Uso**: Editar todas as configurações de um agente

```typescript
<AgentConfigEditor 
  agent={agentData}
  agentType="projetos"
  requiredFields={['persona', 'prompt_objective']}
  recommendedFields={['requirements', 'model_temperature']}
  onSave={(config) => saveAgent(config)}
/>
```

**Estrutura em Abas/Collapse**:

#### **Aba 1: Informações Básicas**
- Nome (text)
- Slug (text, auto-gerado)
- Descrição (textarea)
- Tipo (select, read-only uma vez criado)
- Tags (multi-select)
- Owners (multi-select users)

#### **Aba 2: Persona & Prompt** ⭐
- **Persona** (textarea, 2-3 linhas)
  - Helper text: "Descreva a personalidade e estilo do agente"
  - Ex: "Você é um analista sênior de projetos com 15 anos de experiência..."

- **Objetivo** (textarea, 1-2 linhas)
  - Helper: "O que o agente faz? Em uma ou duas frases."
  - Ex: "Analisar movimentação de projetos nos últimos 7 dias e gerar relatório"

- **Instruções** (rich editor, bullets)
  - Add/remove bullets
  - Drag to reorder
  - Ex: 
    ```
    • Analise dados do Supabase
    • Identifique status changes
    • Gere relatório em Markdown
    ```

- **Template do Prompt** (code editor com {{variable}} syntax)
  - Syntax highlighting
  - Auto-complete para {{variables}}
  - Live preview mostrando resultado com sample data

#### **Aba 3: Requisitos** ⭐
- **Requisitos Adicionais** (array de textos)
  - Input field "Adicionar requisito"
  - Tags editáveis (delete, edit inline)
  - Ex:
    ```
    • Integrar com API do Espaider
    • Incluir análise de custos
    • Enviar por email automaticamente
    ```

#### **Aba 4: Configuração de Modelo** 🔧
- **Provider** (select: OpenAI, Anthropic, Azure)
- **Model ID** (select com opções por provider)
- **Temperature** (slider 0.0-2.0)
- **Max Tokens** (number input)
- **Response Format** (select: text, json)
- **Advanced** (collapse):
  - Top P (slider)
  - Presence Penalty (slider)
  - Frequency Penalty (slider)
  - Stop Sequences (array)

#### **Aba 5: Output & Validação** 🔍
- **Output Schema** (JSON editor)
  - Syntax highlighting
  - Validate on blur
  - Template presets (button to load common schemas)

- **Regras de Validação** (JSON editor)
  - JSON Schema para validar config antes de publish

#### **Aba 6: Metadados**
- **Status** (badge: draft, published, deprecated)
- **Criado em** (read-only)
- **Atualizado em** (read-only)
- **Versão Atual** (read-only if published)
- **Execuções** (stats: count, last run)

---

### **4. AgentConfigPreview**

**Uso**: Mostrar configuração de forma legível (sidebar)

```typescript
<AgentConfigPreview agent={agentData} />
```

**UI**:
- Card com resumo das principais configurações
- Código do prompt em collapse (read-only)
- Status badge com cor
- Botões: Edit, Delete, Publish, Export

### **5. AgentTypeRequirementsValidator**

**Uso**: Validar que todos os campos obrigatórios estão preenchidos

```typescript
const issues = validateAgentConfig(agent, agentType)
// Returns: { missing: ['persona', 'requirements'], warnings: [...] }
```

**UI**:
- Alert box mostrando campos faltantes em vermelho
- Campos recomendados em amarelo
- Auto-scroll to first missing field on submit

---

## **🔄 Fluxos de Interação**

### **Criar Novo Agente (Fluxo Completo)**

```
1. Modal "Novo Agente"
   ↓
2. Selecionar Tipo (AgentTypeSelector)
   ↓
3. Optar por Template ou Do Zero (AgentTemplateSelector)
   ↓
4. Preencher Configuração (AgentConfigEditor)
   ├─ Aba 1: Básico
   ├─ Aba 2: Persona & Prompt ← CRÍTICO
   ├─ Aba 3: Requisitos ← CRÍTICO
   ├─ Aba 4: Modelo
   ├─ Aba 5: Output Schema
   └─ Aba 6: Metadados
   ↓
5. Validar (AgentTypeRequirementsValidator)
   ├─ Se OK → "Salvar Rascunho" / "Publicar"
   └─ Se Erro → Highlight campos faltantes
   ↓
6. Sucesso → Toast + Redirect para lista
```

### **Editar Agente Existente (Draft)**

```
1. Clicar em agente (status: draft)
   ↓
2. Abre AgentConfigEditor com dados preenchidos
   ↓
3. User altera campos necessários
   ↓
4. Click "Salvar Rascunho" / "Publicar"
```

### **Visualizar Agente (Published)**

```
1. Clicar em agente (status: published)
   ↓
2. Abre Modal READ-ONLY com AgentConfigPreview
   ↓
3. Opções: "Duplicar", "Criar Nova Versão", "Export JSON"
```

---

## **📊 Dados de Exemplo**

### **Agent Type: "Projetos"**

```json
{
  "id": "type-proj-001",
  "name": "Projetos",
  "slug": "projetos",
  "description": "Agente para análise e gestão de projetos",
  "required_fields": ["persona", "prompt_objective", "prompt_instructions"],
  "recommended_fields": ["requirements", "model_temperature", "output_schema"]
}
```

### **Agent Template: "Status Report Semanal"**

```json
{
  "id": "tmpl-proj-001",
  "name": "Status Report Semanal",
  "slug": "status-report-weekly",
  "agent_type_id": "type-proj-001",
  "persona_template": "Você é um analista sênior de projetos com 15 anos de experiência em gestão...",
  "prompt_objective_template": "Analisar movimentação de projetos nos últimos 7 dias e gerar relatório executivo...",
  "prompt_instructions_template": ["• Acesse dados do Supabase", "• Identifique status changes", "• Calcule KPIs"],
  "model_provider_default": "openai",
  "model_id_default": "gpt-4",
  "model_temperature_default": 0.5
}
```

### **Agent Config: "Status Report Araúz Clientes"**

```json
{
  "id": "agent-arauz-001",
  "name": "Status Report Araúz Clientes",
  "slug": "status-report-arauz-clients",
  "status": "draft",
  "agent_type": "projetos",
  "persona": "Você é um analista sênior especializado em gestão de projetos para escritórios de advocacia. Seu estilo é profissional mas acessível, focando em dados...",
  "prompt_objective": "Analisar a movimentação de projetos da Araúz nos últimos 7 dias e gerar um relatório semanal para clientes.",
  "prompt_instructions": [
    "1. Consulte a base de dados de projetos do Supabase",
    "2. Filtre por data de atualização (últimos 7 dias)",
    "3. Agrupe por status (em_aprovacao, em_desenvolvimento, em_homologacao, concluido)",
    "4. Calcule KPIs: total de projetos, % progresso médio, projetos em risco",
    "5. Gere relatório em Markdown com seções por cliente",
    "6. Inclua visualizações (tabelas, gráficos de status)"
  ],
  "prompt_template": "{{report_type}}: {{period}}\n\nClientes: {{client_list}}\n\nFormate como: {{format}}",
  "requirements": [
    "Integração com API do Supabase para fetch de projetos",
    "Análise de status por período (semanal, mensal, trimestral, anual)",
    "Geração de Markdown com tabelas e estatísticas",
    "Envio automático por email para clientes",
    "Suporte a filtros por cliente e departamento"
  ],
  "model": {
    "provider": "openai",
    "model_id": "gpt-4",
    "temperature": 0.5,
    "max_tokens": 2000,
    "response_format": "text"
  },
  "output_schema": {
    "type": "object",
    "properties": {
      "report_title": { "type": "string" },
      "summary": { "type": "string" },
      "sections": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "client_name": { "type": "string" },
            "project_count": { "type": "integer" },
            "status_breakdown": { "type": "object" }
          }
        }
      }
    }
  }
}
```

---

## **🎯 Fases de Implementação**

### **Fase 1: Backend (Python)**
- [ ] Implementar endpoints para agent types e templates
- [ ] Seed data com "Projetos" e "Requisitos"
- [ ] Validação de campos obrigatórios por tipo

### **Fase 2: Frontend Componentes**
- [ ] AgentTypeSelector
- [ ] AgentTemplateSelector
- [ ] AgentConfigEditor (6 abas)
- [ ] AgentTypeRequirementsValidator

### **Fase 3: Integração**
- [ ] Conectar componentes no fluxo de criação
- [ ] API calls para salvar/atualizar
- [ ] Validação end-to-end

### **Fase 4: Polish & Testes**
- [ ] UX refinement
- [ ] Acessibilidade (WCAG AA)
- [ ] Testes E2E

---

## **📝 Checklist de Aceitação**

- [ ] Usuário consegue criar agente do tipo "Projetos"
- [ ] Persona, Prompt, Objetivo são campos críticos (validação)
- [ ] Requisitos são capturados em array editável
- [ ] Templates pré-preenchem campos automaticamente
- [ ] Agente salva em Supabase com todas as configurações
- [ ] Consegue editar um agente em draft
- [ ] Consegue visualizar (read-only) agente publicado
- [ ] Campos recomendados são destacados mas não obrigatórios
- [ ] UI é intuitiva e profissional

---

**Próximo Passo**: Implementação começando pelo Backend (endpoints) e depois Frontend.
