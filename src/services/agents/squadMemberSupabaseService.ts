/**
 * Membros de squad (agent_squad_members) — apenas agents com entity_kind = 'agent'.
 */

import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export class SquadMemberSupabaseService {
  static async listMemberIds(squadId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('agent_squad_members')
      .select('member_agent_id, sort_order')
      .eq('squad_id', squadId)
      .order('sort_order', { ascending: true });

    if (error) {
      throw new Error(`Falha ao listar membros do squad: ${error.message}`);
    }

    return (data || []).map((r) => r.member_agent_id as string);
  }

  /**
   * Substitui a lista de membros (ordem preservada pelo array).
   */
  static async replaceMembers(squadId: string, memberAgentIds: string[]): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: squad, error: squadErr } = await supabase
      .from('agents')
      .select('id, tenant_id, entity_kind')
      .eq('id', squadId)
      .single();

    if (squadErr || !squad) {
      throw new Error('Squad não encontrado');
    }
    if (squad.entity_kind !== 'squad') {
      throw new Error('O registro não é um squad');
    }

    const tenantId = squad.tenant_id as string;

    const { error: delErr } = await supabase
      .from('agent_squad_members')
      .delete()
      .eq('squad_id', squadId);

    if (delErr) {
      throw new Error(`Falha ao limpar membros: ${delErr.message}`);
    }

    const seen: Record<string, true> = {};
    const unique: string[] = [];
    for (const id of memberAgentIds) {
      if (!id || id === squadId || seen[id]) continue;
      seen[id] = true;
      unique.push(id);
    }
    if (unique.length === 0) return;

    const rows = unique.map((member_agent_id, index) => ({
      tenant_id: tenantId,
      squad_id: squadId,
      member_agent_id,
      sort_order: index,
      created_by: user.id,
      updated_by: user.id,
    }));

    const { error: insErr } = await supabase.from('agent_squad_members').insert(rows);

    if (insErr) {
      throw new Error(`Falha ao gravar membros: ${insErr.message}`);
    }
  }
}
