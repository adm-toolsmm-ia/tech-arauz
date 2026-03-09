'use client';

import Link from 'next/link';
import { FileText, Settings, Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/EmptyState';
import type { OrgSystem, OrgSystemResource } from '@/types/organization';

interface SystemCockpit360Props {
  system: OrgSystem;
  resources: OrgSystemResource[];
  onEdit?: () => void;
  onDelete?: () => void;
  onAddResource?: () => void;
  onEditResource?: (resource: OrgSystemResource) => void;
  onDeleteResource?: (resource: OrgSystemResource) => void;
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

export const SystemCockpit360: React.FC<SystemCockpit360Props> = ({
  system,
  resources,
  onEdit,
  onDelete,
  onAddResource,
  onEditResource,
  onDeleteResource,
}) => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="principal" className="w-full">
        <TabsList className="h-auto w-full justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="principal"
            className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <FileText className="mr-2 size-4" />
            Principal
          </TabsTrigger>
          <TabsTrigger
            value="recursos"
            className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <Settings className="mr-2 size-4" />
            Recursos
            {resources.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">({resources.length})</span>
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

          <section>
            <div className="mb-4 flex items-center gap-2 border-b pb-2">
              <FileText className="size-5 text-primary" />
              <h3 className="text-base font-semibold">Informações</h3>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <InfoField label="Descrição" value={system.description} />
              <InfoField label="Propósito" value={system.purpose} />
            </div>
          </section>

          <Link href="/organizacao/recursos?tab=sistemas">
            <Button variant="secondary" className="w-full">
              Ver Recursos
            </Button>
          </Link>
        </TabsContent>

        <TabsContent value="recursos" className="mt-6">
          {resources.length === 0 && !onAddResource ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Nenhum recurso cadastrado neste sistema
            </div>
          ) : resources.length === 0 && onAddResource ? (
            <EmptyState
              icon={Settings}
              title="Nenhum recurso cadastrado"
              description="Adicione recursos de sistema (módulos, integrações, etc.)."
              actionLabel="Adicionar recurso"
              onAction={onAddResource}
            />
          ) : (
            <div className="space-y-3">
              {onAddResource && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={onAddResource}
                >
                  <Plus className="h-4 w-4" />
                  Adicionar recurso
                </Button>
              )}
              {resources.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div>
                    <p className="text-sm font-medium">{r.name}</p>
                    {r.description && (
                      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                        {r.description}
                      </p>
                    )}
                  </div>
                  {(onEditResource || onDeleteResource) && (
                    <div className="flex gap-2">
                      {onEditResource && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onEditResource(r)}
                          title="Editar recurso"
                          aria-label={`Editar ${r.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {onDeleteResource && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => onDeleteResource(r)}
                          title="Excluir recurso"
                          aria-label={`Excluir ${r.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
