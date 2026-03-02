# Setup do Serviço AI (FastAPI)

Guia para configurar o serviço de agentes/chat em **desenvolvimento local** e **produção** (Vercel + Railway).

---

## Parte 1 — Desenvolvimento local

### 1.1 Pré-requisitos

- Python 3.11+ instalado (`py --version` ou `python --version`)
- Variáveis do projeto na raiz: `.env` com Supabase e OpenAI

### 1.2 Instalar o serviço AI

No terminal, **na raiz do projeto** (`tech-arauz`):

```powershell
cd services\ai
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e ".[dev]"
```

> **Nota:** Se `Activate.ps1` falhar por política de execução, rode antes:
> `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

### 1.3 Configurar variáveis de ambiente

Crie `services/ai/.env` (ou copie de `.env.example`):

```env
SUPABASE_URL=<mesmo do .env da raiz>
SUPABASE_SERVICE_ROLE_KEY=<mesmo do .env da raiz>
SUPABASE_JWT_SECRET=<mesmo do .env da raiz>
OPENAI_API_KEY=<mesmo do .env da raiz>
```

**Onde obter:** No `.env` na raiz do projeto (`tech-arauz/.env`).

### 1.4 Iniciar o serviço

Com o venv ativado:

```powershell
uvicorn app.main:app --reload --port 8000
```

### 1.5 Configurar o Next.js

No `.env` na **raiz** do projeto, adicione (ou confirme):

```env
AI_SERVICE_URL=http://localhost:8000
```

### 1.6 Testar

1. Acesse: http://localhost:8000/health — deve retornar `{"status":"healthy"}`
2. Suba o Next.js: `npm run dev`
3. Teste o chat/agentes no app

---

## Parte 2 — Produção (Vercel + Railway)

O frontend está na Vercel. O serviço AI precisa estar em outro host. Este guia usa **Railway**.

---

### Passo a passo — Railway (deploy do serviço AI)

#### 1. Acessar o Railway

- Abra [railway.app](https://railway.app)
- Clique em **Login** e entre com **GitHub** (ou Google/Discord)

#### 2. Criar novo projeto

- Clique em **New Project**
- Selecione **Deploy from GitHub repo**
- Se for a primeira vez, autorize o Railway a acessar seu GitHub
- Na lista, escolha o repositório do projeto (ex: `tech-arauz` ou `SOLUCOESSISTEMAS/tech-arauz`)
- Clique em **Deploy Now**

#### 3. Configurar o diretório raiz

O Railway começa na raiz do repositório. O serviço AI está em `services/ai`.

- Clique no **card do serviço** que foi criado (ex: "tech-arauz")
- Vá em **Settings** (engrenagem ou aba lateral)
- Em **Root Directory**, digite: `services/ai`
- Clique em **Save** ou aguarde salvar automaticamente

#### 4. Configurar Build e Start

- Em **Settings**, procure **Build Command**
  - Deixe vazio ou use: `pip install -e ".[dev]"`
- Em **Start Command**, use:
  ```bash
  uvicorn app.main:app --host 0.0.0.0 --port $PORT
  ```

#### 5. Adicionar variáveis de ambiente

- Clique em **Variables** (ou **Settings** → **Variables**)
- Clique em **+ New Variable** ou **Add Variable**
- Adicione uma por uma:

| Nome da variável | Valor | De onde copiar |
|------------------|-------|----------------|
| `SUPABASE_URL` | `https://pybmawlwpmxshtccpqui.supabase.co` | `services/ai/.env` ou Supabase Dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` (sua chave) | `services/ai/.env` ou Supabase → API |
| `SUPABASE_JWT_SECRET` | (sua chave JWT) | Supabase → Project Settings → API → JWT Secret |
| `OPENAI_API_KEY` | `sk-proj-...` (sua chave) | `services/ai/.env` |
| `CORS_ORIGINS` | `https://seu-dominio.vercel.app` | Domínio exato do seu app na Vercel |

> **Como achar o domínio:** No Vercel, vá em seu projeto → **Settings** → **Domains**. O domínio de produção aparece lá (ex: `arauz-tech.vercel.app` ou um domínio customizado).

#### 6. Gerar domínio público

- Em **Settings**, vá em **Networking** (ou **Deployments** → **Settings**)
- Clique em **Generate Domain** ou **Add Domain**
- O Railway gera uma URL (ex: `tech-arauz-production.up.railway.app`)
- **Copie e guarde essa URL** — será usada no Vercel

#### 7. Aguardar o deploy

- O Railway faz o build e o deploy automaticamente
- Acompanhe em **Deployments**
- Quando o status estiver **Success** (verde), teste: `https://SUA-URL-RAILWAY.up.railway.app/health`
- Deve retornar algo como: `{"status":"healthy","version":"0.1.0",...}`

---

### Passo a passo — Vercel (conectar ao serviço AI)

#### 1. Acessar o Vercel

- Abra [vercel.com](https://vercel.com)
- Faça login e selecione o projeto do app (ex: `arauz-tech` ou `tech-arauz`)

#### 2. Abrir variáveis de ambiente

- Clique no nome do projeto
- Vá em **Settings** (no topo)
- No menu lateral, clique em **Environment Variables**

#### 3. Adicionar AI_SERVICE_URL

- Clique em **Add New** (ou **Add**)
- **Key (Name):** `AI_SERVICE_URL`
- **Value:** `https://SUA-URL-RAILWAY.up.railway.app` (a URL que você copiou do Railway)
  - Use `https://` e **sem** barra no final
  - Exemplo: `https://tech-arauz-production.up.railway.app`
- **Environment:** marque **Production** (e **Preview** se quiser que funcione em deploys de preview)
- Clique em **Save**

#### 4. Fazer redeploy

- A variável só vale para **novos** deploys
- Vá em **Deployments**
- No último deploy, clique nos **três pontinhos** (⋮)
- Selecione **Redeploy**
- Confirme **Redeploy**

#### 5. Testar

- Após o redeploy terminar, acesse seu app em produção
- Abra o atalho do chat ou a página de agentes
- O erro 503 deve ter sumido e o chat deve funcionar

---

## Checklist rápido — Produção

- [ ] **Railway:** Login → New Project → Deploy from GitHub → escolher repo
- [ ] **Railway:** Root Directory = `services/ai`
- [ ] **Railway:** Start Command = `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- [ ] **Railway:** Variables = SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_JWT_SECRET, OPENAI_API_KEY, CORS_ORIGINS
- [ ] **Railway:** Generate Domain → copiar URL
- [ ] **Vercel:** Settings → Environment Variables → Add `AI_SERVICE_URL` = URL do Railway
- [ ] **Vercel:** Redeploy do projeto
- [ ] **Teste:** Acessar `/health` na URL do Railway e testar o chat no app

---

## Resumo rápido

| Ambiente | AI_SERVICE_URL | Onde configurar |
|----------|----------------|-----------------|
| Local | `http://localhost:8000` | `.env` na raiz |
| Produção | `https://sua-url-railway.up.railway.app` | Vercel → Settings → Environment Variables |

---

## Troubleshooting

### Erro 503 ao abrir o chat

- **Local:** O serviço AI está rodando? (`uvicorn` na porta 8000)
- **Produção:** `AI_SERVICE_URL` está configurada no Vercel? O Railway está online?

### CORS / bloqueio de requisição

- **Produção:** Configure `CORS_ORIGINS` no Railway com o domínio exato do app (ex: `https://arauz-tech.vercel.app`)

### `pip install -e ".[dev]"` falha

- Verifique se o `pyproject.toml` tem `[tool.hatch.build.targets.wheel]` com `packages = ["app"]`
