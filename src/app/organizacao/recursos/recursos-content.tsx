'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { OrgBreadcrumb } from '@/components/organization/OrgBreadcrumb';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/EmptyState';
import { Monitor, Truck, Wrench, FileText } from 'lucide-react';

interface RecursosContentProps {
  systems: unknown[];
  suppliers: unknown[];
  services: unknown[];
  documents: unknown[];
}

const VALID_TABS = ['sistemas', 'fornecedores', 'servicos', 'documentos'] as const;

export function RecursosContent({ systems, suppliers, services, documents }: RecursosContentProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const defaultTab: string =
    tabParam && VALID_TABS.includes(tabParam as (typeof VALID_TABS)[number])
      ? tabParam
      : 'sistemas';

  const hasAny =
    systems.length > 0 || suppliers.length > 0 || services.length > 0 || documents.length > 0;

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Recursos"
        subtitle="Sistemas, fornecedores, serviços e documentos organizacionais"
      />

      <div className="space-y-6 p-6">
        <OrgBreadcrumb items={[{ label: 'Recursos' }]} />

        {!hasAny ? (
          <EmptyState
            icon={Monitor}
            title="Nenhum recurso cadastrado"
            description="Cadastre sistemas, fornecedores, serviços e documentos utilizados na operação."
          />
        ) : (
          <Tabs defaultValue={defaultTab}>
            <TabsList>
              <TabsTrigger value="sistemas">Sistemas ({systems.length})</TabsTrigger>
              <TabsTrigger value="fornecedores">Fornecedores ({suppliers.length})</TabsTrigger>
              <TabsTrigger value="servicos">Serviços ({services.length})</TabsTrigger>
              <TabsTrigger value="documentos">Documentos ({documents.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="sistemas">
              <Card>
                <CardContent className="p-4">
                  {systems.length === 0 ? (
                    <p className="text-muted-foreground">Nenhum sistema cadastrado.</p>
                  ) : (
                    <p className="text-sm">Lista de sistemas em desenvolvimento.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="fornecedores">
              <Card>
                <CardContent className="p-4">
                  {suppliers.length === 0 ? (
                    <p className="text-muted-foreground">Nenhum fornecedor cadastrado.</p>
                  ) : (
                    <p className="text-sm">Lista de fornecedores em desenvolvimento.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="servicos">
              <Card>
                <CardContent className="p-4">
                  {services.length === 0 ? (
                    <p className="text-muted-foreground">Nenhum serviço cadastrado.</p>
                  ) : (
                    <p className="text-sm">Lista de serviços em desenvolvimento.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="documentos">
              <Card>
                <CardContent className="p-4">
                  {documents.length === 0 ? (
                    <p className="text-muted-foreground">Nenhum documento cadastrado.</p>
                  ) : (
                    <p className="text-sm">Lista de documentos em desenvolvimento.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
