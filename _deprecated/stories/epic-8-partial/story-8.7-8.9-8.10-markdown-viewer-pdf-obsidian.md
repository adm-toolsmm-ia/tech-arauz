---
story: "8.7 + 8.9 + 8.10"
title: "Markdown Viewer, PDF Export e Obsidian Layout"
epic: "8 — Dashboards Documentados & Gestão 360° de Documentação"
agents: ["@frontend", "@ux-design-expert", "@dev"]
status: done
---

# Stories 8.7, 8.9 e 8.10 — Motor de Documentação

## Objetivo
Construir a experiência Obsidian-like dentro do portal.

## Entregáveis

### 8.7 — MarkdownViewer
- Componente `src/components/docs/MarkdownViewer.tsx`
- react-markdown + remark-gfm + rehype-highlight + rehype-slug + rehype-autolink-headings
- TOC extraction automática via regex
- Prose classes com design tokens do projeto

### 8.9 — PdfExportButton
- Componente `src/components/docs/PdfExportButton.tsx`
- html2pdf.js com lazy import (dynamic import para reduzir bundle)
- Configuração A4: margens 15mm, escala 2x, pagebreak CSS

### 8.10 — Layout Obsidian
- `src/app/documentacao/documentacao-content.tsx` refatorado
- Sidebar esquerda: árvore por categorias com busca
- Área central: MarkdownViewer ou Editor split-view
- Sidebar direita: TOC do documento ativo
- Editor inline: textarea + preview side-by-side (só admin/manager)
- CRUD integrado: criar, editar, salvar, excluir

## Critérios de Aceite
- [x] GFM compliant (tabelas, code blocks, listas)
- [x] Syntax highlighting
- [x] TOC lateral funcional
- [x] PDF exporta com formatação
- [x] Editor split-view com preview real-time
- [x] Controle de permissão (viewer = read-only)
- [x] TypeScript: `npx tsc --noEmit` → Exit 0
