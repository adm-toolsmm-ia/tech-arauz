'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Shield, UserX, UserCheck, Trash2 } from 'lucide-react';
import { toggleUserStatus, deleteUser } from '../actions';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { TenantUser, UserRole } from '../actions';

const ROLE_STYLES: Record<UserRole, string> = {
  admin: 'bg-primary text-primary-foreground hover:bg-primary/80',
  user: 'bg-accent text-accent-foreground hover:bg-accent/80',
  viewer: 'bg-muted text-muted-foreground hover:bg-muted-80',
};

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  user: 'Usuário',
  viewer: 'Visualizador',
};

interface UserCockpitProps {
  user: TenantUser;
  isCurrentUser: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: () => void;
}

function InfoField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || '-'}</p>
    </div>
  );
}

export function UserCockpit({
  user,
  isCurrentUser,
  onEdit,
  onDelete,
  onStatusChange,
}: UserCockpitProps) {
  const handleToggleStatus = async () => {
    const loadingToast = toast.loading('Processando...');
    const result = await toggleUserStatus(user.id, user.isActive);
    toast.dismiss(loadingToast);
    if (result.success) {
      toast.success(result.message);
      onStatusChange();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <InfoField label="Nome" value={user.full_name} />
        <InfoField label="E-mail" value={user.email} />
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Perfil de Acesso</p>
          <Badge
            className={cn(
              'transition-colors',
              ROLE_STYLES[user.role as UserRole] ?? ROLE_STYLES.viewer,
            )}
          >
            <Shield className="mr-1 h-3 w-3" />
            {ROLE_LABELS[user.role as UserRole] ?? user.role}
          </Badge>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Status</p>
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
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t pt-4">
        <Button variant="outline" size="sm" className="justify-start" onClick={onEdit}>
          <Edit2 className="mr-2 h-4 w-4" />
          Editar Dados
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'justify-start',
            user.isActive
              ? 'text-destructive hover:text-destructive'
              : 'text-green-600 hover:text-green-600',
          )}
          onClick={handleToggleStatus}
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
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="justify-start text-destructive hover:text-destructive"
          onClick={onDelete}
          disabled={isCurrentUser}
          aria-label={
            isCurrentUser ? 'Não é possível excluir a si mesmo' : `Excluir ${user.full_name}`
          }
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Excluir Usuário
        </Button>
      </div>
    </div>
  );
}
