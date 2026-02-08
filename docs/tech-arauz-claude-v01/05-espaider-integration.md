---
doc-id: CLAUDE-V01-05
title: Integração ERP Espaider
scope: Contrato WCF, mapeamento de campos, pipeline de sincronização
version: 0.1.0
status: draft
last-updated: 2026-02-05
confidence: Alta
depends-on: [04-database-schema, 09-routines-catalog, 13-jobs-scheduling]
---

# Integração ERP Espaider

> Fonte principal: `[ref: supabase/functions/sync-espaider/index.ts:1-1365]`
> A integração é **unidirecional**: Espaider → Portal Tech Arauz (somente leitura).

Relacionado: [[04-database-schema]] (tabelas de destino), [[09-routines-catalog]] (rotinas R-001 a R-007), [[13-jobs-scheduling]] (agendamento), [[02-glossary]] (termos Espaider)

---

## Resumo

O Portal importa dados de projetos do ERP Espaider via API WCF/REST. A Edge Function `sync-espaider` é responsável por:
1. Buscar registros (projetos) e sub-registros (entregas, cronogramas, requisitos)
2. Normalizar campos com 135+ aliases
3. Converter datas BR → ISO
4. Detectar tipo de registro filho (por URL e campos)
5. Fazer UPSERT no Supabase com deduplicação por `id_espaider`
6. Vincular filhos aos pais via mapa `id_espaider → projeto_id`

---

## INT-001: Endpoint Principal — Projetos

- **Método**: POST
- **URL**: `{url_base}` (configurável em [[04-database-schema]] tabela `apis`)
- **Auth**: QueryParam (`?Token={token}`) ou Bearer (`Authorization: Bearer {token}`)
- **Body** (opcional): JSON com filtros
- **Response**:

```json
{
  "Situacao": "S",
  "MensagemRetorno": "Sucesso",
  "ListaRegistros": [
    {
      "IDEspaider": 12345,
      "Identificador": "PRJ-2026-001",
      "ListaCampos": [
        { "Identificador": "NOME", "Valor": "Projeto Portal Tech" },
        { "Identificador": "SITUACAOATUAL", "Valor": "Em desenvolvimento" },
        { "Identificador": "PRIORIDADE", "Valor": "Alta" },
        { "Identificador": "PRAZOFINAL", "Valor": "31/12/2026 23:59:59" }
      ]
    }
  ],
  "URLPaginacao": "https://api.espaider.com/next?page=2",
  "ListaURLFilhos": [
    { "URL": "https://api.espaider.com/consultafilhos/entregas/12345", "Descricao": "Entregas" }
  ]
}
```

**Confiança**: Alta [ref: sync-espaider/index.ts:200-280]

## INT-002: Endpoint Filhos — Entregas

- **Método**: GET
- **URL**: URLs de `ListaURLFilhos` contendo "entrega" no path
- **Detecção**: URL contém "entrega" OU campos incluem DATAPREVISTA
- **Campos mapeados para `entregas_projeto`**:

| Campo Espaider | Campo Sistema | Transformação |
|---|---|---|
| IDEspaider | id_espaider | integer |
| NOME / TITULO | titulo | — |
| DESCRICAO | descricao | — |
| STATUS / SITUACAO | status | — |
| DATAPREVISTA | data_prevista | date BR→ISO |
| DATACONCLUSAO | data_conclusao | date BR→ISO |
| IDREGISTROPAI | (link ao projeto) | via mapa id_espaider→projeto_id |

## INT-003: Endpoint Filhos — Cronogramas

- **Detecção**: URL contém "cronograma" OU campos incluem DATAINICIO
- **Campos mapeados para `cronogramas_projeto`**:

| Campo Espaider | Campo Sistema | Transformação |
|---|---|---|
| IDEspaider | id_espaider | integer |
| NOME / TITULO | titulo | — |
| DATAINICIO | data_inicio | date BR→ISO |
| DATAFIM | data_fim | date BR→ISO |
| STATUS | status | — |
| PROGRESSO / PERCENTUAL | progresso | integer (%) |
| RESPONSAVEL | responsavel | — |
| IDREGISTROPAI | (link ao projeto) | via mapa |

## INT-004: Endpoint Filhos — Requisitos

- **Detecção**: URL contém "requisito" OU campos incluem TIPOREQUISITO
- **Campos mapeados para `requisitos_projeto`**:

| Campo Espaider | Campo Sistema | Transformação |
|---|---|---|
| IDEspaider | id_espaider | integer |
| NOME / TITULO | titulo | — |
| DESCRICAO | descricao | — |
| TIPOREQUISITO / TIPO | tipo | — |
| PRIORIDADE | prioridade | — |
| STATUS | status | — |
| IDREGISTROPAI | (link ao projeto) | via mapa |

## INT-005: Paginação

- **Mecanismo**: Campo `URLPaginacao` na resposta indica próxima página
- **Loop**: Continua buscando enquanto `URLPaginacao` não for vazio/null
- **Timeout**: 60 segundos por request

[ref: sync-espaider/index.ts:280-340]

---

## Sistema de Aliases (135+)

O Espaider retorna campos com nomes variantes. O sync-espaider normaliza usando um mapa de aliases:

| Aliases | Campo canônico |
|---|---|
| NOMEPROJETO, NOMEREGISTRO, NOMECHAMADO | → NOME |
| CODIGOPROJETO, CODIGOCHAMADO | → CODIGO |
| RESPONSAVEL, RESPONSAVELPROJETO, NOMERESPONSAVEL | → RESPONSAVELPROJETO |
| PRAZO, PRAZOFINAL, PRAZOFINALPROJETO | → PRAZOFINAL |
| IDPAI, IDPROJETO, PROJETO_ID, ID_PAI | → IDREGISTROPAI |
| DATAINICIOAPROVACAO, DATAAPROVACAO | → DATAINICIOAPROVACAO |
| SITUACAO, STATUSPROJETO, SITUACAOPROJETO | → SITUACAOATUAL |
| PRIORIDADEPROJETO, NIVELPRIORIDADE | → PRIORIDADE |

[ref: sync-espaider/index.ts:50-180] **Confiança**: Alta

---

## Mapeamento Projeto → Tabela `projetos`

| Campo normalizado | Coluna projetos | Transformação |
|---|---|---|
| IDEspaider | id_espaider | parseInt |
| CODIGO | codigo_espaider | — |
| NOME | titulo | — |
| DESCRICAO | descricao | — |
| SITUACAOATUAL | status_projeto, situacao_atual | + lookup status_id |
| PRIORIDADE | prioridade | — |
| TIPOCHAMADO | tipo_chamado | — |
| TIPOASSUNTO | tipo_assunto | — |
| RESPONSAVELPROJETO | responsavel_nome | — |
| PASTACONSULTIVO | pasta_consultivo | — |
| TRM | trm_espaider | — |
| PRAZOFINAL | prazo_final | date BR→ISO |
| PRAZOAPROVADOR | prazo_aprovador | date BR→ISO |
| PRAZOCRONOGRAMAATUAL | prazo_cronograma_atual | date BR→ISO |
| DATAINICIOAPROVACAO | data_inicio_aprovacao | date BR→ISO |
| DATAMOVIMENTACAO | data_movimentacao | date BR→ISO |
| DATAENCERRAMENTO | encerrado_em | date BR→ISO |
| DATASOLUCAO | solucao_aplicada_em | date BR→ISO |

[ref: sync-espaider/index.ts:600-700]

---

## Pipeline de Sincronização (Fim a Fim)

Ver também: [[10-flows]] F-001, [[09-routines-catalog]] R-001

```
1. VALIDAÇÃO
   ├── Carrega config da API (apis table)
   ├── Valida: token, url_base, tipo_autenticacao obrigatórios
   └── Cria log de execução (status: "em_andamento")

2. FETCH PRINCIPAL
   ├── Monta headers/params de auth
   ├── POST para url_base com body de filtros
   ├── Loop de paginação via URLPaginacao
   └── Coleta ListaURLFilhos de cada página

3. FETCH FILHOS
   ├── Para cada URL em ListaURLFilhos:
   │   ├── GET na URL com mesma auth
   │   ├── Detecta tipo (entrega/cronograma/requisito)
   │   └── Extrai IDREGISTROPAI para linking
   └── Agrupa por tipo

4. NORMALIZAÇÃO
   ├── Aplica aliases (135+ → campos canônicos)
   ├── Converte datas BR (DD/MM/YYYY HH:MM:SS) → ISO 8601
   └── Extrai status únicos

5. STATUS NORMALIZATION
   ├── Coleta todos os status_projeto únicos
   ├── UPSERT em projetos_status (cria novos com cor/ordem default)
   └── Gera cache nome → id para lookup rápido

6. UPSERT PROJETOS
   ├── mapProjeto() para cada registro
   ├── Deduplicação por id_espaider (Map)
   ├── UPSERT em projetos (onConflict: id_espaider)
   └── Conta novos vs atualizados

7. LINK FILHOS
   ├── Busca projetos.id_espaider → projetos.id (batches de 200)
   ├── Para cada filho: resolve projeto_id via mapa
   ├── UPSERT em entregas_projeto / cronogramas_projeto / requisitos_projeto
   └── Loga órfãos (sem_pai, sem_projeto_pai)

8. FINALIZAÇÃO
   ├── Atualiza apis.ultima_sincronizacao
   ├── Atualiza log com métricas (processados, novos, atualizados, erros)
   └── Retorna resultado JSON
```

---

## Autenticação

| Tipo | Como funciona |
|---|---|
| **QueryParam** | Appenda `?Token={valor}` na URL |
| **Bearer** | Header `Authorization: Bearer {valor}` |
| **ApiKey** | Header `X-Api-Key: {valor}` |
| **Basic** | Header `Authorization: Basic {base64}` |
| **None** | Sem auth |

Configurável por API em [[04-database-schema]] tabela `apis.tipo_autenticacao`

---

## Date Parsing

Converte formatos brasileiros para ISO 8601:

| Input | Formato | Output |
|---|---|---|
| `31/12/2026 23:59:59` | DD/MM/YYYY HH:MM:SS | `2026-12-31T23:59:59.000Z` |
| `31/12/2026` | DD/MM/YYYY | `2026-12-31T00:00:00.000Z` |
| `2026-12-31T23:59:59` | ISO (passthrough) | `2026-12-31T23:59:59` |

Fallback: retorna `null` se não consegue parsear.

[ref: sync-espaider/index.ts:185-220]

---

## Retry e Resiliência

| Parâmetro | Valor |
|---|---|
| Máximo de tentativas | 3 |
| Backoff | Exponencial: 500ms, 1000ms, 1500ms |
| Timeout por request | 60 segundos |
| Retry em | HTTP >= 500, timeout, network error |
| Não faz retry em | HTTP 400-499 (erros do cliente) |
| Circuit breaker | Função `is_circuit_open()` — ver [[04-database-schema]] |

---

## Tratamento de Erros

| Etapa (stage) | Erro | Comportamento |
|---|---|---|
| `load_api_config` | API não encontrada | Aborta com erro 404 |
| `fetch_main` | Timeout/rede | Retry 3x, depois log de erro |
| `fetch_main` | Situacao != 'S' | Log de erro de negócio |
| `parse_fields` | Campo inválido | Ignora campo, continua |
| `upsert_projects` | Constraint violation | Log individual, continua outros |
| `link_children` | Pai não encontrado | Log como "órfão", ignora filho |

Todas as etapas são rastreadas via `stage` no log estruturado. URLs são sanitizadas (Token mascarado) nos logs.

[ref: sync-espaider/index.ts:900-1100]

---

## Decisões Pendentes

> [!question] Q-ESP-001: Rate limiting da API Espaider
> Não foram identificados limites de taxa (throttling) na API do Espaider. Necessário confirmar com a equipe de TI do Espaider se existe algum limite. Confiança: Baixa

> [!question] Q-ESP-002: Versionamento da API
> O contrato da API Espaider não possui versionamento explícito (v1, v2). Se a estrutura mudar (campos renomeados), o sistema de aliases pode não cobrir. Estratégia de fallback a definir.

> [!question] Q-ESP-003: Write-back para o Espaider
> Atualmente a integração é somente leitura. Eventual necessidade de enviar atualizações de volta ao Espaider (ex: marcar projeto como concluído) está fora do escopo do MVP. Ver [[17-prd-seed]]

> [!question] Q-ESP-004: Campos não mapeados
> Registros do Espaider podem conter campos em `ListaCampos` que não possuem alias nem mapeamento. Estes são silenciosamente ignorados. Considerar logar campos desconhecidos para auditoria futura.
