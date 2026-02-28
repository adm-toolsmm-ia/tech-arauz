'use client';

import { useEffect } from 'react';

/**
 * Ativa axe-core em modo desenvolvimento para detectar violações de acessibilidade
 * automaticamente no console do browser.
 * NÃO incluído em builds de produção.
 */
export function AxeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      import('@axe-core/react').then(({ default: axe }) => {
        import('react').then(({ default: React }) => {
          import('react-dom').then(({ default: ReactDOM }) => {
            void axe(React, ReactDOM, 1000);
          });
        });
      });
    }
  }, []);

  return <>{children}</>;
}
