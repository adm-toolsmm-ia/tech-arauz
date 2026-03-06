# Story 4.11 — Project Cards: Visualização de Tempos de Permanência e Cronograma

Story ID: 4.11
Epic: Épico 4 — UX 10/10 e Painéis
Sprint: Atual
Agente: @dev
Esforço: 2h
Prioridade: Média-Alta
Status: TODO

## Como usuário

Como acompanhador de portfólio no Kanban,
Quero visualizar o tempo que o projeto está travado na etapa atual e o seu status de cronograma resumido diretamente nos cards do Kanban,
Para identificar rapidamente os gargalos e entregas sem precisar abrir modal por modal.

## Contexto

**Integração Espaider:** A integração atual já calcula exaustivamente os dias pelas etapas (via `TempoPermanenciaMapeado`) e exporta isso para a API.
No frontend (Supabase), já existe o dataset das fases com `tempo_permanencia_dias`.
Atualmente o `ProjectKanbanCard` só exibe "Prazo crítico", "Prazo Final", mas não diz *quantos dias* o card está travado nessa coluna "Fase Atual".

**Cronograma:** Da mesma forma, faltam indicativos visuais no Kanban se o projeto está com a entrega X atrasada no cronograma, ou uma barrinha simples (ex: "X/Y entregas").

**Solução:** 
1. Expandir o fetch da Kanban para buscar `project_tempo_permanencia` atrelado ao registro do projeto.
2. Injetar um Badge/texto de destaque (se atrasado: vermelho, se no prazo: cinza) mostrando os dias.
3. Adicionar uma representação visual simples de Cronograma/Entregas na List View ou no Kanban (dependendo do que não poluir o card). O usuário aprovou testar para ver como fica.

## Critérios de aceite

- [ ] A query Supabase que popula os projetos deve trazer os arrays necessários de tempo (nested).
- [ ] No JSX do `ProjectKanbanCard`, deve haver um local identificável para renderizar `X dias na fase atual`.
- [ ] O componente Gantt (`ProjectCronogramaMini.tsx` ou análogo) deve ser introduzido para dar hint no Kanban (texto ou mini-barra, a decidir no layout).
- [ ] UI consistente com os tokens atuais do Tailwind e modo escuro do Antigravity.
- [ ] O histórico *completo* da permanência permanece para o Cockpit (dentro do Card estendido, se aplicável, ou na aba Históricos/Entregas).
- [ ] RLS policies continuam estáveis sem crash de Supabase Join Limits.

## Tarefas de Implementação Pelo Mapeamento de @sm

### 1. Atualizar Types de Projetos (`useProjects`)
Adicionar a modelagem das relações necessárias para as novas exibições.

### 2. Criar/Refatorar Componentes Visuais
Atualizar `ProjectKanbanCard.tsx` adicionando as props de dias e a pílula visual indicando a duração na fase _current_.

---
**CodeRabbit Integration**
- [ ] Enviar PR com as modificações listadas para review estrito de UI/CSS
- [ ] Checagem especial: Certificar-se que o card do Kanban mantém a mesma altura/layout responsivo em telas HD e Full HD após exibir a nova informação.
