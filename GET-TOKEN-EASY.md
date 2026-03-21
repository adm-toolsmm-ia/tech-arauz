# 🚀 Forma Mais Fácil: Pegar Token Automaticamente

**Sem copiar nada, sem F12, sem complicações!**

---

## ⚡ Método: Endpoint de Teste

Criei um endpoint que **gera seu token automaticamente**:

### Passo 1: Abra no Browser

```
https://tech-arauz.vercel.app/api/test-token
```

**Pronto! Ele vai retornar:**

```json
{
  "message": "Your authentication token",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": "gabriel_cristofolini@arauz.com.br",
  "expiresIn": 3600,
  "usage": "curl -H 'Authorization: Bearer eyJ...' https://tech-arauz.vercel.app/api/knowledge/documents"
}
```

### Passo 2: Copie o Token

Copie a string do campo `"token"`

### Passo 3: Use no Script

```bash
bash validate-17.1.sh 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

**Pronto! ✅**

---

## 🎯 Resumo

| Antes | Agora |
|-------|-------|
| ❌ F12 → Application → Local Storage → procura por auth | ✅ Abra URL no browser → copia token |
| ❌ Pode não estar no Local Storage | ✅ Sempre retorna seu token |
| ❌ Difícil de encontrar | ✅ Simples, direto, automático |

---

## 💡 Como Funciona (Técnicamente)

```
1. Você faz login no portal
   └─ Cookies de autenticação são salvos no browser

2. Você acessa /api/test-token
   └─ Browser envia cookies automaticamente

3. Endpoint lê os cookies
   └─ Encontra seu token de sessão

4. Retorna o token como JSON
   └─ Você copia

5. Usa em qualquer request
   └─ Script valida todas as APIs
```

---

**Agora é super simples! 🎉**

1. Abra: https://tech-arauz.vercel.app/api/test-token
2. Copie o token
3. Execute: `bash validate-17.1.sh 'token'`

Pronto! 🚀
