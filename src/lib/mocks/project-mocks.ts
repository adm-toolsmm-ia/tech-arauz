/**
 * Mock data generators for Project Cockpit
 * Uses deterministic hash for consistent data across renders
 */

// Deterministic hash for consistent mocks
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export interface MockFinancials {
  budgeted: number;
  realized: number;
  remaining: number;
  percentUsed: number;
  categories: {
    name: string;
    budgeted: number;
    realized: number;
  }[];
}

export interface MockTeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  allocation: number; // percentage
}

export function generateProjectFinancials(projectId: string): MockFinancials {
  const seed = hashCode(projectId);
  const budgeted = 30000 + (seed % 70000);
  const percentUsed = 40 + (seed % 55);
  const realized = Math.round(budgeted * (percentUsed / 100));
  const remaining = budgeted - realized;

  const categories = [
    {
      name: 'Desenvolvimento',
      budgeted: Math.round(budgeted * 0.5),
      realized: Math.round(realized * 0.55),
    },
    {
      name: 'Infraestrutura',
      budgeted: Math.round(budgeted * 0.2),
      realized: Math.round(realized * 0.18),
    },
    {
      name: 'Licencas',
      budgeted: Math.round(budgeted * 0.15),
      realized: Math.round(realized * 0.12),
    },
    {
      name: 'Outros',
      budgeted: Math.round(budgeted * 0.15),
      realized: Math.round(realized * 0.15),
    },
  ];

  return {
    budgeted,
    realized,
    remaining,
    percentUsed,
    categories,
  };
}

const teamNames = [
  'Ana Silva',
  'Carlos Oliveira',
  'Mariana Santos',
  'Pedro Costa',
  'Julia Ferreira',
  'Rafael Almeida',
  'Beatriz Lima',
  'Lucas Pereira',
];

const roles = [
  'Desenvolvedor Frontend',
  'Desenvolvedor Backend',
  'Designer UX',
  'Analista de Dados',
  'DevOps',
  'QA Engineer',
  'Product Owner',
  'Scrum Master',
];

export function generateProjectTeam(
  responsavel: string | null,
  projectId: string,
): MockTeamMember[] {
  const seed = hashCode(projectId);
  const teamSize = 2 + (seed % 4); // 2-5 members
  const team: MockTeamMember[] = [];

  // Add responsavel as lead if exists
  if (responsavel) {
    team.push({
      id: `lead-${projectId}`,
      name: responsavel,
      role: 'Responsavel',
      allocation: 100,
    });
  }

  // Generate team members
  for (let i = 0; i < teamSize; i++) {
    const nameIndex = (seed + i) % teamNames.length;
    const roleIndex = (seed + i + 1) % roles.length;
    team.push({
      id: `member-${i}-${projectId}`,
      name: teamNames[nameIndex],
      role: roles[roleIndex],
      allocation: 50 + ((seed + i * 10) % 50),
    });
  }

  return team;
}

export type HealthStatus = 'verde' | 'amarelo' | 'vermelho';

export function calculatePrazoHealth(
  prazoFinal: string | null,
  percentComplete: number,
): HealthStatus {
  if (!prazoFinal) return 'amarelo';

  const deadline = new Date(prazoFinal);

  // Validate date - return amarelo for invalid dates
  if (isNaN(deadline.getTime())) return 'amarelo';

  const today = new Date();
  const daysRemaining = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) return 'vermelho';
  if (daysRemaining < 7 && percentComplete < 80) return 'vermelho';
  if (daysRemaining < 14 && percentComplete < 60) return 'amarelo';
  return 'verde';
}

export function calculateCustoHealth(financials: MockFinancials): HealthStatus {
  if (financials.percentUsed > 95) return 'vermelho';
  if (financials.percentUsed > 80) return 'amarelo';
  return 'verde';
}

export function calculateOverallHealth(prazo: HealthStatus, custo: HealthStatus): HealthStatus {
  if (prazo === 'vermelho' || custo === 'vermelho') return 'vermelho';
  if (prazo === 'amarelo' || custo === 'amarelo') return 'amarelo';
  return 'verde';
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function getDaysUntilDeadline(prazoFinal: string | null): number | null {
  if (!prazoFinal) return null;
  const deadline = new Date(prazoFinal);

  // Validate date - return null for invalid dates
  if (isNaN(deadline.getTime())) return null;

  const today = new Date();
  return Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
