# Log de Execução de Migrations e Correções (026 e 027)

Este documento contém o registro da execução do comando `npx supabase db push` para aplicar as migrations locais pendentes no ambiente remoto do Supabase, juntamente com o log dos bugs corrigidos. Você pode fornecer este conteúdo para o Claude para contexto e validação.

## Status Inicial e Problema

Quando tentamos aplicar as migrations `026_create_rls_audit_function.sql` e `027_remediate_rls_critical_gaps.sql`, ocorreu um erro de SQL na migration `026`:

```
Applying migration 026_create_rls_audit_function.sql...
ERROR: column "audit_status" does not exist (SQLSTATE 42703)
```

## Correções Aplicadas na Migration `026_create_rls_audit_function.sql`

A migration 026 falhou por dois problemas de sintaxe no SQL:

1. **Ambiguidade no argumento da função:**
   O argumento da função `audit_rls_policy` estava nomeado como `table_name`. Isso causava conflito com a coluna `table_name` retornada no `RETURNS TABLE`, além das colunas `table_name` de views de sistema internas.
   **Correção:** Renomeamos o argumento da função para `p_table_name` e ajustamos todas as referências internas na cláusula `WHERE` (e.g., `tablename = p_table_name`).

2. **Falta de parênteses no `OR`:**
   A query continha a condição `AND qual LIKE '%service_role%' OR policyname LIKE '%service%'`, o que afetava a precedência lógica e retornava resultados indesejados globais para a consulta.
   **Correção:** Adicionados parênteses ao bloco condicional longo.

3. **Uso de Alias de Coluna em Subquery (Erro 42703):**
   A View `rls_audit_summary` estava tentando usar o alias gerado em tempo de execução `audit_status` dentro da cláusula `ORDER BY` na mesma query de projeção, o que o PostgreSQL não permite daquela forma no mesmo escopo com um `CASE WHEN`.
   **Correção:** Envolvemos o cálculo da coluna `audit_status` em uma expressão em CTE (`WITH source_data AS (...)`) para que a query externa pudesse livremente ordenar sobre esse cálculo retornado.

## Execução Final

Após aplicar os fix no script `026`, rodamos o `npx supabase db push` novamente, obtendo sucesso completo:

```bash
> npx supabase db push

Initialising login role...
Connecting to remote database...
Do you want to push these migrations to the remote database?
 • 026_create_rls_audit_function.sql
 • 027_remediate_rls_critical_gaps.sql

 [Y/n] y
Applying migration 026_create_rls_audit_function.sql...
Applying migration 027_remediate_rls_critical_gaps.sql...
Finished supabase db push.
```
*(Nota: O log acima omitiu os warnings não-críticos do banco de dados na migration 027 referente a constraints já inexistentes que ele tentou dropar).*

As migrations agora estão devidamente aplicadas no ambiente do Supabase e sincronizadas localmente.
