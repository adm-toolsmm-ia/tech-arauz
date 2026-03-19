/**
 * Dataset Feature Flags Panel
 * Allows admins to toggle individual Espaider dataset sync on/off
 * @see Story 15.13 - Feature Flag UI Dataset Control
 */

'use client';

import { useState } from 'react';
import type { EspaiderDataset } from '@/integrations/espaider/types';

const DATASETS: Array<{ id: EspaiderDataset; label: string; description: string }> = [
  { id: 'Projetos', label: 'Projetos', description: 'Project master data' },
  { id: 'Entregas', label: 'Entregas', description: 'Project deliverables' },
  { id: 'Cronogramas', label: 'Cronogramas', description: 'Project schedules' },
  { id: 'Requisitos', label: 'Requisitos', description: 'Project requirements' },
  { id: 'Historicos', label: 'Históricos', description: 'Project history' },
  { id: 'Orcamentos', label: 'Orçamentos', description: 'Project budgets' },
  { id: 'Aprovadores', label: 'Aprovadores', description: 'Project approvers' },
  { id: 'TempoPermanencia', label: 'Tempo Permanência', description: 'Time in phase' },
  { id: 'HorasLancadas', label: 'Horas Lançadas', description: 'Hours logged' },
];

interface DatasetFlags {
  [key: string]: boolean;
}

export function DatasetFeatureFlagsPanel() {
  const [flags, setFlags] = useState<DatasetFlags>(
    DATASETS.reduce(
      (acc, ds) => ({
        ...acc,
        [ds.id]: true, // Default: all enabled
      }),
      {},
    ),
  );

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleToggle = (datasetId: EspaiderDataset) => {
    setFlags((prev) => ({
      ...prev,
      [datasetId]: !prev[datasetId],
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // POST to /api/integrations/espaider/dataset-flags
      const response = await fetch('/api/integrations/espaider/dataset-flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flags }),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  const enabledCount = Object.values(flags).filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Dataset Sync Control</h3>
        <p className="text-sm text-gray-600">
          Toggle which Espaider datasets are synced ({enabledCount}/{DATASETS.length} enabled)
        </p>
      </div>

      <div className="grid gap-3">
        {DATASETS.map((dataset) => (
          <div key={dataset.id} className="flex items-center justify-between p-3 border rounded">
            <div className="flex-1">
              <label className="font-medium cursor-pointer">{dataset.label}</label>
              <p className="text-sm text-gray-500">{dataset.description}</p>
            </div>
            <button
              onClick={() => handleToggle(dataset.id)}
              className={`w-12 h-6 rounded-full transition-colors ${
                flags[dataset.id] ? 'bg-green-500' : 'bg-gray-300'
              }`}
              aria-label={`Toggle ${dataset.label}`}
              aria-pressed={flags[dataset.id]}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  flags[dataset.id] ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>

        {saved && <div className="text-sm text-green-600">✓ Saved successfully</div>}
      </div>
    </div>
  );
}
