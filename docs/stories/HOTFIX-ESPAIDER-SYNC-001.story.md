# HOTFIX-001: Corrigir Sincronização Espaider — Erros Silenciosos + Logs Desaparecidos

**Priority:** 🔴 CRÍTICA (bloqueando produção)
**Type:** Bug Fix (2 problemas sistêmicos)
**Framework:** AIOX 10/10 (Story-Driven Development)
**Status:** ⏳ READY FOR DEVELOPMENT
**Created:** 2026-03-19

---

## 🎯 Goal

Restaurar funcionalidade crítica de sincronização Espaider corrigindo 2 falhas:
1. **Erro #1:** Mensagens de erro vazias ("1 erros" sem detalhes)
2. **Erro #2:** Logs recentes desaparecem (Histórico só mostra 07/03)

**Resultado esperado:**
- ✅ Sincronização retorna mensagens de erro DETALHADAS e acionáveis
- ✅ Logs recentes aparecem em "Histórico de Sincronizações"
- ✅ SUPOR.00429/26 sincroniza corretamente
- ✅ Zero erros em lint, typecheck, build, test

---

## 📋 Context

**Onde tudo quebrou:**
- Commit 604b1a7: Removeu HorasLancadas como API standalone
- Commit a1c535f: Limpou referências restantes sem atualizar `descricaoToDataset()`
- **Resultado:** Sincronização retorna erros silenciosos desde 07/03

**Sintomas em Produção:**
1. Ao clicar "Sincronizar tudo" em `/integracoes`: `"Sincronização parcial: 0 novos, 0 atualizados, 1 erros em 0.5s"`
   - Sem mensagem detalhada sobre qual é o erro
   - Sem stack trace
   - Sem contexto sobre qual dataset falhou

2. Tab "Histórico de Sincronizações": Só mostra logs antigos (07/03)
   - Nenhum log recente após sincronizações atuais
   - Implica que `persistLogEntries()` está falhando silenciosamente

**Análise Técnica:**
- **Arquivo principal:** `/src/lib/sync/espaider-sync.ts`
  - Linha 893: Segunda chamada à API Espaider retorna HTML error (não JSON)
  - Linha 996: `msg` fica vazio quando erro é HTML
  - Linha 1029: `persistLogEntries()` não valida sucesso do insert
  - Linha 1042: Retorna `logs` mas pode estar vazio

- **2 Tabelas de Logs:**
  - `sync_logs` (resumo de sincronização)
  - `integration_log_entries` (detalhes — é a que não está sendo preenchida)

---

## ✅ Acceptance Criteria

### Erro #1: Mensagens Detalhadas
- [ ] Ao syncerror de API, mensagem inclui:
  - [ ] Nome específico do erro (ex: "ConnectionError", "TokenExpired", "Timeout")
  - [ ] Detalhes do token (ex: "Token pode estar inválido/expirado")
  - [ ] Tipo de erro interno
- [ ] Try/catch melhorado em `espaider-sync.ts:888-915` está implementado
- [ ] `createLog()` captura `errorType` e `tokenStatus`

### Erro #2: Logs Recentes Aparecem
- [ ] `persistLogEntries()` valida insert bem-sucedido
- [ ] Se error no insert: exception é lançada (não silenciosa)
- [ ] Tabela `integration_log_entries` tem dados recentes após sincronização
- [ ] Tab "Histórico" mostra logs com timestamps de hoje/recentes
- [ ] Filtros funcionam: dataset, level, startDate, endDate

### Code Quality
- [ ] `npm run lint` → ✅ PASS
- [ ] `npm run typecheck` → ✅ PASS
- [ ] `npm run build` → ✅ PASS
- [ ] `npm run test` → ✅ PASS (se há testes)
- [ ] Zero console.error() sem re-throw

### Validação End-to-End
- [ ] Sincronização local testa sem erros
- [ ] SUPOR.00429/26 aparece em `/projetos` após sync
- [ ] Deploy para Vercel automático
- [ ] Produção testa com sucesso

---

## 📝 Tasks Executáveis

### Task 1: Validar Correção #1 e Estado Atual
**Tempo:** 10 min | **Complexidade:** Trivial

- [ ] Ler `/src/lib/sync/espaider-sync.ts` (linhas 888-915)
- [ ] Confirmar que try/catch foi implementado
- [ ] Validar que `createLog()` captura detalhes
- [ ] Verificar git diff para mudanças pendentes

**Arquivos:**
- `src/lib/sync/espaider-sync.ts` (read only)

---

### Task 2: Implementar Correção #2 — Validação em persistLogEntries()
**Tempo:** 20 min | **Complexidade:** Baixa

**O que fazer:**
Reforçar `persistLogEntries()` para validar que insert foi bem-sucedido.

**Localização:** `/src/lib/sync/espaider-sync.ts` (linhas ~1388-1421, função `persistLogEntries`)

**Mudanças:**
```typescript
// ANTES (linhas 1410-1415):
const { error } = await insert();
if (error) {
  console.error('Error persisting logs:', error);
}

// DEPOIS (adicionar validação):
const { error, count } = await insert();
if (error) {
  const msg = `Falha ao salvar ${logs.length} logs em integration_log_entries: ${error.message}`;
  console.error(msg);
  throw new Error(msg);  // ← Importante: não silenciar!
}
if (!count || count === 0) {
  throw new Error(`Nenhum log foi inserido (esperado: ${logs.length})`);
}
console.log(`✅ ${count} logs persistidos com sucesso`);
```

**Verificação:**
- [ ] Erro no insert lança exception (não silencioso)
- [ ] Success retorna contagem de logs inseridos
- [ ] Nenhum `console.error()` sem re-throw

**Arquivos:**
- `src/lib/sync/espaider-sync.ts` (edit)

---

### Task 3: Testes Locais
**Tempo:** 15 min | **Complexidade:** Média

**Setup:**
```bash
npm run dev
# Abrir http://localhost:3000
```

**Testes:**
1. [ ] Navegar para `/integracoes`
2. [ ] Clicar "Sincronizar tudo"
3. [ ] Validar resultado:
   - [ ] Se sucesso: "Sincronização: X novos, Y atualizados em Zs"
   - [ ] Se erro: Mensagem específica (ex: "Token inválido", "Timeout na API")
4. [ ] Verificar Supabase tabela `integration_log_entries`:
   - [ ] Novos logs com timestamps recentes
   - [ ] Campos preenchidos: `tenant_id`, `level`, `dataset`, `message`, `logged_at`
5. [ ] Navegar tab "Histórico de Sincronizações":
   - [ ] Mostrar logs de hoje (não apenas 07/03)
   - [ ] Filtros funcionam
6. [ ] Procurar SUPOR.00429/26 em `/projetos`:
   - [ ] Se encontrado: ✅ Sincronização OK
   - [ ] Se não: ❌ Investigar mensagem de erro
7. [ ] Executar quality gates:
   ```bash
   npm run lint      # → PASS
   npm run typecheck # → PASS
   npm run build     # → PASS
   npm test          # → PASS (se houver)
   ```

**Arquivos para teste:**
- None (local testing only)

---

### Task 4: Commit + Push
**Tempo:** 5 min | **Delegado:** @devops

**Pré-requisitos:**
- [ ] Todas as tasks 1-3 ✅ completas
- [ ] Testes locais ✅ passam
- [ ] `npm run lint` ✅ PASS
- [ ] `npm run typecheck` ✅ PASS
- [ ] `npm run build` ✅ PASS

**Commit:**
```bash
git add src/lib/sync/espaider-sync.ts
git commit -m "fix: Resolver 2 problemas críticos de sincronização Espaider

- Problema 1: Mensagens de erro vazias em falhas de API
  → Adicionado try/catch detalhado (linhas 888-915) com captura de erro melhorada

- Problema 2: Logs recentes não aparecem no Histórico
  → Adicionada validação em persistLogEntries() para confirmar insert bem-sucedido

Ambas as correções garantem que:
✅ Erros detalhados aparecem na sincronização
✅ Logs recentes aparecem em 'Histórico de Sincronizações'
✅ SUPOR.00429/26 sincroniza corretamente

Fixes: sync-error-details, sync-logs-missing"
```

**Push:** Delegar para `@devops *push` (Gage)

**Arquivos:**
- `src/lib/sync/espaider-sync.ts` (commit)

---

### Task 5: Validação em Produção
**Tempo:** 10 min | **Pós-deploy**

**Setup:**
- Aguardar deploy automático em Vercel
- Acessar https://tech-arauz.vercel.app

**Validações:**
1. [ ] `/integracoes` carrega sem erro
2. [ ] Botão "Sincronizar tudo" funciona
3. [ ] Resultado é claro (sucesso ou erro específico)
4. [ ] "Histórico de Sincronizações" mostra logs recentes
5. [ ] SUPOR.00429/26 aparece em `/projetos`

**Se tudo OK:** ✅ **MISSÃO CUMPRIDA**
**Se houver erro:** ❌ Voltar para Task 3 (investigar)

---

## 📊 File List

**Arquivos a Modificar:**
- [ ] `src/lib/sync/espaider-sync.ts` (Correção #2: persistLogEntries)

**Arquivos de Referência (read-only):**
- `src/lib/sync/espaider-sync.ts` (Correção #1: já implementado)
- `src/app/api/integracoes/logs/route.ts` (API de logs)
- `src/components/integracoes/LogViewer.tsx` (UI de histórico)
- `.aiox/plans/groovy-tinkering-prism.md` (plano técnico)

---

## 🔗 Plano Técnico Detalhado

Referência: `.aiox/plans/groovy-tinkering-prism.md`

Este story implementa a Fase 1-5 do plano em formato AIOX story executável.

---

## 📌 Notas

- **Crítico:** Ambas as correções são interdependentes — Erro #2 causa invisibilidade de Erro #1
- **Risco:** Se insert falhar, ninguém vê o erro (raiz de Task 2)
- **Validação:** SUPOR.00429/26 é o test case de referência — se sincronizar, tudo está OK
- **Deploy:** Vercel automation faz push automático — só precisa de commit local

---

**Story criada por River (Scrum Master) — 2026-03-19**
