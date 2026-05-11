'use client';

import Link from 'next/link';
import { FileText, ShieldCheck, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RolesDisplay } from '@/components/organization/shared';
import type { OrgService } from '@/types/organization';

interface ServiceCockpit360Props {
  service: OrgService;
  onEdit?: () => void;
  onDelete?: () => void;
}

interface InfoFieldProps {
  label: string;
  value: string | null | undefined;
}

const InfoField: React.FC<InfoFieldProps> = ({ label, value }) => {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || '-'}</p>
    </div>
  );
};

export const ServiceCockpit360: React.FC<ServiceCockpit360Props> = ({
  service,
  onEdit,
  onDelete,
}) => {
  const roles = service.responsible_roles ?? [];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="principal" className="w-full">
        <TabsList className="h-auto w-full justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="principal"
            className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:bg-transparent"
          >
            <FileText className="mr-2 size-4" />
            Principal
          </TabsTrigger>
          <TabsTrigger
            value="responsaveis"
            className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:bg-transparent"
          >
            <ShieldCheck className="mr-2 size-4" />
            Responsáveis
            {roles.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">({roles.length})</span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="principal" className="mt-6 space-y-8">
          {(onEdit || onDelete) && (
            <div className="flex justify-end gap-2">
              {onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  Editar
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDelete}
                  className="text-destructive hover:text-destructive"
                >
                  Excluir
                </Button>
              )}
            </div>
          )}

          <Card className="border-dashed">
            <CardContent className="grid gap-3 p-4 md:grid-cols-3">
              <div className="rounded-lg border p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Cadastro
                </p>
                <p className="mt-2 text-sm font-medium">{service.name}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Responsáveis
                </p>
                <p className="mt-2 text-sm font-medium">
                  {roles.length > 0 ? `${roles.length} role(s)` : 'Nenhuma role'}
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Tipo
                </p>
                <p className="mt-2 text-sm font-medium">Serviço operacional</p>
              </div>
            </CardContent>
          </Card>

          <section>
            <div className="mb-4 flex items-center gap-2 border-b pb-2">
              <Wrench className="text-primary size-5" />
              <h3 className="text-base font-semibold">Informações</h3>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <InfoField label="Descrição" value={service.description} />
            </div>
          </section>

          <Link href="/organizacao/recursos?tab=servicos">
            <Button variant="secondary" className="w-full">
              Ver Recursos
            </Button>
          </Link>
        </TabsContent>

        <TabsContent value="responsaveis" className="mt-6 space-y-6">
          <section>
            <div className="mb-4 flex items-center gap-2 border-b pb-2">
              <ShieldCheck className="text-primary size-5" />
              <h3 className="text-base font-semibold">Roles responsáveis</h3>
            </div>
            <RolesDisplay roles={roles} maxDisplay={6} />
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
};
