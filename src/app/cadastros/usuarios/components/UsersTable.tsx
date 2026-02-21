'use client';

import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit2, Shield, UserX, UserCheck, MoreHorizontal, UserPlus } from 'lucide-react';
import { UserFormDrawer } from './UserFormDrawer';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toggleUserStatus } from '../actions';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { TenantUser, UserRole } from '../actions';

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

export function UsersTable({ users }: { users: TenantUser[] }) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<TenantUser | null>(null);

    const handleEdit = (user: TenantUser) => {
        setEditingUser(user);
        setDrawerOpen(true);
    };

    const handleCreate = () => {
        setEditingUser(null);
        setDrawerOpen(true);
    };

    const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
        const loadingToast = toast.loading('Processando...');
        const result = await toggleUserStatus(userId, currentStatus);
        toast.dismiss(loadingToast);

        if (result.success) {
            toast.success(result.message);
        } else {
            toast.error(result.message);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-foreground tracking-tight">
                        Usuários do Tenant
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Gerencie acessos, perfis e contas ativas.
                    </p>
                </div>
                <Button onClick={handleCreate} aria-label="Criar novo usuário">
                    <UserPlus className="mr-2 size-4" />
                    Novo Usuário
                </Button>
            </div>

            <div className="rounded-xl border shadow-sm bg-card overflow-hidden">
                <Table aria-label="Lista de usuários">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="font-semibold uppercase text-xs tracking-wider">
                                Nome &amp; E-mail
                            </TableHead>
                            <TableHead className="font-semibold text-center uppercase text-xs tracking-wider">
                                Perfil de Acesso
                            </TableHead>
                            <TableHead className="font-semibold text-center uppercase text-xs tracking-wider">
                                Status
                            </TableHead>
                            <TableHead className="text-right font-semibold uppercase text-xs tracking-wider">
                                Ações
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    Nenhum usuário encontrado no sistema.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id} className="group">
                                    <TableCell>
                                        <div className="font-semibold text-foreground">
                                            {user.full_name}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {user.email}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge
                                            className={cn(
                                                'transition-colors',
                                                ROLE_STYLES[user.role as UserRole] ?? ROLE_STYLES.viewer,
                                            )}
                                        >
                                            <Shield className="w-3 h-3 mr-1" />
                                            {ROLE_LABELS[user.role as UserRole] ?? user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                user.isActive
                                                    ? 'border-green-500 text-green-600 bg-green-50/50'
                                                    : 'border-red-500 text-red-600 bg-red-50/50',
                                            )}
                                        >
                                            {user.isActive ? 'Ativo' : 'Inativo'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
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
                                                    <Edit2 className="mr-2 h-4 w-4" />
                                                    Editar Dados
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => handleToggleStatus(user.id, user.isActive)}
                                                    className={cn(
                                                        user.isActive
                                                            ? 'text-destructive focus:text-destructive'
                                                            : 'text-green-600 focus:text-green-600',
                                                    )}
                                                >
                                                    {user.isActive ? (
                                                        <>
                                                            <UserX className="mr-2 h-4 w-4" />
                                                            Desativar Acesso
                                                        </>
                                                    ) : (
                                                        <>
                                                            <UserCheck className="mr-2 h-4 w-4" />
                                                            Reativar Acesso
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <UserFormDrawer
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                userToEdit={editingUser}
            />
        </div>
    );
}
