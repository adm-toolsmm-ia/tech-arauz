# Data Fetching Patterns — Tech Arauz Portal

Data da formalizacao: 2026-02-28
Responsavel: Aria (architect)
ADR de referencia: [ADR-005](./adr/ADR-005-data-fetching-patterns.md)

---

## 1. Visao Geral

Este documento define as regras formais de **quando usar cada padrao de data fetching** no portal Tech Arauz. O objetivo e eliminar confusao arquitetural, garantir consistencia em novos modulos e servir como referencia normativa para agentes AI e desenvolvedores humanos.

---

## 2. Os Quatro Padroes

### 2.1 Server Components — Query Direta Supabase

**Quando usar:** Leitura de dados para renderizacao inicial de pagina, sem interacao do usuario.

**Caracteristicas:**
- Executa no servidor — dados nunca passam pelo cliente
- Sem estado client-side
- SEO-friendly e performance otimizada
- Adequado para dados que nao mudam durante a sessao

**Exemplo canonico:** `src/app/projetos/page.tsx`, `src/app/dashboard/page.tsx`

```typescript
// page.tsx (Server Component)
export default async function Page() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: projects } = await supabase
    .from('projects')
    .select('*, schedules(*), deliveries(*)')
    .eq('tenant_id', profile.tenant_id)
    .order('created_at', { ascending: false });

  return <ProjectsContent projects={transformProjects(projects)} />;
}
```

**Modulos que usam este padrao:**
| Modulo | Arquivo | Observacao |
|--------|---------|-----------|
| Dashboard | `src/app/dashboard/page.tsx` | Query principal com relacoes |
| Projetos | `src/app/projetos/page.tsx` | Inclui schedules, deliveries, histories |
| Cronogramas | `src/app/cronogramas/page.tsx` | Query com dados de scheduling |

---

### 2.2 Server Actions — Mutations e Operacoes Autenticadas

**Quando usar:** CRUD operations, mutations, operacoes que requerem autenticacao e revalidacao de cache.

**Caracteristicas:**
- Executa no servidor com contexto de autenticacao
- Usa `revalidatePath()` para invalidar cache apos mutacao
- Retorna resultado tipado `{ success, data?, message? }`
- Validacao de input no servidor
- Verificacao de permissao (role check) embutida

**Exemplo canonico:** `src/app/actions/projects.ts`, `src/app/actions/lm-models.ts`

```typescript
// actions/projects.ts (Server Action)
'use server';

export async function updateProjectStatusAction(
  projectId: string,
  status: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: 'Nao autenticado' };

  // Role check
  const { data: profile } = await supabase
    .from('profiles').select('role, tenant_id').eq('id', user.id).single();
  if (profile?.role === 'viewer') return { success: false, message: '...' };

  // Mutation
  await supabase.from('projects').update({ status }).eq('id', projectId);
  revalidatePath('/projetos');
  revalidatePath('/dashboard');
  return { success: true };
}
```

**Modulos que usam este padrao:**
| Modulo | Arquivo | Operacoes |
|--------|---------|----------|
| Projetos | `src/app/actions/projects.ts` | fetch, updateStatus, updateNotes |
| Modelos IA | `src/app/actions/lm-models.ts` | CRUD completo |
| Agent Types | `src/app/actions/agent-types.ts` | CRUD completo |
| LM Providers | `src/app/actions/lm-providers.ts` | CRUD completo |
| Sync | `src/app/actions/sync.ts` | Trigger sync Espaider |
| Auxiliares | `src/app/auxiliares/*/page.tsx` | CRUD via Server Actions |

---

### 2.3 API Routes — Proxy para Servicos Externos

**Quando usar:** Comunicacao com servicos externos (AI service, webhooks, integracao Espaider), operacoes que requerem segredos de servidor nao expostos ao cliente.

**Caracteristicas:**
- Proxy seguro — segredos nao chegam ao browser
- Transforma/adapta resposta do servico externo para o formato do portal
- Usado para chamadas que precisam de logica de retry ou timeout especial
- Suporta streaming (ex: AI responses)

**Exemplo canonico:** `src/app/api/agents/*`, `src/app/api/integracoes/*`

```typescript
// app/api/agents/route.ts (API Route)
export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Chama servico AI externo com segredo de servidor
  const response = await fetch(process.env.AI_SERVICE_URL!, {
    headers: { 'Authorization': `Bearer ${process.env.AI_SERVICE_KEY}` }
  });
  return NextResponse.json(await response.json());
}
```

**Modulos que usam este padrao:**
| Modulo | Arquivo | Servico Externo |
|--------|---------|----------------|
| Agentes | `src/app/api/agents/` | AI Service (CRUD de configs) |
| Integracoes | `src/app/api/integracoes/` | Espaider WCF API |
| Logs | `src/app/api/integracoes/logs/` | Supabase (via service role) |

---

### 2.4 Client Services — Estado Real-Time e Dual Source

**Quando usar:** Modulos que precisam de estado em tempo real, sincronizacao entre abas, ou que consomem multiplas fontes de dados simultaneamente (ex: AI service + Supabase).

**Caracteristicas:**
- Estado gerenciado no cliente (Zustand store)
- Necessario para feedback imediato e otimistic updates
- Justificado apenas quando Server Components nao sao suficientes
- Deve ser documentado com justificativa explicita

**Exemplo canonico:** `src/services/agents/agentsStore.ts` (Zustand + TanStack Query)

```typescript
// services/agents/agentsStore.ts (Client Service)
// JUSTIFICATIVA: Agentes precisam de dual source —
//   - Configs persistidas no Supabase (via API Route)
//   - Estado de execucao em tempo real do AI service
// Server Component nao suporta este padrao de dual source.

export const useAgentsStore = create<AgentsStore>((set, get) => ({
  agents: [],
  loadAgents: async () => {
    const [supabaseAgents, aiServiceAgents] = await Promise.all([
      agentsApiService.list(),        // via API Route → Supabase
      aiServiceClient.listRunning(),  // via API Route → AI Service
    ]);
    set({ agents: mergeAgents(supabaseAgents, aiServiceAgents) });
  },
}));
```

**Modulos que usam este padrao:**
| Modulo | Arquivo | Justificativa |
|--------|---------|--------------|
| Agentes | `src/services/agents/agentsStore.ts` | Dual source: Supabase configs + AI service runtime state |

---

## 3. Regras de Decisao

```
Nova feature de leitura?
├── Dados para renderizacao inicial (SSR)?
│   └── → Server Component + Query Supabase direta
├── Operacao de escrita / mutation?
│   └── → Server Action
├── Precisa chamar servico externo?
│   └── → API Route (proxy)
└── Precisa de estado real-time ou dual source?
    └── → Client Service (Zustand) — documentar justificativa
```

**Regra de ouro:** Sempre comece pelo padrao mais simples (Server Component). Adicione complexidade apenas quando houver necessidade tecnica demonstrada.

---

## 4. Mapeamento Completo de Modulos

| Modulo | Leitura | Escrita | Externo | Real-Time |
|--------|---------|---------|---------|-----------|
| Dashboard | Server Component | — | — | — |
| Projetos | Server Component | Server Action | — | — |
| Cronogramas | Server Component | — | — | — |
| Integracoes | Server Component | API Route (trigger) | Espaider | — |
| Agentes | API Route | API Route | AI Service | Client Service (Zustand) |
| Auxiliares | Server Component | Server Action | — | — |
| Logs | — | — | API Route (service role) | — |

---

## 5. Inconsistencias Identificadas e Status

| Inconsistencia | Modulo | Severidade | Status |
|----------------|--------|-----------|--------|
| `agentSupabaseService.ts` existe paralelo ao `agentsApiService.ts` | Agentes | Media | Documentado — dual source justificado |
| `lmModelsService.ts` / `lmProvidersService.ts` na pasta services/ | Auxiliares | Baixa | Estes devem ser migrados para Server Actions (Story futura) |

---

## 6. Excecoes Documentadas

### Excecao 1 — Agentes: Dual Source (API Route + Client Service)

**Modulo:** `src/services/agents/`
**Excecao:** Usa Client Service (Zustand) + API Routes em vez de Server Component puro
**Justificativa:** O modulo de Agentes precisa:
1. Consumir configuracoes do Supabase (persistencia)
2. Consumir estado de execucao do AI Service (tempo real)
3. Sincronizar ambas as fontes para o estado unificado na UI

Server Components nao suportam este padrao de dual source com sincronizacao. A excecao e necessaria e justificada.

---

## 7. Politica para Agentes AI

Todo agente AI que criar ou modificar um modulo deve:

1. Consultar este documento antes de escolher o padrao de data fetching
2. Seguir o padrao definido para o modulo (coluna na tabela da secao 4)
3. Se precisar se desviar, documentar a excecao na story com justificativa tecnica
4. Nao criar Client Services sem aprovacao arquitetural explicita

Referencia cruzada: [module-standards.md](./module-standards.md) — Secao 8 (Data Fetching Obrigatorio)
