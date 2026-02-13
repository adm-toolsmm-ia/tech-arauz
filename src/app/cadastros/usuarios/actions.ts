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
    const supabase = createServiceClient();

    try {
        // 1. Create User in Auth
        // password is generated locally just to satisfy the API, 
        // in a real scenario we would send an invite email
        // or let the user set it up on first login if configured.
        // For this MVP, we just create the user.
        const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';

        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: { full_name: fullName },
        });

        if (authError) {
            console.error('Error creating auth user:', authError);
            return { success: false, message: 'Erro ao criar usuário: ' + authError.message };
        }

        if (!authData.user) {
            return { success: false, message: 'Erro inesperado ao criar usuário' };
        }

        // 2. Profile is automatically created by triggers? 
        // Checking migration 001/002... there are no triggers for automatic profile creation on auth.users insert typical in some starters.
        // However, I see "Profiles: admins can insert new profiles" policy.
        // So I should insert it manually.

        // Wait, let's look at 001 migration again.
        // It creates the table profiles.
        // It does NOT have a trigger on auth.users.

        // So we must insert into profiles.

        // We need tenant_id. 
        // Should we use the current user's tenant_id?
        // Since this is an admin action, we assume the admin creates users for their own tenant.

        // IMPORTANT: createServiceClient uses service role, so it bypasses RLS.
        // We can't get "current user tenant" from it directly because it's not a session client.

        // We need to pass the tenant_id.
        // OR we can get it from the session of the user invoking the action.

        // Let's get the tenant_id from the current session using the standard client.
        const supabaseSession = await createClient();

        const { data: { user: currentUser }, error: userError } = await supabaseSession.auth.getUser();

        if (userError || !currentUser) {
            return { success: false, message: 'Usuário não autenticado' };
        }

        // Get admin's profile to get tenant_id
        const { data: adminProfile } = await supabaseSession
            .from('profiles')
            .select('tenant_id')
            .eq('id', currentUser.id)
            .single();

        if (!adminProfile) {
            // Fallback or error?
            // If the admin doesn't have a profile, something is wrong with the seeding.
            // But let's assume valid state.
            return { success: false, message: 'Perfil de administrador não encontrado' };
        }

        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: authData.user.id,
                tenant_id: adminProfile.tenant_id,
                email: email,
                full_name: fullName,
                role: role,
            });

        if (profileError) {
            console.error('Error creating profile:', profileError);
            // Rollback auth user? 
            // Supabase admin.deleteUser(authData.user.id) could be used here.
            await supabase.auth.admin.deleteUser(authData.user.id);
            return { success: false, message: 'Erro ao criar perfil' };
        }

        revalidatePath('/cadastros/usuarios');
        return { success: true, message: 'Usuário criado com sucesso!' };

    } catch (error: any) {
        console.error('Unexpected error:', error);
        return { success: false, message: 'Erro interno do servidor' };
    }
}
