# 🔑 Atualizar Token Espaider - Guia Rápido

**Status:** Token atual ❌ EXPIRADO/INVÁLIDO

## Passo 1: Obter Novo Token no Espaider

1. Acesse: https://espaider.com.br/Arauz
2. Faça login com suas credenciais
3. Procure por "API Tokens" ou "Chaves de Acesso"
4. Gere um novo token
5. **Copie o token completo** (será usado no Passo 2)

## Passo 2: Atualizar no Portal Tech

### Opção A: Via Portal (Interface Gráfica)

1. Acesse: https://tech-arauz.vercel.app/integracoes
2. Procure por "Projetos (API Completa)"
3. Clique em "Editar" ou "Configurar"
4. Cole o novo token no campo "Token"
5. Salve as mudanças

### Opção B: Via SQL (Direto no Supabase)

```sql
UPDATE public.espaider_apis
SET token = 'SEU_NOVO_TOKEN_AQUI'
WHERE tipo = 'projetos'
  AND tenant_id = '00000000-0000-0000-0000-000000000001';
```

**Substitua `SEU_NOVO_TOKEN_AQUI` pelo token copiado no Passo 1.**

## Passo 3: Testar Sincronização

1. Acesse: https://tech-arauz.vercel.app/integracoes
2. Clique no botão "🔄 Sincronizar"
3. Aguarde até 2-3 minutos
4. Verifique:
   - ✅ Novo log aparece em "Resumo por Execução"
   - ✅ Projeto SUPOR.00429/26 aparece em "/projetos"
   - ✅ Última atualização não é de 07/03

## 🧪 Verificação Técnica

Para verificar se o token está funcionando:

```bash
curl -X POST "https://espaider.com.br/Arauz/WCF/WCFExportaDados/ExportaDados" \
  -H "Content-Type: application/json" \
  -d '{
    "Token": "SEU_TOKEN_AQUI",
    "Identificador": "BI_SOLICITACOES_PROJETOSESPAIDER"
  }'
```

Deve retornar JSON com `ListaRegistros` contendo os projetos.

## 📊 Mudanças Implementadas

| Item | Status | Descrição |
|------|--------|-----------|
| **URL Espaider** | ✅ Corrigida | De `.../WCFExportaDados.svc` para `.../WCFExportaDados` |
| **HorasLancadas** | ✅ Implementado | Nova função `syncHorasLancadasFromRegistros()` |
| **Token** | ❌ EXPIRADO | Aguardando atualização |

## ⚙️ Configuração Atual

| Campo | Valor |
|-------|-------|
| **Base URL** | `https://espaider.com.br/Arauz/WCF/WCFExportaDados` |
| **Identificador** | `BI_SOLICITACOES_PROJETOSESPAIDER` |
| **Token Status** | Inválido/Expirado |
| **Último Sync** | 2026-03-19 13:01:16 (FALHOU) |

---

**❓ Dúvidas?** Verifique os logs em `/integracoes` → "Logs Detalhados"
