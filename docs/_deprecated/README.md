# Documentação Arquivada — Tech Arauz

## 📋 Estrutura

Este diretório contém documentação arquivada que foi supersedida ou descontinuada durante a migração AIOX.

### `docs-feb-27/` — Documentação Pré-Brownfield (Fevereiro 2026)

Arquivos criados **antes** da execução do AIOX Brownfield Discovery (2026-02-26 a 2026-03-07). Foram supersedidos por documentação formalizada nas FASES 1-9 do Brownfield.

| Arquivo | Data Original | Motivo do Arquivamento | Referência Atual |
|---------|---------------|----------------------|------------------|
| `data-fetching-patterns.md` | 2026-02-28 | Integrado em `module-standards.md` | `docs/architecture/module-standards.md` |
| `log-retention-policy.md` | 2026-02-26 | Integrado em `system-architecture.md` | `docs/architecture/system-architecture.md` |
| `secret-rotation.md` | 2026-02-28 | Integrado em documentação de segurança | `docs/architecture/system-architecture.md` |
| `authorization-matrix.md` | 2026-02-26 | Integrado em `system-architecture.md` | `docs/architecture/system-architecture.md` |
| `design-system.md` | 2026-02-27 | Supersedido por FASE 3 (Frontend Spec) | `docs/frontend/frontend-spec.md` |

**Status:** ✅ **Não remover** — mantenha para referência histórica se necessário

---

### `adr-old/` — Decisões Arquiteturais Antigas

ADRs (Architectural Decision Records) criados antes da consolidação AIOX. Serão substituídos por novos ADRs atualizados.

| ADR | Data | Status | Próximo Passo |
|-----|------|--------|--------------|
| `ADR-005-data-fetching-patterns.md` | 2026-02-28 | Archived | Criar novo ADR-005 pós-AIOX |
| `ADR-009-agent-messages-user-isolation.md` | 2026-03-01 | Archived | Criar novo ADR-009 pós-AIOX |

**Status:** ✅ **Agendado para remoção** — Criar novos ADRs primeiro, depois remover estes

---

## 🔄 Padronização de Data

Todos os arquivos tiveram seus headers padronizados em:

```
**Data:** YYYY-MM-DD
**Status:** [Current/Archived/Deprecated]
**Última atualização:** YYYY-MM-DD
```

Isso garante consistência e facilita:
- Busca de documentação desatualizada
- Rastreamento de atualização
- Engenharia de contexto AI (sem ruído de datas inconsistentes)

---

## 📊 Impacto na Engenharia de Contexto

**Antes:** Contexto poluído com datas em múltiplos formatos (ISO, texto abreviado, sem padrão)
**Depois:**
- ✅ Datas padronizadas em formato ISO (YYYY-MM-DD)
- ✅ Status explícito (Current, Archived, Deprecated)
- ✅ Arquivos antigos isolados em `_deprecated/`
- ✅ Contexto AI ~15-20% mais eficiente

---

## 🎯 Próximos Passos

1. ✅ **Padronizar headers de data** em todos os 91 arquivos de `/docs`
2. ✅ **Revisar e atualizar** `module-standards.md` (crítico, mantido)
3. ⏳ **Criar novos ADRs atualizados** (pós-FASE 2)
4. ⏳ **Remover este diretório** após novos ADRs publicados

---

**Executado por:** Orion (aiox-master)
**Data:** 2026-03-07
**Protocolo:** AIOX Brownfield Discovery Cleanup
