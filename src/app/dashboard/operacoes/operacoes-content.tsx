'use client';

import * as React from 'react';
import { User } from '@supabase/supabase-js';
import {
    Activity,
    Users,
    Timer,
    AlertTriangle,
    ArrowRight,
    UserCheck,
} from 'lucide-react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { KPICard } from '@/components/dashboard/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { UIProject, DBProject } from '@/lib/transformers/project';
import { SkeletonKPI } from '@/components/ui/skeletons';
// Optional components for basic rendering, we can expand later
import { ProjectPipelineChart, buildPipelineData } from '@/components/charts';
import { isConsideredActive } from '@/lib/domain/project-health';
import { computeDashboardKpis } from '@/lib/domain/kpi-calculations';

interface Profile {
    id: string;
    full_name: string | null;
    role: string;
}

interface ChartProject {
    status: string;
    created_at: string;
    fase_atual: string;
    area: string;
    prazo_final: string;
    data_encerramento: string;
    prioridade: string;
    importancia_especial: boolean;
    impacto_estrategico: string;
    impacto_operacional: string;
    complexidade_tecnica: string;
    responsible: string;
    budgets: { value: number; currency: string }[];
    histories?: { date: string; step_from?: string }[];
}

interface OperacoesContentProps {
    user: User;
    profile: Profile | null;
    projects: ReadonlyArray<UIProject>;
    chartProjects?: ReadonlyArray<ChartProject>;
    rawDbProjects?: ReadonlyArray<DBProject>;
    isLoading?: boolean;
}

export function OperacoesContent({
    user,
    profile,
    projects,
    chartProjects = [],
    rawDbProjects = [],
    isLoading = false,
}: OperacoesContentProps) {
    // KPIs simples sobre operações

    const activeProjects = React.useMemo(() => projects.filter((p) => isConsideredActive(p.status)), [projects]);
    const totalActive = activeProjects.length;

    const inApprovalCount = activeProjects.filter(p => (p.status || '').toLowerCase().includes('aprov')).length;

    // Calculando métrica de WIP (Work in Progress) vs Responsável para os projetos ativos
    const wipSummary = React.useMemo(() => {
        const counts: Record<string, number> = {};
        let overloadedCount = 0;
        activeProjects.forEach((p) => {
            const resp = p.responsible || 'Sem responsável';
            counts[resp] = (counts[resp] || 0) + 1;
        });

        // Simulação: Considerar WIP limit = 3 como ideal
        Object.values(counts).forEach(count => {
            if (count > 3) overloadedCount++;
        });
        return { totalResponsibles: Object.keys(counts).length, overloadedCount };
    }, [activeProjects]);

    const pipelineData = React.useMemo(() => buildPipelineData(chartProjects as ChartProject[]), [chartProjects]);
    const kpis = React.useMemo(
        () => computeDashboardKpis([...chartProjects] as import('@/lib/domain/kpi-calculations').DashboardProjectLike[]),
        [chartProjects],
    );

    return (
        <div className="flex flex-col">
            <DashboardHeader
                title="Operações"
                subtitle="Visão de Fluxo, Gargalos e SLA"
            />

            <div className="flex-1 space-y-6 p-6">
                {/* KPIs Row */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {isLoading ? (
                        Array.from({ length: 4 }).map((_, i) => <SkeletonKPI key={i} />)
                    ) : (
                        <>
                            <KPICard
                                title="Projetos no Funil"
                                value={totalActive}
                                icon={Activity}
                                subtitle="Ativos na esteira"
                            />
                            <KPICard
                                title="Aprovação Pendente"
                                value={inApprovalCount}
                                icon={UserCheck}
                                subtitle="Aguardando aprovadores"
                                className={inApprovalCount > 0 ? "border-amber-500/30" : undefined}
                            />
                            <KPICard
                                title="Sobrecarga (WIP)"
                                value={wipSummary.overloadedCount}
                                icon={AlertTriangle}
                                subtitle="Pessoas c/ +3 projetos ativos"
                                className={wipSummary.overloadedCount > 0 ? "border-destructive/30" : undefined}
                            />
                            <KPICard
                                title="Lead Time Médio"
                                value={kpis.avgLeadTimeDays > 0 ? `${kpis.avgLeadTimeDays}d` : '—'}
                                icon={Timer}
                                subtitle={kpis.avgLeadTimeDays > 0 ? 'Dias do início ao encerramento' : 'Sem projetos concluídos'}
                            />
                        </>
                    )}
                </div>

                {/* Charts */}
                {chartProjects.length > 0 && (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <ProjectPipelineChart
                            data={pipelineData}
                            activeStatus={null}
                        />
                        {/* Movimentações / Ranking chart could go here */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Histórico e Produtividade</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[350px] flex items-center justify-center text-muted-foreground">
                                <p>Gráfico de Movimentações (Em breve)</p>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
