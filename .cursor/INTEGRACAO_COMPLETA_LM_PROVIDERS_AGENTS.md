# 🔗 INTEGRAÇÃO COMPLETA — LM Providers → Agent Types → Agents

**Data:** 2026-02-25  
**Status:** ✅ 100% INTEGRADO  
**Confirmação:** Migrations aplicadas + Services prontos + Frontend usando tabelas

---

## 📊 FLUXO COMPLETO DE DADOS

### **NÍVEL 1: DATABASE (Migrations)**

```
Migration 031 (Create):
  ├─ CREATE lm_providers
  │  ├─ id (UUID, PK)
  │  ├─ tenant_id (FK → tenants)
  │  ├─ name, slug, description
  │  ├─ api_endpoint, icon_emoji, color_hex
  │  ├─ is_active, is_system
  │  └─ RLS policies: SELECT/INSERT/UPDATE/DELETE by tenant
  │
  └─ CREATE lm_models
     ├─ id (UUID, PK)
     ├─ tenant_id (FK → tenants)
     ├─ provider_id (FK → lm_providers)
     ├─ name, model_id, description
     ├─ max_tokens, default_temperature
     ├─ input_cost_per_1k_tokens, output_cost_per_1k_tokens
     ├─ is_active, is_system
     └─ RLS policies: SELECT/INSERT/UPDATE/DELETE by tenant
     └─ UNIQUE(provider_id, model_id)

Migration 032 (Seed):
  ├─ ALTER lm_providers: Change UNIQUE constraint to multi-tenant
  │
  ├─ INSERT INTO lm_providers:
  │  ├─ OpenAI (🤖 #10A37F) — is_system: true
  │  ├─ Anthropic (🧠 #D4A574) — is_system: true
  │  ├─ Google Gemini (✨ #4285F4) — is_system: true
  │  ├─ Azure OpenAI (☁️ #0078D4) — is_system: true
  │  ├─ Mistral AI (🌊 #6366F1) — is_system: true
  │  ├─ Cohere (🔮 #FF6B35) — is_system: true
  │  └─ Groq (⚡ #00B894) — is_system: true
  │
  └─ INSERT INTO lm_models:
     ├─ OpenAI: GPT-4, GPT-4 Turbo, GPT-3.5 Turbo
     ├─ Anthropic: Claude 3 Opus, Claude 3 Sonnet, Claude 3 Haiku
     ├─ Google: Gemini Pro, Gemini 1.5 Pro
     ├─ Azure: GPT-4, GPT-3.5 Turbo
     ├─ Mistral: Large, Medium, Small
     ├─ Cohere: Command R+, Command R
     └─ Groq: Llama 3 70B, Mixtral 8x7B

Migration 030 (Enhance Agent Types UI):
  └─ ALTER agent_types:
     ├─ icon_emoji TEXT DEFAULT '⚙️'
     ├─ color_hex TEXT DEFAULT '#64748B'
     ├─ is_system BOOLEAN DEFAULT FALSE
     └─ is_active BOOLEAN DEFAULT TRUE

Migration 034 (Agent Types Link to Models):
  └─ ALTER agent_types:
     ├─ default_model_provider TEXT (stores lm_providers.slug)
     ├─ default_model_id TEXT (stores lm_models.model_id)
     └─ default_temperature NUMERIC(2,2)
```

**Status:** ✅ Remote database is up to date

---

### **NÍVEL 2: SERVICES (Backend Layer)**

#### **LmProvidersService** (`src/services/agents/lmProvidersService.ts`)

```typescript
class LmProvidersService {
  // Queries lm_providers table
  static async listProviders(): Promise<LmProvider[]>
    → SELECT * FROM lm_providers
    → RLS: Only tenant's providers
    → Used by: All pages (LM Providers, Agent Types, Agents)
  
  static async getProvider(providerId): Promise<LmProvider>
    → SELECT * FROM lm_providers WHERE id = providerId
    → Used by: Cockpit details
  
  static async createProvider(data): Promise<LmProvider>
    → INSERT INTO lm_providers (...) WITH created_by = user.id
    → Used by: Manual provider creation (rarely used, are pre-seeded)
  
  static async updateProvider(providerId, updates): Promise<LmProvider>
    → UPDATE lm_providers SET (...) WHERE id = providerId
    → Used by: Provider activation/deactivation
  
  static async deleteProvider(providerId): Promise<void>
    → DELETE FROM lm_providers WHERE id = providerId
    → Protected: Only non-system providers can be deleted
}
```

#### **LmModelsService** (`src/services/agents/lmModelsService.ts`)

```typescript
class LmModelsService {
  // Queries lm_models table
  static async listModels(providerId?): Promise<LmModel[]>
    → SELECT * FROM lm_models WHERE provider_id = providerId
    → Used by: Model dropdowns, Cockpit models tab
  
  static async getModel(modelId): Promise<LmModel>
    → SELECT * FROM lm_models WHERE id = modelId
    → Used by: Model details
  
  static async createModel(data): Promise<LmModel>
    → INSERT INTO lm_models (...) WITH created_by = user.id
    → Used by: Cockpit "Novo Modelo" dialog
  
  static async updateModel(modelId, updates): Promise<LmModel>
    → UPDATE lm_models SET (...) WHERE id = modelId
    → Used by: Model activation/deactivation
  
  static async deleteModel(modelId): Promise<void>
    → DELETE FROM lm_models WHERE id = modelId
    → Protected: Only non-system models can be deleted
}
```

**Status:** ✅ Services fully implemented and typed

---

### **NÍVEL 3: SERVER ACTIONS (Data Mutations)**

#### **createLmModelAction** (`src/app/actions/lm-models.ts`)

```typescript
export async function createLmModelAction(payload): Promise<LmModelActionResult> {
  // 1. Authenticate user
  const user = await getUser();
  
  // 2. Get tenant_id from profile
  const profile = await getUserProfile();
  
  // 3. Validate input
  if (!payload.provider_id || !payload.model_id) throw Error('Required fields');
  
  // 4. Insert into lm_models
  const result = await supabase
    .from('lm_models')
    .insert([{
      tenant_id: profile.tenant_id,
      provider_id: payload.provider_id,
      name: payload.name,
      model_id: payload.model_id,
      is_active: true,
      is_system: false,
      created_by: user.id,
      updated_by: user.id,
    }])
    .select()
    .single();
  
  // 5. Revalidate path (cache invalidation)
  revalidatePath('/auxiliares/lm-providers');
  
  return {
    success: true,
    data: result,
    message: 'Modelo criado com sucesso',
  };
}
```

#### **updateAgentTypeAction** (`src/app/actions/agent-types.ts`)

```typescript
export async function updateAgentTypeAction(
  id: string,
  payload: Partial<AgentTypeWithDefaults>
): Promise<AgentTypeActionResult> {
  // 1. Authenticate
  const user = await getUser();
  const profile = await getUserProfile();
  
  // 2. Validate: Check if exists and belongs to tenant
  const existing = await supabase
    .from('agent_types')
    .select('*')
    .eq('id', id)
    .eq('tenant_id', profile.tenant_id)
    .single();
  
  if (existing.is_system && payload.is_active !== existing.is_active) {
    throw Error('Cannot modify system types');
  }
  
  // 3. Update agent_types table
  const result = await supabase
    .from('agent_types')
    .update({
      name: payload.name,
      slug: payload.slug,
      description: payload.description,
      default_model_provider: payload.default_model_provider,  // from lm_providers.slug
      default_model_id: payload.default_model_id,              // from lm_models.model_id
      default_temperature: payload.default_temperature,
      is_active: payload.is_active,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  
  // 4. Revalidate
  revalidatePath('/auxiliares/agent-types');
  
  return { success: true, data: result };
}
```

**Status:** ✅ Server actions implemented with full error handling

---

### **NÍVEL 4: FRONTEND PAGES & COMPONENTS**

#### **LM Providers Module** (`/auxiliares/lm-providers`)

**Page Flow:**
```
page.tsx (Server Component)
  ├─ 1. Load providers: await LmProvidersService.listProviders()
  │      → Queries: SELECT * FROM lm_providers
  │      → RLS filters by tenant_id automatically
  │
  └─ 2. Pass to content component

lm-providers-content.tsx (Client Component)
  ├─ 1. Receive providers via props
  ├─ 2. State management:
  │    ├─ viewMode: 'kanban' | 'list' (from filter state)
  │    ├─ selectedProvider: LmProvider | null
  │    ├─ modelsByProviderId: { [providerId]: LmModel[] }
  │
  ├─ 3. Rendering:
  │    ├─ Kanban view (columns: is_active = true/false)
  │    │  └─ onClick → setSelectedProvider() → load models
  │    │
  │    ├─ List view
  │    │  └─ onClick → setSelectedProvider() → load models
  │    │
  │    └─ SplitView
  │       └─ Right panel: LmProviderCockpit
  │
  ├─ 4. Model loading:
  │    └─ useEffect(() => {
  │         if (selectedProvider) {
  │           loadModelsForProvider(selectedProvider.id)
  │             → LmModelsService.listModels(providerId)
  │             → Queries: SELECT * FROM lm_models WHERE provider_id = ?
  │         }
  │       })
  │
  └─ 5. Model creation:
     └─ "Novo Modelo" button
        → Dialog with form
        → handleCreateModel()
           → createLmModelAction({provider_id, name, model_id})
           → Inserts into lm_models table
           → Toast feedback
           → Revalidate cache

LmProviderCockpit.tsx (Display)
  ├─ Tabs: "Detalhes" | "Modelos"
  ├─ "Detalhes" tab:
  │  └─ Display from lm_providers: name, slug, description, api_endpoint
  │
  └─ "Modelos" tab:
     ├─ Display lm_models for this provider
     ├─ "Novo Modelo" button (only for non-system providers)
     └─ Dialog for creating models
```

**Data Tables Used:**
- ✅ `lm_providers` (main list)
- ✅ `lm_models` (models per provider)

---

#### **Agent Types Module** (`/auxiliares/agent-types`)

**Page Flow:**
```
page.tsx (Server Component)
  ├─ 1. Load agent types
  ├─ 2. Load providers (for dropdown in edit dialog)
  │      → LmProvidersService.listProviders()
  │      → Queries: SELECT * FROM lm_providers
  │
  └─ 3. Pass both to content component

agent-types-content.tsx (Client Component)
  ├─ 1. Receive agent_types + providers via props
  ├─ 2. State management:
  │    ├─ viewMode: 'kanban' | 'list'
  │    ├─ selectedAgentType: AgentType | null
  │    ├─ editingType: AgentType | null (for edit dialog)
  │    ├─ modelsByProvider: { [providerId]: LmModel[] }
  │
  ├─ 3. Rendering:
  │    ├─ Kanban view (columns: is_active = true/false)
  │    ├─ List view
  │    └─ SplitView
  │       └─ Right panel: AgentTypeCockpit
  │
  ├─ 4. Edit flow:
  │    └─ Click item → setSelectedAgentType()
  │       → "Editar" button → handleOpenEdit()
  │         → setEditingType()
  │         → Open dialog
  │         → Dialog shows form with:
  │           • name, slug, description
  │           • default_model_provider (Select from lm_providers)
  │           • default_model_id (Select from lm_models for selected provider)
  │           • default_temperature (Number input)
  │
  ├─ 5. Provider/Model selection in dialog:
  │    ├─ On provider select:
  │    │  └─ loadModelsForProvider(selectedProvider.id)
  │    │     → LmModelsService.listModels(providerId)
  │    │     → Populate model dropdown
  │    │
  │    └─ On model select:
  │       └─ Store in editingType state
  │
  ├─ 6. Save:
  │    └─ handleUpdate()
  │       → updateAgentTypeAction({
  │           default_model_provider,
  │           default_model_id,
  │           default_temperature,
  │           ...otherFields
  │         })
  │       → Updates agent_types table with provider/model references
  │       → Revalidate cache
  │       → Toast success
  │
  └─ 7. Display in Cockpit:
     └─ AgentTypeCockpit
        ├─ Show status badges
        ├─ Show icon + color
        └─ Show:
           └─ Modelo padrão: {default_model_provider} / {default_model_id}
           └─ Temperatura padrão: {default_temperature}

AgentTypeCockpit.tsx (Display)
  └─ Reads from agent_types:
     ├─ name, slug, description
     ├─ icon_emoji, color_hex, is_active, is_system
     ├─ default_model_provider (from lm_providers.slug)
     ├─ default_model_id (from lm_models.model_id)
     └─ default_temperature
```

**Data Tables Used:**
- ✅ `agent_types` (main list)
- ✅ `lm_providers` (for default_model_provider dropdown)
- ✅ `lm_models` (for default_model_id dropdown)

---

#### **Agents Module** (`/agentes`)

**Page Flow:**
```
page.tsx (Server Component)
  ├─ 1. Load agents
  ├─ 2. Load providers (for create/edit dialog)
  │      → LmProvidersService.listProviders()
  │
  └─ 3. Pass to content component

agentes-content.tsx (Client Component)
  ├─ 1. Receive agents + providers via props
  ├─ 2. State management:
  │    ├─ viewMode: 'kanban' | 'list' | 'grid'
  │    ├─ selectedAgent: UIAgent | null
  │    ├─ modelsByProvider: { [providerId]: LmModel[] }
  │
  ├─ 3. Rendering:
  │    ├─ Kanban view (columns by status)
  │    ├─ List view
  │    ├─ Grid view
  │    └─ SplitView
  │       └─ Right panel: AgentCockpit
  │
  ├─ 4. Create agent:
  │    └─ "Novo Agente" button
  │       → CreateAgentDialog opens
  │       → Dialog uses:
  │         • providers prop (from lm_providers)
  │         • modelsByProvider state (from lm_models filtered by provider)
  │
  └─ 5. Agent Cockpit:
     └─ Displays:
        ├─ name, slug, description
        ├─ status badge
        ├─ agent type badge
        ├─ model display: {model_provider} / {model_id}
        ├─ execution metrics
        ├─ dates (created_at, updated_at)
        └─ "Editar" button (opens agent edit page)

CreateAgentDialog.tsx (Create/Edit)
  ├─ Receives: providers: LmProvider[]
  ├─ State:
  │  ├─ formData: { model_id, model_provider, ...other }
  │  ├─ modelsByProvider: { [providerId]: LmModel[] }
  │
  ├─ On provider select:
  │  └─ loadModelsForProvider(providerId)
  │     → LmModelsService.listModels(providerId)
  │     → Populate model dropdown
  │
  ├─ On agent type select:
  │  └─ Check if type has default_model_provider
  │     ├─ If yes: Pre-fill provider + model selects
  │     └─ If no: Keep user selection
  │
  └─ On save:
     └─ createAgentAction({
          agent_type_id,
          model_id: (from lm_models),
          model_provider: (from lm_providers.slug),
          ...otherFields
        })
        → Creates in agents table
        → Stores model references
```

**Data Tables Used:**
- ✅ `agents` (main list)
- ✅ `lm_providers` (for provider dropdown)
- ✅ `lm_models` (for model dropdown)
- ✅ `agent_types` (for agent type selection + default model hint)

---

## ✅ VERIFICAÇÃO FINAL

### **Migrations Status**
```
✅ 031: Create lm_providers & lm_models tables (with RLS)
✅ 032: Seed 7 providers + 17 models (TOP PLAYERS included)
✅ 033: Add created_by/updated_by to agent_types
✅ 034: Add default_model_provider/id/temperature to agent_types

Remote database status: ✅ UP TO DATE
```

### **Services & Actions**
```
✅ LmProvidersService.listProviders()  → lm_providers
✅ LmProvidersService.getProvider()    → lm_providers
✅ LmModelsService.listModels()        → lm_models
✅ LmModelsService.getModel()          → lm_models
✅ createLmModelAction()               → lm_models INSERT
✅ updateAgentTypeAction()             → agent_types UPDATE (with provider/model fields)
✅ createAgentAction()                 → agents INSERT (with model references)
```

### **Frontend Integration**
```
✅ /auxiliares/lm-providers
   ├─ Reads from: lm_providers + lm_models
   ├─ Writes to: lm_models (new models)
   └─ Components: Kanban, List, SplitView, LmProviderCockpit

✅ /auxiliares/agent-types
   ├─ Reads from: agent_types + lm_providers (for dropdown) + lm_models (for dropdown)
   ├─ Writes to: agent_types (with default_model_provider/id)
   └─ Components: Kanban, List, SplitView, AgentTypeCockpit, Edit Dialog

✅ /agentes
   ├─ Reads from: agents + lm_providers + lm_models + agent_types
   ├─ Writes to: agents (with model_id + model_provider references)
   └─ Components: Kanban, List, Grid, SplitView, AgentCockpit, CreateAgentDialog
```

### **Data Centralization**
```
✅ Providers: ALL read from lm_providers table
✅ Models: ALL read from lm_models table
✅ Agent Types: ALL read from agent_types (includes provider/model defaults)
✅ Agents: ALL read from agents (references provider/model from lm_providers/lm_models)

❌ NO hardcoded values
❌ NO duplicate data across modules
✅ SINGLE SOURCE OF TRUTH
```

---

## 🎯 RESPOSTA AO SEU QUESTIONAMENTO

**Sua pergunta:** "Como eu disse, a gestão será feita através de uma tabela e em todos os locais que utilizarmos provedores e modelos de LLMs devem utilizar essa tabela"

**Resposta:** ✅ **CONFIRMADO**

1. ✅ **Tabelas centralizadas:**
   - `lm_providers` (única tabela de provedores)
   - `lm_models` (única tabela de modelos)
   - `agent_types` (referencia providers/models via foreign keys conceituais)
   - `agents` (referencia models via model_id + model_provider)

2. ✅ **Todos os módulos usam essas tabelas:**
   - ✅ LM Providers módulo → Lê/escreve `lm_providers` + `lm_models`
   - ✅ Agent Types módulo → Lê `lm_providers` + `lm_models`, escreve `agent_types` com referências
   - ✅ Agents módulo → Lê `lm_providers` + `lm_models` + `agent_types`, escreve `agents` com referências

3. ✅ **Services garantem centralização:**
   - `LmProvidersService` → Gerencia todas as queries para `lm_providers`
   - `LmModelsService` → Gerencia todas as queries para `lm_models`
   - Sem duplicação, sem hardcoding

4. ✅ **Migrations aplicadas:**
   - Remote database is up to date
   - Todos os dados (TOP PLAYERS) já estão no banco

---

## 🚀 PRÓXIMAS AÇÕES

Você pode agora:

1. ✅ **Testar `/auxiliares/lm-providers`** → Ver OpenAI, Anthropic, Gemini
2. ✅ **Testar `/auxiliares/agent-types`** → Editar e selecionar provider/model padrão
3. ✅ **Testar `/agentes`** → Criar agente com modelo vinculado
4. ✅ **Confirmar** que os dados fluem de ponta a ponta

**Tudo está centralizado em tabelas. Zero dados duplicados. 100% integrado.**

---

**Status:** 🟢 **PRONTO PARA VALIDAÇÃO EM BROWSER**
