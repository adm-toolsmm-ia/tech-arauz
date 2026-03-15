import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  dbSystemToUI,
  dbSystemResourceToUI,
  dbSupplierToUI,
  dbServiceToUI,
  dbOrgDocumentToUI,
} from '@/lib/transformers/organization';
import type {
  DBOrgSystem,
  DBOrgSystemResource,
  DBOrgSupplier,
  DBOrgService,
  DBOrgDocument,
} from '@/lib/transformers/organization';
import type { OrgSystemResource } from '@/types/organization';
import { RecursosContent } from './recursos-content';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

export default async function RecursosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const [
    { data: systemsRaw },
    { data: suppliersRaw },
    { data: servicesRaw },
    { data: documentsRaw },
    { data: resourcesRaw },
    { data: processesRaw },
  ] = await Promise.all([
    supabase.from('org_systems').select('*').order('name'),
    supabase.from('org_suppliers').select('*').order('name'),
    supabase.from('org_services').select('*').order('name'),
    supabase.from('org_documents').select('*').order('name'),
    supabase.from('org_system_resources').select('*').order('name'),
    supabase.from('org_processes').select('id, name').order('name'),
  ]);

  const systems = ((systemsRaw as DBOrgSystem[]) ?? []).map((r) => dbSystemToUI(r));
  const suppliers = ((suppliersRaw as DBOrgSupplier[]) ?? []).map((r) => dbSupplierToUI(r));
  const services = ((servicesRaw as DBOrgService[]) ?? []).map((r) => dbServiceToUI(r));
  const documents = ((documentsRaw as DBOrgDocument[]) ?? []).map((r) => dbOrgDocumentToUI(r));
  const systemResources = ((resourcesRaw as DBOrgSystemResource[]) ?? []).map((r) =>
    dbSystemResourceToUI(r),
  );
  const processes = (processesRaw ?? []).map((p: { id: string; name: string }) => ({
    id: p.id,
    name: p.name,
  }));

  const resourcesBySystemId = systemResources.reduce<Record<string, OrgSystemResource[]>>(
    (acc, r) => {
      const list = acc[r.system_id] ?? [];
      list.push(r);
      acc[r.system_id] = list;
      return acc;
    },
    {},
  );

  const processMap = processes.reduce<Record<string, string>>((acc, p) => {
    acc[p.id] = p.name;
    return acc;
  }, {});

  return (
    <ErrorBoundary label="Recursos">
      <RecursosContent
        systems={systems}
        suppliers={suppliers}
        services={services}
        documents={documents}
        resourcesBySystemId={resourcesBySystemId}
        processes={processes}
        processMap={processMap}
      />
    </ErrorBoundary>
  );
}
