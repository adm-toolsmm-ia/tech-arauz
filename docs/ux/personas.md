# Personas e Jornadas — Tech Arauz

Data: 2026-02-27
Versao: 1.0

---

## 1. Personas

### 1.1 Diretoria — "Mariana" (Diretora de TI)

| Campo | Valor |
|-------|-------|
| **Nome ficticio** | Mariana Araujo |
| **Cargo** | Diretora de TI e Inovacao |
| **Responsabilidades** | Visao estrategica, priorizacao de portfolio, acompanhamento de KPIs, tomada de decisao |
| **Objetivos** | Ver status geral dos projetos em segundos, identificar riscos e atrasos, tomar decisoes baseadas em dados |
| **Dores** | Tempo limitado, precisa de informacao condensada, nao pode navegar em muitas telas |
| **Frequencia de uso** | 2-3x por semana, sessoes curtas (5-10 min) |
| **Modulos principais** | Dashboard, Projetos (visao macro) |

### 1.2 Operacao — "Carlos" (Coordenador de Projetos)

| Campo | Valor |
|-------|-------|
| **Nome ficticio** | Carlos Mendes |
| **Cargo** | Coordenador de Projetos |
| **Responsabilidades** | Gestao diaria de projetos, acompanhamento de entregas e cronogramas, atualizacao de status |
| **Objetivos** | Acompanhar progresso de cada projeto, filtrar por area/prioridade, visualizar cronogramas, detalhar entregas |
| **Dores** | Muitos projetos simultaneos, precisa de filtros rapidos, quer ver detalhes sem sair do contexto |
| **Frequencia de uso** | Diario, sessoes longas (30-60 min) |
| **Modulos principais** | Projetos, Cronogramas |

### 1.3 Admin — "Renata" (Analista de TI / Admin)

| Campo | Valor |
|-------|-------|
| **Nome ficticio** | Renata Silva |
| **Cargo** | Analista de TI / Administradora do sistema |
| **Responsabilidades** | Configuracao de integracoes, gestao de agentes AI, cadastro de usuarios, monitoramento de sync |
| **Objetivos** | Manter integracoes funcionando, configurar agentes e modelos, resolver problemas de sync |
| **Dores** | Erros de sync sem visibilidade, configuracoes espalhadas em multiplas telas, falta de logs claros |
| **Frequencia de uso** | 3-5x por semana, sessoes medias (15-30 min) |
| **Modulos principais** | Integracoes, Agentes, Auxiliares (agent-types, lm-providers, modelos-ia), Cadastros |

---

## 2. Jornadas Principais

### 2.1 Jornada Diretoria: "Ver status geral e identificar riscos"

**Entry point:** `/dashboard`
**Goal:** Entender a saude do portfolio em menos de 3 cliques
**Metrica de sucesso:** KPI principal visivel em < 3 segundos, risco identificado em < 3 cliques

```
Login → Dashboard
  ├── Ver 8 KPIs (total, ativos, concluidos, atrasados, alta prioridade, especial, taxa, areas)
  ├── Clicar em KPI "Atrasados" → lista filtrada inline
  │     └── Clicar em projeto → SplitView com ProjectCockpit (detalhes, entregas, cronograma)
  ├── Ver graficos (Pipeline, Distribuicao, Tendencia)
  │     └── Clicar em segmento → drill-down filtrado
  └── Decisao tomada → sair ou navegar para /projetos para acao
```

**Pontos de dor atuais:**
- KPIs nao tem tooltip explicando o calculo
- Drill-down do grafico para lista nao e obvio (falta affordance visual)
- Nao ha "resumo executivo" em texto (apenas numeros)

### 2.2 Jornada Operacao: "Acompanhar projetos e cronogramas"

**Entry point:** `/projetos`
**Goal:** Encontrar projetos por status/area e acompanhar progresso de entregas
**Metrica de sucesso:** Projeto encontrado em < 2 cliques, detalhe acessivel sem troca de pagina

```
Login → Projetos
  ├── Ver KPIs de projetos (totais, por status)
  ├── Usar FilterBar (busca por nome, quick filters por fase/prioridade/area)
  ├── Alternar Kanban ↔ Lista (ViewToggle)
  │     ├── Kanban: arrastar entre colunas para mudar status
  │     └── Lista: ordenar por colunas, selecionar para detalhe
  ├── Clicar em projeto → SplitView com ProjectCockpit
  │     └── Tabs: Detalhes, Entregas, Cronograma, Historico, Aprovadores, Acoes
  └── Navegar para /cronogramas para visao temporal
        ├── Ver calendario mes/semana
        ├── Filtrar por projeto/responsavel/status
        └── Clicar em item → detalhe do cronograma
```

**Pontos de dor atuais:**
- Componentes monoliticos (1.263 LOC cronogramas, 1.161 LOC projetos) tornam evolucao lenta
- Nao ha empty state guiado quando filtros nao retornam resultados
- Transicao entre Kanban e Lista perde selecao do item

### 2.3 Jornada Admin: "Configurar integracoes e monitorar sync"

**Entry point:** `/integracoes`
**Goal:** Verificar status de sync, resolver problemas, configurar agentes AI
**Metrica de sucesso:** Status de sync visivel em < 2 segundos, logs acessiveis em < 2 cliques

```
Login → Integracoes
  ├── Ver APIs configuradas (APIManager)
  │     ├── Status de cada API (ativa/inativa, ultimo sync)
  │     ├── Acionar sync manual → feedback via toast
  │     └── Ver logs por dataset → LogViewer abre filtrado
  ├── LogViewer
  │     ├── Filtrar por dataset, status, data
  │     ├── Ver detalhes de cada log entry
  │     └── Identificar erros → acionar reprocessamento
  └── Navegar para Agentes/Auxiliares
        ├── /agentes → CRUD de agentes AI
        ├── /auxiliares/agent-types → tipos de agente
        ├── /auxiliares/lm-providers → provedores de modelos
        └── /auxiliares/modelos-ia → modelos disponiveis
```

**Pontos de dor atuais:**
- Logs vistos apenas apos navegacao (nao ha alerta proativo de falha)
- Configuracao de agentes espalhada entre /agentes e /auxiliares
- `agent-types` ainda usa `confirm()` nativo para delete (gap de UX)

---

## 3. Mapa de Modulos por Persona

| Modulo | Diretoria | Operacao | Admin |
|--------|-----------|----------|-------|
| `/dashboard` | **Principal** | Secundario | Raro |
| `/projetos` | Secundario | **Principal** | Raro |
| `/cronogramas` | Raro | **Principal** | Raro |
| `/integracoes` | Nunca | Raro | **Principal** |
| `/agentes` | Nunca | Nunca | **Principal** |
| `/auxiliares/*` | Nunca | Nunca | **Principal** |
| `/cadastros/usuarios` | Raro | Nunca | **Principal** |

---

## 4. Gaps de UX Priorizados por Impacto na Jornada

| # | Gap | Persona Afetada | Severidade | Story Relacionada |
|---|-----|-----------------|------------|-------------------|
| 1 | Componentes monoliticos bloqueiam evolucao UX | Operacao | CRITICA | 2.4, 2.5 |
| 2 | Zero ErrorBoundary (tela branca em erro) | Todas | CRITICA | 2.2 (Done) |
| 3 | Sem empty states guiados | Operacao, Admin | ALTA | 2.10 |
| 4 | Sem affordance visual em drill-down de graficos | Diretoria | ALTA | Futuro |
| 5 | Domain logic dispersa causa inconsistencia de KPIs | Diretoria, Operacao | ALTA | 2.6 |
| 6 | `confirm()` nativo em agent-types | Admin | MEDIA | 2.7 |
| 7 | Sem alerta proativo de falha de sync | Admin | MEDIA | Futuro |
| 8 | Transicao Kanban ↔ Lista perde selecao | Operacao | BAIXA | 2.5 |
| 9 | Sem tooltip em KPIs | Diretoria | BAIXA | Futuro |

---

## 5. Metricas de Sucesso por Jornada

| Jornada | Metrica | Target | Como Medir |
|---------|---------|--------|------------|
| Diretoria: status geral | Cliques ate KPI principal | < 1 (ja visivel) | Audit de fluxo |
| Diretoria: identificar risco | Cliques ate projeto atrasado | < 3 | KPI click → lista → cockpit |
| Operacao: encontrar projeto | Cliques ate detalhe | < 2 | Filtro/busca → cockpit |
| Operacao: ver cronograma | Tempo ate visualizacao | < 5s | Carga da pagina + render |
| Admin: status sync | Cliques ate logs | < 2 | Integracoes → LogViewer |
| Admin: resolver erro | Cliques ate acao | < 4 | Logs → detalhe → reprocessar |

---

## 6. Validacao

### Checklist por Jornada

**Diretoria:**
- [x] Entry point correto (`/dashboard`)
- [x] Goal alcancavel (KPIs visiveis, drill-down funcional)
- [x] Steps sem bloqueio (SplitView funciona)
- [x] Metricas mensuraveis (cliques, tempo)

**Operacao:**
- [x] Entry point correto (`/projetos`)
- [x] Goal alcancavel (filtros funcionam, Kanban/Lista disponivel)
- [x] Steps sem bloqueio (SplitView + tabs funcionais)
- [x] Metricas mensuraveis (cliques, tempo)

**Admin:**
- [x] Entry point correto (`/integracoes`)
- [x] Goal alcancavel (APIs visiveis, sync manual funciona, logs acessiveis)
- [x] Steps sem bloqueio (LogViewer com filtros)
- [x] Metricas mensuraveis (cliques)

---

*Documento gerado por Dex (dev) em 2026-02-27*
*Base: Auditoria de rotas do portal + module-standards.md*
