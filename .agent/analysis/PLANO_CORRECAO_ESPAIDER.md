# 🎯 PLANO DE CORREÇÃO: Gestão 360° — Históricos & Aprovadores

**Status**: 🔴 CRITICAL
**Data**: 2026-02-21
**Objetivo**: Habilitar visualização de históricos, aprovadores e orçamentos no módulo de projetos

---

## 📊 Análise Resumida

### Fluxo Completo Mapeado
```
API Espaider (✅ Retorna dados)
    ↓
Fetch via exportarDados() + buscarFilhos() (✅ Funciona)
    ↓
Mapeador (⚠️ Depende de estrutura correta)
    ↓
Sync Functions (⚠️ Executam sem erros visíveis)
    ↓
BD Project_Histories/Approvers (❓ Dados chegarão?)
    ↓
Query em Projetos (⚠️ Busca relações)
    ↓
Transformer (✅ Converte para UI)
    ↓
ProjectCockpit (✅ Renderiza se dados existirem)
```

### Status Atual
- ✅ Projetos aparecem no frontend
- ✅ Entregas e Cronogramas funcionam
- ❌ **Históricos NÃO aparecem**
- ❌ **Aprovadores NÃO aparecem**
- ⚠️ Endpoint `/api/integracoes/sync` retorna sucesso mas há bloqueio silencioso

---

## 🔍 Causas Prováveis (Prioridade)

### 1️⃣ CRÍTICA — Campos da API com Nomes Diferentes
**Probabilidade**: 🔴 Alta
**Impacto**: Todo o fluxo de mapeamento falha silenciosamente

**Problema**: Se `TIPOHISTORICO` ou `RESPONSAVEL_PARA` **não existem** nos registros da API, `getCampoValor()` retorna `''` → todos os campos ficam vazios.

**Verificação**:
```bash
# No backend, logar a estrutura real
const { ListaRegistros } = await buscarFilhos(urlFilho.URL);
console.log(JSON.stringify(ListaRegistros[0], null, 2));
```

---

### 2️⃣ ALTA — IDREGISTROPAI Ausente ou Zerado
**Probabilidade**: 🟡 Média
**Impacto**: Históricos/aprovadores são descartados (.filter falha)

**Problema**: Se `IDREGISTROPAI` é `0` ou `null` → `projectMap.has(0)` falha → nada é inserido.

**Verificação**:
```sql
-- Verificar se há históricos sendo ignorados
SELECT COUNT(*) FROM integration_log_entries
WHERE dataset='Historicos' AND message LIKE '%ignorados%';
```

---

### 3️⃣ ALTA — dataset NÃO está sendo detectado
**Probabilidade**: 🟡 Média
**Impacto**: URLs filhas não são reconhecidas, sincronização é pulada

**Problema**: `descricaoToDataset()` só detecta se `Descricao` contém exatamente "histórico", "aprovador", etc.

**Verificação**:
```
LogViewer → procurar por "Interface filha não reconhecida"
```

---

### 4️⃣ MÉDIA — RLS Policies Bloqueando INSERTs
**Probabilidade**: 🟠 Baixa (Migration 021 corrigiu)
**Impacto**: Sync executa mas dados não são persistidos

**Status**: Migration 021 criou `FOR ALL TO service_role` corretamente.

---

### 5️⃣ MÉDIA — Constraint UNIQUE Não Configurado
**Probabilidade**: 🟠 Baixa (Migration 019 recriou)
**Impacto**: Upsert falha silenciosamente

**Status**: Migration 019 criou constraint `UNIQUE(tenant_id, espaider_id)`.

---

## 🚀 PLANO DE AÇÃO — 7 STEPS

### STEP 1: Diagnóstico Rápido (❌ → 🔍)
**Tempo**: 30 min
**Owner**: Você ou @data-engineer

**Ações**:
1. [ ] Executar sincronização via botão "Sincronizar" no frontend
2. [ ] Abrir `/integracoes` → LogViewer
3. [ ] Procurar por logs com `dataset='Historicos'` ou `dataset='Aprovadores'`
4. [ ] Verificar:
   - ✅ "Interface filha encontrada"? → Detectou dataset
   - ✅ "X registros recebidos"? → Quantos vieram da API
   - ✅ "Y criados, Z atualizados"? → Foram inseridos?
   - ❌ "Interface filha não reconhecida"? → Problema na detecção
   - ❌ "Erro no upsert"? → Constraint ou RLS bloqueando
   - ❌ "X registros ignorados (projeto pai não encontrado)"? → IDREGISTROPAI=0

**Output**: Screenshot do LogViewer com todos os logs da sync.

---

### STEP 2: Validar Estrutura Real da API (🤔 → ✅)
**Tempo**: 20 min
**Owner**: @dev ou @data-engineer

**Ações**:
1. [ ] Criar arquivo `test-api-structure.js` na raiz:
```javascript
// test-api-structure.js
const { exportarDados, buscarFilhos } = require('./src/integrations/espaider/client.ts');

(async () => {
  try {
    // 1. Fetch projects + ListaURLFilhos
    const projResponse = await exportarDados({
      identificador: 'BI_SOLICITACOES_PROJETOSESPAIDER'
    });

    console.log('=== ListaURLFilhos ===');
    console.log(JSON.stringify(projResponse.ListaURLFilhos, null, 2));

    // 2. Para cada URL filha
    for (const urlFilho of (projResponse.ListaURLFilhos || [])) {
      const dataset = urlFilho.Descricao || urlFilho.Identificador;
      if (!dataset || !dataset.toLowerCase().includes('histórico')) continue;

      console.log(`\n=== Buscando ${dataset} ===`);
      const childResponse = await buscarFilhos(urlFilho.URL);

      if (childResponse.ListaRegistros.length > 0) {
        console.log('Primeiro registro:');
        console.log(JSON.stringify(childResponse.ListaRegistros[0], null, 2));
      }
    }
  } catch (err) {
    console.error('Erro:', err);
  }
})();
```

2. [ ] Executar: `node test-api-structure.js` (ou `npx ts-node` se TypeScript)
3. [ ] Copiar output → analisar estrutura real dos campos

**Output**: JSON com estrutura real da API, nomes exatos dos campos.

---

### STEP 3: Revisar Nomes de Campos (📝 → ✅)
**Tempo**: 20 min
**Owner**: Você (comparar com output STEP 2)

**Mapeamento Esperado** (conforme mapper.ts):
```
Históricos:
  - IDREGISTROPAI → project parent ID
  - TIPOHISTORICO → tipo
  - RESPONSAVEL_PARA → responsavel_para
  - RESPONSAVEL_DE → responsavel_de
  - PASSO_PARA → passo_para
  - PASSO_DE → passo_de
  - NUMEROTRAMITE → numero_tramite
  - MENSAGEM → mensagem
  - DATA_DE ou DATA → data

Aprovadores:
  - IDREGISTROPAI → project parent ID
  - TIPO → tipo
  - RESPONSAVEL → responsavel
  - PONTOSATENCAO → pontos_atencao
```

**Ações**:
1. [ ] Comparar com output STEP 2
2. [ ] Se nomes DIFERENTES → criar mapa de alias
3. [ ] Se campos FALTANDO → adicionar alternativas no mapeador

**Output**: Documento com nomes exatos dos campos na API.

---

### STEP 4: Corrigir Mapeador (se necessário)
**Tempo**: 20 min
**Owner**: @dev

**Se campos estão com nomes diferentes**:

**Arquivo**: `src/integrations/espaider/mapper.ts`

```typescript
// ANTES:
function getCampoValor(campos: CampoEspaider[], identificador: string): string {
    const campo = campos.find((c) => c.Identificador === identificador);
    const v = campo?.Valor;
    return v != null ? String(v) : '';
}

// DEPOIS (com fallback):
function getCampoValor(
    campos: CampoEspaider[],
    identificador: string,
    fallbacks?: string[]
): string {
    // Tenta identificador principal
    let campo = campos.find((c) => c.Identificador === identificador);

    // Se não encontrou, tenta fallbacks
    if (!campo && fallbacks) {
        for (const fb of fallbacks) {
            campo = campos.find((c) => c.Identificador === fb);
            if (campo) break;
        }
    }

    const v = campo?.Valor;
    return v != null ? String(v) : '';
}
```

**Atualizar mapearHistorico()** e **mapearAprovador()** com fallbacks reais.

---

### STEP 5: Melhorar Detecção de Dataset
**Tempo**: 15 min
**Owner**: @dev

**Arquivo**: `src/lib/sync/espaider-sync.ts:617`

```typescript
function descricaoToDataset(descricao: string | null | undefined): EspaiderDataset | null {
  if (!descricao) return null;
  const normalized = descricao.toLowerCase().trim();

  // Adicionar variações de linguagem
  if (normalized.includes('entrega') || normalized.includes('delivery')) return 'Entregas';
  if (normalized.includes('cronograma') || normalized.includes('schedule') || normalized.includes('atividade')) return 'Cronogramas';
  if (normalized.includes('requisito') || normalized.includes('requirement')) return 'Requisitos';

  // ✨ CRÍTICO: Múltiplas variações para históricos
  if (normalized.includes('histórico') ||
      normalized.includes('historico') ||
      normalized.includes('history') ||
      normalized.includes('moviment') ||
      normalized.includes('tramite')) return 'Historicos';

  // ✨ CRÍTICO: Múltiplas variações para aprovadores
  if (normalized.includes('aprovador') ||
      normalized.includes('approver') ||
      normalized.includes('aprovacao') ||
      normalized.includes('approval')) return 'Aprovadores';

  if (normalized.includes('orçamento') || normalized.includes('orcamento') || normalized.includes('budget') || normalized.includes('valor')) return 'Orcamentos';

  return null;
}
```

---

### STEP 6: Adicionar Logging Melhorado
**Tempo**: 20 min
**Owner**: @dev

**Arquivo**: `src/lib/sync/espaider-sync.ts:1082-1090`

```typescript
async function syncHistoriesFromRegistros(...) {
  const start = Date.now();
  let created = 0;
  let updated = 0;
  let errors = 0;

  try {
    // ✨ Log: Dados mapeados
    const mapped = mapearRegistros(registros, mapearHistorico);
    logs.push(createLog('info', 'Historicos', `${registros.length} registros brutos → ${mapped.length} mapeados`));

    if (mapped.length === 0) {
      logs.push(createLog('warn', 'Historicos', '⚠️ Nenhum histórico foi mapeado — verificar se campos da API estão corretos'));
      return { dataset: 'Historicos', total: 0, created: 0, updated: 0, errors: 0, durationMs: Date.now() - start };
    }

    const projectMap = await getProjectIdMap(supabase, tenantId);

    // ✨ Log: Validação de projeto pai
    const orphans = mapped.filter(r => !projectMap.has(r.projeto_id_espaider));
    if (orphans.length > 0) {
      logs.push(createLog('warn', 'Historicos',
        `⚠️ ${orphans.length} registros serão ignorados (projeto pai não encontrado). IDs: ${orphans.map(r => r.projeto_id_espaider).join(', ')}`
      ));
    }

    const { data: existing } = await supabase
      .from('project_histories')
      .select('espaider_id')
      .eq('tenant_id', tenantId);
    const existingIds = new Set((existing || []).map((r) => r.espaider_id));

    const rows = mapped
      .filter((r) => projectMap.has(r.projeto_id_espaider))
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

    // ✨ Log: Antes do upsert
    logs.push(createLog('info', 'Historicos', `Preparando upsert de ${rows.length} registros`));

    if (rows.length > 0) {
      const { error } = await supabase
        .from('project_histories')
        .upsert(rows, { onConflict: 'tenant_id,espaider_id' });

      if (error) {
        logs.push(createLog('error', 'Historicos', `❌ Erro no upsert: ${error.message}`, {
          code: error.code,
          details: error.details,
          hint: error.hint
        }));
        errors = rows.length;
      } else {
        for (const row of rows) {
          if (existingIds.has(row.espaider_id)) updated++;
          else created++;
        }
        logs.push(createLog('success', 'Historicos', `✅ Upsert concluído: ${created} novos, ${updated} atualizados`));
      }
    } else {
      logs.push(createLog('warn', 'Historicos', 'Nenhum registro a inserir após filtros'));
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    logs.push(createLog('error', 'Historicos', `❌ Falha no processamento: ${msg}`, {
      stack: err instanceof Error ? err.stack : undefined
    }));
    errors++;
  }

  return { dataset: 'Historicos', total: created + updated + errors, created, updated, errors, durationMs: Date.now() - start };
}
```

**Aplicar o mesmo para `syncApproversFromRegistros()` e `syncBudgetsFromRegistros()`**.

---

### STEP 7: Testar Fluxo Completo (🧪 → ✅)
**Tempo**: 30 min
**Owner**: Você + @qa

**Ações**:
1. [ ] Deploy de todas as correções (STEPS 4-6)
2. [ ] Executar sincronização novamente
3. [ ] Verificar LogViewer:
   - ✅ "Interface filha encontrada" para Históricos?
   - ✅ "X registros recebidos"?
   - ✅ "Y criados, Z atualizados"?
4. [ ] Abrir um projeto → Verificar tabs de Histórico/Aprovadores/Orçamentos
5. [ ] Dados aparecem? ✅ → DONE!
6. [ ] Dados não aparecem? → Voltar para STEP 1 com novos logs

---

## 📋 CHECKLIST DE EXECUÇÃO

### Preparação
- [ ] Fazer backup do banco (snapshots Supabase)
- [ ] Verificar que migrations 019, 020, 021 foram aplicadas
- [ ] Confirmar RLS policies estão criadas corretamente

### Investigação (STEPS 1-3)
- [ ] STEP 1: Executar sync e coletar logs
- [ ] STEP 2: Validar estrutura real da API
- [ ] STEP 3: Documentar nomes exatos dos campos

### Correção (STEPS 4-6)
- [ ] STEP 4: Corrigir mapeador (se necessário)
- [ ] STEP 5: Melhorar detecção de dataset
- [ ] STEP 6: Adicionar logging melhorado

### Validação (STEP 7)
- [ ] STEP 7: Testar fluxo completo
- [ ] Verificar que históricos aparecem no UI
- [ ] Verificar que aprovadores aparecem no UI
- [ ] Verificar que orçamentos aparecem no UI
- [ ] Executar testes de regressão (Entregas, Cronogramas ainda funcionam?)

### Documentação
- [ ] Atualizar `.agent/memory/` com lições aprendidas
- [ ] Documentar nomes reais dos campos Espaider
- [ ] Atualizar README sobre integração Espaider

---

## 🎓 Artefatos Gerados

1. **DEBUG_ESPAIDER_FLOW_2026-02-21.md** — Análise completa do fluxo
2. **PLANO_CORRECAO_ESPAIDER.md** — Este documento
3. **Logs do LogViewer** — Screenshot com detalhes da última sync
4. **test-api-structure.js** — Script para validar estrutura da API

---

## 💡 Próximas Ações

1. **Você executa STEP 1** → Enviar screenshot do LogViewer
2. **Com base em logs** → Decidir qual STEP executar próximo
3. **@data-engineer pode fazer STEP 2** em paralelo se tiver acesso à API
4. **@dev implementa STEPS 4-6** após confirmação de problema

---

## 🤝 Permissões Necessárias

| Ação | Agente | Permissão |
|------|--------|-----------|
| Executar sync | Você | `POST /api/integracoes/sync` |
| Ler LogViewer | Você | `GET /api/integracoes/logs` |
| Acessar API Espaider | @data-engineer | Credenciais DB |
| Modificar código | @dev | Git commit + push (via @devops) |
| Deploy | @devops | CI/CD access |

---

## 🚨 Contingência

Se durante investigação descobrir que:

### ❌ Problema é no mapeador (campos não existem)
→ Adicionar fallbacks em `getCampoValor()`

### ❌ Problema é RLS (bloqueando INSERTs)
→ Revisar Migration 021, confirmar `WITH CHECK (true)`

### ❌ Problema é query (não está buscando relações)
→ Verificar que `select()` inclui `:project_histories(*)`, etc.

### ❌ Problema é constraint (upsert falhando)
→ Recriar constraint via migration nova (024_fix_constraints.sql)

---

## 📞 Escalação

Se após todos os STEPs problema persistir:
1. Contatar Espaider support → Confirmar estrutura de dados da API
2. Revisar migrations manualmente no Supabase console
3. Executar FULL RESYNC com logging em nível de DEBUG

---

**Pronto para começar? Vamos ao STEP 1!** 🚀
