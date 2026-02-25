# 🚀 Guia de Desenvolvimento Local — Tech Arauz

## **Pré-requisitos**

- Node.js 20+
- Python 3.11+
- UV (gerenciador de Python)
- Supabase CLI
- Docker (opcional, recomendado)

---

## **1️⃣ Iniciar Supabase Local (Opcional)**

Se você quer testar com Supabase local:

```bash
# No Windows/PowerShell, com WSL 2:
wsl bash -c 'cd /mnt/c/path/to/tech-arauz && supabase start'
```

Salve as credenciais exibidas no `.env.local`.

---

## **2️⃣ Configurar Variáveis de Ambiente**

Crie `.env` na raiz do projeto (já existe, verifique):

```bash
# Backend (Python)
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=seu-service-role-key
SUPABASE_JWT_SECRET=seu-jwt-secret

# Frontend (Next.js)
NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=seu-anon-key
AI_SERVICE_URL=http://localhost:8000
```

---

## **3️⃣ Iniciar Python Service (FastAPI)**

### **Opção A: Via UV (Recomendado)**

```bash
# Terminal 1 - Backend
cd services/ai
uv sync
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Acesse Swagger: http://localhost:8000/docs

### **Opção B: Via pip + venv**

```bash
cd services/ai
python -m venv venv
source venv/bin/activate  # ou: venv\Scripts\activate (Windows)
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## **4️⃣ Iniciar Frontend (Next.js)**

### **Terminal 2 - Frontend**

```bash
npm run dev
```

Acesse: http://localhost:3000

---

## **5️⃣ Validar Migração Supabase**

Antes de usar o frontend, aplique as migrations:

```bash
npx supabase db push --linked
```

Verifique se as tabelas `agents` e `agent_versions` foram criadas no Supabase.

---

## **6️⃣ Testar Criação de Agente**

1. Acesse http://localhost:3000/agentes
2. Clique "Novo Agente"
3. Preencha Nome + Slug
4. Clique "Criar Agente"

**Se receber erro 503:**

- ✅ Verifique se Python service está rodando (http://localhost:8000/docs)
- ✅ Verifique se Supabase está acessível
- ✅ Verifique logs do terminal Python

---

## **🔧 Troubleshooting**

### **503 Service Unavailable**

```bash
# Verifique Python service
curl http://localhost:8000/api/agents/v2

# Esperado: 401 (falta JWT) ou 200 (lista vazia)
# Se: connection refused → Python não está rodando
```

### **JWT validation failed**

```bash
# Verifique SUPABASE_JWT_SECRET no .env
# Deve ser igual ao JWT secret do Supabase
```

### **Supabase connection error**

```bash
# Verifique credenciais no .env
# Teste com Supabase CLI:
supabase status
```

---

## **📊 Comandos Úteis**

```bash
# Resetar DB local
supabase db reset

# Ver logs Python
# (Terminal Python mostra logs em tempo real)

# Limpar cache npm
npm cache clean --force

# Rebuild migrations
npm run db:apply
```

---

## **✅ Checklist de Setup**

- [ ] Python 3.11+ instalado
- [ ] UV instalado
- [ ] `.env` configurado com credenciais Supabase
- [ ] `supabase db push` executado
- [ ] Python service rodando em :8000
- [ ] Next.js rodando em :3000
- [ ] Consegue listar agentes (vazio está ok)
- [ ] Consegue criar agente
- [ ] Consegue ver em Supabase (dashboard)

---

## **📝 Estrutura de Desenvolvimento**

```
tech-arauz/
├── services/ai/           # Backend Python/FastAPI
│   ├── app/
│   │   ├── main.py       # FastAPI app
│   │   ├── api/
│   │   │   └── routes.py # Agent endpoints
│   │   └── agents/
│   │       ├── models.py # Pydantic models
│   │       └── service.py # Business logic
│   └── pyproject.toml
│
├── src/                    # Frontend Next.js
│   ├── app/
│   │   └── agentes/       # Agent pages
│   ├── components/
│   │   └── agents/        # Agent components
│   ├── services/
│   │   └── agents/        # API client
│   └── types/
│       └── agents.ts      # TypeScript types
│
├── supabase/
│   └── migrations/        # SQL migrations
│   └── 028_create_agents_schema.sql
│
└── .env                   # Credenciais (não commitar!)
```

---

**Pronto! Você está setup para desenvolvimento local. 🚀**
