/**
 * @file Agents Store (React Query Hooks)
 * @description Query and mutation hooks for agent configuration (Supabase direct)
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import type { AgentHead } from '@/types/agents';
import { AgentSupabaseService } from './agentSupabaseService';

/**
 * Query Keys for cache management
 */
export const agentKeys = {
  all: ['agents'] as const,
  lists: () => [...agentKeys.all, 'list'] as const,
  details: () => [...agentKeys.all, 'detail'] as const,
  detail: (id: string) => [...agentKeys.details(), id] as const,
};

/**
 * Query: List all agents for current tenant
 */
export function useAgentsList(): UseQueryResult<AgentHead[], Error> {
  return useQuery({
    queryKey: agentKeys.lists(),
    queryFn: () => AgentSupabaseService.listAgents(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}

/**
 * Query: Get single agent
 */
export function useAgent(id: string): UseQueryResult<AgentHead, Error> {
  return useQuery({
    queryKey: agentKeys.detail(id),
    queryFn: () => AgentSupabaseService.getAgent(id),
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: !!id,
    retry: 1,
  });
}

/**
 * Mutation: Create agent
 */
export function useCreateAgentMutation(): UseMutationResult<
  AgentHead,
  Error,
  { name: string; slug: string; description?: string }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => AgentSupabaseService.createAgent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      toast.success('✅ Agente criado!');
    },
    onError: (error) => {
      toast.error(`❌ Erro: ${error.message}`);
    },
  });
}

/**
 * Mutation: Update agent
 */
export function useUpdateAgentMutation(): UseMutationResult<
  AgentHead,
  Error,
  { id: string; updates: Record<string, any> }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }) => AgentSupabaseService.updateAgent(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      toast.success('✅ Agente atualizado!');
    },
    onError: (error) => {
      toast.error(`❌ Erro: ${error.message}`);
    },
  });
}

/**
 * Mutation: Delete agent
 */
export function useDeleteAgentMutation(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => AgentSupabaseService.deleteAgent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      toast.success('✅ Agente deletado!');
    },
    onError: (error) => {
      toast.error(`❌ Erro: ${error.message}`);
    },
  });
}
