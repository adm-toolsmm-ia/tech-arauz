'use client';

import { useMemo } from 'react';
import { User, Crown, Users } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { generateProjectTeam, type MockTeamMember } from '@/lib/mocks/project-mocks';

interface ProjectTeamProps {
  projectId: string;
  responsavel: string | null;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function TeamMemberCard({
  member,
  isLead,
  index,
}: {
  member: MockTeamMember;
  isLead: boolean;
  index: number;
}) {
  return (
    <Card
      className={cn(
        'animate-scale-in transition-all duration-300 hover:shadow-card-hover',
        isLead && 'border-primary/50 bg-primary/5',
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            className={cn(
              'flex size-10 items-center justify-center rounded-full text-sm font-semibold',
              isLead ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
            )}
          >
            {getInitials(member.name)}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate font-medium">{member.name}</span>
              {isLead && <Crown className="size-4 shrink-0 text-amber-500" />}
            </div>
            <p className="truncate text-sm text-muted-foreground">{member.role}</p>
          </div>

          {/* Allocation */}
          {!isLead && (
            <Badge variant="outline" className="shrink-0">
              {member.allocation}%
            </Badge>
          )}
        </div>

        {/* Allocation bar for non-leads */}
        {!isLead && (
          <div className="mt-3">
            <Progress value={member.allocation} className="h-1" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ProjectTeam({ projectId, responsavel }: ProjectTeamProps) {
  const team = useMemo(() => generateProjectTeam(responsavel, projectId), [responsavel, projectId]);

  const lead = team.find((m) => m.role === 'Responsavel');
  const members = team.filter((m) => m.role !== 'Responsavel');

  return (
    <div className="space-y-6">
      {/* Lead */}
      {lead && (
        <div>
          <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Crown className="size-4" />
            Responsavel
          </h4>
          <TeamMemberCard member={lead} isLead index={0} />
        </div>
      )}

      {/* Team Members */}
      {members.length > 0 && (
        <div>
          <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Users className="size-4" />
            Equipe ({members.length})
          </h4>
          <div className="grid gap-3 sm:grid-cols-2">
            {members.map((member, index) => (
              <TeamMemberCard key={member.id} member={member} isLead={false} index={index + 1} />
            ))}
          </div>
        </div>
      )}

      {/* Note */}
      <p className="text-center text-xs italic text-muted-foreground">
        * Membros da equipe simulados para demonstracao
      </p>
    </div>
  );
}
