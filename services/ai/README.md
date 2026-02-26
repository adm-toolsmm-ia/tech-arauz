# Serviço AI - Tech Arauz

Serviço de AI para gestão de agentes com LangGraph, LangChain e LangSmith.

## Setup

```bash
# Criar ambiente virtual
cd services/ai
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate   # Windows

# Instalar dependências
pip install -e ".[dev]"

# Copiar .env
cp .env.example .env
# Editar .env com suas credenciais (LANGSMITH_API_KEY, OPENAI_API_KEY)
```

## Executar

```bash
# Desenvolvimento
uvicorn app.main:app --reload --port 8000

# Produção
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Smoke test de observabilidade (da raiz do repo)
py scripts/demo_observability.py        # Windows
python scripts/demo_observability.py    # Linux/Mac
```

## Estrutura

```
services/ai/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI entrypoint
│   ├── config.py            # Settings (env vars)
│   ├── agents/              # LangGraph agents
│   │   ├── __init__.py
│   │   └── base.py
│   ├── graphs/              # Workflow graphs
│   │   ├── __init__.py
│   │   └── orchestrator.py
│   ├── api/                 # Endpoints
│   │   ├── __init__.py
│   │   └── routes.py
│   └── instrumentation/     # Observabilidade (tracing, custos, budgets, logs)
│       ├── __init__.py      # API publica: init_observability(), wrappers
│       ├── tracing.py       # RunContext, spans, LangSmith exporter
│       ├── costs.py         # Tabela de precos por modelo, estimate_cost()
│       ├── budget.py        # BudgetManager por session/user/agent
│       ├── wrappers.py      # wrap_llm_call, wrap_tool_call, wrap_retrieval
│       ├── redaction.py     # PII masking (emails, CPFs, keys)
│       └── logging.py       # JSON structured logger (console + file)
├── tests/
│   └── __init__.py
├── logs/                    # JSON log files (auto-created, gitignored)
├── pyproject.toml
├── .env.example
└── README.md
```

## API

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/health` | GET | Health check (inclui status de observabilidade) |
| `/api/agents` | GET | Listar agentes |
| `/api/agents/{id}` | GET | Detalhes de um agente |
| `/api/agents/{id}/run` | POST | Executar agente (retorna run_id, cost_usd, trace_url) |
| `/api/traces` | GET | Listar traces (via LangSmith) |
| `/api/budget` | GET | Consultar gastos e limites por session/user/agent |

## Observabilidade

A camada de instrumentação fornece:

- **Tracing**: cada execução gera `run_id` / `trace_id` correlacionados (LangSmith)
- **Custos**: estimativa por chamada LLM em USD (tabela de 20+ modelos)
- **Budgets**: limites configuráveis por sessão/usuário/agente (HTTP 429 ao exceder)
- **Logs JSON**: estruturados com campos essenciais (latency, tokens, cost, status)
- **PII Redaction**: emails, telefones, CPFs, API keys mascarados automaticamente

Para configuração completa, variáveis de ambiente e troubleshooting, ver documentação do projeto e AIOS.

## Referências

- [LangGraph Docs](https://langchain-ai.github.io/langgraph/)
- [LangSmith Docs](https://docs.smith.langchain.com/)
