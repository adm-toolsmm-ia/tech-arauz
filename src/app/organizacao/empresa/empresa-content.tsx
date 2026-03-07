'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Building,
  Building2,
  GitBranch,
  Monitor,
  Truck,
  Wrench,
  FileText,
  ChevronRight,
  Pencil,
} from 'lucide-react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateTenantAction } from '@/app/actions/tenant';
import type { TenantInfo, Tenant360Counts } from '@/app/actions/tenant';
import { toast } from 'sonner';

interface EmpresaContentProps {
  tenant: TenantInfo | null;
  counts: Tenant360Counts;
  error?: string;
}

const VINCULOS = [
  {
    id: 'areas',
    title: 'Áreas',
    description: 'Grandes domínios da organização',
    countKey: 'areas' as keyof Tenant360Counts,
    href: '/organizacao/areas',
    icon: Building2,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    id: 'processos',
    title: 'Processos',
    description: 'Fluxos operacionais',
    countKey: 'processes' as keyof Tenant360Counts,
    href: '/organizacao/processos',
    icon: GitBranch,
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
  },
  {
    id: 'sistemas',
    title: 'Sistemas',
    description: 'Softwares utilizados',
    countKey: 'systems' as keyof Tenant360Counts,
    href: '/organizacao/recursos?tab=sistemas',
    icon: Monitor,
    color: 'text-amber-600',
    bgColor: 'bg-amber-500/10',
  },
  {
    id: 'fornecedores',
    title: 'Fornecedores',
    description: 'Empresas externas',
    countKey: 'suppliers' as keyof Tenant360Counts,
    href: '/organizacao/recursos?tab=fornecedores',
    icon: Truck,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500/10',
  },
  {
    id: 'servicos',
    title: 'Serviços',
    description: 'Serviços operacionais',
    countKey: 'services' as keyof Tenant360Counts,
    href: '/organizacao/recursos?tab=servicos',
    icon: Wrench,
    color: 'text-purple-600',
    bgColor: 'bg-purple-500/10',
  },
  {
    id: 'documentos',
    title: 'Documentos',
    description: 'Modelos e checklists',
    countKey: 'documents' as keyof Tenant360Counts,
    href: '/organizacao/recursos?tab=documentos',
    icon: FileText,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-500/10',
  },
];

export function EmpresaContent({ tenant, counts, error }: EmpresaContentProps) {
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [editName, setEditName] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (tenant) setEditName(tenant.name);
  }, [tenant]);

  const handleSave = React.useCallback(async () => {
    if (!tenant) return;
    setIsLoading(true);
    try {
      const result = await updateTenantAction(tenant.id, { name: editName.trim() });
      if (result.success) {
        toast.success(result.message);
        setIsEditOpen(false);
        window.location.reload();
      } else {
        toast.error(result.message);
      }
    } catch (e) {
      toast.error(`Erro: ${e instanceof Error ? e.message : 'desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  }, [tenant, editName]);

  if (error) {
    return (
      <div className="flex flex-col p-6">
        <DashboardHeader
          title="Empresa"
          subtitle="Cadastro e visão 360º da organização"
        />
        <Card className="mt-6">
          <CardContent className="py-8 text-center text-destructive">
            {error}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="flex flex-col p-6">
        <DashboardHeader
          title="Empresa"
          subtitle="Cadastro e visão 360º da organização"
        />
        <Card className="mt-6">
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhuma empresa encontrada.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <DashboardHeader
          title="Empresa"
          subtitle="Cadastro e visão 360º dos vínculos organizacionais"
        />
        <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsEditOpen(true)}>
          <Pencil className="h-4 w-4" />
          Editar
        </Button>
      </div>

      <div className="space-y-6 p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10">
                <Building className="size-7 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">{tenant.name}</CardTitle>
                <CardDescription>Identificador: {tenant.slug}</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div>
          <h2 className="mb-4 text-lg font-semibold">Visão 360º — Vínculos</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {VINCULOS.map((v) => {
              const Icon = v.icon;
              const count = counts[v.countKey] ?? 0;
              return (
                <Link key={v.id} href={v.href}>
                  <Card className="transition-shadow hover:shadow-md">
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className={`flex size-12 items-center justify-center rounded-lg ${v.bgColor}`}>
                        <Icon className={`size-6 ${v.color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{v.title}</p>
                        <p className="text-sm text-muted-foreground">{v.description}</p>
                        <p className="mt-1 text-xs font-medium text-muted-foreground">
                          {count} cadastrado(s)
                        </p>
                      </div>
                      <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Empresa</DialogTitle>
            <DialogDescription>
              Atualize o nome da empresa. Apenas administradores podem editar.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="tenant-name">Nome</Label>
              <Input
                id="tenant-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nome da empresa"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isLoading || !editName.trim()}>
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
