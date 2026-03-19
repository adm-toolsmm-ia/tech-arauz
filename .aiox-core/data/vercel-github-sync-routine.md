# Rotina Padronizada: Sincronização Vercel → GitHub → Automação CI/CD

**Status:** ✅ Implementada
**Data:** 2026-03-19
**Agent Responsável:** @devops (Gage)
**Versão:** 1.0.0

---

## 📌 Visão Geral

Rotina automatizada que sincroniza variáveis de ambiente do Supabase para Vercel via GitHub Actions, com deploy automático em `git push main`.

**Fluxo:**
```
GitHub Secrets (Supabase + Vercel)
    ↓
GitHub Actions (sync-vercel-env.yml)
    ↓
Script Node.js (sync-vercel-env.js)
    ↓
Vercel API (adiciona env vars)
    ↓
Deploy automático para produção
```

---

## 🔐 Secrets Necessários (GitHub)

| Secret | Origem | Tipo | Notas |
|--------|--------|------|-------|
| `SUPABASE_URL` | Supabase Settings → API | Public | URL do projeto |
| `SUPABASE_ANON_KEY` | Supabase Settings → API | Secret | Chave anônima (público) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Settings → API | Secret | Chave interna (segura) |
| `VERCEL_ORG_ID` | Vercel Dashboard → Team Settings | Public | Team ID (team_xxx) |
| `VERCEL_PROJECT_ID` | Vercel Dashboard → Project Settings | Public | Project ID (prj_xxx) |
| `VERCEL_TOKEN` | Vercel → Account → Tokens | Secret | Token com Full Access |

### Instruções para Adicionar (via CLI)

```bash
# Adicionar via gh secret set (recomendado)
gh secret set SUPABASE_URL --body "https://seu-projeto.supabase.co"
gh secret set SUPABASE_ANON_KEY --body "ey..."
gh secret set SUPABASE_SERVICE_ROLE_KEY --body "ey..."
gh secret set VERCEL_ORG_ID --body "team_xxx"
gh secret set VERCEL_PROJECT_ID --body "prj_xxx"
gh secret set VERCEL_TOKEN --body "vcp_xxx"

# Confirmar
gh secret list
```

---

## ⚙️ Componentes da Rotina

### 1. Workflow GitHub (`.github/workflows/sync-vercel-env.yml`)

**Disparadores:**
- `git push` para `main`
- Manual via `workflow_dispatch`

**Etapas:**
1. Checkout do repositório
2. Setup Node.js 20
3. Install Vercel CLI
4. Executar script de sincronização
5. Deploy para produção

**Tempo estimado:** 2-3 minutos

### 2. Script de Sincronização (`.github/scripts/sync-vercel-env.js`)

**Função:**
- Ler variáveis do GitHub Secrets (via env vars do Actions)
- Chamar Vercel API para criar/atualizar env vars
- Tratamento de erros com fallback

**Comportamento:**
- Deleta old var (se existe)
- Cria nova var com `target: ['production']`
- Valida sucesso via status HTTP 201

---

## 🚀 Fluxo Operacional

### Início de Novo Projeto

1. **Criar Vercel Token**
   ```bash
   # https://vercel.com/account/tokens
   # Scope: Full Account
   ```

2. **Adicionar Secrets no GitHub**
   ```bash
   gh secret set VERCEL_ORG_ID --body "team_xxx"
   gh secret set VERCEL_PROJECT_ID --body "prj_xxx"
   gh secret set VERCEL_TOKEN --body "vcp_xxx"
   gh secret set SUPABASE_URL --body "..."
   gh secret set SUPABASE_ANON_KEY --body "..."
   gh secret set SUPABASE_SERVICE_ROLE_KEY --body "..."
   ```

3. **Verificar Workflow**
   ```bash
   git push origin main
   # GitHub Actions vai disparar automaticamente
   ```

4. **Monitorar Deploy**
   - GitHub → Actions → sync-vercel-env
   - Vercel → Deployments

### Troubleshooting

| Problema | Causa | Solução |
|----------|-------|---------|
| Workflow fails (401) | Token inválido | Regenerar VERCEL_TOKEN |
| Env vars não sincronizam | Secret faltando | Verificar com `gh secret list` |
| Deploy fails silently | Variáveis não configuradas | Verificar Vercel → Environment Variables |
| Sync não dispara | Workflow deshabilitado | Verificar `.github/workflows/sync-vercel-env.yml` |

---

## 📊 Monitoramento

### GitHub Actions
```bash
# Ver status do último workflow
gh workflow view sync-vercel-env
gh run list --workflow=sync-vercel-env.yml --limit=5
```

### Vercel
```bash
# Ver logs de deploy
vercel logs --prod
# Ver env vars configuradas
vercel env ls
```

---

## 🔄 Manutenção

### Renovação de Tokens
- **VERCEL_TOKEN:** Verificar validade em https://vercel.com/account/tokens
- **Supabase Keys:** Regenerar em Supabase Settings se comprometidas

### Atualização de Variáveis
- Editar no GitHub Secrets
- Próximo `git push main` sincroniza automaticamente

---

## 📝 Histórico

- **v1.0.0** (2026-03-19): Implementação inicial
  - Workflow sync-vercel-env.yml criado
  - Script Node.js funcional
  - 5 secrets configurados

---

**Responsável:** @devops (Gage)
**Próxima revisão:** 2026-06-19

