import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { dbProjectToUI } from '@/lib/transformers/project';
import type { DBProject } from '@/lib/transformers/project';
import { OperacoesContent } from './operacoes-content';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

export default async function OperacoesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Buscar profile do usuário
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  // Buscar todos os projetos, cronogramas, históricos, e entregas
  const { data: allProjects } = await supabase
    .from('projects')
    .select(
      `
      *,
      schedules:project_schedules(*),
      deliveries:project_deliveries(*),
      histories:project_histories(*),
      approvers:project_approvers(*)
    `,
    )
    .order('created_at', { ascending: false });

  // Transform DB rows to full UI format
  const allDbProjects = (allProjects as DBProject[]) || [];
  const projects = allDbProjects.map(dbProjectToUI);

  // Chart data: pass raw status and created_at for chart helpers
  const chartProjects = allDbProjects.map((p) => ({
    status: p.status_original || 'projeto_futuro',
    created_at: p.created_at || '',
    fase_atual: p.fase_atual || '',
    area: p.area || '',
    prazo_final: p.prazo_final || '',
    data_encerramento: p.data_encerramento || '',
    prioridade: p.prioridade || '',
    importancia_especial: p.importancia_especial || false,
    impacto_estrategico: p.impacto_estrategico || '',
    impacto_operacional: p.impacto_operacional || '',
    complexidade_tecnica: p.complexidade_tecnica || '',
    responsible: p.responsavel || '',
    budgets: p.budgets?.map((b) => ({ value: b.value || 0, currency: b.moeda || 'BRL' })) || [],
    histories: (p.histories || []).map((h) => ({
      date: h.date ?? '',
      step_from: h.step_from ?? '',
      step_to: h.step_to ?? '',
    })),
  }));

  return (
    <ErrorBoundary label="Dashboard Operações">
      <OperacoesContent
        user={user}
        profile={profile}
        projects={projects}
        chartProjects={chartProjects}
        rawDbProjects={allDbProjects}
      />
    </ErrorBoundary>
  );
}
