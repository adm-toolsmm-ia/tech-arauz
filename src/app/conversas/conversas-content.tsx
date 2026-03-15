'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MessageSquare, ArrowRight } from 'lucide-react';
import type { AgentSessionWithAgent } from '@/lib/types/chat';

interface ConversasContentProps {
  initialSessions: AgentSessionWithAgent[];
  initialTotal: number;
}

const STATUS_CONFIG = {
  active: { label: 'Em Andamento', badge: 'default' as const },
  paused: { label: 'Pausada', badge: 'secondary' as const },
  closed: { label: 'Finalizada', badge: 'outline' as const },
};

export function ConversasContent({ initialSessions, initialTotal }: ConversasContentProps) {
  const router = useRouter();

  const handleOpenChat = (sessionId: string, agentId: string) => {
    // Rota futura ou atual para visualização simples do chat
    router.push(`/agentes/${agentId}/chat?sessionId=${sessionId}`);
  };

  return (
    <div className="bg-muted/30 flex min-h-screen flex-col">
      <DashboardHeader
        title="Histórico de Conversas"
        subtitle="Gerencie e visualize as sessões registradas pelo assistente."
      />

      <div className="flex-1 space-y-6 p-6">
        <Card>
          <CardContent className="p-0">
            {initialSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <MessageSquare className="text-muted-foreground/50 mb-4 h-12 w-12" />
                <h3 className="text-lg font-medium text-foreground">Nenhuma conversa encontrada</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  O histórico de chat para sua conta está vazio no momento.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[250px] font-semibold">Assistente / IA</TableHead>
                    <TableHead className="font-semibold">Início</TableHead>
                    <TableHead className="font-semibold">Última Atualização</TableHead>
                    <TableHead className="font-semibold">Mensagens</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="text-right font-semibold">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {initialSessions.map((session) => {
                    const statusCfg = STATUS_CONFIG[
                      session.status as keyof typeof STATUS_CONFIG
                    ] || { label: session.status, badge: 'outline' };

                    return (
                      <TableRow key={session.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium text-foreground">
                          {session.agent_name || 'Desconhecido'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {session.started_at
                            ? new Date(session.started_at).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '-'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {session.updated_at
                            ? new Date(session.updated_at).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '-'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {session.message_count || 0}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusCfg.badge} className="font-medium">
                            {statusCfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:bg-primary/10 hover:text-primary"
                            onClick={() => handleOpenChat(session.id, session.agent_id)}
                          >
                            Visualizar <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
