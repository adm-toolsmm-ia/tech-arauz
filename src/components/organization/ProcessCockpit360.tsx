'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GitBranch, FileText, ClipboardList, Users, Monitor, Plus, Unlink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EmptyState } from '@/components/ui/EmptyState';
import type { OrgProcess, OrgRoutine, OrgSystem } from '@/types/organization';

interface ProcessCockpit360Props {
  process: OrgProcess;
  areaName?: string;
  nucleusName?: string;
  routines: OrgRoutine[];
  systems?: OrgSystem[];
  allSystems?: OrgSystem[];
  onEdit?: () => void;
  onDelete?: () => void;
  onLinkSystem?: (systemId: string) => void;
  onUnlinkSystem?: (systemId: string, systemName: string) => void;
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

export function ProcessCockpit360({
  process,
  areaName,
  nucleusName,
  routines,
  systems = [],
  allSystems = [],
  onEdit,
  onDelete,
  onLinkSystem,
  onUnlinkSystem,
}: ProcessCockpit360Props) {
  const router = useRouter();
  const rolesDisplay =
    process.responsible_roles?.length > 0 ? process.responsible_roles.join(', ') : 'Não definido';

  const linkedSystemIds = new Set(systems.map((s) => s.id));
  const availableSystems = allSystems.filter((s) => !linkedSystemIds.has(s.id));

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
            value="rotinas"
            className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <ClipboardList className="mr-2 size-4" />
            Rotinas
            {routines.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">({routines.length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="sistemas"
            className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <Monitor className="mr-2 size-4" />
            Sistemas
            {systems.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">({systems.length})</span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="principal" className="mt-6 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                <GitBranch className="size-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{process.name}</h3>
                {(areaName || nucleusName) && (
                  <p className="text-sm text-muted-foreground">
                    {[areaName, nucleusName].filter(Boolean).join(' / ')}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit} className="gap-2">
                  Editar
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  className="text-destructive hover:text-destructive"
                >
                  Excluir
                </Button>
              )}
            </div>
          </div>

          <section>
            <div className="mb-4 flex items-center gap-2 border-b pb-2">
              <FileText className="size-5 text-primary" />
              <h3 className="text-base font-semibold">Informações</h3>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <InfoField label="Descrição" value={process.description} />
              <InfoField label="Objetivo" value={process.objective} />
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center gap-2 border-b pb-2">
              <Users className="size-5 text-primary" />
              <h3 className="text-base font-semibold">Roles responsáveis</h3>
            </div>
            <p className="text-sm">{rolesDisplay}</p>
          </section>

          {process.id && (
            <Link href={`/organizacao/processos/${process.id}/rotinas`}>
              <Button variant="secondary" className="w-full">
                Ver Rotinas
              </Button>
            </Link>
          )}
        </TabsContent>

        <TabsContent value="rotinas" className="mt-6">
          {routines.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Nenhuma rotina cadastrada
            </div>
          ) : (
            <div className="space-y-3">
              {routines.map((r) => (
                <Link key={r.id} href={`/organizacao/processos/${process.id}/rotinas`}>
                  <div className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50">
                    <div>
                      <p className="text-sm font-medium">{r.name}</p>
                      {r.description && (
                        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                          {r.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sistemas" className="mt-6">
          {systems.length === 0 && !onLinkSystem ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Nenhum sistema vinculado a este processo
            </div>
          ) : systems.length === 0 && onLinkSystem && availableSystems.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Nenhum sistema vinculado. Selecione abaixo para vincular:
              </p>
              <Select
                onValueChange={(v) => {
                  if (v) onLinkSystem(v);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um sistema..." />
                </SelectTrigger>
                <SelectContent>
                  {availableSystems.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : systems.length === 0 && onLinkSystem && availableSystems.length === 0 ? (
            <EmptyState
              icon={Monitor}
              title="Nenhum sistema disponível"
              description="Cadastre sistemas em Recursos para vinculá-los a processos."
              actionLabel="Ver Recursos"
              onAction={() => router.push('/organizacao/recursos?tab=sistemas')}
            />
          ) : (
            <div className="space-y-3">
              {onLinkSystem && availableSystems.length > 0 && (
                <div className="flex gap-2">
                  <Select
                    key={systems.length}
                    onValueChange={(v) => {
                      if (v) {
                        onLinkSystem(v);
                      }
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Vincular sistema..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSystems.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" className="gap-2 shrink-0" asChild>
                    <Link href="/organizacao/recursos?tab=sistemas">
                      <Plus className="h-4 w-4" />
                      Ver Recursos
                    </Link>
                  </Button>
                </div>
              )}
              {onLinkSystem && availableSystems.length === 0 && systems.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Todos os sistemas já estão vinculados.
                </p>
              )}
              <div className="space-y-2">
                {systems.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <Link
                      href={`/organizacao/recursos?tab=sistemas`}
                      className="min-w-0 flex-1 hover:underline"
                    >
                      <p className="text-sm font-medium">{s.name}</p>
                      {s.description && (
                        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                          {s.description}
                        </p>
                      )}
                    </Link>
                    {onUnlinkSystem && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-destructive hover:text-destructive shrink-0"
                        onClick={() => onUnlinkSystem(s.id, s.name)}
                        title="Desvincular sistema"
                        aria-label={`Desvincular ${s.name}`}
                      >
                        <Unlink className="h-4 w-4" />
                        Desvincular
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
