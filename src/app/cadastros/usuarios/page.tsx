import { DashboardHeader } from '@/components/layout';
import { UsersTable } from './components/UsersTable';
import { getTenantUsers } from './actions';
import { AlertCircle } from 'lucide-react';

export default async function UsuariosPage() {
    const { data: users, error } = await getTenantUsers();

    return (
        <div className="flex flex-col h-full bg-[#FAF5FF]/30 p-6 font-['Fira_Sans',sans-serif]">
            <DashboardHeader
                title="Painel 360º de Gestão"
                subtitle="Administração Completa de Contas e Credenciais no Módulo"
            />

            <div className="mt-8">
                {error ? (
                    <div className="mb-6 shadow-[0_4px_6px_rgba(0,0,0,0.1)] p-4 border border-red-500 rounded-lg bg-red-50 text-red-900 flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-red-600 mb-1">Erro ao Carregar Módulo</h3>
                            <p className="text-sm">Não foi possível estabelecer contexto e regras ativas. Detalhes: {error}</p>
                        </div>
                    </div>
                ) : (
                    <UsersTable users={users || []} />
                )}
            </div>
        </div>
    );
}
