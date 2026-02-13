'use client';

import { createUser } from '../actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFormState, useFormStatus } from 'react-dom';
import { useEffect } from 'react';
import { toast } from 'sonner';

const initialState = {
    success: false,
    message: '',
    errors: {},
};

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Cadastrando...' : 'Cadastrar Usuário'}
        </Button>
    );
}

export default function NovoUsuarioPage() {
    const [state, formAction] = useFormState(createUser, initialState);

    useEffect(() => {
        if (state.message) {
            if (state.success) {
                toast.success(state.message);
                // Optional: Reset form or redirect
            } else {
                toast.error(state.message);
            }
        }
    }, [state]);

    return (
        <div className="flex justify-center py-10">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Novo Usuário</CardTitle>
                    <CardDescription>
                        Cadastre um novo usuário para acessar o sistema.
                        O perfil inicial será definido como Administrador.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={formAction} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Nome Completo</Label>
                            <Input
                                id="fullName"
                                name="fullName"
                                placeholder="Ex: João da Silva"
                                required
                                minLength={3}
                            />
                            {state.errors?.fullName && (
                                <p className="text-sm text-red-500">{state.errors.fullName}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Ex: joao@empresa.com"
                                required
                            />
                            {state.errors?.email && (
                                <p className="text-sm text-red-500">{state.errors.email}</p>
                            )}
                        </div>

                        <SubmitButton />
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
