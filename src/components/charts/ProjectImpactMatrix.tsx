'use client';

import React from 'react';
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ZAxis,
    ReferenceLine,
    Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface ImpactDataPoint {
    id: string;
    name: string;
    impact_score: number; // 1-Baixo, 2-Médio, 3-Alto
    complexity_score: number; // 1-Baixa, 2-Média, 3-Alta
    priority: string;
    is_special: boolean;
}

export interface ProjectImpactMatrixProps {
    data: ImpactDataPoint[];
}

const mapLevelToScore = (level: string | null | undefined): number => {
    const norm = (level || '').toLowerCase().trim();
    if (norm === 'alto' || norm === 'alta') return 3;
    if (norm === 'médio' || norm === 'medio' || norm === 'média' || norm === 'media') return 2;
    if (norm === 'baixo' || norm === 'baixa') return 1;
    return 1; // default to low/zero
};

export function buildImpactMatrixData(
    projects: Array<any>
): ImpactDataPoint[] {
    return projects.map((p) => ({
        id: p.id,
        name: p.project_name || p.titulo || 'Projeto',
        impact_score: mapLevelToScore(p.impacto_estrategico),
        complexity_score: mapLevelToScore(p.complexidade_tecnica),
        priority: p.prioridade || p.priority || '',
        is_special: p.importancia_especial || false,
    }));
}

const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="rounded border bg-background p-2 text-sm shadow">
                <p className="font-semibold">{data.name}</p>
                <div className="mt-1 flex items-center justify-between gap-4 text-xs text-muted-foreground">
                    <span>Impacto: {data.impact_score}</span>
                    <span>Esforço: {data.complexity_score}</span>
                </div>
                {data.is_special && (
                    <p className="mt-1 text-xs text-amber-500 font-medium">⚠️ Importância Especial</p>
                )}
            </div>
        );
    }
    return null;
};

export function ProjectImpactMatrix({ data }: ProjectImpactMatrixProps) {
    // To avoid overlapping dots exactly on integer coordinates, we could add small jitter,
    // but Recharts Scatter handles it decently if items are small enough.
    const plotData = data.map(d => ({
        ...d,
        // Add tiny random jitter to avoid perfect overlap of multiple projects
        x: d.complexity_score + (Math.random() * 0.2 - 0.1),
        y: d.impact_score + (Math.random() * 0.2 - 0.1),
    })).filter(d => d.impact_score > 0 && d.complexity_score > 0);

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Matriz de Esforço x Impacto</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
                <div role="region" aria-label="Gráfico de Matriz de Esforço x Impacto" className="h-[250px] w-full mt-2">
                    {plotData.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                            Sem dados suficientes ou mapeados (Impacto/Complexidade)
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                <XAxis
                                    type="number"
                                    dataKey="x"
                                    name="Esforço"
                                    domain={[0.5, 3.5]}
                                    ticks={[1, 2, 3]}
                                    tickFormatter={(val) => val === 1 ? 'Baixo' : val === 2 ? 'Médio' : 'Alto'}
                                    style={{ fontSize: '10px' }}
                                />
                                <YAxis
                                    type="number"
                                    dataKey="y"
                                    name="Impacto"
                                    domain={[0.5, 3.5]}
                                    ticks={[1, 2, 3]}
                                    tickFormatter={(val) => val === 1 ? 'Baixo' : val === 2 ? 'Médio' : 'Alto'}
                                    style={{ fontSize: '10px' }}
                                />
                                <ZAxis type="number" range={[40, 40]} />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={customTooltip} />

                                {/* Quadrantes - Linhas guia */}
                                <ReferenceLine x={2} stroke="var(--border)" opacity={0.5} />
                                <ReferenceLine y={2} stroke="var(--border)" opacity={0.5} />

                                <Scatter name="Projetos" data={plotData} fill="hsl(var(--primary))">
                                    {plotData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.impact_score >= 2.5 && entry.complexity_score <= 1.5 ? 'hsl(var(--chart-2))' : // Quick Wins (Verde)
                                                entry.impact_score >= 2.5 && entry.complexity_score >= 2.5 ? 'hsl(var(--primary))' : // Major Projects (Azul)
                                                    entry.impact_score <= 1.5 && entry.complexity_score >= 2.5 ? 'hsl(var(--destructive))' : // Time Wasters (Vermelho)
                                                        'hsl(var(--muted-foreground))' // Fill-ins
                                            }
                                            stroke={entry.is_special ? 'hsl(var(--chart-4))' : 'none'} // Destaque para especial
                                            strokeWidth={entry.is_special ? 2 : 0}
                                        />
                                    ))}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
