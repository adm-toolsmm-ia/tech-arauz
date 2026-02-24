# Story 4: Notas do Projeto com Editor Rich Text

**ID**: STORY-004
**Status**: Ready
**Sprint**: 1
**Priority**: High
**Points**: 8

## User Story

As a project manager, I want a rich text notes editor within the project cockpit, so that I can document observations, decisions, and context directly on each project with formatting support.

## Acceptance Criteria

- [x] Migration 022 adiciona coluna `notes_html TEXT` na tabela projects
- [x] ProjectNotesEditor component criado com TipTap (StarterKit, Placeholder, Link)
- [x] Toolbar com opcoes de formatacao: negrito, italico, titulos, listas, links
- [x] Server Action `updateProjectNotesAction` com autenticacao, validacao de role (viewer bloqueado), validacao UUID e limite de 100k caracteres
- [x] Campo notes_html incluido no transformer (DBProject e UIProject) e no fluxo de dados
- [x] Aba Anotacoes adicionada ao ProjectCockpit com ProjectNotesEditor integrado
- [x] SplitView expandido com width `wide` (max-w-[min(90vw,1120px)]) para acomodar editor
- [ ] Migration 022 aplicada no Supabase (pendente execucao manual)
- [ ] Sanitizacao de HTML (DOMPurify) no save ou exibicao
- [ ] Validacao runtime de compatibilidade StarterKit v3 com extensao Link separada

## File List

- `supabase/migrations/022_add_project_notes.sql` -- Migration: coluna notes_html em projects
- `src/components/project/ProjectNotesEditor.tsx` -- Editor TipTap com toolbar, save e empty state
- `src/components/project/ProjectCockpit.tsx` -- Aba Anotacoes com ProjectNotesEditor integrado; notes_html no tipo UIProject
- `src/components/project/index.ts` -- Export do ProjectNotesEditor
- `src/app/actions/projects.ts` -- updateProjectNotesAction (auth, role, UUID, limite 100k chars, revalidatePath)
- `src/lib/transformers/project.ts` -- notes_html em DBProject, UIProject e dbProjectToUI
- `src/components/views/SplitView.tsx` -- Novos widths: 3xl, 4xl, wide
- `src/app/projetos/projects-content.tsx` -- width="wide" no SplitView; notes_html no tipo Project e objeto passado ao ProjectCockpit
- `.context/03-specs/component-patterns.md` -- Secao 3.3 SplitView (width + wide); nova 3.4 ProjectNotesEditor
- `.context/IMPLEMENTATIONS.md` -- Etapa 23 documentada

## Dev Notes

- **TipTap escolhido** (em vez de Markdown) por requisito de customizacao e UX moderna. Bundle estimado ~30-50 kB. Persistencia em HTML (notes_html).
- **Modelo simplificado**: 1 projeto = 1 bloco de anotacoes (coluna unica em projects, sem tabela separada project_notes). RLS de projects ja cobre.
- **Historico de versoes** de anotacoes esta fora do escopo inicial.
- **Dependencias TipTap** instaladas: @tiptap/react, @tiptap/starter-kit, @tiptap/extension-link, @tiptap/extension-placeholder.
- **Pendente**: Aplicar migration 022 no Supabase via `db:apply` ou manualmente. Sanitizacao HTML (DOMPurify) como melhoria futura.

## Change Log

- 2026-02-16: Implementado por Claude Code (frontend-specialist, backend-specialist, database-architect)
- 2026-02-19: Story criada retroativamente; migration 022 pendente aplicacao
- 2026-02-24: Validado por @po (Pax) — Score 8.2/10 — GO (condicional). Status In Progress → Ready com condicoes:
  * CONDICAO 1: Aplicar migration 022 via `npx supabase db push` antes do merge
  * CONDICAO 2: Adicionar AC esplicita: "Sanitizacao HTML com DOMPurify no save/display"
  * CONDICAO 3: Atualizar Criteria of Done para explicitar que migration 022 deve estar aplicada
