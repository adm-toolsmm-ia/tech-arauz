# Build e Deploy — Quality Gates e Prevenção de Falhas

**Data:** 2026-03-08  
**Status:** Normativo  
**Epic:** Engenharia e Arquitetura

---

## 1. Objetivo

Este documento padroniza os **quality gates** obrigatórios antes de push/deploy e documenta os **erros comuns** que quebram o build na Vercel/CI. É a **fonte de verdade** para:

- Ordem e execução dos gates
- Erros típicos e como evitá-los
- Checklist para desenvolvedores e agentes AI

---

## 2. Quality Gates — Ordem Obrigatória

A ordem está definida em `configs/project.yaml` → `coding_standards.quality_gates`:

| Ordem | Comando | Propósito |
|-------|---------|-----------|
| 1 | `npm run lint` | ESLint — erros de código e acessibilidade |
| 2 | `npm run typecheck` | TypeScript — erros de tipo que quebram o build |
| 3 | `npm run test` | Testes unitários e integração |
| 4 | `npm run format:check` | Prettier — formatação consistente |
| 5 | `npm run sync:ide:check` | Validação de estrutura AIOS (quando aplicável) |
| 6 | `npm run build` | Build de produção (Next.js) |

**Regra:** Se qualquer gate falhar localmente, o deploy na Vercel falhará. Resolver antes de commitar.

### 2.1 Comando de Gate Local (PowerShell)

```powershell
npm run lint ; npm run typecheck ; npm run test ; npm run format:check ; npm run build
```

**Importante:** No Windows/PowerShell, usar `;` para encadear comandos. O `&&` não existe no PowerShell 5.x.

---

## 3. Erros Comuns e Soluções

### 3.1 Formatação (Prettier) — `format:check` falha

**Sintoma:** CI/Vercel falha com `[warn] src/...` em arquivos específicos.

**Causa:** Arquivos alterados sem rodar `npm run format` antes do commit.

**Solução:**

```bash
npm run format
```

Isso formata todos os arquivos em `src/**/*.{ts,tsx,js,jsx,css,md}`. Commitar as alterações geradas.

**Prevenção:** Configurar format-on-save no editor ou rodar `npm run format` antes de cada commit.

---

### 3.2 TypeScript — `null` vs `undefined` em props

**Sintoma:** `Type error: Type 'string | null' is not assignable to type 'string | undefined'`.

**Causa:** APIs como `URLSearchParams.get()` e `searchParams.get()` retornam `string | null`. Componentes (shadcn/ui, Radix) esperam `string | undefined`.

**NÃO fazer:**

```tsx
const tab = searchParams.get('tab');
<Tabs defaultValue={tab} />  // Erro: null não assignable
```

**Fazer:**

```tsx
const tab = searchParams.get('tab');
const defaultTab: string = tab && VALID_TABS.includes(tab) ? tab : 'sistemas';
<Tabs defaultValue={defaultTab} />
```

Ou: `defaultValue={value ?? undefined}` ou `defaultValue={value ?? 'fallback'}`.

**Referência:** `docs/architecture/module-standards.md` — Seção 13 (Type Safety).

---

### 3.3 ESLint — Regras de acessibilidade

**Sintoma:** `npm run lint` falha com avisos de jsx-a11y.

**Causa:** Elementos interativos sem `role`, `tabIndex` ou `onKeyDown`.

**Solução:** Seguir `docs/accessibility/component-a11y-guide.md`. Cards/linhas clicáveis devem ter `role="button"`, `tabIndex={0}` e `onKeyDown` para Enter/Space.

---

### 3.4 label-has-associated-control

**Sintoma:** `A form label must be associated with a control`.

**Causa:** Uso de `<label>` sem `htmlFor`+`id` ou sem envolvimento do controle.

**Soluções:**

- Input/Select nativo: `<Label htmlFor="id">` + `id` no controle
- Select customizado (Radix/shadcn): componente deve aceitar prop `id` e repassar ao trigger
- Grupo de botões: usar `<fieldset>` + `<legend>` em vez de `label`

**Referência:** `docs/accessibility/component-a11y-guide.md` — seção "Filtros e componentes customizados".

---

### 3.5 react-hooks/exhaustive-deps

**Sintoma:** `React Hook useEffect has a missing dependency: 'params'`.

**Causa:** Objeto usado no efeito mas apenas propriedades no array de deps.

**Soluções:**

- Preferir: incluir `params` e memoizar no chamador com `useMemo` quando necessário
- Alternativa: `eslint-disable-next-line` com justificativa quando as deps por valor forem intencionais

---

### 3.6 Build Next.js — Falha de memória ou timeout

**Sintoma:** Build trava ou falha com erro de memória na Vercel.

**Causa:** Projeto muito grande, dependências pesadas ou loops de import.

**Soluções:**

- Verificar imports circulares
- Considerar code splitting para rotas pesadas
- Aumentar memória no `vercel.json` se necessário (configuração avançada)

---

### 3.7 TypeScript — indexação em union types

**Sintoma:** `Element implicitly has an 'any' type because expression of type 'X' can't be used to index type 'A | B'. Property 'Y' does not exist on type 'A'`.

**Causa:** Indexar objeto com tipo union (ex.: `OrgDocumentation | Record<string, unknown>`) usando chave que não existe em todos os membros da union. Ex.: `step_by_step` existe em `OrgActivityDocumentation` mas não em `OrgDocumentation`.

**NÃO fazer:**

```tsx
const keys = ['step_by_step', 'guidelines'] as const;
keys.filter((k) => doc[k] && typeof doc[k] === 'string');  // Erro: Property 'step_by_step' does not exist
```

**Fazer:**

```tsx
const keys = ['step_by_step', 'guidelines'] as const;
keys.filter((k) => {
  const v = (doc as Record<string, unknown>)[k];
  return v != null && typeof v === 'string';
});
```

**Regra:** Ao iterar chaves dinâmicas em objeto com union, usar cast para `Record<string, unknown>` antes de indexar.

---

### 3.8 Variáveis de ambiente ausentes

**Sintoma:** Build passa, mas runtime falha com `undefined` em env vars.

**Causa:** Variáveis obrigatórias não configuradas na Vercel.

**Solução:** Garantir que todas as variáveis em `.env.example` estejam configuradas no projeto Vercel. Nunca commitar secrets.

---

## 4. Checklist Pré-Push (Gate de Workflow)

Antes de `git push` ou abrir PR:

- [ ] `npm run lint` — sem erros
- [ ] `npm run typecheck` — sem erros
- [ ] `npm run test` — todos passando
- [ ] `npm run format:check` — sem warnings
- [ ] `npm run build` — build concluído com sucesso

**Script sugerido (package.json):**

```json
"predeploy": "npm run lint && npm run typecheck && npm run test && npm run format:check"
```

Nota: No PowerShell local, usar `;` em vez de `&&` se rodar manualmente.

---

## 5. Integração CI/CD

O workflow `.github/workflows/ci.yml` executa, em ordem:

1. Lint  
2. Typecheck  
3. Format check  
4. Tests  
5. Audit secrets  
6. RLS audit (quando secrets disponíveis)  
7. **Build**

Se qualquer etapa falhar, o job inteiro falha. O build na Vercel segue o mesmo padrão (`next build` inclui typecheck).

---

## 6. Política para Agentes AI

Este documento é **normativo** para agentes que implementam código:

1. **Antes de concluir uma alteração:** Rodar `npm run lint ; npm run typecheck ; npm run format:check` no mínimo.
2. **Ao editar arquivos:** Garantir que a formatação esteja correta (ou rodar `npm run format`).
3. **Ao usar `searchParams.get()` ou similares:** Aplicar fallback para `string` antes de passar a props que esperam `string | undefined`.
4. **Exceções:** Documentar na story com justificativa técnica.

---

## 7. Referências

| Documento | Conteúdo |
|-----------|----------|
| `configs/project.yaml` | quality_gates.order, shell_chain |
| `docs/architecture/module-standards.md` | Seção 13 — Type Safety |
| `docs/accessibility/component-a11y-guide.md` | Acessibilidade em componentes |
| `.github/workflows/ci.yml` | Pipeline CI |
