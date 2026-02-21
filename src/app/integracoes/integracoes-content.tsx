'use client';

import * as React from 'react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { APIManager } from '@/components/integracoes/APIManager';
import { LogViewer } from '@/components/integracoes/LogViewer';
import type { EspaiderApiRow } from './page';

// =============================================================================
// Types
// =============================================================================

interface IntegracoesContentProps {
  apis: EspaiderApiRow[];
  userRole: string;
  tenantId: string;
}

// =============================================================================
// Component: IntegracoesContent
//
// Página de Integrações simplificada com 2 componentes principais:
// 1. APIManager: Exibe cards de APIs + opção de sincronizar
// 2. LogViewer: Exibe histórico de logs com filtros e paginação
// =============================================================================

export function IntegracoesContent({
  apis: initialApis,
  userRole,
  tenantId,
}: IntegracoesContentProps) {
  const isAdmin = userRole === 'admin';

  return (
    <>
      <DashboardHeader
        title="Integrações"
        subtitle="Gerencie as APIs Espaider conectadas ao portal"
      />

      <div className="flex-1 space-y-6 p-6">
        {/* API Manager Component */}
        <APIManager />

        {/* Log Viewer Component - Admin Only */}
        {isAdmin && (
          <div className="mt-6">
            <LogViewer />
          </div>
        )}
      </div>
    </>
  );
}
