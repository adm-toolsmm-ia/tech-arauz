/**
 * @file LmProvidersService
 * @description Service for managing LM Providers in Supabase
 * Handles CRUD operations for AI model providers
 */

import { createClient } from '@/lib/supabase/client';
import type { LmProvider } from '@/types/agents';

export class LmProvidersService {
  static async listProviders(): Promise<LmProvider[]> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('lm_providers')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Failed to list providers: ${error.message}`);
    }
    return (data as LmProvider[]) || [];
  }

  static async getProvider(providerId: string): Promise<LmProvider> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('lm_providers')
      .select('*')
      .eq('id', providerId)
      .single();

    if (error) {
      throw new Error(`Failed to get provider: ${error.message}`);
    }
    return data as LmProvider;
  }

  static async createProvider(
    data: Omit<LmProvider, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>,
  ): Promise<LmProvider> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const providerData = {
      ...data,
      created_by: user.id,
      updated_by: user.id,
    };

    const { data: created, error } = await supabase
      .from('lm_providers')
      .insert([providerData])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create provider: ${error.message}`);
    }
    return created as LmProvider;
  }

  static async updateProvider(
    providerId: string,
    updates: Partial<LmProvider>,
  ): Promise<LmProvider> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('lm_providers')
      .update({
        ...updates,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', providerId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update provider: ${error.message}`);
    }
    return data as LmProvider;
  }

  static async deleteProvider(providerId: string): Promise<void> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get provider first to check if it's a system provider
    const provider = await this.getProvider(providerId);
    if (provider.is_system) {
      throw new Error('System providers cannot be deleted');
    }

    const { error } = await supabase.from('lm_providers').delete().eq('id', providerId);

    if (error) {
      throw new Error(`Failed to delete provider: ${error.message}`);
    }
  }
}
