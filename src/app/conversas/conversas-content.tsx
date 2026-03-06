'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ChevronLeft, ChevronRight, RefreshCw, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import type { AgentSessionWithAgent, SessionsResponse } from '@/app/api/sessions/route';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ConversasContentProps {
  initialSessions: AgentSessionWithAgent[];
  initialTotal: number;
  agents: Array<{ id: string; name: string }>;
}

const STATUS_CONFIG = {
  active: { label: 'Ativa', color: 'bg-green-50', badge: 'default' as const },
  paused: { label: 'Pausada', color: 'bg-yellow-50', badge: 'secondary' as const },
  closed: { label: 'Fechada', color: 'bg-gray-50', badge: 'outline' as const },
};

export function ConversasContent({
  initialSessions,
  initialTotal,
  agents,
}: ConversasContentProps) {
  const router = useRouter();
  const [sessions, setSessions] = useState<AgentSessionWithAgent[]>(initialSessions);
  const [total, setTotal] = useState(initialTotal);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch sessions with filters
  const fetchSessions = useCallback(
    async (page: number) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (selectedAgentId !== 'all') {
          params.append('agent_id', selectedAgentId);
        }

        const response = await fetch(`/api/sessions?${params.toString()}`);
        if (!response.ok) throw new Error('Erro ao carregar conversas');

        const data: SessionsResponse = await response.json();
        setSessions(data.sessions);
        setTotal(data.total);
        setCurrentPage(page);
      } catch (error) {
        toast.error('❌ Erro ao carregar Chatbot AI');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedAgentId, limit]
  );

  // Trigger fetch when filter changes
  const handleFilterChange = useCallback(
    (agentId: string) => {
      setSelectedAgentId(agentId);
      setCurrentPage(1);
      fetchSessions(1);
    },
    [fetchSessions]
  );

  // Handle pagination
  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1) {
      fetchSessions(currentPage - 1);
    }
  }, [currentPage, fetchSessions]);

  const handleNextPage = useCallback(() => {
    const maxPage = Math.ceil(total / limit);
    if (currentPage < maxPage) {
      fetchSessions(currentPage + 1);
    }
  }, [currentPage, total, limit, fetchSessions]);

  const handleRefresh = useCallback(async () => {
    await fetchSessions(currentPage);
    toast.success('✅ Conversas recarregadas!');
  }, [currentPage, fetchSessions]);

  // Handle reopen conversation
  const handleReopenConversation = useCallback(
    (session: AgentSessionWithAgent) => {
      router.push(`/agentes/${session.agent_id}/chat?sessionId=${session.id}`);
    },
    [router]
  );

  const maxPage = Math.ceil(total / limit);
  const hasMore = currentPage < maxPage;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <DashboardHeader
        title="Chatbot AI"
        subtitle="Consulte todas as suas conversas com assistentes IA"
      />

      <div className="grid gap-6">
        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total de Conversas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Conversas Ativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sessions.filter((s) => s.status === 'active').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Mensagens Totais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sessions.reduce((sum, s) => sum + (s.message_count || 0), 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Controls */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Conversas Registradas</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Atualizar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4 flex-col sm:flex-row">
              <Select value={selectedAgentId} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue placeholder="Filtrar por assistente..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os assistentes</SelectItem>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Table or Empty State */}
            {sessions.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="Nenhuma conversa encontrada"
                description={
                  selectedAgentId !== 'all'
                    ? 'Nenhuma conversa com este assistente'
                    : 'Comece uma conversa com um assistente!'
                }
              />
            ) : (
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="font-semibold">Assistente</TableHead>
                      <TableHead className="font-semibold">Início</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold text-right">Mensagens</TableHead>
                      <TableHead className="font-semibold text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow key={session.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{session.agent_name}</TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {format(new Date(session.started_at), 'dd MMM yyyy HH:mm', {
                            locale: ptBR,
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              STATUS_CONFIG[session.status as keyof typeof STATUS_CONFIG]?.badge ||
                              'outline'
                            }
                          >
                            {
                              STATUS_CONFIG[session.status as keyof typeof STATUS_CONFIG]?.label ||
                              session.status
                            }
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {session.message_count} {session.message_count === 1 ? 'msg' : 'msgs'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReopenConversation(session)}
                          >
                            Reabrir
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {sessions.length > 0 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-gray-600">
                  Página {currentPage} de {Math.ceil(total / limit)} ({total} total)
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1 || isLoading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={!hasMore || isLoading}
                  >
                    Próximo
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
