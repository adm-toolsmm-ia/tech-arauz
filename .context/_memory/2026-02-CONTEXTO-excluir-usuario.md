# Contexto: Implementação de Excluir Usuário

> **Data**: 2026-02-21  
> **Status**: Implementado  
> **Para**: Nova janela Composer (manter contexto)

## Objetivo

Implementar exclusão de usuário pelo front-end na gestão de usuários (`/cadastros/usuarios`), com qualidade 10/10.

## Decisões já aprovadas (análise anterior)

- **Banco**: `profiles` tem `REFERENCES auth.users(id) ON DELETE CASCADE` — ao deletar no Auth, profile é removido automaticamente. Nenhuma migration necessária.
- **Segurança**: Gate admin-only; validar tenant do alvo; bloquear autodeleção (`userId === session.userId`).
- **UX**: AlertDialog de confirmação obrigatório; toast; aria-labels; design system (variant destructive).

## Escopo de implementação

### 1. Backend (`src/app/cadastros/usuarios/actions.ts`)
- Nova action `deleteUser(userId: string): Promise<UserActionState>`
- Reutilizar: `requireAdminSession()`, `verifyTargetBelongsToTenant()`
- Bloquear autodeleção
- Chamar `supabase.auth.admin.deleteUser(userId)`
- Mensagens seguras para UI; log técnico no servidor

### 2. Frontend (`src/app/cadastros/usuarios/components/UsersTable.tsx`)
- Item "Excluir usuário" no dropdown de ações (ícone Trash2)
- Estado `userToDelete: TenantUser | null`
- AlertDialog (shadcn) para confirmação
- Chamar `deleteUser` → toast → revalidate/refresh
- Ocultar ou desabilitar Excluir para o próprio usuário (precisa passar `currentUserId` do contexto)

### 3. Obter currentUserId na UsersTable
- A page é Server Component; `getTenantUsers` retorna só usuários. Para saber se é o próprio usuário, precisamos passar o `userId` do admin logado para o `UsersTable`. Opções:
  - (A) A page chama `getCurrentUser()` ou similar e passa `currentUserId` para UsersTable
  - (B) A action `deleteUser` já bloqueia autodeleção; na UI podemos desabilitar "Excluir" se tivermos o ID. Para ter o ID na client, a page precisa passar. A action `getTenantUsers` não retorna o userId do admin atual. Solução: criar `getCurrentUserId()` ou incluir no retorno de `getTenantUsers` um campo `currentUserId` opcional. Mais simples: a page busca o user atual (createClient + getUser) e passa como prop. Ou: `deleteUser` retorna erro específico "Não é possível excluir a si mesmo" e a UI apenas mostra toast — sem precisar de currentUserId no client. O usuário só vê o erro ao clicar. Para melhor UX, desabilitar o botão para o próprio usuário exige saber quem é. A page é Server Component: ela pode obter o user id via `createClient().auth.getUser()` e passar `currentUserId` para UsersTable. Vou adotar isso.

### 4. Documentação
- Atualizar RT-002B em `.context/02-rules/routines.md` (subfluxo Excluir usuário)
- Opcional: ADR-005 menção

## Arquivos a alterar
- `src/app/cadastros/usuarios/actions.ts` — adicionar deleteUser
- `src/app/cadastros/usuarios/components/UsersTable.tsx` — item Excluir + AlertDialog
- `src/app/cadastros/usuarios/page.tsx` — passar currentUserId para UsersTable (se adotar UX de desabilitar)
- `.context/02-rules/routines.md` — subfluxo excluir

## Padrões do projeto
- Imports `@/`
- Named exports
- Tipagem explícita (UserActionState, TenantUser)
- Design system: variant destructive, cn(), tokens semânticos
- Acessibilidade: aria-label, role="alert" em erros

---

## O que foi implementado (2026-02-21)

- **actions.ts**: `deleteUser(userId)` com requireAdminSession, verifyTargetBelongsToTenant, bloqueio de autodeleção; `getTenantUsers` passou a retornar `currentUserId`
- **page.tsx**: passa `currentUserId` para UsersTable
- **UsersTable.tsx**: item "Excluir Usuário" no dropdown; Dialog de confirmação; desabilita Excluir para o próprio usuário; router.refresh() após sucesso
- **routines.md**: subfluxo "Excluir Usuário" documentado em RT-002B
