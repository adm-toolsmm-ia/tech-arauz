/**
 * @file Agents Store (React Query Hooks)
 * @description Query and mutation hooks for agent configuration
 *
 * Provides:
 * - Query hooks: useAgentsList(), useAgent(), useAgentVersions()
 * - Mutation hooks: useSaveDraft(), usePublish(), useRollback(), etc.
 * - Automatic cache invalidation
 * - Error handling and loading states
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import type {
  AgentHead,
  AgentConfig,
  AgentVersion,
  CreateAgentRequest,
  UpdateAgentDraftRequest,
  PublishAgentRequest,
  RollbackAgentRequest,
} from '@/types/agents';
import { agentsApiService, AgentServiceError } from './agentsApiService';

/**
 * Query Keys for cache management
 */
export const agentKeys = {
  all: ['agents'] as const,
  lists: () => [...agentKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...agentKeys.lists(), { ...filters }] as const,
  details: () => [...agentKeys.all, 'detail'] as const,
  detail: (id: string) => [...agentKeys.details(), id] as const,
  versions: (id: string) => [...agentKeys.detail(id), 'versions'] as const,
};

/**
 * Query: List all agents for current tenant
 */
export function useAgentsList(filters?: {
  status?: string;
  tag?: string;
  search?: string;
}): UseQueryResult<AgentHead[], Error> {
  return useQuery({
    queryKey: agentKeys.list(filters),
    queryFn: () => agentsApiService.listAgents(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Query: Get single agent (draft or published)
 */
export function useAgent(id: string): UseQueryResult<AgentHead, Error> {
  return useQuery({
    queryKey: agentKeys.detail(id),
    queryFn: () => agentsApiService.getAgent(id),
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: !!id,
  });
}

/**
 * Query: Get all versions of an agent
 */
export function useAgentVersions(
  id: string,
): UseQueryResult<AgentVersion[], Error> {
  return useQuery({
    queryKey: agentKeys.versions(id),
    queryFn: () => agentsApiService.getVersions(id),
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled: !!id,
  });
}

/**
 * Mutation: Create new agent
 */
export function useCreateAgentMutation(): UseMutationResult<
  AgentHead,
  AgentServiceError,
  CreateAgentRequest
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request) => agentsApiService.createAgent(request),
    onSuccess: (agent) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      toast.success(`Agent "${agent.name}" created!`);
    },
    onError: (error) => {
      toast.error(`Failed to create agent: ${error.message}`);
    },
  });
}

/**
 * Mutation: Save draft changes
 */
export function useSaveDraftMutation(): UseMutationResult<
  AgentConfig,
  AgentServiceError,
  { id: string; updates: UpdateAgentDraftRequest }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }) => agentsApiService.saveDraft(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.detail(id) });
      toast.success('Draft saved!');
    },
    onError: (error) => {
      toast.error(`Failed to save: ${error.message}`);
    },
  });
}

/**
 * Mutation: Publish agent (create immutable version)
 */
export function usePublishMutation(): UseMutationResult<
  AgentVersion,
  AgentServiceError,
  { id: string; request: PublishAgentRequest }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }) => agentsApiService.publish(id, request),
    onSuccess: (version, { id }) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: agentKeys.versions(id) });
      toast.success(`Agent published as v${version.version}!`);
    },
    onError: (error) => {
      toast.error(`Publish failed: ${error.message}`);
    },
  });
}

/**
 * Mutation: Rollback to previous version
 */
export function useRollbackMutation(): UseMutationResult<
  void,
  AgentServiceError,
  { id: string; request: RollbackAgentRequest }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }) => agentsApiService.rollback(id, request),
    onSuccess: (_, { id, request }) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.detail(id) });
      toast.success(`Rolled back to v${request.target_version}`);
    },
    onError: (error) => {
      toast.error(`Rollback failed: ${error.message}`);
    },
  });
}

/**
 * Mutation: Delete draft agent
 */
export function useDeleteDraftMutation(): UseMutationResult<
  void,
  AgentServiceError,
  string
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => agentsApiService.deleteDraft(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      toast.success('Draft deleted');
    },
    onError: (error) => {
      toast.error(`Delete failed: ${error.message}`);
    },
  });
}

/**
 * Mutation: Duplicate agent as new draft
 */
export function useDuplicateAsDraftMutation(): UseMutationResult<
  AgentHead,
  AgentServiceError,
  string
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => agentsApiService.duplicateAsDraft(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      toast.success('Agent duplicated!');
    },
    onError: (error) => {
      toast.error(`Duplicate failed: ${error.message}`);
    },
  });
}

/**
 * Mutation: Import agent from JSON
 */
export function useImportAgentMutation(): UseMutationResult<
  AgentHead,
  AgentServiceError,
  string
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (json) => agentsApiService.importVersion(json),
    onSuccess: (agent) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      toast.success(`Agent imported as draft: ${agent.name}`);
    },
    onError: (error) => {
      toast.error(`Import failed: ${error.message}`);
    },
  });
}

/**
 * Mutation: Export agent as JSON
 */
export function useExportAgentMutation(): UseMutationResult<
  string,
  AgentServiceError,
  string
> {
  return useMutation({
    mutationFn: (id) => agentsApiService.exportVersion(id),
    onSuccess: () => {
      toast.success('Exported to clipboard!');
    },
    onError: (error) => {
      toast.error(`Export failed: ${error.message}`);
    },
  });
}
