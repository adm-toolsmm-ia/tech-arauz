# Secret Rotation Procedure

**Data:** 2026-02-28
**Status:** Archived — Superseded by system-architecture.md and security documentation
**Última atualização:** 2026-03-07
**Story:** 2.26 — Security Hardening
**Revisão:** Trimestral

## 1. Secrets Críticos

| Secret | Onde Definir | Impacto se Comprometido |
|--------|-------------|------------------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel + GitHub Secrets | Acesso total ao banco (bypassa RLS) |
| `SUPABASE_JWT_SECRET` | Vercel + AI Service | Forjar tokens de autenticação |
| `INTEGRATION_TOKEN_SECRET` | Vercel + GitHub Secrets | Decriptar tokens de integração Espaider |

## 2. Procedimento de Rotação

### 2.1 SUPABASE_SERVICE_ROLE_KEY

**Frequência:** A cada 6 meses ou após incidente

1. Acessar [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → API
2. Regenerar Service Role Key (clique "Regenerate")
3. Atualizar em:
   - Vercel: Project Settings → Environment Variables → `SUPABASE_SERVICE_ROLE_KEY`
   - GitHub: Repository Settings → Secrets → `SUPABASE_SERVICE_ROLE_KEY`
4. Redeploy em Vercel (automático com variável atualizada)
5. Executar `npm run audit:rls` para validar acesso

**Downtime esperado:** Zero (Supabase mantém key anterior ativa por 1 hora)

### 2.2 SUPABASE_JWT_SECRET

**Frequência:** A cada 6 meses ou após incidente

1. Acessar Supabase Dashboard → Project Settings → API → JWT Secret
2. Copiar o novo JWT Secret
3. Atualizar em:
   - Vercel: `SUPABASE_JWT_SECRET`
   - AI Service (Railway/host): variável de ambiente
4. Redeploy ambos os serviços
5. Testar autenticação no portal

**Downtime esperado:** ~2 minutos (sessões existentes invalidadas)

### 2.3 INTEGRATION_TOKEN_SECRET

**Frequência:** A cada 12 meses ou após incidente

> **ATENÇÃO:** Rotação deste secret invalida todos os tokens criptografados no banco.

1. Gerar novo secret: `openssl rand -base64 32`
2. **ANTES** de atualizar: rodar migration para re-encriptar tokens existentes:
   ```sql
   -- Listar tokens criptografados que precisam re-encriptação
   SELECT id, token FROM espaider_apis WHERE token LIKE 'enc:v1:%';
   ```
3. Atualizar em Vercel e GitHub Secrets
4. Redeploy
5. Executar sync de teste (`npm run sync`) para validar tokens

**Downtime esperado:** ~5 minutos (tokens inválidos até re-encriptação)

## 3. Checklist de Rotação

```
- [ ] Identificar secret a rotacionar
- [ ] Comunicar equipe (janela de manutenção)
- [ ] Salvar secret anterior (para rollback)
- [ ] Gerar/obter novo secret
- [ ] Atualizar em todos os ambientes (Vercel, GitHub, AI Service)
- [ ] Redeploy serviços afetados
- [ ] Executar smoke tests:
  - [ ] Login no portal funciona
  - [ ] Sync Espaider funciona
  - [ ] CI pipeline passa
  - [ ] RLS audit OK
- [ ] Remover secret anterior após 24h de estabilidade
- [ ] Atualizar log de rotação abaixo
```

## 4. Log de Rotação

| Data | Secret | Motivo | Executor |
|------|--------|--------|----------|
| — | — | Nenhuma rotação registrada ainda | — |

## 5. Alertas

Se um secret for comprometido (exposição em log, commit, etc.):

1. **Rotacionar imediatamente** — não esperar janela de manutenção
2. Revogar secret antigo no provider (Supabase Dashboard)
3. Auditar logs de acesso no período de exposição
4. Notificar responsável técnico
