'use client';

import * as React from 'react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { APIManager } from '@/components/integracoes/APIManager';
import { LogViewer } from '@/components/integracoes/LogViewer';
import { DatasetFeatureFlagsPanel } from '@/components/integrations/DatasetFeatureFlagsPanel';

// =============================================================================
// Types
// =============================================================================

interface IntegracoesContentProps {
  userRole: string;
}

// =============================================================================
// Component: IntegracoesContent
//
// Connects APIManager ↔ LogViewer via shared state:
// - APIManager.onViewLogs → sets datasetFilter on LogViewer
// - APIManager.onSyncComplete → triggers LogViewer refresh via key
// =============================================================================

export function IntegracoesContent({ userRole }: IntegracoesContentProps) {
  const isAdmin = userRole === 'admin';
  const [datasetFilter, setDatasetFilter] = React.useState<string | undefined>(undefined);
  const [logViewerKey, setLogViewerKey] = React.useState(0);

  const handleViewLogs = React.useCallback((dataset?: string) => {
    setDatasetFilter(dataset || undefined);
  }, []);

  const handleSyncComplete = React.useCallback(() => {
    // Increment key to force LogViewer re-mount and re-fetch
    setLogViewerKey((prev) => prev + 1);
  }, []);

  return (
    <>
      <DashboardHeader
        title="Integrações"
        subtitle="Gerencie as APIs Espaider conectadas ao portal"
      />

      <div className="flex-1 space-y-6 p-6">
        {/* API Manager */}
        <APIManager onViewLogs={handleViewLogs} onSyncComplete={handleSyncComplete} />

        {/* Dataset Feature Flags — visible for admin only */}
        {isAdmin && <DatasetFeatureFlagsPanel />}

        {/* Log Viewer — visible for admin and user roles (API enforces auth) */}
        {['admin', 'user'].includes(userRole) && (
          <LogViewer key={logViewerKey} datasetFilter={datasetFilter} />
        )}
      </div>
    </>
  );
}
