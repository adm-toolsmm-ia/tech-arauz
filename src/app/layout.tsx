import type { Metadata } from 'next';
import { Inter, DM_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Tech Arauz - Gestão de Projetos',
  description: 'SaaS de gestão de projetos de TI e inovação',
  keywords: ['gestão', 'projetos', 'TI', 'inovação', 'arauz'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} ${dmSans.variable} font-sans antialiased`}>
        <Providers>
          <ErrorBoundary label="App">
            {children}
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
