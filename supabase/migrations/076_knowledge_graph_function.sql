-- Migration 076: Knowledge Graph Aggregation Function
-- Creates get_knowledge_graph() RPC that returns all nodes and links as JSON
-- Optimized for /api/knowledge/graph endpoint
-- 2026-03-21

CREATE OR REPLACE FUNCTION public.get_knowledge_graph(p_tenant_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  -- Security check: only allow access to caller's tenant
  IF p_tenant_id <> public.get_user_tenant_id() THEN
    RAISE EXCEPTION 'Unauthorized access to knowledge graph';
  END IF;

  -- Aggregate all entity types as nodes, and all relationships as links
  WITH
    -- Node aggregation from all org entities and documents
    areas_nodes AS (
      SELECT id, name, 'area' as entity_type, description FROM org_areas WHERE tenant_id = p_tenant_id
    ),
    nuclei_nodes AS (
      SELECT id, name, 'nucleus' as entity_type, description FROM org_nuclei WHERE tenant_id = p_tenant_id
    ),
    process_nodes AS (
      SELECT id, name, 'process' as entity_type, description FROM org_processes WHERE tenant_id = p_tenant_id
    ),
    routine_nodes AS (
      SELECT id, name, 'routine' as entity_type, description FROM org_routines WHERE tenant_id = p_tenant_id
    ),
    activity_nodes AS (
      SELECT id, name, 'activity' as entity_type, description FROM org_activities WHERE tenant_id = p_tenant_id
    ),
    system_nodes AS (
      SELECT id, name, 'system' as entity_type, description FROM org_systems WHERE tenant_id = p_tenant_id
    ),
    doc_nodes AS (
      SELECT id, title as name, 'document' as entity_type, summary as description
      FROM documents WHERE tenant_id = p_tenant_id AND is_published = true
    ),
    all_nodes AS (
      SELECT id, name, entity_type, description FROM areas_nodes
      UNION ALL SELECT id, name, entity_type, description FROM nuclei_nodes
      UNION ALL SELECT id, name, entity_type, description FROM process_nodes
      UNION ALL SELECT id, name, entity_type, description FROM routine_nodes
      UNION ALL SELECT id, name, entity_type, description FROM activity_nodes
      UNION ALL SELECT id, name, entity_type, description FROM system_nodes
      UNION ALL SELECT id, name, entity_type, description FROM doc_nodes
    ),
    -- Link aggregation from all relationship tables
    all_links AS (
      -- Organizational hierarchy: area → nucleus (contains)
      SELECT area_id::text as source, id::text as target, 'contains' as relation
      FROM org_nuclei WHERE tenant_id = p_tenant_id AND area_id IS NOT NULL

      UNION ALL
      -- Area/Nucleus → Process (contains)
      SELECT coalesce(area_id, nucleus_id)::text, id::text, 'contains'
      FROM org_processes
      WHERE tenant_id = p_tenant_id AND (area_id IS NOT NULL OR nucleus_id IS NOT NULL)

      UNION ALL
      -- Process → Routine (contains)
      SELECT process_id::text, id::text, 'contains'
      FROM org_routines WHERE tenant_id = p_tenant_id AND process_id IS NOT NULL

      UNION ALL
      -- Routine → Activity (contains)
      SELECT routine_id::text, id::text, 'contains'
      FROM org_activities WHERE tenant_id = p_tenant_id AND routine_id IS NOT NULL

      UNION ALL
      -- Process → System (uses)
      SELECT process_id::text, system_id::text, 'uses'
      FROM org_process_systems
      WHERE process_id IN (SELECT id FROM org_processes WHERE tenant_id = p_tenant_id)

      UNION ALL
      -- Activity → System (uses)
      SELECT activity_id::text, system_id::text, 'uses'
      FROM org_activity_systems WHERE tenant_id = p_tenant_id

      UNION ALL
      -- Document → Entity (references)
      SELECT document_id::text, entity_id::text, 'references'
      FROM document_entity_links WHERE tenant_id = p_tenant_id
    )
  SELECT json_build_object(
    'nodes', COALESCE(
      (SELECT json_agg(json_build_object(
        'id', an.id::text,
        'name', an.name,
        'type', an.entity_type,
        'description', an.description
      ) ORDER BY an.name)
      FROM all_nodes an),
      '[]'::json
    ),
    'links', COALESCE(
      (SELECT json_agg(json_build_object(
        'source', al.source,
        'target', al.target,
        'relation', al.relation
      ))
      FROM all_links al),
      '[]'::json
    ),
    'generatedAt', NOW()::text
  ) INTO result;

  RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_knowledge_graph(UUID) TO authenticated;
