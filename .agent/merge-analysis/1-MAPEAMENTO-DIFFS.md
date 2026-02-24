# Mapeamento de Diffs — GitHub vs Local

**Data:** 2026-02-23
**Status:** Análise em Execução

---

## 1. AGENTES — Comparação

### 12 Agentes Base (ambos têm)

| Agente | GitHub | Local | Versão | Ação |
|--------|--------|-------|--------|------|
| aios-master | ✅ | ✅ | ? → ? | Comparar |
| analyst | ✅ | ✅ | ? → ? | Comparar |
| architect | ✅ | ✅ | ? → ? | Comparar |
| data-engineer | ✅ | ✅ | ? → ? | Comparar |
| dev | ✅ | ✅ | ? → ? | Comparar |
| devops | ✅ | ✅ | ? → ? | Comparar |
| pm | ✅ | ✅ | ? → ? | Comparar |
| po | ✅ | ✅ | ? → ? | Comparar |
| qa | ✅ | ✅ | ? → ? | Comparar |
| sm | ✅ | ✅ | ? → ? | Comparar |
| squad-creator | ✅ | ✅ | ? → ? | Comparar |
| ux-design-expert | ✅ | ✅ | ? → ? | Comparar |

### 3 Agentes Novos (Local apenas)

| Agente | GitHub | Local | Status | Ação |
|--------|--------|-------|--------|------|
| frontend | ❌ | ✅ | Novo | MANTER + Generalizar |
| mobile | ❌ | ✅ | Novo | MANTER + Generalizar |
| security | ❌ | ✅ | Novo | MANTER + Generalizar |

---

## 2. TASKS — Contagem

| Métrica | GitHub | Local | Delta |
|---------|--------|-------|-------|
| Total tasks | 203 | ~206 | +3 |
| Tasks novas | — | ~3 | Identificar |

### Tasks Novas (Local)
A identificar: Quais 3 tasks foram adicionadas?

---

## 3. CONFIGURAÇÃO — Arquivos Críticos

| Arquivo | GitHub | Local | Versão | Ação |
|---------|--------|-------|--------|------|
| constitution.md | ✅ | ✅ | 1.0.0 = 1.0.0 | KEEP local (idêntico) |
| core-config.yaml | ✅ | ✅ v2.1.0 | ? → 2.1.0 | Comparar e merge |
| .coderabbit.yaml | ✅ | ? | ? → ? | Verificar |
| package.json | ✅ | ? | ? → ? | Comparar |

---

## 4. IDE INTEGRATIONS

| Pasta | GitHub | Local | Ação |
|-------|--------|-------|------|
| .claude/ | ✅ | ✅ | Manter local (tech-arauz) |
| .cursor/ | ✅ | ✅ | Comparar |
| .codex/ | ✅ | ✅ | Comparar |
| .gemini/ | ✅ | ✅ | Comparar |

---

## 5. TECH-ARAUZ SPECIFIC (PRESERVAR SEMPRE)

| Pasta | Descrição | Ação |
|-------|-----------|------|
| `.claude/CLAUDE.md` | Regras Supabase, Espaider, Tech Stack | ✅ PRESERVAR |
| `.claude/rules/` | Story lifecycle, Agent authority, IDS, etc | ✅ PRESERVAR |
| `supabase/` | Migrations, schema | ✅ PRESERVAR |
| `src/integrations/espaider/` | ERP integration | ✅ PRESERVAR |
| `docs/architecture/` | Arquitetura projeto | ✅ PRESERVAR |
| `.env.example` | Variáveis projeto | ✅ PRESERVAR |

---

## 6. Estratégia de Merge Identificada

### Para 12 Agentes Base
```
1. Fazer diff: GitHub agente vs Local agente
2. Se IDÊNTICO → Keep local
3. Se GitHub mais recente → Sobrescrever
4. Se Local é melhoria → MANTER e considerar PR GitHub
```

### Para 3 Agentes Novos (Local)
```
→ MANTER garantido
→ Não existem no GitHub
→ Generalizar e enviar PR
```

### Para Configs
```
constitution.md → Keep local (idêntico)
core-config.yaml → Merge intelligently (puxar novos valores do GitHub, manter local customizations)
IDE configs → Comparar
```

### Para Tech-arauz Specific
```
→ SEMPRE PRESERVAR
→ Override qualquer versão GitHub
→ Backup antes
```

---

## 7. Próximas Ações

### Fase 2: Diffs Detalhados
- [ ] Comparar linha-por-linha cada agente
- [ ] Identificar tasks novas (qual é a #204, #205, #206?)
- [ ] Checar core-config.yaml diffs

### Fase 3: Execução
- [ ] Backup `.aios-core`
- [ ] Copiar GitHub base
- [ ] Manter melhorias local
- [ ] Validar

---

*Mapeamento inicial completo — Pronto para Fase 2: Diffs*
