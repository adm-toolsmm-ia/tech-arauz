# Story 2: ProjectCockpit 360 com Tabs Expandidas e Cronogramas

**ID**: STORY-002
**Status**: Done
**Sprint**: 1
**Priority**: High
**Points**: 13

## User Story

As a project manager, I want a comprehensive 360-degree project view with multiple tabs covering all project dimensions, so that I can see deliveries, schedules, history, approvers, and actions in a single cockpit without navigating away.

## Acceptance Criteria

- [x] ProjectCockpit expandido com 6 tabs: Detalhes, Entregas, Cronograma, Historico, Aprovadores, Acoes
- [x] Tab Historico exibe timeline vertical com conectores visuais e cards de movimentacao
- [x] Tab Aprovadores exibe cards com dados dos aprovadores do projeto
- [x] SplitView component permite abrir ProjectCockpit em painel lateral sem sair da pagina atual
- [x] SplitView suporta multiplos widths (sm, md, lg, xl, 2xl, 3xl, 4xl, wide) para acomodar conteudo
- [x] Modulo Cronogramas com pagina dedicada: calendario mes/semana, KPIs de atividades e filtros
- [x] Cronogramas exibe cards de atividades com informacoes de prazo, responsavel e status
- [x] mensagem_movimentacao e data_movimentacao exibidos nos cards Kanban e na lista de projetos
- [x] Dados de schedules, deliveries, histories, approvers e budgets carregados nas relacoes do projeto

## File List

- `src/components/project/ProjectCockpit.tsx` -- Cockpit 360 com 6 tabs, timeline vertical no Historico, cards em Aprovadores
- `src/components/views/SplitView.tsx` -- Painel lateral com animacao slide-in, widths configuraveis (sm ate wide)
- `src/app/cronogramas/page.tsx` -- Pagina do modulo Cronogramas (server component)
- `src/app/cronogramas/cronogramas-content.tsx` -- Conteudo: calendario mes/semana, KPIs, filtros, cards de atividades
- `src/components/layout/sidebar-config.ts` -- Adicionado link Cronogramas no menu lateral
- `src/components/kanban/KanbanBoard.tsx` -- Exibe mensagem_movimentacao e data_movimentacao nos cards
- `src/app/projetos/projects-content.tsx` -- Integracao SplitView + ProjectCockpit na lista de projetos
- `src/lib/transformers/project.ts` -- UIProject e UISchedule com campos adicionais para cockpit 360

## Dev Notes

- O SplitView usa `max-w-[min(90vw,1120px)]` no modo `wide` para ocupar area suficiente sem cobrir toda a tela.
- A timeline vertical no Historico usa pseudo-elementos CSS para os conectores entre entries.
- Cronogramas reutiliza dados de `project_schedules` ja sincronizados via Espaider.
- O width `wide` do SplitView foi adicionado posteriormente (Story 4) para acomodar o editor de notas.

## Change Log

- 2026-02-13: Implementado por Claude Code (8 melhorias UI/UX - fases P1 e P2)
- 2026-02-16: SplitView expandido com widths 3xl, 4xl, wide para visao 360 ampliada
