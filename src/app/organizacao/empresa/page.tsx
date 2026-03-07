import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  dbAreaToUI,
  dbProcessToUI,
  dbSystemToUI,
  dbSupplierToUI,
  dbServiceToUI,
  dbOrgDocumentToUI,
} from '@/lib/transformers/organization';
import type {
  DBOrgArea,
  DBOrgProcess,
  DBOrgSystem,
  DBOrgSupplier,
  DBOrgService,
  DBOrgDocument,
} from '@/lib/transformers/organization';
import { getTenant360Action } from '@/app/actions/tenant';
import { EmpresaContent } from './empresa-content';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import type { EmpresaVinculo } from './types';

export default async function EmpresaPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const result = await getTenant360Action();

  const [
    { data: areasRaw },
    { data: processesRaw },
    { data: nucleiRaw },
    { data: systemsRaw },
    { data: suppliersRaw },
    { data: servicesRaw },
    { data: documentsRaw },
  ] = await Promise.all([
    supabase.from('org_areas').select('*').order('name', { ascending: true }),
    supabase.from('org_processes').select('*').order('name', { ascending: true }),
    supabase.from('org_nuclei').select('id, name, area_id').order('name'),
    supabase.from('org_systems').select('*').order('name', { ascending: true }),
    supabase.from('org_suppliers').select('*').order('name', { ascending: true }),
    supabase.from('org_services').select('*').order('name', { ascending: true }),
    supabase.from('org_documents').select('*').order('name', { ascending: true }),
  ]);

  const nucleiCountByArea = (nucleiRaw ?? []).reduce<Record<string, number>>((acc, n) => {
    acc[n.area_id] = (acc[n.area_id] || 0) + 1;
    return acc;
  }, {});

  const areaMap = new Map(
    (areasRaw ?? []).map((a: { id: string; name: string }) => [a.id, a.name]),
  );
  const nucleusMap = new Map(
    (nucleiRaw ?? []).map((n: { id: string; name: string; area_id: string }) => [n.id, n.name]),
  );

  const areas = ((areasRaw as DBOrgArea[]) ?? []).map((row) =>
    dbAreaToUI(row, nucleiCountByArea[row.id] ?? 0),
  );
  const processes = ((processesRaw as DBOrgProcess[]) ?? []).map((row) => dbProcessToUI(row));
  const systems = ((systemsRaw as DBOrgSystem[]) ?? []).map((row) => dbSystemToUI(row));
  const suppliers = ((suppliersRaw as DBOrgSupplier[]) ?? []).map((row) => dbSupplierToUI(row));
  const services = ((servicesRaw as DBOrgService[]) ?? []).map((row) => dbServiceToUI(row));
  const documents = ((documentsRaw as DBOrgDocument[]) ?? []).map((row) => dbOrgDocumentToUI(row));

  const vinculos: EmpresaVinculo[] = [
    ...areas.map((a) => ({
      id: a.id,
      name: a.name,
      type: 'areas' as const,
      entity: a,
    })),
    ...processes.map((p) => ({
      id: p.id,
      name: p.name,
      type: 'processos' as const,
      entity: p,
      areaName: p.area_id ? areaMap.get(p.area_id) : undefined,
      nucleusName: p.nucleus_id ? nucleusMap.get(p.nucleus_id) : undefined,
    })),
    ...systems.map((s) => ({
      id: s.id,
      name: s.name,
      type: 'sistemas' as const,
      entity: s,
    })),
    ...suppliers.map((s) => ({
      id: s.id,
      name: s.name,
      type: 'fornecedores' as const,
      entity: s,
    })),
    ...services.map((s) => ({
      id: s.id,
      name: s.name,
      type: 'servicos' as const,
      entity: s,
    })),
    ...documents.map((d) => ({
      id: d.id,
      name: d.name,
      type: 'documentos' as const,
      entity: d,
    })),
  ];

  return (
    <ErrorBoundary label="Empresa">
      <EmpresaContent
        tenant={result.tenant}
        counts={result.counts}
        vinculos={vinculos}
        error={result.error}
      />
    </ErrorBoundary>
  );
}
