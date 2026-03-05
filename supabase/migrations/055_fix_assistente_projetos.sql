-- Migration: Fix Assistente de Projetos

UPDATE public.agents 
SET 
  status = 'published', 
  usage_type = 'chatbot', 
  show_in_shortcut = true
WHERE name ILIKE '%assistente de projetos%' OR name ILIKE '%assistente%';
