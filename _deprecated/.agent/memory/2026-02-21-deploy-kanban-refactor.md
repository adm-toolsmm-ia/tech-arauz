# Deploy: Refatoração Kanban (2026-02-21)

## Status

- **Branch:** `main`
- **Commits locais à frente da origin:** 2
  1. `0139f4c` refactor(kanban): rebuild for UX 10/10
  2. `d8881e6` docs: add Kanban refactor summary and quick reference

## Como fazer o deploy

O deploy de produção é acionado ao enviar a branch `main` para o GitHub. O Vercel faz o build e publica automaticamente após o push.

### Opção 1: Push manual (você executa)

No terminal, na raiz do projeto:

```bash
git push origin main
```

### Opção 2: Delegar ao @devops

Conforme `.cursor/rules/agent-authority.mdc`, **git push** é de responsabilidade exclusiva do agente **@devops**. Você pode solicitar:

- “@devops faça o push da main para publicar o refactor do Kanban”  
- ou “@devops *push”

### Após o push

1. **GitHub Actions** roda o CI (lint, format, test, build) na `main`.
2. **Vercel** (se o projeto estiver vinculado) inicia o deploy de produção.
3. Acompanhe em:
   - GitHub → Aba **Actions**
   - Vercel → Dashboard do projeto

## Pré-requisitos

- Repositório vinculado à Vercel (`vercel link` já executado).
- Variáveis de ambiente de produção configuradas no Vercel (Supabase, etc.).

## Referência

- Fluxo completo: [.agent/workflows/deploy.md](../../.agent/workflows/deploy.md)
- CI: [.github/workflows/ci.yml](../../.github/workflows/ci.yml)
