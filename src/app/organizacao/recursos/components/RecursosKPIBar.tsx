'use client';

import { Monitor, Truck, Wrench, FileText } from 'lucide-react';
import { KPICard } from '@/components/dashboard/KPICard';

type RecursosTab = 'sistemas' | 'fornecedores' | 'servicos' | 'documentos';

interface RecursosKPIBarProps {
  systemsCount: number;
  suppliersCount: number;
  servicesCount: number;
  documentsCount: number;
  activeTab?: RecursosTab;
  onTabClick?: (tab: RecursosTab) => void;
}

export function RecursosKPIBar({
  systemsCount,
  suppliersCount,
  servicesCount,
  documentsCount,
  activeTab,
  onTabClick,
}: RecursosKPIBarProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <KPICard
        title="Sistemas"
        value={systemsCount}
        icon={Monitor}
        subtitle="Total cadastrado"
        active={activeTab === 'sistemas'}
        onClick={onTabClick ? () => onTabClick('sistemas') : undefined}
      />
      <KPICard
        title="Fornecedores"
        value={suppliersCount}
        icon={Truck}
        subtitle="Total cadastrado"
        active={activeTab === 'fornecedores'}
        onClick={onTabClick ? () => onTabClick('fornecedores') : undefined}
      />
      <KPICard
        title="Serviços"
        value={servicesCount}
        icon={Wrench}
        subtitle="Total cadastrado"
        active={activeTab === 'servicos'}
        onClick={onTabClick ? () => onTabClick('servicos') : undefined}
      />
      <KPICard
        title="Documentos"
        value={documentsCount}
        icon={FileText}
        subtitle="Total cadastrado"
        active={activeTab === 'documentos'}
        onClick={onTabClick ? () => onTabClick('documentos') : undefined}
      />
    </div>
  );
}
