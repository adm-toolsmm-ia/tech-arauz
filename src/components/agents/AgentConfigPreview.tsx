'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { AgentConfig } from '@/types/agents';

interface AgentConfigPreviewProps {
  config: AgentConfig;
}

export function AgentConfigPreview({ config }: AgentConfigPreviewProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{config.name}</span>
            <Badge variant="outline">{config.status}</Badge>
          </CardTitle>
          <CardDescription>{config.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Identity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Slug</p>
              <p className="text-sm">{config.slug}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tipo</p>
              <p className="text-sm">{config.agent_type || 'N/A'}</p>
            </div>
          </div>

          {/* Proprietários */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Proprietários</p>
            <div className="flex flex-wrap gap-1">
              {config.owners.map((owner) => (
                <Badge key={owner} variant="secondary">
                  {owner}
                </Badge>
              ))}
            </div>
          </div>

          {/* Tags */}
          {config.tags && config.tags.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Tags</p>
              <div className="flex flex-wrap gap-1">
                {config.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Persona */}
          {config.persona && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Persona</p>
              <p className="text-sm text-justify">{config.persona}</p>
            </div>
          )}

          {/* Objective */}
          <div>
            <p className="text-sm font-medium text-muted-foreground">Objetivo</p>
            <p className="text-sm text-justify">{config.prompt_objective}</p>
          </div>

          {/* Instructions */}
          {config.prompt_instructions.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Instruções</p>
              <ul className="text-sm space-y-1 list-disc list-inside">
                {config.prompt_instructions.map((instr, idx) => (
                  <li key={idx}>{instr}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Model */}
          <div className="grid grid-cols-3 gap-4 p-2 bg-muted/50 rounded">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Model</p>
              <p className="text-sm">{config.model.model_id}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Temperature</p>
              <p className="text-sm">{config.model.temperature || 0.7}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Max Tokens</p>
              <p className="text-sm">{config.model.max_tokens || 2000}</p>
            </div>
          </div>

          {/* Requirements */}
          {config.requirements && config.requirements.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Requisitos</p>
              <ul className="text-sm space-y-1 list-disc list-inside">
                {config.requirements.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
