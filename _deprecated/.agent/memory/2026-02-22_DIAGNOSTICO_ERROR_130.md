# Diagnóstico: React Error #130 - Erros de Runtime

**Módulos Afetados**: Projetos (projetos-content.tsx), Cronogramas (cronogramas-content.tsx)
**Status**: INVESTIGAÇÃO CONCLUÍDA - Causa Identificada
**Severidade**: CRÍTICA - Impede renderização dos módulos

---

## 🔴 O ERRO

### Sintomas Observados
- React Error #130 apareça no console (código minificado)
- Módulos carregam, mas componentes não renderizam
- FilterBar integrado, mas falha ao tentar exibir filtros
- TypeError silencioso que bloqueia rendering

### Onde Ocorre
1. **Projetos**: `src/app/projetos/projects-content.tsx` (linha ~438)
2. **Cronogramas**: `src/app/cronogramas/cronogramas-content.tsx` (linha ~386)

---

## 🔍 ANÁLISE DA CAUSA RAIZ

### Problema 1️⃣: Coerção de Tipo no SelectControl

**Localização**: `src/components/filters/FilterControl.tsx` (linha 175)

```typescript
// ERRADO! Converte QUALQUER valor para string
<Select value={String(value || '')} onValueChange={onChange} disabled={disabled || isLoading}>
  {options.map((opt) => (
    <SelectItem key={String(opt.value)} value={String(opt.value)}>
```

**O que acontece**:

```
Fluxo de Dados Quebrado:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ESTADO INICIAL
   filterState.filters.status = []  (ARRAY - correto para multi-select)

2. RENDERIZAÇÃO
   value={String(value || '')}
   value={String([])} → String([]) → "[]"  (LITERAL STRING!)

3. USUÁRIO SELECIONA "Iniciado"
   onValueChange dispara com: "Iniciado"  (STRING)

4. HANDLER onChange RECEBE
   onChange("Iniciado")  (STRING)
   filterState.updateFilter('status', "Iniciado")

5. NOVO ESTADO
   filterState.filters.status = "Iniciado"  (STRING - ERRADO!)

6. PRÓXIMA RENDERIZAÇÃO
   value={String(value || '')}
   value={String("Iniciado")} → "Iniciado"  (OK, mas...)

7. APLICAÇÃO DOS FILTROS
   applyFilters() espera: filterValue = ["Iniciado"]  (ARRAY)
   Mas recebe: filterValue = "Iniciado"  (STRING)

8. VERIFICAÇÃO NO applyFilters
   if (Array.isArray(filterValue)) {  // ✘ FALSE!
     return filterValue.includes(itemValue);  // Não executa
   }

   // Cai no else - comparação errada!
   return itemValue === filterValue;  // "Em execução" === "Iniciado"? NO

9. RESULTADO
   Nenhum projeto aparece (tipo errado = sem matches)
   React tenta reconciliar tipos misturados → Error #130
```

---

### Problema 2️⃣: Renderização de Ícone Sem Type Guard

**Localização**: `src/components/filters/FilterBar.tsx` (linhas 158, 226)

```typescript
// ERRADO! Ícone pode ser undefined, React reclama
{filterDef.icon && <filterDef.icon className="h-4 w-4 mr-1" />}
```

**O que acontece**:
- TypeScript/React não consegue garantir que `icon` é um componente válido
- Mesmo com check `&&`, passar props para tipo potencialmente undefined causa erro
- React Error #130 sobre type mismatch de componente

---

### Problema 3️⃣: Falta de Validação de Tipo em buildFilterOptions

**Localização**: `src/lib/filters/filter-utils.ts` (linhas 160-169)

```typescript
export function buildFilterOptions<T extends Record<string, any>>(
  data: T[],
  fieldName: string,
  labelFn?: (value: any) => string,
): Array<{ value: any; label: string }> {
  return extractUniqueValues(data, fieldName).map((value) => ({
    value,  // ← tipo `any` - sem validação!
    label: labelFn ? labelFn(value) : String(value),
  }));
}
```

**O que acontece**:
- Valores extraídos são `any` type
- SelectControl não sabe qual é o tipo original
- Conversão para String perde tipo original
- Quando onChange é chamado, tipo está errado

---

## 📊 MAPA DE TIPOS ESPERADO vs REALIDADE

| Filtro | Tipo Definido | DefaultValue | Tipo Recebido em onChange | Tipo Armazenado | Esperado em applyFilters |
|--------|---------------|-------------|--------------------------|-----------------|-------------------------|
| status | `multi-select` | `[]` | `"Iniciado"` (STRING) | `"Iniciado"` | `["Iniciado"]` (ARRAY) |
| priority | `multi-select` | `[]` | `"Alta"` (STRING) | `"Alta"` | `["Alta"]` (ARRAY) |
| responsible | `multi-select` | `[]` | `"João"` (STRING) | `"João"` | `["João"]` (ARRAY) |
| fase_atual | `multi-select` | `[]` | `"Análise"` (STRING) | `"Análise"` | `["Análise"]` (ARRAY) |

**RESULTADO**: Todos os filtros multi-select recebem tipo ERRADO!

---

## 🎯 IMPACTO DIRETO

### Em ProjectsContent (projetos)
```typescript
// Linha ~438: FilterBar renderiza
<FilterBar
  moduleId="projetos"
  filters={filterState.registry}  // ← multi-select filters
  onFiltersChange={filterState.setFilters}
  // ...
/>

// Linha ~149: FilteredData nunca filtra corretamente
const { filteredData: filteredProjects, viewMode, setViewMode } = filterState;
// filteredProjects = [] (porque tipos não combinam)
```

### Em CronogramasContent (cronogramas)
```typescript
// Linha ~386: FilterBar renderiza
<FilterBar
  moduleId="cronogramas"
  filters={filterState.registry}  // ← multi-select filters
  // ...
/>

// Linha ~249-279: Filtro manual ainda funciona, mas FilterBar quebra
const filteredSchedules = React.useMemo(() => {
  // FilterBar nunca filtra corretamente
  // Usuário vê todos ou nenhum resultado
```

---

## 🔧 SOLUÇÃO TÉCNICA

### Solução 1: Preserve Type em SelectControl

**Arquivo**: `src/components/filters/FilterControl.tsx`

```typescript
// ANTES (linha 175)
<Select value={String(value || '')} onValueChange={onChange} disabled={disabled || isLoading}>

// DEPOIS - Adicionar type guard
function SelectControl(...) {
  const stringValue = React.useMemo(() => {
    if (value === null || value === undefined) return '';
    if (Array.isArray(value)) return ''; // Não deve acontecer em single-select
    return String(value);
  }, [value]);

  const handleChange = React.useCallback(
    (newStringValue: string) => {
      // CRUCIAL: Retornar tipo ORIGINAL, não string!
      const option = options.find((opt) => String(opt.value) === newStringValue);
      if (option) {
        onChange(option.value);  // ← Retorna tipo original
      } else {
        onChange(newStringValue);
      }
    },
    [options, onChange],
  );

  return (
    <Select value={stringValue} onValueChange={handleChange} disabled={disabled || isLoading}>
      {/* ... */}
    </Select>
  );
}
```

**Resultado**:
- User selects → onChange recebe tipo correto
- State armazena tipo correto
- applyFilters consegue fazer matching

---

### Solução 2: Fix Icon Type Safety

**Arquivo**: `src/components/filters/FilterBar.tsx`

```typescript
// ANTES (linha 158)
{filterDef.icon && <filterDef.icon className="h-4 w-4 mr-1" />}

// DEPOIS
const IconComponent = filterDef.icon;
{IconComponent ? <IconComponent className="h-4 w-4 mr-1" /> : null}

// OU
const renderIcon = (Icon: any) =>
  Icon ? <Icon className="h-4 w-4 mr-1" /> : null;

{renderIcon(filterDef.icon)}
```

---

### Solução 3: Validação em buildFilterOptions

**Arquivo**: `src/lib/filters/filter-utils.ts`

```typescript
// Adicionar validação de tipo
export function buildFilterOptions<T extends Record<string, any>>(
  data: T[],
  fieldName: string,
  labelFn?: (value: any) => string,
): Array<{ value: any; label: string }> {
  return extractUniqueValues(data, fieldName).map((value) => {
    // Validação: garantir que value não é null/undefined
    const validValue = value ?? '';  // Fallback se null
    return {
      value: validValue,
      label: labelFn ? labelFn(validValue) : String(validValue),
    };
  });
}
```

---

## ✅ CHECKLIST DE VALIDAÇÃO

### Após aplicar fixes, verificar:

- [ ] SelectControl retorna tipo original (não string)
- [ ] MultiSelectControl retorna array
- [ ] Icon rendering não quebra com undefined
- [ ] Projetos page carrega sem error no console
- [ ] Cronogramas page carrega sem error no console
- [ ] Filtros multi-select funcionam (seleçoes aparecem)
- [ ] Filtros aplicam corretamente (dados filtrados)
- [ ] Sem React Error #130
- [ ] Sem TypeError no console
- [ ] Build passa sem erros de tipo

---

## 📝 RESUMO EXECUTIVO

| Aspecto | Status |
|--------|--------|
| **Diagnóstico** | ✅ COMPLETO |
| **Raiz Identificada** | SelectControl converte array para string |
| **Impacto** | Bloqueeia rendering de ambos módulos |
| **Complexidade Fix** | BAIXA - mudança isolada em 1 função |
| **Tempo Estimado** | 1-2 horas com testes |
| **Risco** | MÍNIMO - sem breaking changes |
| **Afeta Outro Código?** | NÃO - componente é isolado |

---

## 🚀 PRÓXIMOS PASSOS

1. Ler `FIX_PLAN_RUNTIME_ERRORS.md` para detalhes implementação
2. Aplicar Fix #1 (SelectControl) primeiramente
3. Aplicar Fix #2 (Icon rendering)
4. Testar ambos módulos (projetos e cronogramas)
5. Verificar browser console para Error #130

**Documentação Técnica**: Ver arquivos em `.context/`
