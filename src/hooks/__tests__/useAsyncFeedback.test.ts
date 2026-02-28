import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { toast } from 'sonner';
import { useAsyncFeedback } from '../useAsyncFeedback';

describe('useAsyncFeedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial state', () => {
    it('starts in idle state with no inline message', () => {
      const { result } = renderHook(() => useAsyncFeedback());

      expect(result.current.status).toBe('idle');
      expect(result.current.isIdle).toBe(true);
      expect(result.current.inlineMessage).toBeNull();
      expect(result.current.inlineType).toBeNull();
    });
  });

  describe('Toast mode (default)', () => {
    it('shows success toast on success', async () => {
      const { result } = renderHook(() =>
        useAsyncFeedback({
          feedbackMode: 'toast',
          successToast: 'Salvo com sucesso!',
        }),
      );

      await act(async () => {
        await result.current.execute(async () => 'ok');
      });

      expect(toast.success).toHaveBeenCalledWith('Salvo com sucesso!');
      expect(result.current.inlineMessage).toBeNull();
    });

    it('shows error toast with context label on failure', async () => {
      const { result } = renderHook(() =>
        useAsyncFeedback({
          feedbackMode: 'toast',
          operationLabel: 'salvar projeto',
        }),
      );

      await act(async () => {
        await result.current.execute(async () => {
          throw new Error('Conexão recusada');
        });
      });

      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('salvar projeto'));
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Conexão recusada'));
    });

    it('does not set inlineMessage in toast mode', async () => {
      const { result } = renderHook(() => useAsyncFeedback({ feedbackMode: 'toast' }));

      await act(async () => {
        await result.current.execute(async () => {
          throw new Error('fail');
        });
      });

      expect(result.current.inlineMessage).toBeNull();
    });
  });

  describe('Inline mode', () => {
    it('sets inlineMessage on error', async () => {
      const { result } = renderHook(() =>
        useAsyncFeedback({
          feedbackMode: 'inline',
          operationLabel: 'validar campo',
        }),
      );

      await act(async () => {
        await result.current.execute(async () => {
          throw new Error('Valor inválido');
        });
      });

      expect(result.current.inlineMessage).toContain('Valor inválido');
      expect(result.current.inlineType).toBe('error');
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('clearInline resets inline state', async () => {
      const { result } = renderHook(() => useAsyncFeedback({ feedbackMode: 'inline' }));

      await act(async () => {
        await result.current.execute(async () => {
          throw new Error('Erro');
        });
      });

      expect(result.current.inlineMessage).not.toBeNull();

      act(() => {
        result.current.clearInline();
      });

      expect(result.current.inlineMessage).toBeNull();
      expect(result.current.inlineType).toBeNull();
    });
  });

  describe('State transitions', () => {
    it('transitions idle → loading → success', async () => {
      const states: string[] = [];

      const { result } = renderHook(() => useAsyncFeedback());

      const promise = act(async () => {
        states.push(result.current.status);
        await result.current.execute(async () => {
          states.push(result.current.status);
          return 'done';
        });
        states.push(result.current.status);
      });

      await promise;

      expect(states).toContain('idle');
      expect(result.current.isSuccess).toBe(true);
    });

    it('transitions to error state on failure', async () => {
      const { result } = renderHook(() => useAsyncFeedback({ feedbackMode: 'inline' }));

      await act(async () => {
        await result.current.execute(async () => {
          throw new Error('fail');
        });
      });

      expect(result.current.isError).toBe(true);
      expect(result.current.error?.message).toBe('fail');
    });
  });
});
