'use server';

import { createServiceClient } from '@/lib/supabase/service';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type UserRole = 'admin' | 'user' | 'viewer';

export interface UserActionState {
  success: boolean;
  message: string;
  errors?: {
    fullName?: string[];
    email?: string[];
    role?: string[];
    id?: string[];
  };
}

export interface TenantUser {
  id: string;
  tenant_id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  is_active: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  isActive: boolean;
}

interface AdminSession {
  userId: string;
  tenantId: string;
  role: UserRole;
}

// ---------------------------------------------------------------------------
// Schemas (Zod)
// ---------------------------------------------------------------------------

const createUserSchema = z.object({
  fullName: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(255, 'Nome muito longo'),
  email: z
    .string()
    .email('Email inválido')
    .max(255, 'Email muito longo'),
  role: z.enum(['admin', 'user', 'viewer'], {
    errorMap: () => ({ message: 'Perfil de acesso inválido' }),
  }),
});

const updateUserSchema = z.object({
  id: z.string().uuid('ID inválido'),
  fullName: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(255, 'Nome muito longo'),
  role: z.enum(['admin', 'user', 'viewer'], {
    errorMap: () => ({ message: 'Perfil de acesso inválido' }),
  }),
});

// ---------------------------------------------------------------------------
// Auth context helper
// ---------------------------------------------------------------------------

async function requireAdminSession(): Promise<AdminSession | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile) return null;
  if (profile.role !== 'admin') return null;

  return {
    userId: user.id,
    tenantId: profile.tenant_id,
    role: profile.role as UserRole,
  };
}

async function verifyTargetBelongsToTenant(
  supabase: ReturnType<typeof createServiceClient>,
  targetUserId: string,
  tenantId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', targetUserId)
    .eq('tenant_id', tenantId)
    .single();

  return !!data;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

const EMPTY_STATE: UserActionState = {
  success: false,
  message: '',
};

export async function getTenantUsers(): Promise<{
  data: TenantUser[] | null;
  error: string | null;
}> {
  const session = await requireAdminSession();
  if (!session) return { data: null, error: 'Sem permissão para acessar este módulo.' };

  const supabase = createServiceClient();

  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('tenant_id', session.tenantId);

  if (profileError || !profiles) {
    console.error('[getTenantUsers] profile query error:', profileError);
    return { data: null, error: 'Erro ao buscar usuários.' };
  }

  const profileIds = profiles.map((p) => p.id);

  const { data: authResponse, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('[getTenantUsers] auth.admin.listUsers error:', listError);
    return { data: null, error: 'Erro ao buscar informações de autenticação.' };
  }

  const authMap = new Map(
    authResponse.users
      .filter((u) => profileIds.includes(u.id))
      .map((u) => [u.id, u]),
  );

  const users: TenantUser[] = profiles.map((profile) => {
    const authUser = authMap.get(profile.id);
    const isActive = authUser ? !authUser.banned_until : true;
    return {
      ...profile,
      email: profile.email || authUser?.email || '',
      isActive,
    };
  });

  return { data: users, error: null };
}

export async function createUser(
  _prevState: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const session = await requireAdminSession();
  if (!session) return { success: false, message: 'Apenas administradores podem criar usuários.' };

  const validatedFields = createUserSchema.safeParse({
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    role: formData.get('role') || 'user',
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Dados inválidos. Verifique os campos.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { fullName, email, role } = validatedFields.data;
  const supabase = createServiceClient();

  try {
    const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (authError) {
      console.error('[createUser] auth error:', authError.message);
      return { success: false, message: 'Não foi possível criar o usuário. Verifique se o email já está em uso.' };
    }
    if (!authData.user) {
      return { success: false, message: 'Erro inesperado ao criar usuário.' };
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      tenant_id: session.tenantId,
      email,
      full_name: fullName,
      role,
    });

    if (profileError) {
      console.error('[createUser] profile insert error:', profileError.message);
      const { error: rollbackError } = await supabase.auth.admin.deleteUser(authData.user.id);
      if (rollbackError) {
        console.error('[createUser] CRITICAL: rollback failed for auth user:', authData.user.id, rollbackError.message);
      }
      return { success: false, message: 'Erro ao criar perfil do usuário.' };
    }

    console.log('[createUser] success:', { targetEmail: email, adminId: session.userId, tenantId: session.tenantId });
    revalidatePath('/cadastros/usuarios');
    return { success: true, message: 'Usuário criado com sucesso!' };
  } catch (error) {
    console.error('[createUser] unexpected error:', error);
    return { success: false, message: 'Erro interno do servidor.' };
  }
}

export async function updateUser(
  _prevState: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const session = await requireAdminSession();
  if (!session) return { success: false, message: 'Apenas administradores podem editar usuários.' };

  const validatedFields = updateUserSchema.safeParse({
    id: formData.get('id'),
    fullName: formData.get('fullName'),
    role: formData.get('role'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Dados inválidos. Verifique os campos.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, fullName, role } = validatedFields.data;
  const supabase = createServiceClient();

  const belongsToTenant = await verifyTargetBelongsToTenant(supabase, id, session.tenantId);
  if (!belongsToTenant) {
    return { success: false, message: 'Usuário não encontrado.' };
  }

  try {
    const { error: authError } = await supabase.auth.admin.updateUserById(id, {
      user_metadata: { full_name: fullName },
    });

    if (authError) {
      console.error('[updateUser] auth error:', authError.message);
      return { success: false, message: 'Erro ao atualizar dados de autenticação.' };
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ full_name: fullName, role })
      .eq('id', id)
      .eq('tenant_id', session.tenantId);

    if (profileError) {
      console.error('[updateUser] profile error:', profileError.message);
      return { success: false, message: 'Erro ao atualizar perfil.' };
    }

    console.log('[updateUser] success:', { targetId: id, adminId: session.userId });
    revalidatePath('/cadastros/usuarios');
    return { success: true, message: 'Usuário atualizado com sucesso!' };
  } catch (error) {
    console.error('[updateUser] unexpected error:', error);
    return { success: false, message: 'Erro interno do servidor.' };
  }
}

export async function toggleUserStatus(
  userId: string,
  currentStatus: boolean,
): Promise<UserActionState> {
  const session = await requireAdminSession();
  if (!session) return { success: false, message: 'Apenas administradores podem alterar status.' };

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!userId || !uuidRegex.test(userId)) {
    return { success: false, message: 'ID de usuário inválido.' };
  }

  const supabase = createServiceClient();

  const belongsToTenant = await verifyTargetBelongsToTenant(supabase, userId, session.tenantId);
  if (!belongsToTenant) {
    return { success: false, message: 'Usuário não encontrado.' };
  }

  try {
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      ban_duration: currentStatus ? '876000h' : 'none',
    });

    if (error) {
      console.error('[toggleUserStatus] auth error:', error.message);
      return { success: false, message: 'Erro ao alterar status do usuário.' };
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ is_active: !currentStatus })
      .eq('id', userId)
      .eq('tenant_id', session.tenantId);

    if (profileError) {
      console.error('[toggleUserStatus] profile sync error:', profileError.message);
    }

    const action = currentStatus ? 'desativado' : 'reativado';
    console.log(`[toggleUserStatus] ${action}:`, { targetId: userId, adminId: session.userId });
    revalidatePath('/cadastros/usuarios');
    return { success: true, message: `Usuário ${action} com sucesso.` };
  } catch (error) {
    console.error('[toggleUserStatus] unexpected error:', error);
    return { success: false, message: 'Erro interno do servidor.' };
  }
}
