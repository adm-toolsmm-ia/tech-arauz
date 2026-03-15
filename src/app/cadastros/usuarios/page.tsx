import { getTenantUsers } from './actions';
import { AlertCircle } from 'lucide-react';
import { UsersContent } from './users-content';

export default async function UsuariosPage() {
  const { data: users, error, currentUserId } = await getTenantUsers();

  return (
    <div className="flex h-full flex-col bg-background">
      {error ? (
        <div className="border-destructive/50 bg-destructive/10 m-6 flex items-start gap-3 rounded-lg border p-4 text-destructive">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <h3 className="mb-1 font-semibold">Acesso restrito</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      ) : (
        <UsersContent users={users || []} currentUserId={currentUserId} />
      )}
    </div>
  );
}
