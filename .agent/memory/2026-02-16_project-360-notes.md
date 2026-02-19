---
id: project-360-notes-2026-02-16
date: 2026-02-16
trigger: Implementação do plano Card maior e Anotações do Projeto (visão 360° + anotações com TipTap)
status: SUCCESS
---

# Agent Memory Log: Visão 360° (card maior) e Anotações do Projeto

## 1. Contexto & Objetivo

**O que foi solicitado?**
- Ampliar o painel de detalhes do projeto (SplitView) para visão 360° com mais espaço.
- Adicionar campo de anotações por projeto com editor de texto customizável (formatação rica), persistido e exibido na Visão 360°.

**Por que isso é necessário?**
- Muitas informações vinculadas ao projeto exigem mais área de leitura no painel.
- Anotações estruturadas (negrito, listas, títulos, links) melhoram organização e rastreabilidade por projeto.

---

## 2. Planejamento (Architecture & Strategy)

**Agentes Envolvidos:**
- orchestrator: coordenação do plano
- frontend-specialist: SplitView, ProjectNotesEditor, ProjectCockpit, tipos e dados
- backend-specialist: Server Action updateProjectNotesAction
- database-architect: migration 022 (notes_html)

**Plano de Execução:**
1. Estender SplitView com width 3xl, 4xl, wide; usar wide na página de projetos.
2. Migration 022: adicionar coluna notes_html em projects.
3. Implementar updateProjectNotesAction em projects.ts.
4. Incluir notes_html no transformer e tipos (DB e UI).
5. Criar ProjectNotesEditor com TipTap (StarterKit, Placeholder, Link), toolbar e save.
6. Adicionar aba Anotações no ProjectCockpit e integrar ProjectNotesEditor.
7. Atualizar IMPLEMENTATIONS.md, component-patterns e criar memory log.

---

## 3. Execução & Alterações

**Arquivos Modificados:**

| Arquivo | Ação | Justificativa |
|---------|------|----------------|
| `src/components/views/SplitView.tsx` | Edit | Novos width: 3xl, 4xl, wide (max-w-[min(90vw,1120px)]) |
| `src/app/projetos/projects-content.tsx` | Edit | width="wide" no SplitView; notes_html no tipo Project e no objeto passado ao ProjectCockpit |
| `.context/03-specs/component-patterns.md` | Edit | Seção 3.3 SplitView (width + wide); nova 3.4 ProjectNotesEditor; pasta project/ na estrutura |
| `supabase/migrations/022_add_project_notes.sql` | Create | Coluna notes_html em projects |
| `src/app/actions/projects.ts` | Edit | updateProjectNotesAction (auth, role, UUID, limite 100k chars, revalidatePath) |
| `src/lib/transformers/project.ts` | Edit | notes_html em DBProject, UIProject e dbProjectToUI |
| `src/components/project/ProjectNotesEditor.tsx` | Create | Editor TipTap, toolbar, save, empty state |
| `src/components/project/ProjectCockpit.tsx` | Edit | notes_html em UIProject; aba Anotações com ProjectNotesEditor |
| `.context/IMPLEMENTATIONS.md` | Edit | Etapa 23; pasta project/ na estrutura |
| `.agent/memory/2026-02-16_project-360-notes.md` | Create | Memory log (este arquivo) |

**Decisões Técnicas Críticas:**
- **Decisão:** TipTap (não Markdown) para anotações.
  - *Contexto:* Requisito de “alto nível de customização” e UX moderna.
  - *Consequência:* Bundle ~30–50 kB; persistência em HTML (notes_html).
- **Decisão:** Coluna única notes_html em projects (sem tabela project_notes).
  - *Contexto:* Modelo 1 projeto = 1 bloco de anotações; RLS já cobre projects.
  - *Consequência:* Histórico de versões de anotações fora do escopo inicial.

---

## 4. Retrospectiva & Lições Aprendidas

**O que funcionou bem?**
- Seguir o plano na ordem (SplitView → migration → action → data → editor → cockpit → docs) evitou retrabalho.
- Reutilizar o padrão de updateProjectStatusAction para updateProjectNotesAction manteve consistência e segurança (tenant_id, role viewer bloqueado).

**O que pode melhorar (Erro/Ineficiência)?**
- StarterKit v3 já inclui Link; adicionar extensão Link separada pode gerar duplicata em algumas versões — validar em runtime ou desabilitar link no StarterKit e usar só a extensão Link customizada se necessário.
- Sanitização de HTML (ex.: DOMPurify) no save ou na exibição fica como melhoria futura.

**Contexto para Futuro:**
- Para aplicar a migration 022 no Supabase: rodar `db:apply` ou aplicar manualmente o SQL; RLS em projects já permite UPDATE para admin/user.
- Dependências TipTap foram instaladas via npm (@tiptap/react, @tiptap/starter-kit, @tiptap/extension-link, @tiptap/extension-placeholder).
