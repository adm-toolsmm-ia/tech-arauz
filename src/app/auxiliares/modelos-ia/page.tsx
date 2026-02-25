import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ModelsIaContent } from './modelos-ia-content';
import type { LmModel, LmProvider } from '@/types/agents';

export const metadata = {
  title: 'Modelos IA - Tech Arauz',
  description: 'Gerenciar modelos de linguagem dos fornecedores',
};

export default async function ModelsIaPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch models with provider info
  const { data: models, error: modelsError } = await supabase
    .from('lm_models')
    .select('*, lm_providers(id, name, slug, icon_emoji, color_hex)')
    .order('name', { ascending: true });

  // Fetch all providers for filters/selects
  const { data: providers, error: providersError } = await supabase
    .from('lm_providers')
    .select('*')
    .order('name', { ascending: true });

  if (modelsError || providersError) {
    console.error('Error fetching data:', modelsError || providersError);
  }

  return (
    <ModelsIaContent
      initialModels={(models as any[]) || []}
      initialProviders={(providers as LmProvider[]) || []}
    />
  );
}
