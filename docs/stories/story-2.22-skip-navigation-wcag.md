# Story 2.22 — SkipNavigation + main-content anchor (WCAG AA)

Story ID: 2.22
Epic: PRD-UX-2026
Sprint: 3 — Qualidade e Consistência
Agente: @dev
Esforço: 2h
Prioridade: Alta (WCAG 2.1 AA)
Status: Done ✅

## Como usuário

Como usuário que navega pelo teclado ou usa leitor de tela,
quero poder pular o menu lateral e ir direto para o conteúdo principal,
para não precisar tabular por todos os itens de navegação a cada página.

## Contexto

WCAG 2.1 Success Criterion 2.4.1 (Bypass Blocks) — Nível A — exige um mecanismo para
pular blocos de conteúdo repetitivo. O portal não tinha esse mecanismo. Esta story
adiciona o componente `SkipNavigation` que aparece apenas quando focado via teclado.

## Critérios de aceite

- [x] Componente `SkipNavigation.tsx` criado em `src/components/a11y/`
- [x] Link de skip com href `#main-content` ("Pular para o conteúdo principal")
- [x] Visualmente oculto por padrão (`sr-only`)
- [x] Visível quando focado via teclado (`focus:not-sr-only`)
- [x] Posicionado no topo-esquerdo quando visível (`focus:fixed focus:left-4 focus:top-4`)
- [x] z-index alto para sobrepor modais/backdrops (`focus:z-[100]`)
- [x] Estilo de botão quando visível (bg-primary, text-primary-foreground)
- [x] `src/app/layout.tsx` renderiza `<SkipNavigation />` como primeiro elemento
- [x] Conteúdo principal tem `id="main-content"` em `layout.tsx`
- [x] `ErrorBoundary` envolve a área de conteúdo principal

## Implementação

### `src/components/a11y/SkipNavigation.tsx`

```tsx
export function SkipNavigation() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:text-sm focus:font-medium"
    >
      Pular para o conteúdo principal
    </a>
  );
}
```

### `src/app/layout.tsx`

```tsx
<body>
  <SkipNavigation />          {/* ← primeiro elemento */}
  <Providers>
    <ErrorBoundary>
      <div id="main-content"> {/* ← âncora de destino */}
        {children}
      </div>
    </ErrorBoundary>
  </Providers>
</body>
```

## Dependências

- `ErrorBoundary` — já existia (Story 2.2)

## Referência WCAG

- **SC 2.4.1** Bypass Blocks (Level A) — mecanismo para pular navegação repetitiva
- **SC 2.4.3** Focus Order (Level A) — skip link é o primeiro elemento focável

## Definition of Done

- [x] Componente criado em `src/components/a11y/`
- [x] Link visível apenas no foco
- [x] id="main-content" em layout.tsx
- [x] Testado com Tab no browser (aparece corretamente)

## File List

- `src/components/a11y/SkipNavigation.tsx` ✅ criado
- `src/app/layout.tsx` ✅ modificado (SkipNavigation + id="main-content")
