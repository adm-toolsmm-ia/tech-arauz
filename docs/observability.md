# Observability — Tech Arauz AI Service

This document covers how to enable, configure, and use the observability
layer for the AI service (`services/ai/`).

## Table of contents

1. [Quick start](#quick-start)
2. [Feature flags (env vars)](#feature-flags)
3. [Tracing with LangSmith](#tracing-with-langsmith)
4. [Cost tracking](#cost-tracking)
5. [Budget limits](#budget-limits)
6. [Structured logging](#structured-logging)
7. [PII redaction](#pii-redaction)
8. [Wrappers reference](#wrappers-reference)
9. [Troubleshooting](#troubleshooting)
10. [Team SOP](#team-sop)

---

## Quick start

```bash
# 1. Copy and fill env vars
cp services/ai/.env.example services/ai/.env
# Edit .env: set LANGSMITH_API_KEY, OPENAI_API_KEY

# 2. Install dependencies
cd services/ai
pip install -e ".[dev]"

# 3. Run the smoke-test demo (from services/ai/ directory)
py ../../scripts/demo_observability.py          # Windows
python ../../scripts/demo_observability.py      # Linux/Mac
# -> prints run_id, cost, trace link, log file path

# 4. Start the service
uvicorn app.main:app --reload
```

Observability is **enabled by default**.  To disable, set `OBS_ENABLED=false`.

---

## Feature flags

All flags live in `services/ai/.env` and are read at startup.

| Variable | Default | Description |
|---|---|---|
| `OBS_ENABLED` | `true` | Master switch — disables all spans, logs, budget |
| `OBS_BACKEND` | `langsmith` | `langsmith` or `local` (local = in-memory spans + file logs only) |
| `OBS_PII_REDACT` | `true` | Mask emails, phones, CPFs, API keys in logs/spans |
| `OBS_LOG_LEVEL` | `INFO` | Python log level for `obs.*` loggers |
| `OBS_BUDGET_SESSION_USD` | `0.50` | Max spend per session (0 = unlimited) |
| `OBS_BUDGET_USER_USD` | `5.00` | Max spend per user |
| `OBS_BUDGET_AGENT_USD` | `2.00` | Max spend per agent |

### LangSmith-specific vars

| Variable | Default | Description |
|---|---|---|
| `LANGSMITH_API_KEY` | (required) | Your LangSmith API key |
| `LANGCHAIN_TRACING_V2` | `true` | Enable LangSmith tracing |
| `LANGCHAIN_PROJECT` | `tech-arauz` | LangSmith project name |

> **Nota sobre `LANGSMITH_API_KEY` vs `LANGCHAIN_API_KEY`**
>
> O SDK do LangSmith le internamente a variavel `LANGCHAIN_API_KEY`.
> O nosso projeto usa `LANGSMITH_API_KEY` por clareza.
> O `init_tracer()` faz o mapeamento automatico — se voce definir
> `LANGSMITH_API_KEY` no `.env`, o sistema copia o valor para
> `LANGCHAIN_API_KEY` em runtime. Voce pode usar qualquer uma das duas.
> **Nunca coloque a key no codigo ou no chat.**

---

## Tracing with LangSmith

### How it works

Every API request that triggers an agent run creates a **RunContext** with:
- `run_id` — unique ID for this execution
- `trace_id` — correlates all spans within the run
- `session_id`, `user_id`, `agent_id` — scoping metadata

Each step (LLM call, tool call, retrieval) creates a **span** that is:
1. Stored in an in-memory buffer (always, for local inspection)
2. Exported to LangSmith as a Run (when `OBS_BACKEND=langsmith`)

### Viewing traces

1. Go to [smith.langchain.com](https://smith.langchain.com)
2. Select project **tech-arauz** (or your `LANGCHAIN_PROJECT` value)
3. Filter by `trace_id` or browse the Runs list
4. The `trace_url` field in API responses links directly to the trace

### Correlation IDs

All log lines and spans include `run_id` and `trace_id`.  Use these to
cross-reference between:
- JSON log file (`logs/ai-service.log`)
- LangSmith dashboard
- API response body

---

## Cost tracking

### Pricing table

The module `app/instrumentation/costs.py` contains a built-in pricing
table for common models (GPT-4o, GPT-4o-mini, GPT-3.5-turbo, Claude 3.5,
etc.) in **USD per 1,000 tokens** (input/output).

### How cost is computed

1. **From API usage** (preferred): when the LLM response includes a
   `usage` object (`prompt_tokens`, `completion_tokens`), cost is computed
   directly from the pricing table.  Field: `usage.estimated = false`.

2. **From text estimation** (fallback): when usage data is missing, tokens
   are counted locally via `tiktoken` and cost is estimated.
   Field: `usage.estimated = true`.

3. **Unknown model**: if the model is not in the pricing table, **gpt-4o
   pricing** is used as a conservative fallback (you'll see a warning log).

### Log fields

Every `llm.call.complete` log event includes:
```json
{
  "model": "gpt-4o",
  "prompt_tokens": 320,
  "completion_tokens": 150,
  "total_tokens": 470,
  "cost_usd": 0.00230,
  "usage_estimated": false
}
```

### API endpoint

`GET /api/budget?session_id=s1&user_id=u1` returns current spend and
remaining budget per scope.

---

## Budget limits

### Configuration

Set limits via environment variables (USD).  A value of `0` means
**unlimited**.

```bash
OBS_BUDGET_SESSION_USD=0.50   # per conversation
OBS_BUDGET_USER_USD=5.00      # per authenticated user
OBS_BUDGET_AGENT_USD=2.00     # per agent ID
```

### Enforcement

- After each LLM call, the wrapper calls `budget.charge()`.
- If the accumulated cost exceeds the limit, `BudgetExceededError` is raised.
- The API returns **HTTP 429** with a JSON body:

```json
{
  "error": "budget_exceeded",
  "scope": "session",
  "spent_usd": 0.52,
  "limit_usd": 0.50,
  "message": "Budget exceeded for session=abc123: spent $0.520000 / limit $0.50"
}
```

### Pre-flight check

Before expensive operations you can also call:
```python
bm = get_budget_manager()
bm.assert_remaining(session_id="abc", user_id="u1")
```

---

## Structured logging

### Format

All logs are emitted as **single-line JSON** to:
- `stderr` (console) — always
- `logs/ai-service.log` — rotating file (10 MB, 5 backups)

### Standard fields

```json
{
  "timestamp": "2026-02-08T12:00:00.000000+00:00",
  "level": "INFO",
  "logger": "obs.events",
  "message": "llm.call.complete",
  "action": "llm.call.complete",
  "run_id": "a1b2c3d4",
  "trace_id": "e5f6g7h8",
  "session_id": "session-123",
  "agent_id": "agent-1",
  "model": "gpt-4o",
  "latency_ms": 320,
  "tokens": 470,
  "cost_usd": 0.0023,
  "status": "ok"
}
```

### Log level

Controlled by `OBS_LOG_LEVEL`.  Recommended:
- **Production**: `INFO` (events only)
- **Development**: `DEBUG` (includes input/output previews)

---

## PII redaction

When `OBS_PII_REDACT=true` (default), the following patterns are masked
in logs and span attributes:

| Pattern | Replacement |
|---|---|
| E-mail addresses | `[REDACTED_EMAIL]` |
| Brazilian phones (+55...) | `[REDACTED_PHONE]` |
| CPF (xxx.xxx.xxx-xx) | `[REDACTED_CPF]` |
| API keys (sk-..., key-..., Bearer, JWT) | `[REDACTED_KEY]` |

Dictionary keys named `password`, `secret`, `token`, `api_key`,
`authorization`, `cookie`, `credential` are fully replaced with
`[REDACTED]`.

### What is NOT logged

- Full prompts and completions (only first 200 chars, truncated)
- Request/response payloads (only previews with `output.truncated=true`)

---

## Wrappers reference

### `wrap_llm_call`

```python
from app.instrumentation import wrap_llm_call

response = await wrap_llm_call(
    client.chat.completions.create,
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello"}],
    # pass-through kwargs to the LLM client:
    temperature=0.7,
)
```

### `@wrap_tool_call`

```python
from app.instrumentation import wrap_tool_call

@wrap_tool_call("search_documents")
async def search_documents(query: str) -> list[dict]:
    ...
```

### `@wrap_retrieval`

```python
from app.instrumentation import wrap_retrieval

@wrap_retrieval("vector_search")
async def vector_search(query: str, k: int = 5) -> list[dict]:
    ...
```

---

## Troubleshooting

### No spans appearing in LangSmith

1. Check `OBS_ENABLED=true` and `OBS_BACKEND=langsmith`.
2. Verify `LANGSMITH_API_KEY` is set and valid.
3. Verify `LANGCHAIN_TRACING_V2=true`.
4. Check `logs/ai-service.log` for errors from `obs.tracing`.

### Tokens showing as 0 / cost is $0.00

- The LLM response may not include a `usage` object.
- Check log for `usage_estimated=true` — if present, tiktoken estimated.
- If tiktoken is not installed, the heuristic `len(text) / 4` is used.
- Ensure `tiktoken` is installed: `pip install tiktoken`.

### Budget exceeded unexpectedly

- Check current spend: `GET /api/budget?session_id=xxx`.
- Reset in-memory budgets by restarting the service.
- Increase limits via env vars (`OBS_BUDGET_SESSION_USD=1.00`).

### Log file not created

- The `logs/` directory is created automatically.
- Ensure the service has write permission to its working directory.

### PII still appearing in logs

- Verify `OBS_PII_REDACT=true`.
- Custom patterns can be added to `app/instrumentation/redaction.py`.
- Note: redaction uses regex — unusual formats may slip through.

---

## Team SOP

Standard Operating Procedures para a equipe de desenvolvimento.

### Onboarding de novo desenvolvedor

1. **Obter acesso ao LangSmith**:
   - Pedir convite no workspace da equipe em [smith.langchain.com](https://smith.langchain.com)
   - Criar API key pessoal: Settings -> API Keys -> Create API Key
   - Guardar a key **apenas** no arquivo `services/ai/.env` (nunca no codigo/chat/Slack)

2. **Configurar ambiente local**:
   ```bash
   cd services/ai
   cp .env.example .env
   # Editar .env com sua LANGSMITH_API_KEY pessoal
   pip install -e ".[dev]"
   ```

3. **Validar que tracing funciona**:
   ```bash
   py ../../scripts/demo_observability.py    # Windows
   python ../../scripts/demo_observability.py  # Linux/Mac
   ```
   Verificar que o output mostra `trace_url` apontando para LangSmith.

4. **Leitura obrigatoria**:
   - Este documento (`docs/observability.md`)
   - `.context/00-MASTER.md` (ponto de entrada do projeto)
   - `.context/IMPLEMENTATIONS.md` (estado atual)

### Rotacao de API Keys

Rotacionar keys a cada **90 dias** ou imediatamente se houver suspeita de vazamento.

1. Acessar [smith.langchain.com](https://smith.langchain.com) -> Settings -> API Keys
2. Criar nova key (nao revogar a antiga ainda)
3. Atualizar `services/ai/.env` localmente com a nova key
4. Rodar `py scripts/demo_observability.py` para validar que a nova key funciona
5. Revogar a key antiga no LangSmith
6. Comunicar a equipe (se for key compartilhada)

**NUNCA**:
- Commitar keys no repositorio (`.env` esta no `.gitignore`)
- Compartilhar keys via chat, email ou Slack
- Usar a mesma key em dev e producao

### Checklist de Pull Request

Antes de abrir PR que envolva o servico AI:

- [ ] `OBS_PII_REDACT=true` continua configurado (nao desabilitou por acidente)
- [ ] Nenhum arquivo `.env` incluido no commit (`git status` limpo)
- [ ] Nenhuma key/secret hardcoded no codigo (buscar por `lsv2_sk_`, `eyJ`, `sk-`)
- [ ] Se adicionou nova chamada LLM, usou `wrap_llm_call` (nao chamada direta)
- [ ] Se adicionou nova tool, usou `wrap_tool_call`
- [ ] Rodou smoke test localmente: `py scripts/demo_observability.py`
- [ ] Atualizou `IMPLEMENTATIONS.md` se mudou algo significativo

### Guardas de seguranca

Para evitar vazamento acidental de secrets, considere adicionar ao CI:

```bash
# Exemplo: buscar padroes de secret no repositorio
# Adicionar ao pipeline de CI como step de validacao
rg -i "lsv2_sk_|eyJhbGciOi|sk-[a-zA-Z0-9]{20,}" --glob "!.env*" --glob "!*.plan.md" .
# Se encontrar resultado, o CI deve falhar
```

### Onde guardar secrets por ambiente

| Ambiente | Onde guardar | Exemplo |
|----------|-------------|---------|
| Local (dev) | `services/ai/.env` | `LANGSMITH_API_KEY=lsv2_sk_...` |
| CI/CD | Secrets do GitHub Actions / pipeline | `${{ secrets.LANGSMITH_API_KEY }}` |
| Staging | Secret manager (Vault, AWS SSM, etc.) | Referencia via env var |
| Producao | Secret manager (nunca hardcode) | Referencia via env var |
