# Story 3.4 — Adicionar botão "Sincronizar" no módulo Cronogramas

Story ID: 3.4
Epic: Épico 3 — Cronogramas Ajustes Gerais
Sprint: 5 — Padronização de UI
Agente: @dev
Esforço: 2h
Prioridade: Alta
Status: Draft

## Como usuário

Como gestor visualizando cronogramas,
quero um botão "Sincronizar" disponível na página de Cronogramas,
para acionar manualmente a sincronização com o Espaider sem precisar ir até a página de Projetos.

## Contexto

O módulo Projetos possui um botão "Sincronizar" integrado ao `ProjectsFilters` que aciona `syncEspaiderAction` (Server Action). Os cronogramas são dados importados do ERP Espaider e dependem da mesma sincronização, mas o módulo Cronogramas não oferece esse controle ao usuário.

**Padrão a replicar:** `src/app/projetos/projects-content.tsx` + `src/app/projetos/components/ProjectsFilters.tsx`

**Recursos reutilizáveis:**
- `syncEspaiderAction` em `src/app/actions/sync.ts` — Server Action já funcional
- `feedback` de `src/lib/feedback.ts` — padrão de notificação (toast)
- Componentes `Button`, `Loader2`, `RefreshCw` de `lucide-react` e `shadcn/ui`

**Arquivos a modificar:**
1. `src/app/cronogramas/cronogramas-content.tsx` — adicionar estado `isSyncing` e handler `handleSync`
2. `src/app/cronogramas/components/CronogramaFilters.tsx` — adicionar props `isSyncing` e `onSync`, renderizar botão

## Critérios de aceite

- [ ] Um botão "Sincronizar" é exibido na página de Cronogramas ao lado da barra de filtros
- [ ] O botão mostra o texto "Sincronizar" com ícone `RefreshCw` no estado idle
- [ ] O botão mostra "Sincronizando..." com spinner `Loader2` durante a operação
- [ ] O botão fica desabilitado (`disabled`) durante a sincronização
- [ ] Ao clicar, `syncEspaiderAction()` é invocado (mesma action de Projetos)
- [ ] Feedback `feedback.info()` é exibido ao iniciar
- [ ] Feedback `feedback.success()` é exibido ao concluir com sucesso
- [ ] Feedback `feedback.error()` é exibido em caso de falha
- [ ] O botão retorna ao estado normal após conclusão (sucesso ou erro)
- [ ] `npm run lint` sem erros
- [ ] `npm run typecheck` sem erros de tipo

## Implementação necessária

### 1. Atualizar `cronogramas-content.tsx`

Adicionar imports:
```typescript
import { feedback } from '@/lib/feedback';
import { syncEspaiderAction } from '@/app/actions/sync';
```

Adicionar estado e handler dentro do componente `CronogramasContent`:
```typescript
const [isSyncing, setIsSyncing] = React.useState(false);

const handleSync = async () => {
  setIsSyncing(true);
  feedback.info('Iniciando sincronização com Espaider...');
  try {
    const result = await syncEspaiderAction();
    if (result.success) {
      feedback.success(result.message);
    } else {
      feedback.error(result.message);
    }
  } catch {
    feedback.error('Erro inesperado na sincronização. Tente novamente.');
  } finally {
    setIsSyncing(false);
  }
};
```

Passar props ao `CronogramaFilters`:
```tsx
<CronogramaFilters
  ...props existentes...
  isSyncing={isSyncing}
  onSync={handleSync}
/>
```

### 2. Atualizar `CronogramaFilters.tsx`

Adicionar imports:
```typescript
import { RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
```

Adicionar novas props à interface:
```typescript
interface CronogramaFiltersProps {
  ...props existentes...
  isSyncing: boolean;
  onSync: () => void;
}
```

Atualizar o JSX para envolver `FilterBar` com o botão (espelhando `ProjectsFilters.tsx`):
```tsx
return (
  <div className="flex items-start gap-3">
    <div className="min-w-0 flex-1">
      <div className="shrink-0 border-b bg-background px-6 py-4">
        <FilterBar ... />
      </div>
    </div>
    <Button
      variant="outline"
      size="sm"
      onClick={onSync}
      disabled={isSyncing}
      className="mt-4 mr-6 shrink-0 text-muted-foreground hover:text-foreground"
    >
      {isSyncing ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="mr-2 h-4 w-4" />
      )}
      <span className="sr-only sm:not-sr-only">
        {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
      </span>
    </Button>
  </div>
);
```

> Ajustar o posicionamento do `border-b` e padding conforme layout atual para não quebrar o visual existente.

## Dependências

- `src/app/actions/sync.ts` — já existe e funcional ✅
- `src/lib/feedback.ts` — já existe e funcional ✅
- Pode ser implementada em paralelo com 3.1, 3.2 e 3.3

## Definition of Done

- [ ] Botão Sincronizar visível e funcional em Cronogramas
- [ ] Estados idle/loading/disabled funcionando
- [ ] Feedback toast exibido corretamente
- [ ] `syncEspaiderAction` acionada corretamente
- [ ] Sem regressão nos filtros existentes
- [ ] `npm run lint` ✅
- [ ] `npm run typecheck` ✅

## File List

- `src/app/cronogramas/cronogramas-content.tsx` (MODIFICAR — adicionar isSyncing, handleSync, passar props)
- `src/app/cronogramas/components/CronogramaFilters.tsx` (MODIFICAR — adicionar props isSyncing/onSync e botão)
