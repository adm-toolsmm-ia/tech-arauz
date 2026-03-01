import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { GovernancaContent } from './governanca-content';

export default async function GovernancaPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch governance data for all models
  const { data: reviews } = await supabase
    .from('model_governance_reviews')
    .select('*')
    .order('reviewed_at', { ascending: false });

  const { data: costs } = await supabase
    .from('model_cost_monitoring')
    .select('*')
    .order('period_end', { ascending: false });

  const { data: incidents } = await supabase
    .from('model_incidents')
    .select('*')
    .order('started_at', { ascending: false });

  const { data: fallbackPolicies } = await supabase
    .from('model_fallback_policies')
    .select('*')
    .eq('is_active', true);

  const { data: changelog } = await supabase
    .from('model_change_log')
    .select('*')
    .order('changed_at', { ascending: false });

  const { data: models } = await supabase
    .from('lm_models')
    .select('id, name, model_id')
    .order('name', { ascending: true });

  return (
    <div className="space-y-6 p-6">
      <DashboardHeader
        title="Governança de Modelos"
        subtitle="Revisões, custos, incidentes, fallbacks e histórico de mudanças"
      />
      <GovernancaContent
        initialReviews={reviews || []}
        initialCosts={costs || []}
        initialIncidents={incidents || []}
        initialFallbackPolicies={fallbackPolicies || []}
        initialChangelog={changelog || []}
        availableModels={models || []}
        userId={user.id}
      />
    </div>
  );
}
