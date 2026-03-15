'use client';

import React, { useMemo } from 'react';
import { AlertCircle, Lightbulb, TrendingUp, Zap, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { PerformanceMetrics } from '@/app/dashboard/operacoes/actions';

interface AIInsightsPanelProps {
  person: PerformanceMetrics;
  allData: PerformanceMetrics[];
}

interface AIInsight {
  type: 'acceleration' | 'optimization' | 'risk';
  title: string;
  description: string;
  confidence: number; // 0-100
  action: string;
  icon: React.ReactNode;
}

/**
 * AIInsightsPanel: Organism component
 *
 * Features:
 * - AI-powered performance predictions
 * - Automated recommendations (3 types)
 * - Risk scoring display
 * - Data-driven rationale for each insight
 * - Confidence scores
 */
export function AIInsightsPanel({ person, allData }: AIInsightsPanelProps) {
  // Generate AI insights based on performance data
  const insights = useMemo(() => {
    const results: AIInsight[] = [];

    // Calculate team statistics
    const teamAvgMovements =
      allData.length > 0
        ? Math.round(allData.reduce((sum, d) => sum + d.total_movements, 0) / allData.length)
        : 0;

    const teamAvgCompletion =
      allData.length > 0
        ? Math.round(
            (allData.reduce((sum, d) => sum + d.projects_completed / d.total_movements, 0) /
              allData.length) *
              100,
          )
        : 0;

    const personCompletion =
      person.total_movements > 0
        ? Math.round((person.projects_completed / person.total_movements) * 100)
        : 0;

    const performanceDelta =
      teamAvgMovements > 0
        ? ((person.total_movements - teamAvgMovements) / teamAvgMovements) * 100
        : 0;

    // Insight 1: Acceleration Opportunity
    if (personCompletion > 70 && performanceDelta > 10) {
      results.push({
        type: 'acceleration',
        title: '⚡ Opportunity for Acceleration',
        description: `${person.responsible} demonstrates high completion rate (${personCompletion}%) with above-average output (+${Math.round(performanceDelta)}% vs team). Consider adding higher-priority or complex projects to leverage performance momentum.`,
        confidence: Math.min(90, 70 + Math.abs(performanceDelta)),
        action: 'Assign next priority to challenging projects',
        icon: <Zap className="h-5 w-5 text-amber-500" />,
      });
    }

    // Insight 2: Optimization Opportunity
    if (person.average_duration_days > 25 && personCompletion > 60) {
      results.push({
        type: 'optimization',
        title: '📈 Duration Optimization Potential',
        description: `Despite solid completion rate (${personCompletion}%), average project duration is ${person.average_duration_days} days. Identify blockers and streamline workflows to reduce cycle time while maintaining quality.`,
        confidence: 75,
        action: 'Review project workflows and dependencies',
        icon: <TrendingUp className="h-5 w-5 text-blue-500" />,
      });
    }

    // Insight 3: Performance Risk
    if (performanceDelta < -15 && personCompletion < 50) {
      results.push({
        type: 'risk',
        title: '⚠️ Performance at Risk',
        description: `${person.responsible}'s performance (-${Math.round(Math.abs(performanceDelta))}% vs team) combined with low completion rate (${personCompletion}%) indicates potential workload or skill-gap issues. Requires immediate attention and support.`,
        confidence: 85,
        action: '1-on-1 review recommended',
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      });
    }

    // Insight 4: Consistency Pattern
    if (performanceDelta > 20 && personCompletion > 75) {
      results.push({
        type: 'acceleration',
        title: '🏆 Consistent High Performance',
        description: `${person.responsible} consistently outperforms team metrics (+${Math.round(performanceDelta)}% movements, ${personCompletion}% completion). Mentoring potential identified—consider peer-mentoring or leadership opportunities.`,
        confidence: 88,
        action: 'Consider mentoring or leadership roles',
        icon: <Target className="h-5 w-5 text-green-500" />,
      });
    }

    // Insight 5: Lead Time Improvement
    if (person.lead_time_average_days > person.average_duration_days + 10) {
      results.push({
        type: 'optimization',
        title: '⏱️ Lead Time Reduction Opportunity',
        description: `Gap between project duration (${person.average_duration_days}d) and lead time (${person.lead_time_average_days}d) suggests ${person.lead_time_average_days - person.average_duration_days} days of waiting/bottlenecks. Process optimization could reduce delivery delays.`,
        confidence: 80,
        action: 'Analyze process bottlenecks',
        icon: <Lightbulb className="h-5 w-5 text-purple-500" />,
      });
    }

    return results;
  }, [person, allData]);

  // Calculate overall risk score
  const riskScore = useMemo(() => {
    const riskInsights = insights.filter((i) => i.type === 'risk');
    if (riskInsights.length === 0) return 'Low';
    if (riskInsights.some((i) => i.confidence > 85)) return 'High';
    return 'Medium';
  }, [insights]);

  // Calculate prediction trend
  const predictionTrend = useMemo(() => {
    const personCompletion =
      person.total_movements > 0 ? (person.projects_completed / person.total_movements) * 100 : 0;
    const teamAvgCompletion =
      allData.length > 0
        ? (allData.reduce((sum, d) => sum + d.projects_completed / d.total_movements, 0) /
            allData.length) *
          100
        : 0;

    const trend = (personCompletion - teamAvgCompletion) / 10;
    if (trend > 2) return 'Strong Growth';
    if (trend > 0.5) return 'Steady Growth';
    if (trend > -0.5) return 'Stable';
    if (trend > -2) return 'Declining';
    return 'At Risk';
  }, [person, allData]);

  return (
    <div className="space-y-4">
      {/* Performance Score Card */}
      <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 dark:border-indigo-800 dark:from-indigo-950/30 dark:to-blue-950/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Performance Projection</CardTitle>
            <Lightbulb className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Trend</p>
              <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                {predictionTrend}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Risk Level</p>
              <Badge
                variant={
                  riskScore === 'Low'
                    ? 'default'
                    : riskScore === 'Medium'
                      ? 'secondary'
                      : 'destructive'
                }
              >
                {riskScore}
              </Badge>
            </div>
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Insights</p>
              <p className="text-lg font-bold">{insights.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights List */}
      <div className="space-y-3">
        {insights.length > 0 ? (
          insights.map((insight, idx) => (
            <Card
              key={idx}
              className={`border-l-4 ${
                insight.type === 'acceleration'
                  ? 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
                  : insight.type === 'optimization'
                    ? 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                    : 'border-l-red-500 bg-red-50/50 dark:bg-red-950/20'
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {insight.icon}
                    <div>
                      <CardTitle className="text-sm">{insight.title}</CardTitle>
                      <p className="mt-1 text-xs text-muted-foreground">{insight.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="ml-2 flex-shrink-0">
                    {insight.confidence}% confident
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 rounded border border-muted bg-background p-2">
                  <span className="text-sm font-medium">🎯 Action:</span>
                  <span className="text-sm text-muted-foreground">{insight.action}</span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-sm text-muted-foreground">
                No specific insights available at this time. Performance metrics are within expected
                ranges.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Prediction Notice */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/20">
        <p className="text-xs text-muted-foreground">
          💡 <strong>AI-Powered Insights:</strong> These recommendations are generated from
          historical performance data and team comparisons. Use them as decision support alongside
          domain expertise and contextual knowledge.
        </p>
      </div>
    </div>
  );
}
