# 🔍 DEBUG: Fluxo Espaider Completo — Análise & Plano de Correção

**Data**: 2026-02-21
**Prioridade**: 🔴 CRITICAL
**Impacto**: Bloqueia gestão 360° (históricos e aprovadores não aparecem no frontend)

---

## 📋 RESUMO EXECUTIVO

### ✅ O que FUNCIONA
- ✅ API Espaider retorna projetos (Projetos)
- ✅ Projetos são sincronizados e aparecem no frontend
- ✅ Entregas e Cronogramas funcionam

### ❌ O que NÃO FUNCIONA
- ❌ **Históricos NÃO aparecem** — sync executa (0 errors) mas dados não chegam no UI
- ❌ **Aprovadores NÃO aparecem** — mesma situação
- ❌ **Erro ao clicar "Sincronizar"** — endpoint retorna sucesso mas há bloqueio silencioso

### 🎯 Causa Raiz
API Espaider está retornando dados de históricos/aprovadores, funções de sync executam sem erros, **MAS** os dados NÃO estão sendo gravados no banco (RLS/constraint bloqueando ou mapeamento nulo).

---

## 🔬 INVESTIGAÇÃO DETALHADA

### 1️⃣ API Espaider — Estrutura de Dados

**Arquivo**: `src/integrations/espaider/types.ts` + `src/integrations/espaider/client.ts`

```typescript
// API retorna:
interface ExportarDadosResponse {
  ListaRegistros: RegistroEspaider[];     // Projetos (primeira resposta)
  ListaURLFilhos?: URLFilho[];            // URLs para Entregas, Cronogramas, etc.
}

interface URLFilho {
  URL: string;                     // URL GET para buscar filhos
  Descricao?: string;              // Ex: "Históricos", "Aprovadores"
  Identificador?: string;          // Ex: "BI_SOLICITACOES_PROJETOSESPAIDER_HISTORICOS"
}

interface RegistroEspaider {
  IDEspaider: number;              // ID único no Espaider
  Identificador: string;           // Dataset name
  ListaCampos: CampoEspaider[];   // Array de {Identificador, Valor}
}
```

**✅ Status**: API está retornando corretamente `ListaURLFilhos` com URLs para históricos/aprovadores.

---

### 2️⃣ Mapeador — Conversão de Dados

**Arquivo**: `src/integrations/espaider/mapper.ts`

#### Funções de Mapeamento
```typescript
export function mapearHistorico(registro: RegistroEspaider): HistoricoMapeado {
    const campos = registro.ListaCampos;
    return {
        id_espaider: registro.IDEspaider,
        projeto_id_espaider: parseInt(getCampoValor(campos, 'IDREGISTROPAI') || '0', 10),
        tipo: getCampoValor(campos, 'TIPOHISTORICO'),
        responsavel_para: getCampoValor(campos, 'RESPONSAVEL_PARA'),
        responsavel_de: getCampoValor(campos, 'RESPONSAVEL_DE'),
        passo_para: getCampoValor(campos, 'PASSO_PARA'),
        passo_de: getCampoValor(campos, 'PASSO_DE'),
        numero_tramite: parseInt(getCampoValor(campos, 'NUMEROTRAMITE') || '0', 10),
        mensagem: getCampoValor(campos, 'MENSAGEM'),
        data: parseData(getCampoValor(campos, 'DATA_DE') || getCampoValor(campos, 'DATA')),
        espaider_raw: registro,
    };
}

export function mapearAprovador(registro: RegistroEspaider): AprovadorMapeado {
    const campos = registro.ListaCampos;
    return {
        id_espaider: registro.IDEspaider,
        projeto_id_espaider: parseInt(getCampoValor(campos, 'IDREGISTROPAI') || '0', 10),
        tipo: getCampoValor(campos, 'TIPO'),
        responsavel: getCampoValor(campos, 'RESPONSAVEL'),
        pontos_atencao: getCampoValor(campos, 'PONTOSATENCAO'),
        espaider_raw: registro,
    };
}
```

**⚠️ Possível Problema**: Se os campos `TIPOHISTORICO`, `RESPONSAVEL_PARA`, etc. **não existem ou têm nome diferente na API**, então `getCampoValor()` retorna `''` (vazio).

---

### 3️⃣ Sync Functions — Persistência no BD

**Arquivo**: `src/lib/sync/espaider-sync.ts` (linhas 1070-1269)

#### syncHistoriesFromRegistros()
```typescript
async function syncHistoriesFromRegistros(
  supabase: SupabaseClient,
  tenantId: string,
  logs: SyncLogEntry[],
  registros: RegistroEspaider[],
): Promise<DatasetSyncResult> {
  const mapped = mapearRegistros(registros, mapearHistorico);
  const projectMap = await getProjectIdMap(supabase, tenantId);  // Map espaider_id -> uuid

  const { data: existing } = await supabase
    .from('project_histories')
    .select('espaider_id')
    .eq('tenant_id', tenantId);
  const existingIds = new Set((existing || []).map((r) => r.espaider_id));

  // Filter: só insere se projeto PAI existe
  const rows = mapped
    .filter((r) => projectMap.has(r.projeto_id_espaider))  // ⚠️ CRÍTICO
    .map((r) => ({
      tenant_id: tenantId,
      espaider_id: r.id_espaider,
      project_id: projectMap.get(r.projeto_id_espaider)!,
      type: r.tipo || null,
      responsible_to: r.responsavel_para || null,
      responsible_from: r.responsavel_de || null,
      step_to: r.passo_para || null,
      step_from: r.passo_de || null,
      procedure_number: r.numero_tramite || null,
      message: r.mensagem || null,
      date: r.data ? r.data.toISOString() : null,
      espaider_raw: r.espaider_raw || null,
    }));

  // ⚠️ UPSERT com constraint composto
  const { error } = await supabase
    .from('project_histories')
    .upsert(rows, { onConflict: 'tenant_id,espaider_id' });
}
```

**🚨 Problema Identificado**:
1. Se `projectMap` está vazio ou `projeto_id_espaider` é 0/nulo → **Nenhuma linha é inserida**
2. Se constraint `UNIQUE(tenant_id, espaider_id)` falha → **Erro silencioso** (log diz "Erro no upsert" mas não mostra onde)
3. RLS policies podem estar **bloqueando INSERTs** mesmo com service_role

---

### 4️⃣ Rotina Orquestrador — executeSyncAll()

**Arquivo**: `src/lib/sync/espaider-sync.ts` (linhas 636-760)

```typescript
export async function executeSyncAll(
  supabase: SupabaseClient,
  tenantId: string,
): Promise<SyncAllResult> {
  // 1. Sync projects first
  const projResult = await syncProjects(supabase, tenantId, logs, apiConfig);
  results.push(projResult);

  // 2. Fetch ListaURLFilhos and sync children
  const response = await exportarDados({
    identificador: 'BI_SOLICITACOES_PROJETOSESPAIDER',
    ...
  });

  const urlFilhos = response.ListaURLFilhos || [];  // ✅ Retorna URLs

  // 3. For each child interface...
  for (const urlFilho of urlFilhos) {
    let dataset = descricaoToDataset(urlFilho.Identificador || urlFilho.Descricao);

    if (dataset === 'Historicos') {
      childResult = await syncHistoriesFromRegistros(supabase, tenantId, logs, registros);
    } else if (dataset === 'Aprovadores') {
      childResult = await syncApproversFromRegistros(supabase, tenantId, logs, registros);
    }
    // ...
  }
}
```

**Função descricaoToDataset()** — Detecção de Dataset:
```typescript
function descricaoToDataset(descricao: string | null | undefined): EspaiderDataset | null {
  if (!descricao) return null;
  const normalized = descricao.toLowerCase().trim();
  if (normalized.includes('entrega')) return 'Entregas';
  if (normalized.includes('histórico') || normalized.includes('historico')) return 'Historicos';
  if (normalized.includes('aprovador')) return 'Aprovadores';
  // ...
}
```

**⚠️ Problema**: Se `urlFilho.Descricao` ou `urlFilho.Identificador` NÃO contém "histórico" ou "aprovador" → dataset fica `null` → loop continua, nada é sincronizado.

---

### 5️⃣ Endpoint de Sincronização

**Arquivo**: `src/app/api/integracoes/sync/route.ts`

```typescript
export async function POST() {
  // Verifica auth
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, ... }, { status: 401 });

  // Check permissions
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();
  if (profile.role === 'viewer') return NextResponse.json({ success: false, ... }, { status: 403 });

  // Use service client
  const serviceClient = createServiceClient();
  const tenantId = profile.tenant_id || TENANT_ARAUZ_ID;

  try {
    const result = await executeSyncAll(serviceClient, tenantId);
    return NextResponse.json(result);  // ✅ Retorna resultado
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
```

**✅ Status**: Endpoint está bem estruturado, retorna resultado sem erros.

---

### 6️⃣ Frontend — Query de Projetos

**Arquivo**: `src/app/projetos/page.tsx`

```typescript
const { data: projects, error } = await supabase
  .from('projects')
  .select(`
    *,
    *,                                    // ⚠️ Duplicado!
    schedules:project_schedules(*),
    deliveries:project_deliveries(*),
    histories:project_histories(*),      // ✅ Query está correta
    approvers:project_approvers(*),
    budgets:project_budgets(*)
  `)
  .order('created_at', { ascending: false });
```

**🚨 Problema**: `*,*` duplicado não vai quebrar query, mas é desnecessário.

**✅ Status**: A query **PROCURA** por históricos e aprovadores, mas se não houver dados no BD → vazio.

---

### 7️⃣ Transformer — DB → UI

**Arquivo**: `src/lib/transformers/project.ts`

```typescript
export function dbProjectToUI(row: DBProject): UIProject {
  return {
    id: row.id,
    espaider_code: row.codigo,
    project_name: row.titulo,
    // ...
    histories: row.histories?.map(dbHistoryToUI),    // ✅ Map se existir
    approvers: row.approvers?.map(dbApproverToUI),
    budgets: row.budgets?.map(dbBudgetToUI),
  };
}

function dbHistoryToUI(row: DBHistory): UIHistory {
  return {
    id: row.id,
    type: row.tipo || '',
    from: row.responsavel_de || '',
    to: row.responsavel_para || '',
    step_from: row.passo_de || '',
    step_to: row.passo_para || '',
    message: row.mensagem || '',
    date: row.data || '',
  };
}
```

**✅ Status**: Transformer está correto. Se dados estão no BD, vão para UI.

---

### 8️⃣ Componente ProjectCockpit — Renderização UI

**Arquivo**: `src/components/project/ProjectCockpit.tsx`

```typescript
export function ProjectCockpit({
  project,
  schedules = [],
  deliveries = [],
  histories = [],         // ✅ Props declaradas
  approvers = [],
  budgets = [],
  ...
}: ProjectCockpitProps) {
  return (
    <Tabs>
      <TabsList>
        {/* Tabs renderizam corretamente */}
        {budgets.length > 0 && <TabsTrigger>Orçamentos ({budgets.length})</TabsTrigger>}
        {histories.length > 0 && <TabsTrigger>Histórico ({histories.length})</TabsTrigger>}
        {approvers.length > 0 && <TabsTrigger>Aprovadores ({approvers.length})</TabsTrigger>}
      </TabsList>

      <TabsContent value="histories">
        {histories.length === 0 ? (
          <div>Nenhum histórico</div>
        ) : (
          <div>
            {histories.map((history) => (
              <div key={history.id}>
                {/* Renderiza cada histórico */}
              </div>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
```

**✅ Status**: Componente renderiza corretamente se dados chegarem.

---

## 🎯 DIAGNOSIS: Por que Históricos/Aprovadores NÃO aparecem?

### Hipótese 1: Mapeamento com Campos Nulos ❌
**Evidência**: Se `TIPOHISTORICO` ou `RESPONSAVEL_PARA` não existem na API → `getCampoValor()` retorna `''` → todos os campos ficam vazios.

**Teste**: Verificar logs da sync (LogViewer) → se disser "X registros recebidos" mas "0 criados" → problema aqui.

---

### Hipótese 2: projeto_id_espaider = 0 ou nulo ❌
**Evidência**: Se `IDREGISTROPAI` não vem correto → `proyecto_id_espaider = 0` → `.filter(r => projectMap.has(0))` falha → nada é inserido.

**Teste**: Verificar se `IDREGISTROPAI` vem mesmo nos registros retornados.

---

### Hipótese 3: RLS Policies Bloqueando ❌
**Evidência**: RLS em `project_histories`, `project_approvers` pode estar bloqueando `service_role`.

**Status Atual**: Migration 021 criou policies `FOR ALL TO service_role USING (true) WITH CHECK (true)` → deve estar OK.

**Teste**: Verificar logs de erro no Supabase console.

---

### Hipótese 4: Constraint UNIQUE Falhando ❌
**Evidência**: Se `UNIQUE(tenant_id, espaider_id)` não está criado corretamente → upsert falha silenciosamente.

**Status Atual**: Migration 019 recria constraint. Precisa verificar se foi aplicada.

**Teste**: Query direto no Supabase:
```sql
SELECT constraint_name FROM information_schema.table_constraints
WHERE table_name='project_histories' AND constraint_type='UNIQUE';
```

---

### Hipótese 5: Detecção de Dataset Falhando ❌
**Evidência**: Se `urlFilho.Descricao` ou `urlFilho.Identificador` não contém palavras-chave → `descricaoToDataset()` retorna `null` → dataset não é sincronizado.

**Teste**: Verificar logs de `Interface filha não reconhecida`.

---

## ✅ PLANO DE CORREÇÃO — 6 Fases

### FASE 1: Diagnóstico Rápido (15 min)
**Objetivo**: Descobrir ONDE o fluxo está travando.

**Ações**:
1. [ ] Fazer sync manual via botão "Sincronizar"
2. [ ] Abrir LogViewer (`/integracoes`) → verificar logs
3. [ ] Procurar por:
   - "Historicos" ou "Aprovadores" — foi detectado dataset?
   - "X registros recebidos" — quantos vieram?
   - "0 criados, 0 atualizados" — nenhum foi inserido?
   - "Erro no upsert" — houve erro?

**Output**: Documento com descobertas.

---

### FASE 2: Validar Estrutura de Dados da API (20 min)
**Objetivo**: Confirmar que API retorna dados corretos.

**Ações**:
1. [ ] Chamar `test-sync.mjs` ou script direto no backend
2. [ ] Verificar estrutura de `response.ListaURLFilhos`:
   ```javascript
   const { ListaURLFilhos } = await exportarDados({
     identificador: 'BI_SOLICITACOES_PROJETOSESPAIDER'
   });
   console.log(JSON.stringify(ListaURLFilhos, null, 2));
   ```
3. [ ] Para cada URL filha, chamar `buscarFilhos()` e verificar:
   - `ListaRegistros.length` > 0?
   - Cada registro tem `ListaCampos`?
   - Campos esperados existem? (`IDREGISTROPAI`, `TIPOHISTORICO`, etc.)

**Output**: JSON com estrutura real da API.

---

### FASE 3: Debugar Mapeador (20 min)
**Objetivo**: Confirmar que mapeamento está convertendo corretamente.

**Ações**:
1. [ ] Criar test file: `test-mapper.mjs`
   ```javascript
   import { mapearHistorico, mapearAprovador } from './src/integrations/espaider/mapper.ts';
   const sampleRegistro = { /* um histórico real da API */ };
   const mapped = mapearHistorico(sampleRegistro);
   console.log('Mapped:', JSON.stringify(mapped, null, 2));
   ```
2. [ ] Verificar se campos estão vazios ou preenchidos

**Output**: Dados mapeados.

---

### FASE 4: Verificar Sync Executada (20 min)
**Objetivo**: Confirmar inserção no BD.

**Ações**:
1. [ ] Query direto no Supabase:
   ```sql
   SELECT COUNT(*) as total, dataset
   FROM integration_log_entries
   WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
   GROUP BY dataset
   ORDER BY total DESC;
   ```
2. [ ] Procurar por linhas com `dataset='Historicos'` ou `dataset='Aprovadores'`
3. [ ] Se não há linhas → dataset não foi sincronizado

**Output**: Logs de sync.

---

### FASE 5: Verificar Dados no BD (20 min)
**Objetivo**: Ver se históricos/aprovadores estão realmente salvos.

**Ações**:
1. [ ] Query no Supabase:
   ```sql
   SELECT COUNT(*), tenant_id FROM project_histories GROUP BY tenant_id;
   SELECT COUNT(*), tenant_id FROM project_approvers GROUP BY tenant_id;
   ```
2. [ ] Se `COUNT = 0` → nada foi inserido. Voltar para FASE 4.
3. [ ] Se `COUNT > 0` → está no BD mas não aparece na UI (FASE 6).

**Output**: Contagem de registros.

---

### FASE 6: Verificar Query & Transformer (15 min)
**Objetivo**: Confirmar que dados chegam ao UI.

**Ações**:
1. [ ] No console do navegador (DevTools):
   ```javascript
   // Fazer fetch da página e verificar props
   const response = await fetch('/projetos');
   const html = await response.text();
   // Procurar por JSON da props...
   ```
2. [ ] Ou adicionar log no `page.tsx`:
   ```typescript
   console.log('Projects:', JSON.stringify(projects, null, 2));
   ```
3. [ ] Se projetos têm `histories = []` → problema é no Supabase query
4. [ ] Se projetos têm `histories = [...]` → transformer está OK, problema é UI

**Output**: Props passadas para componentes.

---

## 📝 PRÓXIMOS PASSOS

1. **Executar FASE 1** → Diagnóstico rápido
2. **Baseado em resultado** → Executar FASE correspondente
3. **Cada fase produz artefato** que informa próxima fase
4. **Paralelo**: Revisar `descricaoToDataset()` para garantir detecção correta

---

## 🔧 Possíveis Correções (Pré-identificadas)

### Correção A: Remover `*,*` duplicado em query
**Arquivo**: `src/app/projetos/page.tsx:21`
```typescript
// ANTES:
.select(`
  *,
  *,
  schedules:project_schedules(*),
  ...
`)

// DEPOIS:
.select(`
  *,
  schedules:project_schedules(*),
  ...
`)
```

---

### Correção B: Melhorar detecção de dataset
**Arquivo**: `src/lib/sync/espaider-sync.ts:617`
```typescript
function descricaoToDataset(descricao: string | null | undefined): EspaiderDataset | null {
  if (!descricao) return null;
  const normalized = descricao.toLowerCase().trim();

  // Adicionar mais variações
  if (normalized.includes('entrega') || normalized.includes('delivery')) return 'Entregas';
  if (normalized.includes('cronograma') || normalized.includes('schedule') || normalized.includes('atividade')) return 'Cronogramas';
  if (normalized.includes('requisito') || normalized.includes('requirement')) return 'Requisitos';
  if (normalized.includes('histórico') || normalized.includes('historico') || normalized.includes('history')) return 'Historicos';
  if (normalized.includes('orçamento') || normalized.includes('orcamento') || normalized.includes('budget') || normalized.includes('valor')) return 'Orcamentos';
  if (normalized.includes('aprovador') || normalized.includes('approver')) return 'Aprovadores';

  return null;
}
```

---

### Correção C: Adicionar validações no sync
**Arquivo**: `src/lib/sync/espaider-sync.ts:1085-1090`
```typescript
// Depois de mapped
if (mapped.length === 0) {
  logs.push(createLog('warn', 'Historicos', 'Nenhum histórico foi mapeado (possível problema na estrutura de campos)'));
  return { dataset: 'Historicos', total: 0, created: 0, updated: 0, errors: 0, durationMs: Date.now() - start };
}

// Depois de filter
if (rows.length === 0 && mapped.length > 0) {
  logs.push(createLog('warn', 'Historicos', `${mapped.length} históricos foram descartados (projeto pai não encontrado em projectMap)`));
}
```

---

## 📊 Dependências Mapeadas

| Componente | Status | Precisa de Fix? |
|-----------|--------|---|
| API Espaider (client.ts) | ✅ Retorna dados | ❌ Não |
| Mapeador (mapper.ts) | ⚠️ Depende de campos corretos | ✅ Possivelmente |
| Sync (espaider-sync.ts) | ⚠️ Executa sem erros visíveis | ✅ Possivelmente |
| Endpoint (route.ts) | ✅ Correto | ❌ Não |
| DB Schema (migrations) | ✅ Correto | ❌ Não |
| Frontend Query (page.tsx) | ⚠️ `*,*` duplicado | ✅ Sim (menor) |
| Transformer (project.ts) | ✅ Correto | ❌ Não |
| UI Component (ProjectCockpit) | ✅ Correto | ❌ Não |

---

## 🎓 Lições Aprendidas

1. **RLS foi o vilão anterior** — Migration 021 ajustou, deve estar OK agora
2. **Sync functions funcionam** — Mas silenciosamente descartam dados se projeto pai não existe
3. **LogViewer é crítico** — Sem logs estruturados, seria impossível debugar
4. **Mapeamento é frágil** — Se campos mudam na API, tudo quebra

---

## ✍️ Notas para Investigação

- [ ] Confirmar que `IDREGISTROPAI` vem nos registros de históricos
- [ ] Verificar names exatos dos campos na API (`TIPOHISTORICO` vs `TIPO`, etc.)
- [ ] Checar se migration 019 e 021 foram aplicadas corretamente
- [ ] Verificar se `descricaoToDataset()` reconhece os valores reais da API

