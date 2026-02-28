# Story 2.18 — CronogramaTableView 7 Colunas

Story ID: 2.18
Epic: PRD-UX-2026
Sprint: 2 — Core PRD
Agente: @dev
Esforço: 6h
Prioridade: Alta
Status: Done ✅

## Como usuário

Como usuário do portal,
quero visualizar os cronogramas em formato de tabela com colunas ordenáveis,
para analisar atividades com mais detalhes do que o card grid anterior permitia.

## Contexto

O módulo Cronogramas tinha uma "lista" implementada como card grid (não uma tabela real),
o que não atendia ao PRD. A story substitui por uma tabela HTML com 7 colunas,
ordenação por coluna, indicadores visuais de atraso e estado vazio padronizado.

## Critérios de aceite

- [x] Componente `CronogramaTableView.tsx` criado em `src/app/cronogramas/components/`
- [x] 7 colunas ordenáveis: **Atividade**, **Responsável**, **Início**, **Fim**, **Prazo**, **Status**, **Fase**
- [x] Larguras mínimas definidas: Atividade 200px, Responsável 120px, datas 100px, Status/Fase 120px
- [x] Ordenação por clique no header — toggle asc/desc com indicador visual (chevron)
- [x] Prop `hideCompleted` (default: `true`) — filtra atividades com status "concluida"
- [x] Indicador visual de atraso: ícone triângulo vermelho + texto vermelho na coluna Prazo
- [x] Estado vazio: mensagem "Nenhuma atividade encontrada." quando lista filtrada está vazia
- [x] Rodapé com contagem de registros exibidos
- [x] Clique na linha dispara `onActivityClick`

## Implementação

### Arquivo: `src/app/cronogramas/components/CronogramaTableView.tsx`

**Principais decisões:**
- Tabela HTML nativa com `overflow-x-auto` para responsividade
- Sort state local: `{ field: string, direction: 'asc' | 'desc' }`
- Filtragem de `hideCompleted` via `useMemo` antes da ordenação
- Overdue: condição `atrasado === true` → aplica classes de texto vermelho
- Empty state inline (sem componente externo nesta story)

## Dependências

- `UISchedule` type — já existia
- `hideCompleted` lógica alinhada com `CronogramaKanbanView` (Story 2.17 / 2.19)

## Definition of Done

- [x] Tabela HTML real (não card grid)
- [x] 7 colunas com ordenação
- [x] hideCompleted funcional
- [x] Overdue indicators
- [x] Empty state
- [x] Build OK, testes passando

## File List

- `src/app/cronogramas/components/CronogramaTableView.tsx` ✅ criado
