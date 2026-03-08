'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, AlertCircle, TrendingDown, Link as LinkIcon, History } from 'lucide-react';
import { toast } from 'sonner';
import { RevisionsTab } from './tabs/RevisionsTab';
import { CostTab } from './tabs/CostTab';
import { IncidentsTab } from './tabs/IncidentsTab';
import { FallbackTab } from './tabs/FallbackTab';
import { ChangelogTab } from './tabs/ChangelogTab';

interface GovernancaContentProps {
  initialReviews: any[];
  initialCosts: any[];
  initialIncidents: any[];
  initialFallbackPolicies: any[];
  initialChangelog: any[];
  availableModels: any[];
  userId: string;
}

export function GovernancaContent({
  initialReviews,
  initialCosts,
  initialIncidents,
  initialFallbackPolicies,
  initialChangelog,
  availableModels,
  userId,
}: GovernancaContentProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [costs, setCosts] = useState(initialCosts);
  const [incidents, setIncidents] = useState(initialIncidents);
  const [fallbackPolicies, setFallbackPolicies] = useState(initialFallbackPolicies);
  const [changelog, setChangelog] = useState(initialChangelog);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revisões</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{reviews.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Períodos Monitorados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{costs.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Incidentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{incidents.length}</p>
            {incidents.some((i) => i.severity === 'critical') && (
              <AlertCircle className="mt-2 h-4 w-4 text-red-500" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fallback Policies</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{fallbackPolicies.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Alterações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{changelog.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="reviews" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="reviews" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Revisões
          </TabsTrigger>
          <TabsTrigger value="cost" className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Custo
          </TabsTrigger>
          <TabsTrigger value="incidents" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Incidentes
          </TabsTrigger>
          <TabsTrigger value="fallback" className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            Fallback
          </TabsTrigger>
          <TabsTrigger value="changelog" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Changelog
          </TabsTrigger>
        </TabsList>

        {/* TAB: REVISÕES */}
        <TabsContent value="reviews" className="mt-6">
          <RevisionsTab
            reviews={reviews}
            setReviews={setReviews}
            availableModels={availableModels}
          />
        </TabsContent>

        {/* TAB: CUSTO */}
        <TabsContent value="cost" className="mt-6">
          <CostTab costs={costs} availableModels={availableModels} />
        </TabsContent>

        {/* TAB: INCIDENTES */}
        <TabsContent value="incidents" className="mt-6">
          <IncidentsTab
            incidents={incidents}
            setIncidents={setIncidents}
            availableModels={availableModels}
          />
        </TabsContent>

        {/* TAB: FALLBACK */}
        <TabsContent value="fallback" className="mt-6">
          <FallbackTab
            policies={fallbackPolicies}
            setPolicies={setFallbackPolicies}
            availableModels={availableModels}
          />
        </TabsContent>

        {/* TAB: CHANGELOG */}
        <TabsContent value="changelog" className="mt-6">
          <ChangelogTab changelog={changelog} availableModels={availableModels} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
