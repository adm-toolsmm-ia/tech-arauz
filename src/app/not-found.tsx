import { FileQuestion, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-lg">
        <CardContent className="flex flex-col items-center gap-6 pt-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <FileQuestion className="h-8 w-8 text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-bold">404</h1>
            <h2 className="text-xl font-semibold">Pagina nao encontrada</h2>
            <p className="text-muted-foreground">
              A pagina que voce procura nao existe ou foi movida.
            </p>
          </div>

          <div className="flex gap-3">
            <Button asChild size="default">
              <Link href="/dashboard">
                <Home className="mr-2 h-4 w-4" />
                Pagina inicial
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
