'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LogoutPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.signOut().then(() => {
      router.push('/login');
      router.refresh();
    });
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Saindo...</p>
    </main>
  );
}
