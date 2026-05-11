# EPIC 19: Espaider v2 Sync Migration

**Status:** Draft for execution
**Owner:** Espaider integration migration
**Scope:** `docs/stories` + `docs/architecture` + `src/integrations` + `src/lib/sync` + `src/app/api/integracoes` + `supabase`
**Priority:** CRITICAL
**Updated:** 2026-05-11

---

## Contexto

O projeto possui uma integracao funcional com a API Espaider v1, com:

- configuracao por tenant em `espaider_apis`
- sincronizacao manual via frontend e server action
- persistencia multi-tenant com upsert idempotente
- historico de logs exposto no frontend
- tabelas alvo de projetos e datasets filhos ja consolidadas

A nova API v2 muda o contrato de integracao de forma material:

- novo servico `WCFConsultaDados`
- autenticacao via headers
- payload achatado por registro
- filhos retornados inline por `ListaFilhos`
- paginacao por `ConsultarRegistrosComChave`
- filtros formais por `DATAMOVIMENTACAO_DE` e `DATAMOVIMENTACAO_ATE`

Conclusao: esta migracao nao deve ser tratada como patch na rotina atual. Deve ser tratada como substituicao controlada de contrato com reaproveitamento seletivo da infraestrutura util da v1.

Referencia tecnica:

- [ESPAIDER-V2-API-CONTEXT.md](C:/Users/Gabriel%20Cristofolini/Documents/SOLUCOESSISTEMAS/tech-arauz/docs/architecture/ESPAIDER-V2-API-CONTEXT.md)

---

## Problema

Hoje a rotina principal esta acoplada ao contrato v1:

- cliente HTTP orientado a `ExportaDados`
- token enviado no body
- mapeamento baseado em `ListaCampos`
- orquestracao baseada em `ListaURLFilhos`

Com a descontinuacao da v1, isso cria risco direto de:

1. perda de conectividade com a fonte oficial
2. falha estrutural na sincronizacao por incompatibilidade de payload
3. perda de observabilidade caso a nova rotina nao escreva logs no mesmo fluxo do frontend
4. regressao de dados se a carga v2 nao preservar idempotencia e relacoes pai-filho
5. corte sem rollback operacional seguro

---

## Objetivo Principal

Migrar a integracao de projetos do Espaider da API v1 para a API v2 com sincronizacao confiavel, incremental por padrao, logs visiveis no frontend e estrategia de rollback controlada.

---

## Objetivos Especificos

- validar conectividade e contrato da API v2 com credenciais ja disponiveis no projeto
- criar cliente v2 separado do contrato legado
- implementar ETL completo de pai e filhos com validacao, transformacao, carga e quarentena
- preservar logs operacionais visiveis no frontend
- manter idempotencia em reprocessamentos
- permitir cutover progressivo e reversivel da v1 para v2

---

## Nao Objetivos

- reescrever o modulo de projetos no frontend
- remodelar desnecessariamente as tabelas de dominio sem evidenca do contrato v2
- manter compatibilidade eterna entre v1 e v2 no mesmo fluxo
- inventar campos, filtros ou semantics nao confirmados por contrato

---

## Contrato v2 Confirmado

### Endpoint principal

- `POST /WCFConsultaDados/WCFConsultaDados.svc/ConsultarRegistros`

### Metodo de continuacao

- `GET /ConsultarRegistrosComChave?ChavePaginacao=...`

### Headers obrigatorios

- `token`
- `identificador`
- `Content-Type: application/json`

### Identificador principal

- `BI_SOLICITACOES_PROJETOSESPAIDER_v2`

### Estrutura confirmada

- `ListaRegistros`
- `ListaFilhos`
- `URLPaginacao`
- `MensagemRetorno`
- `Situacao`

### Filtro confirmado para incremental

- `DATAMOVIMENTACAO_DE`
- `DATAMOVIMENTACAO_ATE`

---

## Principios da Migracao

1. **Contrato novo, cliente novo:** v2 deve ter boundary proprio e nao ser implementada como remendo no cliente v1.
2. **Observabilidade preservada:** todo evento-chave precisa continuar acessivel no frontend.
3. **Incremental-first:** sync completo fica como fallback operacional; o caminho padrao deve partir de watermark.
4. **Idempotencia obrigatoria:** reprocessar nao pode gerar duplicidade.
5. **Falha isolada:** item invalido vai para quarentena rastreavel, nao para descarte silencioso.
6. **Segredos nao aparecem em logs:** manter o padrao de seguranca ja adotado.
7. **Cutover reversivel:** o desligamento da v1 so acontece com sinal verde operacional e rollback pronto.

---

## Escopo Funcional do Epic

### Dentro do escopo

- cliente HTTP da API v2
- validacao de conectividade
- schemas/contratos v2
- ETL de `ListaRegistros` e `ListaFilhos`
- paginacao do pai e de filhos quando houver `URLPaginacao`
- logs de integracao no frontend
- persistencia idempotente
- quarentena de registros invalidos
- feature flag ou chave de execucao para alternar v1/v2
- rollout e rollback documentados

### Fora do escopo

- redesign das telas de projetos
- expansao de escopo para outras integracoes nao relacionadas
- automacao de agenda/cron fora do que ja existe como base operacional

---

## Criterios de Aceite do Epic

- [ ] Conectividade com a API v2 validada no ambiente do projeto
- [ ] Cliente v2 implementado sem expor segredos em logs
- [ ] Sync v2 registra inicio, fim, tentativa, sucesso, falha e resumo por dataset no frontend
- [ ] Parent dataset e datasets filhos sao persistidos corretamente nas tabelas alvo
- [ ] Reprocessamento nao cria duplicidades
- [ ] Itens invalidos sao isolados com motivo rastreavel
- [ ] Paginacao do pai e dos filhos funciona quando `URLPaginacao` existir
- [ ] Modo incremental baseado em `DATAMOVIMENTACAO_*` implementado ou formalmente protegido por fallback
- [ ] Cutover v1 -> v2 controlado por mecanismo reversivel
- [ ] Plano de rollback documentado e verificavel
- [ ] Checklist e file list atualizados

---

## Arquitetura Alvo

### Boundary sugerido

- `src/integrations/espaider-v2/config.ts`
- `src/integrations/espaider-v2/client.ts`
- `src/integrations/espaider-v2/schemas.ts`
- `src/integrations/espaider-v2/mappers/*`
- `src/lib/sync/espaider-v2-sync.ts`

### Reaproveitamento recomendado da v1

- armazenamento e resolucao segura de token
- convencoes de retry, timeout e circuit breaker
- modelo de logs em `integration_log_entries`
- orquestracao de permissao/autenticacao no backend
- padrao de upsert por `tenant_id + espaider_id`
- tabelas alvo atuais, salvo necessidade validada pela v2

### Reaproveitamento que deve ser evitado

- request builder da v1
- schemas de `ListaCampos`
- processamento via `ListaURLFilhos`
- acoplamento direto ao `espaider-sync.ts` atual

---

## Plano por Fases

### Fase 1: Contrato e conectividade v2

**Objetivo:** provar acesso, shape do payload e regras de paginacao.

**Saidas esperadas:**

- cliente HTTP v2 minimo
- teste de conectividade autenticado
- schema inicial do parent response
- documentacao do delta v1 -> v2 consolidada

### Fase 2: Validacao, mapping e ETL do dataset pai

**Objetivo:** carregar `ListaRegistros` com validacao forte e idempotencia.

**Saidas esperadas:**

- schemas do parent dataset
- mappers v2 -> dominio
- upsert confiavel em `projects`
- estrategia de watermark inicial

### Fase 3: ETL dos datasets filhos

**Objetivo:** processar `ListaFilhos` inline e drenar paginacao dos filhos.

**Saidas esperadas:**

- roteamento por `Identificador`
- mappers por dataset filho
- persistencia nas tabelas filhas corretas
- tratamento de filhos com `URLPaginacao`

### Fase 4: Observabilidade, quarentena e controles operacionais

**Objetivo:** manter visibilidade operacional e diagnostico de falhas.

**Saidas esperadas:**

- logs de tentativa, sucesso, falha, page fetch, resumo
- quarentena de registros invalidos
- correlacao por request/sync run
- feature flag de alternancia v1/v2

### Fase 5: Cutover, rollback e desligamento seguro da v1

**Objetivo:** migrar em producao sem perder reversibilidade.

**Saidas esperadas:**

- plano de rollout
- validacao operacional da v2
- desativacao segura da v1
- roteiro de rollback documentado

---

## Backlog Inicial de Stories

As stories abaixo sao a proposta inicial derivada deste epic. Elas podem ser refinadas em artefatos separados antes da implementacao:

1. [19.1-espaider-v2-client-connectivity.story.md](C:/Users/Gabriel%20Cristofolini/Documents/SOLUCOESSISTEMAS/tech-arauz/docs/stories/19.1-espaider-v2-client-connectivity.story.md)
2. [19.2-espaider-v2-schemas-contract-tests.story.md](C:/Users/Gabriel%20Cristofolini/Documents/SOLUCOESSISTEMAS/tech-arauz/docs/stories/19.2-espaider-v2-schemas-contract-tests.story.md)
3. [19.3-espaider-v2-parent-incremental-sync.story.md](C:/Users/Gabriel%20Cristofolini/Documents/SOLUCOESSISTEMAS/tech-arauz/docs/stories/19.3-espaider-v2-parent-incremental-sync.story.md)
4. [19.4-espaider-v2-child-datasets-orchestration.story.md](C:/Users/Gabriel%20Cristofolini/Documents/SOLUCOESSISTEMAS/tech-arauz/docs/stories/19.4-espaider-v2-child-datasets-orchestration.story.md)
5. [19.5-espaider-v2-quarantine-invalid-records.story.md](C:/Users/Gabriel%20Cristofolini/Documents/SOLUCOESSISTEMAS/tech-arauz/docs/stories/19.5-espaider-v2-quarantine-invalid-records.story.md)
6. [19.6-espaider-v2-frontend-visible-logs.story.md](C:/Users/Gabriel%20Cristofolini/Documents/SOLUCOESSISTEMAS/tech-arauz/docs/stories/19.6-espaider-v2-frontend-visible-logs.story.md)
7. [19.7-espaider-v2-cutover-controls.story.md](C:/Users/Gabriel%20Cristofolini/Documents/SOLUCOESSISTEMAS/tech-arauz/docs/stories/19.7-espaider-v2-cutover-controls.story.md)
8. [19.8-espaider-v2-rollout-rollback-decommission.story.md](C:/Users/Gabriel%20Cristofolini/Documents/SOLUCOESSISTEMAS/tech-arauz/docs/stories/19.8-espaider-v2-rollout-rollback-decommission.story.md)

---

## Riscos e Mitigacoes

### Risco 1: tratar v2 como patch da v1

- **Impacto:** alto
- **Mitigacao:** boundary separado para cliente, schemas e sync v2

### Risco 2: perda de logs no frontend

- **Impacto:** alto
- **Mitigacao:** manter `integration_log_entries` como superficie visivel desde a primeira fase operacional

### Risco 3: paginacao parcial dos filhos

- **Impacto:** alto
- **Mitigacao:** considerar `URLPaginacao` no pai e em cada filho como parte do contrato obrigatorio

### Risco 4: duplicidade por reprocessamento

- **Impacto:** alto
- **Mitigacao:** manter natural key por `tenant_id + espaider_id` e confirmar estrategia de update por dataset

### Risco 5: descarte silencioso de item invalido

- **Impacto:** medio-alto
- **Mitigacao:** quarentena com payload bruto, dataset, motivo e request_id

### Risco 6: corte sem rollback

- **Impacto:** critico
- **Mitigacao:** feature flag, validacao por ambiente e janela curta de reversao

---

## Dependencias

### Artefatos-base

- [ESPAIDER-V2-API-CONTEXT.md](C:/Users/Gabriel%20Cristofolini/Documents/SOLUCOESSISTEMAS/tech-arauz/docs/architecture/ESPAIDER-V2-API-CONTEXT.md)
- [ESPAIDER-INTEGRATION.md](C:/Users/Gabriel%20Cristofolini/Documents/SOLUCOESSISTEMAS/tech-arauz/docs/architecture/ESPAIDER-INTEGRATION.md)
- [ESPAIDER-DATABASE-SCHEMA.md](C:/Users/Gabriel%20Cristofolini/Documents/SOLUCOESSISTEMAS/tech-arauz/docs/architecture/ESPAIDER-DATABASE-SCHEMA.md)
- [module-standards.md](C:/Users/Gabriel%20Cristofolini/Documents/SOLUCOESSISTEMAS/tech-arauz/docs/architecture/module-standards.md)

### Base tecnica existente

- [sync.ts](C:/Users/Gabriel%20Cristofolini/Documents/SOLUCOESSISTEMAS/tech-arauz/src/app/actions/sync.ts)
- [route.ts](C:/Users/Gabriel%20Cristofolini/Documents/SOLUCOESSISTEMAS/tech-arauz/src/app/api/integracoes/sync/route.ts)
- [espaider-sync.ts](C:/Users/Gabriel%20Cristofolini/Documents/SOLUCOESSISTEMAS/tech-arauz/src/lib/sync/espaider-sync.ts)
- [route.ts](C:/Users/Gabriel%20Cristofolini/Documents/SOLUCOESSISTEMAS/tech-arauz/src/app/api/integracoes/logs/route.ts)

---

## Pendencias de Input

Estes pontos nao foram inventados e precisam ser confirmados durante o refinamento ou implementacao:

- [ ] fonte exata das credenciais v2 ja disponiveis no runtime
- [ ] politica de watermark para incremental
- [ ] se a quarentena sera tabela dedicada, log dedicado ou ambos
- [ ] criterio de desligamento definitivo da v1 por ambiente

---

## Checklist

### Checklist do artefato

- [x] Problema documentado
- [x] Objetivo principal documentado
- [x] Contrato v2 inicial documentado
- [x] Fases do epic documentadas
- [x] Backlog inicial de stories proposto
- [x] Riscos e mitigacoes documentados
- [x] Dependencias documentadas
- [x] Pendencias de input explicitadas
- [x] File list atualizada

### Checklist para stories derivadas

- [ ] Confirmar source of truth contratual com sample + especificacao
- [ ] Confirmar logs visiveis no frontend
- [ ] Confirmar nao exposicao de segredos
- [ ] Confirmar idempotencia por dataset
- [ ] Confirmar paginacao do pai e de filhos
- [ ] Confirmar fallback e rollback operacionais
- [ ] Rodar `npm run lint`
- [ ] Rodar `npm run typecheck`
- [ ] Rodar `npm test`
- [ ] Atualizar checklist e file list antes de concluir

---

## File List

### Criados

- `docs/stories/EPIC-19-Espaider-v2-Sync-Migration.md`
- `docs/architecture/ESPAIDER-V2-API-CONTEXT.md`
- `docs/stories/19.1-espaider-v2-client-connectivity.story.md`
- `docs/stories/19.2-espaider-v2-schemas-contract-tests.story.md`
- `docs/stories/19.3-espaider-v2-parent-incremental-sync.story.md`
- `docs/stories/19.4-espaider-v2-child-datasets-orchestration.story.md`
- `docs/stories/19.5-espaider-v2-quarantine-invalid-records.story.md`
- `docs/stories/19.6-espaider-v2-frontend-visible-logs.story.md`
- `docs/stories/19.7-espaider-v2-cutover-controls.story.md`
- `docs/stories/19.8-espaider-v2-rollout-rollback-decommission.story.md`

### Modificados

- Nenhum artefato de codigo nesta etapa

---

## Referencias

- `C:\Users\Gabriel Cristofolini\Downloads\response.bin`
- `C:\Users\Gabriel Cristofolini\Downloads\Especificacao_Tecnica_Versao_1.pdf`
- `POST https://espaider.com.br/Arauz/WCF/WCFConsultaDados/WCFConsultaDados.svc/ConsultarRegistros`
- `BI_SOLICITACOES_PROJETOSESPAIDER_v2`

---

## Resultado Esperado do Epic

Ao final deste epic, o projeto deve operar a integracao v2 com:

- conectividade validada
- sync incremental confiavel
- ETL pai/filhos com idempotencia
- logs acessiveis no frontend
- v1 desligada com rollback claro
