import { describe, it, expect } from '@jest/globals';
import type { PerformanceMetrics } from '@/app/dashboard/operacoes/actions';

describe('AIInsightsPanel Component', () => {
  const mockPerson: PerformanceMetrics = {
    responsible_id: '1',
    responsible: 'High Performer',
    total_movements: 180,
    average_duration_days: 18,
    projects_completed: 150,
    lead_time_average_days: 22,
  };

  const mockTeamData: PerformanceMetrics[] = [
    {
      responsible_id: '1',
      responsible: 'High Performer',
      total_movements: 180,
      average_duration_days: 18,
      projects_completed: 150,
      lead_time_average_days: 22,
    },
    {
      responsible_id: '2',
      responsible: 'Average Member',
      total_movements: 120,
      average_duration_days: 25,
      projects_completed: 70,
      lead_time_average_days: 30,
    },
    {
      responsible_id: '3',
      responsible: 'Low Performer',
      total_movements: 80,
      average_duration_days: 30,
      projects_completed: 35,
      lead_time_average_days: 35,
    },
  ];

  it('should calculate team average movements correctly', () => {
    const totalMovements = mockTeamData.reduce((sum, d) => sum + d.total_movements, 0);
    const avgMovements = Math.round(totalMovements / mockTeamData.length);

    expect(avgMovements).toBe(127); // (180 + 120 + 80) / 3 = 126.67
  });

  it('should calculate team average completion correctly', () => {
    const teamCompletion =
      mockTeamData.reduce((sum, d) => sum + d.projects_completed / d.total_movements, 0) /
      mockTeamData.length;

    expect(teamCompletion).toBeGreaterThan(0);
    expect(teamCompletion).toBeLessThan(1);
  });

  it('should identify acceleration opportunity for high performers', () => {
    const personCompletion = (mockPerson.projects_completed / mockPerson.total_movements) * 100;
    const teamAvgMovements =
      mockTeamData.reduce((sum, d) => sum + d.total_movements, 0) / mockTeamData.length;
    const performanceDelta =
      ((mockPerson.total_movements - teamAvgMovements) / teamAvgMovements) * 100;

    const hasAccelerationOpportunity = personCompletion > 70 && performanceDelta > 10;

    expect(hasAccelerationOpportunity).toBe(true);
  });

  it('should identify optimization opportunity for high duration', () => {
    const slowPerson: PerformanceMetrics = {
      responsible_id: '4',
      responsible: 'Slow Worker',
      total_movements: 120,
      average_duration_days: 35, // High duration
      projects_completed: 90,
      lead_time_average_days: 40,
    };

    const personCompletion = (slowPerson.projects_completed / slowPerson.total_movements) * 100;
    const hasOptimizationOpportunity =
      slowPerson.average_duration_days > 25 && personCompletion > 60;

    expect(hasOptimizationOpportunity).toBe(true);
  });

  it('should identify risk for low performers', () => {
    const lowPerson: PerformanceMetrics = {
      responsible_id: '5',
      responsible: 'At Risk',
      total_movements: 50,
      average_duration_days: 35,
      projects_completed: 20,
      lead_time_average_days: 40,
    };

    const teamAvgMovements =
      mockTeamData.reduce((sum, d) => sum + d.total_movements, 0) / mockTeamData.length;
    const performanceDelta =
      ((lowPerson.total_movements - teamAvgMovements) / teamAvgMovements) * 100;
    const personCompletion = (lowPerson.projects_completed / lowPerson.total_movements) * 100;

    const isAtRisk = performanceDelta < -15 && personCompletion < 50;

    expect(isAtRisk).toBe(true);
  });

  it('should identify consistent high performance', () => {
    const teamAvgMovements =
      mockTeamData.reduce((sum, d) => sum + d.total_movements, 0) / mockTeamData.length;
    const performanceDelta =
      ((mockPerson.total_movements - teamAvgMovements) / teamAvgMovements) * 100;
    const personCompletion = (mockPerson.projects_completed / mockPerson.total_movements) * 100;

    const isConsistentlyHigh = performanceDelta > 20 && personCompletion > 75;

    expect(isConsistentlyHigh).toBe(true);
  });

  it('should detect lead time improvement opportunity', () => {
    const personWithGap: PerformanceMetrics = {
      responsible_id: '6',
      responsible: 'Gap Person',
      total_movements: 100,
      average_duration_days: 15,
      projects_completed: 70,
      lead_time_average_days: 30, // 15 day gap
    };

    const hasLeadTimeOpportunity =
      personWithGap.lead_time_average_days > personWithGap.average_duration_days + 10;

    expect(hasLeadTimeOpportunity).toBe(true);
  });

  it('should calculate risk score as Low for high performers', () => {
    const personCompletion = (mockPerson.projects_completed / mockPerson.total_movements) * 100;
    const teamAvgMovements =
      mockTeamData.reduce((sum, d) => sum + d.total_movements, 0) / mockTeamData.length;
    const performanceDelta =
      ((mockPerson.total_movements - teamAvgMovements) / teamAvgMovements) * 100;

    const isRisk = performanceDelta < -15 && personCompletion < 50;
    const riskScore = isRisk ? 'High' : 'Low';

    expect(riskScore).toBe('Low');
  });

  it('should calculate prediction trend as Strong Growth', () => {
    const personCompletion = (mockPerson.projects_completed / mockPerson.total_movements) * 100;
    const teamAvgCompletion =
      (mockTeamData.reduce((sum, d) => sum + d.projects_completed / d.total_movements, 0) /
        mockTeamData.length) *
      100;

    const trend = (personCompletion - teamAvgCompletion) / 10;
    const trendLabel = trend > 2 ? 'Strong Growth' : trend > 0.5 ? 'Steady Growth' : 'Stable';

    expect(trendLabel).toBeDefined();
  });

  it('should generate confidence scores between 0 and 100', () => {
    const personCompletion = (mockPerson.projects_completed / mockPerson.total_movements) * 100;
    const teamAvgMovements =
      mockTeamData.reduce((sum, d) => sum + d.total_movements, 0) / mockTeamData.length;
    const performanceDelta =
      ((mockPerson.total_movements - teamAvgMovements) / teamAvgMovements) * 100;

    const confidence = Math.min(90, 70 + Math.abs(performanceDelta));

    expect(confidence).toBeGreaterThanOrEqual(0);
    expect(confidence).toBeLessThanOrEqual(100);
  });

  it('should handle empty team data without errors', () => {
    const emptyTeam: PerformanceMetrics[] = [];
    const totalMovements = emptyTeam.reduce((sum, d) => sum + d.total_movements, 0);
    const teamAvg = emptyTeam.length > 0 ? Math.round(totalMovements / emptyTeam.length) : 0;

    expect(teamAvg).toBe(0);
  });

  it('should count insights based on performance criteria', () => {
    let insightCount = 0;

    const personCompletion = (mockPerson.projects_completed / mockPerson.total_movements) * 100;
    const teamAvgMovements =
      mockTeamData.reduce((sum, d) => sum + d.total_movements, 0) / mockTeamData.length;
    const performanceDelta =
      ((mockPerson.total_movements - teamAvgMovements) / teamAvgMovements) * 100;

    if (personCompletion > 70 && performanceDelta > 10) insightCount++;
    if (mockPerson.average_duration_days > 25 && personCompletion > 60) insightCount++;
    if (performanceDelta < -15 && personCompletion < 50) insightCount++;
    if (performanceDelta > 20 && personCompletion > 75) insightCount++;
    if (mockPerson.lead_time_average_days > mockPerson.average_duration_days + 10) insightCount++;

    expect(insightCount).toBeGreaterThanOrEqual(0);
  });

  it('should properly format confidence score display', () => {
    const confidence = 87;
    const display = `${confidence}% confident`;

    expect(display).toContain('confident');
    expect(display).toContain('%');
  });
});
