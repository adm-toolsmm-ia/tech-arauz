'use client';

import React from 'react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AgentsContent } from './agentes-content';
import { SkillsCatalogContent } from './skills-catalog-content';
import type { UIAgent } from '@/lib/transformers/agent';
import type { LmProvider } from '@/types/agents';
import type { UIProjectSkill } from '@/types/skills';

interface AgentesModuleContentProps {
  agents: UIAgent[];
  skills: UIProjectSkill[];
  providers: LmProvider[];
}

export function AgentesModuleContent({ agents, skills, providers }: AgentesModuleContentProps) {
  return (
    <div className="space-y-6 p-6">
      <DashboardHeader
        title="Agentes & Skills"
        subtitle="Agentes e squads para execução com LLM. Skills de projeto: documentação, extração e playbooks — catálogo por tenant, editável na interface."
      />

      <Tabs defaultValue="agents" className="space-y-6">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="agents" className="flex-1 sm:flex-none">
            Agentes & Squads
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex-1 sm:flex-none">
            Skills de projeto
          </TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="mt-0 focus-visible:outline-none">
          <AgentsContent agents={agents} providers={providers} layout="tab" />
        </TabsContent>

        <TabsContent value="skills" className="mt-0 focus-visible:outline-none">
          <SkillsCatalogContent initialSkills={skills} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
