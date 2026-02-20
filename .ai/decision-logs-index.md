# Decision Logs Index — Tech Arauz

> Índice centralizado de Architecture Decision Records (ADRs) do projeto.

**Nota**: Existem dois sistemas de ADRs no projeto:

- **`.ai/` (Runtime Patterns)**: Decisões descobertas/refinadas durante implementação
- **[`.context/03-specs/adr/`](../../../.context/03-specs/adr/README.md) (Foundation)**: Decisões iniciais de arquitetura (2026-02-07/08)

---

## ADRs Runtime (Implementação)

Padrões técnicos descobertos e formalizados durante desenvolvimento.

| ADR | Título | Status | Data |
|-----|--------|--------|------|
| [ADR-001](ADR-001-rls-all-tables.md) | RLS em todas as tabelas | Accepted | 2026-02-08 |
| [ADR-002](ADR-002-token-fallback.md) | Token fallback para env vars | Accepted | 2026-02-08 |
| [ADR-003](ADR-003-upsert-pattern.md) | UPSERT via composite UNIQUE | Accepted | 2026-02-10 |
| [ADR-004](ADR-004-uuid-pk-pattern.md) | UUID PK + espaider_id INTEGER | Accepted | 2026-02-13 |

---

## ADRs Foundation (Arquitetura Base)

Decisões estratégicas feitas no planejamento MVP.

📍 **Localização**: [`.context/03-specs/adr/`](../../../.context/03-specs/adr/)

| ADR | Título | Status | Data |
|-----|--------|--------|------|
| [ADR-001](../../../.context/03-specs/adr/2026-02-ADR-001-stack-tecnica.md) | Stack Tecnológica | Accepted | 2026-02-07 |
| [ADR-002](../../../.context/03-specs/adr/2026-02-ADR-002-auth-espaider.md) | Autenticação e Integração Espaider | Accepted | 2026-02-07 |
| [ADR-003](../../../.context/03-specs/adr/2026-02-ADR-003-design-system.md) | Design System e UX/UI | Accepted | 2026-02-08 |

---

## Mapa de Relações

```text
Foundation ADRs (.context/)
├── ADR-001 (Stack: Supabase, Next.js, etc)
│   ├─→ Runtime ADR-001 (RLS implementation)
│   ├─→ Runtime ADR-003 (UPSERT pattern)
│   └─→ Runtime ADR-004 (UUID pattern)
├── ADR-002 (Espaider API, Token+Key auth)
│   └─→ Runtime ADR-002 (Token fallback)
└── ADR-003 (Design System)
    └─→ (Frontend implementation)
```

---

## Rastreabilidade por Requisito (RF)

| RF | ADRs Relacionados | Tipo |
| --- | --- | --- |
| RF-001 (Auth) | — | Foundation: Stack |
| RF-002 (Import Espaider) | Foundation: ADR-002, Runtime: ADR-002, ADR-003 | Espaider Integration |
| RF-003 (Child entities) | Foundation: ADR-002, Runtime: ADR-003, ADR-004 | Sync & Schema |
| RF-004 (Projects viz) | Foundation: ADR-003 | Design |
| RF-006 (Aux tables) | Runtime: ADR-001, ADR-004 | RLS & Schema |
| RF-007 (RBAC) | Runtime: ADR-001 | Security |
| RF-008 (Logs) | Runtime: ADR-004 | Schema |

---

## Consultar ADRs

**Por categoria:**

- [Segurança (RLS, RBAC)](ADR-001-rls-all-tables.md)
- [Integração Espaider](../../../.context/03-specs/adr/2026-02-ADR-002-auth-espaider.md)
- [Padrões de Dados (UPSERT, UUID)](ADR-003-upsert-pattern.md)
- [Design & Frontend](../../../.context/03-specs/adr/2026-02-ADR-003-design-system.md)

**Ver também:**

- [README completo dos ADRs](../../../.context/03-specs/adr/README.md)
- [Requirements.md](../../../.context/02-rules/requirements.md) para rastrear implementação de RFs
