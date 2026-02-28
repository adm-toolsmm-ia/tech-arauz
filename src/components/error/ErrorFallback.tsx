'use client';

import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ErrorFallbackProps {
  error: Error | null;
  onRetry?: () => void;
  label?: string;
}

export function ErrorFallback({ error, onRetry, label }: ErrorFallbackProps) {
  return (
    <div className="flex min-h-[300px] items-center justify-center p-6">
      <Card className="w-full max-w-md border-destructive/20">
        <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Algo deu errado{label ? ` em ${label}` : ''}</h3>
            <p className="text-sm text-muted-foreground">
              Ocorreu um erro inesperado. Tente novamente ou volte para a pagina inicial.
            </p>
          </div>

          {error && process.env.NODE_ENV === 'development' && (
            <pre className="max-h-32 w-full overflow-auto rounded-md bg-muted p-3 text-left text-xs text-muted-foreground">
              {error.message}
            </pre>
          )}

          <div className="flex gap-2">
            {onRetry && (
              <Button onClick={onRetry} variant="default" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Tentar novamente
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => (window.location.href = '/dashboard')}
            >
              <Home className="mr-2 h-4 w-4" />
              Pagina inicial
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Se o problema persistir, entre em contato com o suporte.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
