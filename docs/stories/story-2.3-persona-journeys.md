# Story 2.3 - Formalizar Jornadas por Persona

Status: Ready
Epic: UX-EPIC-01
Prioridade: Media-Alta
Sprint: 1
Esforco estimado: 10h

## Executor Assignment

executor: @ux-design-expert
quality_gate: @pm
quality_gate_tools: [persona-review, journey-validation]

## CodeRabbit Integration

> **CodeRabbit Integration**: Disabled

## User Story

Como product owner,
quero jornadas formais por persona com metricas de sucesso,
para tomar decisoes de UX baseadas em dados e necessidades reais dos usuarios.

## Acceptance Criteria

1. Existe `docs/ux/personas.md` com 3 personas definidas: Diretoria, Operacao, Admin.
2. Cada persona tem: nome ficticio, responsabilidades, objetivos, dores, frequencia de uso.
3. Jornada principal de cada persona mapeada: entry point → goal → steps → exit.
4. Pontos de dor identificados por persona no fluxo atual.
5. Metricas de sucesso definidas por jornada (ex: "Diretoria → ver KPI em < 3 cliques").
6. Gaps de UX priorizados por impacto na jornada.
7. Documento validado contra fluxos reais do portal.

## Tasks

- [ ] Definir 3 personas com base nos modulos do portal (Dashboard=Diretoria, Projetos/Cronogramas=Operacao, Integracoes/Cadastros=Admin)
- [ ] Mapear jornada principal de Diretoria (Dashboard → KPIs → drill-down → decisao)
- [ ] Mapear jornada principal de Operacao (Projetos → filtros → kanban → cockpit → acoes)
- [ ] Mapear jornada principal de Admin (Integracoes → sync → logs → config → usuarios)
- [ ] Identificar pontos de dor por persona (ex: muitos cliques, informacao escondida, feedback lento)
- [ ] Definir metricas de sucesso (cliques ate objetivo, tempo de tarefa, taxa de erro)
- [ ] Priorizar gaps de UX por impacto (tabela persona × gap × severidade)
- [ ] Criar `docs/ux/personas.md` com todo o conteudo

## Testes

- [ ] Walkthrough de cada jornada no portal real para validar mapeamento
- [ ] Review cruzado com dados de uso (se disponiveis)

## File List

- docs/ux/personas.md (NOVO)

## Dev Notes

### Rotas do Portal (para mapeamento de jornada)
- `/login` — autenticacao
- `/dashboard` — KPIs executivos, graficos, drill-down (Diretoria)
- `/projetos` — kanban, lista, cockpit, filtros avancados (Operacao)
- `/cronogramas` — calendario mes/semana, KPIs, filtros (Operacao)
- `/integracoes` — painel de APIs, sync, logs (Admin)
- `/agentes` — CRUD de agentes AI (Admin)
- `/auxiliares/*` — agent-types, lm-providers, modelos-ia (Admin)
- `/cadastros/usuarios` — gestao de usuarios (Admin)

### Validacao
- Walkthrough: navegar cada jornada no portal real e validar que steps mapeados refletem realidade
- Checklist por jornada: entry point correto, goal alcancavel, steps sem bloqueio, metricas mensuraveis

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-27 | 1.0 | Story criada | Orion (aios-master) |
| 2026-02-27 | 1.1 | PO validation: added Executor, Dev Notes, Change Log | Pax (po) |

## Dependencies

- Nenhuma (pode iniciar imediatamente, beneficia-se de UX-1.1 para referencia de design)

## Blocks

- Nenhuma diretamente (informativo para priorizar futuras melhorias)
