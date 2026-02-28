'use client';

/**
 * useAsyncFeedback — Story 2.10
 *
 * Extends useAsyncOperation with structured feedback:
 * - toast:  global events (sync complete, save success, network error)
 * - inline: local context (field error, validation, row-level feedback)
 *
 * Rule: toast for cross-cutting concerns; inline for scoped UI feedback.
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useAsyncOperation } from './useAsyncOperation';
import type { AsyncOperationOptions } from '@/lib/types/async';

export type FeedbackMode = 'toast' | 'inline' | 'both';

export interface AsyncFeedbackOptions<T = unknown> extends AsyncOperationOptions<T> {
  /**
   * Where to surface feedback:
   * - 'toast':  global toast notification (default for mutations/syncs)
   * - 'inline': inline message near the triggering UI element
   * - 'both':   both channels simultaneously
   */
  feedbackMode?: FeedbackMode;
  /** Context label shown in inline error: e.g. "Salvar projeto" → "Erro ao salvar projeto" */
  operationLabel?: string;
  /** Enable guided retry button in inline messages */
  showRetry?: boolean;
}

export interface AsyncFeedbackState {
  inlineMessage: string | null;
  inlineType: 'error' | 'success' | 'info' | null;
  clearInline: () => void;
}

export function useAsyncFeedback<T = unknown>(options: AsyncFeedbackOptions<T> = {}) {
  const { feedbackMode = 'toast', operationLabel, showRetry = false, ...asyncOptions } = options;

  const [inlineMessage, setInlineMessage] = useState<string | null>(null);
  const [inlineType, setInlineType] = useState<'error' | 'success' | 'info' | null>(null);
  const [retryFn, setRetryFn] = useState<(() => void) | null>(null);

  const showFeedback = useCallback(
    (type: 'success' | 'error', message: string, retry?: () => void) => {
      const useToast = feedbackMode === 'toast' || feedbackMode === 'both';
      const useInline = feedbackMode === 'inline' || feedbackMode === 'both';

      if (useToast) {
        if (type === 'success') toast.success(message);
        else toast.error(message);
      }

      if (useInline) {
        setInlineMessage(message);
        setInlineType(type);
        if (showRetry && retry) setRetryFn(() => retry);
      }
    },
    [feedbackMode, showRetry],
  );

  const clearInline = useCallback(() => {
    setInlineMessage(null);
    setInlineType(null);
    setRetryFn(null);
  }, []);

  const operation = useAsyncOperation<T>({
    ...asyncOptions,
    // Override toast handling — we manage it via showFeedback
    successToast: undefined,
    errorToast: false,
    onSuccess: (data) => {
      asyncOptions.onSuccess?.(data);
      if (asyncOptions.successToast) {
        showFeedback('success', asyncOptions.successToast);
      }
    },
    onError: (error) => {
      asyncOptions.onError?.(error);
      const label = operationLabel ? `Erro ao ${operationLabel.toLowerCase()}` : 'Erro na operação';
      const message = `${label}: ${error.message}`;
      showFeedback('error', message);
    },
  });

  const executeWithFeedback = useCallback(
    async (fn: (signal?: AbortSignal) => Promise<T>): Promise<T | null> => {
      clearInline();
      const result = await operation.execute(fn);
      return result;
    },
    [operation, clearInline],
  );

  return {
    ...operation,
    execute: executeWithFeedback,
    inlineMessage,
    inlineType,
    retryFn,
    clearInline,
  };
}
