# Validação Simples — Story 17.1 (Para Admin Sem Conhecimento AIOX)

**⚠️ IMPORTANTE:** Story 17.1 é **APENAS backend/APIs**. Sem interface gráfica ainda!
- Visualização gráfica = **Story 17.3** (próximas semanas)
- Você valida via **Postman ou browser console**

---

## 🎯 O que você vai validar (Simples)

Story 17.1 criou **4 APIs (endpoints) novas** no backend:

| API | Para quê |
|-----|----------|
| `/api/knowledge/graph` | Busca estrutura de conhecimento (grafo) |
| `/api/knowledge/documents` | Busca lista de documentos |
| `/api/knowledge/documents/[id]/view` | Marca um documento como "visto" |
| `/api/knowledge/documents/[id]/related` | Busca documentos relacionados |

Você vai **testar essas 4 APIs** para garantir que funcionam.

---

## 📱 Como Obter Seu Token JWT (Necessário para Validação)

### Passo 1: Abra o Portal Tech Arauz no Browser

1. Vá para seu Vercel URL: `https://[seu-projeto].vercel.app`
2. Faça login com sua conta admin

### Passo 2: Copie seu Token

Abra a **Console do Browser** (F12 ou Cmd+Shift+I):

```
1. Pressione F12 (abre Developer Tools)
2. Vá para aba "Storage" (ou "Application")
3. Clique em "Local Storage"
4. Procure por uma chave chamada "auth" ou "session"
5. Copie o token JWT (começa com "eyJ...")
```

**Alternativa (mais fácil):**

Abra a aba "Network" e faça qualquer ação (ex: carregar página):
- Clique em um request qualquer
- Vá para "Headers"
- Procure por `Authorization: Bearer eyJ...`
- Copie o valor após "Bearer " (o token)

**Token fica assim:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**Guarde este token** — você vai usar em todos os testes.

---

## ✅ Validação em 4 Passos Simples

### Passo 1: Testar API de Grafo

**O que é:** Busca toda a estrutura de conhecimento (áreas, processos, documentos, etc.)

**Como testar (no Browser console):**

1. Abra o Browser console (F12)
2. Cole este comando:

```javascript
fetch('https://[seu-vercel-url]/api/knowledge/graph', {
  headers: {
    'Authorization': 'Bearer [seu-jwt-token-aqui]'
  }
})
.then(res => res.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
```

**Resultado esperado:**
```json
{
  "nodes": [
    {"id": "abc123", "name": "Área 1", "type": "area", "description": "..."},
    {"id": "def456", "name": "Processo 1", "type": "process", "description": "..."},
    ...
  ],
  "links": [
    {"source": "abc123", "target": "def456", "relation": "contains"},
    ...
  ],
  "generatedAt": "2026-03-21T..."
}
```

**✅ PASSOU se:** Viu `nodes` e `links` com dados

**❌ FALHOU se:**
- Erro 401 (token inválido) → copie novo token
- Erro 404 → URL errada
- Nenhum dado → sem dados no banco

---

### Passo 2: Testar API de Documentos

**O que é:** Busca lista de documentos (manuais, guias, etc.)

**No console, cole:**

```javascript
fetch('https://[seu-vercel-url]/api/knowledge/documents?limit=5', {
  headers: {
    'Authorization': 'Bearer [seu-jwt-token-aqui]'
  }
})
.then(res => res.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
```

**Resultado esperado:**
```json
{
  "documents": [
    {
      "id": "xyz789",
      "title": "Manual do Portal",
      "category": "manual",
      "reading_time_minutes": 5,
      "tags": ["api", "backend"],
      "view_count": 0
    }
  ],
  "total": 4,
  "nextCursor": "...",
  "hasMore": false
}
```

**✅ PASSOU se:** Viu lista de documentos com campos como "title", "reading_time_minutes"

**❌ FALHOU se:**
- Lista vazia (ok, significa sem documentos publicados)
- Erro 401 (token inválido)

---

### Passo 3: Testar View Count (Marcar como Visto)

**O que é:** Quando alguém vê um documento, incrementa contador de visualizações

**Pegue um ID de documento do Passo 2** (ex: "xyz789")

**No console, cole:**

```javascript
fetch('https://[seu-vercel-url]/api/knowledge/documents/xyz789/view', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer [seu-jwt-token-aqui]',
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
```

**Resultado esperado (primeira vez):**
```json
{
  "success": true,
  "viewCount": 1
}
```

**Resultado esperado (segunda vez):**
```json
{
  "success": true,
  "viewCount": 2
}
```

**✅ PASSOU se:** Viu `"success": true` e número incrementou (1 → 2 → 3)

**❌ FALHOU se:**
- `"success": false`
- Número não incrementa

---

### Passo 4: Testar Documentos Relacionados

**O que é:** Busca documentos similares/relacionados

**No console, cole (usando ID do documento do Passo 2):**

```javascript
fetch('https://[seu-vercel-url]/api/knowledge/documents/xyz789/related', {
  headers: {
    'Authorization': 'Bearer [seu-jwt-token-aqui]'
  }
})
.then(res => res.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
```

**Resultado esperado:**
```json
{
  "related": [
    {"id": "abc111", "title": "Guia de API", "category": "guia"},
    {"id": "abc222", "title": "Arquitetura", "category": "arquitetura"}
  ]
}
```

**✅ PASSOU se:** Viu array "related" (pode estar vazio, é ok)

**❌ FALHOU se:** Erro 404 ou 401

---

## 🎁 Bônus: Testar Isolação de Tenants (RLS)

**CRÍTICO:** Cada tenant vê APENAS seus dados.

**Se tiver 2 contas diferentes:**

1. Faça login com **Conta A** → copie token A
2. Abra incógnito/nova aba → Faça login com **Conta B** → copie token B
3. No console com token A, execute Passo 1:
   ```javascript
   fetch('https://[seu-vercel-url]/api/knowledge/graph', {
     headers: { 'Authorization': 'Bearer [token-A]' }
   }).then(res => res.json()).then(data => console.log(data.nodes.length))
   // Mostra: X nós
   ```

4. No console com token B, execute:
   ```javascript
   fetch('https://[seu-vercel-url]/api/knowledge/graph', {
     headers: { 'Authorization': 'Bearer [token-B]' }
   }).then(res => res.json()).then(data => console.log(data.nodes.length))
   // Mostra: Y nós (DIFERENTE de X)
   ```

**✅ PASSOU se:** X ≠ Y (números diferentes = dados isolados)

**❌ FALHOU se:** X = Y (ambas contas veem mesmos dados = vazamento!)

---

## 📋 Formulário de Validação (Preencha)

```
VALIDAÇÃO STORY 17.1 — Admin
═════════════════════════════

Data: _______________
Hora: _______________

RESULTADO DOS TESTES:

Passo 1 - API de Grafo
  Resultado: ☐ PASSOU  ☐ FALHOU
  O que viu: _______________________

Passo 2 - API de Documentos
  Resultado: ☐ PASSOU  ☐ FALHOU
  Quantos docs: _______________________

Passo 3 - View Count (incrementa?)
  Resultado: ☐ PASSOU  ☐ FALHOU
  Incrementou de 1→2: ☐ SIM  ☐ NÃO

Passo 4 - Documentos Relacionados
  Resultado: ☐ PASSOU  ☐ FALHOU
  Quantos achados: _______________________

Bônus - RLS Isolation (2 tenants)
  Resultado: ☐ PASSOU  ☐ NÃO TESTADO
  Tenant A nós: ___  Tenant B nós: ___

═════════════════════════════
DECISÃO FINAL:

☐ APROVADO — Todos os passos passaram
☐ BLOQUEADO — Algum passo falhou:
   Qual passo falhou: _______________________
   Erro: _______________________

Comentários:
_________________________________
_________________________________

Admin: _________________
Assinatura: _____________ (opcional)
```

---

## 🆘 Se Algo Falhar

### "401 Unauthorized"
→ Token expirou ou inválido
→ Solução: Copie novo token (F12 → Storage → auth)

### "404 Not Found"
→ URL digitada errada
→ Solução: Verifique se URL do Vercel está correta

### "Nenhum documento encontrado"
→ É ok! Significa sem dados no banco ainda
→ Solução: Nada, passe para próximo passo

### "Error: network failure"
→ Conexão com internet
→ Solução: Verifique internet, tente novamente

---

## 📞 Preciso de Ajuda?

**Se tiver dúvida:**
1. Leia este documento novamente
2. Avise qual **passo exato** está falhando
3. Copie o **erro exato** que apareceu
4. Envie para dev team (Dex)

---

## ✅ Próximos Passos Após Validação

**Se TODOS os 4 passos passarem:**
- ✅ Story 17.1 = **DONE**
- 📋 Próximo: Story 17.2 — Portal de documentos (UI bonita)
- 📅 Quando: Começa hoje/amanhã
- ⏱️ Prazo: ~25 horas

**Se ALGUM passo falhar:**
- 🔧 Dev team corrige imediatamente
- 🔄 Você re-testa
- ✅ Volta para DONE

---

**Boa sorte! 🎯**

Qualquer dúvida, é só avisar.
