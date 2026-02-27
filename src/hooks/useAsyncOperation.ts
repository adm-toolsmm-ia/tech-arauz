'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import type { AsyncOperationState, AsyncOperationOptions } from '@/lib/types/async';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useAsyncOperation<T = unknown>(options: AsyncOperationOptions<T> = {}) {
  const [state, setState] = useState<AsyncOperationState<T>>({
    status: 'idle',
    data: null,
    error: null,
  });

  const abortRef = useRef<AbortController | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Cleanup on unmount: abort any in-flight operation
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const execute = useCallback(
    async (operation: (signal?: AbortSignal) => Promise<T>): Promise<T | null> => {
      // Cancel any in-flight operation
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setState({ status: 'loading', data: null, error: null });

      const opts = optionsRef.current;
      const maxAttempts = (opts.retryCount ?? 0) + 1;
      const retryDelay = opts.retryDelay ?? 1000;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          if (controller.signal.aborted) return null;

          const data = await operation(controller.signal);

          if (controller.signal.aborted) return null;

          setState({ status: 'success', data, error: null });
          opts.onSuccess?.(data);

          if (opts.successToast) {
            toast.success(opts.successToast);
          }

          return data;
        } catch (err) {
          if (controller.signal.aborted) return null;

          const error = err instanceof Error ? err : new Error(String(err));

          // If we have retries left, wait and try again
          if (attempt < maxAttempts) {
            await delay(retryDelay);
            continue;
          }

          // Final failure
          setState({ status: 'error', data: null, error });
          opts.onError?.(error);

          if (opts.errorToast !== false) {
            const msg = typeof opts.errorToast === 'string' ? opts.errorToast : error.message;
            toast.error(msg);
          }

          return null;
        }
      }

      return null;
    },
    [],
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState({ status: 'idle', data: null, error: null });
  }, []);

  return {
    ...state,
    isIdle: state.status === 'idle',
    isLoading: state.status === 'loading',
    isSuccess: state.status === 'success',
    isError: state.status === 'error',
    execute,
    reset,
  };
}
