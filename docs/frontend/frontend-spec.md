# Frontend Spec - Tech Arauz (Brownfield Discovery)

Data da analise: 2026-02-26

## 1. Objetivo

Documentar o estado atual do frontend (UI/UX), arquitetura de telas e principais debitos para evolucao com menor risco.

## 2. Stack e fundamentos

- Framework: Next.js 14 (App Router) + React 18 + TypeScript strict
- UI: Tailwind CSS + shadcn/ui (Radix)
- Estado cliente: React Query + hooks customizados
- Auth: Supabase Auth (login/logout e protecao em server components)
- Tema: dark mode provider + tokens CSS

## 3. Arquitetura de paginas

Rotas principais identificadas:

- `/login`
- `/dashboard`
- `/projetos`
- `/cronogramas`
- `/integracoes`
- `/agentes`
- `/auxiliares/*` (agent types, providers, modelos IA)
- `/cadastros/usuarios`

Padrao predominante:

- `page.tsx` server-side para carga inicial
- `*-content.tsx` client-side para interacao rica

## 4. Design system atual

Componentes base maduros:

- `src/components/ui/*` (biblioteca de base)
- `src/components/layout/*` (sidebar/header)
- `src/components/views/*` (kanban/lista/split view)
- `src/components/project/*` (cockpit e visao 360)

Tokens e estilos:

- Variaveis CSS no app global
- Extensoes de cores e sombras em `tailwind.config.ts`
- Paleta inclui status/prioridade/tipo de chamados

## 5. Fluxos UX principais

### 5.1 Login
- Formulario simples com email/senha e feedback de erro.
- Redirecionamento para dashboard apos sucesso.

### 5.2 Dashboard executivo
- KPIs, cards e graficos com filtros por status/fase.
- Foco em visao gerencial de carteira de projetos.

### 5.3 Projetos (operacao)
- Kanban e lista com filtros avancados.
- Cockpit lateral (split view) para detalhe de projeto.
- Acao de sync manual com feedback visual.

### 5.4 Integracoes
- Painel de APIs configuradas.
- Trigger de sincronizacao e visualizacao de logs.

### 5.5 Agentes IA
- Interface para CRUD de agentes via proxy API.
- Dependencia do AI service para operacao completa.

## 6. Acessibilidade e responsividade (estado atual)

Pontos positivos:

- Uso consistente de componentes de base com semantica razoavel.
- Labels em formularios principais.
- Breakpoints e layout responsivo em componentes chave.

Lacunas observadas:

- Falta de estrategia centralizada de a11y (checklist/linters/testes dedicados).
- Cobertura de teclado/focus states nao documentada por fluxo.
- Feedbacks assicronos nem sempre padronizados para leitores de tela.

## 7. Debitos tecnicos de frontend

## Alto impacto

### F1 - Componentes muito extensos (baixa modularidade)
- Evidencia: arquivos com 600-1200+ linhas (`projects-content`, `dashboard-content`, `cronogramas-content`).
- Risco: manutencao lenta, regressao alta.
- Acao: quebrar por feature slices (KPI, filtros, listagem, acoes).

### F2 - Duplicacao de logica de negocio na UI
- Evidencia: calculos similares de atraso/prioridade em mais de uma tela.
- Risco: inconsistencias de regra entre dashboard e projetos.
- Acao: mover regras para `src/lib/domain/*` compartilhado.

### F3 - Camadas de dados heterogeneas
- Evidencia: mistura de Server Actions, API routes e servicos client-side.
- Risco: comportamento imprevisivel, maior custo de debugging.
- Acao: definir padrao por tipo de operacao (query/mutation/proxy externo).

## Medio impacto

### F4 - Cobertura de testes de UI limitada
- Hoje existem testes em pontos especificos, mas sem cobertura ampla de fluxos criticos.
- Acao: ampliar testes de regressao para login, dashboard, projetos e integracoes.

### F5 - Ausencia de documentacao de UX por jornada
- Nao ha especificacao formal de jornada por persona (diretoria, operacao, admin).
- Acao: mapear jornadas e criterios de sucesso por tela.

## 8. Recomendacoes de evolucao

## Curto prazo (1-2 semanas)
1. Extrair regras de dominio duplicadas para camada compartilhada.
2. Fatiar os componentes mais extensos em subcomponentes menores.
3. Padronizar camada de dados por modulo.

## Medio prazo (2-4 semanas)
1. Criar baseline de testes de fluxo (Vitest + RTL + Cypress seletivo).
2. Definir checklist de acessibilidade (teclado, foco, aria-live, contraste).
3. Formalizar guideline de UX para feedbacks assicronos e estados vazios/erro.

## Longo prazo (4-8 semanas)
1. Revisao de performance de render em telas densas.
2. Catalogo de componentes com exemplos de uso por contexto.
3. Evolucao para observabilidade de UX (eventos de uso e funil de tarefas).

## 9. Parecer final

Frontend funcional e com boa base de componentes, mas com debito relevante de modularidade e governanca de regras.  
A recomendacao e priorizar refatoracao incremental orientada por risco (projetos/dashboard/integracoes) antes de expandir muito novas features.

