# DB AUDIT - Tech Arauz (Brownfield Discovery)

Data da auditoria: 2026-02-26  
Escopo: schema SQL, migrations, RLS e padroes de acesso no app Next.js/FastAPI.

## 1. Resumo executivo

- Maturidade estrutural boa: schema relativamente completo, com historico de 38 migrations.
- Multi-tenant existe no modelo e RLS esta difundido.
- Risco principal atual: **complexidade e inconsistencia historica de migrations RLS** em tabelas filhas/logs.
- Risco secundario: **secrets sensiveis persistidos em tabela de configuracao (`espaider_apis.token`)**.

## 2. Achados por severidade

## Critico

### C1 - Historico de RLS com regressao previa em tabelas filhas
- Evidencia: ciclo de correcoes entre `016`, `017`, `019`, `021`, `026`, `027`.
- Impacto: risco de reintroduzir vazamento entre tenants em novos ajustes.
- Estado atual: remediado nas migrations finais, mas fragil devido ao historico.
- Recomendacao:
  1. congelar baseline de RLS com teste automatizado em CI (SQL smoke + fail-fast);
  2. evitar migrations "patch sobre patch" sem ADR.

## Alto

### A1 - Segredo de integracao salvo em coluna textual
- Evidencia: `public.espaider_apis.token` (migration 004).
- Impacto: exposicao acidental de credencial via export, dump ou leitura indevida.
- Recomendacao:
  1. mover token para secret manager/env e manter apenas referencia;
  2. criptografar em repouso se persistencia for obrigatoria;
  3. mascarar em logs e responses.

### A2 - Uso de tenant fixo hardcoded em migrations/rotas
- Evidencia: `00000000-0000-0000-0000-000000000001` em seeds/backfills e codigo.
- Impacto: reduz portabilidade multi-tenant e aumenta risco operacional em novos tenants.
- Recomendacao:
  1. substituir por lookup dinamico de tenant;
  2. isolar seeds por ambiente;
  3. validar tenant em runtime antes de escrita.

### A3 - RLS e controle de autorizacao divididos entre banco e aplicacao
- Evidencia: migrations recentes de logs delegam role-check para API route.
- Impacto: se endpoint for alterado sem cuidado, pode haver abertura de acesso.
- Recomendacao:
  1. documentar matriz de autorizacao (DB x API);
  2. adicionar testes de autorizacao por role em endpoints.

## Medio

### M1 - Crescimento de schema com migrations longas e sobreposicao de objetivos
- Evidencia: varios ciclos de alteracao/rollback no mesmo grupo de tabelas.
- Impacto: manutencao cara e onboarding mais lento.
- Recomendacao:
  1. consolidar "schema snapshot" periodico;
  2. padronizar template de migration (motivo, rollback, teste obrigatorio).

### M2 - Potencial lacuna de constraints de negocio em campos textuais criticos
- Evidencia: diversos campos livres de status/fase/prioridade.
- Impacto: risco de dados inconsistentes e filtros ambiguos.
- Recomendacao:
  1. introduzir enums/check constraints gradualmente nos campos mais usados;
  2. alinhar dicionario de dados com frontend.

## Baixo

### B1 - Comentarios e naming heterogeneos entre dominios
- Impacto: friccao de leitura.
- Recomendacao: padrao unico para naming, comentarios e idioma.

## 3. Validacao de seguranca e isolamento

Pontos positivos:

- RLS habilitado nas tabelas chave.
- Funcoes utilitarias (`get_user_tenant_id`, `audit_rls_policy`) ajudam governanca.
- FKs e unique constraints multi-tenant presentes em entidades sensiveis.

Pontos de atencao:

- Manter testes recorrentes de RLS apos cada migration.
- Revisar periodicamente policies `service_role` para evitar permissividade excessiva.

## 4. Performance e operacao

Pontos positivos:

- Indices em padroes de consulta importantes (tenant, status, data, dataset).
- Estrutura de logs permite observabilidade de sync.

Riscos:

- Tabelas de log tendem a crescer rapidamente.
- Necessidade de politica explicita de retencao/arquivamento.

## 5. Plano de remediacao recomendado

### Curto prazo (1-2 semanas)
1. Automatizar teste SQL de RLS no CI (incluindo `project_*` child tables e logs).
2. Remover/abstrair tenant hardcoded de rotas e scripts.
3. Definir estrategia de segredo para `espaider_apis.token`.

### Medio prazo (2-4 semanas)
1. Consolidar dicionario de dados com enums/checks para campos criticos.
2. Criar politica de retencao para `integration_log_entries` e `sync_logs`.
3. Padronizar modelo de migration com checklist obrigatorio.

### Longo prazo (4-8 semanas)
1. Revisao completa de autorizacao em camadas (RLS + API).
2. Observabilidade de banco (slow queries, lock waits, bloat).
3. Preparacao formal para operacao com multiplos tenants ativos.

## 6. Parecer final

Status geral: **Aprovado com ressalvas**.  
A base e solida para seguir, mas ha divida tecnica de governanca (RLS/secrets/tenant hardcode) que deve entrar no plano prioritario antes de escalar multi-tenant.

