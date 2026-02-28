'use client';

import { toast } from 'sonner';
import { CheckCircle2, XCircle, Info, AlertTriangle, Loader2 } from 'lucide-react';

/**
 * Async Feedback Patterns — Unified toast API
 * Story 2.23: Standardize all feedback across the app
 *
 * Usage:
 *   import { feedback } from '@/lib/feedback';
 *   await feedback.promise(asyncFn(), {
 *     loading: 'Salvando...',
 *     success: 'Salvo com sucesso!',
 *     error: 'Erro ao salvar.',
 *   });
 */

export const feedback = {
    success(message: string) {
        toast.success(message, {
            icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
            duration: 3000,
        });
    },

    error(message: string, detail?: string) {
        toast.error(message, {
            icon: <XCircle className="h-4 w-4 text-red-500" />,
            description: detail,
            duration: 5000,
        });
    },

    info(message: string) {
        toast.info(message, {
            icon: <Info className="h-4 w-4 text-blue-500" />,
            duration: 3000,
        });
    },

    warning(message: string) {
        toast(message, {
            icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
            duration: 4000,
        });
    },

    loading(message: string) {
        return toast.loading(message, {
            icon: <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />,
        });
    },

    dismiss(toastId?: string | number) {
        toast.dismiss(toastId);
    },

    async promise<T>(
        promise: Promise<T>,
        messages: { loading: string; success: string; error: string },
    ): Promise<void> {
        await toast.promise(promise, {
            loading: messages.loading,
            success: messages.success,
            error: messages.error,
        });
    },
};
