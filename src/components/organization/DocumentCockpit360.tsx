'use client';

import Link from 'next/link';
import { FileText, GitBranch, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RolesDisplay } from '@/components/organization/shared';
import type { OrgDocument } from '@/types/organization';

interface DocumentCockpit360Props {
  document: OrgDocument;
  processName?: string;
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

export const DocumentCockpit360: React.FC<DocumentCockpit360Props> = ({
  document,
  processName,
  onEdit,
  onDelete,
}) => {
  const roles = document.responsible_roles ?? [];

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
          {document.associated_process_id && (
            <TabsTrigger
              value="processo"
              className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:bg-transparent"
            >
              <GitBranch className="mr-2 size-4" />
              Processo
            </TabsTrigger>
          )}
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
            <CardContent className="grid gap-3 p-4 md:grid-cols-4">
              <div className="rounded-lg border p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Cadastro
                </p>
                <p className="mt-2 text-sm font-medium">{document.name}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Tipo
                </p>
                <p className="mt-2 text-sm font-medium">{document.type || 'Não definido'}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Processo
                </p>
                <p className="mt-2 text-sm font-medium">{processName || 'Sem vínculo'}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Responsáveis
                </p>
                <p className="mt-2 text-sm font-medium">
                  {roles.length > 0 ? `${roles.length} role(s)` : 'Nenhuma role'}
                </p>
              </div>
            </CardContent>
          </Card>

          <section>
            <div className="mb-4 flex items-center gap-2 border-b pb-2">
              <FileText className="text-primary size-5" />
              <h3 className="text-base font-semibold">Informações</h3>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <InfoField label="Descrição" value={document.description} />
              <InfoField label="Tipo" value={document.type} />
            </div>
          </section>

          <Link href="/organizacao/recursos?tab=documentos">
            <Button variant="secondary" className="w-full">
              Ver Recursos
            </Button>
          </Link>
        </TabsContent>

        {document.associated_process_id && (
          <TabsContent value="processo" className="mt-6">
            {processName ? (
              <Link href={`/organizacao/processos/${document.associated_process_id}/rotinas`}>
                <div className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors">
                  <div>
                    <p className="text-sm font-medium">{processName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Processo associado a este documento
                    </p>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="py-12 text-center text-sm text-muted-foreground">
                Processo não encontrado
              </div>
            )}
          </TabsContent>
        )}

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
