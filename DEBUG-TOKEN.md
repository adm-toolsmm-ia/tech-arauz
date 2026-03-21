# Debug: Encontrar JWT Token

**Problema:** Não encontrou token no Local Storage

Vamos procurar em **todos os lugares possíveis:**

---

## 🔍 Opção 1: Local Storage (Tente Novamente)

1. Abra https://arauz-tech.vercel.app
2. Faça login: `gabriel_cristofolini@arauz.com.br`
3. Pressione **F12** (Developer Tools)
4. Vá para **"Application"** (não "Storage")
5. Clique em **"Local Storage"**
6. Clique em **"https://arauz-tech.vercel.app"**
7. Procure por:
   - `auth`
   - `session`
   - `supabase.auth.token`
   - `supabase.auth.session`

**Se encontrou:**
- Copie o valor e use no script ✅

**Se não encontrou:**
→ Continue para Opção 2

---

## 🔍 Opção 2: Session Storage

Mesmos passos acima, **MAS** clique em **"Session Storage"** (não Local Storage):

1. F12 → Application
2. **Session Storage** (diferente!)
3. Procure pelas mesmas chaves

---

## 🔍 Opção 3: Cookies

Ainda em Developer Tools:

1. F12 → Application
2. Clique em **"Cookies"**
3. Clique em **"https://arauz-tech.vercel.app"**
4. Procure por:
   - `supabase-auth-token`
   - `sb-*` (começa com sb)
   - `next-auth*`

---

## 🔍 Opção 4: Usar o Console (Copy-Paste Direto)

Se ainda não achou, abra o **Console** (F12 → Console) e cole:

```javascript
// Procura em TUDO
console.log("=== LOCAL STORAGE ===");
console.log(localStorage);

console.log("=== SESSION STORAGE ===");
console.log(sessionStorage);

console.log("=== COOKIES ===");
console.log(document.cookie);

// Procura especificamente por token
console.log("=== PROCURANDO 'auth' ===");
for (let key in localStorage) {
  if (key.includes('auth') || key.includes('token') || key.includes('supabase')) {
    console.log(`${key}:`, localStorage[key]);
  }
}
```

**Cole no console e pressione Enter.**

Vai mostrar tudo que tem. **Copie qualquer string que comece com `eyJ`**

---

## ⚠️ Opção 5: Se Mesmo Assim Não Encontrar

Pode ser que:
1. Supabase está usando **autenticação server-side** (não armazena no browser)
2. Token está em **httpOnly cookie** (invisible no console por segurança)

### Solução: Usar Supabase CLI

Se você tem **Supabase CLI instalado**:

```bash
# 1. Verificar login no Supabase
supabase projects list

# 2. Se estiver logado, você já tem credenciais
# 3. Pegar token de desenvolvimento:
supabase status
```

Se isso não funcionar, use a **próxima opção:**

---

## ✅ Opção 6: Gerar Token via Supabase Dashboard

### Passo 1: Ir para Supabase Dashboard

1. Acesse: https://supabase.com/dashboard
2. Clique no seu projeto **"tech-arauz"**
3. Vá para **"Settings"** (engrenagem)
4. Clique em **"API"**
5. Copie **"anon key"** (NÃO "service role key")

**Vai ser algo como:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Passo 2: Usar no Script

```bash
bash validate-17.1.sh 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

---

## 🎯 Se Tudo Falhar: Método Alternativo

Se não conseguir token de jeito nenhum, podemos validar **de forma diferente**:

### Usar Supabase CLI + Bash Direto

```bash
# 1. Instalar Supabase CLI (se não tiver)
npm install -g supabase

# 2. Fazer login
supabase login

# 3. Usar Supabase CLI para testar API
supabase db query "SELECT * FROM documents LIMIT 5;"
```

---

## 📋 Checklist Debug

Você tentou:

- [ ] Local Storage
- [ ] Session Storage
- [ ] Cookies
- [ ] Console copy-paste (eyJ...)
- [ ] Supabase CLI (`supabase status`)
- [ ] Supabase Dashboard (anon key)

Quando encontrar qualquer string que comece com `eyJ`, avise qual foi! 🎯

---

## 🆘 Se Nada Funcionar

Avise-me:
1. **Qual foi o último lugar** que você procurou?
2. **Você conseguiu fazer login?** (Viu a página autenticada?)
3. **Qual é o URL exato** que você está usando?

Vou criar uma solução alternativa! 💪
