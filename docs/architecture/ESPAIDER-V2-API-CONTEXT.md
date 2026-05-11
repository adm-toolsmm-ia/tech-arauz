# ESPAIDER V2 API CONTEXT

**Status:** Draft for implementation planning
**Updated:** 2026-05-11
**Source of truth:** `response.bin` sample + `Especificacao_Tecnica_Versao_1.pdf` + current repo architecture
**Audience:** PM, Architect, Data Engineer, Claude implementation flow

---

## Purpose

This document captures the technical context for migrating the Tech Arauz integration from the current Espaider sync flow to API v2.

It does not define the full implementation. It defines the contract delta, the operational implications, and the architectural constraints that the implementation must respect.

---

## Source Artifacts

- Sample response:
  - `C:\Users\Gabriel Cristofolini\Downloads\response.bin`
- Vendor specification:
  - `C:\Users\Gabriel Cristofolini\Downloads\Especificacao_Tecnica_Versao_1.pdf`
- Current integration references:
  - [ESPAIDER-INTEGRATION.md](C:/Users/Gabriel%20Cristofolini/Documents/SOLUCOESSISTEMAS/tech-arauz/docs/architecture/ESPAIDER-INTEGRATION.md)
  - [ESPAIDER-DATABASE-SCHEMA.md](C:/Users/Gabriel%20Cristofolini/Documents/SOLUCOESSISTEMAS/tech-arauz/docs/architecture/ESPAIDER-DATABASE-SCHEMA.md)
  - [espaider-sync.ts](C:/Users/Gabriel%20Cristofolini/Documents/SOLUCOESSISTEMAS/tech-arauz/src/lib/sync/espaider-sync.ts)

---

## Confirmed V2 Contract

### Endpoint

- Initial request:
  - `POST https://espaider.com.br/Arauz/WCF/WCFConsultaDados/WCFConsultaDados.svc/ConsultarRegistros`
- Paginated follow-up request:
  - `GET .../ConsultarRegistrosComChave?ChavePaginacao=...`

### Headers

- `token`
- `identificador`
- `Content-Type: application/json`

The vendor specification states that `token` and `identificador` are sent via headers, not in the JSON body.

### Identificador

- Main v2 identifier:
  - `BI_SOLICITACOES_PROJETOSESPAIDER_v2`

### Request Body

The PDF specifies filters as a JSON structure grouped by block. Confirmed filter block in the specification:

```json
[
  {
    "Identificador": "DATAS",
    "Filtro": {
      "DATAMOVIMENTACAO_DE": "dd/MM/yyyy HH:mm:ss",
      "DATAMOVIMENTACAO_ATE": "dd/MM/yyyy HH:mm:ss"
    }
  }
]
```

### Top-Level Response Shape

The sample response confirms the following structure:

```json
{
  "ListaRegistros": [],
  "ListaFilhos": [],
  "URLPaginacao": "string|null",
  "MensagemRetorno": {
    "Mensagem": "string"
  },
  "Situacao": "S|E"
}
```

Important: v2 uses `ListaFilhos`, not `ListaURLFilhos`.

---

## Confirmed Delta: V1 vs V2

### 1. Transport and service changed

- Current flow uses `WCFExportaDados/ExportaDados`
- V2 uses `WCFConsultaDados/ConsultarRegistros`

This is not a small parameter change. It is a different service contract and must be treated as a separate integration client.

### 2. Authentication placement changed

- V1 client sends token in the request body
- V2 specification requires token and identifier in headers

The current client helper cannot be reused as-is.

### 3. Parent record shape changed

- V1 returns `ListaRegistros[]` with `ListaCampos[]`
- V2 returns flattened JSON objects with direct fields like `NOME`, `CODIGO`, `STATUSPROJETO`

This removes the current `CampoEspaider -> mapper` assumption from the core path.

### 4. Child dataset delivery changed

- V1 orchestration expects `ListaURLFilhos` and then fetches children separately
- V2 returns `ListaFilhos[]` inline, each child with:
  - `Identificador`
  - `ListaRegistros`
  - optional `URLPaginacao`

This means the orchestration model must change from "discover child URLs then fetch" to "process embedded child datasets, then continue pagination when present".

### 5. Return metadata changed

- `MensagemRetorno` is now an object in the sample, not a plain string
- Child identifiers and child payloads are embedded in the same response

Strict validation must reflect the actual payload shape, not the current v1 schemas.

### 6. Incremental sync becomes first-class

The v2 specification explicitly documents date filters using `DATAMOVIMENTACAO_DE` and `DATAMOVIMENTACAO_ATE`.

This is the natural basis for incremental sync and should replace the current full-sync-first posture wherever safe.

---

## Observed Main Dataset Fields

The sample response contains 207 parent records and 31 unique top-level fields in `ListaRegistros`.

Confirmed parent fields:

- `IDEspaider`
- `TIPOCHAMADO`
- `TIPOASSUNTO`
- `STATUSPROJETO`
- `SOLUCAOAPLICADAEM`
- `SOLICITANTE`
- `SITUACAOATUAL`
- `RESPONSAVELPROJETO`
- `PRIORIDADE`
- `PRAZOFINAL`
- `PRAZOCRONOGRAMAATUAL`
- `PRAZOAPROVADOR`
- `PASTACONSULTIVO`
- `OBJETIVO`
- `NOME`
- `MOTIVO_IMPORTANCIAESPECIAL`
- `MENSAGEM_MOVIMENTACAO`
- `JUSTIFICATIVA`
- `IMPORTANCIAESPECIAL`
- `IMPACTOOPERACIONAL`
- `IMPACTOESTRATEGICO`
- `ESCOPO`
- `ENCERRADOEM`
- `DATAMOVIMENTACAO`
- `DATAINICIOAPROVACAO`
- `CRONOGRAMAATUAL`
- `COMPLEXIDADETECNICA`
- `CODIGO`
- `CHAMADO_EXTERNO`
- `ASSUNTOAREA`
- `APROVADORATUAL`

### Nested object confirmed

`PASTACONSULTIVO` is no longer a plain text field in the sample. It is an object:

```json
{
  "ID": 20232,
  "NumeroCaso": "CS.36482"
}
```

This is a meaningful breaking change relative to the current mapping, which stores a text-like value.

---

## Observed Child Datasets in Sample

The sample contains 8 child datasets in `ListaFilhos`:

1. `BI_SOLICITACOES_PROJETOSESPAIDER_TEMPOSPERMANCENCIA`
2. `BI_SOLICITACOES_PROJETOSESPAIDER_REQUISITOS`
3. `BI_SOLICITACOES_PROJETOSESPAIDER_ORCAMENTOS`
4. `BI_SOLICITACOES_PROJETOSESPAIDER_HORASLANCADAS`
5. `BI_SOLICITACOES_PROJETOSESPAIDER_HISTORICOS`
6. `BI_SOLICITACOES_PROJETOSESPAIDER_ENTREGAS`
7. `BI_SOLICITACOES_PROJETOSESPAIDER_CRONOGRAMAS`
8. `BI_SOLICITACOES_PROJETOSESPAIDER_APROVADORES`

Important observations:

- Child dataset pagination exists for at least:
  - `TEMPOSPERMANCENCIA`
  - `HISTORICOS`
  - `APROVADORES`
- Parent pagination also exists.
- The child identifier `TEMPOSPERMANCENCIA` appears with a vendor typo. The implementation must not "correct" vendor values when matching identifiers.

### Child Dataset Key Samples

`TEMPOSPERMANCENCIA`
- `IDREGISTROPAI`
- `TOTALMINUTOSDEC`
- `TOTALHORASDEC`
- `TOTALDIASDEC`
- `TIPO`
- `SOLICITACAO_CODIGO`
- `SITUACAO`
- `SETOR`
- `RESPONSAVEL`
- `DATAINICIO`
- `DATAFIM`
- `APROVADOR`

`REQUISITOS`
- `STATUSREQUISITO`
- `REQUISITO`
- `PRIORIDADE`
- `ORIGEMREQUISITO`
- `IMPACTO`
- `IDENTIFICADOR_ENTREGA`
- `ENTREGA`
- `DETALHAMENTOREQUISITO`
- `DATACONCLUSAO`

`HORASLANCADAS`
- `UPDATEDONINTERFACE`
- `UPDATEDON`
- `SOLICITACAO_IDENTIFICADOR`
- `SETOR`
- `PASTACONSULTIVO_ID`
- `PASTACONSULTIVO`
- `OBSERVACOES`
- `NUMERO`
- `LOCALIZACAOCOLABORADOR`
- `HORASORIGINAISHOR`
- `DATA`
- `CREATEDON`
- `COMPLEXIDADE`
- `COLABORADOR`
- `ATIVIDADE`

---

## Implications for the Current Codebase

### Current assumptions that are invalid for v2

The current implementation in [espaider-sync.ts](C:/Users/Gabriel%20Cristofolini/Documents/SOLUCOESSISTEMAS/tech-arauz/src/lib/sync/espaider-sync.ts) assumes:

- request body contains token
- main endpoint is `ExportaDados`
- records come as `ListaCampos`
- children come as `ListaURLFilhos`
- child sync is driven by `buscarFilhos(url)`

All of these assumptions are broken by v2.

### Current assets that remain useful

These parts are still reusable with adaptation:

- token storage and encryption patterns
- retry, timeout, and circuit-breaker conventions
- log visibility model in frontend using `integration_log_entries`
- tenant-aware persistence pattern
- idempotent upsert strategy using `(tenant_id, espaider_id)`
- current target tables for parent and child project data

### Current assets that should be treated as legacy

- v1 HTTP request builder
- v1 response schemas
- `ListaCampos` mappers as the main mapping entrypoint
- `ListaURLFilhos` orchestration path

---

## Recommended Target Design

### Integration boundary

Create a dedicated v2 integration boundary instead of mutating the v1 client in place.

Recommended separation:

- `src/integrations/espaider-v2/config.ts`
- `src/integrations/espaider-v2/client.ts`
- `src/integrations/espaider-v2/schemas.ts`
- `src/integrations/espaider-v2/mappers/*`
- `src/lib/sync/espaider-v2-sync.ts`

The v1 flow can remain temporarily callable behind a feature flag during controlled migration, but v2 should have its own contract and orchestration.

### Sync mode

Preferred sync strategy:

1. Determine sync window from integration state
2. Execute parent `POST` with `DATAMOVIMENTACAO_DE` / `DATAMOVIMENTACAO_ATE`
3. Drain parent pagination with `GET`
4. Process embedded child datasets
5. Drain child pagination where present
6. Validate, transform, quarantine invalid records, and upsert valid records
7. Emit structured logs for start, page fetches, dataset processing, quarantine counts, persistence success, and final summary

### Quarantine

Invalid items should not break the whole batch. They should be isolated with:

- tenant_id
- request_id / correlation_id
- dataset
- raw payload
- validation error reason
- stage of failure

This may require a dedicated quarantine table if the project does not already have one.

---

## Risks Already Identified

### High-risk

- Assuming v2 can be implemented by patching the current v1 mappers
- Reusing strict v1 schemas against the flattened v2 payload
- Ignoring child pagination inside `ListaFilhos`
- Treating `PASTACONSULTIVO` as always scalar

### Medium-risk

- Inconsistent handling of date formats between top-level and child records
- Child identifiers drifting from vendor documentation
- Partial migrations leaving frontend logs only on the legacy path

### Operational-risk

- Cutting over to v2 without rollback switch
- Switching to incremental sync without defining the first watermark policy

---

## Inputs Still Required for Implementation

These were not invented and must be confirmed during implementation or planning:

1. Exact credential source names for v2 inside the project runtime
2. Whether v2 fully replaces every current v1 dataset path or whether any v1-only dataset must remain temporarily active
3. Desired persistence model for quarantine:
   - dedicated table
   - dedicated log category only
   - both
4. Watermark policy for incremental sync:
   - `last_successful_sync_at`
   - inclusive overlap window
   - replay strategy after failure

---

## Implementation Rule

The implementation must treat v2 as a new contract, not as a cosmetic variation of v1.

That is the main architectural conclusion from the artifacts inspected on 2026-05-11.
