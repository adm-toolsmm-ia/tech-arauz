# Story 3.3 — Padronizar ícone Kanban entre módulos

Story ID: 3.3
Epic: Épico 3 — Cronogramas Ajustes Gerais
Sprint: 5 — Padronização de UI
Agente: @dev
Esforço: 30min
Prioridade: Alta (Quick Win — 1 linha)
Status: Draft

## Como usuário

Como usuário navegando entre os módulos Cronogramas e Projetos,
quero ver o mesmo ícone para a view Kanban em todos os módulos,
para ter uma experiência visual consistente e intuitiva.

## Contexto

O módulo Projetos usa `LayoutGrid` como ícone para a view Kanban.
O módulo Cronogramas usa `LayoutTemplate` — um ícone diferente que causa inconsistência visual entre módulos.

**Regra de padronização:** Todos os módulos devem usar `LayoutGrid` para representar a view Kanban.

**Localização do problema:** `src/lib/filters/filters-cronogramas.ts`, na definição do `filterRegistryCronogramas.viewModes`, entry `id: 'kanban'` (linha ~170).

**Referência correta:** `src/lib/filters/filters-projetos.ts` usa `LayoutGrid` para o viewMode `kanban`.

## Critérios de aceite

- [ ] O ícone da view Kanban no módulo Cronogramas é `LayoutGrid` (importado de `lucide-react`)
- [ ] O import de `LayoutTemplate` é removido de `filters-cronogramas.ts` (ou mantido apenas se usado em outro filtro)
- [ ] O import de `LayoutGrid` é adicionado a `filters-cronogramas.ts`
- [ ] O ícone exibido na FilterBar de Cronogramas para a tab Kanban é visualmente idêntico ao de Projetos
- [ ] Nenhuma funcionalidade é alterada (apenas o ícone)
- [ ] `npm run lint` sem erros
- [ ] `npm run typecheck` sem erros de tipo

## Implementação necessária

### 1. Editar `src/lib/filters/filters-cronogramas.ts`

**Mudança no import (início do arquivo):**

Substituir `LayoutTemplate` por `LayoutGrid` nos imports de `lucide-react`:
```typescript
// ANTES
import {
  Building2, CheckCircle2, Users, Calendar, List,
  CalendarDays, LayoutTemplate, BarChartHorizontal,
  AlertCircle, Clock, AlertTriangle,
} from 'lucide-react';

// DEPOIS (verificar se LayoutTemplate ainda é usado em outro filtro)
import {
  Building2, CheckCircle2, Users, Calendar, List,
  CalendarDays, LayoutGrid, BarChartHorizontal,
  AlertCircle, Clock, AlertTriangle,
} from 'lucide-react';
```

> **Atenção:** `LayoutTemplate` também está no filtro `fase_atividade` (linha ~115). Verificar e manter o import se necessário, apenas substituindo no viewMode kanban.

**Mudança no viewMode kanban:**
```typescript
// ANTES
{
  id: 'kanban',
  label: 'Kanban',
  icon: LayoutTemplate,
},

// DEPOIS
{
  id: 'kanban',
  label: 'Kanban',
  icon: LayoutGrid,
},
```

### 2. Verificação do filtro `fase_atividade`

O filtro `fase_atividade` usa `LayoutTemplate` como ícone. Verificar se essa associação de ícone faz sentido semântico ou se também deve ser substituída. Se mantido, adicionar `LayoutGrid` ao import junto com `LayoutTemplate`.

## Dependências

- Independente — pode ser implementada em paralelo com 3.1 e 3.2

## Definition of Done

- [ ] Ícone Kanban é `LayoutGrid` em todos os módulos
- [ ] Import atualizado (sem imports desnecessários de `LayoutTemplate`)
- [ ] Consistência visual validada entre Cronogramas e Projetos
- [ ] `npm run lint` ✅
- [ ] `npm run typecheck` ✅

## File List

- `src/lib/filters/filters-cronogramas.ts` (MODIFICAR — trocar ícone kanban de LayoutTemplate para LayoutGrid)
