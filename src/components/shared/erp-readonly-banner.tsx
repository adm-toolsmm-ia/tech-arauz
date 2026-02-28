'use client';

import { Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ErpReadOnlyBannerProps {
    variant: 'page' | 'card';
    timestamp?: Date | string | null;
    erpLink?: string;
}

export function ErpReadOnlyBanner({ variant, timestamp, erpLink }: ErpReadOnlyBannerProps) {
    const formattedTime = timestamp
        ? formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: ptBR })
        : null;

    const fullTimestamp = timestamp
        ? new Date(timestamp).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
        : null;

    if (variant === 'card') {
        return (
            <div
                role="status"
                aria-label="Dados somente leitura do ERP"
                className="flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300"
            >
                <Info className="h-4 w-4 shrink-0" />
                <span>
                    Somente leitura
                    {formattedTime && (
                        <span title={fullTimestamp ?? undefined}> · Atualizado {formattedTime}</span>
                    )}
                </span>
            </div>
        );
    }

    return (
        <div
            role="status"
            aria-label="Dados importados do ERP Espaider — somente leitura"
            className="flex items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300"
        >
            <div className="flex items-center gap-2">
                <Info className="h-4 w-4 shrink-0" />
                <span>
                    <strong>Fonte: ERP Espaider</strong> — somente leitura.
                    {fullTimestamp && (
                        <span title={fullTimestamp}> Atualizado às {fullTimestamp}.</span>
                    )}
                    {!fullTimestamp && ' Dados carregados do ERP.'}
                </span>
            </div>
            {erpLink && (
                <a
                    href={erpLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="whitespace-nowrap text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                >
                    Como editar? Acesse o ERP →
                </a>
            )}
        </div>
    );
}
