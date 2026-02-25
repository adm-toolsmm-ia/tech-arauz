# Workflow: /supabase

> **Comando**: `/supabase`  
> **Versão**: 1.0.0  
> **Skill**: supabase-mcp

## Descrição

Workflow para operações com Supabase via MCP, incluindo migrations, queries, debugging e gestão de schema.

## Subcomandos

### `/supabase migrate`

Aplica migrations pendentes ao banco de dados.

**Fluxo:**
```
1. Listar arquivos em supabase/migrations/
2. Verificar migrations já aplicadas (sync_logs ou histórico)
3. Para cada migration pendente:
   a. Ler conteúdo do arquivo SQL
   b. Executar via MCP execute_sql
   c. Verificar sucesso com list_tables
   d. Registrar em IMPLEMENTATIONS.md
4. Exibir resumo
```

**Uso:**
```
/supabase migrate              # Aplica todas pendentes
/supabase migrate 001          # Aplica específica
/supabase migrate --dry-run    # Apenas mostra o que seria executado
```

### `/supabase schema`

Exibe ou valida o schema atual.

**Fluxo:**
```
1. MCP: list_tables
2. Para cada tabela:
   a. MCP: get_table_schema
   b. Verificar RLS habilitado
   c. Verificar índices
   d. Verificar policies
3. Gerar relatório
```

**Uso:**
```
/supabase schema               # Lista todas tabelas
/supabase schema projects      # Detalhes de uma tabela
/supabase schema --validate    # Valida contra migrations
```

### `/supabase query`

Executa query SQL no banco.

**Fluxo:**
```
1. Receber query do usuário
2. Validar sintaxe (básico)
3. MCP: execute_sql
4. Exibir resultados formatados
```

**Uso:**
```
/supabase query "SELECT * FROM tenants"
/supabase query "SELECT count(*) FROM projects WHERE tenant_id = '...'"
```

### `/supabase debug`

Analisa logs e erros do projeto.

**Fluxo:**
```
1. MCP: get_logs
2. Filtrar por severidade/tempo
3. Agrupar por tipo de erro
4. Sugerir correções
```

**Uso:**
```
/supabase debug                # Últimos logs
/supabase debug --errors       # Apenas erros
/supabase debug --since 1h     # Última hora
```

### `/supabase seed`

Aplica dados iniciais ao banco.

**Fluxo:**
```
1. Verificar se tenant existe
2. Ler supabase/seed.sql
3. MCP: execute_sql
4. Verificar resultados
```

**Uso:**
```
/supabase seed                 # Aplica seed.sql
/supabase seed --reset         # Limpa e reaplica (CUIDADO)
```

### `/supabase status`

Exibe status geral do banco.

**Fluxo:**
```
1. MCP: list_tables (contagem)
2. MCP: list_extensions
3. MCP: get_config (se disponível)
4. Verificar IMPLEMENTATIONS.md
5. Exibir dashboard
```

**Uso:**
```
/supabase status
```

**Output exemplo:**
```
╔══════════════════════════════════════════════════════════════╗
║                    SUPABASE STATUS                           ║
╠══════════════════════════════════════════════════════════════╣
║ Projeto: pybmawlwpmxshtccpqui                                ║
║ Tabelas: 7                                                   ║
║ Migrations: 2 aplicadas                                      ║
║ RLS: ✅ Habilitado em todas                                  ║
║ Extensions: uuid-ossp, pgcrypto                              ║
╚══════════════════════════════════════════════════════════════╝
```

## Variáveis de Ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=https://pybmawlwpmxshtccpqui.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_key>
```

## Integração com Agentes

| Agente | Uso do Workflow |
|--------|-----------------|
| database-architect | `/supabase migrate`, `/supabase schema` |
| backend-specialist | `/supabase query`, `/supabase debug` |
| security-auditor | `/supabase schema --validate` |
| orchestrator | Coordena execução entre agentes |

## Exemplos de Uso

### Cenário 1: Primeira Configuração

```bash
# 1. Verificar status
/supabase status

# 2. Aplicar migrations
/supabase migrate

# 3. Aplicar seed
/supabase seed

# 4. Verificar schema
/supabase schema --validate
```

### Cenário 2: Adicionar Nova Tabela

```bash
# 1. Criar migration file (manual)
# supabase/migrations/003_create_nova_tabela.sql

# 2. Aplicar
/supabase migrate 003

# 3. Validar
/supabase schema nova_tabela
```

### Cenário 3: Debug de Problema

```bash
# 1. Verificar logs
/supabase debug --errors

# 2. Query específica para investigar
/supabase query "SELECT * FROM sync_logs ORDER BY created_at DESC LIMIT 10"

# 3. Verificar RLS se for problema de permissão
/supabase schema --validate
```

## Checklist Pré-Execução

Antes de usar este workflow:
- [ ] MCP Supabase configurado em `.cursor/mcp.json`
- [ ] Autenticação OAuth realizada
- [ ] Projeto correto selecionado
- [ ] Backup realizado (para operações destrutivas)

## Erros Comuns

### "Authentication required"
→ Realizar login OAuth via browser

### "Project not found"
→ Verificar project ref em `supabase/README.md`

### "Permission denied"
→ Verificar role do usuário autenticado

## Referências

- Skill: `.agent/skills/supabase-mcp/SKILL.md`
- Migrations: `supabase/migrations/`
- ADR: `.context/03-specs/adr/2026-02-ADR-001-stack-tecnica.md`
