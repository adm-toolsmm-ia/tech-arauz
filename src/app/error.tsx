'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[App Error]', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-lg border-destructive/20">
        <CardContent className="flex flex-col items-center gap-6 pt-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Erro inesperado</h1>
            <p className="text-muted-foreground">
              Algo deu errado ao carregar esta pagina. Tente novamente ou volte para o inicio.
            </p>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <pre className="max-h-40 w-full overflow-auto rounded-md bg-muted p-4 text-left text-xs text-muted-foreground">
              {error.message}
              {error.digest && `\nDigest: ${error.digest}`}
            </pre>
          )}

          <div className="flex gap-3">
            <Button onClick={reset} size="default">
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar novamente
            </Button>
            <Button
              variant="outline"
              size="default"
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
