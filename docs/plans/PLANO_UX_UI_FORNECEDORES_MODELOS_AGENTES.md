# Plano: UX/UI 10/10 — Fornecedores IA, Modelos IA, Tipos de Agentes e Agentes AI

> **Tipo:** Contexto + Objetivo + Padrões de qualidade para desenvolvimento autônomo  
> **Destinatário:** Modelo executor (ex.: Claude Haiku) e equipe AIOS  
> **Data:** 2026-02-25  
> **Agentes envolvidos:** @aios-master (orquestração), @data-engineer (dados/RLS), @ux-design-expert (padrões UX/UI), @architect (arquitetura frontend)

---

## Objetivo principal

1. **Provedores de LM → Fornecedores IA:** Alterar nomenclatura em toda a interface (sidebar, títulos, diálogos, textos) para "Fornecedores IA"; manter rota e `moduleId` para não quebrar persistência de filtros.
2. **Módulo Modelos IA:** Criar módulo e página para gestão 360° de "Modelos IA" (modelos dos provedores), utilizando o design system padrão do projeto e incorporando as melhorias de UX/UI descritas nos itens seguintes.
3. **Bug ao excluir:** Nos módulos Tipos de Agentes e Fornecedores IA, ao excluir um registro não deve abrir nenhum card/cadastro; o painel lateral (SplitView) não deve abrir o item excluído. Corrigir com `stopPropagation` nos botões de ação e limpeza da seleção após exclusão bem-sucedida.
4. **Cards padronizados:** Melhorar os cards de visualização das tabelas auxiliares (Fornecedores, Modelos IA, Tipos de Agentes) e dos Agentes AI, utilizando o padrão de visualização dos cards de Projetos e Cronogramas.
   - **4.1** Todos os cards devem seguir o **mesmo padrão de design** (estrutura visual, seções, rodapé com badge), mas em cada cadastro com **contexto e informações específicas** (fornecedor, modelo, tipo de agente, agente).
5. **Clareza UX/UI:** Melhorar a experiência e o entendimento das informações vinculadas aos cadastros de provedores, modelos e agentes AI — legendas, visualização e preenchimento dos dados que estão confusos devem ser revisados (labels em português, "Fornecedor padrão / Modelo padrão", documentação, placeholders e texto de ajuda).

---

## Objetivo secundário

- **Padronizar engenharia e arquitetura:** Garantir que a customização de telas siga padrões de projeto documentados. Quando esse cadastro for validado, o design resultante deve estar **documentado de forma atualizada, 100% funcional e acessível** para novas demandas relacionadas (novos módulos, novas telas no mesmo padrão).

---

## Pontos importantes (governança da execução)

- **Os padrões documentados no projeto não devem ser seguidos à risca.** A equipe AIOS deve **analisar e decidir** a melhor forma de entregar o melhor resultado dentro do objetivo principal. A documentação serve como referência e ponto de partida, não como restrição rígida quando uma decisão melhor for identificada.
- **Alinhamento com documentação:** A equipe deve estar alinhada com as documentações e contextos padrão utilizados na engenharia e arquitetura de software e AI (ADR, component-patterns, ARQUITETURA_PADRAO_PAGINAS, etc.). Usar esses artefatos como base para decisões.
- **Atualização da documentação quando houver mudanças:** Se decisões da equipe **alterarem a versão atual** (ex.: novo padrão de card, nova estrutura de página, nova convenção de nomenclatura), é **obrigatório atualizar** a engenharia e arquitetura com a **nova versão melhorada**. O repositório deve sair com um padrão de engenharia e arquitetura **10/10 em todas as áreas relacionadas** — ou seja, documentação refletindo o que foi implementado e válida para futuras demandas.

---

## 1. Contexto

### 1.1 Projeto

- **Tech Arauz**: SaaS de gestão de TI (projetos + agentes AI), single-tenant, Next.js 14, Supabase, TypeScript.
- **Fonte de verdade**: `docs/sprints/00-MASTER.md`, `docs/prd/specs/component-patterns.md`, `docs/prd/specs/adr/2026-02-ADR-003-design-system.md`, `.cursor/ARQUITETURA_PADRAO_PAGINAS.md`.

### 1.2 Módulos em escopo

| Módulo | Rota atual | Tabelas | Estado atual |
|--------|------------|---------|--------------|
| Fornecedores IA (ex. Provedores de LM) | `/auxiliares/lm-providers` | `lm_providers`, `lm_models` | Nome "Provedores de LM"; listagem + SplitView + cockpit; criar/editar/deletar; bug ao excluir abre o card. |
| Modelos IA | — | `lm_models` (com join em `lm_providers`) | **Não existe página dedicada.** Modelos hoje só aparecem dentro do cockpit do fornecedor. |
| Tipos de Agentes | `/auxiliares/agent-types` | `agent_types`, ref. `lm_providers`/`lm_models` | Listagem + SplitView + cockpit; criar/editar/deletar; mesmo bug ao excluir. |
| Agentes AI | `/agentes` | `agents`, ref. `agent_types`, `lm_providers`, `lm_models` | Listagem + SplitView + AgentCockpit; criar agente com diálogo; cards e cockpits podem divergir do padrão Projetos. |

### 1.3 Referência de qualidade (padrão a atingir)

- **Projetos** (`/projetos`): FilterBar, KPIs, Kanban + Lista, SplitView com ProjectCockpit, cards com barra lateral colorida, seções com ícones, badges no rodapé.
- **Cronogramas** (`/cronogramas`): Mesmo design system, período centralizado, views Agenda/Gantt/Lista.
- **Componentes de referência**: `ProjectKanbanCard`, `ProjectListView`, `SplitView`, `FilterBar`, `DashboardHeader`, `KPICard` — ver `docs/prd/specs/component-patterns.md` e `src/components/project/ProjectKanbanCard.tsx`.

---

## 2. Visão geral do resultado

O resultado esperado é **UX/UI 10/10** nos módulos em escopo, com CRUD completo, gestão 360° (listagem + SplitView/Cockpit), clareza de informações vinculadas e comportamento correto ao excluir (nenhum card abre). Critério de “10/10”: o usuário realiza todas as operações sem ambiguidade de labels, sem bugs de interação e com sensação visual e de fluxo alinhada a Projetos e Cronogramas. O objetivo secundário exige que, ao final, a engenharia e arquitetura estejam documentadas e atualizadas (padrão 10/10) para suportar novas demandas.

---

## 3. Padrões de qualidade — Engenharia e arquitetura

### 3.1 Estrutura de páginas e dados

- **Layout**: Toda rota sob `/auxiliares` ou `/agentes` deve usar o mesmo padrão de layout (SidebarProvider + AppSidebar + SidebarInset). Ver `.cursor/ARQUITETURA_PADRAO_PAGINAS.md`.
- **Server vs Client**: `page.tsx` = Server Component (auth, fetch); `*-content.tsx` = Client Component (estado, filtros, interação). Não fazer fetch de dados no Client; receber via props do Server.
- **Mutações**: Sempre via **Server Actions** em `src/app/actions/`; após sucesso, chamar `revalidatePath` da rota afetada e atualizar estado local (ex.: remover item da lista, fechar SplitView).
- **Tenant**: Todas as queries e inserts devem respeitar RLS e `tenant_id`; não expor dados de outro tenant.

### 3.2 Filtros e listagem

- Usar **FilterBar** + hook de filtros por módulo (ex.: `useLmProvidersFilters`, `useAgentTypesFilters`). Padrão em `src/lib/filters/` e `src/hooks/`.
- **Persistência**: `moduleId` e `storageKey` estáveis; ao renomear apenas labels (ex.: “Provedores de LM” → “Fornecedores IA”), manter `moduleId` e chave de storage para não perder preferências do usuário.
- **ViewMode**: Suportar pelo menos Kanban e Lista onde fizer sentido; mesma API de filtros (search, viewMode) em todos os módulos de listagem.

### 3.3 Navegação e sidebar

- **Menu Auxiliares**: Incluir “Fornecedores IA”, “Modelos IA”, “Tipos de Agentes” com títulos e ícones consistentes. Rota de Modelos IA: sugerido `/auxiliares/modelos-ia` (ou `/auxiliares/lm-models`).
- **Rotas**: Manter URLs estáveis; mudar apenas textos visíveis (título da página, sidebar, breadcrumb).

### 3.4 Ações destrutivas e seleção

- **Excluir**: Em listagem/card, o botão de excluir não deve propagar o evento de clique para o container clicável (ex.: linha ou card que abre o detalhe). Usar `e.stopPropagation()` no handler do botão.
- **Pós-exclusão**: Após exclusão bem-sucedida, limpar a seleção (ex.: `setSelectedProvider(null)`, `setSelectedAgentType(null)`) para que o SplitView feche e nenhum registro fique “aberto”.

---

## 4. Padrões de qualidade — UX/UI e design system

### 4.1 Referência obrigatória

- **ADR-003** (design system): `docs/prd/specs/adr/2026-02-ADR-003-design-system.md`.
- **Catálogo de componentes**: `docs/prd/specs/component-patterns.md` (DashboardHeader, KPICard, FilterBar, SplitView, KanbanBoard, ViewToggle, toasts Sonner, empty states).
- **Cores por status**: Usar as classes de status definidas no projeto (ex.: ativo/inativo, sistema); evitar cores hardcoded fora do design system.

### 4.2 Padrão de card (listagem e Kanban)

- **Estrutura visual**: Barra lateral colorida (ou bloco de ícone com cor de fundo) + conteúdo em seções + rodapé com badge de status, alinhado ao `ProjectKanbanCard`.
- **Seções**: Header (título + identificador secundário, ex.: nome + slug/código); metadados com ícone + label + valor; separadores visuais (`border-t border-border/30 pt-1`); rodapé com Badge de status.
- **Ações**: Botões (editar, excluir, alternar status) não devem acionar o clique do card/linha; usar `stopPropagation` ou estrutura (ex.: dropdown) que impeça abertura do detalhe ao clicar na ação.
- **Consistência**: Mesmo padrão de card em Fornecedores, Modelos IA, Tipos de Agentes e Agentes AI; conteúdo e labels específicos por contexto (fornecedor, modelo, tipo, agente).

### 4.3 Cockpits (SplitView)

- **SplitView**: Sempre que houver item selecionado, usar `SplitView` com `title` e `subtitle` preenchidos; `onClose` deve limpar a seleção.
- **Conteúdo**: Cockpits com seções claras (Tabs quando houver muitas informações); labels em português; exibir “Fornecedor / Modelo” (ou “Modelo padrão: Fornecedor / model_id”) de forma legível; link “Documentação” quando existir `docs_url`.
- **Empty/loading**: Tratar estados vazios e carregamento sem quebrar layout (skeleton ou mensagem amigável).

### 4.4 Formulários e labels

- **Labels**: “Fornecedor padrão” e “Modelo padrão” (não “default_model_provider”); “URL da documentação” com texto de ajuda quando for opcional; “Endpoint da API” para URL da API do fornecedor.
- **Placeholders e ajuda**: Inputs com placeholder e, quando útil, texto de ajuda abaixo (ex.: “Base para rotinas futuras de atualização” para docs_url).
- **Selects**: Provedor e modelo devem vir das tabelas `lm_providers` e `lm_models`; opção “Nenhum” ou equivalente quando o campo for opcional.

### 4.5 Acessibilidade e responsividade

- **WCAG 2.1 AA**: Labels associados a inputs; contraste adequado; navegação por teclado (tabIndex, Enter/Espace em itens clicáveis).
- **Responsivo**: Layout utilizável em mobile e desktop; tabelas/listas com scroll horizontal se necessário; SplitView com largura adequada (ex.: `width="lg"` ou `"wide"`).

---

## 5. Instruções para o modelo executor

### 5.0 Governança (pontos importantes)

- **Não seguir a documentação à risca:** Use os padrões documentados como referência. Analise e decida a melhor forma de entregar o resultado dentro do objetivo principal; se uma abordagem diferente for mais adequada, adote-a.
- **Alinhamento:** Mantenha-se alinhado às documentações de engenharia e arquitetura (ADR, component-patterns, ARQUITETURA_PADRAO_PAGINAS); use-as como base, não como camisa de força.
- **Atualizar documentação ao mudar o padrão:** Se suas decisões alterarem a versão atual (novo padrão de card, nova estrutura de página, nova convenção), **atualize** os artefatos afetados (ex.: `component-patterns.md`, `ARQUITETURA_PADRAO_PAGINAS.md`, ADRs) com a nova versão melhorada, garantindo engenharia e arquitetura 10/10 em todas as áreas relacionadas e documentação pronta para novas demandas.

### 5.1 Decisões que você deve tomar

- **Ordenação e filtros**: Quais colunas/campos usar para ordenação e busca em cada listagem (ex.: Modelos IA por nome, model_id, nome do fornecedor), respeitando o padrão FilterBar + hook existente.
- **Kanban vs Lista**: Onde Kanban por status (ex.: Ativo/Inativo) faz sentido; onde apenas Lista é suficiente. Manter consistência com Projetos e Fornecedores.
- **Novo módulo Modelos IA**: Definir estrutura da página (page + content), fonte de dados (Server Action ou query em page com join lm_models + lm_providers), e conteúdo do ModelCockpit (quais campos exibir, link para fornecedor/docs).
- **Nomenclatura**: Trocar “Provedores de LM” por “Fornecedores IA” em todos os pontos visíveis ao usuário (sidebar, título da página, diálogos, toasts, seção “Sobre”); manter `moduleId` e rotas para não quebrar persistência.

### 5.2 Referências e boas práticas

- **Arquivos de referência**: `docs/prd/specs/component-patterns.md`, `docs/prd/specs/adr/2026-02-ADR-003-design-system.md`, `.cursor/ARQUITETURA_PADRAO_PAGINAS.md`, `src/components/project/ProjectKanbanCard.tsx`, `src/app/projetos/projects-content.tsx`. Use como base; desvios são aceitáveis se melhorarem o resultado e forem documentados.
- **Componentes**: Preferir reutilizar `DashboardHeader`, `KPICard`, `FilterBar`, `SplitView`, `KanbanBoard`, `Card`, `Badge`, `Button`. Novos padrões ou componentes podem ser criados se justificados; nesse caso, atualizar o catálogo/ADR.
- **Server Actions**: Usar as existentes em `src/app/actions/`; criar novas só para operações inexistentes (ex.: listagem de modelos para Modelos IA).
- **Imports**: Absolutos com `@/`; named exports.

### 5.3 Restrições (não negociáveis)

- **Excluir:** Ao clicar em Excluir ou alternar status, não abrir card/detalhe: usar `stopPropagation` e, após delete com sucesso, limpar seleção.
- **Nomenclatura:** Usar “Fornecedores IA” em interface (nunca “Provedores de LM”).
- **Dados:** Não fazer fetch em Client Component para dados iniciais; usar Server (page.tsx) ou Server Actions. Respeitar RLS e `tenant_id`.

### 5.4 Critério de conclusão

- **Objetivo principal:** (1) Listar e filtrar em cada módulo; (2) abrir detalhe 360° ao clicar no item; (3) criar, editar e excluir com feedback claro; (4) após excluir, nenhum painel permanece aberto e nenhum card abre por engano; (5) labels e informações vinculadas claras; (6) visual e fluxo alinhados a Projetos e Cronogramas.
- **Objetivo secundário:** Engenharia e arquitetura documentadas e atualizadas com o que foi implementado (ex.: component-patterns, ARQUITETURA_PADRAO_PAGINAS, ADRs se houver mudança de decisão), 100% funcionais e acessíveis para novas demandas; padrão 10/10 nas áreas relacionadas.
- **Quality gates:** `npm run lint`, `npm run typecheck` sem erros; fluxos manuais de CRUD e 360° verificados.

---

## 6. Resumo dos entregáveis esperados

| Entregável | Descrição |
|------------|-----------|
| Renomear para “Fornecedores IA” | Sidebar, page metadata, títulos, diálogos, texto “Sobre”; manter rota e moduleId. |
| Módulo “Modelos IA” | Nova rota (ex.: `/auxiliares/modelos-ia`), página com listagem 360° (FilterBar, Kanban/Lista, SplitView + ModelCockpit), sidebar atualizada; design system e melhorias dos itens 4 e 5. |
| Correção ao excluir | Em Fornecedores e Tipos de Agentes: ao excluir não abrir nenhum registro; stopPropagation nos botões de ação; após delete, limpar seleção (SplitView fechado). |
| Cards padronizados | Mesmo padrão de design (Projetos/Cronogramas) em todos os cards; cada cadastro com contexto e informações específicas (fornecedor, modelo, tipo, agente). |
| Clareza UX/UI | Melhorar legendas, visualização e preenchimento nos cadastros de provedores, modelos e agentes AI; labels em português; “Fornecedor/Modelo padrão”; documentação e ajuda onde necessário. |
| Documentação atualizada (secundário) | Engenharia e arquitetura refletindo o implementado; padrão 10/10 documentado e acessível para novas demandas (component-patterns, ARQUITETURA_PADRAO_PAGINAS, ADRs se aplicável). |

---

*Este plano fornece contexto, objetivos principal e secundário, pontos importantes de governança e padrões de qualidade. O executor deve analisar e decidir a melhor forma de entregar o resultado, usar o código e a documentação como referência e, ao alterar a versão atual, atualizar a engenharia e arquitetura com a nova versão melhorada (padrão 10/10).*
