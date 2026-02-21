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
import { Edit2, Shield, UserX, UserCheck, MoreHorizontal } from 'lucide-react';
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

export function UsersTable({ users }: { users: any[] }) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);

    const handleEdit = (user: any) => {
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

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-[#7C3AED] text-white hover:bg-[#7C3AED]/80';
            case 'user': return 'bg-[#A78BFA] text-white hover:bg-[#A78BFA]/80';
            case 'viewer': return 'bg-gray-200 text-[#4C1D95] hover:bg-gray-300';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getRoleName = (role: string) => {
        switch (role) {
            case 'admin': return 'Administrador';
            case 'user': return 'Usuário';
            case 'viewer': return 'Visualizador';
            default: return role;
        }
    };

    return (
        <div className="space-y-4 font-['Fira_Sans',sans-serif]">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-[#4C1D95] font-['Fira_Code',monospace] tracking-tight">Gestão de Usuários</h2>
                    <p className="text-sm text-[#4C1D95]/70">Gerencie acessos, perfis e contas ativas no tenant.</p>
                </div>
                <Button
                    onClick={handleCreate}
                    className="bg-[#F97316] hover:bg-[#F97316]/90 text-white font-semibold shadow-[0_4px_6px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_15px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-[2px] cursor-pointer cursor-allowed"
                >
                    Novo Usuário
                </Button>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] shadow-[0_1px_2px_rgba(0,0,0,0.05)] bg-[#FAF5FF] overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/50 border-b border-[#E2E8F0]">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="text-[#4C1D95] font-semibold uppercase text-xs tracking-wider">Nome & E-mail</TableHead>
                            <TableHead className="text-[#4C1D95] font-semibold text-center uppercase text-xs tracking-wider">Perfil de Acesso</TableHead>
                            <TableHead className="text-[#4C1D95] font-semibold text-center uppercase text-xs tracking-wider">Status</TableHead>
                            <TableHead className="text-right text-[#4C1D95] font-semibold uppercase text-xs tracking-wider">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="bg-white">
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    Nenhum usuário encontrado no sistema.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id} className="cursor-pointer hover:bg-[#FAF5FF]/50 transition-colors group">
                                    <TableCell>
                                        <div className="font-semibold text-[#4C1D95]">{user.full_name}</div>
                                        <div className="text-sm text-[#4C1D95]/60">{user.email}</div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge className={getRoleColor(user.role) + " transition-colors"}>
                                            <Shield className="w-3 h-3 mr-1" />
                                            {getRoleName(user.role)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="outline" className={user.isActive ? 'border-green-500 text-green-600 bg-green-50/50' : 'border-red-500 text-red-600 bg-red-50/50'}>
                                            {user.isActive ? 'Ativo' : 'Inativo'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                                                    <span className="sr-only">Abrir menu</span>
                                                    <MoreHorizontal className="h-4 w-4 text-[#4C1D95]/60 group-hover:text-[#7C3AED]" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-white shadow-[0_10px_15px_rgba(0,0,0,0.1)] rounded-xl border-[#E2E8F0]">
                                                <DropdownMenuLabel className="font-['Fira_Code'] text-[#4C1D95]/60 text-xs">Menu de Ações</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleEdit(user)} className="cursor-pointer focus:bg-[#FAF5FF] group/item">
                                                    <Edit2 className="mr-2 h-4 w-4 text-[#7C3AED]" />
                                                    <span className="text-[#4C1D95] font-medium group-hover/item:text-[#7C3AED]">Editar Dados</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-[#E2E8F0]" />
                                                <DropdownMenuItem
                                                    onClick={() => handleToggleStatus(user.id, user.isActive)}
                                                    className={`cursor-pointer focus:bg-${user.isActive ? 'red-50' : 'green-50'}`}
                                                >
                                                    {user.isActive ? (
                                                        <><UserX className="mr-2 h-4 w-4 text-red-600" /> <span className="text-red-600 font-medium">Desativar Acesso</span></>
                                                    ) : (
                                                        <><UserCheck className="mr-2 h-4 w-4 text-green-600" /> <span className="text-green-600 font-medium">Reativar Acesso</span></>
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
