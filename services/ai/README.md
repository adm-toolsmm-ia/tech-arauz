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
# Editar .env com suas credenciais
```

## Executar

```bash
# Desenvolvimento
uvicorn app.main:app --reload --port 8000

# Produção
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Estrutura

```
services/ai/
├── app/
│   ├── __init__.py
│   ├── main.py           # FastAPI entrypoint
│   ├── config.py         # Settings
│   ├── agents/           # LangGraph agents
│   │   ├── __init__.py
│   │   └── base.py
│   ├── graphs/           # Workflow graphs
│   │   ├── __init__.py
│   │   └── orchestrator.py
│   └── api/              # Endpoints
│       ├── __init__.py
│       └── routes.py
├── tests/
│   └── __init__.py
├── pyproject.toml
├── .env.example
└── README.md
```

## API

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/health` | GET | Health check |
| `/agents` | GET | Listar agentes |
| `/agents/{id}/run` | POST | Executar agente |
| `/traces` | GET | Listar traces (via LangSmith) |

## Referências

- [ADR-001: Stack Técnica](/.context/03-specs/adr/2026-02-ADR-001-stack-tecnica.md)
- [LangGraph Docs](https://langchain-ai.github.io/langgraph/)
- [LangSmith Docs](https://docs.smith.langchain.com/)
