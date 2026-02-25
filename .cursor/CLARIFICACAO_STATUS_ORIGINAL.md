# Status do Projeto — Clarificação e Documentação

**Data:** 2025-02-25  
**Commit:** e3e1c78

---

## Problema Identificado

O código tinha **dois campos de status** para projeto na tabela `projects`:

1. **`status_original`** — Métrica verificada (correto para usar)
2. **`situacao_original`** — Status bruto DEPRECATED (nunca usar em código novo)

A query em `page.tsx` estava usando `situacao_original` (DEPRECATED), causando confusão sobre qual campo realmente usar.

---

## Solução Aplicada

### 1. **Atualizar Query** (page.tsx)

```diff
- status:situacao_original
+ status:status_original

+ // NOTE: usando status_original (métrica verificada)
+ // Ver .cursor/GLOSSARIO_CAMPOS.md para distinção
```

### 2. **Criar Glossário de Campos** (novo arquivo)

Arquivo `.cursor/GLOSSARIO_CAMPOS.md` documenta:

- ✅ `status_original` — USAR ESTE (métrica verificada)
- ❌ `situacao_original` — DEPRECATED (status bruto)
- Distinção entre `project.status_original` vs `schedule.status` (cronograma)
- Padrão seguro de comparação: `trim().toLowerCase()`
- Referências cruzadas

### 3. **Atualizar Comentários no Código**

- `CronogramaGantt.tsx`: Adicionado `@see GLOSSARIO_CAMPOS.md`
- `page.tsx`: Adicionado nota sobre qual campo usar

### 4. **Referenciar em Padrões**

- `PADRAO_COMPONENTES_AGENTES.md`: Adicionado link ao glossário

---

## Para Toda a Equipe

### Sempre Use Este Padrão

```typescript
// ✅ CORRETO — Usar status_original
const status = (project.status_original || '').trim().toLowerCase();

if (status === 'em execução' || status === 'iniciado') {
  // Include in Gantt
}
```

### Nunca Use

```typescript
// ❌ INCORRETO — status bruto (DEPRECATED)
const s = project.situacao_original;

// ❌ INCORRETO — comparação sem normalização
if (project.status_original === 'Em Execução') { }
```

---

## Referência Rápida

| Campo | Use Para | Localização |
|-------|----------|-------------|
| `project.status_original` | ✅ Lógica de negócio | Métrica verificada |
| `project.situacao_original` | ❌ NUNCA | Status bruto (DEPRECATED) |
| `schedule.status` | ✅ Status da atividade | Cronograma (diferente de projeto) |

---

## Impacto

- ✅ Gantt agora busca projetos com `status_original` correto
- ✅ Documentação clara para novos desenvolvedores
- ✅ Evita bugs futuros de confusão entre campos
- ✅ Padrão único em toda a codebase

---

## Validação

- ✅ Lint: Sem erros
- ✅ Typecheck: Sem erros
- ✅ Commit: e3e1c78

---

## Próximo Passo

Validar Gantt com dados reais agora que está usando `status_original` correto:
1. Abra `/cronogramas` em ambiente de desenvolvimento
2. DevTools → Console
3. Procure por logs: `[CronogramaGantt] Project statuses found:`
4. Anote os valores encontrados

Se ainda vazio: revisar se há projetos com status "iniciado" ou "em execução" no banco.
