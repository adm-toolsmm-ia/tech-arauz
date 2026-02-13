---
id: 2026-02-13-rev-status
date: 2026-02-13
time: 19:00
trigger: Solicitação do usuário para corrigir status do projeto
status: SUCCESS
---

# 🧠 Agent Memory Log: Revisão de Status do Projeto

## 1. Contexto & Objetivo
**O que foi solicitado?**
> Alterar o armazenamento e exibição do status dos projetos. O campo `status` no banco de dados deve armazenar o valor cru da API (ex: "Em Execução") ao invés de slugs normalizados. Gráficos devem usar `status_original` (agora contendo os slugs ou valores antigos) para métricas.

**Por que isso é necessário?**
- [x] Alinhamento com a terminologia da API Espaider.
- [x] Exibição correta da "Situação" do projeto no card.
- [x] Manter integridade dos gráficos e Kanban que dependem de slugs.

---

## 2. Planejamento (Architecture & Strategy)
**Agentes Envolvidos:**
- [x] `@orchestrator`: Coordenação e Plano
- [x] `@backend-specialist`: Migração e Sync
- [x] `@frontend-specialist`: Kanban e Dashboard

**Plano de Execução:**
1. Renomear coluna `status` para `situacao_original` (Migration).
2. Ajustar transformadores (`project.ts`) para refletir a mudança.
3. Ajustar Sync (`espaider-sync.ts`) para salvar status cru em `situacao_original`.
4. Ajustar Kanban (`projects-content.tsx`) para normalizar slugs em tempo de execução.
5. Ajustar Dashboard (`page.tsx`) para usar `status_original` (Métrica).
6. Ajustar Cockpit (`ProjectCockpit.tsx`) para exibir campo cru.

---

## 3. Execução & Alterações
**Arquivos Modificados:**
| Arquivo                                     | Ação   | Justificativa                                                               |
| ------------------------------------------- | ------ | --------------------------------------------------------------------------- |
| `supabase/migrations/015_rename_status.sql` | Create | Renomear coluna no banco.                                                   |
| `src/lib/transformers/project.ts`           | Edit   | Atualizar interfaces e mapeamento DB -> UI.                                 |
| `src/lib/sync/espaider-sync.ts`             | Edit   | Remover normalização do campo principal e apontar para `situacao_original`. |
| `src/app/projetos/projects-content.tsx`     | Edit   | Garantir que Kanban receba slugs mesmo com dados crus.                      |
| `src/app/dashboard/page.tsx`                | Edit   | Apontar gráficos para `status_original` (Metric).                           |
| `src/components/project/ProjectCockpit.tsx` | Edit   | Exibir status cru e manter badge com status métrico.                        |

**Decisões Técnicas Críticas:**
- **Decisão:** Normalização no Frontend (Kanban)
  - *Contexto:* O Kanban depende de slugs fixos (`em_execucao`) para colunas. O banco agora retorna texto livre ("Em Execução").
  - *Consequência:* Adicionado `normalizeFaseSlug` no `projects-content.tsx` para garantir que o agrupamento visual funcione sem quebrar, mantendo a flexibilidade do banco.

---

## 4. Retrospectiva & Lições Aprendidas
**O que funcionou bem?**
- O plano de implementação foi validado pelos agentes virtuais e antecipou o problema do Kanban.

**O que pode melhorar (Erro/Ineficiência)?**
- A aplicação da migration via script falhou por falta do CLI `supabase`. O arquivo `.sql` foi criado, mas a aplicação depende de pipeline externo/manual.

**Contexto para Futuro:**
> Lembre-se que `situacao_original` agora é o campo principal de exibição de texto, enquanto `status_original` (ou `original_status` na UI) deve ser usado para lógica de negócios, cores e gráficos que dependem de valores conhecidos.
