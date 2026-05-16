'use client';

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { switchIntegrationVersion } from '@/app/actions/integration-version-switch';

interface APIVersionToggleProps {
  currentVersion: 'v1' | 'v2';
  onVersionChange?: (newVersion: 'v1' | 'v2') => void;
}

export function APIVersionToggle({
  currentVersion,
  onVersionChange
}: APIVersionToggleProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = async (checked: boolean) => {
    const newVersion = checked ? 'v2' : 'v1';
    
    if (newVersion === currentVersion) return;

    setIsLoading(true);
    setError(null);

    const result = await switchIntegrationVersion(newVersion);

    if (result.success) {
      onVersionChange?.(newVersion);
    } else {
      setError(result.message);
    }

    setIsLoading(false);
  };

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
      <Label htmlFor="api-version" className="text-sm font-medium">
        API Version
      </Label>
      
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">v1</span>
        <Switch
          id="api-version"
          checked={currentVersion === 'v2'}
          onCheckedChange={handleToggle}
          disabled={isLoading}
        />
        <span className="text-sm font-medium">v2</span>
      </div>

      {isLoading && (
        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
      )}

      {error && (
        <span className="text-sm text-red-600">{error}</span>
      )}

      <span className="text-xs text-gray-600 dark:text-gray-400 ml-auto">
        Active: {currentVersion.toUpperCase()}
      </span>
    </div>
  );
}
