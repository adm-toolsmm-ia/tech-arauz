'use client';

import { createUser } from '../actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DashboardHeader } from '@/components/layout';
import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { UserPlus, User, Shield, Mail } from 'lucide-react';

const initialState = {
  success: false,
  message: '',
  errors: {} as Record<string, string>,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
      <UserPlus className="mr-2 size-4" />
      {pending ? 'Cadastrando...' : 'Cadastrar Usuário'}
    </Button>
  );
}

export default function NovoUsuarioPage() {
  const [state, formAction] = useFormState(createUser, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message);
        formRef.current?.reset();
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Novo Usuário"
        subtitle="Cadastre um novo usuário para acessar o sistema"
      />

      <div className="flex-1 space-y-6 p-6">
        <Card>
          <CardContent className="p-6">
            <form ref={formRef} action={formAction} className="space-y-8">
              {/* Seção: Dados Pessoais */}
              <section>
                <div className="mb-4 flex items-center gap-2 border-b pb-2">
                  <User className="size-5 text-primary" />
                  <h3 className="text-base font-semibold">Dados Pessoais</h3>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Ex: joao@empresa.com"
                        className="pl-10"
                        required
                      />
                    </div>
                    {state.errors?.email && (
                      <p className="text-sm text-red-500">{state.errors.email}</p>
                    )}
                  </div>
                </div>
              </section>

              {/* Seção: Permissões */}
              <section>
                <div className="mb-4 flex items-center gap-2 border-b pb-2">
                  <Shield className="size-5 text-primary" />
                  <h3 className="text-base font-semibold">Permissões e Acesso</h3>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="role">Perfil de Acesso</Label>
                    <Select name="role" defaultValue="admin">
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Selecione o perfil" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="user">Usuário</SelectItem>
                        <SelectItem value="viewer">Visualizador</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Define o nível de permissão do usuário no sistema
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <div className="flex items-center gap-3 pt-2">
                      <Switch id="isActive" name="isActive" defaultChecked />
                      <Label htmlFor="isActive" className="cursor-pointer text-sm font-normal">
                        Usuário ativo
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Usuários inativos não podem acessar o sistema
                    </p>
                  </div>
                </div>
              </section>

              {/* Ações */}
              <div className="flex justify-end border-t pt-4">
                <SubmitButton />
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
