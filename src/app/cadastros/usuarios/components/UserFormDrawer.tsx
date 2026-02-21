'use client';

import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { UserPlus, User, Shield, Mail, Copy, CheckCircle } from 'lucide-react';
import { createUser, updateUser } from '../actions';
import type { TenantUser, UserActionState } from '../actions';

interface UserFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userToEdit?: TenantUser | null;
}

const initialState: UserActionState = {
    success: false,
    message: '',
    errors: {},
};

function SubmitButton({ isEdit }: { isEdit: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            <UserPlus className="mr-2 size-4" />
            {pending ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Cadastrar Usuário'}
        </Button>
    );
}

export function UserFormDrawer({ open, onOpenChange, userToEdit }: UserFormProps) {
    const isEdit = !!userToEdit;
    const targetAction = isEdit ? updateUser : createUser;
    const [state, formAction] = useFormState(targetAction, initialState);
    const [consumed, setConsumed] = useState(true);
    const [copied, setCopied] = useState(false);

    const showTemporaryPassword = state.success && !!state.temporaryPassword && !consumed;

    useEffect(() => {
        if (state.temporaryPassword) {
            setConsumed(false);
        }
    }, [state.temporaryPassword]);

    useEffect(() => {
        if (state.message && !showTemporaryPassword) {
            if (state.success) {
                toast.success(state.message);
                onOpenChange(false);
            } else {
                toast.error(state.message);
            }
        }
    }, [state, showTemporaryPassword, onOpenChange]);

    const handleCopyPassword = async () => {
        if (!state.temporaryPassword) return;
        await navigator.clipboard.writeText(state.temporaryPassword);
        setCopied(true);
        toast.success('Senha copiada');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCloseSuccess = () => {
        setConsumed(true);
        onOpenChange(false);
    };

    return (
        <Dialog
            open={open}
            onOpenChange={showTemporaryPassword ? (o) => !o && handleCloseSuccess() : onOpenChange}
        >
            <DialogContent
                className="max-w-xl overflow-y-auto max-h-[90vh] sm:rounded-xl"
                onPointerDownOutside={showTemporaryPassword ? (e) => e.preventDefault() : undefined}
                onEscapeKeyDown={showTemporaryPassword ? (e) => e.preventDefault() : undefined}
            >
                {showTemporaryPassword ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-2xl tracking-tight">
                                <CheckCircle className="size-6 text-green-600" />
                                Usuário criado com sucesso
                            </DialogTitle>
                            <DialogDescription>
                                Envie a senha temporária ao novo usuário. Ela não será exibida novamente.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label>Senha temporária</Label>
                                <div className="flex gap-2">
                                    <Input
                                        readOnly
                                        value={state.temporaryPassword}
                                        className="font-mono"
                                        aria-label="Senha temporária"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={handleCopyPassword}
                                        aria-label="Copiar senha"
                                    >
                                        {copied ? (
                                            <CheckCircle className="size-4 text-green-600" />
                                        ) : (
                                            <Copy className="size-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <div className="flex justify-end pt-4 border-t">
                                <Button onClick={handleCloseSuccess}>Fechar</Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-2xl tracking-tight">
                                {isEdit ? 'Editar Usuário' : 'Novo Usuário'}
                            </DialogTitle>
                            <DialogDescription>
                                {isEdit
                                    ? 'Altere os dados de acesso e permissão abaixo.'
                                    : 'Preencha os dados para convidar um novo membro.'}
                            </DialogDescription>
                        </DialogHeader>

                        <form action={formAction} className="space-y-6 mt-4">
                    {isEdit && <input type="hidden" name="id" value={userToEdit.id} />}

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b pb-2">
                            <User className="size-5 text-muted-foreground" />
                            <h3 className="font-semibold">Dados Pessoais</h3>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Nome Completo</Label>
                                <Input
                                    id="fullName"
                                    name="fullName"
                                    placeholder="Ex: João da Silva"
                                    required
                                    minLength={3}
                                    defaultValue={userToEdit?.full_name || ''}
                                    aria-invalid={!!state.errors?.fullName}
                                    aria-describedby={state.errors?.fullName ? 'fullName-error' : undefined}
                                />
                                {state.errors?.fullName && (
                                    <p id="fullName-error" className="text-sm text-destructive" role="alert">
                                        {state.errors.fullName}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">E-mail</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="Ex: usuario@empresa.com"
                                        required
                                        readOnly={isEdit}
                                        defaultValue={userToEdit?.email || ''}
                                        className="pl-10"
                                        aria-invalid={!!state.errors?.email}
                                        aria-describedby={state.errors?.email ? 'email-error' : undefined}
                                    />
                                </div>
                                {state.errors?.email && (
                                    <p id="email-error" className="text-sm text-destructive" role="alert">
                                        {state.errors.email}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b pb-2">
                            <Shield className="size-5 text-muted-foreground" />
                            <h3 className="font-semibold">Permissões</h3>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Perfil de Acesso</Label>
                            <Select name="role" defaultValue={userToEdit?.role || 'user'}>
                                <SelectTrigger id="role">
                                    <SelectValue placeholder="Selecione o perfil" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Administrador</SelectItem>
                                    <SelectItem value="user">Usuário Padrão</SelectItem>
                                    <SelectItem value="viewer">Apenas Visualização</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancelar
                        </Button>
                        <SubmitButton isEdit={isEdit} />
                    </div>
                </form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
