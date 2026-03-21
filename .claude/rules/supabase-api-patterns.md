# Supabase + API Routes Engineering Patterns

**Documento:** Padrões de engenharia validados para evitar erros comuns
**Criado:** 2026-03-21 (Story 17.1 — Erro de build corrigido)
**Tipo:** Engineering Reference (não remover)
**Paths:** `src/app/api/**/*.ts`, Supabase integrations

---

## 🚨 Lições Aprendidas

### Erro 1: textSearch — Tipo 'plainto' Inválido

**O que aconteceu:**
```typescript
// ❌ ERRADO
query = query.textSearch('search_vector', filters.search, {
  type: 'plainto',  // ← ERRO: tipo não existe em Supabase
  config: 'portuguese',
});
```

**Erro TypeScript:**
```
Type '"plainto"' is not assignable to type '"plain" | "phrase" | "websearch" | undefined'
```

**Causa:** `plainto_tsquery` é o nome PostgreSQL, mas Supabase API espera `'plain'`

**Solução:**
```typescript
// ✅ CORRETO
query = query.textSearch('search_vector', filters.search, {
  type: 'plain',  // ← Use 'plain' (não 'plainto')
  config: 'portuguese',
});
```

**Lição:** Sempre verificar tipos do Supabase Client TypeScript (`@supabase/supabase-js`) — não usar nomes internos PostgreSQL

---

## 📋 Padrões Validados para API Routes

### Pattern 1: Auth + Tenant Context

**Padrão obrigatório em TODAS as rotas protegidas:**

```typescript
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // Step 1: Auth check
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', statusCode: 401, timestamp: new Date().toISOString() },
        { status: 401 }
      );
    }

    // Step 2: Get tenant from profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found', statusCode: 400, timestamp: new Date().toISOString() },
        { status: 400 }
      );
    }

    const tenantId = profile.tenant_id;

    // Step 3: Use tenantId in all queries
    // ... rest of implementation
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', statusCode: 500, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
```

**Verificação:**
- [ ] Sempre chamar `createClient()` para server client (com cookies)
- [ ] Sempre verificar `authError` antes de acessar `user`
- [ ] Sempre filtrar por `tenant_id` em queries (belt-and-suspenders com RLS)
- [ ] Sempre envolver em try-catch com logging

---

### Pattern 2: Query Building (Composable)

**Não fazer queries inline — construir com variáveis:**

```typescript
// ✅ BOM
let query = supabase.from('documents').select('*');
query = query.eq('tenant_id', tenantId);
query = query.eq('is_published', true);

if (filters.category) {
  query = query.eq('category', filters.category);
}

if (filters.search) {
  query = query.textSearch('search_vector', filters.search, {
    type: 'plain',  // ← ALWAYS: use 'plain', 'phrase', or 'websearch'
    config: 'portuguese',
  });
}

const { data, error } = await query.limit(50);
```

**Por quê?**
- Légível e debugável
- Fácil de adicionar filtros condicionais
- Evita erros de concatenação

---

### Pattern 3: Supabase textSearch Types

**Tipos válidos para `textSearch` (CONFIRMADO):**

| Type | Uso |
|------|-----|
| `'plain'` | Pesquisa simples com OR (padrão, recomendado) |
| `'phrase'` | Buscar frase exata |
| `'websearch'` | Sintaxe tipo Google (operadores AND, OR, NOT) |
| `undefined` | Same as 'plain' |

**NUNCA USE:**
- ❌ `'plainto'` — PostgreSQL internal name, not exposed in Supabase API
- ❌ `'tsquery'` — PostgreSQL function
- ❌ `'phraseto_tsquery'` — PostgreSQL function

**Referência:** https://supabase.com/docs/reference/javascript/textsearch

---

### Pattern 4: Response Type Safety

**Sempre tipificar responses com TypeScript interfaces:**

```typescript
// src/types/api.ts
export interface SuccessResponse<T> {
  data: T;
  timestamp: string;
}

export interface ErrorResponse {
  error: string;
  statusCode: number;
  timestamp: string;
}

// Em route.ts
export async function GET(
  request: NextRequest
): Promise<NextResponse<SuccessResponse<DocumentList> | ErrorResponse>> {
  // ...
  return NextResponse.json({ data: result, timestamp: new Date().toISOString() });
}
```

**Benefício:** TypeScript catching nos consumidores da API

---

### Pattern 5: Keyset (Cursor) Pagination

**Para datasets grandes, use keyset pagination:**

```typescript
// ❌ EVITAR: offset pagination (N+1 problem, duplicates with concurrent edits)
const { data } = await query.range(offset, offset + limit);

// ✅ USAR: keyset pagination
let query = supabase.from('documents').select('*').order('created_at', { ascending: false });

if (cursor) {
  const [cursorDate] = cursor.split(':');
  query = query.lt('created_at', cursorDate);  // ← Less than cursor
}

const { data } = await query.limit(limit + 1);  // ← Fetch +1 to check hasMore

// Check if there are more results
const hasMore = data.length > limit;
const results = data.slice(0, limit);

// Generate next cursor
const nextCursor = hasMore ? `${results[results.length - 1].created_at}:${results[results.length - 1].id}` : null;
```

**Por quê?**
- Consistente com concurrent updates (não pula/duplica records)
- Melhor performance (não precisa contar todos)
- Padrão em APIs modernas (Stripe, GitHub)

---

### Pattern 6: Error Handling in Supabase

**Supabase retorna `error` em vez de lançar exceção:**

```typescript
// ❌ ERRADO
const result = await supabase.from('table').select('*');
// Se erro, result.data = null, result.error = { ... }
// Sem check, vai crashear

// ✅ CORRETO
const { data, error } = await supabase.from('table').select('*');

if (error) {
  console.error('Query error:', error);
  return NextResponse.json(
    { error: 'Database error', statusCode: 500, timestamp: new Date().toISOString() },
    { status: 500 }
  );
}

// Agora safe usar data
```

**Verificação:**
- [ ] Sempre destructure `{ data, error }`
- [ ] Sempre check `if (error)` antes de usar `data`
- [ ] Console.error para logging (para Vercel logs)
- [ ] Retornar 500 com mensagem genérica ao cliente

---

### Pattern 7: Caching Headers

**Configure cache apropriado por tipo de dados:**

```typescript
// Dados que mudam raramente (1 min)
response.headers.set('Cache-Control', 'max-age=60, stale-while-revalidate=300');

// Dados em tempo real (sem cache)
response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');

// Dados estáticos (1 hora)
response.headers.set('Cache-Control', 'public, max-age=3600, immutable');
```

**Sugestões:**
- Graph data: 60s (slow-changing)
- Document list: 30s (user might add docs)
- View count: no-cache (counter)
- Metadata: 300s (very stable)

---

### Pattern 8: RLS Best Practices

**Always assume RLS is second defense — add tenant_id checks in code too:**

```typescript
// ❌ ERRADO: Confiar só em RLS
const { data } = await supabase.from('documents').select('*').eq('id', docId);

// ✅ CORRETO: Double-check tenant isolation in code
const { data } = await supabase
  .from('documents')
  .select('*')
  .eq('id', docId)
  .eq('tenant_id', profile.tenant_id)  // ← Belt-and-suspenders
  .single();
```

**Por quê?**
- RLS é banco de dados (pode ter bugs)
- App-level check é linha de defesa rápida
- Audit trail (logging mostra intent)

---

## ✅ Checklist para Novo API Route

Quando criando novo route `/api/...`:

- [ ] **Auth:** `getUser()` + error check
- [ ] **Tenant:** Fetch `profile.tenant_id` + error check
- [ ] **RLS:** `.eq('tenant_id', tenantId)` em TODAS as queries
- [ ] **Filters:** Usar composable query building (não inline)
- [ ] **TextSearch:** Usar `type: 'plain'` (não `'plainto'`)
- [ ] **Pagination:** Keyset (cursor) em vez de offset para grandes datasets
- [ ] **Error Handling:** `{ data, error }` destructure + if check
- [ ] **Logging:** `console.error` para debugging
- [ ] **Responses:** Tipadas com TypeScript interfaces
- [ ] **Caching:** `Cache-Control` headers apropriados
- [ ] **Tests:** Pelo menos 401 (unauth) e 404 (not found) cases
- [ ] **Types:** Todos imports tipificados

---

## 🚀 Aplicado em Story 17.1

Este documento foi criado após corrigir erro em `src/app/api/knowledge/documents/route.ts`:
- **Erro:** `type: 'plainto'` → **Solução:** `type: 'plain'`
- **Build:** ✅ Passa após correção
- **Deploy:** ✅ Pronto para Vercel

---

## 📖 Referências Externas

- Supabase JS Client: https://supabase.com/docs/reference/javascript/
- PostgreSQL Full-Text Search: https://www.postgresql.org/docs/current/textsearch.html
- Keyset Pagination: https://use-the-index-luke.com/sql/partial-results/keyset-pagination
- API Error Handling: https://restfulapi.net/http-status-codes/

---

**Este documento é parte da CLAUDE.md implícita — adicione-o à memória de agentes como padrão para Supabase/API routes.**
