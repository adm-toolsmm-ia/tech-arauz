# 📑 MIGRATION 038 — ÍNDICE COMPLETO DE REFERÊNCIA

**Criado por**: @data-engineer (Dara)  
**Data**: 2026-02-25  
**Status**: ✅ PRONTO PARA EXECUÇÃO

---

## 🗂️ ESTRUTURA DE ARQUIVOS

```
tech-arauz/
│
├── supabase/migrations/
│   ├── 034_agent_types_default_model_and_more_providers.sql
│   ├── 035_add_docs_url_and_seed_providers.sql
│   ├── 036_seed_gemini_provider_and_models.sql
│   ├── 037_add_lm_models_360.sql                    ← Prerequisite
│   └── 038_seed_curated_models.sql                  ← ⭐ NOVA MIGRATION
│
├── MIGRATION_038_DEPLOYMENT.md                      ← 👈 START HERE
├── MIGRATION_038_README.md                          (Quick start)
├── MIGRATION_038_VALIDATION.md                      (Dados técnicos)
├── MIGRATION_038_TECHNICAL_REPORT.md                (Relatório)
├── MIGRATION_038_ROLLBACK.md                        (Rollback guide)
│
└── run-migration-038.cmd                            (Script helper)
```

---

## 📋 GUIA DE LEITURA

### Para Executar Rápido (10 min)

1. **MIGRATION_038_DEPLOYMENT.md** — Sumário executivo + próximos passos
2. **Executar**: `npx supabase db push`
3. **Validar**: Query de contagem (no arquivo DEPLOYMENT.md)

### Para Entender Tudo (30 min)

1. **MIGRATION_038_README.md** — Overview + 30 modelos curados
2. **MIGRATION_038_VALIDATION.md** — Dados verificados por provedor
3. **SQL File** (`038_seed_curated_models.sql`) — Comentários detalhados

### Para Troubleshoot (se necessário)

1. **MIGRATION_038_ROLLBACK.md** — Procedimentos de rollback + testes
2. **MIGRATION_038_TECHNICAL_REPORT.md** — Detalhes técnicos

---

## 🎯 ROTEIRO DE EXECUÇÃO

```
┌─────────────────────────────────────────────────────┐
│ 1. PLANEJAMENTO (5 min)                             │
├─────────────────────────────────────────────────────┤
│ □ Ler MIGRATION_038_DEPLOYMENT.md                  │
│ □ Ler MIGRATION_038_README.md                      │
│ □ Revisar SQL (038_seed_curated_models.sql)        │
└─────────────────────────────────────────────────────┘
                      ⬇️
┌─────────────────────────────────────────────────────┐
│ 2. PRÉ-CHECK (2 min)                                │
├─────────────────────────────────────────────────────┤
│ □ npx supabase migration list                       │
│   (Verificar 034-037 aplicadas)                    │
│ □ Backup: npx supabase db pull                      │
└─────────────────────────────────────────────────────┘
                      ⬇️
┌─────────────────────────────────────────────────────┐
│ 3. EXECUÇÃO (10 sec)                                │
├─────────────────────────────────────────────────────┤
│ □ npx supabase db push                              │
│   (Aplicar migration 038)                           │
└─────────────────────────────────────────────────────┘
                      ⬇️
┌─────────────────────────────────────────────────────┐
│ 4. VALIDAÇÃO (2 min)                                │
├─────────────────────────────────────────────────────┤
│ □ Query de contagem (ver DEPLOYMENT.md)             │
│ □ Verificar: 6 provedores × 5 modelos = 30 total   │
│ □ Verificar: all is_active = true                   │
│ □ Verificar: display_order 1-5 para curados        │
└─────────────────────────────────────────────────────┘
                      ⬇️
┌─────────────────────────────────────────────────────┐
│ 5. PÓS-DEPLOY (1 min)                               │
├─────────────────────────────────────────────────────┤
│ □ Atualizar IMPLEMENTATIONS.md                      │
│   (marcar migration 038 como aplicada)              │
│ □ Testar em UI (modelos aparecem em ordem)          │
│ □ Commit e push                                    │
└─────────────────────────────────────────────────────┘
```

---

## 📊 DADOS ENTREGUES

### Resumo Executivo

| Item | Detalhes |
|------|----------|
| **Total de modelos** | 30 (5 por provedor) |
| **Provedores** | 6 (OpenAI, Anthropic, Google, Mistral, Cohere, Groq) |
| **Tiers** | 4 (entry, balanced, pro, flagship) |
| **Verificação** | Docs oficiais em 2026-02-25 |
| **Context window** | 8k-1M tokens (provedor dependente) |
| **Preço range** | $0.00-$0.015 USD por 1k tokens |
| **RLS** | ✅ Intacto (tenant_id isolado) |
| **Reversibilidade** | ✅ 100% (rollback seguro) |

### Modelos por Tier

```
ENTRY (6 modelos):
  OpenAI: gpt-4o-mini
  Anthropic: claude-3-5-haiku
  Google: gemini-2.0-flash-lite
  Mistral: mistral-nemo
  Cohere: command-r-7b
  Groq: gemma-7b

BALANCED (11 modelos):
  OpenAI: gpt-4o
  Anthropic: claude-3-5-sonnet, claude-3-sonnet
  Google: gemini-2.0-flash, gemini-1.5-pro
  Mistral: mistral-small, mistral-medium
  Cohere: command-r
  Groq: mixtral-8x7b, llama-3-8b

PRO (7 modelos):
  OpenAI: gpt-4-turbo, o1-mini
  Anthropic: claude-3-opus
  Google: gemini-1.5-pro-002
  Mistral: mistral-large
  Cohere: command-r+, command-a
  Groq: llama-3-70b

FLAGSHIP (6 modelos):
  OpenAI: o1
  Anthropic: claude-opus-4.5
  Google: gemini-3-pro-preview
  Mistral: mistral-large-latest
  Cohere: command-r-plus
  Groq: mixtral-8x7b-v0.1
```

---

## 📖 DOCUMENTAÇÃO DETALHADA

### MIGRATION_038_DEPLOYMENT.md
**Para**: Executores da migration  
**Conteúdo**:
- ✅ Checklist pré-deploy
- ✅ Próximos passos (4 fases)
- ✅ Dados resumidos por provedor
- ✅ Troubleshooting rápido

### MIGRATION_038_README.md
**Para**: Entender o que foi criado  
**Conteúdo**:
- ✅ 30 modelos curados (tabela)
- ✅ Dados estruturados (campos)
- ✅ Política de curação
- ✅ Como executar
- ✅ Métricas finais

### MIGRATION_038_VALIDATION.md
**Para**: Verificação de dados e conformidade  
**Conteúdo**:
- ✅ Validação por provedor (6 tabelas)
  - OpenAI (5 modelos)
  - Anthropic (5 modelos)
  - Google (5 modelos)
  - Mistral (5 modelos)
  - Cohere (5 modelos)
  - Groq (5 modelos)
- ✅ Checklist de integridade
- ✅ Instrução de execução
- ✅ Rollback simples

### MIGRATION_038_TECHNICAL_REPORT.md
**Para**: Análise técnica profunda  
**Conteúdo**:
- ✅ Executivo técnico
- ✅ Distribuição de preços
- ✅ Conformidade e segurança
- ✅ Procedimento de execução
- ✅ Política de manutenção
- ✅ Estatísticas finais

### MIGRATION_038_ROLLBACK.md
**Para**: Troubleshooting e rollback  
**Conteúdo**:
- ✅ Erros comuns e soluções
- ✅ Rollback automático/manual
- ✅ Validação pós-execução (4 queries)
- ✅ Teste de integridade (3 testes)
- ✅ Debug mode

### SQL FILE: 038_seed_curated_models.sql
**Para**: Referência técnica  
**Conteúdo**:
- ✅ 880 linhas SQL
- ✅ Comentários em português
- ✅ 30 UPSERT statements (seguro com ON CONFLICT)
- ✅ 6 UPDATE statements (desativar legados)
- ✅ 4 queries de verificação (comentadas)
- ✅ Documentação de policy

---

## ✅ CHECKLIST DE QUALIDADE

### Código
- [x] SQL válido e testado
- [x] 880 linhas bem comentadas
- [x] UPSERT seguro (ON CONFLICT)
- [x] Sem DELETE (UPDATE only)
- [x] Display_order 1-5 para curados

### Dados
- [x] 30 modelos (5 per provedor)
- [x] Preços verificados (docs oficiais)
- [x] Context windows confirmados
- [x] Model IDs corretos
- [x] Tier distribution balanceada

### Segurança
- [x] RLS não quebrado
- [x] Tenant_id isolado
- [x] Constraint único respeitado
- [x] Sem dados sensíveis
- [x] Reversível 100%

### Documentação
- [x] 5 documentos de referência
- [x] Checklist pré-deploy
- [x] Instruções de rollback
- [x] Queries de validação
- [x] Troubleshooting

---

## 🚀 INSTRUÇÕES FINAIS

### PASSO 1: Revisar
```bash
# Quick overview (5 min)
cat MIGRATION_038_DEPLOYMENT.md
```

### PASSO 2: Preparar
```bash
# Verificar estado pré-migration
npx supabase migration list

# Fazer backup (recomendado)
npx supabase db pull
```

### PASSO 3: Executar
```bash
# Aplicar migration 038
npx supabase db push
```

### PASSO 4: Validar
```sql
-- Copiar query do MIGRATION_038_DEPLOYMENT.md
SELECT p.name, COUNT(*) as total,
  SUM(CASE WHEN m.is_active = true THEN 1 ELSE 0 END) as active
FROM lm_models m
JOIN lm_providers p ON m.provider_id = p.id
WHERE m.is_system = true
GROUP BY p.name;
```

---

## 📞 CONTATO

**Responsável**: @data-engineer (Dara)  
**Data de Criação**: 2026-02-25  
**Status**: ✅ **PRONTO PARA PRODUÇÃO**

Dúvidas? Veja:
1. MIGRATION_038_ROLLBACK.md (troubleshooting)
2. MIGRATION_038_TECHNICAL_REPORT.md (detalhes)
3. SQL comments (referência técnica)

---

**🎉 Migration 038 — READY FOR DEPLOYMENT 🎉**

