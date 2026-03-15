'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { KPICard } from '@/components/dashboard/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FilterBar } from '@/components/filters/FilterBar';
import { ViewModeBar } from '@/components/filters/ViewModeBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { KanbanBoard, type KanbanItem } from '@/components/views/KanbanBoard';
import { SplitView } from '@/components/views/SplitView';
import { UserPlus, Users, UserCheck, UserX, Shield, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useUsuariosFilters } from '@/hooks/useUsuariosFilters';
import { deleteUser } from './actions';
import type { TenantUser, UserRole } from './actions';
import { UserCockpit } from './components/UserCockpit';
import { UserFormDrawer } from './components/UserFormDrawer';

const USER_KANBAN_COLUMNS = [
  { id: 'active', title: 'Ativos', color: 'green' },
  { id: 'inactive', title: 'Inativos', color: 'gray' },
];

const ROLE_STYLES: Record<UserRole, string> = {
  admin: 'bg-primary text-primary-foreground hover:bg-primary/80',
  user: 'bg-accent text-accent-foreground hover:bg-accent/80',
  viewer: 'bg-muted text-muted-foreground hover:bg-muted/80',
};

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  user: 'Usuário',
  viewer: 'Visualizador',
};

interface UsersContentProps {
  users: TenantUser[];
  currentUserId?: string;
}

export function UsersContent({ users: initialUsers, currentUserId }: UsersContentProps) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [selectedUser, setSelectedUser] = useState<TenantUser | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<TenantUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<TenantUser | null>(null);

  const {
    filters,
    search,
    viewMode,
    setViewMode,
    filteredData,
    setSearch,
    updateFilter,
    resetAllFilters,
    registry,
  } = useUsuariosFilters(users);

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const kpis = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    inactive: users.filter((u) => !u.isActive).length,
    admins: users.filter((u) => u.role === 'admin').length,
  };

  const handleEdit = useCallback((user: TenantUser) => {
    setEditingUser(user);
    setDrawerOpen(true);
  }, []);

  const handleCreate = useCallback(() => {
    setEditingUser(null);
    setDrawerOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!userToDelete) return;
    const loadingToast = toast.loading('Excluindo...');
    const result = await deleteUser(userToDelete.id);
    toast.dismiss(loadingToast);
    setUserToDelete(null);
    setSelectedUser((prev) => (prev?.id === userToDelete.id ? null : prev));

    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  }, [userToDelete, router]);

  const handleStatusChange = useCallback(() => {
    router.refresh();
  }, [router]);

  const handleDrawerOpenChange = useCallback(
    (open: boolean) => {
      setDrawerOpen(open);
      if (!open) {
        setEditingUser(null);
        router.refresh();
      }
    },
    [router],
  );

  const kanbanItems: KanbanItem[] = filteredData.map((u) => ({
    id: u.id,
    title: u.full_name || u.email,
    subtitle: u.email,
    status: u.isActive ? 'active' : 'inactive',
    metadata: {},
  }));

  const handleKanbanStatusChange = useCallback(
    async (itemId: string | number, newStatus: string) => {
      const user = users.find((u) => u.id === itemId);
      if (!user) return;
      const { toggleUserStatus } = await import('./actions');
      const loadingToast = toast.loading('Processando...');
      const result = await toggleUserStatus(user.id, user.isActive);
      toast.dismiss(loadingToast);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    },
    [users, router],
  );

  const isCurrentUser = (user: TenantUser) => Boolean(currentUserId && user.id === currentUserId);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <DashboardHeader
          title="Gestão de Usuários"
          subtitle="Administre acessos, perfis e contas ativas no tenant."
        />
        <Button className="gap-2" onClick={handleCreate}>
          <UserPlus className="h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      {users.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <KPICard
            icon={Users}
            title="Total"
            value={kpis.total}
            trend={{ value: '0', positive: false }}
          />
          <KPICard
            icon={UserCheck}
            title="Ativos"
            value={kpis.active}
            trend={{ value: '0', positive: true }}
          />
          <KPICard
            icon={UserX}
            title="Inativos"
            value={kpis.inactive}
            trend={{ value: '0', positive: false }}
          />
          <KPICard
            icon={Shield}
            title="Administradores"
            value={kpis.admins}
            trend={{ value: '0', positive: false }}
          />
        </div>
      )}

      <div className="space-y-3">
        <ViewModeBar
          moduleId="usuarios"
          registry={registry}
          activeViewMode={viewMode}
          onViewModeChange={setViewMode}
        />
        <FilterBar
          moduleId="usuarios"
          filters={registry}
          onFiltersChange={(newFilters) => {
            Object.entries(newFilters).forEach(([key, value]) => {
              if (filters[key] !== value) updateFilter(key, value);
            });
          }}
          onSearchChange={setSearch}
          onViewModeChange={setViewMode}
          initialFilters={filters}
          initialSearch={search}
          initialViewMode={viewMode}
          currentFilters={filters}
          currentSearch={search}
          currentViewMode={viewMode}
          onUpdateFilter={updateFilter}
          onResetFilters={() => {
            resetAllFilters();
            setSearch('');
          }}
        />
      </div>

      {filteredData.length === 0 ? (
        <EmptyState
          title={users.length === 0 ? 'Nenhum usuário encontrado' : 'Nenhum resultado encontrado'}
          description={
            users.length === 0
              ? 'Adicione o primeiro usuário ao tenant.'
              : 'Tente ajustar ou limpar os filtros aplicados.'
          }
          actionLabel={users.length === 0 ? 'Novo Usuário' : undefined}
          onAction={users.length === 0 ? handleCreate : undefined}
        />
      ) : viewMode === 'kanban' ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {filteredData.length} de {users.length} usuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <KanbanBoard
              columns={USER_KANBAN_COLUMNS}
              items={kanbanItems}
              selectedId={selectedUser?.id}
              onItemClick={(item) => {
                const user = filteredData.find((u) => u.id === item.id);
                if (user) setSelectedUser(user);
              }}
              onStatusChange={handleKanbanStatusChange}
              renderItemContent={(item) => (
                <div className="space-y-1">
                  <p className="font-medium">{item.title}</p>
                  {item.subtitle && (
                    <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                  )}
                </div>
              )}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {filteredData.length} de {users.length} usuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-xl border">
              <Table aria-label="Lista de usuários">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">
                      Nome &amp; E-mail
                    </TableHead>
                    <TableHead className="text-center text-xs font-semibold uppercase tracking-wider">
                      Perfil
                    </TableHead>
                    <TableHead className="text-center text-xs font-semibold uppercase tracking-wider">
                      Status
                    </TableHead>
                    <TableHead className="text-right text-xs font-semibold uppercase tracking-wider">
                      Ações
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((user) => (
                    <TableRow
                      key={user.id}
                      className={cn(
                        'hover:bg-muted/50 cursor-pointer transition-colors',
                        selectedUser?.id === user.id && 'bg-muted/50',
                      )}
                      onClick={() => setSelectedUser(user)}
                    >
                      <TableCell>
                        <div className="font-semibold text-foreground">{user.full_name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={cn(
                            'transition-colors',
                            ROLE_STYLES[user.role as UserRole] ?? ROLE_STYLES.viewer,
                          )}
                        >
                          <Shield className="mr-1 h-3 w-3" />
                          {ROLE_LABELS[user.role as UserRole] ?? user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={cn(
                            user.isActive
                              ? 'border-green-500 bg-green-50/50 text-green-600'
                              : 'border-red-500 bg-red-50/50 text-red-600',
                          )}
                        >
                          {user.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              aria-label={`Ações para ${user.full_name}`}
                            >
                              <MoreHorizontal className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel className="text-xs text-muted-foreground">
                              Ações
                            </DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEdit(user)}>
                              Editar Dados
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setUserToDelete(user)}>
                              Excluir Usuário
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <SplitView
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title={selectedUser?.full_name ?? selectedUser?.email ?? ''}
        subtitle={selectedUser?.email}
        width="lg"
      >
        {selectedUser && (
          <UserCockpit
            user={selectedUser}
            isCurrentUser={isCurrentUser(selectedUser)}
            onEdit={() => handleEdit(selectedUser)}
            onDelete={() => setUserToDelete(selectedUser)}
            onStatusChange={handleStatusChange}
          />
        )}
      </SplitView>

      <UserFormDrawer
        open={drawerOpen}
        onOpenChange={handleDrawerOpenChange}
        userToEdit={editingUser}
      />

      <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <DialogContent aria-describedby="delete-user-description">
          <DialogHeader>
            <DialogTitle>Excluir usuário</DialogTitle>
            <DialogDescription id="delete-user-description">
              {userToDelete ? (
                <>
                  Tem certeza que deseja excluir <strong>{userToDelete.full_name}</strong> (
                  {userToDelete.email})? Esta ação não pode ser desfeita.
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setUserToDelete(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleConfirmDelete()}
              aria-label="Confirmar exclusão do usuário"
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
