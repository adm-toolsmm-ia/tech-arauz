import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAsyncOperation } from '../useAsyncOperation';

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { toast } from 'sonner';

describe('useAsyncOperation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts in idle state', () => {
    const { result } = renderHook(() => useAsyncOperation());

    expect(result.current.status).toBe('idle');
    expect(result.current.isIdle).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('transitions to loading then success', async () => {
    const { result } = renderHook(() => useAsyncOperation<string>());

    await act(async () => {
      await result.current.execute(async () => 'result-data');
    });

    expect(result.current.status).toBe('success');
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.data).toBe('result-data');
    expect(result.current.error).toBeNull();
  });

  it('transitions to loading then error', async () => {
    const { result } = renderHook(() =>
      useAsyncOperation({ errorToast: false }),
    );

    await act(async () => {
      await result.current.execute(async () => {
        throw new Error('Operation failed');
      });
    });

    expect(result.current.status).toBe('error');
    expect(result.current.isError).toBe(true);
    expect(result.current.error?.message).toBe('Operation failed');
    expect(result.current.data).toBeNull();
  });

  it('calls onSuccess callback', async () => {
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useAsyncOperation({ onSuccess }));

    await act(async () => {
      await result.current.execute(async () => 'data');
    });

    expect(onSuccess).toHaveBeenCalledWith('data');
  });

  it('calls onError callback', async () => {
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useAsyncOperation({ onError, errorToast: false }),
    );

    await act(async () => {
      await result.current.execute(async () => {
        throw new Error('fail');
      });
    });

    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });

  it('shows success toast when configured', async () => {
    const { result } = renderHook(() =>
      useAsyncOperation({ successToast: 'Operacao concluida' }),
    );

    await act(async () => {
      await result.current.execute(async () => 'ok');
    });

    expect(toast.success).toHaveBeenCalledWith('Operacao concluida');
  });

  it('shows error toast by default', async () => {
    const { result } = renderHook(() => useAsyncOperation());

    await act(async () => {
      await result.current.execute(async () => {
        throw new Error('Something went wrong');
      });
    });

    expect(toast.error).toHaveBeenCalledWith('Something went wrong');
  });

  it('resets state', async () => {
    const { result } = renderHook(() => useAsyncOperation<string>());

    await act(async () => {
      await result.current.execute(async () => 'data');
    });

    expect(result.current.isSuccess).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.data).toBeNull();
  });

  it('retries on failure when retryCount is set', async () => {
    let callCount = 0;
    const { result } = renderHook(() =>
      useAsyncOperation<string>({ retryCount: 2, retryDelay: 10, errorToast: false }),
    );

    await act(async () => {
      await result.current.execute(async () => {
        callCount++;
        if (callCount < 3) throw new Error('fail');
        return 'success-after-retry';
      });
    });

    expect(callCount).toBe(3);
    expect(result.current.status).toBe('success');
    expect(result.current.data).toBe('success-after-retry');
  });

  it('passes AbortSignal to operation function', async () => {
    let receivedSignal: AbortSignal | undefined;
    const { result } = renderHook(() => useAsyncOperation<string>());

    await act(async () => {
      await result.current.execute(async (signal) => {
        receivedSignal = signal;
        return 'done';
      });
    });

    expect(receivedSignal).toBeInstanceOf(AbortSignal);
    expect(receivedSignal?.aborted).toBe(false);
  });

  it('aborts previous operation when execute is called again', async () => {
    const signals: AbortSignal[] = [];
    const { result } = renderHook(() => useAsyncOperation<string>());

    await act(async () => {
      // Start first operation (won't resolve immediately)
      const first = result.current.execute(async (signal) => {
        signals.push(signal!);
        await new Promise((r) => setTimeout(r, 100));
        return 'first';
      });

      // Start second operation immediately (aborts first)
      const second = result.current.execute(async (signal) => {
        signals.push(signal!);
        return 'second';
      });

      await Promise.all([first, second]);
    });

    expect(signals).toHaveLength(2);
    expect(signals[0].aborted).toBe(true);
    expect(signals[1].aborted).toBe(false);
    expect(result.current.data).toBe('second');
  });

  it('aborts in-flight operation on reset', async () => {
    let capturedSignal: AbortSignal | undefined;
    const { result } = renderHook(() => useAsyncOperation<string>());

    act(() => {
      // Start operation without awaiting
      result.current.execute(async (signal) => {
        capturedSignal = signal;
        await new Promise((r) => setTimeout(r, 500));
        return 'data';
      });
    });

    // Reset while operation is in flight
    act(() => {
      result.current.reset();
    });

    expect(capturedSignal?.aborted).toBe(true);
    expect(result.current.status).toBe('idle');
  });

  it('maintains stable execute reference across renders', () => {
    const { result, rerender } = renderHook(() => useAsyncOperation());

    const firstExecute = result.current.execute;
    rerender();
    const secondExecute = result.current.execute;

    expect(firstExecute).toBe(secondExecute);
  });
});
