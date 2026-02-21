'use client';

import { useState, useEffect } from 'react';
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
import { UserPlus, User, Shield, Mail } from 'lucide-react';
import { createUser, updateUser } from '../actions';

interface UserFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userToEdit?: any;
}

const initialState = {
    success: false,
    message: '',
    errors: {} as any,
};

function SubmitButton({ isEdit }: { isEdit: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            className="bg-[#F97316] hover:bg-[#F97316]/90 text-white transition-all font-semibold shadow-[0_4px_6px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_15px_rgba(0,0,0,0.1)] hover:-translate-y-[1px]"
            disabled={pending}
        >
            <UserPlus className="mr-2 size-4" />
            {pending ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Cadastrar Usuário'}
        </Button>
    );
}

export function UserFormDrawer({ open, onOpenChange, userToEdit }: UserFormProps) {
    const isEdit = !!userToEdit;
    const targetAction = isEdit ? updateUser : createUser;
    const [state, formAction] = useFormState(targetAction, initialState);

    useEffect(() => {
        if (state.message) {
            if (state.success) {
                toast.success(state.message);
                onOpenChange(false);
            } else {
                toast.error(state.message);
            }
        }
    }, [state, onOpenChange]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl bg-[#FAF5FF] overflow-y-auto max-h-[90vh] sm:rounded-xl">
                <DialogHeader>
                    <DialogTitle className="font-['Fira_Code',monospace] text-2xl text-[#4C1D95] tracking-tight">
                        {isEdit ? 'Editar Usuário' : 'Novo Usuário'}
                    </DialogTitle>
                    <DialogDescription className="font-['Fira_Sans',sans-serif] text-[#4C1D95]/70">
                        {isEdit
                            ? 'Altere os dados de acesso e permissão abaixo.'
                            : 'Preencha os dados para convidar um novo membro.'}
                    </DialogDescription>
                </DialogHeader>

                <form action={formAction} className="space-y-6 mt-4 font-['Fira_Sans',sans-serif] text-[#4C1D95]">
                    {isEdit && <input type="hidden" name="id" value={userToEdit.id} />}

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-[#7C3AED]/20 pb-2">
                            <User className="size-5 text-[#7C3AED]" />
                            <h3 className="font-semibold">Dados Pessoais</h3>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="fullName" className="text-[#4C1D95] font-medium">Nome Completo</Label>
                                <Input
                                    id="fullName"
                                    name="fullName"
                                    placeholder="Ex: João da Silva"
                                    required
                                    minLength={3}
                                    defaultValue={userToEdit?.full_name || ''}
                                    className="bg-white border-[#E2E8F0] focus:border-[#7C3AED] focus:ring-[#7C3AED]/20 transition-colors cursor-text"
                                />
                                {state.errors?.fullName && (
                                    <p className="text-sm text-red-500">{state.errors.fullName}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-[#4C1D95] font-medium">E-mail</Label>
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
                                        className="pl-10 bg-white border-[#E2E8F0] focus:border-[#7C3AED] disabled:opacity-50 disabled:bg-gray-50 transition-colors cursor-text"
                                    />
                                </div>
                                {state.errors?.email && (
                                    <p className="text-sm text-red-500">{state.errors.email}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-[#7C3AED]/20 pb-2">
                            <Shield className="size-5 text-[#7C3AED]" />
                            <h3 className="font-semibold">Permissões</h3>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role" className="text-[#4C1D95] font-medium">Perfil de Acesso</Label>
                            <Select name="role" defaultValue={userToEdit?.role || 'admin'}>
                                <SelectTrigger id="role" className="bg-white border-[#E2E8F0] focus:ring-[#7C3AED]/20 transition-colors cursor-pointer">
                                    <SelectValue placeholder="Selecione o perfil" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin" className="cursor-pointer">Administrador</SelectItem>
                                    <SelectItem value="user" className="cursor-pointer">Usuário Padrão</SelectItem>
                                    <SelectItem value="viewer" className="cursor-pointer">Apenas Visualização</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-[#7C3AED]/20">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="border-[#7C3AED] text-[#7C3AED] hover:bg-[#7C3AED]/10 hover:text-[#7C3AED] transition-all cursor-pointer font-semibold"
                        >
                            Cancelar
                        </Button>
                        <SubmitButton isEdit={isEdit} />
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
