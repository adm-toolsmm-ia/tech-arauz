import { DashboardHeader } from '@/components/layout';
import { UsersTable } from './components/UsersTable';
import { getTenantUsers } from './actions';
import { AlertCircle } from 'lucide-react';

export default async function UsuariosPage() {
  const { data: users, error, currentUserId } = await getTenantUsers();

  return (
    <div className="flex h-full flex-col bg-background p-6">
      <DashboardHeader
        title="Gestão de Usuários"
        subtitle="Administre acessos, perfis e contas ativas no tenant."
      />

      <div className="mt-8">
        {error ? (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <h3 className="mb-1 font-semibold">Acesso restrito</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        ) : (
          <UsersTable users={users || []} currentUserId={currentUserId} />
        )}
      </div>
    </div>
  );
}
