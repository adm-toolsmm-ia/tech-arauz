'use client';

import { Building2, GitBranch, Monitor, Truck, Wrench, FileText } from 'lucide-react';
import { KPICard } from '@/components/dashboard/KPICard';
import type { Tenant360Counts } from '@/app/actions/tenant';

interface EmpresaKPIBarProps {
  counts: Tenant360Counts;
}

export function EmpresaKPIBar({ counts }: EmpresaKPIBarProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
      <KPICard
        icon={Building2}
        title="Áreas"
        value={counts.areas}
        trend={{ value: '0', positive: false }}
      />
      <KPICard
        icon={GitBranch}
        title="Processos"
        value={counts.processes}
        trend={{ value: '0', positive: false }}
      />
      <KPICard
        icon={Monitor}
        title="Sistemas"
        value={counts.systems}
        trend={{ value: '0', positive: false }}
      />
      <KPICard
        icon={Truck}
        title="Fornecedores"
        value={counts.suppliers}
        trend={{ value: '0', positive: false }}
      />
      <KPICard
        icon={Wrench}
        title="Serviços"
        value={counts.services}
        trend={{ value: '0', positive: false }}
      />
      <KPICard
        icon={FileText}
        title="Documentos"
        value={counts.documents}
        trend={{ value: '0', positive: false }}
      />
    </div>
  );
}
