/**
 * @file LmModelsService
 * @description Service for managing LM Models in Supabase
 * Handles CRUD operations for AI models within providers
 */

import { createClient } from '@/lib/supabase/client';
import type { LmModel } from '@/types/agents';

export class LmModelsService {
  static async listModels(providerId?: string): Promise<LmModel[]> {
    const supabase = createClient();
    const { data: { user }, } = await supabase.auth.getUser();
    if (!user) { throw new Error('User not authenticated'); }

    let query = supabase
      .from('lm_models')
      .select('*');

    if (providerId) {
      query = query.eq('provider_id', providerId);
    }

    const { data, error } = await query
      .order('name', { ascending: true });

    if (error) { throw new Error(`Failed to list models: ${error.message}`); }
    return (data as LmModel[]) || [];
  }

  static async getModel(modelId: string): Promise<LmModel> {
    const supabase = createClient();
    const { data: { user }, } = await supabase.auth.getUser();
    if (!user) { throw new Error('User not authenticated'); }

    const { data, error } = await supabase
      .from('lm_models')
      .select('*')
      .eq('id', modelId)
      .single();

    if (error) { throw new Error(`Failed to get model: ${error.message}`); }
    return data as LmModel;
  }

  static async createModel(
    data: Omit<LmModel, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>
  ): Promise<LmModel> {
    const supabase = createClient();
    const { data: { user }, } = await supabase.auth.getUser();
    if (!user) { throw new Error('User not authenticated'); }

    const modelData = {
      ...data,
      created_by: user.id,
      updated_by: user.id,
    };

    const { data: created, error } = await supabase
      .from('lm_models')
      .insert([modelData])
      .select()
      .single();

    if (error) { throw new Error(`Failed to create model: ${error.message}`); }
    return created as LmModel;
  }

  static async updateModel(
    modelId: string,
    updates: Partial<LmModel>
  ): Promise<LmModel> {
    const supabase = createClient();
    const { data: { user }, } = await supabase.auth.getUser();
    if (!user) { throw new Error('User not authenticated'); }

    const { data, error } = await supabase
      .from('lm_models')
      .update({
        ...updates,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', modelId)
      .select()
      .single();

    if (error) { throw new Error(`Failed to update model: ${error.message}`); }
    return data as LmModel;
  }

  static async deleteModel(modelId: string): Promise<void> {
    const supabase = createClient();
    const { data: { user }, } = await supabase.auth.getUser();
    if (!user) { throw new Error('User not authenticated'); }

    // Get model first to check if it's a system model
    const model = await this.getModel(modelId);
    if (model.is_system) {
      throw new Error('System models cannot be deleted');
    }

    const { error } = await supabase
      .from('lm_models')
      .delete()
      .eq('id', modelId);

    if (error) { throw new Error(`Failed to delete model: ${error.message}`); }
  }
}
