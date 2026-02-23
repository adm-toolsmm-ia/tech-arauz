/**
 * Shared phase/status labels, styles, and color mappings.
 * Single source of truth — consumed by KanbanBoard, ProjectList, ProjectCockpit, Dashboard.
 */

// ───── Phase Labels (Kanban & List) ─────

export const phaseLabels: Record<string, string> = {
  fila_projetos: 'Fila de Projetos',
  fila_de_projetos: 'Fila de Projetos',
  levantamentos_iniciais: 'Levantamentos',
  analise_e_definicao_do_projeto: 'Análise/Definição',
  aprovacao_do_projeto: 'Aprovação',
  execucao_homologacao: 'Exec - Homolog',
  validacao_homologacao: 'Valid - Homolog',
  execucao_producao: 'Exec - Produção',
  validacao_producao: 'Valid - Produção',
  monitoramento_producao: 'Monitoramento',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
  suspenso: 'Suspenso',
  // Legacy
  projeto_futuro: 'Futuro',
  em_execucao: 'Em Execução',
  aguardando_fornecedor: 'Aguard. Fornecedor',
  em_assinatura: 'Em Assinatura',
};

// ───── Status Labels (Dashboard & Cockpit) ─────

export const statusLabels: Record<string, string> = {
  projeto_futuro: 'Projeto Futuro',
  fila_projetos: 'Fila de Projetos',
  em_aprovacao: 'Em Aprovação',
  em_desenvolvimento: 'Em Desenvolvimento',
  em_homologacao: 'Em Homologação',
  concluido: 'Concluído',
  aprovado_e_concluido: 'Aprovado e Concluído',
  cancelado: 'Cancelado',
  suspenso: 'Suspenso',
};

// ───── Status Styles (Badge color classes) ─────

export const statusStyles: Record<string, string> = {
  projeto_futuro: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  fila_projetos: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  em_aprovacao: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  em_execucao: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  em_desenvolvimento: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  execucao_homologacao: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  execucao_producao: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  em_homologacao: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  validacao_homologacao: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  validacao_producao: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  concluido: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  aprovado_e_concluido: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  monitoramento_producao: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  cancelado: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  suspenso: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
};

// ───── Priority Styles ─────

export const priorityStyles: Record<string, string> = {
  urgente:
    'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/30',
  alta: 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-900/30',
  normal:
    'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/30',
  media:
    'bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-900/30',
  baixa:
    'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-800',
};

export const priorityLabels: Record<string, string> = {
  urgente: 'Urgente',
  alta: 'Alta',
  media: 'Média',
  normal: 'Normal',
  baixa: 'Baixa',
};

// ───── Kanban Phase Colors ─────

export const phaseColors: Record<string, string> = {
  fila_projetos: 'blue',
  fila_de_projetos: 'blue',
  levantamentos_iniciais: 'amber',
  analise_e_definicao_do_projeto: 'amber',
  aprovacao_do_projeto: 'amber',
  execucao_homologacao: 'purple',
  validacao_homologacao: 'cyan',
  execucao_producao: 'purple',
  validacao_producao: 'cyan',
  monitoramento_producao: 'green',
  concluido: 'green',
  cancelado: 'red',
  suspenso: 'gray',
};

// ───── Phase Order (Kanban column sorting) ─────

export const phaseOrder = [
  'fila_projetos',
  'fila_de_projetos',
  'levantamentos_iniciais',
  'analise_e_definicao_do_projeto',
  'aprovacao_do_projeto',
  'execucao_homologacao',
  'validacao_homologacao',
  'execucao_producao',
  'validacao_producao',
  'monitoramento_producao',
  'concluido',
  'cancelado',
  'suspenso',
] as const;

// ───── Banned Phases (never shown as Kanban columns) ─────

export const bannedPhases = ['fila_projetos', 'fila_de_projetos'] as const;

// ───── Helper: Resolve a phase/status slug to a friendly label ─────

export function resolvePhaseLabel(slug: string, originalValue?: string | null): string {
  return (
    phaseLabels[slug] ||
    originalValue ||
    slug
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  );
}
