# Decisões Arquiteturais (ADRs)

> **Camada**: 1 - Regras  
> **Última atualização**: 2026-02-07

---

## Propósito

Este documento consolida **por que certas escolhas foram feitas**. Decisões são herdadas do protótipo Lovable e formalizadas aqui para que agentes AI entendam o contexto.

---

## ADR-001: Supabase como Backend

**Status**: ✅ Confirmado  
**Data**: 2026-02-07

### Contexto
Precisamos de um backend que ofereça PostgreSQL, autenticação, e funções serverless em uma stack unificada.

### Decisão
Usar **Supabase** como backend completo (BaaS).

### Motivos
- ✅ PostgreSQL com RLS nativo
- ✅ Auth pronto (JWT, sessões)
- ✅ Edge Functions (Deno) para lógica customizada
- ✅ Custo zero para MVP (free tier)
- ✅ Migrations versionadas

### Trade-offs
- ⚠️ Vendor lock-in (mas é open-source, pode self-host)
- ⚠️ Free tier tem limites (500MB storage, 2GB bandwidth)

---

## ADR-002: Row-Level Security (RLS) para Controle de Acesso

**Status**: ✅ Confirmado  
**Data**: 2026-02-07

### Contexto
Precisamos garantir que usuários só vejam dados autorizados.

### Decisão
Usar **RLS nativo do PostgreSQL** em todas as tabelas sensíveis.

### Alternativas Rejeitadas
1. **Filtrar no código (middleware)**: Propenso a erros, um `SELECT *` vaza dados
2. **Views separadas por role**: Duplicação, difícil manutenção

### Implementação
- Função helper: `has_role(role_name)`
- Policies em cada tabela
- Views `*_safe` para dados mascarados

---

## ADR-003: View `apis_safe` para Mascaramento de Tokens

**Status**: ✅ Confirmado  
**Data**: 2026-02-07

### Contexto
Tokens de API não devem aparecer em texto plano no frontend.

### Decisão
Criar view `apis_safe` que mascara tokens com `substring(token, 1, 4) || '****'`.

### Uso
- Frontend: consulta `apis_safe`
- Edge Functions: consulta `apis` (acesso privilegiado)

---

## ADR-004: Estrutura de Código por Feature

**Status**: ✅ Confirmado  
**Data**: 2026-02-07

### Decisão
Organizar código por feature em `src/features/{module}/`.

### Estrutura
```
src/features/
├── dashboard/
│   ├── pages/
│   ├── components/
│   └── hooks/
├── projetos/
├── solicitacoes/
└── admin/
```

### Motivos
- Cada feature é autocontida
- Fácil de navegar e manter
- Evita imports circulares

---

## ADR-005: TanStack Query para Server State

**Status**: ✅ Confirmado  
**Data**: 2026-02-07

### Decisão
Usar **TanStack Query** (React Query) para gerenciar dados do servidor.

### Motivos
- ✅ Cache automático
- ✅ Stale-while-revalidate
- ✅ Refetch em foco/reconexão
- ✅ Devtools para debug

### Pattern
```ts
const { data, isLoading } = useQuery({
  queryKey: ['projetos', filters],
  queryFn: () => supabase.from('projetos').select('*')
})
```

---

## ADR-006: Sincronização Unidirecional com Espaider

**Status**: ✅ Confirmado  
**Data**: 2026-02-07

### Decisão
A integração com Espaider é **somente leitura** (Espaider → Portal).

### Motivos
- ✅ Menor complexidade (não precisa resolver conflitos)
- ✅ Espaider é source of truth para projetos
- ✅ Portal é view layer + analytics

### Futuro
Write-back pode ser adicionado pós-MVP se necessário.

---

## Decisões Pendentes

| ID | Pergunta | Responsável |
|----|----------|-------------|
| Q-001 | Habilitar TypeScript strict mode? | @backend-specialist |
| Q-002 | Plano de upgrade Supabase (limites)? | @devops-engineer |
| Q-003 | Rate limiting da API Espaider? | Confirmar com TI Espaider |

---

## Referências

- [Documentação de Arquitetura](../docs/tech-arauz-claude-v01/03-architecture.md)
- [Segurança e RBAC](../docs/tech-arauz-claude-v01/12-security-rbac.md)
- [Integração Espaider](../docs/tech-arauz-claude-v01/05-espaider-integration.md)
