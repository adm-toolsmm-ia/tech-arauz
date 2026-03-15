'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { generateProjectFinancials, formatCurrency } from '@/lib/mocks/project-mocks';

interface ProjectFinancialsProps {
  projectId: string;
}

export const ProjectFinancials: React.FC<ProjectFinancialsProps> = ({ projectId }) => {
  const financials = useMemo(() => generateProjectFinancials(projectId), [projectId]);

  const chartData = financials.categories.map((cat) => ({
    name: cat.name,
    Orcado: cat.budgeted,
    Realizado: cat.realized,
  }));

  const variance = financials.budgeted - financials.realized;
  const variancePercent = Math.round((variance / financials.budgeted) * 100);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="animate-scale-in">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Orcamento</p>
            <p className="mt-1 text-2xl font-bold">{formatCurrency(financials.budgeted)}</p>
          </CardContent>
        </Card>

        <Card className="animate-scale-in" style={{ animationDelay: '50ms' }}>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Realizado</p>
            <p className="mt-1 text-2xl font-bold">{formatCurrency(financials.realized)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {financials.percentUsed}% utilizado
            </p>
          </CardContent>
        </Card>

        <Card className="animate-scale-in" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Saldo</p>
            <div className="mt-1 flex items-center gap-2">
              <p
                className={cn(
                  'text-2xl font-bold',
                  variance >= 0 ? 'text-green-600' : 'text-red-600',
                )}
              >
                {formatCurrency(Math.abs(variance))}
              </p>
              {variance > 0 ? (
                <TrendingUp className="size-5 text-green-600" />
              ) : variance < 0 ? (
                <TrendingDown className="size-5 text-red-600" />
              ) : (
                <Minus className="size-5 text-muted-foreground" />
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {variance >= 0 ? 'Economia de' : 'Excedente de'} {Math.abs(variancePercent)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Distribuicao por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  type="number"
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                  fontSize={12}
                />
                <YAxis type="category" dataKey="name" fontSize={12} width={100} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar
                  dataKey="Orcado"
                  fill="hsl(var(--muted-foreground))"
                  opacity={0.5}
                  radius={[0, 4, 4, 0]}
                />
                <Bar dataKey="Realizado" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.Realizado <= entry.Orcado ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Note */}
      <p className="text-center text-xs italic text-muted-foreground">
        * Dados financeiros simulados para demonstracao
      </p>
    </div>
  );
};
