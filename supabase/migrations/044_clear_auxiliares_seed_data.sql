-- Migration 044: Clear seed data from auxiliares (Provedores, Modelos, Tipos de Agentes)
-- Epic 6: Auxiliares IA — Reset e Correções
-- Order respects FK constraints: break refs -> lm_models -> lm_providers -> agent_types

-- 1. Break agent_type_id references in agents (allows DELETE on agent_types)
UPDATE agents SET agent_type_id = NULL WHERE agent_type_id IS NOT NULL;

-- 2. Delete agent_templates (FK agent_type_id -> agent_types)
DELETE FROM agent_templates;

-- 3. Delete lm_models (FK provider_id -> lm_providers)
DELETE FROM lm_models;

-- 4. Delete lm_providers
DELETE FROM lm_providers;

-- 5. Delete agent_types
DELETE FROM agent_types;

-- Document: Tables lm_providers, lm_models, agent_types are now empty.
-- Recriação de provedores e modelos será feita manualmente após validação dos módulos.
