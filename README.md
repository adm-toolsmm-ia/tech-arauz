# Tech Araúz

> Sistema de Gestão 360° de TI, Inovação e Projetos para o escritório Araúz.

## Visão Geral

O **Portal Tech Arauz** centraliza a gestão de projetos, solicitações e métricas de TI, integrando-se com o ERP Espaider para sincronização automática de dados.

**Status atual**: 🚀 **Fase de Evolução/Implementação**
O sistema já conta com integração funcional com ERP, Dashboard de métricas, Gestão de Projetos (Kanban/Lista) e Gestão de Usuários.

---

## 🤖 Arquitetura AIOS (AI-Orchestrated System)

Este projeto utiliza **Synkra AIOS**, um meta-framework que orquestra agentes AI especializados para gerenciar fluxos de desenvolvimento complexos.

### 📐 Fonte de Verdade AIOS

| Documento | Caminho | O que define |
|-----------|---------|--------------|
| **Constituição** (6 regras inegociáveis) | [`.aios-core/constitution.md`](.aios-core/constitution.md) | Regras que NUNCA podem ser quebradas |
| **Agentes** (Personas e permissões) | [`.aios-core/development/agents/`](.aios-core/development/agents/) | Especialistas: @dev, @qa, @architect, @pm, @devops, etc. |
| **Tasks & Workflows** (Receitas executáveis) | [`.aios-core/development/tasks/`](.aios-core/development/tasks/) | Procedimentos passo-a-passo para cada tipo de trabalho |
| **Skills técnicas** | [`.agent/skills/`](.agent/skills/) | Receitas de especialidade (React, RLS, OWASP, Espaider...) |
| **Memória histórica** | [`.agent/memory/`](.agent/memory/) | Logs de implementações anteriores (aprendizado acumulado) |
| **Decisões arquiteturais** | [`.ai/decision-logs-index.md`](.ai/decision-logs-index.md) | ADRs (por que cada decisão foi tomada) |
| **Regras de projeto** | [`.claude/rules/`](.claude/rules/) | Agent Authority, Story Lifecycle, Workflow Execution, CodeRabbit, IDS |

### 🎯 Fluxo Padrão de Atendimento

```text
Você → @aios-master (analisa + monta equipe) → agentes especialistas → plano de ação conjunto
```

**Como ativar:**

- Agente: `@nome-do-agente` (exemplo: `@dev`, `@architect`, `@qa`)
- Comando: `*comando-do-agente` (exemplo: `*develop`, `*validate-story`)
- Mestre: `@aios-master` (orquestra automaticamente)

### 👥 Equipe de Especialistas

| Agente | Expertise | Quando usar |
|--------|-----------|-------------|
| `@aios-master` | Orquestração | Ponto de entrada para demandas complexas |
| `@pm` (Morgan) | Product Management | PRD, epics, roadmap |
| `@sm` (River) | Scrum Master | Stories, sprint planning |
| `@po` (Pax) | Product Owner | Validação de stories, priorização |
| `@architect` (Aria) | Arquitetura | Design de sistemas, ADRs, decisões técnicas |
| `@data-engineer` (Dara) | Banco de Dados | Supabase, RLS, migrations, Espaider, queries |
| `@dev` (Dex) | Implementação | Código, debug, APIs, testes unitários |
| `@frontend` | UI/React | Components, Next.js, Tailwind, design system |
| `@mobile` | App Mobile | React Native, Expo, iOS/Android |
| `@qa` (Quinn) | Quality Assurance | Testes E2E, quality gates, validação de critérios |
| `@security` | Segurança | OWASP, RLS audit, vulnerabilidades |
| `@devops` (Gage) | **ÚNICO** para git push | CI/CD, releases, infrastructure |
| `@analyst` | Pesquisa | Brainstorming, discovery, análise |
| `@ux-design-expert` | UX/Design | Wireframes, design system, research |

---

## 🧠 Contexto do Projeto (Regras de Negócio)

A documentação oficial de regras de negócio e requisitos reside EXCLUSIVAMENTE em `.context/`:

```text
.context/
├── 00-MASTER.md              # 👈 COMECE AQUI (Ponto de Entrada Único)
├── 01-foundation/            # Visão, Glossário e Escopo
├── 02-rules/                 # Regras de Negócio, Requisitos e Rotinas
└── 03-specs/                 # Especificações Técnicas e ADRs
```

> **Atenção:** Qualquer documentação fora desta estrutura (antiga pasta `docs`) foi migrada ou removida para garantir uma única fonte de verdade.

---

## 🚀 Como Executar

1. **Instalar dependências:**

   ```bash
   npm install
   ```

2. **Configurar ambiente:**

   Copie `.env.example` para `.env.local` e preencha as chaves (Supabase, Espaider Token).

3. **Rodar servidor de desenvolvimento:**

   ```bash
   npm run dev
   ```

4. **Rodar testes:**

   ```bash
   npm run test
   ```

5. **Comandos de DX:**
   - `npm run sync`: Sincroniza mudanças com GitHub (commit + push + rebase)
   - `npm run db:apply`: Aplica migrations do Supabase (idempotente)

---

## 📂 Estrutura do Projeto

```text
tech-arauz/
├── .agent/              # Configurações dos Agentes AI
├── .aios-core/          # Framework AIOS (constituição, agentes, tasks, workflows)
├── .context/            # Regras de Negócio ([Leia aqui](.context/README.md))
├── src/                 # Código Fonte ([Leia aqui](src/README.md))
│   ├── app/             # Frontend (Next.js App Router)
│   ├── components/      # UI Components (Shadcn/UI)
│   ├── integrations/    # Integrações Externas (Espaider API)
│   │   └── espaider/
│   │       └── references/ # Mocks e Docs Técnicos da API
│   └── lib/             # Utilitários e Core Logic
├── supabase/            # Banco de Dados & Migrations ([Leia aqui](supabase/README.md))
└── README.md            # Este arquivo
```

---

## 📄 Licença

Projeto interno do escritório Araúz.
