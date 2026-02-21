import { DashboardHeader } from '@/components/layout';
import { UsersTable } from './components/UsersTable';
import { getTenantUsers } from './actions';
import { AlertCircle } from 'lucide-react';

export default async function UsuariosPage() {
    const { data: users, error } = await getTenantUsers();

    return (
        <div className="flex flex-col h-full bg-background p-6">
            <DashboardHeader
                title="Gestão de Usuários"
                subtitle="Administre acessos, perfis e contas ativas no tenant."
            />

            <div className="mt-8">
                {error ? (
                    <div className="mb-6 p-4 border border-destructive/50 rounded-lg bg-destructive/10 text-destructive flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                        <div>
                            <h3 className="font-semibold mb-1">Acesso restrito</h3>
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                ) : (
                    <UsersTable users={users || []} />
                )}
            </div>
        </div>
    );
}
