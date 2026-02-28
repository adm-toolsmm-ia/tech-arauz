# Story 2.13 — Reorganizar Sidebar para PRD

Story ID: 2.13
Epic: PRD-UX-2026
Sprint: 1 — Fundação
Agente: @dev
Esforço: 4h
Prioridade: Alta
Gaps resolvidos: SYS-01

## Como usuário

Quero que a sidebar reflita a nova organização do PRD, com "Tecnologia & IA" e "Tabelas Auxiliares" como grupos explícitos, para que eu encontre os módulos facilmente.

## Critérios de aceite

- [ ] Grupo "Sistema" renomeado para "Tecnologia & IA" contendo: Agentes AI, Integrações, Usuários
- [ ] Grupo "Auxiliares" renomeado para "Tabelas Auxiliares" contendo: Tipos de Agentes, Modelos IA, Fornecedores IA
- [ ] "Tabelas Auxiliares" é o último grupo na sidebar
- [ ] "Tipos de Agentes" aparece APENAS em "Tabelas Auxiliares" (sem duplicidade)
- [ ] Nenhuma entrada de edição de Projetos/Cronogramas existe na sidebar
- [ ] Ícones mantidos ou ajustados conforme necessidade
- [ ] Testes visuais confirmam layout responsivo (sidebar colapsada)

## Implementação

### Arquivo principal: `src/components/sidebar/sidebar-config.ts`

1. Localizar array de grupos da sidebar
2. Renomear labels conforme PRD
3. Reorganizar itens por grupo
4. Remover duplicidades de "Tipos de Agentes"

### Testes

- [ ] Unit: config retorna grupos na ordem correta
- [ ] Visual: sidebar renderiza com novos nomes
- [ ] Regressão: navegação para cada módulo funciona

## Dependências

- Nenhuma (pode começar imediatamente)

## Definition of Done

- [ ] AC validados
- [ ] Code review aprovado
- [ ] Sem regressão de navegação
