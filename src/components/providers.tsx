'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'sonner';
import { DarkModeProvider } from './providers/DarkModeProvider';
import { NotificationTester } from './notifications/NotificationTester';
import { AxeProvider } from './providers/AxeProvider';

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <DarkModeProvider>
      <QueryClientProvider client={queryClient}>
        <AxeProvider>{children}</AxeProvider>
        <Toaster
          position="bottom-right"
          richColors
          closeButton
          toastOptions={{
            duration: 4000,
          }}
        />
        <NotificationTester />
      </QueryClientProvider>
    </DarkModeProvider>
  );
};
