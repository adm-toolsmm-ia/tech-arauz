# ADR-005: Módulo de Gestão de Usuários — Autorização e Onboarding

> **Status**: Accepted
> **Data**: 2026-02-21
> **Decisores**: Gabriel Cristofolini (CTO)
> **Categoria**: Security / Auth / Frontend

---

## Contexto

O módulo de gestão de usuários (`/cadastros/usuarios`) permite criar, editar e ativar/desativar membros do tenant. A implementação inicial (Gemini) não incluía verificação de role nas server actions e usava `service role` sem gate de permissão, o que permitia a qualquer usuário autenticado executar operações administrativas.

---

## Decisões

### 1. Acesso admin-only

Todas as operações do módulo (listar, criar, editar, toggle status) exigem `role === 'admin'` verificado no servidor antes de qualquer uso de `createServiceClient()`.

**Referência**: BR-002 (Controle de Acesso por Perfil) — apenas admin pode gerenciar usuários.

### 2. Validação de tenant do alvo

Antes de qualquer operação em `auth.admin.*`, o sistema verifica que o usuário-alvo pertence ao mesmo `tenant_id` do admin operador, evitando manipulação cross-tenant.

### 3. Onboarding por senha temporária

Ao criar usuário, o sistema gera senha temporária (`Math.random + A1!`) e marca `email_confirm: true`. O admin comunica a senha fora do sistema. Fluxo de convite por email pode ser adicionado no futuro.

### 4. Fonte de verdade de status

O campo `auth.users.banned_until` é a fonte primária de status ativo/inativo. O campo `profiles.is_active` é sincronizado no toggle para consultas rápidas via RLS.

### 5. Mensagens de erro seguras

Erros técnicos (Supabase Auth) são logados no servidor com `console.error` e prefixo de ação. A UI recebe mensagens genéricas e amigáveis.

---

## Consequências

### Positivas

- Segurança: nenhuma operação administrativa é acessível a não-admins
- Isolamento: impossível operar em usuários de outro tenant
- Auditoria: logs estruturados de todas as ações

### Negativas

- Onboarding manual: admin precisa comunicar senha por canal externo
- Dependência de `auth.admin.listUsers()`: carrega todos os users do Supabase (mitigado filtrando por IDs do tenant)

---

## Alternativas Consideradas

| Alternativa                                    | Veredicto                                                       |
| ---------------------------------------------- | --------------------------------------------------------------- |
| Convite por email (`inviteUserByEmail`)         | Adiado — requer configuração de SMTP no Supabase                |
| Verificação apenas por RLS (sem gate no app)    | Rejeitado — service role bypassa RLS                             |
| Status apenas em `profiles.is_active`           | Rejeitado — `banned_until` é o mecanismo nativo do Supabase Auth |

---

## Rastreabilidade

| Requisito                      | Relação                        |
| ------------------------------ | ------------------------------ |
| RF-007 (Controle de Usuários)  | Implementação direta           |
| BR-002 (Controle de Acesso)    | Gate admin-only                |
| RT-002B (Gestão de Usuários)   | Rotina operacional documentada |
