# 📂 supabase/ (Database & Backend)

> **Contexto:** Configurações, Migrations e Seeds do banco de dados PostgreSQL gerenciado pelo Supabase.

## 🎯 Propósito
Garantir a integridade, versionamento e reprodutibilidade do banco de dados.

## 📄 Estrutura & Arquivos Chave
- `migrations/`: Histórico de alterações do Schema SQL.
- `seed.sql`: Dados iniciais para ambiente de desenvolvimento.
- `config.toml`: Configuração local do Supabase CLI.

## 🚀 Como Usar

### Aplicar Migrations (Local)
```bash
npm run db:apply
# (roda: npx supabase db push)
# ou reset completo local:
npx supabase db reset
```

### Criar Nova Migration
```bash
npx supabase migration new nome_da_mudanca
```

## ⚠️ Notas Importantes
- **NUNCA delete arquivos de migration antigos.** Eles são o histórico da evolução do banco.
- **RLS (Row Level Security):** Todas as tabelas devem ter RLS habilitado. Verifique `migrations/002_rls_policies.sql`.
