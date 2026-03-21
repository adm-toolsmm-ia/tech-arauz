# Validação via Terminal — Story 17.1 (Automática)

**⚡ Super Rápido:** 1 comando no terminal, resultado em 10 segundos!

---

## 🚀 Como Usar (3 Passos)

### Passo 1: Copie seu JWT Token

1. Abra https://tech-arauz.vercel.app no browser
2. Faça login com sua conta admin
3. Pressione **F12** (abre Developer Tools)
4. Vá para a aba **"Storage"** ou **"Application"**
5. Clique em **"Local Storage"**
6. Procure por uma chave chamada **`auth`** ou **`session`**
7. **Copie o valor** (começa com `eyJ...`)

**Exemplo:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ...
```

---

### Passo 2: Abra Terminal/Cmd

```bash
# Windows: Abra Git Bash, PowerShell ou WSL
# Mac/Linux: Abra Terminal normal
```

---

### Passo 3: Execute o Script

```bash
cd /caminho/para/tech-arauz

bash validate-17.1.sh 'seu-jwt-token-aqui'
```

**Exemplo completo:**
```bash
bash validate-17.1.sh 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn...'
```

---

## ✅ Resultado

O script vai testar **4 APIs** e mostrar:

```
╔════════════════════════════════════════════════════════╗
║  VALIDAÇÃO AUTOMÁTICA - EPIC 17.1                     ║
║  Story 17.1: Graph Data API + Schema                  ║
╚════════════════════════════════════════════════════════╝

URL testada: https://tech-arauz.vercel.app

[Passo 1] API de Grafo
  URL: https://tech-arauz.vercel.app/api/knowledge/graph
  ✅ Resposta válida (JSON)
  ✅ PASSOU
  📊 Nós encontrados: 45

[Passo 2] API de Documentos
  URL: https://tech-arauz.vercel.app/api/knowledge/documents?limit=5
  ✅ Resposta válida (JSON)
  ✅ PASSOU
  📄 Documentos encontrados: 4

[Passo 3] View Count (incrementar)
  Testando com documento ID: abc-123-def
  ✅ Resposta válida (JSON)
  ✅ PASSOU
  🎯 Success: true

[Passo 4] Documentos Relacionados
  URL: https://tech-arauz.vercel.app/api/knowledge/documents/abc-123-def/related
  ✅ Resposta válida (JSON)
  ✅ PASSOU

╔════════════════════════════════════════════════════════╗
║  RESULTADO FINAL                                       ║
╚════════════════════════════════════════════════════════╝

  ✅ Passou: 4/4
  ❌ Falhou: 0/4

╔════════════════════════════════════════════════════════╗
║  🎉 VALIDAÇÃO COMPLETA - STORY 17.1 = APPROVED       ║
╚════════════════════════════════════════════════════════╝
```

---

## 🎯 Se Passar em TODOS os 4 Testes

```
✅ Story 17.1 = APPROVED
📋 Próximo: Story 17.2 (Knowledge Hub Portal)
🚀 Começar: Imediatamente
```

---

## ⚠️ Se Falhar em Algum Teste

**Causas possíveis:**

| Erro | Solução |
|------|---------|
| `401 Unauthorized` | Token expirado → Copie novo token do browser (F12) |
| `404 Not Found` | URL errada → Verifique se URL é `tech-arauz.vercel.app` |
| `Invalid JSON response` | API offline → Aguarde alguns minutos, tente novamente |
| `Connection refused` | Vercel offline → Acesse vercel.com para verificar status |

**Se persistir:**
1. Copie o erro exato
2. Avise para dev team (Dex)
3. Eles corrigem em 5 minutos

---

## 📋 Checklist Final

Você vai executar uma vez e ver resultado claro:

- ☐ Copiei meu JWT token
- ☐ Abri terminal/cmd
- ☐ Executei: `bash validate-17.1.sh 'token'`
- ☐ Vi resultado "APROVADO"
- ☐ Pronto!

---

## 💡 Dica: Guardar o Script

Para futuras validações, você pode rodar novamente:

```bash
bash validate-17.1.sh 'novo-token-aqui'
```

Ou criar um alias no seu `.bashrc` / `.zshrc`:

```bash
alias validate-story-17-1='bash /caminho/tech-arauz/validate-17.1.sh'
```

Aí seria: `validate-story-17-1 'token'`

---

**Pronto! Execute agora! 🚀**

```bash
bash validate-17.1.sh 'seu-jwt-token-aqui'
```
