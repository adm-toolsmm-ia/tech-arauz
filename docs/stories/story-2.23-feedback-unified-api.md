# Story 2.23 — feedback.tsx Unificado + Migração Projetos

Story ID: 2.23
Epic: PRD-UX-2026
Sprint: 3 — Qualidade e Consistência
Agente: @dev
Esforço: 4h
Prioridade: Média-Alta
Status: Done ✅

## Como usuário

Como desenvolvedor/agente AI que mantém o portal,
quero uma API unificada para feedback ao usuário (toasts),
para não usar `sonner.toast()` diretamente e garantir consistência visual e semântica.

## Contexto

O portal usava `sonner` diretamente em vários pontos com configurações inconsistentes
(duração, ícone, cor). Esta story cria `src/lib/feedback.tsx` como a única forma de
disparar toasts, e migra `projects-content.tsx` como referência de adoção.

## Critérios de aceite

- [x] `src/lib/feedback.tsx` criado com objeto `feedback` exportado como default
- [x] 8 métodos disponíveis: `success`, `error`, `info`, `warning`, `loading`, `dismiss`, `promise`
- [x] Ícones semânticos por tipo: CheckCircle2 (success), XCircle (error), Info (info), AlertTriangle (warning), Loader2 (loading)
- [x] Cores padronizadas: emerald (success), vermelho (error), azul (info), âmbar (warning)
- [x] Durações definidas: success/info 3s, warning 4s, error 5s
- [x] Método `promise<T>` para operações async (3 estados: loading → success/error)
- [x] Método `loading` retorna `toastId` para dismiss manual
- [x] `projects-content.tsx` migrado para usar `feedback` em vez de `toast` do sonner direto
- [x] Todas as notificações de sync em projetos usam `feedback.info`, `feedback.success`, `feedback.error`

## Implementação

### `src/lib/feedback.tsx`

```typescript
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Info, AlertTriangle, Loader2 } from 'lucide-react';

const feedback = {
  success: (message: string) => toast.success(message, { icon: <CheckCircle2 ... />, duration: 3000 }),
  error:   (message: string, detail?: string) => toast.error(message, { description: detail, icon: <XCircle ... />, duration: 5000 }),
  info:    (message: string) => toast.info(message, { icon: <Info ... />, duration: 3000 }),
  warning: (message: string) => toast.warning(message, { icon: <AlertTriangle ... />, duration: 4000 }),
  loading: (message: string) => toast.loading(message, { icon: <Loader2 ... /> }),
  dismiss: (id?: string | number) => toast.dismiss(id),
  promise: <T>(promise: Promise<T>, messages: { loading: string; success: string; error: string }) =>
    toast.promise(promise, messages),
};

export default feedback;
```

### `src/app/projetos/projects-content.tsx`

```typescript
import feedback from '@/lib/feedback';

// Antes:
// toast.info('Sincronizando...')
// toast.success('Sincronizado!')
// toast.error('Erro ao sincronizar')

// Depois:
feedback.info('Sincronizando projetos com o ERP...');
feedback.success('Projetos sincronizados com sucesso!');
feedback.error('Erro ao sincronizar', error.message);
```

## Regra de uso (documentada em design-system.md)

- **Toast (feedback global)**: operações que afetam dados persistidos, sync, erros de rede
- **Inline message**: validação de formulário, estado vazio, contexto local

## Definition of Done

- [x] `feedback.tsx` com 8 métodos
- [x] `projects-content.tsx` migrado
- [x] Sem chamadas diretas a `toast.*` nos módulos migrados
- [x] Build OK

## File List

- `src/lib/feedback.tsx` ✅ criado
- `src/app/projetos/projects-content.tsx` ✅ modificado (migrado para feedback)
