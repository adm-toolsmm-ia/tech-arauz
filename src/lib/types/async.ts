/**
 * Shared async operation state types.
 * Used by useAsyncOperation hook and will be extended by Story 2.10 (useAsyncFeedback).
 */

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncOperationState<T = unknown> {
  status: AsyncStatus;
  data: T | null;
  error: Error | null;
}

export interface AsyncOperationOptions<T = unknown> {
  /** Callback on successful completion */
  onSuccess?: (data: T) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
  /** Show toast on success (default: false) */
  successToast?: string;
  /** Show toast on error (default: true) */
  errorToast?: string | boolean;
  /** Number of retry attempts (default: 0) */
  retryCount?: number;
  /** Delay between retries in ms (default: 1000) */
  retryDelay?: number;
}

export const INITIAL_ASYNC_STATE: AsyncOperationState = {
  status: 'idle',
  data: null,
  error: null,
};
