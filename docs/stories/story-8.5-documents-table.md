---
story: "8.5"
title: "Modelagem de Dados: Tabela documents"
epic: "8 — Dashboards Documentados & Gestão 360° de Documentação"
agents: ["@data-engineer", "@security"]
status: done
---

# Story 8.5 — Tabela `documents`

## Objetivo
Criar tabela `documents` no Supabase para armazenar documentação Markdown.

## Entregáveis
- Migration `048_create_documents_table.sql`
- Enum `document_category` (manual, regra_negocio, arquitetura, guia)
- RLS: leitura por tenant, escrita admin/manager, deleção admin
- Trigger `updated_at`
- Indexes por slug, category, published

## Critérios de Aceite
- [x] Migration idempotente (IF NOT EXISTS)
- [x] RLS granular por operação
- [x] Constraint UNIQUE(tenant_id, slug)
- [x] Título mínimo 3 caracteres (CHECK)
