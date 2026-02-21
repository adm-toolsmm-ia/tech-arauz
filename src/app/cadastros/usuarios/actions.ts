'use server';

import { createServiceClient } from '@/lib/supabase/service';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const createUserSchema = z.object({
  fullName: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  role: z.enum(['admin', 'user', 'viewer'], {
    errorMap: () => ({ message: 'Perfil de acesso inválido' }),
  }),
});

const updateUserSchema = z.object({
  id: z.string().uuid('ID inválido'),
  fullName: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  role: z.enum(['admin', 'user', 'viewer'], {
    errorMap: () => ({ message: 'Perfil de acesso inválido' }),
  }),
});

// Helper para pegar tenant_id do usuário logado
async function getCurrentUserTenant() {
  const supabaseSession = await createClient();
  const { data: { user: currentUser }, error: userError } = await supabaseSession.auth.getUser();

  if (userError || !currentUser) {
    return null;
  }

  const { data: adminProfile } = await supabaseSession
    .from('profiles')
    .select('tenant_id')
    .eq('id', currentUser.id)
    .single();

  if (!adminProfile) {
    return null;
  }

  return { currentUser, tenantId: adminProfile.tenant_id };
}

export async function getTenantUsers() {
  const session = await getCurrentUserTenant();
  if (!session) return { data: null, error: 'Não autenticado' };

  const supabase = createServiceClient();

  const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) return { data: null, error: listError.message };

  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('tenant_id', session.tenantId);

  if (profileError || !profiles) return { data: null, error: 'Erro ao buscar perfis' };

  const users = profiles.map(profile => {
    const authUser = authUsers.users.find(u => u.id === profile.id);
    return {
      ...profile,
      email: profile.email || authUser?.email,
      isActive: authUser ? !authUser.banned_until : true
    };
  });

  return { data: users, error: null };
}

export async function createUser(prevState: any, formData: FormData) {
  const validatedFields = createUserSchema.safeParse({
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    role: formData.get('role') || 'admin',
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Dados inválidos',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { fullName, email, role } = validatedFields.data;
  const session = await getCurrentUserTenant();

  if (!session) return { success: false, message: 'Não autorizado' };

  const supabase = createServiceClient();

  try {
    const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (authError) return { success: false, message: 'Erro ao criar usuário: ' + authError.message };
    if (!authData.user) return { success: false, message: 'Erro inesperado ao criar usuário' };

    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      tenant_id: session.tenantId,
      email: email,
      full_name: fullName,
      role: role,
    });

    if (profileError) {
      await supabase.auth.admin.deleteUser(authData.user.id);
      return { success: false, message: 'Erro ao criar perfil' };
    }

    revalidatePath('/cadastros/usuarios');
    return { success: true, message: 'Usuário criado com sucesso!' };
  } catch (error: any) {
    return { success: false, message: 'Erro interno do servidor' };
  }
}

export async function updateUser(prevState: any, formData: FormData) {
  const validatedFields = updateUserSchema.safeParse({
    id: formData.get('id'),
    fullName: formData.get('fullName'),
    role: formData.get('role'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Dados inválidos',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, fullName, role } = validatedFields.data;
  const session = await getCurrentUserTenant();

  if (!session) return { success: false, message: 'Não autorizado' };

  const supabase = createServiceClient();

  try {
    const { error: authError } = await supabase.auth.admin.updateUserById(id, {
      user_metadata: { full_name: fullName }
    });

    if (authError) return { success: false, message: 'Erro ao atualizar auth: ' + authError.message };

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ full_name: fullName, role: role })
      .eq('id', id)
      .eq('tenant_id', session.tenantId);

    if (profileError) return { success: false, message: 'Erro ao atualizar perfil' };

    revalidatePath('/cadastros/usuarios');
    return { success: true, message: 'Usuário atualizado com sucesso!' };
  } catch (error: any) {
    return { success: false, message: 'Erro interno do servidor' };
  }
}

export async function toggleUserStatus(userId: string, currentStatus: boolean) {
  const session = await getCurrentUserTenant();
  if (!session) return { success: false, message: 'Não autorizado' };

  const supabase = createServiceClient();
  try {
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      ban_duration: currentStatus ? "876000h" : "none"
    });

    if (error) return { success: false, message: 'Erro ao alternar status: ' + error.message };

    revalidatePath('/cadastros/usuarios');
    return { success: true, message: `Usuário ${currentStatus ? 'desativado' : 'reativado'} com sucesso.` };
  } catch (err: any) {
    return { success: false, message: 'Erro interno do servidor' };
  }
}
