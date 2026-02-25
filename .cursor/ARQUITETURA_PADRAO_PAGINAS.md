/**
 * @file ARQUITETURA PADRÃO - Criação de Novas Páginas/Módulos
 * @description Guia obrigatório para evitar erros de contexto e padrões
 * @version 1.0
 * @date 2026-02-24
 */

## 📋 CHECKLIST OBRIGATÓRIO — Criação de Nova Página/Módulo

### ✅ ANTES de criar `/app/novo-modulo/page.tsx`:

#### 1. **Layout Provider** (CRÍTICO)
```
Criar: /app/novo-modulo/layout.tsx
Padrão (CÓPIA obrigatória de /projetos/layout.tsx):

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';

export default function NovoModuloLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
```

**POR QUÊ?**
- `SidebarProvider` fornece contexto para `useSidebar()` hook
- Sem isso: "useSidebar must be used within a SidebarProvider" ❌
- SEMPRE colocar ANTES da página

#### 2. **Estrutura de Arquivo Padrão**
```
src/app/novo-modulo/
├── layout.tsx                    ⬅️ OBRIGATÓRIO (com SidebarProvider)
├── page.tsx                      ⬅️ Server Component (fetch data)
└── novo-modulo-content.tsx       ⬅️ Client Component ('use client')
```

#### 3. **page.tsx — Server Component**
```typescript
// Responsabilidades:
// ✅ Fetch data from Supabase/API
// ✅ Handle auth/redirect
// ✅ Pass data to client component
// ❌ Nunca use hooks (useState, useRouter)

export default async function NovoModuloPage() {
  const supabase = await createClient();
  
  // Get session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');
  
  // Fetch data
  const { data } = await supabase.from('table').select('*');
  
  // Pass to client
  return <NovoModuloContent initialData={data} />;
}
```

#### 4. **novo-modulo-content.tsx — Client Component**
```typescript
'use client';

// ✅ Use hooks, state, interactions
// ✅ Import UI components
// ❌ Não fetch data aqui (já vem do server)

export function NovoModuloContent({ initialData }) {
  const [filter, setFilter] = useState('');
  
  return (
    <div className="space-y-6">
      <DashboardHeader title="..." subtitle="..." />
      {/* Componentes */}
    </div>
  );
}
```

---

## 🎯 PADRÕES DE CONTEXTO (CRÍTICO)

### Context Providers Necessários

| Provider | Local | Uso |
|----------|-------|-----|
| **SidebarProvider** | `layout.tsx` da rota | Fornece `useSidebar()` |
| **Supabase** | `src/lib/supabase/client.ts` | Client-side queries |
| **React Query** | Em páginas c/ dados | State management |
| **Auth** | Via `getSession()` | User context |

### ✅ Ordem Correta de Componentes

```
layout.tsx (Server)
  └─ SidebarProvider
    ├─ AppSidebar
    └─ SidebarInset
      └─ page.tsx (Server)
        └─ *-content.tsx (Client)
```

---

## 🚫 ERROS COMUNS A EVITAR

### ❌ Erro 1: Sem Layout Provider
```
// ERRADO - página tenta usar useSidebar() mas não tem SidebarProvider
src/app/novo-modulo/page.tsx
// → useSidebar must be used within a SidebarProvider
```

**FIX:** Criar `src/app/novo-modulo/layout.tsx` com SidebarProvider

### ❌ Erro 2: Select com value=""
```tsx
// ERRADO - SelectItem não aceita value vazio
<SelectItem value="">Selecionar...</SelectItem>
// → React error #425
```

**FIX:** Use `value="null"` ou `value="no-type"`

### ❌ Erro 3: Fetch em Client Component
```tsx
// ERRADO - não pode usar async/await no client
'use client';
const data = await supabase.from('table').select(); // ❌
```

**FIX:** Fetch em page.tsx (server) e pass como prop

---

## 📐 EXEMPLO CORRETO — Novo Módulo Completo

### 1. `src/app/novo-modulo/layout.tsx`
```typescript
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';

export default function NovoModuloLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
```

### 2. `src/app/novo-modulo/page.tsx`
```typescript
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { NovoModuloContent } from './novo-modulo-content';

export default async function NovoModuloPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) redirect('/login');
  
  const { data } = await supabase
    .from('table')
    .select('*')
    .order('name', { ascending: true });
  
  return <NovoModuloContent initialData={data || []} />;
}
```

### 3. `src/app/novo-modulo/novo-modulo-content.tsx`
```typescript
'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Input } from '@/components/ui/input';

export function NovoModuloContent({ initialData }) {
  const [search, setSearch] = useState('');
  
  return (
    <div className="space-y-6">
      <DashboardHeader title="Novo Módulo" subtitle="Descrição..." />
      <Input 
        placeholder="Buscar..." 
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {/* Conteúdo */}
    </div>
  );
}
```

---

## 🔧 COMO APLICAR NO PROJETO

### Para /auxiliares (JÁ FEITO):
✅ `src/app/auxiliares/layout.tsx` — criado com SidebarProvider
✅ `src/app/auxiliares/agent-types/page.tsx` — server component
✅ `src/app/auxiliares/agent-types/agent-types-content.tsx` — client component

### Para FUTURAS páginas:
1. Copiar este template EXATAMENTE
2. Substituir `novo-modulo` pelo nome real
3. Adicionar `layout.tsx` SEMPRE
4. Fazer server/client split
5. Testar no dev antes de commit

---

## 📋 VALIDAÇÃO PRÉ-COMMIT

Antes de fazer commit de uma nova página:

```bash
# 1. Verificar estrutura
ls -la src/app/novo-modulo/
# Deve ter: layout.tsx, page.tsx, novo-modulo-content.tsx

# 2. Verificar SidebarProvider
grep -n "SidebarProvider" src/app/novo-modulo/layout.tsx

# 3. Verificar 'use client'
grep -n "'use client'" src/app/novo-modulo/novo-modulo-content.tsx

# 4. Rodar tests
npm run typecheck
npm run lint

# 5. Testar em dev
npm run dev
# Acessar http://localhost:3000/novo-modulo
```

---

## 🎓 REGRA DE OURO

**SEMPRE que criar nova página/rota:**

1. ✅ Criar `layout.tsx` com `SidebarProvider`
2. ✅ Separar server (`page.tsx`) de client (`-content.tsx`)
3. ✅ Não colocar hooks em `page.tsx`
4. ✅ Não fazer fetch em client component
5. ✅ Validar com `typecheck` + `lint`

**Se não seguir = ERROR 100%**

---

## 📌 REFERÊNCIA RÁPIDA

| Arquivo | Tipo | useSidebar? | useRouter? | useState? | async? |
|---------|------|-----------|-----------|----------|--------|
| layout.tsx | Server | ❌ N/A | ❌ | ❌ | ✅ |
| page.tsx | Server | ❌ | ❌ | ❌ | ✅ |
| -content.tsx | Client | ✅ | ✅ | ✅ | ❌ |

---

**Última atualização:** 2026-02-24
**Próxima revisão:** Ao adicionar novo módulo
