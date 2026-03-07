---
story: "8.6"
title: "Server Actions: CRUD de Documentos"
epic: "8 — Dashboards Documentados & Gestão 360° de Documentação"
agents: ["@dev", "@qa"]
status: done
---

# Story 8.6 — CRUD de Documentos

## Objetivo
Server Actions tipadas para gerenciar documentos com auth e validação.

## Entregáveis
- `src/app/actions/documents.ts`
- 5 Actions: `listDocumentsAction`, `getDocumentBySlugAction`, `createDocumentAction`, `updateDocumentAction`, `deleteDocumentAction`
- Discriminated union `AuthContext` para type-safe auth checks
- Slug auto-gerado com `slugify()`
- Validação: título (min 3), conteúdo (max 500k), categoria (enum)

## Critérios de Aceite
- [x] Auth check em todas as actions
- [x] Role-based: create/update = admin|manager, delete = admin
- [x] Revalidação de cache (`revalidatePath`)
- [x] Erro tratado para slug duplicado (23505)
