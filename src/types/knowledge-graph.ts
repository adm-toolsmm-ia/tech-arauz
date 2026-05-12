/**
 * Knowledge Graph Types
 * Defines all types for the knowledge portal and graph visualization
 */

export type GraphNodeType =
  | 'document'
  | 'process'
  | 'area'
  | 'nucleus'
  | 'activity'
  | 'system'
  | 'routine'
  | 'skill';

export type LinkRelationType = 'contains' | 'uses' | 'references';

export interface GraphNode {
  id: string;
  name: string;
  type: GraphNodeType;
  description: string | null;
  // Runtime fields added by react-force-graph-2d
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number;
  fy?: number;
}

export interface GraphLink {
  source: string; // node id
  target: string; // node id
  relation: LinkRelationType;
}

export interface KnowledgeGraphData {
  nodes: GraphNode[];
  links: GraphLink[];
  generatedAt?: string;
}

export interface KnowledgeDocument {
  id: string;
  tenant_id: string;
  title: string;
  slug: string;
  content_md: string;
  category: 'manual' | 'regra_negocio' | 'arquitetura' | 'guia';
  author_id: string | null;
  is_published: boolean;
  reading_time_minutes: number;
  tags: string[];
  summary: string | null;
  view_count: number;
  cover_image_url: string | null;
  search_vector?: string; // postgres tsvector, returned as string
  created_at: string;
  updated_at: string;
}

export interface DocumentEntityLink {
  id: string;
  tenant_id: string;
  document_id: string;
  entity_type: Exclude<GraphNodeType, 'document'>;
  entity_id: string;
  link_label: string | null;
  created_at: string;
}

export interface KnowledgeDocumentsResponse {
  documents: KnowledgeDocument[];
  total: number;
  nextCursor: string | null;
  hasMore: boolean;
}

export interface KnowledgeGraphResponse {
  nodes: GraphNode[];
  links: GraphLink[];
  generatedAt: string;
}

export interface APIError {
  error: string;
  statusCode: number;
  timestamp: string;
}

export const GRAPH_NODE_COLORS: Record<GraphNodeType, string> = {
  document: '#3b82f6', // blue-500
  process: '#22c55e', // green-500
  area: '#f97316', // orange-500
  activity: '#14b8a6', // teal-500
  system: '#a855f7', // purple-500
  nucleus: '#eab308', // yellow-500
  routine: '#6b7280', // gray-500
  skill: '#06b6d4', // cyan-500
};

export const GRAPH_NODE_LABELS: Record<GraphNodeType, string> = {
  document: 'Documento',
  process: 'Processo',
  area: 'Área',
  activity: 'Atividade',
  system: 'Sistema',
  nucleus: 'Núcleo',
  routine: 'Rotina',
  skill: 'Habilidade',
};

export const DOCUMENT_CATEGORIES = ['manual', 'regra_negocio', 'arquitetura', 'guia'] as const;

export const DOCUMENT_CATEGORY_LABELS: Record<(typeof DOCUMENT_CATEGORIES)[number], string> = {
  manual: 'Manuais',
  regra_negocio: 'Regras de Negócio',
  arquitetura: 'Arquitetura',
  guia: 'Guias',
};
