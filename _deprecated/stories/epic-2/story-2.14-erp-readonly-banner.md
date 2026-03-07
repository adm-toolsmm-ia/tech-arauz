# Story 2.14 — Criar ErpReadOnlyBanner + Inserir em Módulos

Story ID: 2.14
Epic: PRD-UX-2026
Sprint: 1 — Fundação
Agente: @dev
Esforço: 6h (4h componente + 2h inserção)
Prioridade: Alta
Gaps resolvidos: UX-C01, UX-P01, UX-S02

## Como usuário

Quero ver claramente que Projetos e Cronogramas são dados vindos do ERP e que não posso editá-los no portal, para não me frustrar tentando alterar algo que é somente leitura.

## Critérios de aceite

### Componente `ErpReadOnlyBanner`

- [ ] Variante `page`: exibido abaixo do `DashboardHeader`, acima dos KPIs
  - Texto: "Fonte: ERP Espaider — somente leitura. Atualizado às {timestamp}"
  - Cor: `blue-50` background, `blue-200` border (informativo)
  - Link opcional: "Como editar? Acesse o ERP →"
- [ ] Variante `card`: exibido no topo do Cockpit/detalhes
  - Formato compacto: ícone + "Somente leitura · Atualizado {tempo relativo}"
- [ ] Prop `timestamp` aceita `Date` ou `string`
- [ ] Prop `variant` aceita `"page" | "card"`
- [ ] Prop `erpLink?` configura URL do ERP (opcional)
- [ ] Componente acessível: `role="status"`, `aria-label` descritivo

### Inserção em módulos

- [ ] Cronogramas: banner `page` no topo + banner `card` no CronogramaCockpit
- [ ] Projetos: banner `page` no topo + banner `card` no ProjectCockpit
- [ ] Timestamp usa `sync_logs.completed_at` (última sync bem-sucedida)
- [ ] Fallback se sem sync: "Dados carregados do ERP"

## Implementação

### Novo arquivo: `src/components/shared/erp-readonly-banner.tsx`

```typescript
interface ErpReadOnlyBannerProps {
  variant: 'page' | 'card';
  timestamp?: Date | string;
  erpLink?: string;
}
```

### Arquivos modificados

- `src/app/(dashboard)/cronogramas/page.tsx` — inserir banner page
- `src/app/(dashboard)/projetos/page.tsx` — inserir banner page
- Cockpit de Cronogramas — inserir banner card
- Cockpit de Projetos — inserir banner card

### Testes

- [ ] Unit: renderiza corretamente com variant `page` e `card`
- [ ] Unit: exibe timestamp formatado
- [ ] Unit: exibe fallback sem timestamp
- [ ] Unit: link ERP renderiza quando passado
- [ ] A11y: `role="status"` presente

## Dependências

- Nenhuma (pode começar imediatamente, paralelo com Story 2.13)

## Definition of Done

- [ ] AC validados
- [ ] Componente reutilizável e exportado
- [ ] Inserido em Cronogramas e Projetos
- [ ] Code review aprovado
